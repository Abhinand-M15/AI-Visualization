import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import {
  PROJECT_SELECT_COLUMNS,
  projectListColumns,
  rowToProject,
  rowToProjectSummary,
  saveProjectDomain,
  selectWithDomainColumns,
  type ProjectRow,
  type ProjectSummaryRow,
} from "@/lib/projects";
import { getDomain } from "@/lib/domains";
import { pathBelongsTo } from "@/app/api/logos/server";
import { DOCUMENT_TYPES, type Chunk, type DocumentType } from "@/lib/types";
import { bindCaseStudyLayout } from "@/lib/agent/bindCaseStudyLayout";
import { requireUser } from "@/lib/auth/session";
import { getGeminiKeyFor } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";
import { mergeChunks } from "@/lib/chunkMerge";
import { cleanStoryTitle, validateClientChunks } from "@/lib/server/chunks";
import { verifyLogoObject } from "@/lib/server/logos";
import { apiErrorResponse } from "@/lib/server/errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface CreateProjectBody {
  title: string;
  documentType: DocumentType;
  sourceFileName?: string;
  /** Server-normalised chapters: validated story fields only, server ids, no audio or image fields (SEC-03/04/21). */
  chunks: Chunk[];
  /** documents.id returned by /api/parse-and-generate for a direct upload (auth on only). */
  documentId?: string;
  /** Industry domain picked on the upload page (domains.id). Optional. */
  domainId?: string;
  /** Company logo path in the company-logos bucket. Optional. */
  logoPath?: string;
}

function parseCreateBody(value: unknown): { ok: true; body: CreateProjectBody } | { ok: false; error: string } {
  if (!value || typeof value !== "object") return { ok: false, error: "Body must include title, documentType, and chunks." };
  const raw = value as Record<string, unknown>;
  const title = cleanStoryTitle(raw.title);
  if (!title) return { ok: false, error: "The title must be 1 to 200 characters." };
  if (typeof raw.documentType !== "string" || !DOCUMENT_TYPES.some((type) => type.value === raw.documentType)) {
    return { ok: false, error: "Unknown document type." };
  }
  const validated = validateClientChunks(raw.chunks);
  if (!validated.ok) return validated;
  const sourceFileName =
    typeof raw.sourceFileName === "string" && raw.sourceFileName.trim() ? raw.sourceFileName.trim().slice(0, 255) : undefined;
  return {
    ok: true,
    body: {
      title,
      documentType: raw.documentType as DocumentType,
      sourceFileName,
      chunks: mergeChunks(validated.chunks, []).chunks,
      documentId: typeof raw.documentId === "string" && UUID_PATTERN.test(raw.documentId) ? raw.documentId : undefined,
      domainId: typeof raw.domainId === "string" && UUID_PATTERN.test(raw.domainId) ? raw.domainId : undefined,
      logoPath: typeof raw.logoPath === "string" ? raw.logoPath : undefined,
    },
  };
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
    return apiErrorResponse(error, "list projects");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = parseCreateBody(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error, code: "bad_request" }, { status: 400 });
    }
    const body = parsed.body;

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

    // Domain and company logo. Both are optional and best-effort (nothing is
    // written, and nothing fails, when they're absent or migration 003 isn't applied).
    // The domain must exist and the logo must sit in the caller's own folder.
    // The logo must be in the caller's folder AND pass server verification (SEC-07):
    // a path whose upload skipped /api/logos/sanitize is verified (or rejected) here.
    const domainId = body.domainId;
    let logoPath: string | undefined;
    if (body.logoPath && pathBelongsTo(user, body.logoPath)) {
      const verified = await verifyLogoObject(body.logoPath);
      if (verified.ok) logoPath = verified.path;
      else console.warn("create project: logo not attached:", verified.reason);
    }
    let validDomainId: string | undefined;
    if (domainId) {
      try {
        validDomainId = (await getDomain(domainId)) ? domainId : undefined;
      } catch {
        validDomainId = undefined;
      }
    }
    if (validDomainId || logoPath) {
      const saved = await saveProjectDomain(supabase, id, { domainId: validDomainId, logoPath });
      if (saved) {
        const { data: withDomain } = await selectWithDomainColumns(PROJECT_SELECT_COLUMNS, (columns) =>
          supabase.from("projects").select(columns).eq("id", id).single()
        );
        if (withDomain) project = rowToProject(withDomain as unknown as ProjectRow);
      }
    }

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
    return apiErrorResponse(error, "create project");
  }
}
