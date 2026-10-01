import type { CaseStudyBinding, Chunk, DocumentType, Project, PublicationRecord } from "@/lib/types";
import { contentFingerprint } from "@/lib/contentVersion";

export const PROJECT_SELECT_COLUMNS =
  "id, title, document_type, source_file_name, payload, selected_voice, selected_avatar_ids, selected_template_id, status, published_url, created_at";

export interface ProjectPayload {
  chunks: Chunk[];
  /** Set once the case-study layout-binding step has run (see /bind-case-study). */
  caseStudyBinding?: CaseStudyBinding | null;
  /** What was last published (see src/lib/contentVersion.ts). Kept in the payload, so no migration is needed. */
  publication?: PublicationRecord;
}

/**
 * The payload to write when `previous` (the project as read before this
 * change) gets new chunks/binding. Every payload writer goes through this so
 * the publication record is never dropped. For a site published before
 * publication records existed, the first change records the pre-change state
 * as the published baseline (inferred), so "unpublished changes" works for
 * those sites too.
 */
export function buildPayload(
  previous: Project,
  next: { chunks: Chunk[]; caseStudyBinding: CaseStudyBinding | null }
): ProjectPayload {
  const publication: PublicationRecord | undefined =
    previous.publication ??
    (previous.publishStatus === "published" && previous.publishedUrl
      ? { contentHash: contentFingerprint(previous), publishedAt: null, inferred: true }
      : undefined);
  return {
    chunks: next.chunks,
    caseStudyBinding: next.caseStudyBinding,
    ...(publication ? { publication } : {}),
  };
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

/**
 * Extra columns for the home-page list. `updated_at` exists in the base
 * schema; `published_at` only exists once db/migrations/002_accounts.sql has
 * been applied, i.e. when AUTH_ENABLED=1.
 */
export function projectListColumns(withAccountColumns: boolean): string {
  return `${PROJECT_SELECT_COLUMNS}, updated_at${withAccountColumns ? ", published_at" : ""}`;
}

/** A project plus the timestamps the home page shows. Safe to import client-side. */
export type ProjectSummary = Project & { updatedAt?: string; publishedAt?: string };

export type ProjectSummaryRow = ProjectRow & { updated_at?: string | null; published_at?: string | null };

export function rowToProjectSummary(row: ProjectSummaryRow): ProjectSummary {
  return {
    ...rowToProject(row),
    updatedAt: row.updated_at ?? undefined,
    // published_at exists only with accounts on; the payload record works either way.
    publishedAt: row.published_at ?? row.payload.publication?.publishedAt ?? undefined,
  };
}

/** "30 Sep 2026" (dd MMM yyyy), optionally with the time ("30 Sep 2026, 14:05"). */
export function formatDate(value: string | undefined | null, withTime = false): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // Built by hand: toLocaleString("en-GB") renders September as "Sept" on newer ICU.
  const day = String(date.getDate()).padStart(2, "0");
  const text = `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  if (!withTime) return text;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${text}, ${hours}:${minutes}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Audit columns for an update. Empty while auth is off (user === null), so
 * nothing is written to columns that may not exist yet.
 */
export function updatedByFields(user: { id: string } | null): Record<string, string> {
  return user ? { updated_by: user.id } : {};
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
    publication: row.payload.publication ?? undefined,
  };
}
