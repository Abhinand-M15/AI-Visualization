import { create } from "zustand";
import type { Chunk, DocumentType, Project, Storyline } from "@/lib/types";

type Status = "idle" | "generating" | "reviewing" | "revising" | "saving" | "error";

/** An API error that carries the server's machine-readable code (e.g. 'missing_api_key'). */
class ApiError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
  }
}

/**
 * Uploads `file` straight to Supabase Storage through a signed upload URL from
 * /api/uploads. Returns the storage path, or null when the server says to use
 * the multipart upload instead ({ direct: false }) or the uploads route itself
 * is unavailable. Validation errors (type, size, sign-in) are thrown.
 */
async function uploadDirect(file: File): Promise<string | null> {
  let ticket: { direct?: boolean; path?: string; signedUrl?: string; error?: string; code?: string };
  let res: Response;
  try {
    res = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, size: file.size, mimeType: file.type }),
    });
    ticket = await res.json();
  } catch {
    return null;
  }
  if (res.status === 400 || res.status === 401 || res.status === 413) {
    throw new ApiError(ticket.error || "The file can't be uploaded.", ticket.code);
  }
  if (!res.ok || !ticket.direct || !ticket.path || !ticket.signedUrl) return null;

  // Same request shape as supabase-js uploadToSignedUrl(): the token in the URL authorises it.
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);
  const upload = await fetch(ticket.signedUrl, { method: "PUT", body });
  if (!upload.ok) {
    let message = `Upload failed (HTTP ${upload.status}).`;
    try {
      const data = await upload.json();
      if (data?.message || data?.error) message = `Upload failed: ${data.message || data.error}`;
    } catch {
      // keep the generic message
    }
    throw new ApiError(message);
  }
  return ticket.path;
}

/** Optional extras sent with a generate request (domain dropdown, company logo). */
export interface GenerateOptions {
  domainId?: string;
  logoPath?: string;
}

interface DraftState {
  documentType: DocumentType | null;
  sourceFileName?: string;
  /** documents.id of a direct upload (accounts on), linked to the project on save. */
  documentId?: string;
  /** Domain and logo the server accepted for this draft; saved with the project. */
  domainId?: string;
  logoPath?: string;
  storyline: Storyline | null;
  status: Status;
  errorMessage?: string;
  /** Machine-readable error code from the API, e.g. 'missing_api_key'. */
  errorCode?: string;

  generate: (file: File, documentType: DocumentType, targetChunkCount?: number, options?: GenerateOptions) => Promise<void>;
  editChunk: (chunkId: string, updates: Partial<Pick<Chunk, "title" | "narrativeText">>) => void;
  revise: (feedbackText: string) => Promise<void>;
  save: () => Promise<Project | null>;
  reset: () => void;
}

export const useDraftStore = create<DraftState>((set, get) => ({
  documentType: null,
  sourceFileName: undefined,
  documentId: undefined,
  domainId: undefined,
  logoPath: undefined,
  storyline: null,
  status: "idle",
  errorMessage: undefined,
  errorCode: undefined,

  generate: async (file, documentType, targetChunkCount, options) => {
    set({
      status: "generating",
      errorMessage: undefined,
      errorCode: undefined,
      documentType,
      documentId: undefined,
      domainId: undefined,
      logoPath: undefined,
    });
    try {
      // Preferred: upload straight to storage (no Vercel body-size limit), then
      // generate from the stored file. Falls back to the original multipart
      // upload whenever /api/uploads says { direct: false } (accounts off, or
      // the documents bucket isn't set up yet).
      const storagePath = await uploadDirect(file);

      let res: Response;
      if (storagePath) {
        res = await fetch("/api/parse-and-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storagePath,
            fileName: file.name,
            documentType,
            targetChunkCount,
            ...(options?.domainId ? { domainId: options.domainId } : {}),
            ...(options?.logoPath ? { logoPath: options.logoPath } : {}),
          }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);
        if (targetChunkCount) formData.append("targetChunkCount", String(targetChunkCount));
        if (options?.domainId) formData.append("domainId", options.domainId);
        if (options?.logoPath) formData.append("logoPath", options.logoPath);
        res = await fetch("/api/parse-and-generate", { method: "POST", body: formData });
      }
      const data = await res.json();
      if (!res.ok) throw new ApiError(data.error || "Failed to generate storyline.", data.code);

      set({
        storyline: data.storyline,
        sourceFileName: data.sourceFileName,
        documentId: data.documentId,
        domainId: typeof data.domainId === "string" ? data.domainId : undefined,
        logoPath: typeof data.logoPath === "string" ? data.logoPath : undefined,
        status: "reviewing",
      });
    } catch (error) {
      set({
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unexpected error",
        errorCode: error instanceof ApiError ? error.code : undefined,
      });
    }
  },

  editChunk: (chunkId, updates) => {
    const { storyline } = get();
    if (!storyline) return;
    set({
      storyline: {
        ...storyline,
        chunks: storyline.chunks.map((chunk) =>
          chunk.id === chunkId ? { ...chunk, ...updates, userEdited: true } : chunk
        ),
      },
    });
  },

  revise: async (feedbackText) => {
    const { storyline } = get();
    if (!storyline) return;
    set({ status: "revising", errorMessage: undefined });
    try {
      const res = await fetch("/api/revise-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyline, feedbackText, documentType: get().documentType }),
      });
      const data = await res.json();
      if (!res.ok) throw new ApiError(data.error || "Failed to revise storyline.", data.code);
      set({ storyline: data.storyline, status: "reviewing" });
    } catch (error) {
      set({
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unexpected error",
        errorCode: error instanceof ApiError ? error.code : undefined,
      });
    }
  },

  save: async () => {
    const { storyline, documentType, sourceFileName, documentId, domainId, logoPath } = get();
    if (!storyline || !documentType) return null;
    set({ status: "saving", errorMessage: undefined });
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyline.title,
          documentType,
          sourceFileName,
          chunks: storyline.chunks,
          ...(documentId ? { documentId } : {}),
          ...(domainId ? { domainId } : {}),
          ...(logoPath ? { logoPath } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save project.");
      set({ status: "idle" });
      return data.project as Project;
    } catch (error) {
      set({ status: "error", errorMessage: error instanceof Error ? error.message : "Unexpected error" });
      return null;
    }
  },

  reset: () =>
    set({
      documentType: null,
      sourceFileName: undefined,
      documentId: undefined,
      domainId: undefined,
      logoPath: undefined,
      storyline: null,
      status: "idle",
      errorMessage: undefined,
      errorCode: undefined,
    }),
}));
