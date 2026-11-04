/**
 * The one validation layer for chapter (chunk) lists sent by the browser
 * (SEC-03, SEC-04, SEC-08, SEC-21). Used by POST /api/projects, PATCH
 * /api/projects/[id] and /api/revise-story.
 *
 * Only story fields pass. Everything the server derives itself is dropped:
 * audioUrl / audioVoice / audioDurationSec / narrationOutdated (narration),
 * imageUrl / imageStatus (scene images, from chapter_images), order and
 * partNumber (recomputed). Ids must match CHUNK_ID_PATTERN; any other id is
 * dropped so the server assigns a fresh one (see mergeChunks).
 *
 * Pure module (no server imports), so it can be unit tested.
 */
import type { CaseStudyPhase, EmotionKey, EvidenceGrade } from "@/lib/types";
import { isValidChunkId } from "@/lib/server/ids";

export const MAX_CHUNKS = 400;
export const MAX_CHUNK_TITLE_LENGTH = 200;
export const MAX_CHUNK_TEXT_LENGTH = 10_000;
export const MAX_STORY_TITLE_LENGTH = 200;

const EMOTIONS: readonly EmotionKey[] = ["neutral", "confused", "thinking", "idea", "solution", "happy"];
const PHASES: readonly CaseStudyPhase[] = ["domain", "customer", "problem", "solution", "impact"];
const EVIDENCE: readonly EvidenceGrade[] = ["verified", "claimed", "none"];

/** A chunk as the client may send it: story fields only. */
export interface ClientChunkInput {
  id?: string;
  title: string;
  narrativeText: string;
  emotion?: EmotionKey;
  phase?: CaseStudyPhase;
  impactScore?: number;
  evidenceGrade?: EvidenceGrade;
  userEdited?: boolean;
}

export type ChunkValidation = { ok: true; chunks: ClientChunkInput[] } | { ok: false; error: string };

/** Removes control characters other than tab and newline (they break TTS and HTML alike). */
function cleanText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function validateClientChunks(raw: unknown, options: { allowEmpty?: boolean } = {}): ChunkValidation {
  if (!Array.isArray(raw)) return { ok: false, error: "'chunks' must be an array." };
  if (raw.length === 0 && !options.allowEmpty) return { ok: false, error: "A story needs at least one chapter." };
  if (raw.length > MAX_CHUNKS) return { ok: false, error: `A story can have at most ${MAX_CHUNKS} chapters.` };

  const chunks: ClientChunkInput[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return { ok: false, error: "Every chapter must be an object." };
    }
    const c = entry as Record<string, unknown>;
    if (typeof c.title !== "string" || typeof c.narrativeText !== "string") {
      return { ok: false, error: "Every chapter needs a title and narrativeText." };
    }
    if (c.title.length > MAX_CHUNK_TITLE_LENGTH || c.narrativeText.length > MAX_CHUNK_TEXT_LENGTH) {
      return {
        ok: false,
        error: `A chapter's title (max ${MAX_CHUNK_TITLE_LENGTH} characters) or text (max ${MAX_CHUNK_TEXT_LENGTH}) is too long.`,
      };
    }
    const chunk: ClientChunkInput = { title: cleanText(c.title), narrativeText: cleanText(c.narrativeText) };
    if (isValidChunkId(c.id)) chunk.id = c.id;
    if (typeof c.emotion === "string" && (EMOTIONS as readonly string[]).includes(c.emotion)) {
      chunk.emotion = c.emotion as EmotionKey;
    }
    if (typeof c.phase === "string" && (PHASES as readonly string[]).includes(c.phase)) {
      chunk.phase = c.phase as CaseStudyPhase;
    }
    if (typeof c.impactScore === "number" && Number.isFinite(c.impactScore)) {
      chunk.impactScore = Math.min(10, Math.max(1, Math.round(c.impactScore)));
    }
    if (typeof c.evidenceGrade === "string" && (EVIDENCE as readonly string[]).includes(c.evidenceGrade)) {
      chunk.evidenceGrade = c.evidenceGrade as EvidenceGrade;
    }
    if (c.userEdited === true) chunk.userEdited = true;
    chunks.push(chunk);
  }
  return { ok: true, chunks };
}

/** A story title: trimmed, 1 to MAX_STORY_TITLE_LENGTH characters, or null when invalid. */
export function cleanStoryTitle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const title = cleanText(raw).trim();
  if (!title || title.length > MAX_STORY_TITLE_LENGTH) return null;
  return title;
}
