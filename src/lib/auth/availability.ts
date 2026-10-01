import { publicAuthConfig } from "@/lib/auth/config";
import { authEnabled } from "@/lib/auth/session";

/**
 * Self-service password reset by email (AUTH_PASSWORD_RESET=1, default off).
 * While off, no reset emails are sent: /forgot-password and /reset-password
 * redirect to /login and the login page tells users to ask their admin.
 */
export function passwordResetEnabled(): boolean {
  return process.env.AUTH_PASSWORD_RESET === "1";
}

/**
 * Server-side check used by the auth pages: null when sign-in can work,
 * otherwise a short explanation shown in place of an active form.
 */
export function authUnavailableReason(): string | null {
  if (!authEnabled()) {
    return "Accounts are switched off for this app (AUTH_ENABLED is not set), so there is nothing to sign in to. Everything works without an account.";
  }
  if (!publicAuthConfig()) {
    return "Sign-in isn't configured yet: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.";
  }
  return null;
}
