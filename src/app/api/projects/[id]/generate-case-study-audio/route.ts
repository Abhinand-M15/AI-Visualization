import { getSupabase } from "@/lib/db";
import { generateSpeech } from "@/lib/tts";
import { buildPayload, PROJECT_SELECT_COLUMNS, rowToProject, updatedByFields, type ProjectRow } from "@/lib/projects";
import { flattenCaseStudySections } from "@/lib/caseStudySections";
import { sectionNarrationState } from "@/lib/contentVersion";
import type { CaseStudyBinding } from "@/lib/types";
import { mapWithConcurrency, withRetry } from "@/lib/concurrency";
import { createNdjsonStream } from "@/lib/ndjsonStream";
import { createProgressSaver } from "@/lib/progressSaver";
import { requireUser, type AppUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { apiErrorResponse, errorBody, HttpError, toProviderError } from "@/lib/server/errors";
import { caseStudyStorageId, chunkAudioPath, isValidProjectId } from "@/lib/server/ids";
import { QuotaExceededError, requireQuota } from "@/lib/server/quota";
import { updateLatestProject } from "@/lib/server/projectWrites";

// Vercel caps a function at 300 s (Hobby). Progress is saved as each section
// finishes (see below), so hitting the cap loses at most the in-flight sections.
export const maxDuration = 300;

const AUDIO_BUCKET = "chunk-audio";
// See generate-audio/route.ts — same reasoning: a dense case-study document
// can now produce well over a hundred sections, so this can't fire (or even
// run fully sequentially) without bounded concurrency.
const MAX_CONCURRENT_REQUESTS = 4;
/** No new section starts after this (AR-10); see generate-audio. */
const BUDGET_MS = 230_000;
const MAX_VOICE_LENGTH = 200;

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

function parseBody(value: unknown): GenerateCaseStudyAudioBody | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.voice !== "string" || !body.voice.trim() || body.voice.length > MAX_VOICE_LENGTH) return null;
  if (body.sectionKeys !== undefined && (!Array.isArray(body.sectionKeys) || body.sectionKeys.length > 1000)) return null;
  return {
    voice: body.voice.trim(),
    sectionKeys: Array.isArray(body.sectionKeys) ? body.sectionKeys.filter((key): key is string => typeof key === "string") : undefined,
    onlyMissing: body.onlyMissing === true,
  };
}

/**
 * Stream lines as generate-audio: progress, then
 * { type: "done", project, failures?, skippedChanged?, remaining, quotaExceeded? } or { type: "error", message, code }.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let user: AppUser | null;
  try {
    user = await requireUser();
  } catch (error) {
    return apiErrorResponse(error, "generate-case-study-audio");
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
      const { body: errorJson } = errorBody(error, "generate-case-study-audio");
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
    const binding = project.caseStudyBinding;
    if (!binding?.slots) {
      throw new HttpError(400, "bad_request", "Generate the case study layout before generating its narration audio.");
    }

    const requestedKeys = body!.sectionKeys ? new Set(body!.sectionKeys) : null;
    // onlyMissing also redoes narration that is outdated (section text edited,
    // or made with a different voice than this request's).
    const sections = flattenCaseStudySections(binding.slots).filter(
      (section) =>
        (!requestedKeys || requestedKeys.has(section.key)) &&
        !(body!.onlyMissing && sectionNarrationState(binding, section.key, body!.voice) === "ok")
    );

    // Finished sections, merged into the LATEST stored layout on every save (UX-02):
    // a section edited while this ran keeps its edit and gets no stale audio.
    const finished = new Map<string, { narratedBody: string; audioUrl: string }>();
    const skippedChanged = new Set<string>();

    async function save(): Promise<ProjectRow> {
      return updateLatestProject(id, user?.id ?? null, (latest) => {
        const latestBinding = latest.caseStudyBinding;
        if (!latestBinding?.slots) return null; // the layout was removed meanwhile; nothing to attach to
        const bodies = new Map(flattenCaseStudySections(latestBinding.slots).map((section) => [section.key, section.body]));
        const sectionAudio = { ...latestBinding.sectionAudio };
        const sectionAudioVoice = { ...latestBinding.sectionAudioVoice };
        const outdated = new Set(latestBinding.outdatedSections ?? []);
        let changed = false;
        for (const [key, done] of finished) {
          if (bodies.get(key) !== done.narratedBody) {
            skippedChanged.add(key);
            continue;
          }
          if (sectionAudio[key] === done.audioUrl && sectionAudioVoice[key] === body!.voice && !outdated.has(key)) continue;
          sectionAudio[key] = done.audioUrl;
          sectionAudioVoice[key] = body!.voice;
          outdated.delete(key);
          changed = true;
        }
        const voiceChanged = latest.selectedVoice !== body!.voice;
        if (!changed && !voiceChanged) return null;
        const nextBinding: CaseStudyBinding = { ...latestBinding, sectionAudio, sectionAudioVoice, outdatedSections: [...outdated] };
        return {
          payload: buildPayload(latest, { chunks: latest.chunks, caseStudyBinding: nextBinding }),
          columns: { selected_voice: body!.voice, ...updatedByFields(user) },
        };
      });
    }

    const saver = createProgressSaver(
      async () => {
        await save();
      },
      (error) => console.error("generate-case-study-audio: saving progress failed (continuing):", error)
    );

    const failures: { key: string; message: string; code?: string }[] = [];
    let remaining = 0;
    let quotaExceeded: { message: string } | undefined;

    send({ type: "progress", completed: 0, total: sections.length });

    // Reuses the same chunk-audio bucket and the existing generic
    // /api/projects/[id]/audio/[chunkId] redirect route (`case-study-<key>` ids).
    // Bounded concurrency, and one section's failure never discards another
    // section's already-successful audio. generateSpeech retries internally,
    // so only the storage upload gets its own retry here.
    await mapWithConcurrency(
      sections,
      MAX_CONCURRENT_REQUESTS,
      async (section) => {
        if (quotaExceeded || Date.now() - startedAt > BUDGET_MS) {
          remaining++;
          return;
        }
        try {
          const storageId = caseStudyStorageId(section.key);
          await requireQuota(user, "tts_chars", section.body.length);
          const audioBuffer = await generateSpeech(section.body, body!.voice);
          const path = chunkAudioPath(id, storageId);

          await withRetry(async () => {
            const { error: uploadError } = await supabase.storage
              .from(AUDIO_BUCKET)
              .upload(path, audioBuffer, { contentType: "audio/mpeg", upsert: true });
            if (uploadError) throw new Error(`Storage upload failed for ${section.key}: ${uploadError.message}`);
          });

          finished.set(section.key, { narratedBody: section.body, audioUrl: `/api/projects/${id}/audio/${storageId}` });
          saver.schedule();
        } catch (error) {
          if (error instanceof QuotaExceededError) {
            quotaExceeded = { message: error.message };
            remaining++;
            return;
          }
          console.error(`generate-case-study-audio: section ${section.key} failed:`, error);
          const safe = toProviderError(error, "tts");
          failures.push({ key: section.key, message: safe.message, code: safe.code });
        }
      },
      (completed, total) => send({ type: "progress", completed, total })
    );

    await saver.flush();
    const updated = await save();

    await logActivity(user, id, "audio.generated", {
      kind: "case-study",
      voice: body!.voice,
      requested: sections.length,
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
