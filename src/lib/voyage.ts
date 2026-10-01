import type { Chunk, EmotionKey } from "@/lib/types";

/**
 * Shared data for the Voyage template — used by both the in-app preview
 * (VoyageTemplate.tsx) and the published static site (renderVoyage in
 * publish/staticSite.ts), so the two can't drift apart. Pure functions only.
 */

export type VoyagePaletteId = "ember" | "glacier" | "meadow";
export type VoyageMood = "calm" | "tense" | "bright";

export const VOYAGE_ASSET_ROOT = "/themes/voyage";

/** Inner SVG of the music toggle's note glyph; the slash shows while music is off. */
export const VOYAGE_MUSIC_ICON = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M6 2.2v8.1a2.4 2.4 0 1 0 1.6 2.2V5.6l5-1.1v4.4a2.4 2.4 0 1 0 1.6 2.2V2.2z"/><path class="slash" d="M1.5 1.5l13 13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
const asset = (file: string) => `${VOYAGE_ASSET_ROOT}/${file}`;

/** One parallax image in the sky stack. `depth` is the mouse-parallax factor. */
export interface VoyageSkyLayer {
  src: string;
  depth?: number;
  opacity: number;
  rotate180?: boolean;
}

/** One floating piece of art on a chunk page, scrubbed by scroll position. */
export interface VoyageArtLayer {
  key: "planet" | "prop" | "floor";
  src: string;
  /** Movement at 100% page progress: y/x in % of the element, rotate in deg. */
  scrub: { y: number; x?: number; rotate?: number; zoom?: number };
}

export interface VoyagePalette {
  id: VoyagePaletteId;
  /** Sky gradient stops, top to bottom. */
  gradient: [string, string, string];
  accent: string;
  overlay: string;
  sky: VoyageSkyLayer[];
  art: VoyageArtLayer[];
  wheelPlanet: string;
}

const STARS = asset("stars.svg");

function sky(id: VoyagePaletteId): VoyageSkyLayer[] {
  return [
    { src: STARS, depth: 0.3, opacity: 0.85 },
    { src: STARS, opacity: 0.45, rotate180: true },
    { src: asset(`${id}-cloud-far.svg`), depth: 0.3, opacity: 0.6 },
    { src: asset(`${id}-cloud-mid.svg`), depth: 0.6, opacity: 0.8 },
    { src: asset(`${id}-cloud-near.svg`), depth: 0.9, opacity: 1 },
  ];
}

function art(id: VoyagePaletteId, planetY: number): VoyageArtLayer[] {
  return [
    { key: "planet", src: asset(`${id}-planet-back.svg`), scrub: { y: planetY } },
    { key: "prop", src: asset(`${id}-prop.svg`), scrub: { y: -10, rotate: 6 } },
    { key: "floor", src: asset(`${id}-planet-floor.svg`), scrub: { y: -8 } },
  ];
}

export const VOYAGE_PALETTES: VoyagePalette[] = [
  {
    id: "ember",
    gradient: ["#5A2043", "#77204B", "#A83271"],
    accent: "#F28C51",
    overlay: "rgba(20,0,20,0.4)",
    sky: sky("ember"),
    art: art("ember", -5),
    wheelPlanet: asset("ember-planet-wheel.svg"),
  },
  {
    id: "glacier",
    gradient: ["#162145", "#0B4772", "#016797"],
    accent: "#83EFFF",
    overlay: "rgba(0,0,30,0.5)",
    sky: sky("glacier"),
    art: art("glacier", -50),
    wheelPlanet: asset("glacier-planet-wheel.svg"),
  },
  {
    id: "meadow",
    gradient: ["#246458", "#2F6C5B", "#82AD71"],
    accent: "#A7DB8D",
    overlay: "rgba(0,30,20,0.5)",
    sky: sky("meadow"),
    art: art("meadow", -30),
    wheelPlanet: asset("meadow-planet-wheel.svg"),
  },
];

/** Every public file the published site must ship for this template. */
export function voyageAssetPaths(): string[] {
  const paths = new Set<string>([STARS, asset("rocks.svg")]);
  for (const palette of VOYAGE_PALETTES) {
    palette.sky.forEach((layer) => paths.add(layer.src));
    palette.art.forEach((layer) => paths.add(layer.src));
    paths.add(palette.wheelPlanet);
  }
  return Array.from(paths);
}

const MOOD_BY_EMOTION: Record<EmotionKey, VoyageMood> = {
  neutral: "calm",
  thinking: "calm",
  confused: "tense",
  idea: "bright",
  solution: "bright",
  happy: "bright",
};

export function voyageMood(emotion: EmotionKey | undefined): VoyageMood {
  return MOOD_BY_EMOTION[emotion ?? "neutral"];
}

export interface VoyageDestination {
  index: number;
  palette: VoyagePalette;
  /** Extra hue rotation (deg) so chunk 4 doesn't look identical to chunk 1. */
  hueShift: number;
  /** Planet-wheel angle (deg) for this chunk in the chapter select. */
  wheelAngle: number;
  chapterLabel: string;
  giantTitle: string;
  fullTitle: string;
  duration: string;
  mood: VoyageMood;
  /** The chunk's most important sentence, shown large on the key-point card. */
  pullQuote: string;
  /** Two or three supporting sentences, not repeating the pull-quote. */
  bullets: string[];
}

const GIANT_TITLE_MAX_WORDS = 4;
const GIANT_TITLE_MAX_CHARS = 18;
const BULLET_MAX_CHARS = 110;
const QUOTE_MIN_CHARS = 30;
const QUOTE_MAX_CHARS = 170;
const QUOTE_EMPHASIS =
  /\b(key|important|essential|critical|main|must|need|needs|means|because|therefore|ultimately|goal|result|only|never|always|most)\b/i;
const SPEECH_WORDS_PER_SECOND = 2.5;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Short form of a chunk heading for the giant scrolling title: at most four
 *  words and 18 characters, cut at a word boundary (the first word is always
 *  kept, however long). The full heading still appears in the text card. */
export function voyageGiantTitle(title: string, index: number): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return `Chapter ${index + 1}`;
  const kept: string[] = [];
  for (const word of words) {
    if (kept.length >= GIANT_TITLE_MAX_WORDS) break;
    if (kept.length > 0 && [...kept, word].join(" ").length > GIANT_TITLE_MAX_CHARS) break;
    kept.push(word);
  }
  return kept.join(" ");
}

/** CSS font-size for the giant hero title: 12vw for short titles, stepping
 *  down so the longest word still fits on one line (Unbounded is wide, about
 *  0.8em per uppercase letter). */
export function voyageTitleFontSize(title: string): string {
  const longest = Math.max(1, ...title.split(/\s+/).map((word) => word.length));
  const vw = Math.min(12, 92 / (longest * 0.8));
  return `min(${vw.toFixed(2)}vw, 11rem)`;
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(1, Math.round(totalSeconds));
  return `${Math.floor(seconds / 60)}:${pad2(seconds % 60)}`;
}

function clipAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.5 ? lastSpace : max).replace(/[,;:\s]+$/, "")}…`;
}

function sentencesOf(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20);
}

/** The single most important sentence of a chunk, for the pull-quote. Scored
 *  on cheap cues: a readable length, sitting first (the topic sentence) or last
 *  (the conclusion), emphasis words and figures; the earliest sentence wins a tie. */
export function voyagePullQuote(text: string): string {
  const sentences = sentencesOf(text);
  if (sentences.length === 0) return clipAtWord(text.replace(/\s+/g, " ").trim(), QUOTE_MAX_CHARS);
  let best = 0;
  let bestScore = -Infinity;
  sentences.forEach((sentence, i) => {
    const len = sentence.length;
    let score = 0;
    if (len >= QUOTE_MIN_CHARS && len <= QUOTE_MAX_CHARS) score += 3;
    else score -= Math.min(3, Math.abs(len - (len < QUOTE_MIN_CHARS ? QUOTE_MIN_CHARS : QUOTE_MAX_CHARS)) / 40);
    if (i === 0) score += 2;
    else if (i === sentences.length - 1) score += 1;
    if (QUOTE_EMPHASIS.test(sentence)) score += 2;
    if (/\d/.test(sentence)) score += 1;
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  });
  return clipAtWord(sentences[best], QUOTE_MAX_CHARS);
}

/** Up to three short sentences from the narration, spread across the text
 *  (first, middle, last) so the card gives a feel for the whole chunk. Pass the
 *  pull-quote as `exclude` so it isn't repeated as a bullet. */
export function voyageBullets(text: string, exclude?: string): string[] {
  const sentences = sentencesOf(text).filter((s) => !exclude || clipAtWord(s, QUOTE_MAX_CHARS) !== exclude);
  if (sentences.length === 0) return [];
  const picked =
    sentences.length <= 3
      ? sentences
      : [sentences[0], sentences[Math.floor(sentences.length / 2)], sentences[sentences.length - 1]];
  return picked.map((s) => clipAtWord(s, BULLET_MAX_CHARS));
}

export function destinationFor(chunk: Chunk, index: number, total: number): VoyageDestination {
  const wordCount = chunk.narrativeText.trim().split(/\s+/).filter(Boolean).length;
  const pullQuote = voyagePullQuote(chunk.narrativeText);
  return {
    index,
    palette: VOYAGE_PALETTES[index % VOYAGE_PALETTES.length],
    hueShift: Math.floor(index / VOYAGE_PALETTES.length) * 12,
    wheelAngle: index * (360 / Math.max(1, total)),
    chapterLabel: `${pad2(index + 1)} / ${pad2(total)}`,
    giantTitle: voyageGiantTitle(chunk.title, index),
    fullTitle: chunk.title,
    duration: formatDuration(chunk.audioDurationSec ?? wordCount / SPEECH_WORDS_PER_SECOND),
    mood: voyageMood(chunk.emotion),
    pullQuote,
    bullets: voyageBullets(chunk.narrativeText, pullQuote),
  };
}

/** Indices that should be mounted for the active chunk: itself and its
 *  neighbours (wrapping), so any story length keeps at most three sky stacks
 *  and planets in the DOM. */
export function mountedIndices(active: number, total: number): number[] {
  if (total <= 3) return Array.from({ length: total }, (_, i) => i);
  return [(active + total - 1) % total, active, (active + 1) % total];
}
