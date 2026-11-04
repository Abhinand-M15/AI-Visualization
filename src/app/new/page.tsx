"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { useDraftStore } from "@/lib/store";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/types";
import { formatDate } from "@/lib/projects";
import { plural } from "@/lib/contentVersion";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";
import { LoadingBar } from "@/components/LoadingBar";
import { MAX_UPLOAD_BYTES, UPLOAD_EXTENSIONS } from "@/app/api/uploads/shared";
import LogoUpload from "@/components/LogoUpload";
import { Button, cardClass, fieldClass, pageSubtitleClass, pageTitleClass } from "@/components/ui/button";
import { ErrorState } from "@/components/StateViews";
import { useUnsavedChangesWarning } from "@/components/useUnsavedChangesWarning";

interface DomainOption {
  id: string;
  slug: string;
  name: string;
}

/** One line per document type so "BRD" and the fixed case-study layout are explained (UX-13). */
const TYPE_DESCRIPTIONS: Record<DocumentType, string> = {
  "case-study": "A client success story, laid out in fixed sections: Company, Domain, Customer, Problem, Solution, Impact.",
  brd: "A business requirements document, told as chapters that walk through the requirements.",
  other: "Any other document, told as chapters that follow its own structure.",
};

const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
const ACCEPTED_LABEL = UPLOAD_EXTENSIONS.map((ext) => ext.replace(".", "").toUpperCase()).join(", ");

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatElapsed(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Problem with a picked file, checked before uploading; null when it's fine. */
function fileProblem(file: File): string | null {
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()!.toLowerCase()}` : "";
  if (!UPLOAD_EXTENSIONS.includes(extension)) return `This file type isn't supported. Use ${ACCEPTED_LABEL}.`;
  if (file.size > MAX_UPLOAD_BYTES) return `This file is ${formatBytes(file.size)}. The limit is ${MAX_UPLOAD_MB} MB.`;
  return null;
}

export default function NewStoryPage() {
  const router = useRouter();
  const {
    storyline,
    status,
    errorMessage,
    errorCode,
    actionError,
    lastFeedback,
    generateStage,
    generateStartedAt,
    savedAt,
    restored,
    notice,
    generate,
    cancelGenerate,
    editChunk,
    revise,
    save,
    dismissActionError,
    reset,
  } = useDraftStore();
  const fileInputId = useId();
  const countId = useId();
  const feedbackId = useId();

  const [documentType, setDocumentType] = useState<DocumentType>("case-study");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [targetChunkCount, setTargetChunkCount] = useState("");
  // Optional industry domain; the dropdown stays hidden when none are available.
  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [domainId, setDomainId] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Bring back a draft kept from an earlier visit (reload, closed tab).
  useEffect(() => {
    void useDraftStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/domains")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.domains)) setDomains(data.domains as DomainOption[]);
      })
      .catch(() => {
        // Domains are optional: on any failure the dropdown just stays hidden.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Elapsed time while generating (an honest clock, not a fake percentage).
  useEffect(() => {
    if (status !== "generating") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const isBusy = status === "generating" || status === "revising" || status === "saving";
  const hasDraft = Boolean(storyline) && (status === "reviewing" || status === "revising" || status === "saving");

  useUnsavedChangesWarning(
    status === "generating" || hasDraft,
    status === "generating"
      ? "Leave this page? The story being generated will be lost."
      : "Leave without saving? Your draft stays on this device and comes back when you open New story again."
  );

  function pickFile(next: File | null) {
    setFileError(next ? fileProblem(next) : null);
    setFile(next && !fileProblem(next) ? next : null);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (isBusy) return;
    pickFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleGenerate() {
    if (!file) return;
    const parsedCount = targetChunkCount.trim() ? Number(targetChunkCount) : undefined;
    await generate(file, documentType, parsedCount, {
      ...(domainId && domains.some((domain) => domain.id === domainId) ? { domainId } : {}),
      ...(logoPath ? { logoPath } : {}),
    });
  }

  async function handleSave() {
    const project = await save();
    if (project) {
      reset();
      router.push(`/projects/${project.id}`);
    }
  }

  function startOver() {
    if (hasDraft && !window.confirm("Start over? The generated draft and your edits on this page are deleted.")) return;
    reset();
    setFeedbackText("");
  }

  const elapsed = generateStartedAt ? formatElapsed(now - generateStartedAt) : undefined;

  return (
    <>
      <SpaceBackdrop />
      <main className="flex w-full flex-1 flex-col text-neutral-900 dark:text-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-20 pt-2 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded text-sm text-muted-foreground hover:text-neutral-900 dark:hover:text-white"
            >
              <span aria-hidden>←</span> My stories
            </Link>
          </div>
          <header>
            <h1 className={pageTitleClass}>New story</h1>
            <p className={`mt-2 ${pageSubtitleClass}`}>
              Upload a document and the agent turns it into a narrated story told in chapters.
            </p>
          </header>

          {restored && hasDraft && (
            <div
              role="status"
              className="flex flex-col gap-2 rounded-2xl border border-violet-300 bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-100 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                We kept your unsaved draft{savedAt ? ` from ${formatDate(savedAt, true)}` : ""}. Save it to keep it as a
                story.
              </span>
              <Button variant="ghost" size="xs" onClick={startOver}>
                Discard draft
              </Button>
            </div>
          )}

          {(status === "idle" || status === "generating") && (
            <section
              aria-labelledby="upload-heading"
              className={`${cardClass} flex max-w-2xl flex-col gap-7 p-5 sm:p-8`}
            >
              <h2 id="upload-heading" className="sr-only">
                Upload a document
              </h2>
              {notice && status === "idle" && (
                <p role="status" className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-700 dark:bg-white/5 dark:text-indigo-100">
                  {notice}
                </p>
              )}

              <fieldset disabled={isBusy} className="flex flex-col gap-3">
                <legend className="mb-3 text-sm font-semibold text-neutral-800 dark:text-indigo-100">Document type</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {DOCUMENT_TYPES.map((option) => {
                    const checked = documentType === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                          checked
                            ? "border-violet-500 bg-violet-50 dark:border-violet-400/70 dark:bg-violet-500/10"
                            : "border-neutral-300 bg-white hover:bg-neutral-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                        }`}
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <input
                            type="radio"
                            name="document-type"
                            value={option.value}
                            checked={checked}
                            onChange={() => setDocumentType(option.value)}
                            className="accent-violet-600"
                          />
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{TYPE_DESCRIPTIONS[option.value]}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-neutral-800 dark:text-indigo-100" id={`${fileInputId}-label`}>
                  Document
                </span>
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept={UPLOAD_EXTENSIONS.join(",")}
                  disabled={isBusy}
                  aria-labelledby={`${fileInputId}-label ${fileInputId}-zone`}
                  aria-describedby={`${fileInputId}-hint`}
                  onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
                  className="peer sr-only"
                />
                <label
                  id={`${fileInputId}-zone`}
                  htmlFor={fileInputId}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (!isBusy) setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-60 ${
                    dragging
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                      : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-white/20 dark:bg-white/[0.02] dark:hover:bg-white/5"
                  }`}
                >
                  {file ? (
                    <>
                      <span className="max-w-full truncate font-medium text-neutral-900 dark:text-white" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} · click or drop another file to replace it
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-neutral-900 dark:text-white">Choose a file or drop it here</span>
                      <span className="text-xs text-muted-foreground">No file chosen yet</span>
                    </>
                  )}
                </label>
                <p id={`${fileInputId}-hint`} className="text-xs text-muted-foreground">
                  {ACCEPTED_LABEL}, up to {MAX_UPLOAD_MB} MB.
                </p>
                {fileError && (
                  <p role="alert" className="text-xs text-red-700 dark:text-red-300">
                    {fileError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor={countId} className="text-sm font-semibold text-neutral-800 dark:text-indigo-100">
                  Number of chapters <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id={countId}
                  type="number"
                  min={1}
                  max={200}
                  step={1}
                  inputMode="numeric"
                  disabled={isBusy}
                  value={targetChunkCount}
                  onChange={(event) => setTargetChunkCount(event.target.value)}
                  placeholder="Auto"
                  aria-describedby={`${countId}-hint`}
                  className={`${fieldClass} sm:w-40`}
                />
                <p id={`${countId}-hint`} className="text-xs text-muted-foreground">
                  Leave blank to let the agent decide from the document. If there are more topics than chapters, related
                  ones are grouped together rather than dropped.
                </p>
              </div>

              {domains.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="story-domain" className="text-sm font-semibold text-neutral-800 dark:text-indigo-100">
                    Industry <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <select
                    id="story-domain"
                    value={domainId}
                    disabled={isBusy}
                    onChange={(event) => setDomainId(event.target.value)}
                    aria-describedby="story-domain-hint"
                    className={`${fieldClass} sm:max-w-sm`}
                  >
                    <option value="">No specific industry</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                  <p id="story-domain-hint" className="text-xs text-muted-foreground">
                    The story uses this industry&apos;s wording, and its avatars and scene images follow it.
                  </p>
                </div>
              )}

              <LogoUpload value={logoPath} onChange={setLogoPath} />

              <div className="flex flex-col gap-3 border-t border-neutral-200 pt-5 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="lg" onClick={handleGenerate} disabled={!file || isBusy}>
                    {status === "generating" ? "Generating story…" : "Generate story"}
                  </Button>
                  {status === "generating" && (
                    <Button variant="secondary" size="sm" onClick={cancelGenerate}>
                      Cancel
                    </Button>
                  )}
                </div>
                {status === "generating" ? (
                  <>
                    <LoadingBar
                      label={
                        generateStage === "uploading"
                          ? "Uploading the document…"
                          : "Reading the document and writing the chapters…"
                      }
                      detail={elapsed}
                    />
                    <p className="text-xs text-muted-foreground">
                      This usually takes 1 to 3 minutes (at most 5). Keep this tab open until it finishes.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Generating usually takes 1 to 3 minutes. Nothing is saved until you review the draft and click Save.
                  </p>
                )}
              </div>
            </section>
          )}

          {status === "error" && (
            <ErrorState
              title="The story couldn't be generated"
              message={errorMessage ?? "Something went wrong. Try again."}
              code={errorCode}
              onRetry={file ? () => void handleGenerate() : undefined}
            >
              <Button variant="ghost" size="sm" onClick={startOver}>
                Start over
              </Button>
            </ErrorState>
          )}

          {storyline && hasDraft && (
            <section aria-labelledby="draft-heading" className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Draft, not saved yet</p>
                <h2 id="draft-heading" className="mt-1 break-words text-2xl font-semibold tracking-tight">
                  {storyline.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plural(storyline.chunks.length, "chapter")}. Edit any chapter below, ask for changes, then save.
                </p>
              </div>

              <ol className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {storyline.chunks.map((chunk) => (
                  <li key={chunk.id} className={`${cardClass} flex flex-col gap-2 p-4`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
                        Chapter {chunk.order}
                      </span>
                      {chunk.userEdited && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                          Edited
                        </span>
                      )}
                    </div>
                    <label className="sr-only" htmlFor={`draft-title-${chunk.id}`}>
                      Chapter {chunk.order} title
                    </label>
                    <input
                      id={`draft-title-${chunk.id}`}
                      value={chunk.title}
                      onChange={(event) => editChunk(chunk.id, { title: event.target.value })}
                      disabled={isBusy}
                      className={`${fieldClass} font-medium`}
                    />
                    <label className="sr-only" htmlFor={`draft-text-${chunk.id}`}>
                      Chapter {chunk.order} narration text
                    </label>
                    <textarea
                      id={`draft-text-${chunk.id}`}
                      value={chunk.narrativeText}
                      onChange={(event) => editChunk(chunk.id, { narrativeText: event.target.value })}
                      disabled={isBusy}
                      rows={4}
                      className={`${fieldClass} leading-relaxed`}
                    />
                  </li>
                ))}
              </ol>

              <div className={`${cardClass} flex flex-col gap-3 p-5`}>
                <label htmlFor={feedbackId} className="text-sm font-semibold text-neutral-800 dark:text-indigo-100">
                  Ask for changes <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id={feedbackId}
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                  disabled={isBusy}
                  rows={2}
                  placeholder='For example: "make chapter 3 more concise"'
                  aria-describedby={`${feedbackId}-hint`}
                  className={fieldClass}
                />
                <p id={`${feedbackId}-hint`} className="text-xs text-muted-foreground">
                  Chapters marked Edited are always kept exactly as you wrote them.
                </p>

                {actionError && (
                  <ErrorState
                    compact
                    message={
                      actionError.action === "save"
                        ? `Not saved: ${actionError.message} Your draft is still here.`
                        : `${actionError.message} Your draft is unchanged.`
                    }
                    code={actionError.code}
                    onRetry={() =>
                      actionError.action === "save" ? void handleSave() : void revise(lastFeedback ?? feedbackText)
                    }
                  >
                    <Button variant="ghost" size="xs" onClick={dismissActionError}>
                      Dismiss
                    </Button>
                  </ErrorState>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="md" onClick={handleSave} disabled={isBusy}>
                    {status === "saving" ? "Saving…" : "Save story"}
                  </Button>
                  <Button variant="secondary" size="md" onClick={() => revise(feedbackText)} disabled={isBusy}>
                    {status === "revising" ? "Regenerating…" : feedbackText.trim() ? "Regenerate with changes" : "Regenerate"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={startOver} disabled={isBusy} className="sm:ml-auto">
                    Start over
                  </Button>
                </div>
                {status === "revising" && <LoadingBar label="Regenerating the chapters…" />}
              </div>
            </section>
          )}

        </div>
      </main>
    </>
  );
}
