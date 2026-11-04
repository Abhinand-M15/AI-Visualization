/**
 * Auth mode flags with no imports, so the request proxy can read them without
 * pulling in the cookie-bound Supabase client. src/lib/auth/session.ts
 * re-exports these; import them from there in routes and pages.
 */

/** True on a production build or any Vercel deployment (production or preview). */
export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

export function authEnabled(): boolean {
  return process.env.AUTH_ENABLED === "1";
}

/** Auth must be on here but is not: fail closed (SEC-05). */
export function authMisconfigured(): boolean {
  return !authEnabled() && isProductionRuntime();
}
