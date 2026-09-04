import { getSupabase } from "@/lib/db";
import { generateSpeech } from "@/lib/tts";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectRow } from "@/lib/projects";
import { mapWithConcurrency, withRetry } from "@/lib/concurrency";
import { createNdjsonStream } from "@/lib/ndjsonStream";

const AUDIO_BUCKET = "chunk-audio";
// The local TTS server (and any real network dependency) chokes if every
// chunk fires at once — a case-study document can now have 100+ chunks
// (flexible count, no cap), so this can no longer be a plain Promise.all.
const MAX_CONCURRENT_REQUESTS = 4;

interface GenerateAudioBody {
  voice: string;
  /** If omitted, (re)generates audio for every chunk. */
  chunkIds?: string[];
}

function isGenerateAudioBody(value: unknown): value is GenerateAudioBody {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return typeof body.voice === "string" && body.voice.length > 0;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  if (!isGenerateAudioBody(body)) {
    return Response.json({ error: "Body must include 'voice'." }, { status: 400 });
  }

  return createNdjsonStream(async (send) => {
    const supabase = getSupabase();
    const { data: existing, error: fetchError } = await supabase
      .from("projects")
      .select(PROJECT_SELECT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) throw new Error("Project not found.");

    const project = rowToProject(existing as unknown as ProjectRow);
    const targetIds = body.chunkIds ?? project.chunks.map((chunk) => chunk.id);

    const failures: { chunkId: string; message: string }[] = [];

    send({ type: "progress", completed: 0, total: targetIds.length });

    // Bounded concurrency + per-chunk retry, and a failure on one chunk never
    // discards another chunk's already-successful audio (a plain Promise.all
    // would reject the whole batch on the first error and lose everything).
    const updatedChunks = await mapWithConcurrency(
      project.chunks,
      MAX_CONCURRENT_REQUESTS,
      async (chunk) => {
        if (!targetIds.includes(chunk.id)) return chunk;

        try {
          return await withRetry(async () => {
            const audioBuffer = await generateSpeech(chunk.narrativeText, body.voice);
            const path = `${id}/${chunk.id}.mp3`;

            const { error: uploadError } = await supabase.storage
              .from(AUDIO_BUCKET)
              .upload(path, audioBuffer, { contentType: "audio/mpeg", upsert: true });

            if (uploadError) throw new Error(`Storage upload failed for ${chunk.id}: ${uploadError.message}`);

            return { ...chunk, audioUrl: `/api/projects/${id}/audio/${chunk.id}` };
          });
        } catch (error) {
          failures.push({ chunkId: chunk.id, message: error instanceof Error ? error.message : String(error) });
          return chunk; // keep whatever audio (if any) it already had rather than losing the chunk
        }
      },
      (completed, total) => {
        // total here is project.chunks.length (every chunk passes through the
        // worker even if skipped), so report against the actual target count.
        send({ type: "progress", completed: Math.min(completed, targetIds.length), total: targetIds.length });
      }
    );

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update({
        payload: { chunks: updatedChunks, caseStudyBinding: project.caseStudyBinding ?? null },
        selected_voice: body.voice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(PROJECT_SELECT_COLUMNS)
      .single();

    if (updateError) throw new Error(updateError.message);
    send({
      type: "done",
      project: rowToProject(updated as unknown as ProjectRow),
      failures: failures.length > 0 ? failures : undefined,
    });
  });
}
