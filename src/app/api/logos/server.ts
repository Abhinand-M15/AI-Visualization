/** Server-only helpers for the /api/logos routes. */
import { authEnabled, type AppUser } from "@/lib/auth/session";
import { parseLogoPath } from "./shared";

/** Folder the caller may write to: their user id, or "anon" while accounts are off. */
export function ownerPrefix(user: AppUser | null): string {
  return user && authEnabled() ? user.id : "anon";
}

/** True when `path` is a well-formed logo path inside the caller's own folder. */
export function pathBelongsTo(user: AppUser | null, path: unknown): path is string {
  if (typeof path !== "string") return false;
  const parsed = parseLogoPath(path);
  return !!parsed && parsed.prefix === ownerPrefix(user);
}

/** Missing bucket / table errors from Supabase Storage or PostgREST. */
export function isMissingBucket(message: string): boolean {
  return /bucket not found|not found|does not exist/i.test(message);
}
