import "server-only";
/**
 * Company logos: server-side verification and safe rasterising (SEC-07, SEC-08).
 *
 * verifyLogoObject(path) is the ONE check a logo passes before it is used:
 * it downloads the object, sanitises an SVG (allow-list parser that fails
 * closed) or checks a raster file's magic bytes, and re-uploads the cleaned
 * bytes with the right content type. /api/logos/sanitize calls it right after
 * the upload, and every route that attaches a logo to a project (project
 * create, PATCH) calls it again, so a path that skipped the sanitise step can
 * never be attached. A rejected object is deleted.
 *
 * rasterizeLogo() is the only way logo bytes reach `sharp`: an SVG is
 * sanitised first and the decoder gets a pixel limit, so a crafted file never
 * reaches librsvg as uploaded.
 */
import { getSupabase } from "@/lib/db";
import { LOGO_BUCKET, MAX_LOGO_BYTES, logoMimeOf, matchesMagicBytes, parseLogoPath } from "@/app/api/logos/shared";
import { SvgSanitizeError, sanitizeSvg } from "@/lib/server/sanitizeSvg";

export type LogoVerification =
  | { ok: true; path: string; contentType: string }
  | { ok: false; status: number; error: string; reason: "invalid_path" | "missing" | "bucket_missing" | "rejected" };

function isMissingBucket(message: string): boolean {
  return /bucket not found|not found|does not exist/i.test(message);
}

/** Cleans `bytes` for extension `ext`; returns the cleaned bytes or a user-facing rejection. */
export function cleanLogoBytes(ext: string, bytes: Uint8Array): { ok: true; bytes: Uint8Array } | { ok: false; error: string } {
  if (bytes.length === 0) return { ok: false, error: "The logo file is empty." };
  if (bytes.length > MAX_LOGO_BYTES) return { ok: false, error: "The logo is too large. The limit is 2 MB." };
  if (ext === ".svg") {
    let svg: string;
    try {
      svg = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      return { ok: false, error: "That SVG could not be read (it must be UTF-8 text)." };
    }
    try {
      return { ok: true, bytes: new TextEncoder().encode(sanitizeSvg(svg)) };
    } catch (error) {
      if (error instanceof SvgSanitizeError) {
        return { ok: false, error: "That SVG could not be verified as safe. Try exporting it again or use a PNG." };
      }
      throw error;
    }
  }
  if (!matchesMagicBytes(ext, bytes)) return { ok: false, error: "The file isn't a valid image of that type." };
  return { ok: true, bytes };
}

/**
 * Downloads, verifies and re-uploads the logo at `path` (company-logos bucket).
 * `path` must already be known to belong to the caller (pathBelongsTo).
 */
export async function verifyLogoObject(path: string): Promise<LogoVerification> {
  const parsed = parseLogoPath(path);
  if (!parsed) return { ok: false, status: 400, error: "That logo path isn't valid.", reason: "invalid_path" };
  const storage = getSupabase().storage.from(LOGO_BUCKET);

  const { data: blob, error: downloadError } = await storage.download(path);
  if (downloadError || !blob) {
    const message = downloadError?.message ?? "";
    if (isMissingBucket(message) && /bucket/i.test(message)) {
      return { ok: false, status: 503, error: "Logo upload isn't set up yet.", reason: "bucket_missing" };
    }
    return { ok: false, status: 404, error: "The uploaded logo could not be found. Please upload it again.", reason: "missing" };
  }
  if (blob.size > MAX_LOGO_BYTES) {
    await storage.remove([path]).catch(() => undefined);
    return { ok: false, status: 422, error: "The logo is too large. The limit is 2 MB.", reason: "rejected" };
  }
  const cleaned = cleanLogoBytes(parsed.ext, new Uint8Array(await blob.arrayBuffer()));
  if (!cleaned.ok) {
    await storage.remove([path]).catch(() => undefined);
    return { ok: false, status: 422, error: cleaned.error, reason: "rejected" };
  }

  const contentType = logoMimeOf(parsed.ext);
  const { error: uploadError } = await storage.upload(path, cleaned.bytes, { contentType, upsert: true, cacheControl: "3600" });
  if (uploadError) {
    await storage.remove([path]).catch(() => undefined);
    throw new Error(`Could not save the verified logo: ${uploadError.message}`);
  }
  return { ok: true, path, contentType };
}

/** Largest input the raster decoder accepts (width x height). */
const MAX_INPUT_PIXELS = 40_000_000;

/**
 * Logo bytes as a PNG for image providers and published sites. SVGs are
 * sanitised before `sharp` sees them; null when anything fails (no logo then).
 */
export async function rasterizeLogo(bytes: Uint8Array, ext: string, maxSize = 1024): Promise<Buffer | null> {
  const cleaned = cleanLogoBytes(ext, bytes);
  if (!cleaned.ok) return null;
  try {
    const sharp = (await import("sharp")).default;
    const input = Buffer.from(cleaned.bytes);
    return await sharp(input, { density: ext === ".svg" ? 144 : undefined, limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" })
      .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: ext !== ".svg" })
      .png()
      .toBuffer();
  } catch (error) {
    console.warn("logo rasterise failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

/** Extension (".png", ".svg" ...) of a stored logo path, or null when it isn't a logo path. */
export function logoExtension(path: string): string | null {
  return parseLogoPath(path)?.ext ?? null;
}
