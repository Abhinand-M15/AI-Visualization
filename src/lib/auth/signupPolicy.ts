/**
 * Who may create an account (SEC-10, AR-03). Server-side only (reads env).
 *
 *   SIGNUP_ALLOWED_EMAIL_DOMAINS  comma list of domains, e.g. "warpdrive.ai, scotty-world.com"
 *   SIGNUP_ALLOWED_EMAILS         comma list of exact addresses, e.g. "a@x.com, b@y.com"
 *
 * Both unset: sign-up is CLOSED (only the admin can add users, in the Supabase
 * dashboard). A domain match lets anyone who can type an address at that
 * domain register (there is no confirmation email), so prefer the exact list
 * for small teams.
 *
 *   AUTH_ENFORCE_ALLOWLIST=1      also refuse sign-in for existing accounts that
 *                                 are not on the list (for accounts created
 *                                 before the list existed). Off by default so
 *                                 the owner is not locked out by a short list.
 */

function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/[,\s;]+/)
        .map((item) => item.trim().toLowerCase().replace(/^@+/, ""))
        .filter(Boolean)
    )
  );
}

export function allowedSignupDomains(): string[] {
  return parseList(process.env.SIGNUP_ALLOWED_EMAIL_DOMAINS);
}

export function allowedSignupEmails(): string[] {
  return parseList(process.env.SIGNUP_ALLOWED_EMAILS);
}

/** True when an allow-list exists at all (otherwise sign-up is closed). */
export function signupAllowListConfigured(): boolean {
  return allowedSignupDomains().length > 0 || allowedSignupEmails().length > 0;
}

/** Lower-cased, trimmed; null when it is not a plausible single address. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

/** Whether `email` is on the allow-list (exact address, or its domain). False when no list is set. */
export function isEmailAllowed(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  if (allowedSignupEmails().includes(normalized)) return true;
  const domain = normalized.slice(normalized.lastIndexOf("@") + 1);
  return allowedSignupDomains().includes(domain);
}

export function enforceAllowListOnSignIn(): boolean {
  return process.env.AUTH_ENFORCE_ALLOWLIST === "1" && signupAllowListConfigured();
}
