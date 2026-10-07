import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import {
  LOGO_BUCKET,
  buildLogoPath,
  logoExtensionOf,
  logoMimeOf,
  validateLogoMeta,
  type LogoAvailability,
  type LogoTicket,
} from "./shared";
import { isMissingBucket, ownerPrefix, pathBelongsTo } from "./server";

/**
 * Company-logo uploads into the public 'company-logos' bucket.
 *
 *   GET    -> { available }       whether the bucket exists (migration 003 applied)
 *   POST   -> signed direct-upload target { path, signedUrl, token, contentType };
 *             the browser PUTs the file, then calls POST /api/logos/sanitize
 *   DELETE -> removes an unused object from the caller's own folder
 *
 * Works with accounts off too (objects go under "anon/").
 */

function unavailable(reason: LogoAvailability["reason"], error: string, status = 503) {
  return NextResponse.json({ available: false, reason, error }, { status });
}

export async function GET() {
  try {
    await requireUser();
    const { data, error } = await getSupabase().storage.getBucket(LOGO_BUCKET);
    if (error || !data) {
      return NextResponse.json({ available: false, reason: "bucket_missing" } satisfies LogoAvailability);
    }
    return NextResponse.json({ available: true } satisfies LogoAvailability);
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    return NextResponse.json({ available: false, reason: "unavailable" } satisfies LogoAvailability);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = (await request.json().catch(() => null)) as
      | { fileName?: unknown; contentType?: unknown; size?: unknown }
      | null;
    const fileName = typeof body?.fileName === "string" ? body.fileName : "";
    const contentType = typeof body?.contentType === "string" ? body.contentType.toLowerCase() : "";
    const size = typeof body?.size === "number" ? body.size : NaN;

    const invalid = validateLogoMeta(fileName, contentType, size);
    if (invalid) return NextResponse.json({ error: invalid.error }, { status: invalid.status });

    const ext = logoExtensionOf(fileName)!;
    const path = buildLogoPath(ownerPrefix(user), crypto.randomUUID(), ext);

    const { data, error } = await getSupabase().storage.from(LOGO_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      const message = error?.message ?? "No upload URL returned.";
      if (isMissingBucket(message)) {
        console.warn("company-logos bucket missing; logo upload is unavailable until migration 003 is applied");
        return unavailable("bucket_missing", "Logo upload isn't set up yet.");
      }
      throw new Error(`Could not create an upload URL: ${message}`);
    }

    return NextResponse.json({
      available: true,
      path: data.path,
      signedUrl: data.signedUrl,
      token: data.token,
      contentType: logoMimeOf(ext),
    } satisfies LogoTicket);
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("create logo upload url failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json().catch(() => null)) as { path?: unknown } | null;
    const path = body?.path;
    if (!pathBelongsTo(user, path)) {
      return NextResponse.json({ error: "That logo can't be removed." }, { status: 403 });
    }

    const supabase = getSupabase();
    // Never delete a logo another project still points at. A missing logo_path
    // column (migration not applied) just means nothing references it.
    const { data: refs, error: refError } = await supabase.from("projects").select("id").eq("logo_path", path).limit(1);
    if (!refError && refs && refs.length > 0) {
      return NextResponse.json({ removed: false, reason: "in_use" });
    }

    const { error } = await supabase.storage.from(LOGO_BUCKET).remove([path]);
    if (error) {
      if (isMissingBucket(error.message)) return NextResponse.json({ removed: false, reason: "bucket_missing" });
      throw new Error(error.message);
    }
    return NextResponse.json({ removed: true });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("remove logo failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
