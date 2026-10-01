import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { buildPayload, PROJECT_SELECT_COLUMNS, rowToProject, updatedByFields, type ProjectRow } from "@/lib/projects";
import { bindCaseStudyLayout } from "@/lib/agent/bindCaseStudyLayout";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { getGeminiKeyFor, missingApiKeyResponse } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const supabase = getSupabase();

    let fetchQuery = supabase.from("projects").select(PROJECT_SELECT_COLUMNS).eq("id", id);
    if (user) fetchQuery = fetchQuery.eq("owner_id", user.id);
    const { data: existing, error: fetchError } = await fetchQuery.maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const project = rowToProject(existing as unknown as ProjectRow);
    if (project.documentType !== "case-study") {
      return NextResponse.json(
        { error: "Layout binding is only available for case-study projects." },
        { status: 400 }
      );
    }

    const apiKey = await getGeminiKeyFor(user);
    const result = await bindCaseStudyLayout(project.title, project.chunks, apiKey);
    const caseStudyBinding = {
      templateContractId: result.templateContractId,
      slots: result.slots,
      diagnostics: result.diagnostics,
      boundAt: new Date().toISOString(),
    };

    let updateQuery = supabase
      .from("projects")
      .update({
        payload: buildPayload(project, { chunks: project.chunks, caseStudyBinding }),
        updated_at: new Date().toISOString(),
        ...updatedByFields(user),
      })
      .eq("id", id);
    if (user) updateQuery = updateQuery.eq("owner_id", user.id);
    const { data: updated, error: updateError } = await updateQuery.select(PROJECT_SELECT_COLUMNS).single();

    if (updateError) throw new Error(updateError.message);
    await logActivity(user, id, "layout.bound", { templateContractId: result.templateContractId });
    return NextResponse.json({ project: rowToProject(updated as unknown as ProjectRow) });
  } catch (error) {
    const handled = unauthorizedResponse(error) ?? missingApiKeyResponse(error);
    if (handled) return handled;
    console.error("bind-case-study failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
