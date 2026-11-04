/**
 * Per-user rate limits and daily quotas on the shared, owner-funded pools
 * (SEC-11, AR-03): publishing (Vercel projects and deployments), scene and
 * avatar images (the shared Cloudflare allowance), narration (the Edge TTS
 * endpoint), story generation, voice previews and key tests.
 *
 * Counters live in public.usage_counters and are bumped atomically by the
 * public.consume_quota() function (db/migrations/006_security_hardening.sql).
 * Until 006 is applied the function is missing: every check then FAILS OPEN
 * (allowed, logged once), so the live app keeps working.
 *
 * Limits can be tuned with env variables (see QUOTAS below); 0 disables a limit.
 * With accounts off (local development, user === null) nothing is counted.
 */
import { getSupabase } from "@/lib/db";
import type { AppUser } from "@/lib/auth/session";
import { HttpError } from "@/lib/server/errors";

export type QuotaKind =
  | "publish"
  | "new_site"
  | "image"
  | "tts_chars"
  | "generation"
  | "voice_preview"
  | "key_test";

interface QuotaRule {
  env: string;
  defaultLimit: number;
  windowSeconds: number;
  /** Message when the limit is hit. */
  message: string;
}

const DAY = 24 * 60 * 60;

export const QUOTAS: Record<QuotaKind, QuotaRule> = {
  publish: {
    env: "QUOTA_PUBLISHES_PER_DAY",
    defaultLimit: 30,
    windowSeconds: DAY,
    message: "You have published the maximum number of times for today. Try again tomorrow (the limit resets at 00:00 UTC).",
  },
  new_site: {
    env: "QUOTA_NEW_SITES_PER_DAY",
    defaultLimit: 5,
    windowSeconds: DAY,
    message: "You have created the maximum number of new site addresses for today. Republish an existing address, or try again tomorrow.",
  },
  image: {
    env: "QUOTA_IMAGES_PER_DAY",
    defaultLimit: 60,
    windowSeconds: DAY,
    message: "You have used your scene-image allowance for today. It resets at 00:00 UTC (05:30 IST).",
  },
  tts_chars: {
    env: "QUOTA_TTS_CHARS_PER_DAY",
    defaultLimit: 300_000,
    windowSeconds: DAY,
    message: "You have used your narration allowance for today. It resets at 00:00 UTC (05:30 IST).",
  },
  generation: {
    env: "QUOTA_GENERATIONS_PER_DAY",
    defaultLimit: 60,
    windowSeconds: DAY,
    message: "You have generated the maximum number of stories for today. Try again tomorrow.",
  },
  voice_preview: {
    env: "QUOTA_VOICE_PREVIEWS_PER_MINUTE",
    defaultLimit: 20,
    windowSeconds: 60,
    message: "Too many voice previews in a short time. Wait a minute and try again.",
  },
  key_test: {
    env: "QUOTA_KEY_TESTS_PER_HOUR",
    defaultLimit: 15,
    windowSeconds: 60 * 60,
    message: "Too many key tests in a short time. Wait a while and try again.",
  },
};

export function quotaLimit(kind: QuotaKind): number {
  const raw = process.env[QUOTAS[kind].env];
  if (raw !== undefined && raw.trim() !== "") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
  }
  return QUOTAS[kind].defaultLimit;
}

export class QuotaExceededError extends HttpError {
  constructor(kind: QuotaKind, used: number, limit: number) {
    const windowSeconds = QUOTAS[kind].windowSeconds;
    super(429, windowSeconds < DAY ? "rate_limited" : "quota_exceeded", QUOTAS[kind].message, {
      quota: kind,
      used,
      limit,
      resetsAt: windowEnd(windowSeconds),
    });
    this.name = "QuotaExceededError";
  }
}

function windowEnd(windowSeconds: number): string {
  const nowSec = Math.floor(Date.now() / 1000);
  return new Date((Math.floor(nowSec / windowSeconds) + 1) * windowSeconds * 1000).toISOString();
}

let missingWarned = false;

function isMissingFunction(error: { code?: string | null; message?: string | null }): boolean {
  return (
    ["42883", "42P01", "PGRST202", "PGRST205"].includes(error.code ?? "") ||
    /could not find the function|does not exist|schema cache/i.test(error.message ?? "")
  );
}

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
}

/**
 * Adds `amount` to the user's counter for `kind` when it stays within the
 * limit. Never throws: database problems and a missing migration allow the
 * request (fail open), because these limits protect free pools, not data.
 */
export async function consumeQuota(user: AppUser | null, kind: QuotaKind, amount = 1): Promise<QuotaResult> {
  const limit = quotaLimit(kind);
  if (!user || limit === 0 || amount <= 0) return { allowed: true, used: 0, limit };
  try {
    const { data, error } = await getSupabase().rpc("consume_quota", {
      p_user: user.id,
      p_kind: kind,
      p_window_seconds: QUOTAS[kind].windowSeconds,
      p_amount: Math.ceil(amount),
      p_limit: limit,
    });
    if (error) {
      if (isMissingFunction(error)) {
        if (!missingWarned) {
          missingWarned = true;
          console.warn("quota: consume_quota() is missing (migration 006 not applied); limits are not enforced.");
        }
      } else {
        console.error(`quota: ${kind} check failed (allowing):`, error.message);
      }
      return { allowed: true, used: 0, limit };
    }
    const row = (Array.isArray(data) ? data[0] : data) as { allowed?: boolean; used?: number | string } | null;
    return { allowed: row?.allowed !== false, used: Number(row?.used ?? 0), limit };
  } catch (error) {
    console.error(`quota: ${kind} check failed (allowing):`, error instanceof Error ? error.message : error);
    return { allowed: true, used: 0, limit };
  }
}

/** consumeQuota(), throwing QuotaExceededError (429, code quota_exceeded / rate_limited) when over. */
export async function requireQuota(user: AppUser | null, kind: QuotaKind, amount = 1): Promise<void> {
  const result = await consumeQuota(user, kind, amount);
  if (!result.allowed) throw new QuotaExceededError(kind, result.used, result.limit);
}
