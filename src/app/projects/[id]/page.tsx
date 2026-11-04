"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { documentTypeLabel, type Chunk, type Project } from "@/lib/types";
import { AVATARS } from "@/lib/avatars";
import { TEMPLATE_UNAVAILABLE_NOTICE } from "@/lib/templates";
import { useAvailableTemplates } from "@/lib/useAvailableTemplates";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";
import { LoadingBar } from "@/components/LoadingBar";
import { flattenCaseStudySections, type CaseStudySectionEdit } from "@/lib/caseStudySections";
import { readNdjsonStream } from "@/lib/readNdjsonStream";
import { PublishDialog } from "@/components/PublishDialog";
import { PublishStateBadge } from "@/components/PublishStateBadge";
import { formatDate, type ProjectSummary } from "@/lib/projects";
import { getPublishState, plural, summarizeNarration } from "@/lib/contentVersion";
import DomainAvatarPicker from "@/components/DomainAvatarPicker";
import SceneImagesPanel from "@/components/SceneImagesPanel";
import ProjectLogoControl from "@/components/ProjectLogoControl";
import { Button, buttonClass, fieldClass } from "@/components/ui/button";
import { ErrorState, InlineError, Skeleton } from "@/components/StateViews";
import { ensureOk, errorCode, errorMessage, friendlyMessage, isKeyProblem, requestJson, settingsHrefFor, streamError } from "@/components/apiError";
import { projectReadiness, publishLooksStuck } from "@/components/projectReadiness";
import { useNow } from "@/components/useNow";
import { useUnsavedChangesWarning } from "@/components/useUnsavedChangesWarning";
import { VoicePicker, type Voice } from "@/components/VoicePicker";
import { ChapterEditor } from "@/components/project/ChapterEditor";
import { CaseStudyLayoutPanel, sectionName } from "@/components/project/CaseStudyLayoutPanel";
import { StepMarker, StepPart, StepSection, type StepStatus } from "@/components/project/StepSection";
import { cn } from "@/lib/utils";

/** A message about a narration run, with an optional "do the rest" action. */
interface RunNotice {
  message: string;
  code?: string;
  tone: "error" | "warning";
  retry?: { label: string; ids: string[] };
}

/** Final line of a narration stream (see the generate-audio routes). */
interface NarrationDone {
  type: "done";
  project: Project;
  failures?: ({ chunkId: string; message: string; code?: string } | { key: string; message: string; code?: string })[];
  /** Items edited while the job ran: their new text was kept and they still need narration. */
  skippedChanged?: string[];
  /** Items left because the server's time budget ran out: call again with onlyMissing. */
  remaining?: number;
  quotaExceeded?: { message: string };
}

type StreamMessage =
  | { type: "progress"; completed: number; total: number }
  | NarrationDone
  | { type: "error"; message: string; code?: string };

function renumber(chunks: Chunk[]): Chunk[] {
  return chunks.map((chunk, index) => ({ ...chunk, order: index + 1 }));
}

const toggleCard =
  "rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const toggleOn = "border-violet-500 bg-violet-50 dark:border-violet-400/70 dark:bg-violet-500/15";
const toggleOff =
  "border-neutral-300 bg-white hover:bg-neutral-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProjectState] = useState<ProjectSummary | null>(null);
  // Server responses from routes that don't return timestamps keep the ones we have.
  const setProject = useCallback((next: Project | ProjectSummary) => {
    setProjectState((current) => ({
      ...next,
      updatedAt: (next as ProjectSummary).updatedAt ?? current?.updatedAt ?? new Date().toISOString(),
      publishedAt: (next as ProjectSummary).publishedAt ?? next.publication?.publishedAt ?? current?.publishedAt,
    }));
  }, []);
  const [loadError, setLoadError] = useState<{ message: string; code?: string } | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, { title?: string; body?: string }>>({});
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [voices, setVoices] = useState<Voice[] | null>(null);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingChunkId, setGeneratingChunkId] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<RunNotice | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ completed: number; total: number } | null>(null);
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<string[]>([]);
  // Industry domain and company logo (both optional; present once migration 003 is applied).
  const [domainId, setDomainId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const { templates: availableTemplates, isAvailable: isTemplateAvailable } = useAvailableTemplates();
  const [savingSelection, setSavingSelection] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [editedChunks, setEditedChunks] = useState<Chunk[]>([]);
  const [chunksDirty, setChunksDirty] = useState(false);
  const [savingChunks, setSavingChunks] = useState(false);
  const [chunksSaveError, setChunksSaveError] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<{ chunk: Chunk; index: number } | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<{ message: string; code?: string } | null>(null);
  const [proposal, setProposal] = useState<Chunk[] | null>(null);
  const [binding, setBinding] = useState(false);
  const [bindingError, setBindingError] = useState<string | null>(null);
  const [generatingCaseStudyAudio, setGeneratingCaseStudyAudio] = useState(false);
  const [caseStudyAudioNotice, setCaseStudyAudioNotice] = useState<RunNotice | null>(null);
  const [caseStudyAudioProgress, setCaseStudyAudioProgress] = useState<{ completed: number; total: number } | null>(null);
  const [generatingCaseStudyAvatarVideo, setGeneratingCaseStudyAvatarVideo] = useState(false);
  const [caseStudyAvatarVideoError, setCaseStudyAvatarVideoError] = useState<string | null>(null);
  const [caseStudyAvatarVideoProgress, setCaseStudyAvatarVideoProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [missingGeminiKey, setMissingGeminiKey] = useState(false);
  const now = useNow();
  const chunksDirtyRef = useRef(false);
  useEffect(() => {
    chunksDirtyRef.current = chunksDirty;
  }, [chunksDirty]);

  // A server update that only added narration (generate-audio, or the publish
  // dialog generating missing audio) must reach the chapter editor too; otherwise
  // a later "Save changes" writes the stale chapters back and drops the new
  // audioUrls. Unsaved text edits are kept: only the audio fields are copied.
  const applyServerProject = useCallback(
    (next: Project) => {
      setProject(next);
      const audioById = new Map(next.chunks.map((chunk) => [chunk.id, chunk]));
      setEditedChunks((current) =>
        current.map((chunk) => {
          const fresh = audioById.get(chunk.id);
          return fresh
            ? {
                ...chunk,
                audioUrl: fresh.audioUrl,
                audioDurationSec: fresh.audioDurationSec,
                audioVoice: fresh.audioVoice,
                narrationOutdated: fresh.narrationOutdated,
              }
            : chunk;
        })
      );
    },
    [setProject]
  );

  /** Re-reads the project after a long job (UX-02, UX-09): chapters too when there are no unsaved edits. */
  const refreshProject = useCallback(async (): Promise<Project | null> => {
    try {
      const data = await requestJson<{ project: ProjectSummary }>(`/api/projects/${id}`, { cache: "no-store" });
      if (chunksDirtyRef.current) {
        applyServerProject(data.project);
      } else {
        setProject(data.project);
        setEditedChunks(data.project.chunks);
      }
      return data.project;
    } catch {
      return null;
    }
  }, [id, applyServerProject, setProject]);

  const loadProject = useCallback(() => {
    setLoadError(null);
    requestJson<{ project: ProjectSummary }>(`/api/projects/${id}`, { cache: "no-store" }, "This story couldn't be loaded.")
      .then((data) => {
        setProject(data.project);
        setEditedTitle(data.project.title);
        setEditedChunks(data.project.chunks);
        if (data.project.selectedVoice) setSelectedVoice(data.project.selectedVoice);
        if (data.project.selectedAvatarIds) setSelectedAvatarIds(data.project.selectedAvatarIds);
        if (data.project.selectedTemplateId) setSelectedTemplateId(data.project.selectedTemplateId);
        setDomainId(data.project.domainId ?? null);
        setLogoUrl(data.project.logoUrl ?? undefined);
      })
      .catch((err) => setLoadError({ message: errorMessage(err, "This story couldn't be loaded."), code: errorCode(err) }));
  }, [id, setProject]);

  useEffect(() => {
    void Promise.resolve().then(loadProject);
  }, [loadProject]);

  useEffect(() => {
    requestJson<{ voices: Voice[] }>("/api/voices", undefined, "The voice list couldn't be loaded.")
      .then((data) => {
        setVoices(data.voices);
        setSelectedVoice(
          (current) =>
            current || data.voices.find((voice) => voice.name === "en-US-AriaNeural")?.name || data.voices.find((voice) => voice.language.startsWith("en"))?.name || data.voices[0]?.name || ""
        );
      })
      .catch((err) => setVoicesError(errorMessage(err, "The voice list couldn't be loaded. Reload the page to try again.")));
  }, []);

  // No Gemini key saved (accounts on): say so here, not only when a button fails (UX-26).
  useEffect(() => {
    fetch("/api/settings/keys", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { authEnabled?: boolean; keys?: { provider: string; hasKey: boolean }[] } | null) => {
        if (data?.authEnabled && !data.keys?.some((key) => key.provider === "gemini" && key.hasKey)) setMissingGeminiKey(true);
      })
      .catch(() => {});
  }, []);

  // While a publish runs elsewhere (another tab, or one that may have died), keep the status fresh (UX-03).
  const publishStatus = project?.publishStatus;
  useEffect(() => {
    if (publishStatus !== "publishing" || publishDialogOpen) return;
    const timer = window.setInterval(() => void refreshProject(), 20_000);
    return () => window.clearInterval(timer);
  }, [publishStatus, publishDialogOpen, refreshProject]);

  // "Deleted · Undo" disappears after a while.
  useEffect(() => {
    if (!lastDeleted) return;
    const timer = window.setTimeout(() => setLastDeleted(null), 10_000);
    return () => window.clearTimeout(timer);
  }, [lastDeleted]);

  const isCaseStudyProject = project?.documentType === "case-study";
  const audioRunning = generatingAll || generatingChunkId !== null;
  const narrationRunning = audioRunning || generatingCaseStudyAudio || generatingCaseStudyAvatarVideo;
  const editingLockedReason = narrationRunning
    ? "Editing is paused while narration is being generated, so your changes can't be overwritten. It unlocks when narration finishes."
    : binding
      ? "Editing is paused while the case study layout is being made."
      : regenerating
        ? "Editing is paused while the chapters are being regenerated."
        : null;

  function chapterName(chunkId: string): string {
    const chunk = editedChunks.find((entry) => entry.id === chunkId) ?? project?.chunks.find((entry) => entry.id === chunkId);
    return chunk ? `chapter ${chunk.order}${chunk.title ? ` (“${chunk.title}”)` : ""}` : "a chapter";
  }

  /**
   * Runs a narration job (chapters or case-study sections) to the end: the
   * server stops each call at its time budget and reports `remaining`, so this
   * calls again with onlyMissing until nothing is left, a quota is hit or the
   * stream is cut off. Returns a notice for anything the user should know.
   */
  async function runNarration(
    kind: "chunks" | "case-study",
    ids: string[] | undefined,
    onlyMissing: boolean,
    onProgress: (progress: { completed: number; total: number }) => void
  ): Promise<RunNotice | null> {
    const endpoint = kind === "case-study" ? "generate-case-study-audio" : "generate-audio";
    const unit = kind === "case-study" ? "section" : "chapter";
    const nameOf = (itemId: string) => {
      if (kind === "chunks") return chapterName(itemId);
      const section = savedSections.find((entry) => entry.key === itemId);
      return section ? sectionName(section) : "a section";
    };
    const failures = new Map<string, { message: string; code?: string }>();
    const skipped = new Set<string>();
    let missing = onlyMissing;
    let lastProgress: { completed: number; total: number } | null = null;

    for (let round = 0; round < 20; round++) {
      const res = await fetch(`/api/projects/${id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice: selectedVoice,
          ...(ids ? (kind === "case-study" ? { sectionKeys: ids } : { chunkIds: ids }) : {}),
          ...(missing ? { onlyMissing: true } : {}),
        }),
      });
      await ensureOk(res, "Narration couldn't be generated.");

      let done: NarrationDone | null = null;
      const { completed } = await readNdjsonStream(res, (message) => {
        const msg = message as StreamMessage;
        if (msg.type === "progress") {
          lastProgress = { completed: msg.completed, total: msg.total };
          onProgress(lastProgress);
        } else if (msg.type === "done") {
          applyServerProject(msg.project);
          done = msg;
        } else if (msg.type === "error") throw streamError(msg.message, msg.code, "Narration couldn't be generated.");
      });
      const result = done as NarrationDone | null;
      for (const failure of result?.failures ?? []) {
        const itemId = "chunkId" in failure ? failure.chunkId : failure.key;
        if (itemId) failures.set(itemId, { message: failure.message, code: failure.code });
      }
      for (const itemId of result?.skippedChanged ?? []) skipped.add(itemId);

      if (!completed || !result) {
        const fresh = await refreshProject();
        const remaining = fresh ? summarizeNarration(fresh, selectedVoice).needed : [];
        const progress = lastProgress as { completed: number; total: number } | null;
        return {
          tone: "warning",
          message: `Narration stopped part-way${progress ? ` after ${progress.completed} of ${progress.total}` : ""}. What finished is saved.${
            remaining.length > 0 ? ` ${plural(remaining.length, unit)} still need narration.` : ""
          }`,
          retry: remaining.length > 0 ? { label: "Continue", ids: remaining } : undefined,
        };
      }
      if (result.quotaExceeded) {
        await refreshProject();
        return {
          tone: "warning",
          message: `${friendlyMessage(result.quotaExceeded.message, "quota_exceeded")} What finished is saved.`,
        };
      }
      if (!result.remaining) break;
      // Time budget used up on the server: carry on with what's still missing.
      missing = true;
    }

    await refreshProject();
    const notes: string[] = [];
    if (failures.size > 0) {
      notes.push(`Narration failed for ${Array.from(failures.keys()).map(nameOf).join(", ")}. The rest are done.`);
    }
    if (skipped.size > 0) {
      notes.push(
        `${plural(skipped.size, unit)} ${skipped.size === 1 ? "was" : "were"} edited while narration ran; the new text was kept and still needs narration.`
      );
    }
    if (notes.length === 0) return null;
    const retryIds = [...failures.keys(), ...skipped];
    const firstCode = Array.from(failures.values()).find((failure) => failure.code)?.code;
    return {
      tone: failures.size > 0 ? "error" : "warning",
      message: notes.join(" "),
      code: firstCode,
      retry: { label: failures.size > 0 ? "Retry these" : "Narrate them", ids: retryIds },
    };
  }

  async function generateAudio(chunkIds?: string[], onlyMissing = false) {
    if (!project || !selectedVoice) return;
    setAudioNotice(null);
    setAudioProgress(null);
    const single = chunkIds?.length === 1 && !onlyMissing;
    if (single) setGeneratingChunkId(chunkIds[0]);
    else setGeneratingAll(true);
    try {
      setAudioNotice(await runNarration("chunks", chunkIds, onlyMissing, setAudioProgress));
    } catch (err) {
      setAudioNotice({ tone: "error", message: errorMessage(err, "Narration couldn't be generated."), code: errorCode(err) });
      await refreshProject();
    } finally {
      setGeneratingAll(false);
      setGeneratingChunkId(null);
      setAudioProgress(null);
    }
  }

  async function saveSelection(next: { avatarIds?: string[]; templateId?: string; voice?: string }) {
    setSavingSelection(true);
    setSelectionError(null);
    try {
      const data = await requestJson<{ project: Project }>(
        `/api/projects/${id}/select`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedAvatarIds: next.avatarIds,
            selectedTemplateId: next.templateId,
            selectedVoice: next.voice,
          }),
        },
        "Your choice couldn't be saved."
      );
      // Only selection/audio-voice fields change here; keep unsaved text edits.
      applyServerProject(data.project);
    } catch (err) {
      setSelectionError(errorMessage(err, "Your choice couldn't be saved. Try again."));
    } finally {
      setSavingSelection(false);
    }
  }

  function toggleAvatar(avatarId: string) {
    const next = selectedAvatarIds.includes(avatarId)
      ? selectedAvatarIds.filter((existing) => existing !== avatarId)
      : [...selectedAvatarIds, avatarId];
    setSelectedAvatarIds(next);
    void saveSelection({ avatarIds: next });
  }

  // One generated (domain) avatar at a time; the static avatars keep their own toggles.
  function selectDomainAvatar(avatarId: string) {
    const others = selectedAvatarIds.filter((existing) => !existing.startsWith("domain:"));
    const next = selectedAvatarIds.includes(avatarId) ? others : [...others, avatarId];
    setSelectedAvatarIds(next);
    void saveSelection({ avatarIds: next });
  }

  function selectTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    void saveSelection({ templateId });
  }

  function selectVoice(voice: string) {
    setSelectedVoice(voice);
    void saveSelection({ voice });
  }

  function editChunkField(chunkId: string, field: "title" | "narrativeText", value: string) {
    if (editingLockedReason) return;
    setEditedChunks((current) => current.map((chunk) => (chunk.id === chunkId ? { ...chunk, [field]: value } : chunk)));
    setChunksDirty(true);
  }

  function moveChunk(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= editedChunks.length) return;
    const next = [...editedChunks];
    [next[index], next[target]] = [next[target], next[index]];
    setEditedChunks(renumber(next));
    setActiveChunkIndex(target);
    setChunksDirty(true);
  }

  /** New empty chapter after `index`; a case-study chapter joins the same phase as its neighbour. */
  function addChunkAfter(index: number) {
    const neighbour = editedChunks[index];
    const chunk: Chunk = {
      id: crypto.randomUUID(),
      order: index + 2,
      title: "",
      narrativeText: "",
      userEdited: true,
      ...(neighbour?.phase ? { phase: neighbour.phase } : {}),
      ...(neighbour?.emotion ? { emotion: neighbour.emotion } : {}),
    };
    const next = [...editedChunks.slice(0, index + 1), chunk, ...editedChunks.slice(index + 1)];
    setEditedChunks(renumber(next));
    setActiveChunkIndex(index + 1);
    setChunksDirty(true);
  }

  function deleteChunk(index: number) {
    if (editedChunks.length <= 1) return;
    setLastDeleted({ chunk: editedChunks[index], index });
    setEditedChunks(renumber(editedChunks.filter((_, i) => i !== index)));
    setActiveChunkIndex(Math.max(0, Math.min(index, editedChunks.length - 2)));
    setChunksDirty(true);
  }

  function undoDelete() {
    if (!lastDeleted) return;
    const next = [...editedChunks];
    next.splice(Math.min(lastDeleted.index, next.length), 0, lastDeleted.chunk);
    setEditedChunks(renumber(next));
    setActiveChunkIndex(lastDeleted.index);
    setLastDeleted(null);
  }

  function editSection(key: string, field: "title" | "body", value: string) {
    if (editingLockedReason) return;
    setSectionDrafts((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  }

  // Section edits that actually differ from the saved text.
  const savedSections = project?.caseStudyBinding?.slots ? flattenCaseStudySections(project.caseStudyBinding.slots) : [];
  const sectionEdits: CaseStudySectionEdit[] = savedSections.flatMap((section) => {
    const draft = sectionDrafts[section.key];
    if (!draft) return [];
    const edit: CaseStudySectionEdit = { key: section.key };
    if (draft.body !== undefined && draft.body !== section.body) edit.body = draft.body;
    if (draft.title !== undefined && draft.title !== section.title) edit.title = draft.title;
    return edit.body !== undefined || edit.title !== undefined ? [edit] : [];
  });
  const titleDirty = Boolean(project) && editedTitle.trim() !== "" && editedTitle.trim() !== project?.title;
  const hasUnsavedChanges = chunksDirty || titleDirty || sectionEdits.length > 0;
  const emptyChunk = editedChunks.find((chunk) => !chunk.title.trim() || !chunk.narrativeText.trim());
  const savedById = new Map((project?.chunks ?? []).map((chunk) => [chunk.id, chunk]));
  const changedChapterCount = chunksDirty
    ? Math.max(
        1,
        editedChunks.filter((chunk, index) => {
          const saved = savedById.get(chunk.id);
          return !saved || saved.title !== chunk.title || saved.narrativeText !== chunk.narrativeText || saved.order !== index + 1;
        }).length + Math.max(0, (project?.chunks.length ?? 0) - editedChunks.length)
      )
    : 0;
  const changeCount = changedChapterCount + (titleDirty ? 1 : 0) + sectionEdits.length;

  useUnsavedChangesWarning(
    hasUnsavedChanges || narrationRunning || binding || regenerating,
    hasUnsavedChanges
      ? "You have unsaved changes. Leave this page and lose them?"
      : "Narration or the layout is still being generated. Leave this page? What already finished is saved."
  );

  function discardChanges() {
    if (!project) return;
    if (changeCount > 1 && !window.confirm(`Discard all ${changeCount} unsaved changes? This can't be undone.`)) return;
    setEditedChunks(project.chunks);
    setEditedTitle(project.title);
    setSectionDrafts({});
    setChunksDirty(false);
    setChunksSaveError(null);
    setLastDeleted(null);
    setActiveChunkIndex((current) => Math.min(current, project.chunks.length - 1));
  }

  /** Saves every pending edit (chapters, title, case-study sections) in one PATCH. */
  async function handleSaveChanges(): Promise<boolean> {
    if (!hasUnsavedChanges) return true;
    if (narrationRunning) {
      setChunksSaveError("Wait for narration to finish, then save.");
      return false;
    }
    if (chunksDirty && emptyChunk) {
      setChunksSaveError(`Chapter ${emptyChunk.order} needs a title and narration text before saving.`);
      setActiveChunkIndex(editedChunks.indexOf(emptyChunk));
      return false;
    }
    if (sectionEdits.some((edit) => edit.body !== undefined && !edit.body.trim())) {
      setChunksSaveError("A case study section's text can't be empty.");
      return false;
    }
    setSavingChunks(true);
    setChunksSaveError(null);
    try {
      const data = await requestJson<{ project: Project }>(
        `/api/projects/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(chunksDirty ? { chunks: editedChunks } : {}),
            ...(titleDirty ? { title: editedTitle.trim() } : {}),
            ...(sectionEdits.length > 0 ? { sectionEdits } : {}),
          }),
        },
        "Your changes couldn't be saved."
      );
      setProject(data.project);
      setEditedChunks(data.project.chunks);
      setEditedTitle(data.project.title);
      setSectionDrafts({});
      setChunksDirty(false);
      setLastDeleted(null);
      return true;
    } catch (err) {
      setChunksSaveError(`${errorMessage(err, "Your changes couldn't be saved.")} Your edits are still here.`);
      return false;
    } finally {
      setSavingChunks(false);
    }
  }

  /** Publishing always publishes what's saved, so pending edits are saved first. */
  async function openPublishDialog() {
    if (hasUnsavedChanges && !(await handleSaveChanges())) return;
    setPublishDialogOpen(true);
  }

  async function copyPublishedUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setCopiedUrl(false);
    }
  }

  /** Asks for a rewrite and shows it as a proposal; nothing changes until "Use these chapters" (UX-08). */
  async function handleRegenerate() {
    if (!project || !feedbackText.trim()) return;
    setRegenerating(true);
    setRegenerateError(null);
    setProposal(null);
    try {
      const data = await requestJson<{ storyline: { chunks: Chunk[] } }>(
        "/api/revise-story",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyline: { title: project.title, chunks: editedChunks },
            feedbackText,
            documentType: project.documentType,
          }),
        },
        "The chapters couldn't be regenerated."
      );
      setProposal(renumber(data.storyline.chunks));
    } catch (err) {
      setRegenerateError({ message: errorMessage(err, "The chapters couldn't be regenerated. Try again."), code: errorCode(err) });
    } finally {
      setRegenerating(false);
    }
  }

  function acceptProposal() {
    if (!proposal) return;
    setEditedChunks(proposal);
    setChunksDirty(true);
    setProposal(null);
    setFeedbackText("");
    setActiveChunkIndex(0);
  }

  async function handleBindCaseStudy() {
    const narratedSections = Object.keys(project?.caseStudyBinding?.sectionAudio ?? {}).length;
    if (
      project?.caseStudyBinding &&
      (sectionEdits.length > 0 || narratedSections > 0) &&
      !window.confirm(
        "Remake the layout? Every section is rebuilt from the chapters, which replaces section text edits and their narration."
      )
    ) {
      return;
    }
    setBinding(true);
    setBindingError(null);
    try {
      const data = await requestJson<{ project: Project }>(
        `/api/projects/${id}/bind-case-study`,
        { method: "POST" },
        "The case study layout couldn't be made."
      );
      setProject(data.project);
      setSectionDrafts({});
    } catch (err) {
      setBindingError(errorMessage(err, "The case study layout couldn't be made. Try again."));
    } finally {
      setBinding(false);
    }
  }

  /** Every section by default; `sectionKeys` limits it to those (missing/outdated ones). */
  async function handleGenerateCaseStudyAudio(sectionKeys?: string[]) {
    if (!selectedVoice) return;
    setGeneratingCaseStudyAudio(true);
    setCaseStudyAudioNotice(null);
    setCaseStudyAudioProgress(null);
    try {
      setCaseStudyAudioNotice(await runNarration("case-study", sectionKeys, Boolean(sectionKeys), setCaseStudyAudioProgress));
    } catch (err) {
      setCaseStudyAudioNotice({ tone: "error", message: errorMessage(err, "Narration couldn't be generated."), code: errorCode(err) });
      await refreshProject();
    } finally {
      setGeneratingCaseStudyAudio(false);
      setCaseStudyAudioProgress(null);
    }
  }

  async function handleGenerateCaseStudyAvatarVideo() {
    setGeneratingCaseStudyAvatarVideo(true);
    setCaseStudyAvatarVideoError(null);
    setCaseStudyAvatarVideoProgress(null);
    try {
      const res = await fetch(`/api/projects/${id}/generate-case-study-avatar-video`, { method: "POST" });
      await ensureOk(res, "The avatar video couldn't be generated.");

      let failures: { key: string; message: string }[] | undefined;
      const { completed } = await readNdjsonStream(res, (message) => {
        const msg = message as
          | { type: "progress"; completed: number; total: number }
          | { type: "done"; project: Project; failures?: { key: string; message: string }[] }
          | { type: "error"; message: string; code?: string };
        if (msg.type === "progress") setCaseStudyAvatarVideoProgress({ completed: msg.completed, total: msg.total });
        else if (msg.type === "done") {
          setProject(msg.project);
          failures = msg.failures;
        } else if (msg.type === "error") throw streamError(msg.message, msg.code, "The avatar video couldn't be generated.");
      });
      await refreshProject();
      if (!completed) {
        setCaseStudyAvatarVideoError("The avatar video stopped part-way. What finished is saved; generate again to finish the rest.");
      } else if (failures && failures.length > 0) {
        setCaseStudyAvatarVideoError(
          `${plural(failures.length, "section")} failed to get an avatar video. The rest are done. Click "Regenerate avatar video" to retry.`
        );
      }
    } catch (err) {
      setCaseStudyAvatarVideoError(errorMessage(err, "The avatar video couldn't be generated."));
    } finally {
      setGeneratingCaseStudyAvatarVideo(false);
      setCaseStudyAvatarVideoProgress(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Loading and error states
  // ---------------------------------------------------------------------------

  if (!project) {
    return (
      <>
        <SpaceBackdrop />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-16 pt-2 text-neutral-900 dark:text-white sm:px-6 lg:px-8">
          <Link href="/" className="self-start rounded text-sm text-muted-foreground hover:text-neutral-900 dark:hover:text-white">
            <span aria-hidden>←</span> My stories
          </Link>
          {loadError ? (
            <ErrorState title="This story couldn't be loaded" message={loadError.message} code={loadError.code} onRetry={loadProject} />
          ) : (
            <Skeleton lines={4} label="Loading the story…" />
          )}
        </main>
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived state for the steps
  // ---------------------------------------------------------------------------

  const readiness = projectReadiness(
    { ...project, selectedTemplateId, selectedAvatarIds },
    isTemplateAvailable
  );
  const templateGone = !isCaseStudyProject && Boolean(selectedTemplateId) && !isTemplateAvailable(selectedTemplateId);
  const leadCharacter = !readiness.needsAvatar;
  const publishState = getPublishState(project);
  const stuck = publishLooksStuck(project, now);
  // Narration of what the published site plays, against the voice now selected.
  const narrationSummary = summarizeNarration(project, selectedVoice || undefined);
  const narrationUnit = narrationSummary.kind === "case-study" ? "section" : "chapter";
  const narratedCount =
    narrationSummary.kind === "case-study"
      ? Object.keys(project.caseStudyBinding?.sectionAudio ?? {}).length
      : project.chunks.filter((chunk) => chunk.audioUrl).length;
  const canPublish =
    readiness.publishBlockers.length === 0 &&
    !savingChunks &&
    !narrationRunning &&
    (project.publishStatus !== "publishing" || stuck);
  const publishLabel = stuck
    ? "Retry publish"
    : project.publishStatus === "publishing"
      ? "Publishing…"
      : publishState === "changed" || (project.publishedUrl && hasUnsavedChanges)
        ? "Publish update"
        : project.publishedUrl
          ? "Republish"
          : "Publish";

  const contentStatus: StepStatus = isCaseStudyProject ? (readiness.hasLayout ? "done" : "todo") : editedChunks.length > 0 ? "done" : "todo";
  const lookStatus: StepStatus =
    (isCaseStudyProject || readiness.hasTemplate) && (!readiness.needsAvatar || readiness.hasAvatar) ? "done" : "todo";
  const voiceStatus: StepStatus = narrationSummary.total > 0 && narrationSummary.needed.length === 0 ? "done" : "todo";
  const publishStatusStep: StepStatus = publishState === "published" ? "done" : "todo";
  const steps = [
    { id: "step-content", title: "Content", status: contentStatus },
    { id: "step-look", title: "Look", status: lookStatus },
    { id: "step-voice", title: "Voice and narration", status: voiceStatus },
    { id: "step-publish", title: "Preview and publish", status: publishStatusStep },
  ];

  const narrationNeededText =
    narrationSummary.needed.length > 0
      ? [
          narrationSummary.outdated > 0 ? `Narration needs updating for ${plural(narrationSummary.outdated, narrationUnit)}.` : "",
          narrationSummary.missing > 0 ? `${plural(narrationSummary.missing, narrationUnit)} without narration.` : "",
        ]
          .filter(Boolean)
          .join(" ")
      : "";

  const proposalChanges = proposal
    ? proposal.filter((chunk, index) => {
        const before = editedChunks.find((entry) => entry.id === chunk.id) ?? editedChunks[index];
        return !before || before.title !== chunk.title || before.narrativeText !== chunk.narrativeText;
      })
    : [];

  return (
    <>
      <SpaceBackdrop />
      <main
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pt-2 text-neutral-900 dark:text-white sm:px-6 lg:px-8",
          hasUnsavedChanges ? "pb-36 sm:pb-28" : "pb-16"
        )}
      >
        <div className="flex flex-col gap-3">
          <Link href="/" className="self-start rounded text-sm text-muted-foreground hover:text-neutral-900 dark:hover:text-white">
            <span aria-hidden>←</span> My stories
          </Link>
          <header className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="min-w-0 break-words text-title font-semibold tracking-tight">{project.title}</h1>
              <PublishStateBadge state={publishState} />
            </div>
            <p className="text-sm text-muted-foreground">
              {plural(project.chunks.length, "chapter")} · {documentTypeLabel(project.documentType)}
              {project.sourceFileName ? ` · from ${project.sourceFileName}` : ""}
              {` · created ${formatDate(project.createdAt)}`}
              {project.publishedAt ? ` · last published ${formatDate(project.publishedAt)}` : ""}
            </p>
            {missingGeminiKey && (
              <p className="self-start rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
                No Gemini API key is saved, so regenerating chapters and making a case study layout won&apos;t work.{" "}
                <Link href="/settings" className="rounded font-semibold underline">
                  Add it in Settings
                </Link>
              </p>
            )}
            {templateGone && (
              <p className="self-start rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
                {TEMPLATE_UNAVAILABLE_NOTICE}
              </p>
            )}
            {publishState === "changed" && !stuck && (
              <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Saved changes aren&apos;t live yet.
                  {narrationSummary.outdated > 0 &&
                    ` Narration needs updating for ${plural(narrationSummary.outdated, narrationUnit)}; it's recorded again when you publish.`}
                </span>
                <Button variant="success" size="sm" onClick={openPublishDialog} disabled={!canPublish} aria-haspopup="dialog">
                  Publish update
                </Button>
              </div>
            )}
            {stuck && (
              <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
                <span>Publishing seems stuck: it started a while ago and never finished. You can publish again.</span>
                <Button
                  variant="success"
                  size="sm"
                  onClick={openPublishDialog}
                  disabled={readiness.publishBlockers.length > 0 || narrationRunning || savingChunks}
                  aria-haspopup="dialog"
                >
                  Retry publish
                </Button>
              </div>
            )}
          </header>
        </div>

        <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <nav aria-label="Steps" className="lg:sticky lg:top-[calc(var(--app-bar-height)+1rem)] lg:self-start">
            <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
              {steps.map((step, index) => (
                <li key={step.id}>
                  <a
                    href={`#${step.id}`}
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100 dark:text-indigo-50 dark:hover:bg-white/5"
                  >
                    <StepMarker number={index + 1} status={step.status} />
                    <span className="min-w-0">
                      {step.title}
                      <span className="sr-only">{step.status === "done" ? " (done)" : " (to do)"}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex min-w-0 flex-col gap-6">
            {/* 1 · Content ------------------------------------------------------- */}
            <StepSection
              id="step-content"
              number={1}
              title="Content"
              status={contentStatus}
              description={
                isCaseStudyProject
                  ? "Edit the chapters, then make the case study layout from them."
                  : "The site title and the chapters the site shows and narrates."
              }
            >
              <StepPart title="Site title">
                <label htmlFor="site-title" className="sr-only">
                  Site title
                </label>
                <input
                  id="site-title"
                  value={editedTitle}
                  onChange={(event) => setEditedTitle(event.target.value)}
                  maxLength={200}
                  className={cn(fieldClass, "font-medium")}
                />
              </StepPart>

              <StepPart
                title={`Chapters (${editedChunks.length})`}
                description={isCaseStudyProject ? "The case study layout is made from these chapters." : undefined}
              >
                <ChapterEditor
                  chunks={editedChunks}
                  savedChunks={project.chunks}
                  activeIndex={activeChunkIndex}
                  onSelect={setActiveChunkIndex}
                  onEdit={editChunkField}
                  onMove={moveChunk}
                  onAdd={addChunkAfter}
                  onDelete={deleteChunk}
                  lockedReason={editingLockedReason}
                  undo={lastDeleted ? { label: `Deleted “${lastDeleted.chunk.title || "Untitled chapter"}”.`, onUndo: undoDelete } : null}
                  narration={
                    narrationSummary.kind === "chunks"
                      ? {
                          voice: selectedVoice,
                          generatingChunkId,
                          disabledReason: !selectedVoice
                            ? "Choose a voice in step 3 first."
                            : chunksDirty
                              ? "Save your changes first."
                              : narrationRunning
                                ? "Narration is already being generated."
                                : null,
                          onGenerate: (chunkId) => void generateAudio([chunkId]),
                        }
                      : undefined
                  }
                />
              </StepPart>

              <StepPart
                title="Ask for changes"
                description="Describe what to change. You see the new chapters before anything is replaced. Chapters you edited by hand are kept as they are."
              >
                <label htmlFor="regenerate-feedback" className="sr-only">
                  What should change
                </label>
                <textarea
                  id="regenerate-feedback"
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                  disabled={regenerating}
                  rows={2}
                  placeholder='For example: "make chapter 3 more concise"'
                  className={fieldClass}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleRegenerate}
                    disabled={regenerating || !feedbackText.trim() || Boolean(editingLockedReason && !regenerating)}
                  >
                    {regenerating ? "Regenerating…" : "Suggest new chapters"}
                  </Button>
                  {!feedbackText.trim() && <span className="text-xs text-muted-foreground">Type what should change first.</span>}
                </div>
                {regenerating && <LoadingBar label="Rewriting the chapters…" />}
                {regenerateError && (
                  <ErrorState compact message={regenerateError.message} code={regenerateError.code} onRetry={handleRegenerate} />
                )}
                {proposal && (
                  <div className="flex flex-col gap-3 rounded-xl border border-violet-300 bg-violet-50/60 p-3 dark:border-violet-400/30 dark:bg-violet-500/10">
                    <p className="text-sm font-semibold" role="status">
                      Suggested: {plural(proposalChanges.length, "chapter")} changed
                      {proposal.length !== editedChunks.length ? `, ${proposal.length} chapters in total (was ${editedChunks.length})` : ""}.
                    </p>
                    <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                      {proposalChanges.map((chunk) => {
                        const before = editedChunks.find((entry) => entry.id === chunk.id);
                        return (
                          <li key={chunk.id} className="rounded-lg bg-white p-2 text-sm dark:bg-neutral-950/60">
                            <p className="font-medium">
                              {chunk.order}. {chunk.title}
                            </p>
                            <p className="mt-1 whitespace-pre-line text-xs text-neutral-700 dark:text-indigo-100">{chunk.narrativeText}</p>
                            {before && (
                              <details className="mt-1 text-xs text-muted-foreground">
                                <summary className="cursor-pointer rounded">Show the current text</summary>
                                <p className="mt-1 whitespace-pre-line">{before.narrativeText}</p>
                              </details>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="primary" size="xs" onClick={acceptProposal} disabled={Boolean(editingLockedReason)}>
                        Use these chapters
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => setProposal(null)}>
                        Discard suggestion
                      </Button>
                      <span className="text-xs text-muted-foreground">They become unsaved edits you can still change or discard.</span>
                    </div>
                  </div>
                )}
              </StepPart>

              {isCaseStudyProject && (
                <StepPart title="Case study layout">
                  <CaseStudyLayoutPanel
                    binding={project.caseStudyBinding}
                    sections={savedSections}
                    sectionDrafts={sectionDrafts}
                    onEditSection={editSection}
                    voice={selectedVoice}
                    generating={binding}
                    error={bindingError}
                    onGenerate={() => void handleBindCaseStudy()}
                    lockedReason={
                      generatingCaseStudyAudio || generatingCaseStudyAvatarVideo
                        ? "Wait for narration to finish before changing the layout."
                        : chunksDirty
                          ? "Save your chapter changes first: the layout is made from the saved chapters."
                          : null
                    }
                  />
                </StepPart>
              )}
            </StepSection>

            {/* 2 · Look ---------------------------------------------------------- */}
            <StepSection
              id="step-look"
              number={2}
              title="Look"
              status={lookStatus}
              description="The template, then the avatar or lead character, the logo and scene images."
            >
              <StepPart
                title="Template"
                description={
                  isCaseStudyProject
                    ? "Optional for a case study. Space, Lunar and Airlock restyle its layout; Voyage and Showcase show its sections as chapters. Without one it uses the light case study layout."
                    : undefined
                }
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {availableTemplates.map((template) => {
                    const active = selectedTemplateId === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => selectTemplate(template.id)}
                        disabled={savingSelection}
                        aria-pressed={active}
                        className={cn(toggleCard, active ? toggleOn : toggleOff)}
                      >
                        <span className="block font-medium text-neutral-900 dark:text-white">{template.name}</span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{template.description}</span>
                      </button>
                    );
                  })}
                </div>
                {templateGone && <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{TEMPLATE_UNAVAILABLE_NOTICE}</p>}
              </StepPart>

              <StepPart
                title={leadCharacter ? "Lead character" : "Avatar"}
                description={
                  leadCharacter
                    ? "Showcase uses its own lead character in every scene, so no avatar is needed."
                    : "Pick one, or more to alternate between chapters."
                }
              >
                {!leadCharacter && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {AVATARS.map((avatar) => {
                        const active = selectedAvatarIds.includes(avatar.id);
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => toggleAvatar(avatar.id)}
                            disabled={savingSelection}
                            aria-pressed={active}
                            className={cn(toggleCard, "flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium", active ? toggleOn : toggleOff)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={avatar.imageUrl} alt="" className="h-12 w-12 object-contain" />
                            <span className="text-neutral-800 dark:text-indigo-100">{avatar.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {domainId && (
                      <DomainAvatarPicker
                        domainId={domainId}
                        value={selectedAvatarIds.find((existing) => existing.startsWith("domain:")) ?? null}
                        onSelect={selectDomainAvatar}
                      />
                    )}
                  </>
                )}
                {selectedTemplateId === "showcase" ? (
                  // Showcase: one fixed lead character in every scene (no avatar choice needed).
                  <SceneImagesPanel projectId={id} mode="lead" autoStart onChanged={() => void refreshProject()} />
                ) : (
                  domainId &&
                  selectedAvatarIds.some((existing) => existing.startsWith("domain:")) && (
                    <SceneImagesPanel projectId={id} autoStart onChanged={() => void refreshProject()} />
                  )
                )}
              </StepPart>

              <StepPart title="Company logo" description="Optional. Shown on the published site.">
                <ProjectLogoControl projectId={id} logoUrl={logoUrl} onChanged={setLogoUrl} />
              </StepPart>

              {selectionError && <InlineError>{selectionError}</InlineError>}
            </StepSection>

            {/* 3 · Voice and narration ------------------------------------------- */}
            <StepSection
              id="step-voice"
              number={3}
              title="Voice and narration"
              status={voiceStatus}
              description={
                narrationSummary.kind === "case-study"
                  ? "The published case study narrates each section in this voice."
                  : isCaseStudyProject
                    ? "Make the case study layout first (step 1); its sections are what gets narrated."
                    : "Every chapter is narrated in this voice."
              }
            >
              <StepPart title="Voice">
                <VoicePicker
                  voices={voices}
                  loadError={voicesError}
                  value={selectedVoice}
                  onCommit={selectVoice}
                  narratedCount={narratedCount}
                  narrationUnit={narrationUnit}
                  disabled={narrationRunning || savingSelection}
                />
              </StepPart>

              {(narrationSummary.kind === "case-study" || !isCaseStudyProject) && (
                <StepPart
                  title="Narration"
                  description={
                    narrationSummary.total > 0
                      ? `${narrationSummary.total - narrationSummary.needed.length} of ${plural(narrationSummary.total, narrationUnit)} narrated. Publishing records anything missing first.`
                      : undefined
                  }
                >
                  {narrationNeededText && <p className="text-xs text-neutral-700 dark:text-indigo-100">{narrationNeededText}</p>}
                  {narrationSummary.kind === "case-study" ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        {narrationSummary.needed.length > 0 && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => void handleGenerateCaseStudyAudio(narrationSummary.needed)}
                            disabled={!selectedVoice || narrationRunning || binding || sectionEdits.length > 0}
                          >
                            Narrate the {plural(narrationSummary.needed.length, "section")} that need it
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => {
                            if (
                              narratedCount > 0 &&
                              !window.confirm(`Record all ${plural(narrationSummary.total, "section")} again, including those already narrated?`)
                            )
                              return;
                            void handleGenerateCaseStudyAudio();
                          }}
                          disabled={!selectedVoice || narrationRunning || binding || sectionEdits.length > 0}
                        >
                          {generatingCaseStudyAudio ? "Generating narration…" : narratedCount > 0 ? "Record all sections again" : "Narrate all sections"}
                        </Button>
                      </div>
                      {sectionEdits.length > 0 && <p className="text-xs text-muted-foreground">Save your section edits first.</p>}
                      {generatingCaseStudyAudio && (
                        <LoadingBar
                          label="Generating narration…"
                          progress={caseStudyAudioProgress ? caseStudyAudioProgress.completed / caseStudyAudioProgress.total : undefined}
                          detail={caseStudyAudioProgress ? `${caseStudyAudioProgress.completed} / ${caseStudyAudioProgress.total} sections` : undefined}
                        />
                      )}
                      {caseStudyAudioNotice && (
                        <RunNoticeView notice={caseStudyAudioNotice} busy={narrationRunning} onRetry={(ids) => void handleGenerateCaseStudyAudio(ids)} />
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        {narrationSummary.needed.length > 0 && narrationSummary.needed.length < narrationSummary.total && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => void generateAudio(narrationSummary.needed, true)}
                            disabled={!selectedVoice || narrationRunning || chunksDirty}
                          >
                            Narrate the {plural(narrationSummary.needed.length, "chapter")} that need it
                          </Button>
                        )}
                        <Button
                          variant={narrationSummary.needed.length === narrationSummary.total ? "primary" : "secondary"}
                          size="sm"
                          onClick={() => {
                            if (
                              narratedCount > 0 &&
                              !window.confirm(`Record all ${plural(narrationSummary.total, "chapter")} again, including those already narrated?`)
                            )
                              return;
                            void generateAudio();
                          }}
                          disabled={!selectedVoice || narrationRunning || chunksDirty}
                        >
                          {generatingAll ? "Generating narration…" : narratedCount > 0 ? "Record all chapters again" : "Narrate all chapters"}
                        </Button>
                      </div>
                      {chunksDirty && <p className="text-xs text-muted-foreground">Save your chapter changes before generating narration.</p>}
                      {generatingAll && (
                        <LoadingBar
                          label="Generating narration… keep this page open."
                          progress={audioProgress ? audioProgress.completed / audioProgress.total : undefined}
                          detail={audioProgress ? `${audioProgress.completed} / ${audioProgress.total} chapters` : undefined}
                        />
                      )}
                      {audioNotice && <RunNoticeView notice={audioNotice} busy={narrationRunning} onRetry={(ids) => void generateAudio(ids, true)} />}
                    </>
                  )}
                </StepPart>
              )}

              {project.caseStudyBinding?.slots &&
                selectedAvatarIds.includes("avatar-1") &&
                selectedTemplateId === "lunar" &&
                (() => {
                  const sections = savedSections;
                  const narrated = sections.filter((section) => project.caseStudyBinding?.sectionAudio?.[section.key]).length;
                  const lipsynced = sections.filter((section) => project.caseStudyBinding?.sectionVideo?.[section.key]).length;
                  const allNarrated = sections.length > 0 && narrated === sections.length;
                  return (
                    <StepPart
                      title="Avatar video"
                      description={`Lip-syncs Avatar 1's video to each section's narration (Lunar only).${
                        allNarrated ? "" : " Narrate every section first."
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          size="sm"
                          onClick={handleGenerateCaseStudyAvatarVideo}
                          disabled={!allNarrated || narrationRunning}
                        >
                          {generatingCaseStudyAvatarVideo
                            ? "Generating avatar video…"
                            : lipsynced > 0
                              ? "Regenerate avatar video"
                              : "Generate avatar video"}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {lipsynced}/{sections.length} sections lip-synced
                        </span>
                      </div>
                      {generatingCaseStudyAvatarVideo && (
                        <LoadingBar
                          label="Generating avatar video…"
                          progress={
                            caseStudyAvatarVideoProgress
                              ? caseStudyAvatarVideoProgress.completed / caseStudyAvatarVideoProgress.total
                              : undefined
                          }
                          detail={
                            caseStudyAvatarVideoProgress
                              ? `${caseStudyAvatarVideoProgress.completed} / ${caseStudyAvatarVideoProgress.total} sections`
                              : undefined
                          }
                        />
                      )}
                      {caseStudyAvatarVideoError && <InlineError>{caseStudyAvatarVideoError}</InlineError>}
                    </StepPart>
                  );
                })()}
            </StepSection>

            {/* 4 · Preview and publish ------------------------------------------- */}
            <StepSection
              id="step-publish"
              number={4}
              title="Preview and publish"
              status={publishStatusStep}
              description="Check the site, then put it online. Publishing uses what is saved."
            >
              <ul className="flex flex-col gap-1.5 text-sm" aria-label="Before publishing">
                {isCaseStudyProject && (
                  <ChecklistItem done={readiness.hasLayout} text="Case study layout made (step 1)" />
                )}
                {!isCaseStudyProject && <ChecklistItem done={readiness.hasTemplate} text="Template chosen (step 2)" />}
                {readiness.needsAvatar ? (
                  <ChecklistItem done={readiness.hasAvatar} text="Avatar chosen (step 2)" />
                ) : (
                  <ChecklistItem done text="Lead character (Showcase, nothing to choose)" />
                )}
                <ChecklistItem
                  done={narrationSummary.needed.length === 0 && narrationSummary.total > 0}
                  optional
                  text={
                    narrationSummary.needed.length === 0 && narrationSummary.total > 0
                      ? "Narration recorded (step 3)"
                      : `Narration: ${narrationNeededText || "not recorded yet"} Publishing records it first.`
                  }
                />
                <ChecklistItem done={!hasUnsavedChanges} optional text={hasUnsavedChanges ? "Unsaved changes: saved first when you publish" : "Everything saved"} />
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                {readiness.previewBlockers.length === 0 ? (
                  <Link href={`/projects/${id}/preview`} target="_blank" className={buttonClass("secondary", "md")}>
                    Preview site<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden>↗</span>
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">To preview: {readiness.previewBlockers.join(", ").toLowerCase()}.</span>
                )}
                <Button
                  variant="success"
                  size="md"
                  onClick={openPublishDialog}
                  disabled={!canPublish}
                  aria-haspopup="dialog"
                >
                  {publishLabel}
                </Button>
              </div>
              {hasUnsavedChanges && readiness.previewBlockers.length === 0 && (
                <p className="text-xs text-muted-foreground">Preview shows the saved version. Save your changes to see them there.</p>
              )}
              {narrationRunning && <p className="text-xs text-muted-foreground">Publishing is available once narration finishes.</p>}

              {project.publishedUrl && (
                <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-black/20">
                  <span className="text-xs text-muted-foreground">Live at</span>
                  <a
                    href={project.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={project.publishedUrl}
                    className="min-w-0 flex-1 truncate rounded text-xs font-medium text-emerald-800 hover:underline dark:text-emerald-300"
                  >
                    {project.publishedUrl}
                  </a>
                  <Button size="xs" onClick={() => copyPublishedUrl(project.publishedUrl ?? "")}>
                    {copiedUrl ? "Copied" : "Copy"}
                  </Button>
                  <a href={project.publishedUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "xs")}>
                    Open<span className="sr-only"> the live site (new tab)</span>
                  </a>
                </div>
              )}
            </StepSection>
          </div>
        </div>

        {publishDialogOpen && (
          <PublishDialog
            project={project}
            voice={selectedVoice}
            onClose={() => {
              setPublishDialogOpen(false);
              void refreshProject();
            }}
            onProjectUpdate={applyServerProject}
          />
        )}

        {hasUnsavedChanges && (
          // Fixed, so it stays reachable from anywhere on the page (and on phones).
          <div
            role="region"
            aria-label="Unsaved changes"
            className="fixed inset-x-4 bottom-4 z-[1001] mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white/95 p-2 pl-4 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-full"
          >
            <span className="text-sm font-medium text-neutral-700 dark:text-indigo-100">
              {changeCount > 1 ? `${changeCount} unsaved changes` : "Unsaved changes"}
            </span>
            <Button size="sm" onClick={discardChanges} disabled={savingChunks}>
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleSaveChanges()}
              disabled={savingChunks || narrationRunning}
              title={narrationRunning ? "Wait for narration to finish" : undefined}
            >
              {savingChunks ? "Saving…" : "Save changes"}
            </Button>
            {narrationRunning && <span className="w-full px-2 text-center text-xs text-muted-foreground">Saving is paused while narration is generated.</span>}
            {chunksSaveError && (
              <span role="alert" className="w-full px-2 text-center text-xs text-red-700 dark:text-red-300">
                {chunksSaveError}
              </span>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function RunNoticeView({ notice, busy, onRetry }: { notice: RunNotice; busy: boolean; onRetry: (ids: string[]) => void }) {
  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className={cn(
        "flex flex-col gap-2 rounded-xl px-3 py-2 text-xs",
        notice.tone === "error"
          ? "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-100"
          : "bg-amber-50 text-amber-900 dark:bg-amber-400/10 dark:text-amber-100"
      )}
    >
      <p>{notice.message}</p>
      <div className="flex flex-wrap gap-2">
        {notice.retry && (
          <Button size="xs" onClick={() => onRetry(notice.retry!.ids)} disabled={busy}>
            {notice.retry.label}
          </Button>
        )}
        {isKeyProblem(notice.code) && (
          <Link href={settingsHrefFor(notice.code)} className={buttonClass("secondary", "xs")}>
            Open Settings
          </Link>
        )}
      </div>
    </div>
  );
}

function ChecklistItem({ done, text, optional = false }: { done: boolean; text: string; optional?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.75rem] leading-none",
          done
            ? "bg-emerald-500 text-neutral-950"
            : optional
              ? "border border-neutral-400 dark:border-white/30"
              : "border-2 border-amber-500"
        )}
      >
        {done ? "✓" : ""}
      </span>
      <span className={done ? "text-neutral-800 dark:text-indigo-50" : "text-neutral-800 dark:text-indigo-50"}>
        <span className="sr-only">{done ? "Done: " : optional ? "Optional: " : "To do: "}</span>
        {text}
      </span>
    </li>
  );
}
