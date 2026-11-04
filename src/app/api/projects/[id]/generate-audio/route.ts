import { getSupabase } from "@/lib/db";
import { generateSpeech } from "@/lib/tts";
import { buildPayload, PROJECT_SELECT_COLUMNS, rowToProject, updatedByFields, type ProjectRow } from "@/lib/projects";
import { mapWithConcurrency, withRetry } from "@/lib/concurrency";
import { createNdjsonStream } from "@/lib/ndjsonStream";
import { createProgressSaver } from "@/lib/progressSaver";
import { requireUser, type AppUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import type { Chunk } from "@/lib/types";
import { chunkNarrationState } from "@/lib/contentVersion";
import { apiErrorResponse, errorBody, toProviderError } from "@/lib/server/errors";
import { chunkAudioPath, isValidChunkId, isValidProjectId } from "@/lib/server/ids";
import { QuotaExceededError, requireQuota } from "@/lib/server/quota";
import { updateLatestProject } from "@/lib/server/projectWrites";

// Vercel caps a function at 300 s (Hobby). Progress is saved as each chunk
// finishes (see below), so hitting the cap loses at most the in-flight chunks.
export const maxDuration = 300;

const AUDIO_BUCKET = "chunk-audio";
// The local TTS server (and any real network dependency) chokes if every
// chunk fires at once — a case-study document can now have 100+ chunks
// (flexible count, no cap), so this can no longer be a plain Promise.all.
const MAX_CONCURRENT_REQUESTS = 4;
/**
 * No new chunk starts after this (AR-10): the run then ends cleanly with
 * `remaining` > 0 and the client calls again with onlyMissing, instead of
 * Vercel cutting the stream at 300 s.
 */
const BUDGET_MS = 230_000;
const MAX_VOICE_LENGTH = 200;

interface GenerateAudioBody {
  voice: string;
  /** If omitted, (re)generates audio for every chunk. */
  chunkIds?: string[];
  /**
   * Resume mode: skip target chunks that already have audio (e.g. a retry
   * after a timeout, or "generate whatever is missing"). Off by default, so
   * "regenerate all" / a voice change still redoes every chunk.
   */
  onlyMissing?: boolean;
}

function parseBody(value: unknown): GenerateAudioBody | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.voice !== "string" || !body.voice.trim() || body.voice.length > MAX_VOICE_LENGTH) return null;
  if (body.chunkIds !== undefined && (!Array.isArray(body.chunkIds) || body.chunkIds.length > 1000)) return null;
  return {
    voice: body.voice.trim(),
    chunkIds: Array.isArray(body.chunkIds) ? body.chunkIds.filter(isValidChunkId) : undefined,
    onlyMissing: body.onlyMissing === true,
  };
}

/** What one finished chunk contributes, and the text it was narrated from. */
interface NarratedChunk {
  narratedText: string;
  audioUrl: string;
}

/**
 * Stream lines:
 *   { type: "progress", completed, total }
 *   { type: "done", project, failures?, skippedChanged?, remaining, quotaExceeded? }
 *   { type: "error", message, code }
 * `remaining` > 0: the time budget ran out; call again with onlyMissing: true.
 * `skippedChanged`: chunks edited while the job ran; their new text was kept and they still need narration.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let user: AppUser | null;
  try {
    user = await requireUser();
  } catch (error) {
    return apiErrorResponse(error, "generate-audio");
  }
  const { id } = await context.params;
  if (!isValidProjectId(id)) return Response.json({ error: "Project not found.", code: "not_found" }, { status: 404 });
  const body = parseBody(await request.json().catch(() => null));
  if (!body) {
    return Response.json({ error: "Body must include 'voice'.", code: "bad_request" }, { status: 400 });
  }

  return createNdjsonStream(async (send) => {
    try {
      await run(send);
    } catch (error) {
      const { body: errorJson } = errorBody(error, "generate-audio");
      send({ type: "error", message: errorJson.error, code: errorJson.code });
    }
  });

  async function run(send: (obj: unknown) => void) {
    const startedAt = Date.now();
    const supabase = getSupabase();
    let fetchQuery = supabase.from("projects").select(PROJECT_SELECT_COLUMNS).eq("id", id);
    if (user) fetchQuery = fetchQuery.eq("owner_id", user.id);
    const { data: existing, error: fetchError } = await fetchQuery.maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) throw new Error("Project not found.");

    const project = rowToProject(existing as unknown as ProjectRow);
    const requestedIds = new Set(body!.chunkIds ?? project.chunks.map((chunk) => chunk.id));
    // onlyMissing also redoes narration that is outdated (text edited, or made
    // with a different voice than this request's), see chunkNarrationState.
    const targets = project.chunks.filter(
      (chunk) =>
        isValidChunkId(chunk.id) &&
        requestedIds.has(chunk.id) &&
        !(body!.onlyMissing && chunkNarrationState(chunk, body!.voice) === "ok")
    );

    // Finished chunks, merged into the LATEST stored chunk list on every save (UX-02):
    // a chunk whose text was edited while this ran keeps the edit and gets no stale audio.
    const finished = new Map<string, NarratedChunk>();
    const skippedChanged = new Set<string>();

    async function save(): Promise<ProjectRow> {
      return updateLatestProject(id, user?.id ?? null, (latest) => {
        let changed = false;
        const chunks: Chunk[] = latest.chunks.map((chunk) => {
          const done = finished.get(chunk.id);
          if (!done) return chunk;
          if (chunk.narrativeText !== done.narratedText) {
            skippedChanged.add(chunk.id);
            return chunk;
          }
          if (chunk.audioUrl === done.audioUrl && chunk.audioVoice === body!.voice && !chunk.narrationOutdated) return chunk;
          changed = true;
          const narrated: Chunk = { ...chunk, audioUrl: done.audioUrl, audioVoice: body!.voice };
          delete narrated.narrationOutdated;
          return narrated;
        });
        const voiceChanged = latest.selectedVoice !== body!.voice;
        if (!changed && !voiceChanged) return null;
        return {
          payload: buildPayload(latest, { chunks, caseStudyBinding: latest.caseStudyBinding ?? null }),
          columns: { selected_voice: body!.voice, ...updatedByFields(user) },
        };
      });
    }

    const saver = createProgressSaver(
      async () => {
        await save();
      },
      (error) => console.error("generate-audio: saving progress failed (continuing):", error)
    );

    const failures: { chunkId: string; message: string; code?: string }[] = [];
    let remaining = 0;
    let quotaExceeded: { message: string } | undefined;

    send({ type: "progress", completed: 0, total: targets.length });

    // Bounded concurrency, and a failure on one chunk never discards another
    // chunk's already-successful audio. generateSpeech retries internally, so
    // only the storage upload gets its own retry here.
    await mapWithConcurrency(
      targets,
      MAX_CONCURRENT_REQUESTS,
      async (chunk) => {
        if (quotaExceeded || Date.now() - startedAt > BUDGET_MS) {
          remaining++;
          return;
        }
        try {
          // Per-user daily narration allowance on the shared TTS endpoint (SEC-11).
          await requireQuota(user, "tts_chars", chunk.narrativeText.length);
          const audioBuffer = await generateSpeech(chunk.narrativeText, body!.voice);
          const path = chunkAudioPath(id, chunk.id);

          await withRetry(async () => {
            const { error: uploadError } = await supabase.storage
              .from(AUDIO_BUCKET)
              .upload(path, audioBuffer, { contentType: "audio/mpeg", upsert: true });
            if (uploadError) throw new Error(`Storage upload failed for ${chunk.id}: ${uploadError.message}`);
          });

          finished.set(chunk.id, { narratedText: chunk.narrativeText, audioUrl: `/api/projects/${id}/audio/${chunk.id}` });
          saver.schedule();
        } catch (error) {
          if (error instanceof QuotaExceededError) {
            quotaExceeded = { message: error.message };
            remaining++;
            return;
          }
          // Keep whatever audio (if any) it already had rather than losing the chunk.
          console.error(`generate-audio: chunk ${chunk.id} failed:`, error);
          const safe = toProviderError(error, "tts");
          failures.push({ chunkId: chunk.id, message: safe.message, code: safe.code });
        }
      },
      (completed, total) => send({ type: "progress", completed, total })
    );

    await saver.flush();
    const updated = await save();

    await logActivity(user, id, "audio.generated", {
      voice: body!.voice,
      requested: targets.length,
      failed: failures.length,
      remaining,
      skippedChanged: skippedChanged.size,
    });
    send({
      type: "done",
      project: rowToProject(updated),
      failures: failures.length > 0 ? failures : undefined,
      skippedChanged: skippedChanged.size > 0 ? [...skippedChanged] : undefined,
      remaining,
      ...(quotaExceeded ? { quotaExceeded } : {}),
    });
  }
}
