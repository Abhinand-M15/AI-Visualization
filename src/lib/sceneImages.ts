/**
 * Server-side helpers for chapter scene images (docs/DOMAINS_PLAN.md, stage S4),
 * shared by POST /api/projects/[id]/generate-scene-images and GET /api/projects/[id].
 *
 * Everything tolerates migration 003 not being applied: a missing table or
 * column yields "none" (empty rows / no fields), never an exception.
 */
import { getSupabase } from "@/lib/db";
import { logoUrl, SCENE_IMAGES_BUCKET, sceneImageUrl } from "@/lib/storageUrls";
import type { AppUser } from "@/lib/auth/session";
import type { Chunk } from "@/lib/types";

export type ChapterImageStatus = "pending" | "ready" | "failed";

export interface ChapterImageRow {
  project_id: string;
  chunk_id: string;
  image_path: string | null;
  status: ChapterImageStatus;
  prompt_used?: string | null;
  provider?: string | null;
  error?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const CHAPTER_IMAGE_COLUMNS = "project_id, chunk_id, image_path, status, prompt_used, provider, error, created_at, updated_at";

/** A 'pending' row younger than this counts as another run still working on it. */
export const PENDING_STALE_MS = 6 * 60 * 1000;

/** PostgREST / Postgres errors that mean "migration 003 is not applied" (missing table or column). */
export function isNotMigratedError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code && ["42P01", "42703", "PGRST204", "PGRST205"].includes(error.code)) return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    /(relation|table|column) .*(does not exist|not found)/.test(message) ||
    message.includes("schema cache") ||
    message.includes("could not find the")
  );
}

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** File extension for an image mime type (png, jpg, webp...); png when unknown. */
export function extensionForMime(mimeType: string): string {
  return MIME_EXTENSIONS[mimeType.split(";")[0].trim().toLowerCase()] ?? "png";
}

/** Mime type for a file extension, the reverse of extensionForMime. */
export function mimeForPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/png";
}

/** Storage path of a chapter image inside the scene-images bucket. */
export function sceneImagePath(projectId: string, chunkId: string, mimeType: string): string {
  return `${projectId}/${chunkId}.${extensionForMime(mimeType)}`;
}

/** All chapter_images rows of a project. [] when the table is missing or unreadable. */
export async function loadChapterImageRows(projectId: string): Promise<ChapterImageRow[]> {
  try {
    const { data, error } = await getSupabase()
      .from("chapter_images")
      .select(CHAPTER_IMAGE_COLUMNS)
      .eq("project_id", projectId);
    if (error) {
      if (!isNotMigratedError(error)) console.error("loading chapter images failed:", error.message);
      return [];
    }
    return (data ?? []) as ChapterImageRow[];
  } catch (error) {
    console.error("loading chapter images failed:", error);
    return [];
  }
}

/**
 * Public URL of a ready chapter image. `?v=<updated_at>` makes a regenerated
 * image (same storage path) a different URL, so browsers/CDN don't serve the old one
 * and the content fingerprint notices the change.
 */
export function chapterImageUrl(row: Pick<ChapterImageRow, "image_path" | "updated_at">): string | undefined {
  if (!row.image_path) return undefined;
  const base = sceneImageUrl(row.image_path);
  const stamp = row.updated_at ? Date.parse(row.updated_at) : NaN;
  return Number.isNaN(stamp) ? base : `${base}?v=${stamp}`;
}

/** Adds imageUrl (ready rows only) and imageStatus to chunks that have a row; other chunks are returned untouched. */
export function applyChapterImages(chunks: Chunk[], rows: ChapterImageRow[]): Chunk[] {
  if (rows.length === 0) return chunks;
  const byChunk = new Map(rows.map((row) => [row.chunk_id, row]));
  return chunks.map((chunk) => {
    const row = byChunk.get(chunk.id);
    if (!row) return chunk;
    const url = row.status === "ready" ? chapterImageUrl(row) : undefined;
    return { ...chunk, ...(url ? { imageUrl: url } : {}), imageStatus: row.status };
  });
}

export interface ProjectDomainFields {
  domainId?: string;
  domainAvatarId?: string;
  logoPath?: string;
}

/** projects.domain_id / domain_avatar_id / logo_path. {} when the columns are missing. */
export async function loadProjectDomainFields(projectId: string): Promise<ProjectDomainFields> {
  try {
    const { data, error } = await getSupabase()
      .from("projects")
      .select("domain_id, domain_avatar_id, logo_path")
      .eq("id", projectId)
      .maybeSingle();
    if (error || !data) {
      if (error && !isNotMigratedError(error)) console.error("loading project domain fields failed:", error.message);
      return {};
    }
    const row = data as { domain_id: string | null; domain_avatar_id: string | null; logo_path: string | null };
    return {
      ...(row.domain_id ? { domainId: row.domain_id } : {}),
      ...(row.domain_avatar_id ? { domainAvatarId: row.domain_avatar_id } : {}),
      ...(row.logo_path ? { logoPath: row.logo_path } : {}),
    };
  } catch (error) {
    console.error("loading project domain fields failed:", error);
    return {};
  }
}

/** Public logo URL for a stored logo path, or undefined. */
export function logoUrlFor(path: string | undefined): string | undefined {
  return path ? logoUrl(path) : undefined;
}

/** Image provider recorded for the user (profiles.image_provider); "gemini" when auth is off or unreadable. */
export async function imageProviderLabel(user: AppUser | null): Promise<string> {
  if (!user) return "gemini";
  try {
    const { data } = await getSupabase().from("profiles").select("image_provider").eq("id", user.id).maybeSingle();
    const value = (data as { image_provider?: string | null } | null)?.image_provider;
    return value === "openai" ? "openai" : "gemini";
  } catch {
    return "gemini";
  }
}

export type SceneTargetOptions = { onlyMissing?: boolean; retryFailed?: boolean; chunkId?: string };

/**
 * Which chapters to (re)generate.
 *  - chunkId: just that chapter, even when ready.
 *  - onlyMissing: chapters without a ready image (no row, failed, or a stale pending row).
 *  - retryFailed: chapters whose row is failed (combined with onlyMissing it is the same set).
 *  - no flags: every chapter.
 * Chapters with a fresh 'pending' row are in progress elsewhere and are returned
 * separately as `inProgress` (never targeted, never counted as remaining).
 */
export function selectSceneTargets<T extends { id: string }>(
  chunks: T[],
  rows: Pick<ChapterImageRow, "chunk_id" | "status" | "updated_at">[],
  options: SceneTargetOptions,
  nowMs: number = Date.now()
): { targets: T[]; inProgress: string[] } {
  const byChunk = new Map(rows.map((row) => [row.chunk_id, row]));
  const isFreshPending = (id: string) => {
    const row = byChunk.get(id);
    if (!row || row.status !== "pending") return false;
    const stamp = row.updated_at ? Date.parse(row.updated_at) : NaN;
    return Number.isNaN(stamp) || nowMs - stamp < PENDING_STALE_MS;
  };

  let candidates: T[];
  if (options.chunkId) {
    candidates = chunks.filter((chunk) => chunk.id === options.chunkId);
  } else if (options.onlyMissing) {
    candidates = chunks.filter((chunk) => byChunk.get(chunk.id)?.status !== "ready");
  } else if (options.retryFailed) {
    candidates = chunks.filter((chunk) => byChunk.get(chunk.id)?.status === "failed");
  } else {
    candidates = chunks;
  }
  const inProgress = candidates.filter((chunk) => isFreshPending(chunk.id)).map((chunk) => chunk.id);
  const skip = new Set(inProgress);
  return { targets: candidates.filter((chunk) => !skip.has(chunk.id)), inProgress };
}

/**
 * Runs `work` over `targets` one at a time and stops before the time budget
 * would be exceeded. It always runs at least one target, and before each next
 * one it checks that the slowest item so far would still fit.
 * Returns the processed results and the number of targets left.
 */
export async function runWithinBudget<T, R>(
  targets: T[],
  work: (target: T) => Promise<R>,
  options: { budgetMs: number; now?: () => number }
): Promise<{ results: R[]; remaining: number }> {
  const now = options.now ?? Date.now;
  const start = now();
  const results: R[] = [];
  let slowest = 0;
  for (const target of targets) {
    const elapsed = now() - start;
    if (results.length > 0 && elapsed + slowest * 1.25 > options.budgetMs) break;
    const itemStart = now();
    results.push(await work(target));
    slowest = Math.max(slowest, now() - itemStart);
  }
  return { results, remaining: targets.length - results.length };
}

export { SCENE_IMAGES_BUCKET };
