import { publicAuthConfig } from "@/lib/auth/config";
import { authEnabled, authMisconfigured } from "@/lib/auth/session";
import { allowedSignupDomains, signupAllowListConfigured } from "@/lib/auth/signupPolicy";

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
 * Never names environment variables (the text is shown to users).
 */
export function authUnavailableReason(): string | null {
  if (authMisconfigured()) {
    return "Sign-in is not configured on this server yet. Ask your admin.";
  }
  if (!authEnabled()) {
    return "Accounts are switched off for this local copy of the app, so there is nothing to sign in to. Everything works without an account.";
  }
  if (!publicAuthConfig()) {
    return "Sign-in isn't configured on this server yet. Ask your admin.";
  }
  return null;
}

/** GET /api/auth/signup and the sign-up page both use this shape. */
export interface SignupStatus {
  open: boolean;
  /** Why it is closed: accounts off, sign-in not configured, or no allow-list (invite only). */
  reason?: "auth_off" | "not_configured" | "closed";
  /** Shown to users when closed. */
  message?: string;
  /** Email domains anyone may sign up with (exact allowed addresses are never listed). */
  allowedDomains?: string[];
}

/** Whether self-service sign-up is open right now (SEC-10). */
export function signupStatus(): SignupStatus {
  const unavailable = authUnavailableReason();
  if (unavailable) {
    return {
      open: false,
      reason: authEnabled() || authMisconfigured() ? "not_configured" : "auth_off",
      message: unavailable,
    };
  }
  if (!signupAllowListConfigured()) {
    return {
      open: false,
      reason: "closed",
      message: "New accounts are created by invitation only. Ask your admin to add you.",
    };
  }
  const domains = allowedSignupDomains();
  return { open: true, ...(domains.length > 0 ? { allowedDomains: domains } : {}) };
}
