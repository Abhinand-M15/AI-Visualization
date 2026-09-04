import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectRow } from "@/lib/projects";
import type { Chunk, DocumentType } from "@/lib/types";
import { bindCaseStudyLayout } from "@/lib/agent/bindCaseStudyLayout";

interface CreateProjectBody {
  title: string;
  documentType: DocumentType;
  sourceFileName?: string;
  chunks: Chunk[];
}

function isCreateProjectBody(value: unknown): value is CreateProjectBody {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.title === "string" &&
    typeof body.documentType === "string" &&
    Array.isArray(body.chunks)
  );
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("projects")
      .select(PROJECT_SELECT_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ projects: (data as unknown as ProjectRow[]).map(rowToProject) });
  } catch (error) {
    console.error("list projects failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isCreateProjectBody(body)) {
      return NextResponse.json(
        { error: "Body must include title, documentType, and chunks." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        id,
        title: body.title,
        document_type: body.documentType,
        source_file_name: body.sourceFileName ?? null,
        payload: { chunks: body.chunks },
        status: "draft",
      })
      .select(PROJECT_SELECT_COLUMNS)
      .single();

    if (error) throw new Error(error.message);
    let project = rowToProject(data as unknown as ProjectRow);

    // Case-study projects bind their layout automatically on save — no
    // separate "Generate case study layout" click needed for the first bind.
    // Best-effort: a binding failure (e.g. a transient Gemini error) doesn't
    // fail the save itself — the project page's "Regenerate layout" button
    // covers retrying.
    if (body.documentType === "case-study") {
      try {
        const result = await bindCaseStudyLayout(project.title, project.chunks);
        const caseStudyBinding = {
          templateContractId: result.templateContractId,
          slots: result.slots,
          diagnostics: result.diagnostics,
          boundAt: new Date().toISOString(),
        };
        const { data: rebound, error: reboundError } = await supabase
          .from("projects")
          .update({ payload: { chunks: project.chunks, caseStudyBinding } })
          .eq("id", id)
          .select(PROJECT_SELECT_COLUMNS)
          .single();
        if (reboundError) throw new Error(reboundError.message);
        project = rowToProject(rebound as unknown as ProjectRow);
      } catch (bindError) {
        console.error("auto-bind case study layout failed (project still saved):", bindError);
      }
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("create project failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
