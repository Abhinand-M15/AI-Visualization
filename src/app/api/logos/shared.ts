/**
 * Company-logo upload rules shared by the browser (LogoUpload) and the server
 * (/api/logos). Plain constants and pure helpers only, safe on either side.
 */
export const LOGO_BUCKET = "company-logos";

/** Largest logo accepted (declared size is checked before upload, real size after). */
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export const LOGO_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg"] as const;

const MIME_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export function logoExtensionOf(fileName: string): (typeof LOGO_EXTENSIONS)[number] | null {
  const lower = fileName.toLowerCase();
  return LOGO_EXTENSIONS.find((ext) => lower.endsWith(ext)) ?? null;
}

export function logoMimeOf(ext: string): string {
  return MIME_BY_EXTENSION[ext] ?? "application/octet-stream";
}

/** Server and client validation of declared metadata. Returns an error message or null. */
export function validateLogoMeta(fileName: string, contentType: string, size: number): { error: string; status: number } | null {
  const ext = logoExtensionOf(fileName);
  if (!ext) return { error: "Unsupported logo type. Use PNG, JPG, WebP or SVG.", status: 400 };
  if (contentType && contentType !== logoMimeOf(ext) && !(contentType === "image/jpg" && ext === ".jpg")) {
    return { error: "The logo's file type does not match its extension.", status: 400 };
  }
  if (!Number.isFinite(size) || size <= 0) return { error: "The logo file is empty.", status: 400 };
  if (size > MAX_LOGO_BYTES) {
    return { error: `The logo is too large. The limit is ${MAX_LOGO_BYTES / (1024 * 1024)} MB.`, status: 413 };
  }
  return null;
}

/** <prefix>/<uuid>.<ext> where prefix is a user id or "anon". */
const LOGO_PATH = /^([A-Za-z0-9-]{1,64})\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(\.(?:png|jpg|jpeg|webp|svg))$/;

export function parseLogoPath(path: string): { prefix: string; ext: string } | null {
  const m = LOGO_PATH.exec(path);
  return m ? { prefix: m[1], ext: m[3] } : null;
}

export function buildLogoPath(prefix: string, uuid: string, ext: string): string {
  return `${prefix}/${uuid}${ext}`;
}

/** Returns true when the object bytes really are the format its extension claims. */
export function matchesMagicBytes(ext: string, b: Uint8Array): boolean {
  if (ext === ".png") {
    return b.length > 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v);
  }
  if (ext === ".jpg" || ext === ".jpeg") return b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (ext === ".webp") {
    const tag = (from: number, s: string) => [...s].every((c, i) => b[from + i] === c.charCodeAt(0));
    return b.length > 12 && tag(0, "RIFF") && tag(8, "WEBP");
  }
  return false;
}

export interface LogoAvailability {
  available: boolean;
  reason?: "bucket_missing" | "unavailable";
}

export interface LogoTicket {
  available: true;
  path: string;
  signedUrl: string;
  token: string;
  contentType: string;
}
