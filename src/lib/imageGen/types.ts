/**
 * Image generation contract. Owned by stage S3 (docs/DOMAINS_PLAN.md).
 * Providers live in gemini.ts / openai.ts; default model ids in constants.ts.
 */
import type { AppUser } from "@/lib/auth/session";
import { MissingApiKeyError, getImageProviderFor, getUserKey } from "@/lib/userKeys";
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
    aspect?: "16:9" | "1:1" | "3:4";
  }): Promise<{ mimeType: string; data: Buffer }>;
}

/**
 * Provider from profiles.image_provider (default "gemini"; also "gemini" when auth is off
 * or the column is missing). Key from user_api_keys via userKeys.ts (with auth off, Gemini
 * falls back to GEMINI_API_KEY from the environment). Throws MissingApiKeyError (HTTP 412,
 * code 'missing_api_key') when the needed key is missing.
 */
export async function getImageGeneratorFor(user: AppUser | null): Promise<ImageGenerator> {
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
