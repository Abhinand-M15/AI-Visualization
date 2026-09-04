import { create } from "zustand";
import type { Chunk, DocumentType, Project, Storyline } from "@/lib/types";

type Status = "idle" | "generating" | "reviewing" | "revising" | "saving" | "error";

interface DraftState {
  documentType: DocumentType | null;
  sourceFileName?: string;
  storyline: Storyline | null;
  status: Status;
  errorMessage?: string;

  generate: (file: File, documentType: DocumentType, targetChunkCount?: number) => Promise<void>;
  editChunk: (chunkId: string, updates: Partial<Pick<Chunk, "title" | "narrativeText">>) => void;
  revise: (feedbackText: string) => Promise<void>;
  save: () => Promise<Project | null>;
  reset: () => void;
}

export const useDraftStore = create<DraftState>((set, get) => ({
  documentType: null,
  sourceFileName: undefined,
  storyline: null,
  status: "idle",
  errorMessage: undefined,

  generate: async (file, documentType, targetChunkCount) => {
    set({ status: "generating", errorMessage: undefined, documentType });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      if (targetChunkCount) formData.append("targetChunkCount", String(targetChunkCount));

      const res = await fetch("/api/parse-and-generate", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate storyline.");

      set({
        storyline: data.storyline,
        sourceFileName: data.sourceFileName,
        status: "reviewing",
      });
    } catch (error) {
      set({ status: "error", errorMessage: error instanceof Error ? error.message : "Unexpected error" });
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
      if (!res.ok) throw new Error(data.error || "Failed to revise storyline.");
      set({ storyline: data.storyline, status: "reviewing" });
    } catch (error) {
      set({ status: "error", errorMessage: error instanceof Error ? error.message : "Unexpected error" });
    }
  },

  save: async () => {
    const { storyline, documentType, sourceFileName } = get();
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
      storyline: null,
      status: "idle",
      errorMessage: undefined,
    }),
}));
