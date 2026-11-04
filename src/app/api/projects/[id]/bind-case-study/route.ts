import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { buildPayload, PROJECT_SELECT_COLUMNS, rowToProject, updatedByFields, type ProjectRow } from "@/lib/projects";
import { bindCaseStudyLayout } from "@/lib/agent/bindCaseStudyLayout";
import { requireUser } from "@/lib/auth/session";
import { getGeminiKeyFor } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";
import type { CaseStudyBinding } from "@/lib/types";
import { apiErrorResponse } from "@/lib/server/errors";
import { isValidProjectId } from "@/lib/server/ids";
import { requireQuota } from "@/lib/server/quota";
import { updateLatestProject } from "@/lib/server/projectWrites";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    if (!isValidProjectId(id)) return NextResponse.json({ error: "Project not found.", code: "not_found" }, { status: 404 });
    const supabase = getSupabase();

    let fetchQuery = supabase.from("projects").select(PROJECT_SELECT_COLUMNS).eq("id", id);
    if (user) fetchQuery = fetchQuery.eq("owner_id", user.id);
    const { data: existing, error: fetchError } = await fetchQuery.maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) {
      return NextResponse.json({ error: "Project not found.", code: "not_found" }, { status: 404 });
    }

    const project = rowToProject(existing as unknown as ProjectRow);
    if (project.documentType !== "case-study") {
      return NextResponse.json(
        { error: "Layout binding is only available for case-study projects.", code: "bad_request" },
        { status: 400 }
      );
    }

    const apiKey = await getGeminiKeyFor(user);
    await requireQuota(user, "generation");
    const result = await bindCaseStudyLayout(project.title, project.chunks, apiKey);
    const boundAt = new Date().toISOString();
    const boundText = JSON.stringify(project.chunks.map((chunk) => [chunk.id, chunk.title, chunk.narrativeText]));

    // Saved onto the latest row: chapters edited while Gemini worked are kept, and the
    // new layout is marked as behind them (UX-02, AR-09).
    const updated = await updateLatestProject(id, user?.id ?? null, (latest) => {
      const latestText = JSON.stringify(latest.chunks.map((chunk) => [chunk.id, chunk.title, chunk.narrativeText]));
      const caseStudyBinding: CaseStudyBinding = {
        templateContractId: result.templateContractId,
        slots: result.slots,
        diagnostics: result.diagnostics,
        boundAt,
        ...(latestText !== boundText ? { chunksChangedAt: new Date().toISOString() } : {}),
      };
      return {
        payload: buildPayload(latest, { chunks: latest.chunks, caseStudyBinding }),
        columns: updatedByFields(user),
      };
    });

    await logActivity(user, id, "layout.bound", { templateContractId: result.templateContractId });
    return NextResponse.json({ project: rowToProject(updated) });
  } catch (error) {
    return apiErrorResponse(error, "bind-case-study");
  }
}
