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
import { geminiTextModels } from "@/lib/imageGen/constants";
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
export function encodeBrief(brief: SceneBrief, prompt: string): string {
  return JSON.stringify({ v: 1, scene: brief.scene, emotion: brief.emotion, prompt });
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
          config: { responseMimeType: "application/json", maxOutputTokens: 2048 },
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
