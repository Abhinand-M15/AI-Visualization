/**
 * The single place that holds the default image model ids and request limits.
 * Override the models with GEMINI_IMAGE_MODEL / OPENAI_IMAGE_MODEL (see .env.local.example).
 *
 * Model ids move quickly; if a provider retires one, set the env var instead of editing code.
 */
// The 2.5 family is being retired for new keys (gemini-2.5-flash already answers 404 "no longer
// available to new users"), so the default is the current flash image model.
export const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";
export const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-2";

/** Free option: Cloudflare Workers AI. Override with CLOUDFLARE_IMAGE_MODEL. */
export const DEFAULT_CLOUDFLARE_IMAGE_MODEL = "@cf/black-forest-labs/flux-2-klein-4b";

export function cloudflareImageModel(): string {
  return process.env.CLOUDFLARE_IMAGE_MODEL?.trim() || DEFAULT_CLOUDFLARE_IMAGE_MODEL;
}

export function geminiImageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL;
}

export function openaiImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_IMAGE_MODEL;
}

/** Contact sheet: four 960x536 panels in a 2x2 grid (both sides multiples of 16, within Cloudflare's 256-1920 range). */
export const SHEET_WIDTH = 1920;
export const SHEET_HEIGHT = 1072;

/** Per-request timeout. Image generation can take a while; two attempts must fit in maxDuration 300. */
export const IMAGE_REQUEST_TIMEOUT_MS = 100_000;
/** One retry on 429 / 5xx after this pause. */
export const IMAGE_RETRY_BACKOFF_MS = 2_500;

/** Text models (tried in order) used for the scene director that writes each chapter's scene brief. Override the first with GEMINI_TEXT_MODEL. */
export function geminiTextModels(): string[] {
  const override = process.env.GEMINI_TEXT_MODEL?.trim();
  // The lite model first: it answers in about a second and is rarely overloaded, and a
  // scene brief is a short task. "gemini-flash-latest" returned 503 (high demand) in testing.
  return [...(override ? [override] : []), "gemini-flash-lite-latest", "gemini-flash-latest"];
}

/** Per-model timeout for the scene director, so a stuck model falls through to the next one. */
export const DIRECTOR_MODEL_TIMEOUT_MS = 12_000;
