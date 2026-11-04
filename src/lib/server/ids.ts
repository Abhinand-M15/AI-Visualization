/**
 * Id formats and the one safe way to build a Storage object path from ids
 * (SEC-03, SEC-20, SEC-21).
 *
 * Every Storage path the server writes, reads or deletes is built from ids
 * (project id, chunk id, section key, user id). supabase-js joins the path
 * into the request URL and `fetch` normalises dot segments, so a segment like
 * `..` or one containing `/` would reach another project's folder with the
 * service role. storagePath() refuses anything but plain, short segments.
 *
 * Pure module (no server imports), so it can be unit tested.
 */

/** Chunk ids: `chunk-3`, a lowercase UUID, `case-study-problem-0`. */
export const CHUNK_ID_PATTERN = /^[a-z0-9-]{1,64}$/;

/** Project ids are TEXT; new ones are UUIDs. Legacy ids are still plain [A-Za-z0-9_-]. */
export const PROJECT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/** A single path segment: letters, digits, dot, dash, underscore; never "." or "..". */
const SEGMENT_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

export function isValidChunkId(value: unknown): value is string {
  return typeof value === "string" && CHUNK_ID_PATTERN.test(value);
}

export function isValidProjectId(value: unknown): value is string {
  return typeof value === "string" && PROJECT_ID_PATTERN.test(value);
}

export class UnsafePathError extends Error {
  constructor(message = "Refusing to build an unsafe storage path.") {
    super(message);
    this.name = "UnsafePathError";
  }
}

export function isSafeSegment(segment: unknown): segment is string {
  return (
    typeof segment === "string" &&
    SEGMENT_PATTERN.test(segment) &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("..")
  );
}

/**
 * Joins `segments` into a Storage object path, or throws UnsafePathError when
 * any segment could escape its folder (`/`, `\`, `..`, `%`, empty, too long).
 */
export function storagePath(...segments: string[]): string {
  if (segments.length === 0) throw new UnsafePathError();
  for (const segment of segments) {
    if (!isSafeSegment(segment)) throw new UnsafePathError(`Refusing to build a storage path from "${String(segment).slice(0, 80)}".`);
  }
  return segments.join("/");
}

/** storagePath(), but null instead of throwing (for best-effort cleanup). */
export function storagePathOrNull(...segments: string[]): string | null {
  try {
    return storagePath(...segments);
  } catch {
    return null;
  }
}

/** `<projectId>/<chunkId>.mp3` in the chunk-audio bucket. */
export function chunkAudioPath(projectId: string, chunkId: string): string {
  if (!isValidProjectId(projectId) || !isValidChunkId(chunkId)) throw new UnsafePathError();
  return storagePath(projectId, `${chunkId}.mp3`);
}

/** `<projectId>/<chunkId>.mp4` in the chunk-video bucket. */
export function chunkVideoPath(projectId: string, chunkId: string): string {
  if (!isValidProjectId(projectId) || !isValidChunkId(chunkId)) throw new UnsafePathError();
  return storagePath(projectId, `${chunkId}.mp4`);
}

/** Section keys are `company`, `domain`, `problem-0` ...; their storage id is `case-study-<key>`. */
export function caseStudyStorageId(sectionKey: string): string {
  const id = `case-study-${sectionKey}`;
  if (!isValidChunkId(id)) throw new UnsafePathError();
  return id;
}
