import type { Chunk, EmotionKey } from "@/lib/types";
import { avatarVideoFallbackUrl, getAvatarImage, type Avatar } from "@/lib/avatars";

/**
 * Shared data for the Showcase template. One pure view-model builder feeds both
 * render paths: the in-app preview (templates/ShowcaseTemplate.tsx) and the
 * published static site (publish/showcaseSite.ts embeds the result as JSON for
 * the prebuilt browser script). Pure functions only, so it is safe to import
 * from client and server code.
 *
 * Mapping: one tile per chunk (chapter). Tile caption = chapter title, tags =
 * "Chapter 01" plus a one-word mood, hue = derived from the index. The page of a
 * chapter shows the narration text and a strip of media (the avatar's video or
 * emotion images plus generated abstract art).
 */

export const SHOWCASE_ASSET_ROOT = "/themes/showcase";

const asset = (file: string) => `${SHOWCASE_ASSET_ROOT}/${file}`;

export const SHOWCASE_SOUNDS = ["click", "focus", "glass", "hover", "page"] as const;
export type ShowcaseSound = (typeof SHOWCASE_SOUNDS)[number];

/** Every public file the published site must ship for this template. */
export function showcaseAssetPaths(): string[] {
  return [
    asset("showcase.js"),
    asset("showcase.css"),
    asset("fonts/hanken-grotesk-latin.woff2"),
    asset("fonts/ibm-plex-mono-400-latin.woff2"),
    asset("fonts/ibm-plex-mono-500-latin.woff2"),
    asset("fonts/FONTS-LICENSE.txt"),
    ...SHOWCASE_SOUNDS.map((name) => asset(`audio/${name}.ogg`)),
    asset("audio/LICENSE-kenney-interface-sounds.txt"),
  ];
}

// ---------------------------------------------------------------------------
// View model
// ---------------------------------------------------------------------------

export interface ShowcaseTheme {
  bg: string;
  text: string;
  highlight: string;
  btnBg: string;
  btnText: string;
}

/**
 * One picture of a chapter's media strip. `image` is the real-picture slot: when
 * it is unset the item shows generated abstract art (hue + seed). `overlay` is a
 * transparent avatar picture drawn over the art; `videoSrc` plays muted on top
 * of it while on screen.
 */
export interface ShowcaseMediaItem {
  kind: "image" | "video";
  width: number;
  height: number;
  hue: number;
  seed: number;
  image?: string;
  overlay?: string;
  videoSrc?: string;
  videoFallback?: string;
  alt: string;
}

export interface ShowcaseChapter {
  index: number;
  /** Route segment: "chapter-3" (1-based). */
  slug: string;
  /** Hash route of the chapter page. */
  href: string;
  title: string;
  /** Tile / page tags, e.g. ["Chapter 01", "Inspired"]. */
  tags: string[];
  hue: number;
  theme: ShowcaseTheme;
  /** The narration text, split into display paragraphs. */
  paragraphs: string[];
  /** A short summary (the first couple of sentences). */
  summary: string;
  audioUrl?: string;
  /** SCENE IMAGE SLOT: set this to a picture URL to replace the generated art
   *  for this chapter's tile, page and (first chapter) reel card. Nothing sets it
   *  yet; generated scene images can be dropped in here later. */
  imageUrl?: string;
  /** The avatar's emotion image for this chapter (transparent PNG). */
  avatarImage?: string;
  avatarVideo?: string;
  avatarVideoFallback?: string;
  items: ShowcaseMediaItem[];
}

export interface ShowcaseStory {
  title: string;
  chapters: ShowcaseChapter[];
  /** At least one chapter has narration audio. */
  narrated: boolean;
  /** Where the UI sounds live: "/themes/showcase" in the app, relative when published. */
  assetBase: string;
}

const MOOD_LABEL: Record<EmotionKey, string> = {
  neutral: "Calm",
  thinking: "Thoughtful",
  confused: "Uncertain",
  idea: "Inspired",
  solution: "Resolved",
  happy: "Upbeat",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Deterministic hue (0-359) for a chapter; neighbours land far apart. */
export function showcaseHue(index: number): number {
  return Math.round((232 + index * 137.508) % 360);
}

export function showcaseTheme(hue: number): ShowcaseTheme {
  return {
    bg: `hsl(${hue} 32% 8%)`,
    text: `hsl(${hue} 40% 92%)`,
    highlight: `hsl(${hue} 85% 62%)`,
    btnBg: `hsl(${hue} 60% 90%)`,
    btnText: `hsl(${hue} 40% 14%)`,
  };
}

/** Hash route for a chapter (0-based index). */
export function chapterHref(index: number): string {
  return `#/chapter-${index + 1}`;
}

/** Parses a location hash: a chapter index, or null for the home page. */
export function parseShowcaseHash(hash: string, total: number): number | null {
  const match = /^#\/chapter-(\d+)\/?$/.exec(hash);
  if (!match) return null;
  const index = Number(match[1]) - 1;
  return index >= 0 && index < total ? index : null;
}

function sentencesOf(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

function clipAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.5 ? lastSpace : max).replace(/[,;:\s]+$/, "")}…`;
}

/** The first couple of sentences, at most ~220 characters. */
export function showcaseSummary(text: string): string {
  const sentences = sentencesOf(text);
  if (sentences.length === 0) return "";
  let out = sentences[0];
  if (sentences.length > 1 && (out + " " + sentences[1]).length <= 220) out += ` ${sentences[1]}`;
  return clipAtWord(out, 220);
}

/** Display paragraphs: blank-line separated blocks, long blocks cut every ~3 sentences. */
export function showcaseParagraphs(text: string): string[] {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const block of blocks) {
    if (block.length <= 560) {
      out.push(block);
      continue;
    }
    const sentences = sentencesOf(block);
    let current = "";
    let count = 0;
    for (const sentence of sentences) {
      if (current && (count >= 3 || (current + " " + sentence).length > 560)) {
        out.push(current);
        current = "";
        count = 0;
      }
      current = current ? `${current} ${sentence}` : sentence;
      count += 1;
    }
    if (current) out.push(current);
  }
  return out.length > 0 ? out : [text.trim()];
}

export interface BuildShowcaseOptions {
  title: string;
  chunks: Chunk[];
  avatars: Avatar[];
  /** Resolves a chunk's narration URL (the published site points at Supabase). */
  audioUrl?: (chunk: Chunk) => string | undefined;
  /** Maps a public path ("/avatars/x.png") to the URL the page should use. */
  assetUrl?: (publicPath: string) => string;
  assetBase?: string;
}

export function buildShowcaseStory(options: BuildShowcaseOptions): ShowcaseStory {
  const { title, chunks, avatars } = options;
  const url = options.assetUrl ?? ((path: string) => path);
  const audioOf = options.audioUrl ?? ((chunk: Chunk) => chunk.audioUrl || undefined);

  const chapters = chunks.map<ShowcaseChapter>((chunk, index) => {
    const hue = showcaseHue(index);
    const avatar = avatars.length > 0 ? avatars[index % avatars.length] : undefined;
    const emotion = chunk.emotion;
    const label = MOOD_LABEL[emotion ?? "neutral"];
    const tags = [`Chapter ${pad2(index + 1)}`, label];

    const emotionKeys = avatar ? (Object.keys(avatar.emotions) as EmotionKey[]) : [];
    // A second, different pose for the later strip items (cycles with the chapter).
    const altEmotion = emotionKeys.length > 0 ? emotionKeys[(index + 1) % emotionKeys.length] : undefined;
    const poseImage = avatar ? url(getAvatarImage(avatar, emotion)) : undefined;
    const altImage = avatar ? url(getAvatarImage(avatar, altEmotion)) : undefined;

    const videos = avatar?.videoUrls ?? [];
    const videoPath = videos.length > 0 ? videos[index % videos.length] : undefined;
    const fallbackPath = videoPath ? avatarVideoFallbackUrl(videoPath) : undefined;

    const alt = (n: number) => `${chunk.title} picture ${n}`;
    const items: ShowcaseMediaItem[] = [
      // The first item keeps the tile's aspect ratio: the tile morphs into it.
      { kind: "image", width: 1600, height: 1040, hue, seed: index * 7 + 1, alt: alt(1) },
    ];
    if (poseImage) {
      items.push({ kind: "image", width: 1080, height: 1350, hue: (hue + 28) % 360, seed: index * 7 + 2, overlay: poseImage, alt: alt(2) });
    } else {
      items.push({ kind: "image", width: 1080, height: 1350, hue: (hue + 28) % 360, seed: index * 7 + 2, alt: alt(2) });
    }
    items.push({
      kind: videoPath ? "video" : "image",
      width: 1600,
      height: 900,
      hue: (hue + 332) % 360,
      seed: index * 7 + 3,
      ...(videoPath ? { videoSrc: url(videoPath), ...(fallbackPath ? { videoFallback: url(fallbackPath) } : {}) } : altImage ? { overlay: altImage } : {}),
      alt: alt(3),
    });
    items.push({ kind: "image", width: 1080, height: 1440, hue: (hue + 60) % 360, seed: index * 7 + 4, alt: alt(4) });
    items.push({
      kind: "image",
      width: 1600,
      height: 900,
      hue: (hue + 300) % 360,
      seed: index * 7 + 5,
      ...(altImage ? { overlay: altImage } : {}),
      alt: alt(5),
    });
    items.push({ kind: "image", width: 2000, height: 1000, hue: (hue + 90) % 360, seed: index * 7 + 6, alt: alt(6) });

    return {
      index,
      slug: `chapter-${index + 1}`,
      href: chapterHref(index),
      title: chunk.title,
      tags,
      hue,
      theme: showcaseTheme(hue),
      paragraphs: showcaseParagraphs(chunk.narrativeText),
      summary: showcaseSummary(chunk.narrativeText),
      audioUrl: audioOf(chunk),
      avatarImage: poseImage,
      avatarVideo: videoPath ? url(videoPath) : undefined,
      avatarVideoFallback: fallbackPath ? url(fallbackPath) : undefined,
      items,
    };
  });

  return {
    title,
    chapters,
    narrated: chapters.some((chapter) => Boolean(chapter.audioUrl)),
    assetBase: options.assetBase ?? SHOWCASE_ASSET_ROOT,
  };
}

// ---------------------------------------------------------------------------
// Generated abstract art
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const artCache = new Map<string, string>();

/**
 * Original abstract picture for a hue: a deep gradient, soft glowing blobs, thin
 * rings and a sprinkle of "+" marks, all derived from the hue and a seed, so
 * the same chapter always gets the same picture. Returned as an SVG data URI
 * (works in <img>, CSS and canvas).
 */
export function showcaseArt(hue: number, seed: number, width = 1600, height = 1040): string {
  const key = `${hue}|${seed}|${width}|${height}`;
  const cached = artCache.get(key);
  if (cached) return cached;

  const rnd = mulberry32(Math.round(hue * 1000) + seed * 7919);
  const w = width;
  const h = height;
  const short = Math.min(w, h);
  const h2 = (hue + 38) % 360;
  const h3 = (hue + 330) % 360;
  const parts: string[] = [];

  parts.push(
    `<defs>` +
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 55% 14%)"/><stop offset="0.55" stop-color="hsl(${hue} 60% 26%)"/><stop offset="1" stop-color="hsl(${h2} 65% 38%)"/></linearGradient>` +
      `<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(short * 0.07)}"/></filter>` +
      `</defs>`,
  );
  parts.push(`<rect width="${w}" height="${h}" fill="url(#g)"/>`);

  // glowing blobs
  parts.push(`<g filter="url(#b)">`);
  const blobCount = 5;
  for (let i = 0; i < blobCount; i++) {
    const cx = Math.round(w * (0.1 + rnd() * 0.8));
    const cy = Math.round(h * (0.1 + rnd() * 0.8));
    const r = Math.round(short * (0.16 + rnd() * 0.24));
    const bh = i % 3 === 0 ? h3 : i % 3 === 1 ? h2 : hue;
    const light = 52 + Math.round(rnd() * 22);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(${bh} 90% ${light}%)" opacity="${(0.4 + rnd() * 0.35).toFixed(2)}"/>`);
  }
  parts.push(`</g>`);

  // thin rings
  const ringCx = Math.round(w * (0.3 + rnd() * 0.4));
  const ringCy = Math.round(h * (0.3 + rnd() * 0.4));
  for (let i = 1; i <= 4; i++) {
    const r = Math.round(short * (0.1 + i * 0.1 + rnd() * 0.03));
    parts.push(`<circle cx="${ringCx}" cy="${ringCy}" r="${r}" fill="none" stroke="hsl(${hue} 100% 92%)" stroke-opacity="${(0.34 - i * 0.06).toFixed(2)}" stroke-width="${Math.max(2, Math.round(short * 0.003))}"/>`);
  }

  // a soft diagonal band
  const bandY = Math.round(h * (0.2 + rnd() * 0.6));
  parts.push(`<path d="M0 ${bandY} L${w} ${Math.round(bandY - h * 0.35)} L${w} ${Math.round(bandY - h * 0.2)} L0 ${Math.round(bandY + h * 0.15)} Z" fill="hsl(${h3} 100% 90%)" opacity="0.08"/>`);

  // "+" marks on a loose grid
  const step = Math.round(short / 6);
  const arm = Math.max(7, Math.round(short * 0.012));
  const sw = Math.max(2, Math.round(short * 0.0025));
  const marks: string[] = [];
  for (let gx = step / 2; gx < w; gx += step) {
    for (let gy = step / 2; gy < h; gy += step) {
      if (rnd() > 0.34) continue;
      const x = Math.round(gx);
      const y = Math.round(gy);
      marks.push(`M${x - arm} ${y}H${x + arm}M${x} ${y - arm}V${y + arm}`);
    }
  }
  parts.push(`<path d="${marks.join("")}" fill="none" stroke="hsl(${hue} 100% 96%)" stroke-opacity="0.5" stroke-width="${sw}" stroke-linecap="round"/>`);

  // vignette for depth
  parts.push(`<rect width="${w}" height="${h}" fill="hsl(${hue} 60% 6%)" opacity="0.18"/>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${parts.join("")}</svg>`;
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  artCache.set(key, uri);
  return uri;
}

/** The picture an item shows: the real-picture slot when set, else generated art. */
export function mediaItemPicture(item: ShowcaseMediaItem): string {
  return item.image ?? showcaseArt(item.hue, item.seed, item.width, item.height);
}

/** The tile / reel picture of a chapter (1600 x 1040). */
export function chapterPicture(chapter: ShowcaseChapter): string {
  return chapter.imageUrl ?? showcaseArt(chapter.hue, chapter.index * 7 + 1, 1600, 1040);
}
