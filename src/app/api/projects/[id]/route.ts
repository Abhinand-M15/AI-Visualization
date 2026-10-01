import { NextResponse } from "next/server";
import { rm } from "node:fs/promises";
import path from "node:path";
import { getSupabase } from "@/lib/db";
import {
  buildPayload,
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
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";

const AUDIO_BUCKET = "chunk-audio";
const VIDEO_BUCKET = "chunk-video";
const MAX_TITLE_LENGTH = 200;
const MAX_TEXT_LENGTH = 10000;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    // Same columns as the list, so the page also gets updated_at (and published_at with accounts on).
    let query = getSupabase().from("projects").select(projectListColumns(Boolean(user))).eq("id", id);
    if (user) query = query.eq("owner_id", user.id);
    const { data, error } = await query.maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ project: rowToProjectSummary(data as unknown as ProjectSummaryRow) });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("get project failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
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
}

function parseUpdateBody(value: unknown): { ok: true; body: UpdateBody } | { ok: false; error: string } {
  if (!value || typeof value !== "object") return { ok: false, error: "Invalid body." };
  const raw = value as Record<string, unknown>;
  const body: UpdateBody = {};
  if (raw.chunks !== undefined) {
    if (!Array.isArray(raw.chunks)) return { ok: false, error: "'chunks' must be an array." };
    for (const chunk of raw.chunks) {
      const c = chunk as Record<string, unknown> | null;
      if (!c || typeof c !== "object" || typeof c.title !== "string" || typeof c.narrativeText !== "string") {
        return { ok: false, error: "Every chunk needs a title and narrativeText." };
      }
      if (c.title.length > MAX_TITLE_LENGTH || c.narrativeText.length > MAX_TEXT_LENGTH) {
        return { ok: false, error: "A chunk's title or text is too long." };
      }
    }
    body.chunks = raw.chunks;
  }
  if (raw.title !== undefined) {
    if (typeof raw.title !== "string" || !raw.title.trim() || raw.title.length > MAX_TITLE_LENGTH) {
      return { ok: false, error: `The title must be 1 to ${MAX_TITLE_LENGTH} characters.` };
    }
    body.title = raw.title.trim();
  }
  if (raw.sectionEdits !== undefined) {
    if (!Array.isArray(raw.sectionEdits)) return { ok: false, error: "'sectionEdits' must be an array." };
    const edits: CaseStudySectionEdit[] = [];
    for (const entry of raw.sectionEdits) {
      const e = entry as Record<string, unknown> | null;
      if (!e || typeof e.key !== "string") return { ok: false, error: "Every section edit needs a key." };
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
  if (body.chunks === undefined && body.title === undefined && body.sectionEdits === undefined) {
    return { ok: false, error: "Body must include 'chunks', 'title' or 'sectionEdits'." };
  }
  return { ok: true, body };
}


export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const parsed = parseUpdateBody(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const body = parsed.body;

    const supabase = getSupabase();
    let fetchQuery = supabase.from("projects").select(PROJECT_SELECT_COLUMNS).eq("id", id);
    if (user) fetchQuery = fetchQuery.eq("owner_id", user.id);
    const { data: existing, error: fetchError } = await fetchQuery.maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const existingProject = rowToProject(existing as unknown as ProjectRow);
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
        return NextResponse.json({ error: "This project has no case study layout to edit." }, { status: 400 });
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

    // Best-effort: remove narration files of deleted chapters.
    const orphaned = (merged?.removed ?? []).filter((chunk) => chunk.audioUrl).map((chunk) => `${id}/${chunk.id}.mp3`);
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
    return NextResponse.json({ project: rowToProjectSummary(updated as unknown as ProjectSummaryRow) });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("update project failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const supabase = getSupabase();

    // With accounts on, confirm ownership before touching any files.
    if (user) {
      const { data: owned, error: ownedError } = await supabase
        .from("projects")
        .select("id, title")
        .eq("id", id)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (ownedError) throw new Error(ownedError.message);
      if (!owned) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }
    }

    // Best-effort cleanup of narration audio and lip-synced video files — don't let a storage hiccup block deletion.
    for (const bucket of [AUDIO_BUCKET, VIDEO_BUCKET]) {
      try {
        const { data: files } = await supabase.storage.from(bucket).list(id);
        if (files && files.length > 0) {
          await supabase.storage.from(bucket).remove(files.map((f) => `${id}/${f.name}`));
        }
      } catch (storageError) {
        console.error(`${bucket} cleanup failed (continuing with delete):`, storageError);
      }
    }

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

    await logActivity(user, id, "project.deleted");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("delete project failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
