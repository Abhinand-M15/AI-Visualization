/**
 * Upload rules shared by the browser (src/lib/store.ts, src/app/new/page.tsx)
 * and the server (/api/uploads, /api/parse-and-generate). Plain constants
 * only, so it is safe to import on either side.
 */
import { ACCEPTED_DOCUMENT_EXTENSIONS } from "@/lib/types";

export const DOCUMENTS_BUCKET = "documents";

/** Largest file accepted for a direct-to-storage upload. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Everything parseDocument() can read: the original PDF/PPTX/XLSX plus DOCX/TXT/MD. */
export const UPLOAD_EXTENSIONS: readonly string[] = [...ACCEPTED_DOCUMENT_EXTENSIONS, ".docx", ".txt", ".md"];

export const UPLOAD_MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
  ".md": "text/markdown",
};

export function uploadExtensionOf(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  return UPLOAD_EXTENSIONS.find((ext) => lower.endsWith(ext)) ?? null;
}

/** Keeps letters, digits, dot, dash and underscore; collapses the rest. */
export function safeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "document";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/^[._]+/, "");
  return (cleaned || "document").slice(-120);
}

export interface UploadTicket {
  direct: true;
  bucket: string;
  path: string;
  signedUrl: string;
  token: string;
}

export interface UploadFallback {
  direct: false;
  reason: "auth_off" | "bucket_missing";
}
