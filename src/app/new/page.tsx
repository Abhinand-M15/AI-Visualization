"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDraftStore } from "@/lib/store";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/types";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";
import { LoadingBar } from "@/components/LoadingBar";
import { UPLOAD_EXTENSIONS } from "@/app/api/uploads/shared";
import { useApiKeyGate } from "@/app/settings/useApiKeyGate";
import LogoUpload from "@/components/LogoUpload";

interface DomainOption {
  id: string;
  slug: string;
  name: string;
}

export default function NewStoryPage() {
  const router = useRouter();
  const { storyline, status, errorMessage, errorCode, generate, editChunk, revise, save, reset } = useDraftStore();
  useApiKeyGate();

  const [documentType, setDocumentType] = useState<DocumentType>("case-study");
  const [file, setFile] = useState<File | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [targetChunkCount, setTargetChunkCount] = useState("");
  // Optional industry domain; the dropdown stays hidden when none are available.
  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [domainId, setDomainId] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);

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

  const isBusy = status === "generating" || status === "revising" || status === "saving";

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

  return (
    <>
      <SpaceBackdrop />
      <main className="flex w-full flex-1 flex-col text-neutral-900 dark:text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 lg:px-12">
      <header>
        <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">New story</h1>
        <p className="mt-4 text-xl text-neutral-500 dark:text-indigo-200/70">
          Upload a document and let the agent turn it into a chunked, narrated story.
        </p>
      </header>

      {(status === "idle" || status === "generating") && (
        <section className="flex max-w-2xl flex-col gap-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_60px_rgba(99,102,241,0.08)] dark:backdrop-blur-sm">
          <div>
            <label className="mb-3 block text-lg font-medium text-neutral-700 dark:text-indigo-100">
              Document type
            </label>
            <div className="flex flex-wrap gap-3">
              {DOCUMENT_TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDocumentType(option.value)}
                  disabled={isBusy}
                  className={`rounded-full px-5 py-2.5 text-lg font-medium transition-all ${
                    documentType === option.value
                      ? "bg-gradient-to-r from-violet-500 to-cyan-400 text-neutral-950 shadow-[0_0_24px_rgba(139,92,246,0.5)]"
                      : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100/70 dark:hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-lg font-medium text-neutral-700 dark:text-indigo-100">
              Document
            </label>
            <input
              type="file"
              accept={UPLOAD_EXTENSIONS.join(",")}
              disabled={isBusy}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-lg text-neutral-600 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-neutral-200 file:px-5 file:py-2.5 file:text-lg file:font-medium file:text-neutral-800 dark:border-white/20 dark:bg-white/[0.02] dark:text-indigo-100/80 dark:file:bg-white/10 dark:file:text-white"
            />
            <p className="mt-3 text-base text-neutral-500 dark:text-indigo-200/50">
              Accepted: PDF, PPTX, XLSX, DOCX, TXT, MD.
            </p>
          </div>

          <div>
            <label className="mb-3 block text-lg font-medium text-neutral-700 dark:text-indigo-100">
              Number of chunks
            </label>
            <input
              type="number"
              min={1}
              max={200}
              step={1}
              inputMode="numeric"
              disabled={isBusy}
              value={targetChunkCount}
              onChange={(event) => setTargetChunkCount(event.target.value)}
              placeholder="Let the AI decide"
              className="w-40 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg text-neutral-900 placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-indigo-200/30 dark:focus:border-violet-400/60"
            />
            <p className="mt-3 text-base text-neutral-500 dark:text-indigo-200/50">
              How many sections the generated site should have. Leave blank to let the agent decide from the
              document&apos;s own content. If the document has more distinct scenarios than this number, related
              ones are grouped together rather than dropped.
            </p>
          </div>

          {domains.length > 0 && (
            <div>
              <label htmlFor="story-domain" className="mb-3 block text-lg font-medium text-neutral-700 dark:text-indigo-100">
                Domain (optional)
              </label>
              <select
                id="story-domain"
                value={domainId}
                disabled={isBusy}
                onChange={(event) => setDomainId(event.target.value)}
                className="w-full max-w-sm rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg text-neutral-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:border-violet-400/60"
              >
                <option value="">No specific domain</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-base text-neutral-500 dark:text-indigo-200/50">
                The story uses this industry&apos;s wording, and its avatars and scene images follow it.
              </p>
            </div>
          )}

          <LogoUpload value={logoPath} onChange={setLogoPath} />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!file || isBusy}
            className="self-start rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-3.5 text-lg font-semibold text-neutral-950 shadow-[0_0_30px_rgba(139,92,246,0.45)] transition-opacity disabled:opacity-30"
          >
            {status === "generating" ? "Generating story…" : "Generate story"}
          </button>
          {status === "generating" && <LoadingBar label="Reading the document and building the storyline…" />}
        </section>
      )}

      {status === "error" && (
        <section className="rounded-3xl border border-red-300 bg-red-50 p-6 text-lg text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <p className="text-xl font-medium">Something went wrong</p>
          <p className="mt-2">{errorMessage}</p>
          {errorCode === "missing_api_key" && (
            <Link
              href="/settings?onboarding=1"
              className="mt-4 mr-3 inline-block rounded-full border border-red-300 px-5 py-2.5 text-base font-medium dark:border-red-400/40"
            >
              Open Settings
            </Link>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-full bg-red-600 px-5 py-2.5 text-base font-medium text-white dark:bg-red-500"
          >
            Start over
          </button>
        </section>
      )}

      {storyline && (status === "reviewing" || status === "revising" || status === "saving") && (
        <section className="flex flex-col gap-8">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight">{storyline.title}</h2>
            <p className="mt-1 text-lg text-neutral-500 dark:text-indigo-200/60">
              {storyline.chunks.length} chunks
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {storyline.chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_40px_rgba(99,102,241,0.06)] dark:backdrop-blur-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-base font-medium text-cyan-700 dark:text-cyan-300/70">
                    Chunk {chunk.order}
                  </span>
                  {chunk.userEdited && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                      edited
                    </span>
                  )}
                </div>
                <input
                  value={chunk.title}
                  onChange={(event) => editChunk(chunk.id, { title: event.target.value })}
                  disabled={isBusy}
                  className="mb-3 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg font-medium text-neutral-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:border-violet-400/60"
                />
                <textarea
                  value={chunk.narrativeText}
                  onChange={(event) => editChunk(chunk.id, { narrativeText: event.target.value })}
                  disabled={isBusy}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg text-neutral-700 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-indigo-100/90 dark:focus:border-violet-400/60"
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-sm">
            <label className="mb-3 block text-lg font-medium text-neutral-700 dark:text-indigo-100">
              Feedback for regeneration (optional)
            </label>
            <textarea
              value={feedbackText}
              onChange={(event) => setFeedbackText(event.target.value)}
              disabled={isBusy}
              rows={2}
              placeholder='e.g. "make chunk 3 more concise" — chunks marked "edited" are always preserved as-is.'
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg text-neutral-900 placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-indigo-200/30 dark:focus:border-violet-400/60"
            />
            <div className="mt-4 flex gap-4">
              <button
                type="button"
                onClick={() => revise(feedbackText)}
                disabled={isBusy}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-6 py-3 text-lg font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10"
              >
                {status === "revising" ? "Regenerating…" : "Regenerate"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isBusy}
                className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-lg font-semibold text-neutral-950 shadow-[0_0_30px_rgba(139,92,246,0.45)] disabled:opacity-30"
              >
                {status === "saving" ? "Saving…" : "Save project"}
              </button>
            </div>
            {status === "revising" && <LoadingBar label="Regenerating storyline…" />}
          </div>
        </section>
      )}
        </div>
      </main>
    </>
  );
}
