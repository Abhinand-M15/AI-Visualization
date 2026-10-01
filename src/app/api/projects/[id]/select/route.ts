import { NextResponse } from "next/server";
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
import { AVATARS } from "@/lib/avatars";
import { getTemplateById } from "@/lib/templates";
import type { CaseStudyBinding, Chunk } from "@/lib/types";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";

interface SelectBody {
  selectedAvatarIds?: string[];
  selectedTemplateId?: string;
  /** Narration voice; audio in another voice then counts as outdated (see contentVersion.ts). */
  selectedVoice?: string;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = ((await request.json().catch(() => null)) ?? {}) as SelectBody;

    // Validated against the registries, so nothing unknown reaches the published site.
    if (
      body.selectedAvatarIds !== undefined &&
      (!Array.isArray(body.selectedAvatarIds) ||
        !body.selectedAvatarIds.every((avatarId) => AVATARS.some((avatar) => avatar.id === avatarId)))
    ) {
      return NextResponse.json({ error: "Unknown avatar." }, { status: 400 });
    }
    if (body.selectedTemplateId !== undefined && !getTemplateById(String(body.selectedTemplateId))) {
      return NextResponse.json({ error: "Unknown template." }, { status: 400 });
    }
    if (
      body.selectedVoice !== undefined &&
      (typeof body.selectedVoice !== "string" || !body.selectedVoice.trim() || body.selectedVoice.length > 200)
    ) {
      return NextResponse.json({ error: "Invalid voice." }, { status: 400 });
    }

    const supabase = getSupabase();
    let fetchQuery = supabase.from("projects").select(PROJECT_SELECT_COLUMNS).eq("id", id);
    if (user) fetchQuery = fetchQuery.eq("owner_id", user.id);
    const { data: existing, error: fetchError } = await fetchQuery.maybeSingle();
    if (fetchError) throw new Error(fetchError.message);
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    const project = rowToProject(existing as unknown as ProjectRow);

    const update: Record<string, unknown> = { updated_at: new Date().toISOString(), ...updatedByFields(user) };
    if (body.selectedAvatarIds) update.selected_avatar_ids = body.selectedAvatarIds;
    if (body.selectedTemplateId) update.selected_template_id = body.selectedTemplateId;
    if (body.selectedVoice) update.selected_voice = body.selectedVoice;

    // Audio made before voices were tracked has no audioVoice. When the voice
    // changes, record the previous voice on it, so that audio now shows as
    // outdated and publishing regenerates it in the new voice.
    let chunks: Chunk[] = project.chunks;
    let binding: CaseStudyBinding | null = project.caseStudyBinding ?? null;
    const previousVoice = project.selectedVoice;
    if (body.selectedVoice && previousVoice && body.selectedVoice !== previousVoice) {
      chunks = chunks.map((chunk) =>
        chunk.audioUrl && !chunk.audioVoice ? { ...chunk, audioVoice: previousVoice } : chunk
      );
      if (binding?.sectionAudio) {
        const sectionAudioVoice = { ...binding.sectionAudioVoice };
        for (const key of Object.keys(binding.sectionAudio)) sectionAudioVoice[key] ??= previousVoice;
        binding = { ...binding, sectionAudioVoice };
      }
    }
    update.payload = buildPayload(project, { chunks, caseStudyBinding: binding });

    let query = supabase.from("projects").update(update).eq("id", id);
    if (user) query = query.eq("owner_id", user.id);
    const { data, error } = await query.select(projectListColumns(Boolean(user))).maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    await logActivity(user, id, "project.selection_updated", {
      selectedAvatarIds: body.selectedAvatarIds,
      selectedTemplateId: body.selectedTemplateId,
      selectedVoice: body.selectedVoice,
    });
    return NextResponse.json({ project: rowToProjectSummary(data as unknown as ProjectSummaryRow) });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("update selection failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
