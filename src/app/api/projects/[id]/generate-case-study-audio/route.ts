import { getSupabase } from "@/lib/db";
import { generateSpeech } from "@/lib/tts";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectRow } from "@/lib/projects";
import { flattenCaseStudySections } from "@/lib/caseStudySections";
import { mapWithConcurrency, withRetry } from "@/lib/concurrency";
import { createNdjsonStream } from "@/lib/ndjsonStream";

const AUDIO_BUCKET = "chunk-audio";
// See generate-audio/route.ts — same reasoning: a dense case-study document
// can now produce well over a hundred sections, so this can't fire (or even
// run fully sequentially) without bounded concurrency and per-item retry.
const MAX_CONCURRENT_REQUESTS = 4;

interface GenerateCaseStudyAudioBody {
  voice: string;
}

function isGenerateCaseStudyAudioBody(value: unknown): value is GenerateCaseStudyAudioBody {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return typeof body.voice === "string" && body.voice.length > 0;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  if (!isGenerateCaseStudyAudioBody(body)) {
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
    if (!project.caseStudyBinding?.slots) {
      throw new Error("Generate the case study layout before generating its narration audio.");
    }

    const sections = flattenCaseStudySections(project.caseStudyBinding.slots);
    const failures: { key: string; message: string }[] = [];

    send({ type: "progress", completed: 0, total: sections.length });

    // Reuses the same chunk-audio bucket and the existing generic
    // /api/projects/[id]/audio/[chunkId] redirect route — that route only
    // ever does `${id}/${chunkId}.mp3`, so a "case-study-<key>" id resolves
    // correctly with zero route changes needed.
    //
    // Bounded concurrency + per-section retry, and one section's failure
    // never discards another section's already-successful audio.
    const results = await mapWithConcurrency(
      sections,
      MAX_CONCURRENT_REQUESTS,
      async (section) => {
        try {
          return await withRetry(async () => {
            const storageId = `case-study-${section.key}`;
            const audioBuffer = await generateSpeech(section.body, body.voice);
            const path = `${id}/${storageId}.mp3`;

            const { error: uploadError } = await supabase.storage
              .from(AUDIO_BUCKET)
              .upload(path, audioBuffer, { contentType: "audio/mpeg", upsert: true });

            if (uploadError) throw new Error(`Storage upload failed for ${section.key}: ${uploadError.message}`);

            return { key: section.key, url: `/api/projects/${id}/audio/${storageId}` };
          });
        } catch (error) {
          failures.push({ key: section.key, message: error instanceof Error ? error.message : String(error) });
          return null;
        }
      },
      (completed, total) => send({ type: "progress", completed, total })
    );

    const sectionAudio: Record<string, string> = { ...project.caseStudyBinding.sectionAudio };
    for (const result of results) {
      if (result) sectionAudio[result.key] = result.url;
    }

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update({
        payload: {
          chunks: project.chunks,
          caseStudyBinding: { ...project.caseStudyBinding, sectionAudio },
        },
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
