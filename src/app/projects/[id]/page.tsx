"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import type { Chunk, Project } from "@/lib/types";
import { AVATARS } from "@/lib/avatars";
import { TEMPLATES } from "@/lib/templates";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LoadingBar } from "@/components/LoadingBar";
import { flattenCaseStudySections } from "@/lib/caseStudySections";
import { readNdjsonStream } from "@/lib/readNdjsonStream";

interface Voice {
  name: string;
  language: string;
  gender: string;
}

const MONTH_ABBREVIATIONS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatBoundAt(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_ABBREVIATIONS[date.getMonth()];
  const timePart = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${day} ${month} ${date.getFullYear()}, ${timePart}`;
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[] | null>(null);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingChunkId, setGeneratingChunkId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ completed: number; total: number } | null>(null);
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [savingSelection, setSavingSelection] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const chunksPaneRef = useRef<HTMLDivElement | null>(null);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [chunkPaneHeight, setChunkPaneHeight] = useState(0);
  const [editedChunks, setEditedChunks] = useState<Chunk[]>([]);
  const [chunksDirty, setChunksDirty] = useState(false);
  const [savingChunks, setSavingChunks] = useState(false);
  const [chunksSaveError, setChunksSaveError] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [binding, setBinding] = useState(false);
  const [bindingError, setBindingError] = useState<string | null>(null);
  const [generatingCaseStudyAudio, setGeneratingCaseStudyAudio] = useState(false);
  const [caseStudyAudioError, setCaseStudyAudioError] = useState<string | null>(null);
  const [caseStudyAudioProgress, setCaseStudyAudioProgress] = useState<{ completed: number; total: number } | null>(
    null
  );

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProject(data.project);
        setEditedChunks(data.project.chunks);
        if (data.project.selectedVoice) setSelectedVoice(data.project.selectedVoice);
        if (data.project.selectedAvatarIds) setSelectedAvatarIds(data.project.selectedAvatarIds);
        if (data.project.selectedTemplateId) setSelectedTemplateId(data.project.selectedTemplateId);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load project."));
  }, [id]);

  useEffect(() => {
    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const englishFirst = [...(data.voices as Voice[])].sort((a, b) => {
          const aEn = a.language.startsWith("en") ? 0 : 1;
          const bEn = b.language.startsWith("en") ? 0 : 1;
          return aEn - bEn || a.language.localeCompare(b.language);
        });
        setVoices(englishFirst);
        setSelectedVoice((current) => current || englishFirst[0]?.name || "");
      })
      .catch((err) =>
        setVoicesError(err instanceof Error ? err.message : "Failed to load voices.")
      );
  }, []);

  // Chunks are paged one at a time, not freely scrolled: one wheel gesture
  // moves exactly one chunk out and brings the next one to center. The whole
  // stack sits in a single track that's translated by a full pane-height per
  // step, animated with one plain CSS transition — no per-frame JS position
  // math, so there's nothing left to fight with the browser's own scroll
  // input and cause jitter.
  //
  // A single physical scroll (one wheel flick, one trackpad swipe) does NOT
  // fire one wheel event — it fires a burst of many, and on a trackpad the
  // momentum tail after your finger lifts can keep firing events for well
  // over a second. A fixed "ignore events for 600ms" cooldown was too short
  // for that tail, so the trailing events after the cooldown expired were
  // read as a brand new gesture and kept advancing — that's the "one scroll
  // moves 3-4 chunks" bug. Fixed by committing on the FIRST event of a burst,
  // then suppressing every event that follows for as long as they keep
  // arriving, and only re-arming once there's been a real pause (no wheel
  // events for a beat) — so it no longer matters how long the momentum lasts.
  useEffect(() => {
    const pane = chunksPaneRef.current;
    if (!pane) return;

    let gestureActive = false;
    let gestureEndTimer: number | null = null;

    function measure() {
      if (pane) setChunkPaneHeight(pane.clientHeight);
    }

    function handleWheel(event: WheelEvent) {
      const target = event.target as HTMLElement;
      // Let native interaction/scroll happen inside form controls (e.g. a
      // long narrative textarea) instead of hijacking it to page chunks.
      if (target.closest("textarea, input, select, audio")) return;

      event.preventDefault();
      if (Math.abs(event.deltaY) < 4) return;

      if (!gestureActive) {
        gestureActive = true;
        const direction = event.deltaY > 0 ? 1 : -1;
        setActiveChunkIndex((current) =>
          Math.min(editedChunks.length - 1, Math.max(0, current + direction))
        );
      }

      // Every event in the burst (including the momentum tail) pushes the
      // "end of gesture" point further out; only a genuine pause clears it.
      if (gestureEndTimer !== null) window.clearTimeout(gestureEndTimer);
      gestureEndTimer = window.setTimeout(() => {
        gestureActive = false;
        gestureEndTimer = null;
      }, 200);
    }

    measure();
    pane.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", measure);
    return () => {
      if (gestureEndTimer !== null) window.clearTimeout(gestureEndTimer);
      pane.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", measure);
    };
  }, [editedChunks.length]);

  async function generateAudio(chunkIds?: string[]) {
    if (!project || !selectedVoice) return;
    setAudioError(null);
    setAudioProgress(null);
    if (chunkIds) setGeneratingChunkId(chunkIds[0]);
    else setGeneratingAll(true);

    try {
      const res = await fetch(`/api/projects/${id}/generate-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: selectedVoice, chunkIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate audio.");
      }

      let failures: { chunkId: string; message: string }[] | undefined;
      await readNdjsonStream(res, (message) => {
        const msg = message as
          | { type: "progress"; completed: number; total: number }
          | { type: "done"; project: Project; failures?: { chunkId: string; message: string }[] }
          | { type: "error"; message: string };
        if (msg.type === "progress") setAudioProgress({ completed: msg.completed, total: msg.total });
        else if (msg.type === "done") {
          setProject(msg.project);
          failures = msg.failures;
        } else if (msg.type === "error") throw new Error(msg.message);
      });

      if (failures && failures.length > 0) {
        setAudioError(
          `${failures.length} chunk(s) failed to generate audio (network hiccup) — the rest succeeded. Retry those chunks individually.`
        );
      }
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : "Failed to generate audio.");
    } finally {
      setGeneratingAll(false);
      setGeneratingChunkId(null);
      setAudioProgress(null);
    }
  }

  async function handlePreviewVoice() {
    if (!selectedVoice) return;
    setPreviewError(null);
    setPreviewingVoice(true);
    try {
      previewAudioRef.current?.pause();
      const res = await fetch("/api/preview-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: selectedVoice }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to preview voice.");
      }
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      previewAudioRef.current = audio;
      await audio.play();
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Failed to preview voice.");
    } finally {
      setPreviewingVoice(false);
    }
  }

  async function saveSelection(next: { avatarIds?: string[]; templateId?: string }) {
    setSavingSelection(true);
    setSelectionError(null);
    try {
      const res = await fetch(`/api/projects/${id}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedAvatarIds: next.avatarIds,
          selectedTemplateId: next.templateId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save selection.");
      setProject(data.project);
    } catch (err) {
      setSelectionError(err instanceof Error ? err.message : "Failed to save selection.");
    } finally {
      setSavingSelection(false);
    }
  }

  function toggleAvatar(avatarId: string) {
    const next = selectedAvatarIds.includes(avatarId)
      ? selectedAvatarIds.filter((existing) => existing !== avatarId)
      : [...selectedAvatarIds, avatarId];
    setSelectedAvatarIds(next);
    saveSelection({ avatarIds: next });
  }

  function selectTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    saveSelection({ templateId });
  }

  function editChunkField(chunkId: string, field: "title" | "narrativeText", value: string) {
    setEditedChunks((current) =>
      current.map((chunk) => (chunk.id === chunkId ? { ...chunk, [field]: value } : chunk))
    );
    setChunksDirty(true);
  }

  async function handleSaveChunks() {
    setSavingChunks(true);
    setChunksSaveError(null);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks: editedChunks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save changes.");
      setProject(data.project);
      setEditedChunks(data.project.chunks);
      setChunksDirty(false);
    } catch (err) {
      setChunksSaveError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSavingChunks(false);
    }
  }

  async function handleRegenerate() {
    if (!project) return;
    setRegenerating(true);
    setRegenerateError(null);
    try {
      const reviseRes = await fetch("/api/revise-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyline: { title: project.title, chunks: editedChunks },
          feedbackText,
          documentType: project.documentType,
        }),
      });
      const reviseData = await reviseRes.json();
      if (!reviseRes.ok) throw new Error(reviseData.error || "Failed to regenerate.");

      const saveRes = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks: reviseData.storyline.chunks }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "Failed to save regenerated story.");

      setProject(saveData.project);
      setEditedChunks(saveData.project.chunks);
      setChunksDirty(false);
      setFeedbackText("");
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : "Failed to regenerate.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch(`/api/projects/${id}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish.");
      setProject(data.project);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Failed to publish.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleBindCaseStudy() {
    setBinding(true);
    setBindingError(null);
    try {
      const res = await fetch(`/api/projects/${id}/bind-case-study`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate case study layout.");
      setProject(data.project);
    } catch (err) {
      setBindingError(err instanceof Error ? err.message : "Failed to generate case study layout.");
    } finally {
      setBinding(false);
    }
  }

  async function handleGenerateCaseStudyAudio() {
    if (!selectedVoice) return;
    setGeneratingCaseStudyAudio(true);
    setCaseStudyAudioError(null);
    setCaseStudyAudioProgress(null);
    try {
      const res = await fetch(`/api/projects/${id}/generate-case-study-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: selectedVoice }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate narration audio.");
      }

      let failures: { key: string; message: string }[] | undefined;
      await readNdjsonStream(res, (message) => {
        const msg = message as
          | { type: "progress"; completed: number; total: number }
          | { type: "done"; project: Project; failures?: { key: string; message: string }[] }
          | { type: "error"; message: string };
        if (msg.type === "progress") setCaseStudyAudioProgress({ completed: msg.completed, total: msg.total });
        else if (msg.type === "done") {
          setProject(msg.project);
          failures = msg.failures;
        } else if (msg.type === "error") throw new Error(msg.message);
      });

      if (failures && failures.length > 0) {
        setCaseStudyAudioError(
          `${failures.length} section(s) failed to generate audio (network hiccup) — the rest succeeded. Click "Regenerate narration audio" to retry the missing ones.`
        );
      }
    } catch (err) {
      setCaseStudyAudioError(err instanceof Error ? err.message : "Failed to generate narration audio.");
    } finally {
      setGeneratingCaseStudyAudio(false);
      setCaseStudyAudioProgress(null);
    }
  }

  const isBusy = generatingAll || generatingChunkId !== null;
  const isCaseStudyProject = project?.documentType === "case-study";
  // Case-study projects always publish their bound layout (see
  // renderStaticSite), never one of the generic chunk-based templates, so
  // they don't need a template selection to be publish-ready — just an
  // avatar and a generated layout (checked separately, in the Publish button).
  const readyToPreview = selectedAvatarIds.length > 0 && (isCaseStudyProject || Boolean(selectedTemplateId));

  return (
    <>
      <SpaceBackdrop />
      <main className="flex w-full flex-col text-neutral-900 dark:text-white lg:h-screen lg:overflow-hidden">
        <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-4 lg:px-12 lg:shrink-0">
      <Link href="/" className="text-lg text-neutral-500 hover:text-neutral-800 dark:text-indigo-200/60 dark:hover:text-indigo-100">
        ← All stories
      </Link>

      {error && <p className="text-lg text-red-600 dark:text-red-400">{error}</p>}
      {!error && !project && <p className="text-lg text-neutral-500 dark:text-indigo-200/60">Loading…</p>}

      {project && (
          <header>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{project.title}</h1>
            <p className="mt-2 text-lg text-neutral-500 dark:text-indigo-200/60">
              {project.chunks.length} chunks · {project.documentType}
              {project.sourceFileName ? ` · from ${project.sourceFileName}` : ""}
            </p>
          </header>
      )}
        </div>

        {project && (
          <div className="flex min-h-0 w-full flex-col gap-8 px-6 pb-8 lg:flex-1 lg:flex-row lg:gap-16 lg:overflow-hidden lg:px-12">
          <div className="flex flex-col gap-8 lg:w-1/2 lg:overflow-y-auto lg:pr-2">

          <section className="flex flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_50px_rgba(99,102,241,0.06)] dark:backdrop-blur-sm">
            <label className="text-2xl font-medium text-neutral-800 dark:text-indigo-100">Voice</label>
            {voicesError && <p className="text-base text-red-600 dark:text-red-400">{voicesError}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedVoice}
                  onChange={(event) => setSelectedVoice(event.target.value)}
                  disabled={!voices || isBusy}
                  className="w-full appearance-none rounded-full border border-neutral-200 bg-neutral-50 py-2.5 pl-5 pr-11 text-[13px] text-neutral-900 focus:border-violet-400 focus:outline-none disabled:opacity-60 dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:border-violet-400/60"
                >
                  {!voices && <option>Loading voices…</option>}
                  {voices?.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} — {voice.language}, {voice.gender}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-500 dark:text-indigo-200/60"
                  viewBox="0 0 12 8"
                  fill="none"
                >
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <button
                type="button"
                onClick={handlePreviewVoice}
                disabled={!selectedVoice || previewingVoice}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10"
              >
                {previewingVoice ? "Loading preview…" : "▶ Preview voice"}
              </button>
              <button
                type="button"
                onClick={() => generateAudio()}
                disabled={!selectedVoice || isBusy}
                className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-[13px] font-semibold text-neutral-950 shadow-[0_0_24px_rgba(139,92,246,0.4)] disabled:opacity-30"
              >
                {generatingAll ? "Generating all…" : "Generate audio for all chunks"}
              </button>
            </div>
            {previewError && <p className="text-base text-red-600 dark:text-red-400">{previewError}</p>}
            {generatingAll && (
              <LoadingBar
                label="Generating audio…"
                progress={audioProgress ? audioProgress.completed / audioProgress.total : undefined}
                detail={audioProgress ? `${audioProgress.completed} / ${audioProgress.total} chunks` : undefined}
              />
            )}
            {audioError && <p className="text-base text-red-600 dark:text-red-400">{audioError}</p>}
          </section>

          <section className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_50px_rgba(99,102,241,0.06)] dark:backdrop-blur-sm">
            <div>
              <label className="text-2xl font-medium text-neutral-800 dark:text-indigo-100">Avatar</label>
              <p className="text-base text-neutral-500 dark:text-indigo-200/50">Pick one, or both to alternate per chunk.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {AVATARS.map((avatar) => {
                const active = selectedAvatarIds.includes(avatar.id);
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => toggleAvatar(avatar.id)}
                    disabled={savingSelection}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-base font-medium transition-all disabled:opacity-30 ${
                      active
                        ? "border-violet-400 bg-violet-50 shadow-[0_0_20px_rgba(139,92,246,0.2)] dark:border-violet-400/60 dark:bg-violet-500/10 dark:shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                        : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar.imageUrl} alt={avatar.name} className="h-24 w-24 object-contain" />
                    <span className="text-neutral-700 dark:text-indigo-100">{avatar.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2">
              <label className="text-2xl font-medium text-neutral-800 dark:text-indigo-100">Template</label>
            </div>
            <div className="flex flex-col gap-3">
              {TEMPLATES.map((template) => {
                const active = selectedTemplateId === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => selectTemplate(template.id)}
                    disabled={savingSelection}
                    className={`rounded-2xl border p-5 text-left transition-all disabled:opacity-30 ${
                      active
                        ? "border-violet-400 bg-violet-50 shadow-[0_0_20px_rgba(139,92,246,0.2)] dark:border-violet-400/60 dark:bg-violet-500/10 dark:shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                        : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <p className="text-xl font-medium text-neutral-900 dark:text-white">{template.name}</p>
                    <p className="text-base text-neutral-500 dark:text-indigo-200/50">{template.description}</p>
                  </button>
                );
              })}
            </div>

            {selectionError && <p className="text-base text-red-600 dark:text-red-400">{selectionError}</p>}

            {readyToPreview && (
              <Link
                href={`/projects/${id}/preview`}
                target="_blank"
                className="mt-2 self-start rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-3.5 text-xl font-semibold text-neutral-950 shadow-[0_0_24px_rgba(139,92,246,0.4)]"
              >
                Preview site →
              </Link>
            )}
          </section>

          {readyToPreview && (
            <section className="flex flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_50px_rgba(16,185,129,0.05)] dark:backdrop-blur-sm">
              <label className="text-2xl font-medium text-neutral-800 dark:text-indigo-100">Publish</label>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing || project.publishStatus === "publishing"}
                  className="rounded-full bg-emerald-500 px-7 py-3.5 text-xl font-semibold text-neutral-950 shadow-[0_0_28px_rgba(16,185,129,0.45)] disabled:opacity-30"
                >
                  {publishing || project.publishStatus === "publishing"
                    ? "Publishing…"
                    : project.publishStatus === "published"
                    ? "Republish"
                    : "Publish"}
                </button>
                <span className="text-base font-medium text-neutral-500 dark:text-indigo-200/60">
                  Status: {project.publishStatus}
                </span>
              </div>
              {project.publishStatus === "published" && project.publishedUrl && (
                <a
                  href={project.publishedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  {project.publishedUrl} ↗
                </a>
              )}
              {publishError && <p className="text-base text-red-600 dark:text-red-400">{publishError}</p>}
            </section>
          )}

          {project.documentType === "case-study" && (
            <section className="flex flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_50px_rgba(99,102,241,0.06)] dark:backdrop-blur-sm">
              <div>
                <label className="text-2xl font-medium text-neutral-800 dark:text-indigo-100">Case study layout</label>
                <p className="text-base text-neutral-500 dark:text-indigo-200/50">
                  Fits this storyline into the case-study page template (Company → Domain → Customer → Problem → Solution → Impact). This is what Publish uses for case-study projects.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleBindCaseStudy}
                  disabled={binding}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-3.5 text-xl font-semibold text-neutral-950 shadow-[0_0_24px_rgba(139,92,246,0.4)] disabled:opacity-30"
                >
                  {binding
                    ? "Generating layout…"
                    : project.caseStudyBinding
                    ? "Regenerate layout"
                    : "Generate case study layout"}
                </button>
                {project.caseStudyBinding && (
                  <Link
                    href={`/projects/${id}/preview`}
                    target="_blank"
                    className="text-lg text-violet-700 hover:underline dark:text-violet-300"
                  >
                    Preview layout →
                  </Link>
                )}
              </div>
              {binding && <LoadingBar label="Generating case study layout…" />}
              {project.caseStudyBinding && (
                <p className="text-base text-neutral-500 dark:text-indigo-200/60">
                  Bound {formatBoundAt(project.caseStudyBinding.boundAt)}
                  {project.caseStudyBinding.diagnostics.length > 0
                    ? ` · ${project.caseStudyBinding.diagnostics.length} diagnostic${
                        project.caseStudyBinding.diagnostics.length === 1 ? "" : "s"
                      } (unsupported/compressed slots — see below)`
                    : " · every slot filled within budget, nothing dropped"}
                </p>
              )}
              {project.caseStudyBinding?.slots &&
                (() => {
                  const sections = flattenCaseStudySections(project.caseStudyBinding.slots);
                  const narratedCount = sections.filter(
                    (section) => project.caseStudyBinding?.sectionAudio?.[section.key]
                  ).length;
                  return (
                    <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5 dark:border-white/10">
                      <label className="text-xl font-medium text-neutral-800 dark:text-indigo-100">
                        Narration audio
                      </label>
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={handleGenerateCaseStudyAudio}
                          disabled={!selectedVoice || generatingCaseStudyAudio}
                          className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-lg font-semibold text-neutral-950 shadow-[0_0_24px_rgba(139,92,246,0.4)] disabled:opacity-30"
                        >
                          {generatingCaseStudyAudio
                            ? "Generating narration…"
                            : narratedCount > 0
                            ? "Regenerate narration audio"
                            : "Generate narration audio"}
                        </button>
                        <span className="text-base font-medium text-neutral-500 dark:text-indigo-200/60">
                          {narratedCount}/{sections.length} sections narrated
                        </span>
                      </div>
                      {generatingCaseStudyAudio && (
                        <LoadingBar
                          label="Generating narration…"
                          progress={
                            caseStudyAudioProgress
                              ? caseStudyAudioProgress.completed / caseStudyAudioProgress.total
                              : undefined
                          }
                          detail={
                            caseStudyAudioProgress
                              ? `${caseStudyAudioProgress.completed} / ${caseStudyAudioProgress.total} sections`
                              : undefined
                          }
                        />
                      )}
                      {caseStudyAudioError && (
                        <p className="text-base text-red-600 dark:text-red-400">{caseStudyAudioError}</p>
                      )}
                    </div>
                  );
                })()}
              {project.caseStudyBinding && project.caseStudyBinding.diagnostics.length > 0 && (
                <ul className="flex flex-col gap-2 text-sm text-amber-700 dark:text-amber-300">
                  {project.caseStudyBinding.diagnostics.map((diagnostic, index) => (
                    <li key={index}>
                      <span className="font-medium">{diagnostic.slotId}</span> — {diagnostic.issue}: {diagnostic.detail}
                    </li>
                  ))}
                </ul>
              )}
              {bindingError && <p className="text-base text-red-600 dark:text-red-400">{bindingError}</p>}
            </section>
          )}

          </div>

          <div className="flex min-h-0 flex-col gap-6 lg:w-1/2">

          <section className="flex shrink-0 flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-sm">
            <label className="text-xl font-medium text-neutral-800 dark:text-indigo-100">Regenerate with feedback</label>
            <textarea
              value={feedbackText}
              onChange={(event) => setFeedbackText(event.target.value)}
              disabled={regenerating}
              rows={2}
              placeholder='e.g. "make chunk 3 more concise" — chunks you hand-edit below are always preserved as-is.'
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg text-neutral-900 placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-indigo-200/30 dark:focus:border-violet-400/60"
            />
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="self-start rounded-full border border-neutral-200 bg-neutral-50 px-6 py-3 text-lg font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10"
            >
              {regenerating ? "Regenerating…" : "Regenerate"}
            </button>
            {regenerating && <LoadingBar label="Regenerating storyline…" />}
            {regenerateError && <p className="text-base text-red-600 dark:text-red-400">{regenerateError}</p>}
          </section>

          <div ref={chunksPaneRef} className="relative min-h-0 flex-1 overflow-hidden">
            <div
              className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateY(-${activeChunkIndex * chunkPaneHeight}px)` }}
            >
              {editedChunks.map((chunk, i) => {
                const isActive = i === activeChunkIndex;
                return (
                  <div
                    key={chunk.id}
                    className="flex items-center justify-center px-1"
                    style={{ height: chunkPaneHeight || "100%" }}
                  >
                    <div
                      className={`chunk-card relative max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border p-6 shadow-2xl transition-all duration-500 dark:shadow-[0_0_60px_rgba(99,102,241,0.15)] ${
                        isActive
                          ? "chunk-card--active scale-100 opacity-100"
                          : "scale-[0.86] opacity-40"
                      } border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950`}
                    >
                      <div className="mb-3 flex items-center justify-between pt-6">
                        <span className="text-lg font-medium text-cyan-700 dark:text-cyan-300/70">Chunk {chunk.order}</span>
                        {chunk.userEdited && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                            edited
                          </span>
                        )}
                      </div>
                      <input
                        value={chunk.title}
                        onChange={(event) => editChunkField(chunk.id, "title", event.target.value)}
                        className="mb-3 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xl font-medium text-neutral-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:border-violet-400/60"
                      />
                      <textarea
                        value={chunk.narrativeText}
                        onChange={(event) => editChunkField(chunk.id, "narrativeText", event.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg leading-relaxed text-neutral-700 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-indigo-100/90 dark:focus:border-violet-400/60"
                      />

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {chunk.audioUrl && <AudioPlayer src={chunk.audioUrl} />}
                        <button
                          type="button"
                          onClick={() => generateAudio([chunk.id])}
                          disabled={!selectedVoice || isBusy}
                          className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10"
                        >
                          {generatingChunkId === chunk.id
                            ? "Generating…"
                            : chunk.audioUrl
                            ? "Regenerate audio"
                            : "Generate audio"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-2 flex flex-col items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveChunkIndex((i) => Math.max(0, i - 1))}
                disabled={activeChunkIndex === 0}
                aria-label="Previous chunk"
                className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm transition-opacity disabled:opacity-30 dark:border-white/10 dark:bg-neutral-900/90 dark:text-indigo-100"
              >
                ↑
              </button>
              <span className="text-xs font-medium text-neutral-500 dark:text-indigo-200/60">
                {activeChunkIndex + 1}/{editedChunks.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveChunkIndex((i) => Math.min(editedChunks.length - 1, i + 1))}
                disabled={activeChunkIndex === editedChunks.length - 1}
                aria-label="Next chunk"
                className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm transition-opacity disabled:opacity-30 dark:border-white/10 dark:bg-neutral-900/90 dark:text-indigo-100"
              >
                ↓
              </button>
            </div>
          </div>

          {chunksDirty && (
            <div className="z-[1001] flex shrink-0 items-center gap-3 self-start rounded-full border border-neutral-200 bg-white/95 p-1.5 pl-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-[0_0_30px_rgba(139,92,246,0.25)]">
              <span className="text-base font-medium text-neutral-500 dark:text-indigo-200/70">Unsaved changes</span>
              <button
                type="button"
                onClick={handleSaveChunks}
                disabled={savingChunks}
                className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-base font-semibold text-neutral-950 disabled:opacity-30"
              >
                {savingChunks ? "Saving…" : "Save changes"}
              </button>
              {chunksSaveError && <span className="pr-2 text-base text-red-600 dark:text-red-400">{chunksSaveError}</span>}
            </div>
          )}

          </div>
          </div>
        )}
      </main>
    </>
  );
}
