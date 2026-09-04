import { NextResponse } from "next/server";
import { rm } from "node:fs/promises";
import path from "node:path";
import { getSupabase } from "@/lib/db";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectRow } from "@/lib/projects";
import type { Chunk } from "@/lib/types";

const AUDIO_BUCKET = "chunk-audio";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { data, error } = await getSupabase()
      .from("projects")
      .select(PROJECT_SELECT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ project: rowToProject(data as unknown as ProjectRow) });
  } catch (error) {
    console.error("get project failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

interface UpdateChunksBody {
  chunks: Chunk[];
}

function isUpdateChunksBody(value: unknown): value is UpdateChunksBody {
  if (!value || typeof value !== "object") return false;
  return Array.isArray((value as Record<string, unknown>).chunks);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!isUpdateChunksBody(body)) {
      return NextResponse.json({ error: "Body must include 'chunks'." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: existing, error: fetchError } = await supabase
      .from("projects")
      .select(PROJECT_SELECT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const existingProject = rowToProject(existing as unknown as ProjectRow);
    const previousChunks = existingProject.chunks;
    let anyTextChanged = false;

    // Only chunks whose text actually changed get marked edited / lose their now-stale
    // audio — saving the form shouldn't silently flag every untouched chunk as edited.
    const nextChunks = body.chunks.map((chunk) => {
      const previous = previousChunks.find((p) => p.id === chunk.id);
      const textChanged =
        previous && (previous.title !== chunk.title || previous.narrativeText !== chunk.narrativeText);
      if (textChanged) anyTextChanged = true;
      return {
        ...chunk,
        userEdited: textChanged ? true : previous?.userEdited ?? false,
        audioUrl: textChanged ? undefined : chunk.audioUrl,
      };
    });

    // The layout binding was fitted to the storyline as it read before this edit —
    // once any chunk's text changes, that binding no longer reflects the current
    // story and must be re-run rather than shown as if still valid.
    const nextCaseStudyBinding = anyTextChanged ? null : existingProject.caseStudyBinding ?? null;

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update({
        payload: { chunks: nextChunks, caseStudyBinding: nextCaseStudyBinding },
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(PROJECT_SELECT_COLUMNS)
      .single();

    if (updateError) throw new Error(updateError.message);
    return NextResponse.json({ project: rowToProject(updated as unknown as ProjectRow) });
  } catch (error) {
    console.error("update project failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = getSupabase();

    // Best-effort cleanup of chunk audio files — don't let a storage hiccup block deletion.
    try {
      const { data: files } = await supabase.storage.from(AUDIO_BUCKET).list(id);
      if (files && files.length > 0) {
        await supabase.storage.from(AUDIO_BUCKET).remove(files.map((f) => `${id}/${f.name}`));
      }
    } catch (storageError) {
      console.error("audio cleanup failed (continuing with delete):", storageError);
    }

    // Best-effort cleanup of localhost-published files, if any exist.
    try {
      await rm(path.join(process.cwd(), "public", "published", id), { recursive: true, force: true });
    } catch (fsError) {
      console.error("published files cleanup failed (continuing with delete):", fsError);
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("delete project failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
