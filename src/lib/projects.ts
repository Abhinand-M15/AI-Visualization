import type { CaseStudyBinding, Chunk, DocumentType, Project } from "@/lib/types";

export const PROJECT_SELECT_COLUMNS =
  "id, title, document_type, source_file_name, payload, selected_voice, selected_avatar_ids, selected_template_id, status, published_url, created_at";

export interface ProjectPayload {
  chunks: Chunk[];
  /** Set once the case-study layout-binding step has run (see /bind-case-study). */
  caseStudyBinding?: CaseStudyBinding | null;
}

export interface ProjectRow {
  id: string;
  title: string;
  document_type: DocumentType;
  source_file_name: string | null;
  payload: ProjectPayload;
  selected_voice: string | null;
  selected_avatar_ids: string[] | null;
  selected_template_id: string | null;
  status: Project["publishStatus"];
  published_url: string | null;
  created_at: string;
}

export function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    documentType: row.document_type,
    sourceFileName: row.source_file_name ?? undefined,
    chunks: row.payload.chunks,
    selectedVoice: row.selected_voice ?? undefined,
    selectedAvatarIds: row.selected_avatar_ids ?? undefined,
    selectedTemplateId: row.selected_template_id ?? undefined,
    publishStatus: row.status,
    publishedUrl: row.published_url ?? undefined,
    createdAt: row.created_at,
    caseStudyBinding: row.payload.caseStudyBinding ?? undefined,
  };
}
