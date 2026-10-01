/**
 * Subdomain rules for published story sites. Pure and dependency-free, so it
 * runs identically in the browser (PublishDialog's live validation) and on the
 * server (the check and publish routes re-validate everything).
 *
 * Terminology:
 *  - name:  what the user types (e.g. "acme-hr"). Stored in projects.subdomain
 *           and used for the availability check against our DB.
 *  - label: PUBLISH_NAME_PREFIX + name (e.g. "warpdrive-acme-hr"). This is the
 *           Vercel project name and therefore the host label:
 *           `<label>.vercel.app` (or `<label>.<PUBLISH_BASE_DOMAIN>`).
 *
 * Vercel project names allow a-z, 0-9, ".", "_" and "-" (max 100, no "---");
 * ours is a strict subset that is also a valid DNS label (max 63 chars).
 */

/** Default prefix of every published site's label. Override with the PUBLISH_NAME_PREFIX env var (server). */
export const PUBLISH_NAME_PREFIX = "warpdrive-";

export const SUBDOMAIN_MIN_LENGTH = 3;
export const SUBDOMAIN_MAX_LENGTH = 40;
/** A DNS label can be at most 63 characters; prefix + name must fit. */
export const DNS_LABEL_MAX_LENGTH = 63;

/** Names that could be confused with the product, infrastructure or common service hosts. */
export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  "www", "app", "apps", "admin", "administrator", "api", "mail", "email", "smtp", "imap", "pop", "mx",
  "ftp", "ssh", "vpn", "ns", "ns1", "ns2", "dns", "cdn", "static", "assets", "media", "files", "img",
  "studio", "login", "logout", "signin", "signup", "register", "auth", "oauth", "sso", "account",
  "accounts", "dashboard", "console", "portal", "settings", "billing", "payment", "payments", "pay",
  "support", "help", "docs", "status", "dev", "test", "testing",
  "staging", "stage", "prod", "production", "preview", "demo", "beta", "internal", "localhost",
  "root", "system", "security", "abuse", "postmaster", "hostmaster", "webmaster", "noreply",
  "no-reply", "vercel", "now", "zeit", "next", "nextjs", "supabase", "google", "gemini", "warpdrive",
  "published", "stories", "index", "null", "undefined",
]);

export type SubdomainValidation = { ok: true; value: string } | { ok: false; value: string; reason: string };

/**
 * The prefix in effect. On the server PUBLISH_NAME_PREFIX (env) overrides the
 * default; in the browser the env var isn't visible, so the client receives
 * the effective prefix from GET /api/subdomains/check instead. An invalid
 * override (anything outside a-z, 0-9 and "-") falls back to the default.
 */
export function getPublishNamePrefix(): string {
  const raw = typeof process !== "undefined" ? process.env.PUBLISH_NAME_PREFIX : undefined;
  if (raw === undefined) return PUBLISH_NAME_PREFIX;
  const value = raw.trim().toLowerCase();
  if (value === "") return "";
  return /^[a-z0-9][a-z0-9-]{0,20}$/.test(value) && !value.includes("--") ? value : PUBLISH_NAME_PREFIX;
}

/** Longest name allowed with `prefix` so the label stays a valid DNS label. */
export function maxNameLength(prefix: string = PUBLISH_NAME_PREFIX): number {
  return Math.max(SUBDOMAIN_MIN_LENGTH, Math.min(SUBDOMAIN_MAX_LENGTH, DNS_LABEL_MAX_LENGTH - prefix.length));
}

/** Host label for a validated name: prefix + name. */
export function siteLabel(name: string, prefix: string = getPublishNamePrefix()): string {
  return `${prefix}${name}`;
}

/** Removes a pasted leading prefix (repeatedly, e.g. "warpdrive-warpdrive-acme"). */
export function stripNamePrefix(input: string, prefix: string = PUBLISH_NAME_PREFIX): string {
  if (!prefix) return input;
  let value = input;
  while (value.toLowerCase().startsWith(prefix)) value = value.slice(prefix.length);
  return value;
}

/**
 * Best-effort normalisation of free text into name shape: lowercase, accents
 * stripped, anything outside a-z/0-9 becomes a hyphen, hyphen runs collapsed,
 * ends trimmed. Does not enforce length or reserved names — run
 * validateSubdomain on the result.
 */
export function normalizeSubdomain(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Validates an already-typed name (without prefix). `input` is only lowercased and trimmed, never rewritten. */
export function validateSubdomain(input: string, prefix: string = PUBLISH_NAME_PREFIX): SubdomainValidation {
  const value = input.trim().toLowerCase();
  const max = maxNameLength(prefix);
  if (!value) return { ok: false, value, reason: "Enter a name." };
  if (value.length < SUBDOMAIN_MIN_LENGTH) {
    return { ok: false, value, reason: `Use at least ${SUBDOMAIN_MIN_LENGTH} characters.` };
  }
  if (value.length > max) {
    return { ok: false, value, reason: `Use at most ${max} characters.` };
  }
  if (!/^[a-z0-9-]+$/.test(value)) {
    return { ok: false, value, reason: "Use only lowercase letters, numbers and hyphens." };
  }
  if (value.startsWith("-") || value.endsWith("-")) {
    return { ok: false, value, reason: "It can't start or end with a hyphen." };
  }
  if (value.includes("--")) {
    return { ok: false, value, reason: "It can't contain two hyphens in a row." };
  }
  if (RESERVED_SUBDOMAINS.has(value)) {
    return { ok: false, value, reason: "That name is reserved. Try another." };
  }
  return { ok: true, value };
}

/**
 * Suggests a valid default name from a project title (e.g. "Acme Corp: Cloud
 * Migration!" → "acme-corp-cloud-migration"). Truncates on a word boundary
 * where possible and pads short/reserved results so the suggestion is always
 * valid.
 */
export function suggestSubdomain(title: string, prefix: string = PUBLISH_NAME_PREFIX): string {
  const max = maxNameLength(prefix);
  let candidate = normalizeSubdomain(stripNamePrefix(normalizeSubdomain(title), prefix));
  if (candidate.length > max) {
    const cut = candidate.slice(0, max);
    const lastHyphen = cut.lastIndexOf("-");
    candidate = (lastHyphen >= SUBDOMAIN_MIN_LENGTH ? cut.slice(0, lastHyphen) : cut).replace(/-+$/, "");
  }
  if (candidate.length < SUBDOMAIN_MIN_LENGTH || RESERVED_SUBDOMAINS.has(candidate)) {
    candidate = candidate ? `${candidate}-story` : "my-story";
  }
  return validateSubdomain(candidate, prefix).ok ? candidate : "my-story";
}

/**
 * Extracts the name from a site URL published as `<prefix><name><suffix>`
 * (suffix ".vercel.app" or ".<base domain>"). Null for anything else, e.g.
 * legacy story-<id> sites or local /published/ URLs.
 */
export function subdomainFromUrl(
  url: string | undefined | null,
  suffix: string,
  prefix: string = PUBLISH_NAME_PREFIX
): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    const normalizedSuffix = suffix.toLowerCase();
    if (!host.endsWith(normalizedSuffix)) return null;
    const label = host.slice(0, -normalizedSuffix.length);
    if (!label.startsWith(prefix)) return null;
    const name = label.slice(prefix.length);
    return validateSubdomain(name, prefix).ok ? name : null;
  } catch {
    return null;
  }
}
