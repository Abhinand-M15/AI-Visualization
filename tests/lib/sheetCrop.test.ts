import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { PANEL_HEIGHT, PANEL_WIDTH, cropSheet, panelRects } from "@/lib/sheetCrop";

type RGB = [number, number, number];

const RED: RGB = [200, 30, 30];
const GREEN: RGB = [30, 160, 60];
const BLUE: RGB = [40, 60, 200];
const YELLOW: RGB = [210, 180, 20];

/**
 * A synthetic 2x2 contact sheet: four solid-colour panels separated by white gutters
 * (`gutter` px wide, centred). gutter = 0 draws no gutter at all.
 */
async function makeSheet(width: number, height: number, gutter: number, colours = [RED, GREEN, BLUE, YELLOW]) {
  const raw = Buffer.alloc(width * height * 3);
  const gx0 = Math.floor((width - gutter) / 2);
  const gy0 = Math.floor((height - gutter) / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inGutter = gutter > 0 && ((x >= gx0 && x < gx0 + gutter) || (y >= gy0 && y < gy0 + gutter));
      const quadrant = (y < height / 2 ? 0 : 2) + (x < width / 2 ? 0 : 1);
      const [r, g, b] = inGutter ? [255, 255, 255] : colours[quadrant];
      const i = (y * width + x) * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  return sharp(raw, { raw: { width, height, channels: 3 } }).png().toBuffer();
}

async function meanColour(jpeg: Buffer): Promise<RGB> {
  const { channels } = await sharp(jpeg).stats();
  return [channels[0].mean, channels[1].mean, channels[2].mean];
}

function near(actual: RGB, expected: RGB, tolerance = 12) {
  actual.forEach((value, i) => expect(Math.abs(value - expected[i])).toBeLessThan(tolerance));
}

describe("panelRects", () => {
  it("returns four 16:9 rectangles inside the sheet, in reading order", () => {
    const sheet = { width: 1920, height: 1080 };
    const rects = panelRects(sheet, { start: 950, end: 970 }, { start: 530, end: 550 });
    expect(rects).toHaveLength(4);
    for (const r of rects) {
      expect(r.left).toBeGreaterThanOrEqual(0);
      expect(r.top).toBeGreaterThanOrEqual(0);
      expect(r.left + r.width).toBeLessThanOrEqual(sheet.width);
      expect(r.top + r.height).toBeLessThanOrEqual(sheet.height);
      expect(Math.abs(r.width / r.height - 16 / 9)).toBeLessThan(0.02);
    }
    // Reading order: top-left, top-right, bottom-left, bottom-right; nothing overlaps the gutters.
    expect(rects[0].left + rects[0].width).toBeLessThanOrEqual(950);
    expect(rects[1].left).toBeGreaterThanOrEqual(970);
    expect(rects[0].top + rects[0].height).toBeLessThanOrEqual(530);
    expect(rects[2].top).toBeGreaterThanOrEqual(550);
  });

  it("falls back to exact halves when no gutter was found", () => {
    const rects = panelRects({ width: 1920, height: 1080 }, null, null);
    expect(rects).toHaveLength(4);
    expect(rects[0].left + rects[0].width).toBeLessThanOrEqual(960);
    expect(rects[3].left).toBeGreaterThanOrEqual(960);
    expect(rects[3].top).toBeGreaterThanOrEqual(540);
  });
});

describe("cropSheet", () => {
  it("finds both white gutters and crops four clean 960x540 panels", async () => {
    const data = await makeSheet(1920, 1080, 24);
    const result = await cropSheet({ data });

    expect(result.confidence).toBe("high");
    expect(result.vertical.found).not.toBeNull();
    expect(result.horizontal.found).not.toBeNull();
    expect(result.sheet).toEqual({ width: 1920, height: 1080 });
    expect(result.errors).toEqual([null, null, null, null]);

    const expected = [RED, GREEN, BLUE, YELLOW];
    for (const [i, panel] of result.panels.entries()) {
      expect(panel?.mimeType).toBe("image/jpeg");
      const meta = await sharp(panel!.data).metadata();
      expect([meta.width, meta.height]).toEqual([PANEL_WIDTH, PANEL_HEIGHT]);
      // A clean crop has no white gutter in it: the mean stays at the panel colour.
      near(await meanColour(panel!.data), expected[i]);
    }
  });

  it("finds an off-centre gutter", async () => {
    // Shift the gutter by drawing a wider left column of panels.
    const width = 1920;
    const height = 1080;
    const raw = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const white = (x >= 1000 && x < 1020) || (y >= 520 && y < 540);
        const quadrant = (y < 530 ? 0 : 2) + (x < 1010 ? 0 : 1);
        const [r, g, b] = white ? [255, 255, 255] : [RED, GREEN, BLUE, YELLOW][quadrant];
        const i = (y * width + x) * 3;
        raw[i] = r;
        raw[i + 1] = g;
        raw[i + 2] = b;
      }
    }
    const data = await sharp(raw, { raw: { width, height, channels: 3 } }).png().toBuffer();
    const result = await cropSheet({ data });
    expect(result.confidence).toBe("high");
    expect(result.vertical.found?.start).toBeGreaterThanOrEqual(995);
    expect(result.vertical.found?.end).toBeLessThanOrEqual(1025);
  });

  it("uses fixed geometry and reports low confidence when there is no gutter", async () => {
    const data = await makeSheet(1920, 1080, 0);
    const result = await cropSheet({ data });
    expect(result.confidence).toBe("low");
    expect(result.vertical.found).toBeNull();
    expect(result.horizontal.found).toBeNull();
    expect(result.panels.every((p) => p !== null)).toBe(true);
  });

  it("does not mistake a wide white area for a gutter", async () => {
    const white: RGB = [255, 255, 255];
    const data = await makeSheet(1920, 1080, 0, [white, white, white, white]);
    const result = await cropSheet({ data });
    expect(result.confidence).toBe("low");
  });

  it("rejects an image too small to crop and data that is not an image", async () => {
    const tiny = await makeSheet(32, 32, 2);
    await expect(cropSheet({ data: tiny })).rejects.toThrow(/too small/);
    await expect(cropSheet({ data: Buffer.from("not an image") })).rejects.toThrow();
  });
});
