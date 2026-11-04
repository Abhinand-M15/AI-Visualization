import "server-only";
/**
 * Safe read-modify-write of projects.payload (UX-02, AR-09).
 *
 * projects.payload is one jsonb document. A long job (narration) that wrote
 * back the copy it read at the start overwrote every edit saved while it ran.
 * updateLatestProject() instead re-reads the row, applies a small change to
 * that latest copy, and writes it only if nobody wrote in between (compare on
 * updated_at, which every payload writer bumps); otherwise it re-reads and
 * tries again.
 */
import { getSupabase } from "@/lib/db";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectPayload, type ProjectRow } from "@/lib/projects";
import type { Project } from "@/lib/types";

const MAX_ATTEMPTS = 5;

export interface LatestUpdate {
  payload: ProjectPayload;
  /** Other columns to set in the same write (e.g. selected_voice). */
  columns?: Record<string, unknown>;
}

/**
 * Applies `change` to the latest stored project and saves it. `change` returns
 * null to write nothing. Returns the saved row, or the latest row when nothing
 * was written. Throws when the project is gone or the write keeps conflicting.
 */
export async function updateLatestProject(
  projectId: string,
  ownerId: string | null,
  change: (latest: Project) => LatestUpdate | null
): Promise<ProjectRow> {
  const supabase = getSupabase();
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let read = supabase.from("projects").select(`${PROJECT_SELECT_COLUMNS}, updated_at`).eq("id", projectId);
    if (ownerId) read = read.eq("owner_id", ownerId);
    const { data: row, error: readError } = await read.maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!row) throw new Error("Project not found.");
    const latestRow = row as unknown as ProjectRow & { updated_at: string };

    const update = change(rowToProject(latestRow));
    if (!update) return latestRow;

    let write = supabase
      .from("projects")
      .update({ ...update.columns, payload: update.payload, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("updated_at", latestRow.updated_at);
    if (ownerId) write = write.eq("owner_id", ownerId);
    const { data: written, error: writeError } = await write.select(PROJECT_SELECT_COLUMNS);
    if (writeError) throw new Error(writeError.message);
    if (written && written.length > 0) return written[0] as unknown as ProjectRow;
    // Someone saved in between: read again and re-apply on top of their change.
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 150));
  }
  throw new Error("The project kept changing while saving; try again.");
}
