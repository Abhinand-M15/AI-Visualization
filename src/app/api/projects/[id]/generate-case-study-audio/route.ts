import { getSupabase } from "@/lib/db";
import { generateSpeech } from "@/lib/tts";
import { buildPayload, PROJECT_SELECT_COLUMNS, rowToProject, updatedByFields, type ProjectRow } from "@/lib/projects";
import { flattenCaseStudySections } from "@/lib/caseStudySections";
import { sectionNarrationState } from "@/lib/contentVersion";
import type { CaseStudyBinding } from "@/lib/types";
import { mapWithConcurrency, withRetry } from "@/lib/concurrency";
import { createNdjsonStream } from "@/lib/ndjsonStream";
import { createProgressSaver } from "@/lib/progressSaver";
import { requireUser, unauthorizedResponse, type AppUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";

// Vercel caps a function at 300 s (Hobby). Progress is saved as each section
// finishes (see below), so hitting the cap loses at most the in-flight sections.
export const maxDuration = 300;

const AUDIO_BUCKET = "chunk-audio";
// See generate-audio/route.ts — same reasoning: a dense case-study document
// can now produce well over a hundred sections, so this can't fire (or even
// run fully sequentially) without bounded concurrency.
const MAX_CONCURRENT_REQUESTS = 4;

interface GenerateCaseStudyAudioBody {
  voice: string;
  /** Only these section keys (default: every section). */
  sectionKeys?: string[];
  /**
   * Resume mode: skip sections that already have narration (e.g. a retry
   * after a timeout). Off by default, so a voice change still redoes all.
   */
  onlyMissing?: boolean;
}

function isGenerateCaseStudyAudioBody(value: unknown): value is GenerateCaseStudyAudioBody {
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
  if (!isGenerateCaseStudyAudioBody(body)) {
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
    const binding = project.caseStudyBinding;
    if (!binding?.slots) {
      throw new Error("Generate the case study layout before generating its narration audio.");
    }

    const boundBinding: CaseStudyBinding = binding;
    const existingAudio = binding.sectionAudio ?? {};
    const requestedKeys = Array.isArray(body.sectionKeys) ? new Set(body.sectionKeys) : null;
    // onlyMissing also redoes narration that is outdated (section text edited,
    // or made with a different voice than this request's).
    const sections = flattenCaseStudySections(binding.slots).filter(
      (section) =>
        (!requestedKeys || requestedKeys.has(section.key)) &&
        !(body.onlyMissing && sectionNarrationState(binding, section.key, body.voice) === "ok")
    );

    // Live map of section -> audio URL: each finished section is written into
    // it and persisted right away, so a timeout never leaves uploaded mp3s
    // unlinked and a retry with onlyMissing skips them.
    const sectionAudio: Record<string, string> = { ...existingAudio };
    const sectionAudioVoice: Record<string, string> = { ...binding.sectionAudioVoice };
    const outdatedSections = new Set(binding.outdatedSections ?? []);

    function buildUpdate() {
      return {
        payload: buildPayload(project, {
          chunks: project.chunks,
          caseStudyBinding: {
            ...boundBinding,
            sectionAudio,
            sectionAudioVoice,
            outdatedSections: [...outdatedSections],
          },
        }),
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
      (error) => console.error("generate-case-study-audio: saving progress failed (continuing):", error)
    );

    const failures: { key: string; message: string }[] = [];

    send({ type: "progress", completed: 0, total: sections.length });

    // Reuses the same chunk-audio bucket and the existing generic
    // /api/projects/[id]/audio/[chunkId] redirect route — that route only
    // ever does `${id}/${chunkId}.mp3`, so a "case-study-<key>" id resolves
    // correctly with zero route changes needed.
    //
    // Bounded concurrency, and one section's failure never discards another
    // section's already-successful audio. generateSpeech retries internally,
    // so only the storage upload gets its own retry here.
    await mapWithConcurrency(
      sections,
      MAX_CONCURRENT_REQUESTS,
      async (section) => {
        try {
          const storageId = `case-study-${section.key}`;
          const audioBuffer = await generateSpeech(section.body, body.voice);
          const path = `${id}/${storageId}.mp3`;

          await withRetry(async () => {
            const { error: uploadError } = await supabase.storage
              .from(AUDIO_BUCKET)
              .upload(path, audioBuffer, { contentType: "audio/mpeg", upsert: true });
            if (uploadError) throw new Error(`Storage upload failed for ${section.key}: ${uploadError.message}`);
          });

          sectionAudio[section.key] = `/api/projects/${id}/audio/${storageId}`;
          sectionAudioVoice[section.key] = body.voice;
          outdatedSections.delete(section.key);
          saver.schedule();
        } catch (error) {
          failures.push({ key: section.key, message: error instanceof Error ? error.message : String(error) });
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
      kind: "case-study",
      voice: body.voice,
      requested: sections.length,
      failed: failures.length,
    });
    send({
      type: "done",
      project: rowToProject(updated as unknown as ProjectRow),
      failures: failures.length > 0 ? failures : undefined,
    });
  });
}
