/**
 * Turns Supabase Auth errors into short, friendly messages for the auth forms.
 * Supabase returns a machine-readable `code` (e.g. "invalid_credentials") on
 * AuthApiError; older servers only send a message, so both are checked.
 */

export type AuthErrorKind =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "rate_limited"
  | "user_exists"
  | "weak_password"
  | "same_password"
  | "invalid_email"
  | "signup_disabled"
  | "session_missing"
  | "network"
  | "unknown";

export interface FriendlyAuthError {
  kind: AuthErrorKind;
  message: string;
}

interface AuthErrorLike {
  code?: string;
  status?: number;
  message?: string;
  name?: string;
}

export function friendlyAuthError(error: unknown): FriendlyAuthError {
  const e = (error ?? {}) as AuthErrorLike;
  const code = e.code ?? "";
  const msg = (e.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return { kind: "invalid_credentials", message: "That email and password don't match. Check them and try again." };
  }
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return {
      kind: "email_not_confirmed",
      message: "Please confirm your email first. Check your inbox for the confirmation link.",
    };
  }
  if (
    e.status === 429 ||
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    code === "over_sms_send_rate_limit" ||
    msg.includes("rate limit") ||
    msg.includes("only request this after")
  ) {
    return {
      kind: "rate_limited",
      message: "Too many attempts in a short time. Please wait a minute and try again.",
    };
  }
  if (code === "user_already_exists" || code === "email_exists" || msg.includes("already registered")) {
    return {
      kind: "user_exists",
      message: "An account with this email already exists. Try logging in instead.",
    };
  }
  if (code === "weak_password" || msg.includes("password should")) {
    return {
      kind: "weak_password",
      message: "That password is too weak. Use at least 8 characters with a mix of letters, numbers and symbols.",
    };
  }
  if (code === "same_password") {
    return { kind: "same_password", message: "Your new password must be different from your current one." };
  }
  if (code === "email_address_invalid" || code === "validation_failed" || msg.includes("invalid email")) {
    return { kind: "invalid_email", message: "Please enter a valid email address." };
  }
  if (code === "signup_disabled" || code === "email_provider_disabled") {
    return { kind: "signup_disabled", message: "New sign-ups are turned off right now." };
  }
  if (code === "session_not_found" || code === "session_expired" || e.name === "AuthSessionMissingError") {
    return {
      kind: "session_missing",
      message: "Your reset link has expired or was already used. Request a new one.",
    };
  }
  if (e.name === "AuthRetryableFetchError" || msg.includes("failed to fetch") || msg.includes("network")) {
    return { kind: "network", message: "Couldn't reach the sign-in service. Check your connection and try again." };
  }
  return { kind: "unknown", message: e.message || "Something went wrong. Please try again." };
}

/** Messages for `?error=` codes the callback route puts on redirects. */
export const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  link_invalid: "That link is invalid or has expired. Please request a new one.",
  link_expired: "That reset link has expired or was already used. Request a new one below.",
  confirm_failed:
    "We couldn't finish confirming your email from that link. If you already confirmed, just log in; otherwise request a new confirmation email.",
};
