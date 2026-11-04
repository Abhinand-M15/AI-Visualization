import { NextResponse } from "next/server";
import { DocumentRejectedError, parseDocument } from "@/lib/parseDocument";
import { generateStory } from "@/lib/agent/generateStory";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/types";
import { getSupabase } from "@/lib/db";
import { requireUser, type AppUser } from "@/lib/auth/session";
import { getGeminiKeyFor } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";
import { getDomain, type Domain } from "@/lib/domains";
import { apiErrorResponse, HttpError } from "@/lib/server/errors";
import { requireQuota } from "@/lib/server/quota";
import { pathBelongsTo } from "@/app/api/logos/server";
import { DOCUMENTS_BUCKET, MAX_UPLOAD_BYTES, UPLOAD_EXTENSIONS, UPLOAD_MIME_TYPES, uploadExtensionOf } from "../uploads/shared";

// Parsing a large document plus a long Gemini generation can run for minutes;
// 300 s is Vercel Hobby's ceiling.
export const maxDuration = 300;

/**
 * Two ways in:
 *  - multipart/form-data with 'file' (the original flow, and the fallback
 *    whenever /api/uploads says { direct: false }), or
 *  - JSON { storagePath, fileName, documentType, targetChunkCount? } after the
 *    browser uploaded the file straight to the 'documents' bucket (accounts on).
 * Both accept the optional fields domainId and logoPath (never required; an
 * unknown domain or an invalid logo path is silently ignored).
 */
interface ParsedRequest {
  fileName: string;
  buffer: Buffer;
  documentType: unknown;
  targetChunkCountRaw: unknown;
  clientApiKey?: string;
  documentId?: string;
  domainIdRaw?: unknown;
  logoPathRaw?: unknown;
}

/** The domain for an optional id, or null (also when the domains tables don't exist yet). Never throws. */
async function resolveDomain(raw: unknown): Promise<Domain | null> {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    return await getDomain(raw.trim());
  } catch {
    return null;
  }
}

/**
 * A well-formed logo path inside the caller's own folder of the company-logos bucket, else
 * undefined. Only echoed back; the project save verifies the object itself (SEC-07).
 */
function cleanLogoPath(raw: unknown, user: AppUser | null): string | undefined {
  if (typeof raw !== "string") return undefined;
  const path = raw.trim();
  return pathBelongsTo(user, path) ? path : undefined;
}

class BadRequest extends HttpError {
  constructor(message: string, status = 400) {
    super(status, status === 413 ? "payload_too_large" : status === 404 ? "not_found" : "bad_request", message);
  }
}

/** Multipart uploads (accounts off, or no documents bucket) are capped like direct uploads (SEC-12). */
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

async function readMultipart(request: Request): Promise<ParsedRequest> {
  const declared = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES + MULTIPART_OVERHEAD_BYTES) {
    throw new BadRequest(`The file is too large. The limit is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`, 413);
  }
  const formData = await request.formData();
  const file = formData.get("file");
  const apiKey = formData.get("apiKey");
  if (!(file instanceof File)) throw new BadRequest("Missing 'file' in form data.");
  if (!uploadExtensionOf(file.name)) {
    throw new BadRequest(`Unsupported file type. Accepted: ${UPLOAD_EXTENSIONS.join(", ")}`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new BadRequest(`The file is too large. The limit is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`, 413);
  }
  return {
    fileName: file.name,
    buffer: Buffer.from(await file.arrayBuffer()),
    documentType: formData.get("documentType"),
    targetChunkCountRaw: formData.get("targetChunkCount"),
    clientApiKey: typeof apiKey === "string" && apiKey ? apiKey : undefined,
    domainIdRaw: formData.get("domainId"),
    logoPathRaw: formData.get("logoPath"),
  };
}

async function readFromStorage(request: Request, user: AppUser | null): Promise<ParsedRequest> {
  if (!user) throw new BadRequest("Direct uploads need accounts to be enabled.");
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const storagePath = typeof body?.storagePath === "string" ? body.storagePath : "";
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";

  // Only ever read from the caller's own folder: <user id>/<uuid>-<safe file name> (see /api/uploads).
  const prefix = `${user.id}/`;
  if (
    !storagePath.startsWith(prefix) ||
    storagePath.length > 300 ||
    !/^[0-9a-f-]{36}-[A-Za-z0-9._-]{1,120}$/.test(storagePath.slice(prefix.length)) ||
    storagePath.includes("..")
  ) {
    throw new BadRequest("Invalid 'storagePath'.");
  }
  const extension = uploadExtensionOf(fileName);
  if (!extension) throw new BadRequest(`Unsupported file type. Accepted: ${UPLOAD_EXTENSIONS.join(", ")}`);

  const supabase = getSupabase();
  const { data: blob, error } = await supabase.storage.from(DOCUMENTS_BUCKET).download(storagePath);
  if (error || !blob) throw new BadRequest("The uploaded file could not be found. Please upload it again.", 404);
  if (blob.size > MAX_UPLOAD_BYTES) throw new BadRequest("The file is too large.", 413);
  const buffer = Buffer.from(await blob.arrayBuffer());

  // Record the upload. Best-effort: a failed audit row doesn't block generation.
  let documentId: string | undefined;
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      owner_id: user.id,
      file_name: fileName,
      mime_type: UPLOAD_MIME_TYPES[extension] ?? null,
      size_bytes: buffer.length,
      storage_path: storagePath,
    })
    .select("id")
    .single();
  if (docError) console.error("recording uploaded document failed:", docError.message);
  else documentId = (doc as { id: string }).id;
  await logActivity(user, null, "document.uploaded", { fileName, sizeBytes: buffer.length, documentId });

  return {
    fileName,
    buffer,
    documentType: body?.documentType,
    targetChunkCountRaw: body?.targetChunkCount,
    documentId,
    domainIdRaw: body?.domainId,
    logoPathRaw: body?.logoPath,
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    // Auth on: the signed-in user's own key (412 missing_api_key if none),
    // checked before anything is read or recorded.
    // Auth off: unchanged (an explicit apiKey field, else GEMINI_API_KEY).
    const userApiKey = user ? await getGeminiKeyFor(user) : undefined;
    const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
    const parsed = isJson ? await readFromStorage(request, user) : await readMultipart(request);

    const { targetChunkCountRaw, documentType } = parsed;
    const targetChunkCount =
      typeof targetChunkCountRaw === "number"
        ? targetChunkCountRaw
        : typeof targetChunkCountRaw === "string" && targetChunkCountRaw.trim() !== ""
          ? Number(targetChunkCountRaw)
          : undefined;
    if (targetChunkCount !== undefined && (!Number.isInteger(targetChunkCount) || targetChunkCount < 1 || targetChunkCount > 200)) {
      return NextResponse.json({ error: "The number of chapters must be a whole number between 1 and 200.", code: "bad_request" }, { status: 400 });
    }
    if (typeof documentType !== "string" || !DOCUMENT_TYPES.some((type) => type.value === documentType)) {
      return NextResponse.json({ error: "Choose a document type.", code: "bad_request" }, { status: 400 });
    }

    const apiKey = user ? userApiKey : parsed.clientApiKey;
    await requireQuota(user, "generation");

    const documentText = await parseDocument(parsed.fileName, parsed.buffer);

    if (!documentText.trim()) {
      return NextResponse.json(
        { error: "No text could be extracted from this document.", code: "unsupported_file" },
        { status: 422 }
      );
    }

    const domain = await resolveDomain(parsed.domainIdRaw);
    const logoPath = cleanLogoPath(parsed.logoPathRaw, user);

    const storyline = await generateStory(documentText, documentType as DocumentType, apiKey, targetChunkCount, {
      domain,
    });

    await logActivity(user, null, "chunks.generated", {
      fileName: parsed.fileName,
      documentType,
      chunkCount: storyline.chunks.length,
      documentId: parsed.documentId,
      ...(domain ? { domainId: domain.id } : {}),
    });

    return NextResponse.json({
      storyline,
      sourceFileName: parsed.fileName,
      ...(parsed.documentId ? { documentId: parsed.documentId } : {}),
      // Validated echo of the optional domain/logo; the client sends them with the project save.
      ...(domain ? { domainId: domain.id } : {}),
      ...(logoPath ? { logoPath } : {}),
    });
  } catch (error) {
    if (error instanceof DocumentRejectedError) {
      return NextResponse.json(
        { error: error.message, code: error.status === 413 ? "payload_too_large" : "unsupported_file" },
        { status: error.status }
      );
    }
    return apiErrorResponse(error, "parse-and-generate");
  }
}
