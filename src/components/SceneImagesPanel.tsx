"use client";

/**
 * Per-chapter scene image status with retry/regenerate (stage S4, docs/DOMAINS_PLAN.md).
 * Avatar mode (default): renders nothing when the project has no domain avatar or the
 * database isn't migrated (the project payload then has no domainAvatarId).
 * Lead mode (Showcase): the fixed lead character is the reference, so no avatar is needed;
 * images are generated chapter by chapter, in order, as soon as the project has chapters.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Chunk, Project } from "@/lib/types";
import { applySectionImages, caseStudySectionsAsChunks, flattenCaseStudySections } from "@/lib/caseStudySections";
import { buttonClass } from "@/components/ui/button";
import { errorMessage, friendlyMessage, isKeyProblem, isQuotaProblem } from "@/components/apiError";

export interface SceneImagesPanelProps {
  projectId: string;
  /**
   * Offer to generate the missing images as soon as the panel appears (Showcase, or once a
   * domain avatar is chosen). It asks first: images spend the shared daily allowance (UX-14).
   */
  autoStart?: boolean;
  /** "avatar" (default): domain-avatar scenes. "lead": fixed lead character scenes (Showcase), no avatar required. */
  mode?: "avatar" | "lead";
  /** Called after any image changed so the page can reload the project. */
  onChanged?(): void;
}

interface RunBody {
  onlyMissing?: boolean;
  retryFailed?: boolean;
  chunkId?: string;
  mode?: "lead";
}

interface RunResponse {
  results?: { chunkId: string; status: "pending" | "ready" | "failed"; error?: string }[];
  remaining?: number;
  /** The shared image allowance ran out during this call. */
  quotaExceeded?: boolean;
  error?: string;
  code?: string;
}

const MAX_CALLS = 200;

const smallButton = buttonClass("secondary", "xs");

/** The server's per-chapter failure reason, when it sends one (results[].error or chunk.imageError). */
type ChunkWithError = Chunk & { imageError?: string | null };

/** A daily allowance / quota message from the image service. */
function isAllowanceMessage(text: string | null | undefined): boolean {
  return Boolean(text) && /allowance|quota|daily|limit|429/i.test(text as string);
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent motion-reduce:animate-none"
    />
  );
}

export default function SceneImagesPanel({ projectId, autoStart, mode = "avatar", onChanged }: SceneImagesPanelProps) {
  const lead = mode === "lead";
  const [chunks, setChunks] = useState<Chunk[] | null>(null);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [running, setRunning] = useState(false);
  const [workingChunkId, setWorkingChunkId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);
  const [failureReasons, setFailureReasons] = useState<Record<string, string>>({});
  const [askToStart, setAskToStart] = useState(false);
  const [quotaHit, setQuotaHit] = useState(false);
  const startedRef = useRef(false);
  const runningRef = useRef(false);
  // The run loop stops when the panel goes away (template switched, page left).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const onChangedRef = useRef(onChanged);
  useEffect(() => {
    onChangedRef.current = onChanged;
  }, [onChanged]);

  const load = useCallback(async (): Promise<Chunk[] | null> => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = (await res.json().catch(() => null)) as { project?: Project; error?: string } | null;
      if (!res.ok || !data?.project) {
        setHasAvatar(false);
        return null;
      }
      // Lead mode needs no avatar: the fixed character is the reference.
      if (lead) {
        // A case study is drawn per bound section (ids `case-study-<key>`), the same list the page shows.
        const list =
          data.project.documentType === "case-study"
            ? applySectionImages(
                caseStudySectionsAsChunks(flattenCaseStudySections(data.project.caseStudyBinding?.slots ?? null), undefined),
                data.project.sectionImages
              )
            : data.project.chunks;
        setHasAvatar(true);
        setChunks(list);
        return list;
      }
      const project = data.project;
      const chosen =
        Boolean(project.domainAvatarId) || (project.selectedAvatarIds ?? []).some((avatarId) => avatarId.startsWith("domain:"));
      setHasAvatar(chosen);
      setChunks(project.chunks);
      return project.chunks;
    } catch {
      setHasAvatar(false);
      return null;
    }
  }, [projectId, lead]);

  /** Calls the route until nothing remains. Never throws; problems are shown in the panel. */
  const run = useCallback(
    async (initial: RunBody, total: number) => {
      const withMode = (next: RunBody): RunBody => (lead ? { ...next, mode: "lead" } : next);
      let body = withMode(initial);
      if (runningRef.current) return;
      runningRef.current = true;
      setRunning(true);
      setError(null);
      setMissingKey(false);
      setQuotaHit(false);
      setWorkingChunkId(body.chunkId ?? null);
      setProgress({ done: 0, total });
      let done = 0;
      let changed = false;
      try {
        for (let call = 0; call < MAX_CALLS; call++) {
          if (!mountedRef.current) break;
          const res = await fetch(`/api/projects/${projectId}/generate-scene-images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = (await res.json().catch(() => ({}))) as RunResponse;
          if (isKeyProblem(data.code) || (res.status === 412 && data.code === "missing_api_key")) {
            setMissingKey(true);
            break;
          }
          if (res.status === 429 || isQuotaProblem(data.code)) {
            // Nothing could run: stop instead of looping on "remaining".
            setQuotaHit(true);
            break;
          }
          if (!res.ok) {
            setError(friendlyMessage(data.error, data.code, res.status, "Scene images couldn't be generated. Try again."));
            break;
          }
          const results = data.results ?? [];
          const reasons = results.filter((result) => result.status === "failed" && result.error);
          if (reasons.length > 0) {
            setFailureReasons((current) => ({
              ...current,
              ...Object.fromEntries(reasons.map((result) => [result.chunkId, friendlyMessage(result.error, undefined, undefined, "")])),
            }));
          }
          done += results.length;
          if (results.length > 0) changed = true;
          setProgress({ done, total: Math.max(total, done + (data.remaining ?? 0)) });
          await load();
          // After the first call, only fill in what is still missing (a plain "all" run must not start over).
          if (body.chunkId) break;
          body = withMode(body.retryFailed && !body.onlyMissing ? { retryFailed: true } : { onlyMissing: true });
          if (data.quotaExceeded) {
            setQuotaHit(true);
            break;
          }
          if (!data.remaining || results.length === 0) break;
        }
      } catch (err) {
        setError(errorMessage(err, "Scene images couldn't be generated. Try again."));
      } finally {
        runningRef.current = false;
        if (mountedRef.current) {
          setRunning(false);
          setWorkingChunkId(null);
          setProgress(null);
          await load();
          if (changed) onChangedRef.current?.();
        }
      }
    },
    [projectId, load, lead]
  );

  useEffect(() => {
    // Deferred so the state updates inside load() don't run synchronously in the effect body.
    void Promise.resolve().then(load);
  }, [load]);

  // Offer to start once, and only when some chapter was never attempted (failed ones wait for "Retry failed").
  useEffect(() => {
    if (!autoStart || !hasAvatar || !chunks || startedRef.current) return;
    const untouched = chunks.filter((chunk) => !chunk.imageStatus).length;
    startedRef.current = true;
    if (untouched > 0) void Promise.resolve().then(() => setAskToStart(true));
  }, [autoStart, hasAvatar, chunks]);

  if (!hasAvatar || !chunks || chunks.length === 0) return null;

  const ready = chunks.filter((chunk) => chunk.imageStatus === "ready").length;
  const failed = chunks.filter((chunk) => chunk.imageStatus === "failed").length;
  const missing = chunks.length - ready;
  const reasonOf = (chunk: Chunk) => failureReasons[chunk.id] || (chunk as ChunkWithError).imageError || "";
  const allowanceHit = quotaHit || isAllowanceMessage(error) || chunks.some((chunk) => chunk.imageStatus === "failed" && isAllowanceMessage(reasonOf(chunk)));

  return (
    <section aria-labelledby={`scene-images-${projectId}`} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-3 dark:border-white/10 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 id={`scene-images-${projectId}`} className="text-sm font-semibold text-neutral-900 dark:text-white">
            Scene images
          </h3>
          <p className="text-xs text-muted-foreground">
            {ready} of {chunks.length} ready
            {failed > 0 ? ` · ${failed} failed${lead ? "" : " (those chapters show the avatar)"}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {failed > 0 && (
            <button
              type="button"
              disabled={running}
              onClick={() => void run({ retryFailed: true }, failed)}
              className={smallButton}
            >
              Retry failed
            </button>
          )}
          {missing - failed > 0 && (
            <button
              type="button"
              disabled={running}
              onClick={() => {
                setAskToStart(false);
                void run({ onlyMissing: true }, missing - failed);
              }}
              className={smallButton}
            >
              Generate missing
            </button>
          )}
        </div>
      </div>

      {askToStart && !running && missing - failed > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-violet-300 bg-violet-50 px-3 py-2 text-xs text-violet-950 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-100">
          <p>
            Generate {missing - failed} scene {missing - failed === 1 ? "image" : "images"} now? They use the image
            allowance shared by everyone using this app, so it&apos;s best to do this once the chapters are final.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonClass("primary", "xs")}
              onClick={() => {
                setAskToStart(false);
                void run({ onlyMissing: true }, missing - failed);
              }}
            >
              Generate images
            </button>
            <button type="button" className={buttonClass("ghost", "xs")} onClick={() => setAskToStart(false)}>
              Not now
            </button>
          </div>
        </div>
      )}
      {running && progress && (
        <p className="flex items-center gap-2 text-xs text-violet-800 dark:text-violet-200" role="status">
          <Spinner />
          {workingChunkId
            ? "Regenerating the scene image..."
            : `Generating scene images: ${progress.done} of ${progress.total} done...`}
        </p>
      )}
      {missingKey && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          Image generation isn&apos;t set up for your account. Check the image provider and its key in{" "}
          <Link href="/settings" className="rounded font-medium underline">
            Settings
          </Link>
          , then try again.
        </p>
      )}
      {allowanceHit && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          Today&apos;s shared image allowance is used up. It resets at 00:00 UTC (05:30 IST); retry the failed images after
          that.
        </p>
      )}
      {error && !allowanceHit && (
        <p role="alert" className="text-xs text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {chunks.map((chunk, index) => {
          const working = running && (workingChunkId === chunk.id || (!workingChunkId && chunk.imageStatus === "pending"));
          return (
            <li
              key={chunk.id}
              className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-black/20"
            >
              <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-white/10 dark:bg-white/5">
                {chunk.imageStatus === "ready" && chunk.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={chunk.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : chunk.imageStatus === "pending" || working ? (
                  <Spinner />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {chunk.imageStatus === "failed" ? "Failed" : "No image"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-neutral-800 dark:text-indigo-50" title={chunk.title}>
                  {index + 1}. {chunk.title}
                </p>
                <p
                  className={`text-xs ${
                    chunk.imageStatus === "failed" ? "text-red-700 dark:text-red-300" : "text-muted-foreground"
                  }`}
                >
                  {chunk.imageStatus === "ready"
                    ? "Ready"
                    : chunk.imageStatus === "pending"
                      ? "Generating..."
                      : chunk.imageStatus === "failed"
                        ? `Failed${reasonOf(chunk) ? `: ${reasonOf(chunk)}` : ""}${lead ? "" : " · shows the avatar instead"}`
                        : "Not generated yet"}
                </p>
              </div>
              <button
                type="button"
                disabled={running}
                onClick={() => void run({ chunkId: chunk.id }, 1)}
                className={smallButton}
                aria-label={`${chunk.imageStatus === "ready" ? "Regenerate" : "Generate"} the image for ${index + 1}. ${chunk.title}`}
              >
                {chunk.imageStatus === "ready" ? "Regenerate" : "Generate"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
