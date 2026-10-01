import { getSupabase } from "@/lib/db";
import { generateSpeech } from "@/lib/tts";
import { buildPayload, PROJECT_SELECT_COLUMNS, rowToProject, updatedByFields, type ProjectRow } from "@/lib/projects";
import { mapWithConcurrency, withRetry } from "@/lib/concurrency";
import { createNdjsonStream } from "@/lib/ndjsonStream";
import { createProgressSaver } from "@/lib/progressSaver";
import { requireUser, unauthorizedResponse, type AppUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import type { Chunk } from "@/lib/types";
import { chunkNarrationState } from "@/lib/contentVersion";

// Vercel caps a function at 300 s (Hobby). Progress is saved as each chunk
// finishes (see below), so hitting the cap loses at most the in-flight chunks.
export const maxDuration = 300;

const AUDIO_BUCKET = "chunk-audio";
// The local TTS server (and any real network dependency) chokes if every
// chunk fires at once — a case-study document can now have 100+ chunks
// (flexible count, no cap), so this can no longer be a plain Promise.all.
const MAX_CONCURRENT_REQUESTS = 4;

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

function isGenerateAudioBody(value: unknown): value is GenerateAudioBody {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return typeof body.voice === "string" && body.voice.length > 0;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let user: AppUser | null;
  try {
    user = await requireUser();
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    throw error;
  }
  const { id } = await context.params;
  const body = await request.json();
  if (!isGenerateAudioBody(body)) {
    return Response.json({ error: "Body must include 'voice'." }, { status: 400 });
  }

  return createNdjsonStream(async (send) => {
    const supabase = getSupabase();
    let fetchQuery = supabase.from("projects").select(PROJECT_SELECT_COLUMNS).eq("id", id);
    if (user) fetchQuery = fetchQuery.eq("owner_id", user.id);
    const { data: existing, error: fetchError } = await fetchQuery.maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) throw new Error("Project not found.");

    const project = rowToProject(existing as unknown as ProjectRow);
    const requestedIds = new Set(body.chunkIds ?? project.chunks.map((chunk) => chunk.id));
    // onlyMissing also redoes narration that is outdated (text edited, or made
    // with a different voice than this request's), see chunkNarrationState.
    const targets = project.chunks.filter(
      (chunk) =>
        requestedIds.has(chunk.id) && !(body.onlyMissing && chunkNarrationState(chunk, body.voice) === "ok")
    );

    // Live copy of the chunk list: each finished chunk is written into it and
    // persisted right away, so a timeout never leaves uploaded mp3s unlinked.
    const currentChunks: Chunk[] = [...project.chunks];
    const indexById = new Map(project.chunks.map((chunk, index) => [chunk.id, index]));

    function buildUpdate() {
      return {
        payload: buildPayload(project, { chunks: currentChunks, caseStudyBinding: project.caseStudyBinding ?? null }),
        selected_voice: body.voice,
        updated_at: new Date().toISOString(),
        ...updatedByFields(user),
      };
    }

    const saver = createProgressSaver(
      async () => {
        let query = supabase.from("projects").update(buildUpdate()).eq("id", id);
        if (user) query = query.eq("owner_id", user.id);
        const { error } = await query;
        if (error) throw new Error(error.message);
      },
      (error) => console.error("generate-audio: saving progress failed (continuing):", error)
    );

    const failures: { chunkId: string; message: string }[] = [];

    send({ type: "progress", completed: 0, total: targets.length });

    // Bounded concurrency, and a failure on one chunk never discards another
    // chunk's already-successful audio. generateSpeech retries internally, so
    // only the storage upload gets its own retry here.
    await mapWithConcurrency(
      targets,
      MAX_CONCURRENT_REQUESTS,
      async (chunk) => {
        try {
          const audioBuffer = await generateSpeech(chunk.narrativeText, body.voice);
          const path = `${id}/${chunk.id}.mp3`;

          await withRetry(async () => {
            const { error: uploadError } = await supabase.storage
              .from(AUDIO_BUCKET)
              .upload(path, audioBuffer, { contentType: "audio/mpeg", upsert: true });
            if (uploadError) throw new Error(`Storage upload failed for ${chunk.id}: ${uploadError.message}`);
          });

          const index = indexById.get(chunk.id);
          if (index !== undefined) {
            const narrated: Chunk = {
              ...currentChunks[index],
              audioUrl: `/api/projects/${id}/audio/${chunk.id}`,
              audioVoice: body.voice,
            };
            delete narrated.narrationOutdated;
            currentChunks[index] = narrated;
            saver.schedule();
          }
        } catch (error) {
          // Keep whatever audio (if any) it already had rather than losing the chunk.
          failures.push({ chunkId: chunk.id, message: error instanceof Error ? error.message : String(error) });
        }
      },
      (completed, total) => send({ type: "progress", completed, total })
    );

    await saver.flush();

    let updateQuery = supabase.from("projects").update(buildUpdate()).eq("id", id);
    if (user) updateQuery = updateQuery.eq("owner_id", user.id);
    const { data: updated, error: updateError } = await updateQuery.select(PROJECT_SELECT_COLUMNS).single();

    if (updateError) throw new Error(updateError.message);
    await logActivity(user, id, "audio.generated", {
      voice: body.voice,
      requested: targets.length,
      failed: failures.length,
    });
    send({
      type: "done",
      project: rowToProject(updated as unknown as ProjectRow),
      failures: failures.length > 0 ? failures : undefined,
    });
  });
}
