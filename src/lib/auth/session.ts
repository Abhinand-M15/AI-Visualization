/**
 * Shared "who is logged in" contract for every API route and page.
 *
 * CONTRACT (other modules code against exactly these exports — keep them stable):
 *  - authEnabled(): true once AUTH_ENABLED=1 is set. That flag also means the
 *    accounts migration (db/migrations/002_accounts.sql) has been applied, so the
 *    new columns/tables exist. While it is off, the app behaves exactly as before:
 *    no login, no ownership filtering, no writes to the new columns.
 *  - getCurrentUser(): the signed-in user, or null.
 *  - requireUser(): null when auth is disabled; otherwise the signed-in user, or
 *    throws UnauthorizedError when nobody is signed in.
 *  - UnauthorizedError / unauthorizedResponse(): turn that into a 401 JSON reply.
 *
 * The auth agent replaces the body of getCurrentUser() with the real Supabase
 * Auth (cookie session) lookup; everything else here stays as is.
 */

import { createSupabaseServerClient } from "@/lib/auth/server";

export interface AppUser {
  id: string;
  email: string;
  /** From user_metadata.display_name (set at sign-up). Optional. */
  displayName?: string;
}

export class UnauthorizedError extends Error {
  constructor(message = "Please sign in to continue.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function authEnabled(): boolean {
  return process.env.AUTH_ENABLED === "1";
}

export async function getCurrentUser(): Promise<AppUser | null> {
  if (!authEnabled()) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  try {
    // getUser() validates the JWT with Supabase Auth (unlike getSession(),
    // which trusts the cookie as-is), so it is safe for authorization.
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const meta = data.user.user_metadata as Record<string, unknown> | undefined;
    const displayName = typeof meta?.display_name === "string" ? meta.display_name.trim() : "";
    return {
      id: data.user.id,
      email: data.user.email ?? "",
      ...(displayName ? { displayName } : {}),
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AppUser | null> {
  if (!authEnabled()) return null;
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export function unauthorizedResponse(error: unknown): Response | null {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  return null;
}
