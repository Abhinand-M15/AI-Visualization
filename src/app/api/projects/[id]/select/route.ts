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
import { TEMPLATE_UNAVAILABLE_MESSAGE, isTemplateAvailable } from "@/lib/templates";
import type { CaseStudyBinding, Chunk } from "@/lib/types";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { DOMAIN_AVATAR_PREFIX } from "@/lib/domainAvatars";
import { isNotMigratedError } from "@/lib/sceneImages";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for a static avatar id or a well-formed 'domain:<uuid>' id (whether it exists is checked by the avatar routes). */
function isSelectableAvatarId(avatarId: unknown): boolean {
  if (typeof avatarId !== "string") return false;
  if (avatarId.startsWith(DOMAIN_AVATAR_PREFIX)) return UUID_PATTERN.test(avatarId.slice(DOMAIN_AVATAR_PREFIX.length));
  return AVATARS.some((avatar) => avatar.id === avatarId);
}

/** Set after the first "column domain_avatar_id is missing" error, so an unmigrated database isn't asked twice. */
let domainAvatarColumnMissing = false;

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
        !body.selectedAvatarIds.every(isSelectableAvatarId))
    ) {
      return NextResponse.json({ error: "Unknown avatar." }, { status: 400 });
    }
    if (body.selectedTemplateId !== undefined && !isTemplateAvailable(String(body.selectedTemplateId))) {
      return NextResponse.json({ error: TEMPLATE_UNAVAILABLE_MESSAGE }, { status: 400 });
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
    // The chosen domain avatar ('domain:<id>') is also stored on its own column (null when none is chosen).
    const withDomainAvatar = body.selectedAvatarIds !== undefined && !domainAvatarColumnMissing;
    if (withDomainAvatar) {
      const chosen = body.selectedAvatarIds?.find((avatarId) => avatarId.startsWith(DOMAIN_AVATAR_PREFIX));
      update.domain_avatar_id = chosen ? chosen.slice(DOMAIN_AVATAR_PREFIX.length) : null;
    }
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

    const runUpdate = (values: Record<string, unknown>) => {
      let query = supabase.from("projects").update(values).eq("id", id);
      if (user) query = query.eq("owner_id", user.id);
      return query.select(projectListColumns(Boolean(user))).maybeSingle();
    };
    let { data, error } = await runUpdate(update);
    if (error && withDomainAvatar && isNotMigratedError(error)) {
      // Migration 003 not applied: save everything else exactly as before.
      domainAvatarColumnMissing = true;
      delete update.domain_avatar_id;
      ({ data, error } = await runUpdate(update));
    }

    if (error?.code === "23503") return NextResponse.json({ error: "Unknown avatar." }, { status: 400 });
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
