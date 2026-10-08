/**
 * The single place that holds the default image model ids and request limits.
 * Override the models with GEMINI_IMAGE_MODEL / OPENAI_IMAGE_MODEL (see .env.local.example).
 *
 * Model ids move quickly; if a provider retires one, set the env var instead of editing code.
 */
export const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
export const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-2";

export function geminiImageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL;
}

export function openaiImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_IMAGE_MODEL;
}

/** Per-request timeout. Image generation can take a while; two attempts must fit in maxDuration 300. */
export const IMAGE_REQUEST_TIMEOUT_MS = 100_000;
/** One retry on 429 / 5xx after this pause. */
export const IMAGE_RETRY_BACKOFF_MS = 2_500;

/** Text models (tried in order) used for the scene director that writes each chapter's scene brief. Override the first with GEMINI_TEXT_MODEL. */
export function geminiTextModels(): string[] {
  const override = process.env.GEMINI_TEXT_MODEL?.trim();
  return [...(override ? [override] : []), "gemini-flash-latest", "gemini-flash-lite-latest"];
}
