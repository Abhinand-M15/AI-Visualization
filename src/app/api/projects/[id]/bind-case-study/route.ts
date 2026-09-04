import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectRow } from "@/lib/projects";
import { bindCaseStudyLayout } from "@/lib/agent/bindCaseStudyLayout";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
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

    const project = rowToProject(existing as unknown as ProjectRow);
    if (project.documentType !== "case-study") {
      return NextResponse.json(
        { error: "Layout binding is only available for case-study projects." },
        { status: 400 }
      );
    }

    const result = await bindCaseStudyLayout(project.title, project.chunks);
    const caseStudyBinding = {
      templateContractId: result.templateContractId,
      slots: result.slots,
      diagnostics: result.diagnostics,
      boundAt: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update({
        payload: { chunks: project.chunks, caseStudyBinding },
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(PROJECT_SELECT_COLUMNS)
      .single();

    if (updateError) throw new Error(updateError.message);
    return NextResponse.json({ project: rowToProject(updated as unknown as ProjectRow) });
  } catch (error) {
    console.error("bind-case-study failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
