/**
 * Cloudflare Workers AI image generation (FLUX.2 klein by default), the free option:
 * the Workers Free plan includes 10,000 Neurons per day, enough for dozens of images.
 *
 * Server-wide credentials (not per user): CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN.
 * Reference images go in as multipart fields input_image_0 .. input_image_3 (max 4, each
 * must be smaller than 512x512, so they are downscaled here). The model refers to them by
 * 0-based index, while the stored prompts count from 1, so "image 1" / "image 2" in the
 * prompt text is renumbered to "image 0" / "image 1" before sending.
 */
import type { ImageGenerator } from "./types";
import { SHEET_HEIGHT, SHEET_WIDTH, cloudflareImageModel } from "./constants";
import { ImageGenerationError, collectReferences, fetchWithRetry } from "./http";

type GenerateOpts = Parameters<ImageGenerator["generate"]>[0];

/** Largest side of a reference image sent to Cloudflare (the API wants them under 512). */
const MAX_REFERENCE_SIDE = 480;

export function cloudflareConfigured(): boolean {
  return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID?.trim() && process.env.CLOUDFLARE_API_TOKEN?.trim());
}

const CF_MIN_SIDE = 256;
const CF_MAX_SIDE = 1920;

/** An explicit size forced into the API's range: 256-1920 per side, multiples of 16. */
export function clampCloudflareSize(size: { width: number; height: number }): { width: number; height: number } {
  const fit = (n: number) => Math.min(CF_MAX_SIDE, Math.max(CF_MIN_SIDE, Math.round((Number.isFinite(n) ? n : CF_MIN_SIDE) / 16) * 16));
  return { width: fit(size.width), height: fit(size.height) };
}

/** Output size per aspect (a 4-tile output at 1024 wide keeps the cost low). An explicit `size` wins. */
export function cloudflareSize(
  aspect: GenerateOpts["aspect"],
  size?: { width: number; height: number }
): { width: number; height: number } {
  if (size) return clampCloudflareSize(size);
  if (aspect === "sheet") return { width: SHEET_WIDTH, height: SHEET_HEIGHT };
  if (aspect === "16:9") return { width: 1024, height: 576 };
  if (aspect === "3:4") return { width: 768, height: 1024 };
  return { width: 1024, height: 1024 };
}

/** Prompts count reference images from 1; Cloudflare counts from 0. */
export function renumberImageMentions(prompt: string): string {
  return prompt.replace(/\b(reference image|image)\s+([1-4])\b/gi, (_m, word: string, n: string) => `${word} ${Number(n) - 1}`);
}

async function shrinkReference(ref: { mimeType: string; data: Buffer }): Promise<{ mimeType: string; data: Buffer }> {
  try {
    const sharp = (await import("sharp")).default;
    const data = await sharp(ref.data)
      .resize({ width: MAX_REFERENCE_SIDE, height: MAX_REFERENCE_SIDE, fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
    return { mimeType: "image/png", data };
  } catch {
    // sharp unavailable: send the original and let the API judge it.
    return ref;
  }
}

export function buildCloudflareForm(opts: GenerateOpts, references: { mimeType: string; data: Buffer }[]): FormData {
  const { width, height } = cloudflareSize(opts.aspect, opts.size);
  const form = new FormData();
  form.append("prompt", references.length > 0 ? renumberImageMentions(opts.prompt) : opts.prompt);
  form.append("width", String(width));
  form.append("height", String(height));
  references.slice(0, 4).forEach((ref, index) => {
    const ext = ref.mimeType.includes("jpeg") ? "jpg" : ref.mimeType.includes("webp") ? "webp" : "png";
    form.append(`input_image_${index}`, new Blob([new Uint8Array(ref.data)], { type: ref.mimeType }), `reference-${index}.${ext}`);
  });
  return form;
}

interface CloudflareBody {
  success?: boolean;
  result?: { image?: string } | null;
  image?: string;
  errors?: { code?: number; message?: string }[];
}

export function parseCloudflareImage(body: CloudflareBody): { mimeType: string; data: Buffer } {
  const b64 = body.result?.image ?? body.image;
  if (!b64) {
    const message = body.errors?.map((e) => e.message).filter(Boolean).join("; ");
    throw new ImageGenerationError(`Cloudflare returned no image${message ? `: ${message}` : "."}`);
  }
  const data = Buffer.from(b64, "base64");
  // PNG starts 89 50 4E 47, JPEG FF D8.
  const mimeType = data[0] === 0xff && data[1] === 0xd8 ? "image/jpeg" : "image/png";
  return { mimeType, data };
}

export function createCloudflareImageGenerator(accountId: string, apiToken: string): ImageGenerator {
  return {
    async generate(opts) {
      const references = await Promise.all(collectReferences(opts).map(shrinkReference));
      const model = cloudflareImageModel();
      const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${model}`;
      const res = await fetchWithRetry("Cloudflare", url, () => ({
        method: "POST",
        headers: { Authorization: `Bearer ${apiToken}` },
        body: buildCloudflareForm(opts, references),
      }));
      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        let message = "";
        try {
          const j = (await res.json()) as CloudflareBody;
          message = j.errors?.map((e) => e.message).filter(Boolean).join("; ") ?? "";
        } catch {
          // not JSON
        }
        if (res.status === 401 || res.status === 403) {
          throw new ImageGenerationError(
            `Cloudflare rejected the credentials${message ? `: ${message}` : ""}. Check CLOUDFLARE_ACCOUNT_ID and the API token's Workers AI permission.`,
            res.status
          );
        }
        if (res.status === 429 || /neuron|limit|quota/i.test(message)) {
          throw new ImageGenerationError(
            `Cloudflare's free daily allowance is used up${message ? ` (${message})` : ""}. It resets at 00:00 UTC.`,
            res.status
          );
        }
        throw new ImageGenerationError(`Cloudflare image generation failed (HTTP ${res.status})${message ? `: ${message}` : ""}`, res.status);
      }
      if (contentType.startsWith("image/")) {
        return { mimeType: contentType.split(";")[0], data: Buffer.from(await res.arrayBuffer()) };
      }
      return parseCloudflareImage((await res.json()) as CloudflareBody);
    },
  };
}
