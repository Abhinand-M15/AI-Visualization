import "server-only";
/**
 * Who owns a published site address (SEC-09).
 *
 * public.site_names (migration 006) keeps every address ever published, with
 * the project and user that first published it, and is never cleared, also not
 * when the project is deleted. Before 006 is applied the publish history
 * (public.publications, which is deleted with its project) is the fallback.
 *
 * A Vercel project may only be deployed over when this app's records say the
 * address belongs to the project being published (or to the same user, whose
 * old project is gone). Anything else on the hosting account is never touched.
 */
import { getSupabase } from "@/lib/db";

export type SiteOwnership =
  /** Recorded for this project. */
  | "this_project"
  /** Recorded for a project of the same user that no longer exists: the user may reuse it. */
  | "same_owner"
  /** Recorded for another project or user. */
  | "other"
  /** No record at all. */
  | "unrecorded";

interface SiteNameRow {
  name: string;
  project_id: string | null;
  owner_id: string | null;
}

function isMissingTable(error: { code?: string | null; message?: string | null }): boolean {
  return ["42P01", "PGRST205", "42703", "PGRST204"].includes(error.code ?? "") || /schema cache|does not exist/i.test(error.message ?? "");
}

async function projectExists(projectId: string): Promise<boolean> {
  const { data, error } = await getSupabase().from("projects").select("id").eq("id", projectId).maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

/**
 * Ownership of `name` (the part the user typed) for `projectId` / `userId`.
 * Throws only on real database errors.
 */
export async function siteOwnership(name: string, projectId: string | null, userId: string | null): Promise<SiteOwnership> {
  const supabase = getSupabase();

  const { data, error } = await supabase.from("site_names").select("name, project_id, owner_id").eq("name", name).maybeSingle();
  if (error && !isMissingTable(error)) throw new Error(error.message);
  if (!error) {
    const row = data as SiteNameRow | null;
    if (row) {
      if (projectId && row.project_id === projectId) return "this_project";
      if (userId && row.owner_id === userId && (!row.project_id || !(await projectExists(row.project_id)))) return "same_owner";
      return "other";
    }
  }

  // Fallback (and for addresses published before 006): the publish history.
  const { data: pubs, error: pubError } = await supabase.from("publications").select("project_id").eq("subdomain", name).limit(50);
  if (pubError) {
    if (isMissingTable(pubError)) return "unrecorded";
    throw new Error(pubError.message);
  }
  const rows = (pubs ?? []) as { project_id: string }[];
  if (rows.length === 0) return "unrecorded";
  if (projectId && rows.some((row) => row.project_id === projectId)) return "this_project";
  return "other";
}

/** Records (or refreshes) `name` for `projectId` after a successful publish. Best-effort, never throws. */
export async function recordSiteName(name: string, projectId: string, ownerId: string | null, vercelProject: string): Promise<void> {
  try {
    const now = new Date().toISOString();
    const { error } = await getSupabase()
      .from("site_names")
      .upsert(
        { name, project_id: projectId, owner_id: ownerId, vercel_project: vercelProject, last_published_at: now },
        { onConflict: "name" }
      );
    if (error && !isMissingTable(error)) console.error("recording site name failed:", error.message);
  } catch (error) {
    console.error("recording site name failed:", error);
  }
}

/** Names recorded for `projectId` (site_names, else publications). [] when none or on error. */
export async function siteNamesOfProject(projectId: string): Promise<string[]> {
  const supabase = getSupabase();
  const names = new Set<string>();
  try {
    const { data, error } = await supabase.from("site_names").select("name").eq("project_id", projectId);
    if (!error) for (const row of (data ?? []) as { name: string }[]) names.add(row.name);
    const { data: pubs, error: pubError } = await supabase
      .from("publications")
      .select("subdomain")
      .eq("project_id", projectId)
      .not("subdomain", "is", null);
    if (!pubError) for (const row of (pubs ?? []) as { subdomain: string }[]) names.add(row.subdomain);
  } catch (error) {
    console.error("reading site names failed:", error);
  }
  return [...names];
}
