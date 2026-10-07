"use client";

/**
 * Per-chapter scene image status with retry/regenerate (stage S4, docs/DOMAINS_PLAN.md).
 * Renders nothing when the project has no domain avatar or the database isn't
 * migrated (the project payload then has no domainAvatarId).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Chunk, Project } from "@/lib/types";

export interface SceneImagesPanelProps {
  projectId: string;
  /** Start generating missing images automatically on mount (used once a domain avatar is chosen). */
  autoStart?: boolean;
  /** Called after any image changed so the page can reload the project. */
  onChanged?(): void;
}

interface RunBody {
  onlyMissing?: boolean;
  retryFailed?: boolean;
  chunkId?: string;
}

interface RunResponse {
  results?: { chunkId: string; status: "pending" | "ready" | "failed" }[];
  remaining?: number;
  error?: string;
  code?: string;
}

const MAX_CALLS = 200;

const buttonClass =
  "rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10";

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent"
    />
  );
}

export default function SceneImagesPanel({ projectId, autoStart, onChanged }: SceneImagesPanelProps) {
  const [chunks, setChunks] = useState<Chunk[] | null>(null);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [running, setRunning] = useState(false);
  const [workingChunkId, setWorkingChunkId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);
  const startedRef = useRef(false);
  const runningRef = useRef(false);
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
  }, [projectId]);

  /** Calls the route until nothing remains. Never throws; problems are shown in the panel. */
  const run = useCallback(
    async (initial: RunBody, total: number) => {
      let body = initial;
      if (runningRef.current) return;
      runningRef.current = true;
      setRunning(true);
      setError(null);
      setMissingKey(false);
      setWorkingChunkId(body.chunkId ?? null);
      setProgress({ done: 0, total });
      let done = 0;
      let changed = false;
      try {
        for (let call = 0; call < MAX_CALLS; call++) {
          const res = await fetch(`/api/projects/${projectId}/generate-scene-images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = (await res.json().catch(() => ({}))) as RunResponse;
          if (res.status === 412 && data.code === "missing_api_key") {
            setMissingKey(true);
            break;
          }
          if (!res.ok) {
            setError(data.error || "Generating scene images failed.");
            break;
          }
          const results = data.results ?? [];
          done += results.length;
          if (results.length > 0) changed = true;
          setProgress({ done, total: Math.max(total, done + (data.remaining ?? 0)) });
          await load();
          // After the first call, only fill in what is still missing (a plain "all" run must not start over).
          if (body.chunkId) break;
          body = body.retryFailed && !body.onlyMissing ? { retryFailed: true } : { onlyMissing: true };
          if (!data.remaining || results.length === 0) break;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generating scene images failed.");
      } finally {
        runningRef.current = false;
        setRunning(false);
        setWorkingChunkId(null);
        setProgress(null);
        await load();
        if (changed) onChangedRef.current?.();
      }
    },
    [projectId, load]
  );

  useEffect(() => {
    // Deferred so the state updates inside load() don't run synchronously in the effect body.
    void Promise.resolve().then(load);
  }, [load]);

  // Auto start once, and only when some chapter was never attempted (failed ones wait for "Retry failed").
  useEffect(() => {
    if (!autoStart || !hasAvatar || !chunks || startedRef.current) return;
    const untouched = chunks.filter((chunk) => !chunk.imageStatus).length;
    startedRef.current = true;
    const total = chunks.filter((chunk) => chunk.imageStatus !== "ready").length;
    if (untouched > 0) void Promise.resolve().then(() => run({ onlyMissing: true }, total));
  }, [autoStart, hasAvatar, chunks, run]);

  if (!hasAvatar || !chunks || chunks.length === 0) return null;

  const ready = chunks.filter((chunk) => chunk.imageStatus === "ready").length;
  const failed = chunks.filter((chunk) => chunk.imageStatus === "failed").length;
  const missing = chunks.length - ready;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_50px_rgba(99,102,241,0.06)] dark:backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Chapter scene images</h2>
          <p className="text-xs text-neutral-500 dark:text-indigo-200/60">
            {ready} of {chunks.length} ready
            {failed > 0 ? ` · ${failed} failed (those chapters show the avatar)` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {failed > 0 && (
            <button
              type="button"
              disabled={running}
              onClick={() => void run({ retryFailed: true }, failed)}
              className={buttonClass}
            >
              Retry failed
            </button>
          )}
          {missing - failed > 0 && (
            <button
              type="button"
              disabled={running}
              onClick={() => void run({ onlyMissing: true }, missing)}
              className={buttonClass}
            >
              Generate missing
            </button>
          )}
        </div>
      </div>

      {running && progress && (
        <p className="flex items-center gap-2 text-xs text-violet-700 dark:text-violet-300" role="status">
          <Spinner />
          {workingChunkId
            ? "Regenerating the scene image..."
            : `Generating scene images: ${progress.done} of ${progress.total} done...`}
        </p>
      )}
      {missingKey && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          Add your image API key in{" "}
          <Link href="/settings" className="font-medium underline">
            Settings
          </Link>{" "}
          to generate scene images, then try again.
        </p>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

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
                  <span className="text-[10px] text-neutral-400 dark:text-indigo-200/40">
                    {chunk.imageStatus === "failed" ? "Failed" : "No image"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-neutral-800 dark:text-indigo-50">
                  {index + 1}. {chunk.title}
                </p>
                <p
                  className={`text-[11px] ${
                    chunk.imageStatus === "failed"
                      ? "text-red-600 dark:text-red-400"
                      : "text-neutral-500 dark:text-indigo-200/60"
                  }`}
                >
                  {chunk.imageStatus === "ready"
                    ? "Ready"
                    : chunk.imageStatus === "pending"
                      ? "Generating..."
                      : chunk.imageStatus === "failed"
                        ? "Failed: uses the avatar instead"
                        : "Not generated yet"}
                </p>
              </div>
              <button
                type="button"
                disabled={running}
                onClick={() => void run({ chunkId: chunk.id }, 1)}
                className={buttonClass}
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
