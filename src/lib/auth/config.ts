/**
 * Supabase Auth connection settings, shared by the browser client, the server
 * client and the request proxy.
 *
 * NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so
 * they must be set before `next build` / `next dev` starts. Only the public
 * anon key is used for auth; the service-role key never reaches this module.
 */

export interface SupabaseAuthConfig {
  url: string;
  anonKey: string;
}

/** Browser-safe config (NEXT_PUBLIC_* only). Null when not configured. */
export function publicAuthConfig(): SupabaseAuthConfig | null {
  // Must be written out literally so Next.js can inline them in client code.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/**
 * Server-side config. Falls back to SUPABASE_URL for the URL (same project),
 * but the anon key has no fallback: the service-role key must never be used
 * for user sessions.
 */
export function serverAuthConfig(): SupabaseAuthConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/** Pages that signed-out visitors may open. */
export const PUBLIC_AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"] as const;

/** Route prefix for the callback and sign-out handlers. */
export const AUTH_ROUTE_PREFIX = "/auth/";

/**
 * Sanitises a post-login destination so it can only point inside this app
 * (blocks open redirects like `//evil.com`, `/\evil.com` or `https://…`).
 */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  for (let i = 0; i < next.length; i++) {
    if (next.charCodeAt(i) < 0x20) return fallback; // control chars (CR/LF/tab tricks)
  }
  // Never bounce back into the auth pages themselves after signing in.
  const path = next.split(/[?#]/)[0];
  if ((PUBLIC_AUTH_PATHS as readonly string[]).includes(path) && path !== "/reset-password") return fallback;
  if (path.startsWith(AUTH_ROUTE_PREFIX)) return fallback;
  return next;
}
