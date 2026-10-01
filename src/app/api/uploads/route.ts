import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { authEnabled, requireUser, unauthorizedResponse } from "@/lib/auth/session";
import {
  DOCUMENTS_BUCKET,
  MAX_UPLOAD_BYTES,
  UPLOAD_EXTENSIONS,
  safeFileName,
  uploadExtensionOf,
  type UploadFallback,
  type UploadTicket,
} from "./shared";

/**
 * Issues a short-lived signed upload URL so the browser can put the source
 * document straight into the private 'documents' bucket, bypassing Vercel's
 * ~4.5 MB request-body limit. The client then calls /api/parse-and-generate
 * with the returned storage path.
 *
 * Replies { direct: false } (and the client falls back to the old multipart
 * upload) while accounts are off, or when the bucket doesn't exist yet
 * because db/migrations/002_accounts.sql hasn't been applied.
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user || !authEnabled()) {
      return NextResponse.json({ direct: false, reason: "auth_off" } satisfies UploadFallback);
    }

    const body = (await request.json().catch(() => null)) as { fileName?: unknown; size?: unknown } | null;
    const fileName = typeof body?.fileName === "string" ? body.fileName : "";
    const size = typeof body?.size === "number" ? body.size : NaN;

    if (!fileName || !uploadExtensionOf(fileName)) {
      return NextResponse.json(
        { error: `Unsupported file type. Accepted: ${UPLOAD_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }
    if (!Number.isFinite(size) || size <= 0) {
      return NextResponse.json({ error: "The file is empty." }, { status: 400 });
    }
    if (size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `The file is too large. The limit is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.` },
        { status: 413 }
      );
    }

    const path = `${user.id}/${crypto.randomUUID()}-${safeFileName(fileName)}`;
    const { data, error } = await getSupabase().storage.from(DOCUMENTS_BUCKET).createSignedUploadUrl(path);

    if (error || !data) {
      const message = error?.message ?? "No upload URL returned.";
      if (/bucket not found|not found/i.test(message)) {
        console.warn("documents bucket missing; client will fall back to multipart upload");
        return NextResponse.json({ direct: false, reason: "bucket_missing" } satisfies UploadFallback);
      }
      throw new Error(`Could not create an upload URL: ${message}`);
    }

    return NextResponse.json({
      direct: true,
      bucket: DOCUMENTS_BUCKET,
      path: data.path,
      signedUrl: data.signedUrl,
      token: data.token,
    } satisfies UploadTicket);
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("create upload url failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
