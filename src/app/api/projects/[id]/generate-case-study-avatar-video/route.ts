import { getSupabase } from "@/lib/db";
import { generateLipsyncVideo } from "@/lib/wav2lip";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectRow } from "@/lib/projects";
import { flattenCaseStudySections } from "@/lib/caseStudySections";
import { AVATARS } from "@/lib/avatars";
import { mapWithConcurrency, withRetry } from "@/lib/concurrency";
import { createNdjsonStream } from "@/lib/ndjsonStream";

const AUDIO_BUCKET = "chunk-audio";
const VIDEO_BUCKET = "chunk-video";
const DEFAULT_APP_BASE_URL = "http://localhost:3000";

// Wav2Lip inference is GPU/CPU-bound on a single local machine and much
// slower per item than TTS — running several renders in parallel there
// thrashes rather than speeds things up, unlike the audio step's
// MAX_CONCURRENT_REQUESTS = 4 (see generate-case-study-audio/route.ts).
const MAX_CONCURRENT_REQUESTS = 1;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

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
      throw new Error("Generate the case study layout before generating avatar video.");
    }
    if (!project.caseStudyBinding.sectionAudio || Object.keys(project.caseStudyBinding.sectionAudio).length === 0) {
      throw new Error("Generate narration audio before generating avatar video — this step lip-syncs that audio.");
    }

    const avatar1 = AVATARS.find((avatar) => avatar.id === "avatar-1");
    const sourceVideoPath = avatar1?.videoUrls?.[0];
    if (!sourceVideoPath) {
      throw new Error("Avatar 1 has no source video configured for lipsync.");
    }
    const appBaseUrl = process.env.APP_BASE_URL ?? DEFAULT_APP_BASE_URL;
    const sourceVideoUrl = `${appBaseUrl}${sourceVideoPath}`;

    const sections = flattenCaseStudySections(project.caseStudyBinding.slots);
    const sectionAudio = project.caseStudyBinding.sectionAudio;
    const failures: { key: string; message: string }[] = [];

    send({ type: "progress", completed: 0, total: sections.length });

    // Bounded concurrency (limit 1, see above) + per-section retry, mirroring
    // generate-case-study-audio/route.ts — one section's failure never
    // discards another section's already-rendered video.
    const results = await mapWithConcurrency(
      sections,
      MAX_CONCURRENT_REQUESTS,
      async (section) => {
        const audioUrl = sectionAudio[section.key];
        if (!audioUrl) {
          failures.push({ key: section.key, message: "No narration audio generated for this section yet." });
          return null;
        }
        try {
          return await withRetry(async () => {
            const audioPath = `${id}/case-study-${section.key}.mp3`;
            const { data: audioBlob, error: downloadError } = await supabase.storage
              .from(AUDIO_BUCKET)
              .download(audioPath);
            if (downloadError || !audioBlob) {
              throw new Error(`Could not read narration audio for ${section.key}: ${downloadError?.message ?? "not found"}`);
            }
            const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());

            const videoBuffer = await generateLipsyncVideo(sourceVideoUrl, audioBuffer);

            const storageId = `case-study-${section.key}`;
            const videoPath = `${id}/${storageId}.mp4`;
            const { error: uploadError } = await supabase.storage
              .from(VIDEO_BUCKET)
              .upload(videoPath, videoBuffer, { contentType: "video/mp4", upsert: true });

            if (uploadError) throw new Error(`Storage upload failed for ${section.key}: ${uploadError.message}`);

            return { key: section.key, url: `/api/projects/${id}/video/${storageId}` };
          });
        } catch (error) {
          failures.push({ key: section.key, message: error instanceof Error ? error.message : String(error) });
          return null;
        }
      },
      (completed, total) => send({ type: "progress", completed, total })
    );

    const sectionVideo: Record<string, string> = { ...project.caseStudyBinding.sectionVideo };
    for (const result of results) {
      if (result) sectionVideo[result.key] = result.url;
    }

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update({
        payload: {
          chunks: project.chunks,
          caseStudyBinding: { ...project.caseStudyBinding, sectionVideo },
        },
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
