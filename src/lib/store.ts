import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { Chunk, DocumentType, Project, Storyline } from "@/lib/types";
import { ApiError, errorCode, errorMessage, readJson } from "@/components/apiError";

type Status = "idle" | "generating" | "reviewing" | "revising" | "saving" | "error";

/** Which request failed while reviewing a draft (the draft itself is kept). */
export interface DraftActionError {
  action: "revise" | "save";
  message: string;
  code?: string;
}

/**
 * Uploads `file` straight to Supabase Storage through a signed upload URL from
 * /api/uploads. Returns the storage path, or null when the server says to use
 * the multipart upload instead ({ direct: false }) or the uploads route itself
 * is unavailable. Validation errors (type, size, sign-in) are thrown.
 */
async function uploadDirect(file: File, signal?: AbortSignal): Promise<string | null> {
  let ticket: { direct?: boolean; path?: string; signedUrl?: string; error?: string; code?: string };
  let res: Response;
  try {
    res = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, size: file.size, mimeType: file.type }),
      signal,
    });
    ticket = await res.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    return null;
  }
  if (res.status === 400 || res.status === 401 || res.status === 413) {
    throw new ApiError(ticket.error || "This file can't be uploaded.", ticket.code, res.status);
  }
  if (!res.ok || !ticket.direct || !ticket.path || !ticket.signedUrl) return null;

  // Same request shape as supabase-js uploadToSignedUrl(): the token in the URL authorises it.
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);
  const upload = await fetch(ticket.signedUrl, { method: "PUT", body, signal });
  if (!upload.ok) {
    throw new ApiError("The upload didn't finish. Check your connection and try again.", "upload_failed", upload.status);
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
  /** Failure of the first generation (status "error"); there is no draft yet. */
  errorMessage?: string;
  /** Machine-readable error code from the API, e.g. 'missing_api_key'. */
  errorCode?: string;
  /** A failed Regenerate or Save while reviewing: the draft and its edits stay (UX-01). */
  actionError?: DraftActionError;
  /** Feedback of the last Regenerate, so "Try again" repeats exactly that. */
  lastFeedback?: string;
  /** Generation progress: "uploading" until the file is stored, then "writing". */
  generateStage?: "uploading" | "writing";
  generateStartedAt?: number;
  /** When the draft last changed (ISO), shown when a stored draft is restored. */
  savedAt?: string;
  /** True when the current draft came back from storage after a reload. */
  restored?: boolean;
  /** One-off note for the upload form, e.g. after Cancel. */
  notice?: string;

  generate: (file: File, documentType: DocumentType, targetChunkCount?: number, options?: GenerateOptions) => Promise<void>;
  cancelGenerate: () => void;
  editChunk: (chunkId: string, updates: Partial<Pick<Chunk, "title" | "narrativeText">>) => void;
  revise: (feedbackText: string) => Promise<void>;
  save: () => Promise<Project | null>;
  dismissActionError: () => void;
  reset: () => void;
}

/** localStorage that never throws (private mode, blocked storage, full quota). */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // The draft just isn't kept across reloads.
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

/** Persisted part of the draft: only a generated storyline and what's needed to save it. */
type PersistedDraft = Pick<
  DraftState,
  "documentType" | "sourceFileName" | "documentId" | "domainId" | "logoPath" | "storyline" | "savedAt"
>;

let generateController: AbortController | null = null;

const EMPTY_DRAFT = {
  documentType: null,
  sourceFileName: undefined,
  documentId: undefined,
  domainId: undefined,
  logoPath: undefined,
  storyline: null,
  status: "idle" as Status,
  errorMessage: undefined,
  errorCode: undefined,
  actionError: undefined,
  lastFeedback: undefined,
  generateStage: undefined,
  generateStartedAt: undefined,
  savedAt: undefined,
  restored: false,
  notice: undefined,
};

/**
 * The /new draft. Kept in localStorage (UX-04) so a reload, a closed tab or
 * a crash doesn't lose a generated story and its edits; cleared on save or
 * "Start over". Hydration is manual (skipHydration): /new calls
 * useDraftStore.persist.rehydrate() after mount so the server render and the
 * first client render match.
 */
export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      ...EMPTY_DRAFT,

      generate: async (file, documentType, targetChunkCount, options) => {
        generateController?.abort();
        const controller = new AbortController();
        generateController = controller;
        set({
          ...EMPTY_DRAFT,
          status: "generating",
          documentType,
          generateStage: "uploading",
          generateStartedAt: Date.now(),
        });
        try {
          // Preferred: upload straight to storage (no Vercel body-size limit), then
          // generate from the stored file. Falls back to the original multipart
          // upload whenever /api/uploads says { direct: false } (accounts off, or
          // the documents bucket isn't set up yet).
          const storagePath = await uploadDirect(file, controller.signal);
          if (generateController !== controller) return;
          set({ generateStage: "writing" });

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
              signal: controller.signal,
            });
          } else {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("documentType", documentType);
            if (targetChunkCount) formData.append("targetChunkCount", String(targetChunkCount));
            if (options?.domainId) formData.append("domainId", options.domainId);
            if (options?.logoPath) formData.append("logoPath", options.logoPath);
            res = await fetch("/api/parse-and-generate", { method: "POST", body: formData, signal: controller.signal });
          }
          const data = await readJson<{
            storyline: Storyline;
            sourceFileName?: string;
            documentId?: string;
            domainId?: unknown;
            logoPath?: unknown;
          }>(res, "The story couldn't be generated. Try again.");
          if (generateController !== controller) return;

          set({
            storyline: data.storyline,
            sourceFileName: data.sourceFileName,
            documentId: data.documentId,
            domainId: typeof data.domainId === "string" ? data.domainId : undefined,
            logoPath: typeof data.logoPath === "string" ? data.logoPath : undefined,
            status: "reviewing",
            generateStage: undefined,
            savedAt: new Date().toISOString(),
          });
        } catch (error) {
          if (generateController !== controller) return;
          if (controller.signal.aborted) {
            set({ ...EMPTY_DRAFT, notice: "Generation cancelled. Nothing was saved." });
            return;
          }
          set({
            status: "error",
            generateStage: undefined,
            errorMessage: errorMessage(error, "The story couldn't be generated. Try again."),
            errorCode: errorCode(error),
          });
        } finally {
          if (generateController === controller) generateController = null;
        }
      },

      cancelGenerate: () => {
        generateController?.abort();
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
          savedAt: new Date().toISOString(),
        });
      },

      revise: async (feedbackText) => {
        const { storyline } = get();
        if (!storyline) return;
        set({ status: "revising", actionError: undefined, lastFeedback: feedbackText });
        try {
          const res = await fetch("/api/revise-story", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storyline, feedbackText, documentType: get().documentType }),
          });
          const data = await readJson<{ storyline: Storyline }>(res, "The story couldn't be regenerated. Try again.");
          set({ storyline: data.storyline, status: "reviewing", savedAt: new Date().toISOString() });
        } catch (error) {
          // Back to the draft as it was, with the error shown above the buttons.
          set({
            status: "reviewing",
            actionError: {
              action: "revise",
              message: errorMessage(error, "The story couldn't be regenerated. Try again."),
              code: errorCode(error),
            },
          });
        }
      },

      save: async () => {
        const { storyline, documentType, sourceFileName, documentId, domainId, logoPath } = get();
        if (!storyline || !documentType) return null;
        set({ status: "saving", actionError: undefined });
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
          const data = await readJson<{ project: Project }>(res, "The story couldn't be saved. Try again.");
          return data.project;
        } catch (error) {
          set({
            status: "reviewing",
            actionError: {
              action: "save",
              message: errorMessage(error, "The story couldn't be saved. Try again."),
              code: errorCode(error),
            },
          });
          return null;
        }
      },

      dismissActionError: () => set({ actionError: undefined }),

      reset: () => {
        generateController?.abort();
        generateController = null;
        set({ ...EMPTY_DRAFT });
      },
    }),
    {
      name: "story-draft-v1",
      storage: createJSONStorage(() => safeLocalStorage),
      skipHydration: true,
      // Only a generated draft is worth keeping; an empty form or a running request is not.
      partialize: (state): PersistedDraft | Record<string, never> =>
        state.storyline
          ? {
              documentType: state.documentType,
              sourceFileName: state.sourceFileName,
              documentId: state.documentId,
              domainId: state.domainId,
              logoPath: state.logoPath,
              storyline: state.storyline,
              savedAt: state.savedAt,
            }
          : {},
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<PersistedDraft>;
        // What's in memory is fresher (e.g. a generation still running after an in-app navigation).
        if (current.status !== "idle" || current.storyline || !stored.storyline) return current;
        return { ...current, ...stored, status: "reviewing", restored: true };
      },
    }
  )
);
