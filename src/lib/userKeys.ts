/**
 * Bring-your-own-key storage.
 *
 * Each user's provider API key (Gemini today) is stored in `user_api_keys`,
 * encrypted with AES-256-GCM under KEY_ENCRYPTION_SECRET (32 random bytes,
 * base64). Stored format, versioned so the scheme can change later:
 *
 *   v1:<iv base64>:<auth tag base64>:<ciphertext base64>
 *
 * A fresh 12-byte IV is used for every value, and the row's
 * "<userId>:<provider>" is bound in as additional authenticated data, so a
 * ciphertext copied onto another user's row fails to decrypt.
 *
 * Full keys are never logged or returned to the browser; only `key_hint`
 * (the last 4 characters) is.
 *
 * Everything here is only used when AUTH_ENABLED=1. With auth off,
 * getGeminiKeyFor() returns undefined and the agents fall back to
 * GEMINI_API_KEY from the environment, exactly as before.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getSupabase } from "@/lib/db";
import type { AppUser } from "@/lib/auth/session";

export type KeyProvider = "gemini";
export const KEY_PROVIDERS: readonly KeyProvider[] = ["gemini"] as const;

export function isKeyProvider(value: unknown): value is KeyProvider {
  return typeof value === "string" && (KEY_PROVIDERS as readonly string[]).includes(value);
}

const FORMAT_VERSION = "v1";
const IV_BYTES = 12;
const TAG_BYTES = 16;

// ---------------------------------------------------------------------------
// Encryption
// ---------------------------------------------------------------------------

function loadSecret(secret = process.env.KEY_ENCRYPTION_SECRET): Buffer {
  if (!secret) {
    throw new Error(
      "KEY_ENCRYPTION_SECRET is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    );
  }
  const key = Buffer.from(secret, "base64");
  if (key.length !== 32) {
    throw new Error("KEY_ENCRYPTION_SECRET must be 32 random bytes, base64-encoded.");
  }
  return key;
}

/** Encrypts `plaintext`. `aad` (optional) must be passed again to decrypt. */
export function encryptSecret(plaintext: string, aad?: string, secret?: string): string {
  const key = loadSecret(secret);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: TAG_BYTES });
  if (aad) cipher.setAAD(Buffer.from(aad, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [FORMAT_VERSION, iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(":");
}

/** Decrypts a value from encryptSecret(). Throws if it was tampered with or the secret/aad differ. */
export function decryptSecret(payload: string, aad?: string, secret?: string): string {
  const parts = payload.split(":");
  if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) {
    throw new Error("Unsupported encrypted key format.");
  }
  const key = loadSecret(secret);
  const iv = Buffer.from(parts[1], "base64");
  const tag = Buffer.from(parts[2], "base64");
  const ciphertext = Buffer.from(parts[3], "base64");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new Error("Unsupported encrypted key format.");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, iv, { authTagLength: TAG_BYTES });
  if (aad) decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    // Don't leak crypto internals; this means tampering or the wrong secret.
    throw new Error("Stored API key could not be decrypted (was KEY_ENCRYPTION_SECRET changed?).");
  }
}

function aadFor(userId: string, provider: KeyProvider): string {
  return `${userId}:${provider}`;
}

export function keyHint(plainKey: string): string {
  const trimmed = plainKey.trim();
  return trimmed.length <= 4 ? "…" : `…${trimmed.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

export interface KeyStatus {
  provider: KeyProvider;
  hasKey: boolean;
  hint: string | null;
  updatedAt: string | null;
}

export async function saveUserKey(userId: string, provider: KeyProvider, plainKey: string): Promise<KeyStatus> {
  const trimmed = plainKey.trim();
  if (!trimmed) throw new Error("API key is empty.");
  const now = new Date().toISOString();
  const hint = keyHint(trimmed);
  const { error } = await getSupabase()
    .from("user_api_keys")
    .upsert(
      {
        user_id: userId,
        provider,
        encrypted_key: encryptSecret(trimmed, aadFor(userId, provider)),
        key_hint: hint,
        updated_at: now,
      },
      { onConflict: "user_id,provider" }
    );
  if (error) throw new Error(`Could not save API key: ${error.message}`);
  return { provider, hasKey: true, hint, updatedAt: now };
}

export async function getUserKey(userId: string, provider: KeyProvider): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from("user_api_keys")
    .select("encrypted_key")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw new Error(`Could not read API key: ${error.message}`);
  if (!data) return null;
  return decryptSecret((data as { encrypted_key: string }).encrypted_key, aadFor(userId, provider));
}

export async function deleteUserKey(userId: string, provider: KeyProvider): Promise<void> {
  const { error } = await getSupabase()
    .from("user_api_keys")
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider);
  if (error) throw new Error(`Could not delete API key: ${error.message}`);
}

export async function getKeyStatus(userId: string): Promise<KeyStatus[]> {
  const { data, error } = await getSupabase()
    .from("user_api_keys")
    .select("provider, key_hint, updated_at")
    .eq("user_id", userId);
  if (error) throw new Error(`Could not read API key status: ${error.message}`);
  const rows = (data ?? []) as { provider: string; key_hint: string | null; updated_at: string | null }[];
  return KEY_PROVIDERS.map((provider) => {
    const row = rows.find((r) => r.provider === provider);
    return {
      provider,
      hasKey: Boolean(row),
      hint: row?.key_hint ?? null,
      updatedAt: row?.updated_at ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// The key the agents should use for a request
// ---------------------------------------------------------------------------

export class MissingApiKeyError extends Error {
  readonly code = "missing_api_key";
  readonly status = 412;
  constructor(message = "Add your Gemini API key in Settings before generating.") {
    super(message);
    this.name = "MissingApiKeyError";
  }
}

/**
 * Auth off (user === null): undefined, so generateStory/reviseStory/
 * bindCaseStudyLayout fall back to GEMINI_API_KEY from the environment.
 * Auth on: the user's decrypted Gemini key, or MissingApiKeyError.
 */
export async function getGeminiKeyFor(user: AppUser | null): Promise<string | undefined> {
  if (!user) return undefined;
  const key = await getUserKey(user.id, "gemini");
  if (!key) throw new MissingApiKeyError();
  return key;
}

/** Turns MissingApiKeyError into a 412 JSON reply with code 'missing_api_key'. */
export function missingApiKeyResponse(error: unknown): Response | null {
  if (error instanceof MissingApiKeyError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  return null;
}

/**
 * Makes one cheap, read-only Gemini request (list 1 model) with `key`.
 * Never throws and never echoes the key back.
 */
export async function testGeminiKey(key: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", {
      headers: { "x-goog-api-key": key.trim() },
      cache: "no-store",
    });
    if (res.ok) return { ok: true, message: "Key works. Gemini accepted it." };
    let detail = "";
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      detail = body.error?.message ?? "";
    } catch {
      // ignore unparsable body
    }
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      return { ok: false, message: detail || "Gemini rejected this key." };
    }
    return { ok: false, message: `Gemini returned HTTP ${res.status}${detail ? `: ${detail}` : ""}` };
  } catch (error) {
    return { ok: false, message: `Could not reach Gemini: ${error instanceof Error ? error.message : String(error)}` };
  }
}
