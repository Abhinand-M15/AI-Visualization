import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { backupAfterUpload } from "@/lib/backupAfterUpload";
import { LOGO_BUCKET, MAX_LOGO_BYTES, logoMimeOf, matchesMagicBytes, parseLogoPath } from "../shared";
import { isMissingBucket, pathBelongsTo } from "../server";
import { SvgSanitizeError, sanitizeSvg } from "../sanitizeSvg";

/**
 * Final step of a logo upload. Downloads the object the browser just uploaded
 * and verifies it: SVGs are sanitised and re-uploaded (upsert), raster files are
 * checked by magic bytes and re-uploaded with the right content type. Anything
 * that fails is deleted and rejected, so a path is only used after it passed.
 *
 * Body { path, projectId? } -> { ok: true, path } or { error } (422 when rejected).
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json().catch(() => null)) as { path?: unknown; projectId?: unknown } | null;
    const path = body?.path;
    if (!pathBelongsTo(user, path)) {
      return NextResponse.json({ error: "That logo path isn't valid." }, { status: 403 });
    }
    const ext = parseLogoPath(path)!.ext;
    const storage = getSupabase().storage.from(LOGO_BUCKET);

    const reject = async (message: string) => {
      await storage.remove([path]).catch(() => undefined);
      return NextResponse.json({ error: message }, { status: 422 });
    };

    const { data: blob, error: downloadError } = await storage.download(path);
    if (downloadError || !blob) {
      const message = downloadError?.message ?? "";
      if (isMissingBucket(message) && /bucket/i.test(message)) {
        return NextResponse.json({ available: false, error: "Logo upload isn't set up yet." }, { status: 503 });
      }
      return NextResponse.json({ error: "The uploaded logo could not be found. Please try again." }, { status: 404 });
    }
    if (blob.size > MAX_LOGO_BYTES) return reject("The logo is too large. The limit is 2 MB.");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (bytes.length === 0) return reject("The logo file is empty.");

    let cleaned: Uint8Array;
    if (ext === ".svg") {
      let svg: string;
      try {
        svg = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch {
        return reject("That SVG could not be read (it must be UTF-8 text).");
      }
      try {
        cleaned = new TextEncoder().encode(sanitizeSvg(svg));
      } catch (error) {
        if (error instanceof SvgSanitizeError) return reject("That SVG could not be verified as safe. Try exporting it again or use a PNG.");
        throw error;
      }
    } else {
      if (!matchesMagicBytes(ext, bytes)) return reject("The file isn't a valid image of that type.");
      cleaned = bytes;
    }

    const contentType = logoMimeOf(ext);
    const { error: uploadError } = await storage.upload(path, cleaned, { contentType, upsert: true, cacheControl: "3600" });
    if (uploadError) {
      await storage.remove([path]).catch(() => undefined);
      throw new Error(`Could not save the verified logo: ${uploadError.message}`);
    }

    backupAfterUpload({
      bucket: LOGO_BUCKET,
      path,
      folder: "logos",
      fileName: path.split("/").pop() ?? path,
      contentType,
    });
    const projectId = typeof body?.projectId === "string" && body.projectId ? body.projectId : null;
    if (projectId) void logActivity(user, projectId, "logo.updated", { path });

    return NextResponse.json({ ok: true, path });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("sanitize logo failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
