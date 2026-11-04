/**
 * Shared "who is logged in" contract for every API route and page.
 *
 * CONTRACT (other modules code against exactly these exports — keep them stable):
 *  - authEnabled(): true once AUTH_ENABLED=1 is set. That flag also means the
 *    accounts migration (db/migrations/002_accounts.sql) has been applied, so the
 *    new columns/tables exist. While it is off, the app behaves exactly as before:
 *    no login, no ownership filtering, no writes to the new columns.
 *  - authMisconfigured(): true when the app runs in production (NODE_ENV=production
 *    or on Vercel) WITHOUT AUTH_ENABLED=1. Auth then fails closed: requireUser()
 *    and getCurrentUser() throw AuthMisconfiguredError and the proxy answers 503,
 *    so a deploy that lost its env var never becomes an open admin console (SEC-05).
 *  - getCurrentUser(): the signed-in user, or null (never throws).
 *  - requireUser(): null when auth is disabled (local development only);
 *    otherwise the signed-in user, or throws UnauthorizedError when nobody is
 *    signed in.
 *  - UnauthorizedError / unauthorizedResponse(): turn that into a 401 JSON reply
 *    (and AuthMisconfiguredError into a 503).
 */

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { enforceAllowListOnSignIn, isEmailAllowed } from "@/lib/auth/signupPolicy";
import { authEnabled, authMisconfigured } from "@/lib/auth/mode";

export { authEnabled, authMisconfigured, isProductionRuntime } from "@/lib/auth/mode";

export interface AppUser {
  id: string;
  email: string;
  /** From user_metadata.display_name (set at sign-up). Optional. */
  displayName?: string;
}

export class UnauthorizedError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(message = "Please sign in to continue.", code = "unauthorized", status = 401) {
    super(message);
    this.name = "UnauthorizedError";
    this.code = code;
    this.status = status;
  }
}

/** Production without AUTH_ENABLED=1: every request is refused instead of running with no auth. */
export class AuthMisconfiguredError extends Error {
  readonly code = "auth_misconfigured";
  readonly status = 503;
  constructor() {
    super("Sign-in is not configured on this server, so it is refusing requests. Ask your admin.");
    this.name = "AuthMisconfiguredError";
  }
}


/**
 * Never throws: pages render a signed-out state with it (and a page prerendered
 * by `next build`, which runs with NODE_ENV=production, must not fail). When auth
 * is misconfigured it returns null; the proxy and requireUser() do the refusing.
 */
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

/**
 * Cross-site request check (SEC-23). Browsers mark requests from another site
 * (Sec-Fetch-Site: cross-site) and send Origin on cross-origin requests; any
 * request whose Origin is not this app is refused. Same-origin fetches pass.
 * Outside a request scope (scripts, build) it does nothing.
 */
export async function assertSameOrigin(): Promise<void> {
  let h: Headers;
  try {
    h = await headers();
  } catch {
    return;
  }
  if (h.get("sec-fetch-site") === "cross-site") throw new UnauthorizedError("Cross-site requests are not allowed.", "forbidden_origin", 403);
  const origin = h.get("origin");
  if (!origin || origin === "null") return;
  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    throw new UnauthorizedError("Cross-site requests are not allowed.", "forbidden_origin", 403);
  }
  const allowed = new Set<string>();
  for (const value of [h.get("host"), h.get("x-forwarded-host")]) {
    for (const part of (value ?? "").split(",")) if (part.trim()) allowed.add(part.trim().toLowerCase());
  }
  try {
    if (process.env.APP_BASE_URL) allowed.add(new URL(process.env.APP_BASE_URL).host.toLowerCase());
  } catch {
    // ignore a malformed APP_BASE_URL here
  }
  if (!allowed.has(originHost)) throw new UnauthorizedError("Cross-site requests are not allowed.", "forbidden_origin", 403);
}

export async function requireUser(): Promise<AppUser | null> {
  if (authMisconfigured()) throw new AuthMisconfiguredError();
  if (!authEnabled()) return null;
  await assertSameOrigin();
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  // Optional: accounts created before the sign-up allow-list existed (or
  // straight through the Supabase API) are refused once AUTH_ENFORCE_ALLOWLIST=1.
  if (enforceAllowListOnSignIn() && !isEmailAllowed(user.email)) {
    throw new UnauthorizedError("This account is not allowed to use the app. Ask your admin.", "account_not_allowed", 403);
  }
  return user;
}

export function unauthorizedResponse(error: unknown): Response | null {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  if (error instanceof AuthMisconfiguredError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  return null;
}
