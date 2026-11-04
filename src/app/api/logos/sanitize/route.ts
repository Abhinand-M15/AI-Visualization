import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { backupAfterUpload } from "@/lib/backupAfterUpload";
import { verifyLogoObject } from "@/lib/server/logos";
import { apiErrorResponse } from "@/lib/server/errors";
import { isValidProjectId } from "@/lib/server/ids";
import { LOGO_BUCKET } from "../shared";
import { pathBelongsTo } from "../server";

/**
 * Final step of a logo upload. Downloads the object the browser just uploaded
 * and verifies it (see verifyLogoObject): SVGs are sanitised and re-uploaded
 * (upsert), raster files are checked by magic bytes and re-uploaded with the
 * right content type. Anything that fails is deleted and rejected. Routes that
 * attach a logo to a project verify it again, so skipping this call gains nothing.
 *
 * Body { path, projectId? } -> { ok: true, path } or { error } (422 when rejected).
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json().catch(() => null)) as { path?: unknown; projectId?: unknown } | null;
    const path = body?.path;
    if (!pathBelongsTo(user, path)) {
      return NextResponse.json({ error: "That logo path isn't valid.", code: "bad_request" }, { status: 403 });
    }

    const verified = await verifyLogoObject(path);
    if (!verified.ok) {
      return NextResponse.json(
        { error: verified.error, ...(verified.reason === "bucket_missing" ? { available: false } : {}) },
        { status: verified.status }
      );
    }

    backupAfterUpload({
      bucket: LOGO_BUCKET,
      path,
      folder: "logos",
      fileName: path.split("/").pop() ?? path,
      contentType: verified.contentType,
    });
    const projectId = isValidProjectId(body?.projectId) ? body.projectId : null;
    if (projectId) void logActivity(user, projectId, "logo.updated", { path });

    return NextResponse.json({ ok: true, path });
  } catch (error) {
    return apiErrorResponse(error, "sanitize logo");
  }
}
