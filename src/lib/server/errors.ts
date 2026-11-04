/**
 * User-safe API errors (SEC-15, UX-06).
 *
 * Routes throw HttpError (or a ProviderError from a Gemini / OpenAI /
 * Cloudflare / TTS / Vercel call) and turn anything they catch into a reply
 * with apiErrorResponse(). Replies are always JSON:
 *
 *   { error: string, code: ErrorCode, requestId?: string, ...extra }
 *
 * `error` is plain language for people; it never contains environment variable
 * names, table or column names, provider payloads or stack traces. Unknown
 * errors are logged on the server with a short request id and the reply only
 * carries that id.
 */
import { randomBytes } from "node:crypto";
import { unauthorizedResponse } from "@/lib/auth/session";
import { MissingApiKeyError } from "@/lib/userKeys";

/**
 * Codes the UI can route on. Key problems (missing_api_key, invalid_key) send
 * the user to Settings; quota_exceeded / rate_limited say when to retry.
 */
export type ErrorCode =
  | "bad_request"
  | "unauthorized"
  | "account_not_allowed"
  | "forbidden_origin"
  | "auth_misconfigured"
  | "not_found"
  | "conflict"
  | "payload_too_large"
  | "unsupported_file"
  | "missing_api_key"
  | "invalid_key"
  | "provider_quota"
  | "quota_exceeded"
  | "rate_limited"
  | "model_busy"
  | "timeout"
  | "provider_error"
  | "not_configured"
  | "narration_incomplete"
  | "publish_in_progress"
  | "site_name_taken"
  | "signup_closed"
  | "email_not_allowed"
  | "invalid_email"
  | "weak_password"
  | "user_exists"
  | "server_error";

export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly extra?: Record<string, unknown>;
  constructor(status: number, code: ErrorCode, message: string, extra?: Record<string, unknown>) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export function badRequest(message: string, extra?: Record<string, unknown>): HttpError {
  return new HttpError(400, "bad_request", message, extra);
}

export function notFound(message = "Not found."): HttpError {
  return new HttpError(404, "not_found", message);
}

// ---------------------------------------------------------------------------
// Provider errors
// ---------------------------------------------------------------------------

export type ProviderName = "gemini" | "openai" | "cloudflare" | "tts" | "vercel";

const PROVIDER_LABEL: Record<ProviderName, string> = {
  gemini: "Gemini",
  openai: "OpenAI",
  cloudflare: "the image service",
  tts: "the narration service",
  vercel: "the hosting service",
};

/** A failed call to an outside service, already turned into a user-safe message and code. */
export class ProviderError extends HttpError {
  readonly provider: ProviderName;
  readonly retryable: boolean;
  constructor(provider: ProviderName, status: number, code: ErrorCode, message: string, retryable: boolean, cause?: unknown) {
    super(status, code, message);
    this.name = "ProviderError";
    this.provider = provider;
    this.retryable = retryable;
    if (cause !== undefined) (this as { cause?: unknown }).cause = cause;
  }
}

function statusOf(error: unknown): number | null {
  const e = error as { status?: unknown; code?: unknown; message?: unknown } | null;
  if (e && typeof e.status === "number") return e.status;
  if (e && typeof e.code === "number" && e.code >= 400 && e.code < 600) return e.code;
  const message = typeof e?.message === "string" ? e.message : "";
  const match = /"code"\s*:\s*(4\d\d|5\d\d)|\bHTTP (4\d\d|5\d\d)\b|\bstatus(?: code)? (4\d\d|5\d\d)\b|^\[?(4\d\d|5\d\d)\b/.exec(message);
  const raw = match?.[1] ?? match?.[2] ?? match?.[3] ?? match?.[4];
  return raw ? Number(raw) : null;
}

function rawMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "");
}

/**
 * Classifies any error thrown by a provider SDK or fetch into a ProviderError.
 * ProviderErrors and HttpErrors pass through unchanged.
 */
export function toProviderError(error: unknown, provider: ProviderName): HttpError {
  if (error instanceof HttpError) return error;
  if (error instanceof MissingApiKeyError) {
    return new HttpError(error.status, "missing_api_key", error.message);
  }
  const label = PROVIDER_LABEL[provider];
  const message = rawMessage(error);
  const lower = message.toLowerCase();
  const status = statusOf(error);
  const name = (error as { name?: string } | null)?.name ?? "";

  if (name === "AbortError" || name === "TimeoutError" || /timed out|timeout|deadline/.test(lower)) {
    return new ProviderError(provider, 504, "timeout", `${capitalise(label)} took too long to answer. Try again.`, true, error);
  }
  const keyRejected =
    /api[_ ]?key[_ ]?invalid|api key not valid|invalid api key|incorrect api key|invalid_api_key|permission_denied|unauthenticated/.test(lower) ||
    status === 401 ||
    (status === 403 && provider !== "vercel");
  if (keyRejected && (provider === "gemini" || provider === "openai")) {
    return new ProviderError(
      provider,
      422,
      "invalid_key",
      `Your ${label} API key was rejected. Check it in Settings, or create a new one.`,
      false,
      error
    );
  }
  if (/declined|safety system|moderation|content policy|blockreason|prohibited/.test(lower)) {
    return new ProviderError(
      provider,
      422,
      "provider_error",
      `${capitalise(label)} declined this content. Reword the chapter text and try again.`,
      false,
      error
    );
  }
  if (status === 429 || /resource_exhausted|quota|rate limit|too many requests/.test(lower)) {
    const message =
      provider === "gemini" || provider === "openai"
        ? `Your ${label} key has hit its usage limit. Wait a minute and try again, or check your quota with ${label}.`
        : provider === "cloudflare"
          ? "The free daily image allowance is used up. It resets at 00:00 UTC (05:30 IST)."
          : `${capitalise(label)} is limiting requests right now. Wait a minute and try again.`;
    return new ProviderError(provider, 429, "provider_quota", message, provider !== "cloudflare", error);
  }
  if ((status !== null && status >= 500) || /unavailable|overloaded|high demand|internal error|econnreset|fetch failed|socket hang up/.test(lower)) {
    return new ProviderError(provider, 503, "model_busy", `${capitalise(label)} is busy or unreachable right now. Try again in a minute.`, true, error);
  }
  if (keyRejected) {
    return new ProviderError(provider, 502, "provider_error", `${capitalise(label)} refused the request. Ask your admin to check its access.`, false, error);
  }
  if (status !== null && status >= 400) {
    return new ProviderError(provider, 502, "provider_error", `${capitalise(label)} could not handle this request.`, false, error);
  }
  return new ProviderError(provider, 502, "provider_error", `${capitalise(label)} failed. Try again.`, true, error);
}

/** True when trying the same call again might work (network, 5xx, 429, timeouts). */
export function isRetryableProviderError(error: unknown, provider: ProviderName): boolean {
  const classified = toProviderError(error, provider);
  return classified instanceof ProviderError ? classified.retryable : false;
}

/** A provider that is not set up on this server (never names the env variable). */
export function notConfigured(what: string): HttpError {
  return new HttpError(503, "not_configured", `${capitalise(what)} is not set up on this server yet. Ask your admin.`);
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------------------------------------------------------------------------
// Replies
// ---------------------------------------------------------------------------

export function newRequestId(): string {
  return randomBytes(4).toString("hex");
}

/** JSON body for an error (for NDJSON streams too). Logs unexpected errors with a request id. */
export function errorBody(error: unknown, label: string): { status: number; body: Record<string, unknown> } {
  const auth = unauthorizedResponse(error);
  if (auth) {
    const e = error as { message: string; code: string; status: number };
    return { status: e.status, body: { error: e.message, code: e.code } };
  }
  if (error instanceof MissingApiKeyError) {
    return { status: error.status, body: { error: error.message, code: error.code } };
  }
  if (error instanceof HttpError) {
    if (error instanceof ProviderError) {
      console.error(`${label} failed (${error.provider} ${error.code}):`, (error as { cause?: unknown }).cause ?? error.message);
    }
    return { status: error.status, body: { error: error.message, code: error.code, ...(error.extra ?? {}) } };
  }
  const requestId = newRequestId();
  console.error(`${label} failed [${requestId}]:`, error);
  return {
    status: 500,
    body: { error: `Something went wrong on the server. Try again (reference ${requestId}).`, code: "server_error", requestId },
  };
}

export function apiErrorResponse(error: unknown, label: string): Response {
  const { status, body } = errorBody(error, label);
  return Response.json(body, { status });
}
