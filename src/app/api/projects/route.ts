import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import {
  PROJECT_SELECT_COLUMNS,
  projectListColumns,
  rowToProject,
  rowToProjectSummary,
  type ProjectRow,
  type ProjectSummaryRow,
} from "@/lib/projects";
import type { Chunk, DocumentType } from "@/lib/types";
import { bindCaseStudyLayout } from "@/lib/agent/bindCaseStudyLayout";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { getGeminiKeyFor } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";

interface CreateProjectBody {
  title: string;
  documentType: DocumentType;
  sourceFileName?: string;
  chunks: Chunk[];
  /** documents.id returned by /api/parse-and-generate for a direct upload (auth on only). */
  documentId?: string;
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
    const user = await requireUser();
    let query = getSupabase()
      .from("projects")
      .select(projectListColumns(Boolean(user)))
      .order("created_at", { ascending: false });
    if (user) query = query.eq("owner_id", user.id);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json({
      projects: (data as unknown as ProjectSummaryRow[]).map(rowToProjectSummary),
    });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("list projects failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
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
        ...(user ? { owner_id: user.id, created_by: user.id, updated_by: user.id } : {}),
      })
      .select(PROJECT_SELECT_COLUMNS)
      .single();

    if (error) throw new Error(error.message);
    let project = rowToProject(data as unknown as ProjectRow);
    await logActivity(user, id, "project.created", {
      title: body.title,
      documentType: body.documentType,
      chunkCount: body.chunks.length,
    });

    // Link the uploaded source document (direct-to-storage upload) to the project.
    if (user && typeof body.documentId === "string" && body.documentId) {
      const { error: linkError } = await supabase
        .from("documents")
        .update({ project_id: id })
        .eq("id", body.documentId)
        .eq("owner_id", user.id);
      if (linkError) console.error("linking uploaded document failed (project still saved):", linkError.message);
    }

    // Case-study projects bind their layout automatically on save — no
    // separate "Generate case study layout" click needed for the first bind.
    // Best-effort: a binding failure (e.g. a transient Gemini error, or no
    // saved Gemini key) doesn't fail the save itself — the project page's
    // "Regenerate layout" button covers retrying.
    if (body.documentType === "case-study") {
      try {
        const apiKey = await getGeminiKeyFor(user);
        const result = await bindCaseStudyLayout(project.title, project.chunks, apiKey);
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
        await logActivity(user, id, "layout.bound", { automatic: true });
      } catch (bindError) {
        console.error("auto-bind case study layout failed (project still saved):", bindError);
      }
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("create project failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
