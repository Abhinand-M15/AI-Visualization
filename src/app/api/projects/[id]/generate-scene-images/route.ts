import { getSupabase } from "@/lib/db";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectRow } from "@/lib/projects";
import { requireUser, unauthorizedResponse, type AppUser } from "@/lib/auth/session";
import { getGeminiKeyFor, missingApiKeyResponse } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";
import { fillPrompt, getDomain, getPrompt } from "@/lib/domains";
import { getImageGeneratorFor, type ImageGenerator } from "@/lib/imageGen/types";
import {
  assetBaseUrl,
  buildDirectorPrompt,
  batchTargets,
  buildImagePrompt,
  createGeminiTextGenerate,
  decodeBrief,
  directScene,
  encodeBrief,
  LeadSetupError,
  loadCharacterReference,
  loadLeadPrompts,
  loadLogoReference,
  loadSheetOutfit,
  loadSheetPrompts,
  logoSendable,
  runSheetBatch,
  SHEET_SIZE,
  withTimeout,
  type LeadContext,
  type SceneBrief,
} from "@/lib/leadCharacter";
import { caseStudySectionsAsChunks, flattenCaseStudySections } from "@/lib/caseStudySections";
import type { Chunk } from "@/lib/types";
import { DOMAIN_AVATAR_PREFIX } from "@/lib/domainAvatars";
import { backupAfterUpload } from "@/lib/backupAfterUpload";
import { withRetry } from "@/lib/concurrency";
import { SCENE_IMAGES_BUCKET } from "@/lib/storageUrls";
import {
  imageProviderLabel,
  isNotMigratedError,
  loadChapterImageRows,
  loadProjectDomainFields,
  mimeForPath,
  PENDING_STALE_MS,
  runWithinBudget,
  sceneImagePath,
  selectSceneTargets,
  type ChapterImageStatus,
} from "@/lib/sceneImages";

// Vercel caps a function at 300 s. Each chapter is saved as it finishes, and
// the loop stops early (see BUDGET_MS) so the client can call again until
// `remaining` is 0.
export const maxDuration = 300;

/** Stop starting new chapters once the slowest one so far would not fit in this budget. */
const BUDGET_MS = 235_000;
/** One image taking longer than this is marked failed so it cannot eat the whole budget. */
const IMAGE_TIMEOUT_MS = 150_000;
/** The scene director (text model) is a short call; it must not eat the image's budget. */
const DIRECTOR_TIMEOUT_MS = 45_000;

interface Body {
  onlyMissing?: boolean;
  retryFailed?: boolean;
  chunkId?: string;
  /** "lead": Showcase lead-character scenes (the default when the template is showcase). "avatar": domain-avatar scenes. */
  mode?: "avatar" | "lead";
}

function errorJson(error: string, code: string, status: number) {
  return Response.json({ error, code }, { status });
}

function messageOf(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).slice(0, 500);
}

type Supa = ReturnType<typeof getSupabase>;

/**
 * Claims a chapter: inserts a 'pending' row, or flips an existing non-pending (or
 * stale pending) row to pending. false when another run holds a fresh claim.
 */
async function claimChapter(supabase: Supa, id: string, provider: string, chunkId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const base = { project_id: id, chunk_id: chunkId, status: "pending", error: null, provider, updated_at: now };
  const { error: insertError } = await supabase.from("chapter_images").insert(base);
  if (!insertError) return true;
  if (insertError.code !== "23505") throw new Error(insertError.message);
  const stale = new Date(Date.now() - PENDING_STALE_MS).toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("chapter_images")
    .update({ status: "pending", error: null, provider, updated_at: now })
    .eq("project_id", id)
    .eq("chunk_id", chunkId)
    .or(`status.neq.pending,updated_at.lt.${stale}`)
    .select("chunk_id");
  if (updateError) throw new Error(updateError.message);
  return (updated?.length ?? 0) > 0;
}

async function finishChapter(supabase: Supa, id: string, chunkId: string, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from("chapter_images")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("project_id", id)
    .eq("chunk_id", chunkId);
  if (error) console.error(`generate-scene-images: saving ${chunkId} failed:`, error.message);
}

/** Uploads a generated image to scene-images/<projectId>/<chunkId>.<ext>; returns the storage path. */
async function uploadAndBackup(supabase: Supa, id: string, chunkId: string, image: { mimeType: string; data: Buffer }): Promise<string> {
  const path = sceneImagePath(id, chunkId, image.mimeType);
  await withRetry(async () => {
    const { error: uploadError } = await supabase.storage
      .from(SCENE_IMAGES_BUCKET)
      .upload(path, image.data, { contentType: image.mimeType, upsert: true });
    if (uploadError) throw new Error(`Storage upload failed for ${chunkId}: ${uploadError.message}`);
  });
  return path;
}

function startBackup(id: string, chunkId: string, path: string, contentType: string) {
  backupAfterUpload({
    bucket: SCENE_IMAGES_BUCKET,
    path,
    folder: id,
    fileName: path.split("/").pop() ?? `${chunkId}.png`,
    contentType,
    record: { table: "chapter_images", match: { project_id: id, chunk_id: chunkId } },
  });
}

type Project = ReturnType<typeof rowToProject>;

/**
 * Lead mode: one fixed character is the lead of every chapter's scene. Per chapter, in order:
 * scene director (text, Gemini) -> image prompt from the stored prompts -> image generation with
 * [character, logo?] references. The director's brief is saved in chapter_images.prompt_used
 * (JSON, see leadCharacter.ts) so the next chapter gets it as {{previous_scene}}.
 */
async function generateLeadScenes(args: {
  request: Request;
  user: AppUser | null;
  project: Project;
  /** The scenes to draw, in order: the project's chunks, or a case study's sections (ids `case-study-<key>`). */
  chunks: Chunk[];
  body: Body;
}): Promise<Response> {
  const { request, user, project, chunks, body } = args;
  const id = project.id;
  const supabase = getSupabase();
  try {
    const fields = await loadProjectDomainFields(id);
    const domain = fields.domainId ? await getDomain(fields.domainId) : null;
    if (fields.domainId && !domain) return errorJson("This project's domain could not be found.", "unknown_domain", 400);

    const rows = await loadChapterImageRows(id);
    const { targets, inProgress } = selectSceneTargets(chunks, rows, body);
    if (targets.length === 0) {
      return Response.json({ results: [], remaining: 0, ...(inProgress.length > 0 ? { inProgress: inProgress.length } : {}) });
    }

    // The logo is only used when the domain says where it goes.
    const wantsLogo = Boolean(fields.logoPath && domain?.logoPlacement?.trim());
    const logo = wantsLogo ? await loadLogoReference(fields.logoPath) : null;
    const prompts = await loadLeadPrompts({ needsLogoInstruction: Boolean(logo), needsDefaultOutfit: !domain?.outfitDescription?.trim() });

    // Key problems surface before any work (412 with code 'missing_api_key').
    const generator: ImageGenerator = await getImageGeneratorFor(user);
    const textGenerate = createGeminiTextGenerate(await getGeminiKeyFor(user));
    const character = await loadCharacterReference(assetBaseUrl(new URL(request.url).origin));
    const provider = await imageProviderLabel(user);

    const ctx: LeadContext = {
      storyTitle: project.title,
      domain,
      prompts,
      hasLogo: Boolean(logo),
      chapterTotal: chunks.length,
    };
    const references = logo && logoSendable(ctx) ? [character, logo] : [character];

    // Saved briefs by chapter: seeded from the database, updated as this run writes new ones.
    const briefs = new Map<string, SceneBrief>();
    for (const row of rows) {
      const brief = decodeBrief(row.prompt_used);
      if (brief) briefs.set(row.chunk_id, brief);
    }

    // Contact sheets: every full group of four targets is ONE image cropped into four (the free Cloudflare
    // allowance and one consistent style). A leftover group of 1-3 and any explicit single regenerate use the
    // single-image path. Without the sheet prompts (migration 005 not applied) everything stays single.
    const batches = body.chunkId ? targets.map((chunk) => [chunk]) : batchTargets(targets, SHEET_SIZE);
    const wantsSheets = batches.some((batch) => batch.length === SHEET_SIZE);
    const sheetPrompts = wantsSheets ? await loadSheetPrompts({ needsLogo: Boolean(logo) && logoSendable(ctx) }) : null;
    if (wantsSheets && !sheetPrompts) {
      console.warn("generate-scene-images (lead): sheet prompts (migration 005) are missing, drawing one image per chapter.");
    }
    if (sheetPrompts) ctx.sheetOutfit = await loadSheetOutfit(fields.domainId);

    const claim = (chunkId: string) => claimChapter(supabase, id, provider, chunkId);
    const finish = (chunkId: string, patch: Record<string, unknown>) => finishChapter(supabase, id, chunkId, patch);
    const skipped: string[] = [];
    let sheets = 0;
    let lowConfidenceSheets = 0;

    /** One image for one chapter. `claimed`: the row is already pending (claimed by a batch that fell back). */
    const runSingle = async (chunk: Chunk, claimed: boolean): Promise<{ chunkId: string; status: ChapterImageStatus }> => {
      if (!claimed && !(await claim(chunk.id))) {
        skipped.push(chunk.id);
        return { chunkId: chunk.id, status: "pending" };
      }
      const index = chunks.findIndex((c) => c.id === chunk.id);
      let brief: SceneBrief | undefined;
      let prompt: string | undefined;
      try {
        // A chapter retried after a failure keeps its saved brief; an explicit regenerate asks the director again.
        brief = body.chunkId ? undefined : briefs.get(chunk.id);
        if (!brief) {
          const previousScene = index > 0 ? (briefs.get(chunks[index - 1].id)?.scene ?? "") : "";
          brief = await withTimeout(
            directScene(textGenerate, buildDirectorPrompt(ctx, chunk, index, previousScene)),
            DIRECTOR_TIMEOUT_MS,
            "Scene director"
          );
          briefs.set(chunk.id, brief);
        }
        prompt = buildImagePrompt(ctx, brief, index);
        const image = await withTimeout(
          generator.generate({ prompt, referenceImages: references, aspect: "16:9" }),
          IMAGE_TIMEOUT_MS,
          "Image generation"
        );
        const path = await uploadAndBackup(supabase, id, chunk.id, image);
        await finish(chunk.id, {
          status: "ready",
          image_path: path,
          prompt_used: encodeBrief(brief, prompt),
          provider,
          error: null,
        });
        startBackup(id, chunk.id, path, image.mimeType);
        return { chunkId: chunk.id, status: "ready" };
      } catch (error) {
        console.error(`generate-scene-images (lead): chapter ${chunk.id} failed:`, error);
        // The brief is kept (when there is one) so a retry does not change the story of the sequence.
        await finish(chunk.id, {
          status: "failed",
          ...(brief && prompt ? { prompt_used: encodeBrief(brief, prompt) } : {}),
          provider,
          error: messageOf(error),
        });
        return { chunkId: chunk.id, status: "failed" };
      }
    };

    const { results: unitResults } = await runWithinBudget(
      batches,
      async (batch): Promise<{ chunkId: string; status: ChapterImageStatus }[]> => {
        if (!sheetPrompts || batch.length !== SHEET_SIZE) {
          const out = [];
          for (const chunk of batch) out.push(await runSingle(chunk, false));
          return out;
        }
        const outcome = await runSheetBatch({
          ctx,
          sheetPrompts,
          chunks,
          batch,
          briefs,
          textGenerate,
          generator,
          references,
          provider,
          claim,
          finish,
          upload: (chunkId, image) => uploadAndBackup(supabase, id, chunkId, image),
          afterUpload: (chunkId, path, mimeType) => startBackup(id, chunkId, path, mimeType),
          directorTimeoutMs: DIRECTOR_TIMEOUT_MS,
          imageTimeoutMs: IMAGE_TIMEOUT_MS,
        });
        skipped.push(...outcome.skipped);
        const out = [...outcome.results];
        if (outcome.confidence) {
          sheets++;
          if (outcome.confidence === "low") lowConfidenceSheets++;
        }
        // Director failed or a chapter was claimed elsewhere: the chapters we hold are drawn one by one.
        for (const chunk of outcome.fallback ?? []) out.push(await runSingle(chunk, true));
        return out;
      },
      { budgetMs: BUDGET_MS }
    );
    const results = unitResults.flat();
    const remaining = batches.slice(unitResults.length).reduce((sum, batch) => sum + batch.length, 0);

    const reported = results.filter((result) => !skipped.includes(result.chunkId));
    await logActivity(user, id, body.chunkId ? "image.regenerated" : "images.generated", {
      chunkId: body.chunkId,
      mode: "lead",
      sheets,
      lowConfidenceSheets,
      requested: targets.length,
      ready: reported.filter((r) => r.status === "ready").length,
      failed: reported.filter((r) => r.status === "failed").length,
    });
    const busy = inProgress.length + skipped.length;
    return Response.json({ results: reported, remaining, ...(busy > 0 ? { inProgress: busy } : {}) });
  } catch (error) {
    if (error instanceof LeadSetupError) return errorJson(error.message, error.code, error.status);
    throw error;
  }
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

  try {
    const { id } = await context.params;
    const raw = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const body: Body = {
      onlyMissing: raw.onlyMissing === true,
      retryFailed: raw.retryFailed === true,
      chunkId: typeof raw.chunkId === "string" && raw.chunkId ? raw.chunkId : undefined,
      mode: raw.mode === "lead" || raw.mode === "avatar" ? raw.mode : undefined,
    };

    const supabase = getSupabase();
    let fetchQuery = supabase.from("projects").select(PROJECT_SELECT_COLUMNS).eq("id", id);
    if (user) fetchQuery = fetchQuery.eq("owner_id", user.id);
    const { data: existing, error: fetchError } = await fetchQuery.maybeSingle();
    if (fetchError) throw new Error(fetchError.message);
    if (!existing) return errorJson("Project not found.", "not_found", 404);
    const project = rowToProject(existing as unknown as ProjectRow);

    // Showcase uses the fixed lead character; every other template keeps the domain-avatar flow.
    const leadMode = body.mode ? body.mode === "lead" : project.selectedTemplateId === "showcase";

    // A case study is shown section by section, so lead scenes are drawn per section under the
    // same ids the page uses (`case-study-<key>`), not per project chunk.
    const caseStudyScenes = leadMode && project.documentType === "case-study";
    if (caseStudyScenes && !project.caseStudyBinding?.slots) {
      return errorJson("Generate the case study layout first: scene images are drawn per section.", "no_layout", 400);
    }
    const sceneChunks = caseStudyScenes
      ? caseStudySectionsAsChunks(flattenCaseStudySections(project.caseStudyBinding?.slots ?? null), undefined)
      : project.chunks;

    if (body.chunkId && !sceneChunks.some((chunk) => chunk.id === body.chunkId)) {
      return errorJson("That chapter does not exist.", "unknown_chunk", 400);
    }

    if (leadMode) {
      return await generateLeadScenes({ request, user, project, chunks: sceneChunks, body });
    }

    // Which domain avatar was chosen: the 'domain:<id>' entry in selectedAvatarIds, else projects.domain_avatar_id.
    const fields = await loadProjectDomainFields(id);
    const fromSelection = (project.selectedAvatarIds ?? [])
      .find((avatarId) => avatarId.startsWith(DOMAIN_AVATAR_PREFIX))
      ?.slice(DOMAIN_AVATAR_PREFIX.length);
    const avatarId = fromSelection || fields.domainAvatarId;
    if (!avatarId) {
      return errorJson("Choose a domain avatar first: scene images are drawn with it as the reference.", "no_domain_avatar", 400);
    }

    const { data: avatarRow, error: avatarError } = await supabase
      .from("domain_avatars")
      .select("id, domain_id, gender, image_path, status")
      .eq("id", avatarId)
      .maybeSingle();
    if (avatarError) {
      if (isNotMigratedError(avatarError)) {
        return errorJson("Scene images need the domains migration (003), which has not been applied yet.", "not_migrated", 400);
      }
      throw new Error(avatarError.message);
    }
    const avatar = avatarRow as { id: string; domain_id: string; gender: string; image_path: string | null; status: string } | null;
    if (!avatar || avatar.status !== "ready" || !avatar.image_path) {
      return errorJson("The chosen domain avatar has no image yet. Pick it again once it has been generated.", "avatar_not_ready", 400);
    }

    const domain = await getDomain(fields.domainId ?? avatar.domain_id);
    if (!domain) return errorJson("This project's domain could not be found.", "unknown_domain", 400);

    const promptTemplate = await getPrompt("chapter_scene");
    if (!promptTemplate) {
      return errorJson("The chapter scene prompt is not set up in the database, so scene images are unavailable.", "no_prompt", 400);
    }

    const rows = await loadChapterImageRows(id);
    const { targets, inProgress } = selectSceneTargets(project.chunks, rows, body);
    if (targets.length === 0) {
      return Response.json({ results: [], remaining: 0, ...(inProgress.length > 0 ? { inProgress: inProgress.length } : {}) });
    }

    // Key problems surface before any work (412 with code 'missing_api_key').
    const generator = await getImageGeneratorFor(user);

    // The avatar image is the reference that keeps the character the same in every scene.
    const { data: avatarBlob, error: downloadError } = await supabase.storage
      .from(SCENE_IMAGES_BUCKET)
      .download(avatar.image_path);
    if (downloadError || !avatarBlob) {
      return errorJson(`The avatar image could not be loaded: ${downloadError?.message ?? "no data"}.`, "avatar_unreadable", 500);
    }
    const referenceImage = {
      mimeType: avatarBlob.type && avatarBlob.type.startsWith("image/") ? avatarBlob.type : mimeForPath(avatar.image_path),
      data: Buffer.from(await avatarBlob.arrayBuffer()),
    };
    const avatarDescription = `the ${avatar.gender} ${domain.name} character shown in the reference image`;
    const provider = await imageProviderLabel(user);

    const claim = (chunkId: string) => claimChapter(supabase, id, provider, chunkId);
    const finish = (chunkId: string, patch: Record<string, unknown>) => finishChapter(supabase, id, chunkId, patch);

    const skipped: string[] = [];
    const { results, remaining } = await runWithinBudget(
      targets,
      async (chunk): Promise<{ chunkId: string; status: ChapterImageStatus }> => {
        if (!(await claim(chunk.id))) {
          skipped.push(chunk.id);
          return { chunkId: chunk.id, status: "pending" };
        }
        const prompt = fillPrompt(promptTemplate, {
          domain_name: domain.name,
          outfit_description: domain.outfitDescription,
          avatar_description: avatarDescription,
          chapter_title: chunk.title,
          chapter_text: chunk.narrativeText,
          story_title: project.title,
        });
        try {
          const image = await withTimeout(
            generator.generate({ prompt, referenceImage, aspect: "16:9" }),
            IMAGE_TIMEOUT_MS,
            "Image generation"
          );
          const path = await uploadAndBackup(supabase, id, chunk.id, image);
          await finish(chunk.id, { status: "ready", image_path: path, prompt_used: prompt, provider, error: null });
          startBackup(id, chunk.id, path, image.mimeType);
          return { chunkId: chunk.id, status: "ready" };
        } catch (error) {
          // The chapter keeps no image (templates fall back to the avatar) and can be retried.
          console.error(`generate-scene-images: chapter ${chunk.id} failed:`, error);
          await finish(chunk.id, { status: "failed", prompt_used: prompt, provider, error: messageOf(error) });
          return { chunkId: chunk.id, status: "failed" };
        }
      },
      { budgetMs: BUDGET_MS }
    );

    // Chapters another run was already generating are not ours to wait for.
    const reported = results.filter((result) => !skipped.includes(result.chunkId));
    await logActivity(user, id, body.chunkId ? "image.regenerated" : "images.generated", {
      chunkId: body.chunkId,
      requested: targets.length,
      ready: reported.filter((r) => r.status === "ready").length,
      failed: reported.filter((r) => r.status === "failed").length,
    });
    const busy = inProgress.length + skipped.length;
    return Response.json({ results: reported, remaining, ...(busy > 0 ? { inProgress: busy } : {}) });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    const missingKey = missingApiKeyResponse(error);
    if (missingKey) return missingKey;
    if (isNotMigratedError(error as { message?: string })) {
      return errorJson("Scene images need the domains migration (003), which has not been applied yet.", "not_migrated", 400);
    }
    console.error("generate scene images failed:", error);
    return errorJson(error instanceof Error ? error.message : "Unexpected error", "failed", 500);
  }
}
