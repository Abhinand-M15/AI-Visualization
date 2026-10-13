/**
 * Contact-sheet cropping. One generated image holds a 2x2 grid of four 16:9 panels separated
 * by pure-white gutters; this finds the gutters and returns four separate 16:9 JPEGs in
 * reading order (top-left, top-right, bottom-left, bottom-right).
 *
 * Detection looks at the middle of the sheet only: the vertical gutter is the whitest column
 * and the horizontal gutter the whitest row (mean of the per-pixel minimum of R, G, B, so
 * coloured pixels score low), then each is expanded while the line stays near-white. When no
 * clear gutter exists the sheet is cut into exact halves with an inset. `sharp` is imported
 * dynamically (like cloudflare.ts) so importing this module is cheap.
 */

export const PANEL_WIDTH = 960;
export const PANEL_HEIGHT = 540;
export const PANEL_JPEG_QUALITY = 86;

/** The middle band (fraction of the side, centred) searched for a gutter. */
const SEARCH_BAND = 0.2;
/** A gutter line must score at least this (0-255 whiteness) ... */
const MIN_PEAK = 205;
/** ... and beat the median of the search band by this much. */
const MIN_CONTRAST = 20;
/** Fraction of pixels along the peak line that must themselves be near-white. */
const MIN_WHITE_FRACTION = 0.85;
/** Expansion stops this far below the peak (and never below MIN_EDGE). */
const EXPAND_DROP = 22;
const MIN_EDGE = 195;
/** A real gutter is thin: a wider "white" band is a white wall, not a gutter. */
const MAX_GUTTER_FRACTION = 0.08;
/** Safety inset taken from every side of a detected panel. */
const DETECTED_INSET = 0.008;
/** Inset taken from every side of a half in the fixed-geometry fallback. */
const FALLBACK_INSET = 0.015;

export interface CroppedPanel {
  mimeType: "image/jpeg";
  data: Buffer;
}

export interface GutterInfo {
  /** First and last (exclusive) pixel of the gutter; null when none was found. */
  found: { start: number; end: number } | null;
  peak: number;
}

export interface SheetCropResult {
  /** Four entries in reading order; null where that panel's encode failed (see errors). */
  panels: (CroppedPanel | null)[];
  errors: (string | null)[];
  /** "high": both gutters found. "low": at least one was missing and fixed geometry was used for it. */
  confidence: "high" | "low";
  vertical: GutterInfo;
  horizontal: GutterInfo;
  sheet: { width: number; height: number };
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

type Sharp = (typeof import("sharp"))["default"];

async function loadSharp(): Promise<Sharp> {
  return (await import("sharp")).default;
}

/** Per-line scores over the search band: mean min-RGB and the fraction of near-white pixels. */
function lineScores(
  raw: Buffer,
  width: number,
  height: number,
  channels: number,
  axis: "column" | "row",
  from: number,
  to: number
): { mean: number[]; white: number[] } {
  const mean: number[] = [];
  const white: number[] = [];
  const along = axis === "column" ? height : width;
  for (let line = from; line < to; line++) {
    let sum = 0;
    let whiteCount = 0;
    for (let k = 0; k < along; k++) {
      const x = axis === "column" ? line : k;
      const y = axis === "column" ? k : line;
      const i = (y * width + x) * channels;
      const m = Math.min(raw[i], raw[i + 1], raw[i + 2]);
      sum += m;
      if (m >= MIN_EDGE) whiteCount++;
    }
    mean.push(sum / along);
    white.push(whiteCount / along);
  }
  return { mean, white };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/**
 * Finds one gutter along an axis. `size` is the sheet's extent on that axis; the band searched is
 * its middle SEARCH_BAND. Expansion beyond the band is allowed (a gutter shifted to the edge of the
 * band can extend past it), but never beyond MAX_GUTTER_FRACTION.
 */
function detectGutter(raw: Buffer, width: number, height: number, channels: number, axis: "column" | "row"): GutterInfo {
  const size = axis === "column" ? width : height;
  const from = Math.max(0, Math.floor(size * (0.5 - SEARCH_BAND / 2)));
  const to = Math.min(size, Math.ceil(size * (0.5 + SEARCH_BAND / 2)));
  const { mean, white } = lineScores(raw, width, height, channels, axis, from, to);
  let best = 0;
  for (let i = 1; i < mean.length; i++) if (mean[i] > mean[best]) best = i;
  const peak = mean[best] ?? 0;
  if (peak < MIN_PEAK || peak - median(mean) < MIN_CONTRAST || (white[best] ?? 0) < MIN_WHITE_FRACTION) {
    return { found: null, peak };
  }
  const threshold = Math.max(MIN_EDGE, peak - EXPAND_DROP);
  const maxWidth = Math.max(2, Math.round(size * MAX_GUTTER_FRACTION));
  // Scores outside the searched band are computed on demand while expanding.
  const scoreAt = (line: number): number => {
    if (line < 0 || line >= size) return 0;
    if (line >= from && line < to) return mean[line - from];
    return lineScores(raw, width, height, channels, axis, line, line + 1).mean[0];
  };
  let start = from + best;
  let end = start + 1;
  while (end - start < maxWidth && scoreAt(start - 1) >= threshold) start--;
  while (end - start < maxWidth && scoreAt(end) >= threshold) end++;
  // A band much wider than a gutter is a white area, not a gutter.
  if (end - start >= maxWidth) return { found: null, peak };
  return { found: { start, end }, peak };
}

/** The part of [lo, hi) left after trimming `inset` pixels from both ends. */
function inner(lo: number, hi: number, inset: number): [number, number] {
  const a = Math.round(lo + inset);
  const b = Math.round(hi - inset);
  return b - a >= 8 ? [a, b] : [Math.round(lo), Math.round(hi)];
}

/** Largest centred 16:9 rectangle inside `rect`. */
function centreCrop169(rect: Rect): Rect {
  const target = 16 / 9;
  let width = rect.width;
  let height = rect.height;
  if (width / height > target) width = Math.floor(height * target);
  else height = Math.floor(width / target);
  return {
    left: rect.left + Math.floor((rect.width - width) / 2),
    top: rect.top + Math.floor((rect.height - height) / 2),
    width,
    height,
  };
}

/** The four panel rectangles in reading order for the detected (or fallback) gutters. Exported for tests. */
export function panelRects(
  sheet: { width: number; height: number },
  vertical: { start: number; end: number } | null,
  horizontal: { start: number; end: number } | null
): Rect[] {
  const { width, height } = sheet;
  // Missing gutter: exact halves with the larger fallback inset.
  const vInset = vertical ? null : width * FALLBACK_INSET;
  const hInset = horizontal ? null : height * FALLBACK_INSET;
  const xs: [number, number][] = vertical
    ? [
        [0, vertical.start],
        [vertical.end, width],
      ]
    : [
        [0, width / 2],
        [width / 2, width],
      ];
  const ys: [number, number][] = horizontal
    ? [
        [0, horizontal.start],
        [horizontal.end, height],
      ]
    : [
        [0, height / 2],
        [height / 2, height],
      ];
  const rects: Rect[] = [];
  for (const [y0, y1] of ys) {
    for (const [x0, x1] of xs) {
      const [left, right] = inner(x0, x1, vInset ?? (x1 - x0) * DETECTED_INSET);
      const [top, bottom] = inner(y0, y1, hInset ?? (y1 - y0) * DETECTED_INSET);
      rects.push(centreCrop169({ left, top, width: right - left, height: bottom - top }));
    }
  }
  return rects;
}

/**
 * Splits a generated contact sheet into four 960x540 JPEGs. Throws when the sheet cannot be
 * decoded at all; a panel that fails to encode comes back as null with its message in `errors`.
 */
export async function cropSheet(sheet: { data: Buffer }): Promise<SheetCropResult> {
  const sharp = await loadSharp();
  const { data: raw, info } = await sharp(sheet.data).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (width < 64 || height < 64) throw new Error(`The sheet image is too small to crop (${width}x${height}).`);

  const vertical = detectGutter(raw, width, height, channels, "column");
  const horizontal = detectGutter(raw, width, height, channels, "row");
  const rects = panelRects({ width, height }, vertical.found, horizontal.found);

  const panels: (CroppedPanel | null)[] = [];
  const errors: (string | null)[] = [];
  for (const rect of rects) {
    try {
      const data = await sharp(sheet.data)
        .removeAlpha()
        .extract(rect)
        .resize(PANEL_WIDTH, PANEL_HEIGHT, { fit: "fill" })
        .jpeg({ quality: PANEL_JPEG_QUALITY })
        .toBuffer();
      panels.push({ mimeType: "image/jpeg", data: Buffer.from(data) });
      errors.push(null);
    } catch (error) {
      panels.push(null);
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return {
    panels,
    errors,
    confidence: vertical.found && horizontal.found ? "high" : "low",
    vertical,
    horizontal,
    sheet: { width, height },
  };
}
