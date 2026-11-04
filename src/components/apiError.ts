/**
 * Client-side error helpers (UX-06): every fetch on the app's own pages goes
 * through these so users never see raw server text (JSON blobs, "Unexpected
 * token", stack-ish messages or environment variable names) and key problems
 * always come with a way to Settings.
 */

/** Codes the server uses for a missing / rejected API key (both spellings are accepted). */
const MISSING_KEY_CODES = new Set(["missing_key", "missing_api_key"]);
const INVALID_KEY_CODES = new Set(["invalid_key", "invalid_api_key"]);

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly status?: number,
    /** The whole JSON error body (extra fields such as `missing` ids). */
    readonly data?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** True when the fix is in Settings (no key saved, or the saved key was rejected). */
export function isKeyProblem(code: string | undefined | null): boolean {
  return Boolean(code) && (MISSING_KEY_CODES.has(code as string) || INVALID_KEY_CODES.has(code as string));
}

/** Where to send the user for a key problem. */
export function settingsHrefFor(code: string | undefined | null): string {
  return code && MISSING_KEY_CODES.has(code) ? "/settings?onboarding=1" : "/settings";
}

const GENERIC = "Something went wrong on the server. Try again in a moment.";
const TIMEOUT = "The server took too long or stopped responding. Try again.";
const OFFLINE = "Couldn't reach the server. Check your connection and try again.";
const MISCONFIGURED = "The server isn't fully set up for this yet. Ask your admin to check its settings.";

/** Messages that are developer detail, not something a user can act on. */
function looksTechnical(message: string): boolean {
  return (
    // ENV_VAR_NAMES such as SUPABASE_URL or GEMINI_API_KEY
    /\b[A-Z][A-Z0-9]+_[A-Z0-9_]{2,}\b/.test(message) ||
    /\.env(\.local)?\b/.test(message) ||
    /Unexpected token|is not valid JSON|JSON\.parse|Failed to execute|TypeError|ReferenceError|stack/i.test(message) ||
    /[{[]\s*"/.test(message) ||
    message.length > 300
  );
}

/** Codes whose fixed wording always wins (the fix is in Settings). */
function keyMessage(code: string | undefined): string | null {
  if (code && MISSING_KEY_CODES.has(code)) return "Add your Gemini API key in Settings to continue.";
  if (code && INVALID_KEY_CODES.has(code)) return "Your Gemini API key was rejected. Check or replace it in Settings.";
  return null;
}

/** Plain wording for a code when the server sent no usable message. */
function messageForCode(code: string | undefined, status: number | undefined): string | null {
  switch (code) {
    case "quota_exceeded":
    case "provider_quota":
      return "Your Gemini key has reached its usage limit for now. Wait a while, or use another key in Settings.";
    case "rate_limited":
      return "Too many requests in a short time. Wait a minute and try again.";
    case "model_busy":
      return "The AI model is busy right now. Try again in a minute.";
    case "timeout":
      return TIMEOUT;
    case "not_configured":
    case "auth_misconfigured":
      return MISCONFIGURED;
    case "account_not_allowed":
      return "This account isn't allowed to use the app. Ask your admin for access.";
    case "forbidden_origin":
      return "The request was blocked because it didn't come from this app. Reload the page and try again.";
    case "payload_too_large":
      return "That file is too large to upload.";
    case "unsupported_file":
      return "That file type isn't supported.";
    case "publish_in_progress":
      return "This story is being published right now. Wait for it to finish, then try again.";
    case "unauthorized":
      return "Your session has ended. Log in again to continue.";
    default:
      break;
  }
  if (status === 504 || status === 502 || status === 408) return TIMEOUT;
  if (status === 401) return "Your session has ended. Log in again to continue.";
  return null;
}

/** Turns a server message + code into something a user can read and act on. */
export function friendlyMessage(message: string | undefined | null, code?: string, status?: number, fallback = GENERIC): string {
  const byKey = keyMessage(code);
  if (byKey) return byKey;
  const text = (message ?? "").trim();
  const usable = text && !/_URL\b|_KEY\b|_TOKEN\b|_SECRET\b|\.env/.test(text) && !looksTechnical(text);
  if (usable) return text;
  const byCode = messageForCode(code, status);
  if (byCode) return byCode;
  if (!text) return fallback;
  if (/_URL\b|_KEY\b|_TOKEN\b|_SECRET\b|\.env/.test(text)) return MISCONFIGURED;
  if (looksTechnical(text)) return fallback;
  return text;
}

/** Message for any thrown value (ApiError keeps its already friendly message). */
export function errorMessage(error: unknown, fallback = GENERIC): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof DOMException && error.name === "AbortError") return "Cancelled.";
  if (error instanceof TypeError) return OFFLINE; // fetch() network failure
  if (error instanceof Error) return friendlyMessage(error.message, undefined, undefined, fallback);
  return fallback;
}

export function errorCode(error: unknown): string | undefined {
  return error instanceof ApiError ? error.code : undefined;
}

/**
 * Reads a JSON reply without ever surfacing a parse error: a timeout page or
 * an HTML error page becomes a plain "took too long" message.
 * Throws ApiError (friendly message, server code, HTTP status) when !res.ok.
 */
export async function readJson<T = Record<string, unknown>>(res: Response, fallback?: string): Promise<T> {
  let data: (T & { error?: unknown; code?: unknown }) | null = null;
  try {
    data = (await res.json()) as T & { error?: unknown; code?: unknown };
  } catch {
    if (!res.ok) throw new ApiError(res.status >= 500 || res.status === 408 ? TIMEOUT : fallback ?? GENERIC, undefined, res.status);
    throw new ApiError(TIMEOUT, "bad_response", res.status);
  }
  if (!res.ok) {
    const code = typeof data?.code === "string" ? data.code : undefined;
    const raw = typeof data?.error === "string" ? data.error : undefined;
    let message = friendlyMessage(raw, code, res.status, fallback);
    // Server errors carry a reference id the admin can look up in the logs.
    const rawId = (data as unknown as { requestId?: unknown } | null)?.requestId;
    const requestId = typeof rawId === "string" ? rawId : "";
    if (requestId && !message.includes(requestId)) message = `${message} (reference ${requestId})`;
    throw new ApiError(message, code, res.status, data as Record<string, unknown>);
  }
  return data as T;
}

/** Error line of an NDJSON stream ({ type: "error", message, code }) as a friendly ApiError. */
export function streamError(message: unknown, code: unknown, fallback?: string): ApiError {
  const safeCode = typeof code === "string" ? code : undefined;
  return new ApiError(friendlyMessage(typeof message === "string" ? message : "", safeCode, undefined, fallback), safeCode);
}

/** True for "the AI / image provider is out of quota or rate limited: try later" codes. */
export function isQuotaProblem(code: string | undefined | null): boolean {
  return code === "quota_exceeded" || code === "provider_quota" || code === "rate_limited";
}

/** fetch() + readJson(), with network failures turned into a plain message. */
export async function requestJson<T = Record<string, unknown>>(
  input: string,
  init?: RequestInit,
  fallback?: string
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(OFFLINE, "network");
  }
  return readJson<T>(res, fallback);
}

/** For streaming routes: throws a friendly ApiError when the reply is not OK, otherwise returns it untouched. */
export async function ensureOk(res: Response, fallback?: string): Promise<Response> {
  if (res.ok) return res;
  await readJson(res, fallback);
  return res; // unreachable: readJson throws for !res.ok
}
