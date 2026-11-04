import { NextResponse } from "next/server";
import { rm } from "node:fs/promises";
import path from "node:path";
import { getSupabase } from "@/lib/db";
import {
  buildPayload,
  isMissingSchemaError,
  PROJECT_SELECT_COLUMNS,
  projectListColumns,
  rowToProject,
  rowToProjectSummary,
  updatedByFields,
  type ProjectRow,
  type ProjectSummaryRow,
} from "@/lib/projects";
import type { CaseStudyBinding } from "@/lib/types";
import { applyCaseStudySectionEdits, type CaseStudySectionEdit } from "@/lib/caseStudySections";
import { mergeChunks } from "@/lib/chunkMerge";
import { requireUser, type AppUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { pathBelongsTo } from "@/app/api/logos/server";
import { LOGO_BUCKET } from "@/app/api/logos/shared";
import { applyChapterImages, buildSectionImages, loadChapterImageRows, loadProjectDomainFields, logoUrlFor } from "@/lib/sceneImages";
import { SCENE_IMAGES_BUCKET } from "@/lib/storageUrls";
import { DOCUMENTS_BUCKET } from "@/app/api/uploads/shared";
import { MAX_CHUNK_TEXT_LENGTH, MAX_CHUNK_TITLE_LENGTH, cleanStoryTitle, validateClientChunks } from "@/lib/server/chunks";
import { chunkAudioPath, isSafeSegment, isValidProjectId, storagePathOrNull } from "@/lib/server/ids";
import { verifyLogoObject } from "@/lib/server/logos";
import { apiErrorResponse, HttpError } from "@/lib/server/errors";
import { siteNamesOfProject } from "@/lib/server/siteNames";
import { deleteVercelProject, publishTokenConfigured } from "@/lib/publish/vercel";
import { getPublishNamePrefix, siteLabel } from "@/lib/subdomain";

const AUDIO_BUCKET = "chunk-audio";
const VIDEO_BUCKET = "chunk-video";
const MAX_TITLE_LENGTH = MAX_CHUNK_TITLE_LENGTH;
const MAX_TEXT_LENGTH = MAX_CHUNK_TEXT_LENGTH;

function notFoundResponse() {
  return NextResponse.json({ error: "Project not found.", code: "not_found" }, { status: 404 });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    if (!isValidProjectId(id)) return notFoundResponse();
    // Same columns as the list, so the page also gets updated_at (and published_at with accounts on).
    let query = getSupabase().from("projects").select(projectListColumns(Boolean(user))).eq("id", id);
    if (user) query = query.eq("owner_id", user.id);
    const { data, error } = await query.maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return notFoundResponse();
    const project = rowToProjectSummary(data as unknown as ProjectSummaryRow);
    // Domain, logo and scene images (migration 003). Each lookup yields nothing when
    // not migrated, so a project without any of it is returned exactly as before.
    const [fields, imageRows] = await Promise.all([loadProjectDomainFields(id), loadChapterImageRows(id)]);
    const logoUrl = logoUrlFor(fields.logoPath);
    // Case studies are shown section by section: their scene images are keyed by section.
    const sectionImages = project.documentType === "case-study" ? buildSectionImages(imageRows) : undefined;
    return NextResponse.json({
      project: {
        ...project,
        chunks: applyChapterImages(project.chunks, imageRows),
        ...(fields.domainId ? { domainId: fields.domainId } : {}),
        ...(fields.domainAvatarId ? { domainAvatarId: fields.domainAvatarId } : {}),
        ...(logoUrl ? { logoUrl } : {}),
        ...(sectionImages ? { sectionImages } : {}),
      },
    });
  } catch (error) {
    return apiErrorResponse(error, "get project");
  }
}

/**
 * Any combination of:
 *  - chunks: the full, ordered chapter list (edited text, reordered, added, removed).
 *  - title: the story/site title.
 *  - sectionEdits: text edits of bound case-study sections, by section key.
 */
interface UpdateBody {
  chunks?: unknown[];
  title?: string;
  sectionEdits?: CaseStudySectionEdit[];
  /** Company logo: a path in the company-logos bucket, or null to remove it. */
  logoPath?: string | null;
}

function parseUpdateBody(value: unknown): { ok: true; body: UpdateBody } | { ok: false; error: string } {
  if (!value || typeof value !== "object") return { ok: false, error: "Invalid body." };
  const raw = value as Record<string, unknown>;
  const body: UpdateBody = {};
  if (raw.chunks !== undefined) {
    // One validation layer for client chunks (SEC-03/04/21): story fields only, safe ids, length caps.
    const validated = validateClientChunks(raw.chunks, { allowEmpty: true });
    if (!validated.ok) return validated;
    body.chunks = validated.chunks;
  }
  if (raw.title !== undefined) {
    const title = cleanStoryTitle(raw.title);
    if (!title) return { ok: false, error: `The title must be 1 to ${MAX_TITLE_LENGTH} characters.` };
    body.title = title;
  }
  if (raw.sectionEdits !== undefined) {
    if (!Array.isArray(raw.sectionEdits) || raw.sectionEdits.length > 200) return { ok: false, error: "'sectionEdits' must be an array." };
    const edits: CaseStudySectionEdit[] = [];
    for (const entry of raw.sectionEdits) {
      const e = entry as Record<string, unknown> | null;
      if (!e || typeof e.key !== "string" || !/^[a-z0-9-]{1,64}$/.test(e.key)) return { ok: false, error: "Every section edit needs a key." };
      if (e.body !== undefined && (typeof e.body !== "string" || e.body.length > MAX_TEXT_LENGTH)) {
        return { ok: false, error: "A section's text is invalid or too long." };
      }
      if (e.title !== undefined && (typeof e.title !== "string" || e.title.length > MAX_TITLE_LENGTH)) {
        return { ok: false, error: "A section's title is invalid or too long." };
      }
      edits.push({ key: e.key, title: e.title as string | undefined, body: e.body as string | undefined });
    }
    body.sectionEdits = edits;
  }
  if (raw.logoPath !== undefined) {
    if (raw.logoPath !== null && typeof raw.logoPath !== "string") {
      return { ok: false, error: "'logoPath' must be a string or null." };
    }
    body.logoPath = raw.logoPath;
  }
  if (
    body.chunks === undefined &&
    body.title === undefined &&
    body.sectionEdits === undefined &&
    body.logoPath === undefined
  ) {
    return { ok: false, error: "Body must include 'chunks', 'title', 'sectionEdits' or 'logoPath'." };
  }
  return { ok: true, body };
}


export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    if (!isValidProjectId(id)) return notFoundResponse();
    const parsed = parseUpdateBody(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error, code: "bad_request" }, { status: 400 });
    }
    const body = parsed.body;

    // The logo may only point into the caller's own folder of the logos bucket.
    if (typeof body.logoPath === "string" && !pathBelongsTo(user, body.logoPath)) {
      return NextResponse.json({ error: "Invalid 'logoPath'.", code: "bad_request" }, { status: 400 });
    }

    const supabase = getSupabase();
    let fetchQuery = supabase.from("projects").select(PROJECT_SELECT_COLUMNS).eq("id", id);
    if (user) fetchQuery = fetchQuery.eq("owner_id", user.id);
    const { data: existing, error: fetchError } = await fetchQuery.maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) return notFoundResponse();

    const existingProject = rowToProject(existing as unknown as ProjectRow);

    // A logo is attached only after the server has verified (sanitised) the stored object
    // itself (SEC-07); skipping /api/logos/sanitize gains nothing.
    if (typeof body.logoPath === "string") {
      const verified = await verifyLogoObject(body.logoPath);
      if (!verified.ok) {
        throw new HttpError(verified.status === 503 ? 503 : 422, verified.status === 503 ? "not_configured" : "bad_request", verified.error);
      }
    }
    const now = new Date().toISOString();

    // Chapters. Only chunks whose text actually changed get marked edited or
    // lose their now-stale audio.
    const merged = body.chunks ? mergeChunks(body.chunks, existingProject.chunks) : null;
    const nextChunks = merged?.chunks ?? existingProject.chunks;
    const chunksChanged = Boolean(merged && (merged.textChanged || merged.structureChanged));

    // Case-study layout. It was fitted to the chapters as they read when it was
    // generated; a chapter edit no longer wipes it (that lost every section edit
    // and all section narration), it is marked as behind the chapters instead,
    // and the project page offers "Regenerate layout".
    let nextBinding: CaseStudyBinding | null = existingProject.caseStudyBinding ?? null;
    if (nextBinding && chunksChanged) nextBinding = { ...nextBinding, chunksChangedAt: now };

    let sectionsEdited: string[] = [];
    if (body.sectionEdits && body.sectionEdits.length > 0) {
      if (!nextBinding?.slots) {
        return NextResponse.json({ error: "This project has no case study layout to edit.", code: "bad_request" }, { status: 400 });
      }
      const applied = applyCaseStudySectionEdits(nextBinding.slots, body.sectionEdits);
      sectionsEdited = applied.changedKeys;
      if (applied.changedKeys.length > 0) {
        const sectionAudio = { ...nextBinding.sectionAudio };
        const sectionAudioVoice = { ...nextBinding.sectionAudioVoice };
        const sectionVideo = { ...nextBinding.sectionVideo };
        const outdated = new Set(nextBinding.outdatedSections ?? []);
        // Narration (and the lip-synced video made from it) is tied to the body text.
        for (const key of applied.bodyChangedKeys) {
          if (sectionAudio[key] || outdated.has(key)) outdated.add(key);
          delete sectionAudio[key];
          delete sectionAudioVoice[key];
          delete sectionVideo[key];
        }
        nextBinding = {
          ...nextBinding,
          slots: applied.slots,
          sectionAudio,
          sectionAudioVoice,
          sectionVideo,
          outdatedSections: [...outdated],
        };
      }
    }

    const titleChanged = body.title !== undefined && body.title !== existingProject.title;

    let updateQuery = supabase
      .from("projects")
      .update({
        payload: buildPayload(existingProject, { chunks: nextChunks, caseStudyBinding: nextBinding }),
        ...(titleChanged ? { title: body.title } : {}),
        updated_at: now,
        ...updatedByFields(user),
      })
      .eq("id", id);
    if (user) updateQuery = updateQuery.eq("owner_id", user.id);
    const { data: updated, error: updateError } = await updateQuery
      .select(projectListColumns(Boolean(user)))
      .single();

    if (updateError) throw new Error(updateError.message);

    // Company logo (column exists once migration 003 is applied).
    let logoPathNow: string | undefined;
    if (body.logoPath !== undefined) {
      let logoQuery = supabase.from("projects").update({ logo_path: body.logoPath }).eq("id", id);
      if (user) logoQuery = logoQuery.eq("owner_id", user.id);
      const { error: logoError } = await logoQuery;
      if (logoError) {
        if (isMissingSchemaError(logoError)) {
          return NextResponse.json({ error: "Company logos aren't available yet.", code: "not_configured" }, { status: 503 });
        }
        throw new Error(logoError.message);
      }
      logoPathNow = body.logoPath ?? undefined;
      await logActivity(user, id, "logo.updated", { removed: body.logoPath === null });
    }

    // Best-effort: remove narration files of deleted chapters.
    const orphaned = (merged?.removed ?? [])
      .filter((chunk) => chunk.audioUrl)
      .map((chunk) => {
        try {
          return chunkAudioPath(id, chunk.id);
        } catch {
          return null;
        }
      })
      .filter((p): p is string => Boolean(p));
    if (orphaned.length > 0) {
      const { error: removeError } = await supabase.storage.from(AUDIO_BUCKET).remove(orphaned);
      if (removeError) console.error("removing deleted chapters' audio failed (continuing):", removeError.message);
    }

    await logActivity(user, id, "project.updated", {
      chunkCount: nextChunks.length,
      textChanged: merged?.textChanged ?? false,
      structureChanged: merged?.structureChanged ?? false,
      removedChunks: merged?.removed.length ?? 0,
      sectionsEdited,
      titleChanged,
    });
    return NextResponse.json({
      project: rowToProjectSummary(updated as unknown as ProjectSummaryRow),
      ...(body.logoPath !== undefined ? { logoUrl: logoUrlFor(logoPathNow) ?? null } : {}),
    });
  } catch (error) {
    return apiErrorResponse(error, "update project");
  }
}

/** Every object under `<folder>/` in `bucket`, paged (list() returns at most `limit` per call). */
async function listFolder(supabase: ReturnType<typeof getSupabase>, bucket: string, folder: string): Promise<string[]> {
  const paths: string[] = [];
  const limit = 1000;
  for (let offset = 0; offset < 50_000; offset += limit) {
    const { data, error } = await supabase.storage.from(bucket).list(folder, { limit, offset });
    if (error || !data || data.length === 0) break;
    for (const file of data) {
      const objectPath = isSafeSegment(file.name) ? storagePathOrNull(folder, file.name) : null;
      if (objectPath) paths.push(objectPath);
    }
    if (data.length < limit) break;
  }
  return paths;
}

async function removeAll(supabase: ReturnType<typeof getSupabase>, bucket: string, paths: string[]) {
  for (let i = 0; i < paths.length; i += 500) {
    const { error } = await supabase.storage.from(bucket).remove(paths.slice(i, i + 500));
    if (error) console.error(`${bucket} cleanup failed (continuing with delete):`, error.message);
  }
}

/**
 * Vercel projects this story published to, by name: its recorded addresses (site_names /
 * publications) and the legacy story-<id> name when that is what its URL points at. Only these
 * are ever taken down.
 */
async function publishedSiteNames(id: string, publishedUrl: string | null): Promise<string[]> {
  const prefix = getPublishNamePrefix();
  const names = new Set((await siteNamesOfProject(id)).map((name) => siteLabel(name, prefix)));
  const legacy = `story-${id.replace(/[^a-z0-9]/gi, "").slice(0, 16).toLowerCase()}`;
  if (publishedUrl) {
    try {
      if (new URL(publishedUrl).hostname.startsWith(`${legacy}.`)) names.add(legacy);
    } catch {
      // not a URL
    }
  }
  return [...names];
}

/**
 * DELETE /api/projects/[id]   body (optional): { takeDownSite?: boolean }  (or ?takeDownSite=1)
 * Removes the project, its narration, video, scene images, source documents and (when no other
 * project uses it) its logo. With takeDownSite the Vercel projects this story published are
 * deleted too, so the live site goes offline (UX-18, SEC-18).
 * -> { ok: true, siteTakenDown: boolean | null }  (null: not requested or nothing published)
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    if (!isValidProjectId(id)) return notFoundResponse();
    const supabase = getSupabase();
    const body = (await request.json().catch(() => null)) as { takeDownSite?: unknown } | null;
    const takeDownSite = body?.takeDownSite === true || new URL(request.url).searchParams.get("takeDownSite") === "1";

    // Confirm ownership before touching any files.
    let ownedQuery = supabase.from("projects").select("id, title, published_url").eq("id", id);
    if (user) ownedQuery = ownedQuery.eq("owner_id", user.id);
    const { data: owned, error: ownedError } = await ownedQuery.maybeSingle();
    if (ownedError) throw new Error(ownedError.message);
    if (!owned) return notFoundResponse();
    const publishedUrl = (owned as { published_url: string | null }).published_url;

    // Take the live site down first (while the records that prove ownership still exist).
    let siteTakenDown: boolean | null = null;
    if (takeDownSite && publishTokenConfigured()) {
      const names = await publishedSiteNames(id, publishedUrl);
      if (names.length > 0) {
        siteTakenDown = true;
        for (const name of names) {
          try {
            await deleteVercelProject(name);
          } catch (error) {
            siteTakenDown = false;
            console.error(`taking down ${name} failed:`, error);
          }
        }
      }
    }

    // Best-effort cleanup of stored files: never let a storage hiccup block deletion (AR-14, SEC-18).
    const logoPath = await loadProjectDomainFields(id).then((fields) => fields.logoPath).catch(() => undefined);
    for (const bucket of [AUDIO_BUCKET, VIDEO_BUCKET, SCENE_IMAGES_BUCKET]) {
      try {
        await removeAll(supabase, bucket, await listFolder(supabase, bucket, id));
      } catch (storageError) {
        console.error(`${bucket} cleanup failed (continuing with delete):`, storageError);
      }
    }
    await removeSourceDocuments(supabase, id, user);

    // Best-effort cleanup of localhost-published files, if any exist.
    try {
      await rm(path.join(process.cwd(), "public", "published", id), { recursive: true, force: true });
    } catch (fsError) {
      console.error("published files cleanup failed (continuing with delete):", fsError);
    }

    let deleteQuery = supabase.from("projects").delete().eq("id", id);
    if (user) deleteQuery = deleteQuery.eq("owner_id", user.id);
    const { error } = await deleteQuery;
    if (error) throw new Error(error.message);

    // The logo goes too once no other project points at it.
    if (logoPath) {
      try {
        const { data: refs, error: refError } = await supabase.from("projects").select("id").eq("logo_path", logoPath).limit(1);
        if (!refError && (!refs || refs.length === 0)) await supabase.storage.from(LOGO_BUCKET).remove([logoPath]);
      } catch (logoError) {
        console.error("logo cleanup failed (project deleted):", logoError);
      }
    }

    await logActivity(user, id, "project.deleted", { siteTakenDown });
    return NextResponse.json({ ok: true, siteTakenDown });
  } catch (error) {
    return apiErrorResponse(error, "delete project");
  }
}

/** Deletes the project's uploaded source documents (rows and files). Best-effort. */
async function removeSourceDocuments(supabase: ReturnType<typeof getSupabase>, id: string, user: AppUser | null) {
  try {
    let query = supabase.from("documents").select("id, storage_path").eq("project_id", id);
    if (user) query = query.eq("owner_id", user.id);
    const { data, error } = await query;
    if (error || !data || data.length === 0) return;
    const rows = data as { id: string; storage_path: string }[];
    const paths = rows
      .map((row) => (user && row.storage_path.startsWith(`${user.id}/`) ? storagePathOrNull(...row.storage_path.split("/")) : null))
      .filter((p): p is string => Boolean(p));
    if (paths.length > 0) await removeAll(supabase, DOCUMENTS_BUCKET, paths);
    await supabase.from("documents").delete().in("id", rows.map((row) => row.id));
  } catch (error) {
    console.error("documents cleanup failed (continuing with delete):", error);
  }
}
