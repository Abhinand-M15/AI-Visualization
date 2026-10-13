/**
 * "Lead character" scene images (Showcase template). Server-side helpers shared by
 * POST /api/projects/[id]/generate-scene-images in lead mode:
 *  - loading the fixed character reference (public/characters/lead.webp) and the company logo,
 *  - the per-chapter scene brief (text model) and its storage in chapter_images.prompt_used,
 *  - assembling the final image prompt from the stored prompts (nothing is hard-coded here:
 *    every prompt text comes from prompt_templates / domains).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { getSupabase } from "@/lib/db";
import { fillPrompt, getPrompt, type Domain } from "@/lib/domains";
import { DIRECTOR_MODEL_TIMEOUT_MS, geminiTextModels, SHEET_HEIGHT, SHEET_WIDTH } from "@/lib/imageGen/constants";
import type { ImageGenerator } from "@/lib/imageGen/types";
import { cropSheet, type SheetCropResult } from "@/lib/sheetCrop";
import { COMPANY_LOGOS_BUCKET } from "@/lib/storageUrls";
import type { Chunk } from "@/lib/types";

export const LEAD_CHARACTER_PATH = "characters/lead.webp";

export interface ReferenceBuffer {
  mimeType: string;
  data: Buffer;
}

export interface SceneBrief {
  scene: string;
  emotion: string;
}

/** Thrown for setup problems the panel should show as a clear JSON error. */
export class LeadSetupError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(message: string, code: string, status = 400) {
    super(message);
    this.name = "LeadSetupError";
    this.code = code;
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Reference images
// ---------------------------------------------------------------------------

let characterCache: ReferenceBuffer | null = null;

/** Where public assets are fetched from when not on disk (Vercel): APP_BASE_URL, else the request origin. */
export function assetBaseUrl(requestOrigin: string): string {
  return (process.env.APP_BASE_URL || requestOrigin).replace(/\/+$/, "");
}

/** Test hook. */
export function resetLeadCharacterCache(): void {
  characterCache = null;
}

/**
 * The fixed lead character image. Read from public/ on disk when present, else fetched from the
 * app's own origin (the publish route's approach); cached in memory for the life of the process.
 */
export async function loadCharacterReference(baseUrl: string): Promise<ReferenceBuffer> {
  if (characterCache) return characterCache;
  let data: Buffer;
  try {
    data = await readFile(path.join(process.cwd(), "public", LEAD_CHARACTER_PATH));
  } catch {
    let res: Response;
    try {
      res = await fetch(`${baseUrl}/${LEAD_CHARACTER_PATH}`, { cache: "no-store" });
    } catch (error) {
      throw new LeadSetupError(
        `The lead character image could not be loaded: ${error instanceof Error ? error.message : String(error)}.`,
        "character_unreadable",
        500
      );
    }
    if (!res.ok) {
      throw new LeadSetupError(
        `The lead character image is missing (not on disk, and ${res.status} from the app URL).`,
        "character_unreadable",
        500
      );
    }
    data = Buffer.from(await res.arrayBuffer());
  }
  characterCache = { mimeType: "image/webp", data };
  return characterCache;
}

const PROVIDER_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function logoMime(blobType: string, logoPath: string): string {
  const type = blobType.split(";")[0].trim().toLowerCase();
  if (type.startsWith("image/")) return type === "image/jpg" ? "image/jpeg" : type;
  const ext = logoPath.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "svg") return "image/svg+xml";
  return "image/png";
}

/**
 * The customer's logo from the company-logos bucket as a provider-friendly image, or null when
 * there is no logo, it cannot be read, or it is a format neither provider accepts (e.g. SVG)
 * and `sharp` (if installed) cannot convert it. Never throws: no logo just means no logo on the character.
 */
export async function loadLogoReference(logoPath: string | undefined): Promise<ReferenceBuffer | null> {
  if (!logoPath) return null;
  try {
    const { data: blob, error } = await getSupabase().storage.from(COMPANY_LOGOS_BUCKET).download(logoPath);
    if (error || !blob) return null;
    let data = Buffer.from(await blob.arrayBuffer());
    let mimeType = logoMime(blob.type ?? "", logoPath);
    if (!PROVIDER_IMAGE_TYPES.has(mimeType)) {
      try {
        const sharp = (await import("sharp")).default;
        data = Buffer.from(await sharp(data, { density: 300 }).png().toBuffer());
        mimeType = "image/png";
      } catch {
        return null;
      }
    }
    return { mimeType, data };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Scene brief storage: chapter_images.prompt_used
// ---------------------------------------------------------------------------

/**
 * The brief is stored as JSON text in chapter_images.prompt_used (no new column, no migration):
 *   {"v":1,"scene":"...","emotion":"...","prompt":"<final image prompt>"}
 * Regenerating one chapter reuses its neighbours' saved briefs (previous_scene), and a rerun
 * of the same chapter gets the same previous_scene, so the sequence stays coherent.
 */
export function encodeBrief(brief: SceneBrief, prompt: string, extra?: { sheet?: boolean }): string {
  return JSON.stringify({ v: 1, scene: brief.scene, emotion: brief.emotion, prompt, ...(extra?.sheet ? { sheet: true } : {}) });
}

/** Brief from a prompt_used value; null for avatar-mode rows (plain prompt text) or garbage. */
export function decodeBrief(promptUsed: string | null | undefined): SceneBrief | null {
  if (!promptUsed || !promptUsed.trim().startsWith("{")) return null;
  try {
    const parsed = JSON.parse(promptUsed) as { scene?: unknown; emotion?: unknown };
    if (typeof parsed.scene !== "string" || !parsed.scene.trim()) return null;
    return { scene: parsed.scene, emotion: typeof parsed.emotion === "string" ? parsed.emotion : "" };
  } catch {
    return null;
  }
}

/** The previous chapter's saved scene text for {{previous_scene}}; "" for the first chapter or when none is saved. */
export function previousSceneFor(
  chunks: Pick<Chunk, "id">[],
  index: number,
  rows: { chunk_id: string; prompt_used?: string | null }[]
): string {
  if (index <= 0) return "";
  const prev = chunks[index - 1];
  const row = prev ? rows.find((r) => r.chunk_id === prev.id) : undefined;
  return decodeBrief(row?.prompt_used)?.scene ?? "";
}

// ---------------------------------------------------------------------------
// Director reply parsing
// ---------------------------------------------------------------------------

/** Parses the director's {"scene","emotion"} reply; tolerates code fences and prose around the JSON. Throws when no scene can be found. */
export function parseDirectorReply(text: string): SceneBrief {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const candidates = [cleaned];
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) candidates.push(cleaned.slice(start, end + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as { scene?: unknown; emotion?: unknown };
      if (parsed && typeof parsed.scene === "string" && parsed.scene.trim()) {
        return { scene: parsed.scene.trim(), emotion: typeof parsed.emotion === "string" ? parsed.emotion.trim() : "" };
      }
    } catch {
      // try the next candidate
    }
  }
  throw new Error("The scene director did not return a usable scene.");
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

export interface LeadPrompts {
  characterRules: string;
  sceneDirector: string;
  sceneImage: string;
  /** Present only when it was needed (a logo exists and the domain has a placement). */
  logoInstruction: string | null;
  defaultOutfit: string | null;
}

/** Loads the stored prompts. Throws LeadSetupError('no_prompt') naming the first missing key. */
export async function loadLeadPrompts(opts: { needsLogoInstruction: boolean; needsDefaultOutfit: boolean }): Promise<LeadPrompts> {
  const required = async (key: string): Promise<string> => {
    const body = await getPrompt(key);
    if (!body) {
      throw new LeadSetupError(
        `The "${key}" prompt is not set up in the database, so lead scene images are unavailable.`,
        "no_prompt"
      );
    }
    return body;
  };
  const characterRules = await required("lead_character_rules");
  const sceneDirector = await required("scene_director");
  const sceneImage = await required("lead_scene_image");
  const logoInstruction = opts.needsLogoInstruction ? await required("lead_logo_instruction") : null;
  const defaultOutfit = opts.needsDefaultOutfit ? await getPrompt("lead_default_outfit") : null;
  return { characterRules, sceneDirector, sceneImage, logoInstruction, defaultOutfit };
}

export interface LeadContext {
  storyTitle: string;
  domain: Domain | null;
  prompts: LeadPrompts;
  /** True when the logo reference image is attached. */
  hasLogo: boolean;
  chapterTotal: number;
  /** domains.outfit_sheet (migration 005): the short outfit used inside the length-limited sheet prompt. */
  sheetOutfit?: string | null;
}

/** {{domain_name}} and {{outfit_description}} for the project's domain (no domain: the stored default outfit, else "keep the outfit from the reference image"). */
export function domainWording(ctx: Pick<LeadContext, "domain" | "prompts">): { domainName: string; outfit: string } {
  const outfit = ctx.domain?.outfitDescription?.trim();
  return {
    domainName: ctx.domain?.name ?? "",
    outfit: outfit || ctx.prompts.defaultOutfit?.trim() || "keep the outfit from the reference image",
  };
}

/** The filled scene_director prompt for one chapter. */
export function buildDirectorPrompt(ctx: LeadContext, chunk: Pick<Chunk, "title" | "narrativeText">, index: number, previousScene: string): string {
  const { domainName, outfit } = domainWording(ctx);
  return fillPrompt(ctx.prompts.sceneDirector, {
    story_title: ctx.storyTitle,
    domain_name: domainName,
    chapter_index: String(index + 1),
    chapter_total: String(ctx.chapterTotal),
    chapter_title: chunk.title,
    chapter_text: chunk.narrativeText,
    previous_scene: previousScene,
    outfit_description: outfit,
  });
}

/**
 * The logo instruction, or "" when there is no logo reference or the domain has no logo_placement
 * (in that case the logo is not sent either; see logoSendable).
 */
export function buildLogoInstruction(ctx: LeadContext): string {
  if (!logoSendable(ctx) || !ctx.prompts.logoInstruction) return "";
  return fillPrompt(ctx.prompts.logoInstruction, { logo_placement: ctx.domain!.logoPlacement.trim() });
}

/** The logo reference is only sent when the domain says where it goes. */
export function logoSendable(ctx: Pick<LeadContext, "hasLogo" | "domain">): boolean {
  return ctx.hasLogo && Boolean(ctx.domain?.logoPlacement?.trim());
}

/** The final image prompt: lead_scene_image with the rules, outfit, logo instruction and the director's scene. */
export function buildImagePrompt(ctx: LeadContext, brief: SceneBrief, index: number): string {
  const { domainName, outfit } = domainWording(ctx);
  return fillPrompt(ctx.prompts.sceneImage, {
    character_rules: ctx.prompts.characterRules,
    domain_name: domainName,
    outfit_description: outfit,
    logo_instruction: buildLogoInstruction(ctx),
    scene_brief: brief.scene,
    chapter_index: String(index + 1),
    chapter_total: String(ctx.chapterTotal),
  });
}

// ---------------------------------------------------------------------------
// Scene director (text model)
// ---------------------------------------------------------------------------

export type TextGenerate = (prompt: string) => Promise<string>;

/** Text generation with the user's Gemini key (env key when auth is off), cascading through the text models like generateStory. */
export function createGeminiTextGenerate(apiKey: string | undefined): TextGenerate {
  const key = apiKey ?? process.env.GEMINI_API_KEY;
  return async (prompt) => {
    if (!key) throw new Error("GEMINI_API_KEY is not set on the server, so the scene director cannot run.");
    const ai = new GoogleGenAI({ apiKey: key });
    let lastError: unknown;
    for (const model of geminiTextModels()) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            maxOutputTokens: 2048,
            abortSignal: AbortSignal.timeout(DIRECTOR_MODEL_TIMEOUT_MS),
          },
        });
        const text = response.text;
        if (!text) throw new Error("Empty response from Gemini");
        return text;
      } catch (error) {
        lastError = error;
      }
    }
    throw new Error(`Scene director failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  };
}

/** Runs the director for one chapter; one extra attempt when the reply cannot be parsed. */
export async function directScene(generate: TextGenerate, directorPrompt: string): Promise<SceneBrief> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return parseDirectorReply(await generate(directorPrompt));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}


/** Promise.race against a timer; the label names the step in the error. */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)} s.`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// ===========================================================================
// Contact-sheet mode: four chapters per image (docs/IMAGE_PROMPTS.md, section 3)
// ===========================================================================

/** Chapters drawn together on one sheet. */
export const SHEET_SIZE = 4;
/** The filled sheet prompt must stay under this many characters; FLUX.2 klein's text encoder ignores what comes later. */
export const SHEET_PROMPT_MAX_CHARS = 1900;
/** A panel scene is never trimmed below this many characters by the length guard. */
const MIN_PANEL_CHARS = 60;
/** Chapter text given to the sheet director is capped per chapter. */
const DIRECTOR_CHAPTER_TEXT_CHARS = 1500;

/** Splits targets (already in display order) into consecutive groups of `size`; the last group may be smaller. */
export function batchTargets<T>(targets: T[], size: number = SHEET_SIZE): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < targets.length; i += size) batches.push(targets.slice(i, i + size));
  return batches;
}

export interface SheetPrompts {
  rules: string;
  image: string;
  director: string;
  /** Only loaded when a logo is attached. */
  logo: string | null;
}

/**
 * The stored sheet prompts (migration 005), or null when one is missing (migration not applied):
 * the caller then keeps drawing one image per chapter.
 */
export async function loadSheetPrompts(opts: { needsLogo: boolean }): Promise<SheetPrompts | null> {
  const rules = await getPrompt("lead_sheet_rules");
  const image = await getPrompt("lead_sheet_image");
  const director = await getPrompt("lead_sheet_director");
  const logo = opts.needsLogo ? await getPrompt("lead_sheet_logo") : null;
  if (!rules || !image || !director || (opts.needsLogo && !logo)) return null;
  return { rules, image, director, logo };
}

/** domains.outfit_sheet for a domain; null when empty or the column does not exist yet. Never throws. */
export async function loadSheetOutfit(domainId: string | undefined): Promise<string | null> {
  if (!domainId) return null;
  try {
    const { data, error } = await getSupabase().from("domains").select("outfit_sheet").eq("id", domainId).maybeSingle();
    if (error || !data) return null;
    const value = (data as { outfit_sheet?: string | null }).outfit_sheet;
    return value && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

/** Cuts `text` to at most `max` characters at a sentence, clause or word boundary (ends with a full stop). */
export function truncateAtBoundary(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const floor = Math.floor(max * 0.6);
  const boundary = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "), cut.lastIndexOf(" "));
  const base = boundary >= floor ? cut.slice(0, boundary) : cut;
  return base.replace(/[\s,;:-]+$/, "").replace(/\.$/, "") + ".";
}

/** The outfit for the sheet: domains.outfit_sheet, else the full outfit cut at its first ";" and at about 220 characters. */
export function sheetOutfitFor(ctx: Pick<LeadContext, "domain" | "prompts" | "sheetOutfit">): string {
  const stored = ctx.sheetOutfit?.trim();
  if (stored) return stored;
  const full = domainWording(ctx).outfit;
  return truncateAtBoundary(full.split(";")[0], 220).replace(/\.$/, "");
}

export interface SheetChapter {
  chunk: Pick<Chunk, "title" | "narrativeText">;
  /** Zero-based position of the chapter in the whole story. */
  index: number;
}

/** The filled lead_sheet_director prompt for four chapters. */
export function buildSheetDirectorPrompt(ctx: LeadContext, sp: SheetPrompts, chapters: SheetChapter[], previousScene: string): string {
  const { domainName } = domainWording(ctx);
  const vars: Record<string, string> = {
    story_title: ctx.storyTitle,
    domain_name: domainName,
    outfit_description: sheetOutfitFor(ctx),
    previous_scene: previousScene,
    chapter_total: String(ctx.chapterTotal),
  };
  chapters.slice(0, SHEET_SIZE).forEach((chapter, i) => {
    const k = i + 1;
    vars[`chapter_${k}_index`] = String(chapter.index + 1);
    vars[`chapter_${k}_title`] = chapter.chunk.title;
    vars[`chapter_${k}_text`] = truncateAtBoundary(chapter.chunk.narrativeText ?? "", DIRECTOR_CHAPTER_TEXT_CHARS);
  });
  return fillPrompt(sp.director, vars);
}

/**
 * Parses the sheet director's reply into exactly `count` briefs. Accepts {"scenes":[...]}, a bare
 * array, code fences and prose around the JSON; items may be objects or plain strings. Throws when
 * the count is wrong or a scene is empty.
 */
export function parseSheetDirectorReply(text: string, count: number = SHEET_SIZE): SceneBrief[] {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const candidates = [cleaned];
  const o1 = cleaned.indexOf("{");
  const o2 = cleaned.lastIndexOf("}");
  if (o1 >= 0 && o2 > o1) candidates.push(cleaned.slice(o1, o2 + 1));
  const a1 = cleaned.indexOf("[");
  const a2 = cleaned.lastIndexOf("]");
  if (a1 >= 0 && a2 > a1) candidates.push(cleaned.slice(a1, a2 + 1));
  let problem = "no JSON with a scenes list was found";
  for (const candidate of candidates) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      continue;
    }
    const list = Array.isArray(parsed) ? parsed : (parsed as { scenes?: unknown } | null)?.scenes;
    if (!Array.isArray(list)) continue;
    if (list.length !== count) {
      problem = `expected ${count} scenes but got ${list.length}`;
      continue;
    }
    const briefs: SceneBrief[] = [];
    let bad = false;
    for (const item of list) {
      const scene = typeof item === "string" ? item : (item as { scene?: unknown } | null)?.scene;
      const emotion = typeof item === "object" && item ? (item as { emotion?: unknown }).emotion : "";
      if (typeof scene !== "string" || !scene.trim()) {
        problem = "a scene was empty";
        bad = true;
        break;
      }
      briefs.push({ scene: scene.trim(), emotion: typeof emotion === "string" ? emotion.trim() : "" });
    }
    if (!bad) return briefs;
  }
  throw new Error(`The sheet director did not return usable scenes (${problem}).`);
}

/** Runs the sheet director; one extra attempt when the reply cannot be parsed. Throws after the second failure. */
export async function directSheet(generate: TextGenerate, directorPrompt: string, count: number = SHEET_SIZE): Promise<SceneBrief[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return parseSheetDirectorReply(await generate(directorPrompt), count);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** The sheet's logo line: "" when there is no logo reference or no placement (the logo is then not sent either). */
export function buildSheetLogoInstruction(ctx: LeadContext, sp: SheetPrompts): string {
  if (!logoSendable(ctx) || !sp.logo) return "";
  return fillPrompt(sp.logo, { logo_placement: ctx.domain!.logoPlacement.trim() });
}

export interface SheetPromptResult {
  prompt: string;
  /** True when the panel scenes had to be shortened to fit the limit. */
  trimmed: boolean;
}

/**
 * The final image prompt for a sheet: lead_sheet_image with lead_sheet_rules, outfit, logo line and the
 * four panel scenes. Length guard: when the result exceeds `maxChars`, the panel scenes are shortened
 * (longest first, never below ~60 characters each); the layout, identity and outfit text is never touched.
 */
export function buildSheetPrompt(
  ctx: LeadContext,
  sp: SheetPrompts,
  briefs: SceneBrief[],
  maxChars: number = SHEET_PROMPT_MAX_CHARS
): SheetPromptResult {
  const { domainName } = domainWording(ctx);
  const fill = (scenes: string[]) =>
    fillPrompt(sp.image, {
      sheet_rules: sp.rules,
      domain_name: domainName,
      outfit_description: sheetOutfitFor(ctx),
      logo_instruction: buildSheetLogoInstruction(ctx, sp),
      panel_1: scenes[0] ?? "",
      panel_2: scenes[1] ?? "",
      panel_3: scenes[2] ?? "",
      panel_4: scenes[3] ?? "",
    })
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  const scenes = briefs.map((b) => b.scene.replace(/\s+/g, " ").trim());
  const full = fill(scenes);
  if (full.length <= maxChars) return { prompt: full, trimmed: false };

  const overhead = fill(scenes.map(() => "")).length;
  const room = Math.max(MIN_PANEL_CHARS * scenes.length, maxChars - overhead);
  // Water-filling: the shortest scenes keep their length, the rest share what is left equally.
  const order = scenes.map((_s, i) => i).sort((a, b) => scenes[a].length - scenes[b].length);
  const limits = new Array<number>(scenes.length).fill(0);
  let left = room;
  order.forEach((i, rank) => {
    const share = Math.floor(left / (scenes.length - rank));
    limits[i] = Math.max(MIN_PANEL_CHARS, Math.min(scenes[i].length, share));
    left -= limits[i];
  });
  const prompt = fill(scenes.map((s, i) => truncateAtBoundary(s, limits[i])));
  console.warn(
    `generate-scene-images (sheet): prompt was ${full.length} characters, shortened the panel scenes to ${prompt.length} (limit ${maxChars}).`
  );
  if (prompt.length > maxChars) {
    console.warn(
      `generate-scene-images (sheet): prompt is still ${prompt.length} characters after trimming the panels; shorten lead_sheet_rules, lead_sheet_image or domains.outfit_sheet.`
    );
  }
  return { prompt, trimmed: true };
}

/** The nearest saved brief before position `index` in the story ("" when none), for {{previous_scene}}. */
export function previousSavedScene(chunks: Pick<Chunk, "id">[], index: number, briefs: Map<string, SceneBrief>): string {
  for (let i = index - 1; i >= 0; i--) {
    const brief = briefs.get(chunks[i].id);
    if (brief) return brief.scene;
  }
  return "";
}

export interface BatchResult {
  chunkId: string;
  status: "pending" | "ready" | "failed";
}

export interface SheetBatchDeps {
  ctx: LeadContext;
  sheetPrompts: SheetPrompts;
  /** Every scene of the story, in display order (for indexes and previous scenes). */
  chunks: Chunk[];
  /** Exactly SHEET_SIZE targets. */
  batch: Chunk[];
  /** Saved briefs by chunk id; updated with the new ones. */
  briefs: Map<string, SceneBrief>;
  textGenerate: TextGenerate;
  generator: ImageGenerator;
  /** [character, logo?] */
  references: ReferenceBuffer[];
  provider: string;
  claim(chunkId: string): Promise<boolean>;
  finish(chunkId: string, patch: Record<string, unknown>): Promise<void>;
  upload(chunkId: string, image: { mimeType: string; data: Buffer }): Promise<string>;
  afterUpload(chunkId: string, path: string, mimeType: string): void;
  directorTimeoutMs: number;
  imageTimeoutMs: number;
  /** Test hook; defaults to the real crop. */
  crop?: (sheet: { data: Buffer }) => Promise<SheetCropResult>;
}

export interface SheetBatchOutcome {
  results: BatchResult[];
  /** Chunks another run holds a fresh claim on: not ours, not reported. */
  skipped: string[];
  /**
   * Set when the batch could not be drawn as a sheet (director failed twice, or only some chapters
   * could be claimed). These chunks are claimed (pending) and must now go through the single-image path.
   */
  fallback?: Chunk[];
  /** Crop confidence of the sheet that was drawn, for the log. */
  confidence?: "high" | "low";
}

/**
 * One sheet: claim the four chapters, get the four briefs (saved ones when all four exist, else one director
 * call), ONE image call, crop into four, upload and save each panel. Sheet failure => all four rows failed with
 * the error (briefs kept); crop/upload failure of one panel => only that row failed.
 */
export async function runSheetBatch(deps: SheetBatchDeps): Promise<SheetBatchOutcome> {
  const { ctx, sheetPrompts, chunks, batch, briefs, provider } = deps;
  const results: BatchResult[] = [];
  const skipped: string[] = [];

  // Claim all four first so the panel shows the whole batch as generating.
  const claimed: Chunk[] = [];
  for (const chunk of batch) {
    if (await deps.claim(chunk.id)) claimed.push(chunk);
    else {
      skipped.push(chunk.id);
      results.push({ chunkId: chunk.id, status: "pending" });
    }
  }
  if (claimed.length < batch.length) {
    // A sheet needs all four; the ones we hold are drawn one by one instead.
    return { results, skipped, fallback: claimed };
  }

  const indexes = batch.map((chunk) => chunks.findIndex((c) => c.id === chunk.id));
  const message = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 500);

  // 1. Briefs: saved ones (a retry keeps the story of the sequence) or one director call for the four chapters.
  let scenes: SceneBrief[];
  const saved = batch.map((chunk) => briefs.get(chunk.id));
  if (saved.every((b): b is SceneBrief => Boolean(b))) {
    scenes = saved;
  } else {
    try {
      const previousScene = previousSavedScene(chunks, indexes[0], briefs);
      const directorPrompt = buildSheetDirectorPrompt(
        ctx,
        sheetPrompts,
        batch.map((chunk, i) => ({ chunk, index: indexes[i] })),
        previousScene
      );
      scenes = await withTimeout(directSheet(deps.textGenerate, directorPrompt), deps.directorTimeoutMs, "Scene director");
    } catch (error) {
      console.warn("generate-scene-images (sheet): director failed, falling back to single images:", message(error));
      return { results, skipped, fallback: claimed };
    }
    batch.forEach((chunk, i) => briefs.set(chunk.id, scenes[i]));
  }

  // 2. One image for the four panels, then 3. cut it into four.
  const { prompt } = buildSheetPrompt(ctx, sheetPrompts, scenes);
  const failRow = async (i: number, error: unknown) => {
    await deps.finish(batch[i].id, {
      status: "failed",
      prompt_used: encodeBrief(scenes[i], prompt, { sheet: true }),
      provider,
      error: message(error),
    });
    results.push({ chunkId: batch[i].id, status: "failed" });
  };
  let crop: SheetCropResult;
  try {
    const sheet = await withTimeout(
      deps.generator.generate({
        prompt,
        referenceImages: deps.references,
        aspect: "sheet",
        size: { width: SHEET_WIDTH, height: SHEET_HEIGHT },
      }),
      deps.imageTimeoutMs,
      "Image generation"
    );
    crop = await (deps.crop ?? cropSheet)(sheet);
  } catch (error) {
    console.error("generate-scene-images (sheet): sheet failed:", error);
    for (let i = 0; i < batch.length; i++) await failRow(i, error);
    return { results, skipped };
  }
  const log = crop.confidence === "high" ? console.log : console.warn;
  log(
    `generate-scene-images (sheet): cropped ${crop.sheet.width}x${crop.sheet.height} sheet, confidence ${crop.confidence}` +
      (crop.confidence === "low" ? " (no clear gutter on at least one axis, fixed geometry used there)" : "")
  );

  // 4. Save each panel as its own chapter image.
  for (let i = 0; i < batch.length; i++) {
    const chunk = batch[i];
    const panel = crop.panels[i];
    try {
      if (!panel) throw new Error(`Panel ${i + 1} could not be cropped: ${crop.errors[i] ?? "unknown error"}`);
      const path = await deps.upload(chunk.id, panel);
      await deps.finish(chunk.id, {
        status: "ready",
        image_path: path,
        prompt_used: encodeBrief(scenes[i], prompt, { sheet: true }),
        provider,
        error: null,
      });
      deps.afterUpload(chunk.id, path, panel.mimeType);
      results.push({ chunkId: chunk.id, status: "ready" });
    } catch (error) {
      console.error(`generate-scene-images (sheet): panel ${chunk.id} failed:`, error);
      await failRow(i, error);
    }
  }
  return { results, skipped, confidence: crop.confidence };
}
