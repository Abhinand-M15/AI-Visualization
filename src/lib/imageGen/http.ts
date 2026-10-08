/**
 * Shared HTTP helper for the image providers: request timeout plus one retry on 429 / 5xx.
 * Errors never include request headers (so API keys cannot leak into messages).
 */
import { IMAGE_REQUEST_TIMEOUT_MS, IMAGE_RETRY_BACKOFF_MS } from "./constants";

export class ImageGenerationError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ImageGenerationError";
    this.status = status;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryAfterMs(res: Response): number {
  const header = Number(res.headers.get("retry-after"));
  if (Number.isFinite(header) && header > 0) return Math.min(header * 1000, 10_000);
  return IMAGE_RETRY_BACKOFF_MS;
}

/**
 * fetch with a timeout; retries once on network error/timeout, 429 or 5xx. Returns the final
 * Response (possibly non-OK) so the caller can turn the body into a clear message.
 * `init` is a factory so a fresh body (e.g. FormData) is built per attempt.
 */
export async function fetchWithRetry(
  provider: string,
  url: string,
  init: () => RequestInit
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { ...init(), signal: AbortSignal.timeout(IMAGE_REQUEST_TIMEOUT_MS) });
      if ((res.status === 429 || res.status >= 500) && attempt === 0) {
        const wait = retryAfterMs(res);
        await res.arrayBuffer().catch(() => undefined);
        await sleep(wait);
        continue;
      }
      return res;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await sleep(IMAGE_RETRY_BACKOFF_MS);
    }
  }
  const timedOut = lastError instanceof Error && (lastError.name === "TimeoutError" || lastError.name === "AbortError");
  throw new ImageGenerationError(
    timedOut
      ? `${provider} did not answer in time. Try again.`
      : `Could not reach ${provider}: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

/** Pulls the error message and code out of a JSON error body, if there is one. */
export async function errorDetail(res: Response): Promise<{ message: string; code?: string }> {
  try {
    const text = await res.text();
    try {
      const body = JSON.parse(text) as { error?: { message?: string; code?: string | number; status?: string } };
      return {
        message: body.error?.message ?? text.slice(0, 300),
        code: body.error?.code !== undefined ? String(body.error.code) : body.error?.status,
      };
    } catch {
      return { message: text.slice(0, 300) };
    }
  } catch {
    return { message: "" };
  }
}

/** Maps an image's mime type to a file extension (png/jpg/webp; default png). */
export function extensionForMime(mimeType: string): string {
  const m = mimeType.toLowerCase();
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  if (m.includes("webp")) return "webp";
  return "png";
}

export type ReferenceImage = { mimeType: string; data: Buffer };

/** The references of a request in order: referenceImages when non-empty, else the single referenceImage. */
export function collectReferences(opts: { referenceImage?: ReferenceImage; referenceImages?: ReferenceImage[] }): ReferenceImage[] {
  if (opts.referenceImages && opts.referenceImages.length > 0) return opts.referenceImages;
  return opts.referenceImage ? [opts.referenceImage] : [];
}
