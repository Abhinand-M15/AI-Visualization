/**
 * Image generation contract. Owned by stage S3 (docs/DOMAINS_PLAN.md).
 * Providers live in gemini.ts / openai.ts; default model ids in constants.ts.
 */
import type { AppUser } from "@/lib/auth/session";
import { MissingApiKeyError, getImageProviderFor, getUserKey } from "@/lib/userKeys";
import { cloudflareConfigured, createCloudflareImageGenerator } from "./cloudflare";
import { createGeminiImageGenerator } from "./gemini";
import { createOpenAIImageGenerator } from "./openai";

export type ImageProviderId = "gemini" | "openai";

export interface ImageGenerator {
  generate(opts: {
    prompt: string;
    /** When given, the model is asked to keep the same character as this image. */
    referenceImage?: { mimeType: string; data: Buffer };
    /**
     * Several references (e.g. character first, company logo second). When non-empty it
     * takes precedence over referenceImage; order is kept.
     */
    referenceImages?: { mimeType: string; data: Buffer }[];
    /**
     * "sheet" is a contact sheet: ONE image holding a 2x2 grid of four 16:9 panels, cropped
     * into four pictures afterwards (src/lib/sheetCrop.ts). Providers map it to their widest
     * landscape size; `size` (when the provider honours it) overrides that.
     */
    aspect?: "16:9" | "1:1" | "3:4" | "sheet";
    /** Explicit output size in pixels. Only Cloudflare uses it (clamped to 256-1920, multiples of 16); others pick the nearest of their own sizes. */
    size?: { width: number; height: number };
  }): Promise<{ mimeType: string; data: Buffer }>;
}

/**
 * Provider from profiles.image_provider (default "gemini"; also "gemini" when auth is off
 * or the column is missing). Key from user_api_keys via userKeys.ts (with auth off, Gemini
 * falls back to GEMINI_API_KEY from the environment). Throws MissingApiKeyError (HTTP 412,
 * code 'missing_api_key') when the needed key is missing.
 */
export async function getImageGeneratorFor(user: AppUser | null): Promise<ImageGenerator> {
  // Free option first: when Cloudflare Workers AI credentials are set on the server, every
  // user generates through it (no personal image key needed, nothing paid).
  if (cloudflareConfigured()) {
    return createCloudflareImageGenerator(process.env.CLOUDFLARE_ACCOUNT_ID!.trim(), process.env.CLOUDFLARE_API_TOKEN!.trim());
  }
  if (!user) {
    const envKey = process.env.GEMINI_API_KEY?.trim();
    if (!envKey) throw new MissingApiKeyError("GEMINI_API_KEY is not set on the server, so images cannot be generated.");
    return createGeminiImageGenerator(envKey);
  }
  let provider: ImageProviderId = "gemini";
  try {
    provider = await getImageProviderFor(user.id);
  } catch {
    provider = "gemini";
  }
  const key = await getUserKey(user.id, provider);
  if (!key) throw new MissingApiKeyError(undefined, provider);
  return provider === "openai" ? createOpenAIImageGenerator(key) : createGeminiImageGenerator(key);
}
