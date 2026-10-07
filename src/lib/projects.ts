import type { CaseStudyBinding, Chunk, DocumentType, Project, PublicationRecord } from "@/lib/types";
import { contentFingerprint } from "@/lib/contentVersion";
import { logoUrl as logoPublicUrl } from "@/lib/storageUrls";

export const PROJECT_SELECT_COLUMNS =
  "id, title, document_type, source_file_name, payload, selected_voice, selected_avatar_ids, selected_template_id, status, published_url, created_at";

/**
 * Columns added by db/migrations/003_domains_images.sql. They are NOT part of
 * PROJECT_SELECT_COLUMNS (selecting a missing column would break every read
 * when the migration isn't applied); use selectWithDomainColumns() /
 * saveProjectDomain() below, which fall back when they don't exist.
 */
export const PROJECT_DOMAIN_COLUMNS = "domain_id, domain_avatar_id, logo_path";

/** PostgREST / Postgres errors meaning "that table or column isn't there (migration not applied)". */
export function isMissingSchemaError(error: { code?: string | null; message?: string | null } | null | undefined): boolean {
  if (!error) return false;
  if (error.code && ["42P01", "42703", "PGRST204", "PGRST205"].includes(error.code)) return true;
  const message = error.message ?? "";
  return /(domain_id|domain_avatar_id|logo_path)/.test(message) && /(column|schema cache|does not exist)/i.test(message);
}

/**
 * Runs `run` with the base columns plus the domain columns; if that fails
 * because the migration isn't applied, runs it again with the base columns
 * only. `run` receives the column list to pass to .select().
 */
export async function selectWithDomainColumns<R extends { error: { code?: string | null; message?: string | null } | null }>(
  baseColumns: string,
  run: (columns: string) => PromiseLike<R>
): Promise<R> {
  const result = await run(`${baseColumns}, ${PROJECT_DOMAIN_COLUMNS}`);
  if (result.error && isMissingSchemaError(result.error)) return run(baseColumns);
  return result;
}

/**
 * Best-effort: stores domain_id / logo_path on a project. Writes nothing when
 * neither value is present, and never throws or fails the caller (a missing
 * column or any other error is only logged). Returns whether anything was saved.
 */
export async function saveProjectDomain(
  supabase: {
    from(table: string): {
      update(values: Record<string, unknown>): {
        eq(column: string, value: string): PromiseLike<{ error: { code?: string | null; message?: string | null } | null }>;
      };
    };
  },
  projectId: string,
  fields: { domainId?: string | null; logoPath?: string | null }
): Promise<boolean> {
  const values: Record<string, unknown> = {};
  if (fields.domainId) values.domain_id = fields.domainId;
  if (fields.logoPath) values.logo_path = fields.logoPath;
  if (Object.keys(values).length === 0) return false;
  try {
    let { error } = await supabase.from("projects").update(values).eq("id", projectId);
    if (error && isMissingSchemaError(error) && values.domain_id && values.logo_path) {
      // One of the two columns may exist without the other; try each on its own.
      for (const key of Object.keys(values)) {
        const single = await supabase.from("projects").update({ [key]: values[key] }).eq("id", projectId);
        if (!single.error) error = null;
      }
    }
    if (error) {
      if (!isMissingSchemaError(error)) console.error("saving project domain/logo failed:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("saving project domain/logo failed:", error);
    return false;
  }
}

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
  /** Only present when the row was selected with PROJECT_DOMAIN_COLUMNS (migration 003). */
  domain_id?: string | null;
  domain_avatar_id?: string | null;
  logo_path?: string | null;
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
    ...(row.domain_id ? { domainId: row.domain_id } : {}),
    ...(row.domain_avatar_id ? { domainAvatarId: row.domain_avatar_id } : {}),
    ...(row.logo_path ? logoUrlField(row.logo_path) : {}),
  };
}

/** { logoUrl } for a stored path; nothing when SUPABASE_URL isn't available (e.g. in the browser). */
function logoUrlField(path: string): { logoUrl?: string } {
  try {
    return { logoUrl: logoPublicUrl(path) };
  } catch {
    return {};
  }
}
