/**
 * Audit trail: who did what, and when (see activity_log in
 * db/migrations/002_accounts.sql).
 *
 * logActivity() is a no-op while auth is off (user is null, or AUTH_ENABLED
 * is unset) and never throws: a failed audit write must never fail the action
 * it describes.
 */
import { getSupabase } from "@/lib/db";
import { authEnabled, type AppUser } from "@/lib/auth/session";

export type ActivityAction =
  | "project.created"
  | "project.updated"
  | "project.deleted"
  | "project.selection_updated"
  | "project.published"
  | "chunks.generated"
  | "story.revised"
  | "layout.bound"
  | "audio.generated"
  | "video.generated"
  | "document.uploaded"
  | "keys.updated"
  | "keys.deleted"
  | (string & {});

export async function logActivity(
  user: AppUser | null,
  projectId: string | null,
  action: ActivityAction,
  details?: Record<string, unknown>
): Promise<void> {
  if (!user || !authEnabled()) return;
  try {
    const { error } = await getSupabase()
      .from("activity_log")
      .insert({ user_id: user.id, project_id: projectId, action, details: details ?? null });
    if (error) console.error(`activity log write failed (${action}):`, error.message);
  } catch (error) {
    console.error(`activity log write failed (${action}):`, error);
  }
}
