"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/lib/types";
import { LoadingBar } from "@/components/LoadingBar";
import { plural, summarizeNarration } from "@/lib/contentVersion";
import { TEMPLATE_UNAVAILABLE_NOTICE } from "@/lib/templates";
import { useAvailableTemplates } from "@/lib/useAvailableTemplates";
import { readNdjsonStream } from "@/lib/readNdjsonStream";
import {
  PUBLISH_NAME_PREFIX,
  maxNameLength,
  normalizeSubdomain,
  stripNamePrefix,
  subdomainFromUrl,
  suggestSubdomain,
  validateSubdomain,
} from "@/lib/subdomain";

interface PublishDialogProps {
  project: Project;
  /** Voice used to generate any missing narration before publishing. */
  voice: string;
  onClose: () => void;
  /** Called whenever the server hands back a fresher project (narration done, publish done). */
  onProjectUpdate: (project: Project) => void;
}

type CheckState =
  | { kind: "idle" }
  | { kind: "invalid"; message: string }
  | { kind: "checking" }
  | { kind: "current" }
  | { kind: "available"; message: string }
  | { kind: "yours"; message: string }
  | { kind: "taken"; message: string }
  | { kind: "unknown"; message: string };

type Phase =
  | { kind: "edit" }
  | { kind: "narrating"; completed: number; total: number }
  | { kind: "publishing" }
  | { kind: "done"; url: string };

interface AvailabilityResponse {
  available: boolean;
  status: "available" | "yours" | "taken" | "invalid" | "unknown";
  reason: string;
  url: string | null;
}

const CHECK_DEBOUNCE_MS = 450;

/** True for a site on the hosting domain (e.g. story-<id>.vercel.app), false for a local /published/ page. */
function hostEndsWith(url: string, suffix: string): boolean {
  try {
    return new URL(url).hostname.toLowerCase().endsWith(suffix.toLowerCase());
  } catch {
    return false;
  }
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function PublishDialog({ project, voice, onClose, onProjectUpdate }: PublishDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();
  const statusId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const copyButtonRef = useRef<HTMLButtonElement | null>(null);

  const [suffix, setSuffix] = useState<string | null>(null);
  const [prefix, setPrefix] = useState<string>(PUBLISH_NAME_PREFIX);
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  // Last server answer, keyed by the name it was for; everything else about
  // the status line is derived during render.
  const [remoteCheck, setRemoteCheck] = useState<{ name: string; result: CheckState } | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "edit" });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { isAvailable: isTemplateAvailable } = useAvailableTemplates();
  // Case studies publish their own layout, so a stale template id doesn't block them.
  const templateGone =
    project.documentType !== "case-study" && Boolean(project.selectedTemplateId) && !isTemplateAvailable(project.selectedTemplateId);
  const busy = phase.kind === "narrating" || phase.kind === "publishing";
  const currentSubdomain = suffix ? subdomainFromUrl(project.publishedUrl, suffix, prefix) : null;
  // A site published before custom addresses existed (story-<id>, or a local
  // /published/ page) has no name to pre-fill. "Keep" republishes to exactly
  // that address: the publish route reuses it when no subdomain is sent.
  const legacyUrl =
    suffix && project.publishedUrl && !currentSubdomain && hostEndsWith(project.publishedUrl, suffix)
      ? project.publishedUrl
      : null;
  const [addressMode, setAddressMode] = useState<"keep" | "new">("keep");
  const keepingLegacy = Boolean(legacyUrl) && addressMode === "keep";
  const isUpdate = Boolean(project.publishedUrl);

  // Chapters that still need narration (never narrated, text edited since, or
  // another voice), in the shape the publish output uses: bound case-study
  // sections or plain chunks. Same rule as the routes' onlyMissing.
  const missingNarration = useMemo(() => {
    const summary = summarizeNarration(project, voice || undefined);
    return {
      kind: summary.kind,
      count: summary.needed.length,
      outdated: summary.outdated,
      ids: summary.needed,
    };
  }, [project, voice]);

  // Fixed prefix + suffix from the server, then a default name (current address, else from the title).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/subdomains/check")
      .then((res) => res.json())
      .then((data: { suffix?: string; prefix?: string }) => {
        if (cancelled) return;
        const nextSuffix = data.suffix || ".vercel.app";
        const nextPrefix = typeof data.prefix === "string" ? data.prefix : PUBLISH_NAME_PREFIX;
        setPrefix(nextPrefix);
        setSuffix(nextSuffix);
        setValue(
          (typed) =>
            typed ||
            subdomainFromUrl(project.publishedUrl, nextSuffix, nextPrefix) ||
            suggestSubdomain(project.title, nextPrefix)
        );
      })
      .catch(() => {
        if (cancelled) return;
        setSuffix(".vercel.app");
        setValue((typed) => typed || suggestSubdomain(project.title));
      });
    return () => {
      cancelled = true;
    };
  }, [project.publishedUrl, project.title]);

  // Live availability status: local validation first, then the debounced server answer.
  const validation = validateSubdomain(value, prefix);
  const needsRemoteCheck =
    Boolean(suffix) && !keepingLegacy && validation.ok && validation.value !== currentSubdomain;
  const check: CheckState = !suffix
    ? { kind: "idle" }
    : !validation.ok
      ? value
        ? { kind: "invalid", message: validation.reason }
        : { kind: "idle" }
      : validation.value === currentSubdomain
        ? { kind: "current" }
        : remoteCheck?.name === validation.value
          ? remoteCheck.result
          : { kind: "checking" };

  useEffect(() => {
    if (!needsRemoteCheck || phase.kind !== "edit") return;
    const name = value.trim().toLowerCase();
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const settle = (result: CheckState) => setRemoteCheck({ name, result });
      try {
        const params = new URLSearchParams({ name, projectId: project.id });
        const res = await fetch(`/api/subdomains/check?${params}`, { signal: controller.signal });
        const data = (await res.json()) as AvailabilityResponse & { error?: string };
        if (res.status === 401) {
          settle({ kind: "unknown", message: data.error || "Please sign in again." });
          return;
        }
        if (data.status === "available") settle({ kind: "available", message: data.reason });
        else if (data.status === "yours") settle({ kind: "yours", message: data.reason });
        else if (data.status === "taken") settle({ kind: "taken", message: data.reason });
        else if (data.status === "invalid") settle({ kind: "invalid", message: data.reason });
        else settle({ kind: "unknown", message: data.reason || "Couldn't check this address." });
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        settle({ kind: "unknown", message: "Couldn't check this address. Check your connection." });
      }
    }, CHECK_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [needsRemoteCheck, value, project.id, phase.kind]);

  // Focus management: focus the field on open, restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  // The form (and its focused field) is replaced by the result view: keep focus inside the dialog.
  useEffect(() => {
    if (phase.kind === "done") copyButtonRef.current?.focus();
  }, [phase.kind]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        if (!busy) onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [busy, onClose]
  );

  // Same client call + NDJSON stream handling as the project page's
  // "Generate audio" / "Generate narration audio" buttons.
  async function generateMissingNarration() {
    const isCaseStudy = missingNarration.kind === "case-study";
    const endpoint = isCaseStudy ? "generate-case-study-audio" : "generate-audio";
    // onlyMissing: the server skips anything that already has audio (and saves
    // per item), so publishing never regenerates existing narration and a
    // retry after a timeout only does what's still missing.
    const payload = isCaseStudy
      ? { voice, sectionKeys: missingNarration.ids, onlyMissing: true }
      : { voice, chunkIds: missingNarration.ids, onlyMissing: true };
    setPhase({ kind: "narrating", completed: 0, total: missingNarration.count });

    const res = await fetch(`/api/projects/${project.id}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to generate narration.");
    }

    let failures: unknown[] | undefined;
    await readNdjsonStream(res, (message) => {
      const msg = message as
        | { type: "progress"; completed: number; total: number }
        | { type: "done"; project: Project; failures?: unknown[] }
        | { type: "error"; message: string };
      if (msg.type === "progress") setPhase({ kind: "narrating", completed: msg.completed, total: msg.total });
      else if (msg.type === "done") {
        onProjectUpdate(msg.project);
        failures = msg.failures;
      } else if (msg.type === "error") throw new Error(msg.message);
    });

    if (failures && failures.length > 0) {
      throw new Error(
        `${failures.length} chapter(s) failed to get narration (network hiccup). Nothing was published. Click Publish again to retry the missing ones.`
      );
    }
  }

  async function handlePublish(event?: React.FormEvent) {
    event?.preventDefault();
    if ((!keepingLegacy && !validation.ok) || !canPublish) return;
    setError(null);
    try {
      if (missingNarration.count > 0) await generateMissingNarration();

      setPhase({ kind: "publishing" });
      const res = await fetch(`/api/projects/${project.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keepingLegacy ? {} : { subdomain: validation.value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish.");
      onProjectUpdate(data.project);
      setPhase({ kind: "done", url: data.url || data.project?.publishedUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish.");
      setPhase({ kind: "edit" });
    }
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically. Select the address and copy it.");
    }
  }

  const needsVoice = missingNarration.count > 0 && !voice;
  const canPublish =
    !busy &&
    !needsVoice &&
    !templateGone &&
    (keepingLegacy || check.kind === "available" || check.kind === "yours" || check.kind === "current");
  const changingAddress =
    (currentSubdomain !== null && validation.ok && validation.value !== currentSubdomain) ||
    (Boolean(legacyUrl) && addressMode === "new");

  const statusTone =
    check.kind === "available" || check.kind === "current" || check.kind === "yours"
      ? "text-emerald-700 dark:text-emerald-300"
      : check.kind === "taken" || check.kind === "invalid"
        ? "text-red-600 dark:text-red-400"
        : check.kind === "unknown"
          ? "text-amber-700 dark:text-amber-300"
          : "text-neutral-500 dark:text-indigo-200/60";
  const statusText =
    check.kind === "idle"
      ? `Lowercase letters, numbers and hyphens, 3 to ${maxNameLength(prefix)} characters.`
      : check.kind === "checking"
        ? "Checking availability…"
        : check.kind === "current"
          ? "This story's current address. Publishing updates it."
          : check.kind === "available"
            ? "✓ Available"
            : check.kind === "yours"
              ? `✓ ${check.message}`
              : check.kind === "taken"
                ? `✕ ${check.message}`
                : check.message;

  // Portalled to <body>: the Publish card uses backdrop-filter, which would
  // otherwise become the containing block of this fixed overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-2xl dark:border-white/10 dark:bg-neutral-950 dark:text-white dark:shadow-[0_0_60px_rgba(16,185,129,0.12)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {phase.kind === "done" ? "Your story is live" : isUpdate ? "Publish update" : "Publish your story"}
            </h2>
            <p id={descriptionId} className="mt-1 text-xs text-neutral-500 dark:text-indigo-200/60">
              {phase.kind === "done"
                ? "Anyone with this link can view it. It isn't listed in search engines."
                : isUpdate
                  ? "Your saved changes replace the live site. Keep the address to update it in place."
                  : "Choose the web address for the public site."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {phase.kind === "done" ? (
          <div className="flex flex-col gap-3">
            <p className="break-all rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {phase.url}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                ref={copyButtonRef}
                type="button"
                onClick={() => handleCopy(phase.url)}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
              <a
                href={phase.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-neutral-950 shadow-[0_0_28px_rgba(16,185,129,0.45)] transition hover:brightness-110 active:scale-[0.98]"
              >
                Open site ↗
              </a>
              <span className="sr-only" aria-live="polite">
                {copied ? "Link copied to clipboard" : ""}
              </span>
            </div>
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>
        ) : (
          <form onSubmit={handlePublish} className="flex flex-col gap-4" noValidate>
            {legacyUrl && (
              <fieldset className="flex flex-col gap-2" disabled={busy}>
                <legend className="mb-2 text-sm font-semibold text-neutral-800 dark:text-indigo-100">Address</legend>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-neutral-700 dark:text-indigo-100">
                  <input
                    type="radio"
                    name="publish-address"
                    checked={addressMode === "keep"}
                    onChange={() => setAddressMode("keep")}
                    className="mt-1 accent-emerald-500"
                  />
                  <span className="min-w-0">
                    Keep the current address
                    <span className="block break-all text-xs text-neutral-500 dark:text-indigo-200/60">{legacyUrl}</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-neutral-700 dark:text-indigo-100">
                  <input
                    type="radio"
                    name="publish-address"
                    checked={addressMode === "new"}
                    onChange={() => {
                      setAddressMode("new");
                      window.setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                    className="mt-1 accent-emerald-500"
                  />
                  <span>Choose a new address</span>
                </label>
              </fieldset>
            )}

            <div className={`flex flex-col gap-2 ${keepingLegacy ? "hidden" : ""}`}>
              <label htmlFor={inputId} className="text-sm font-semibold text-neutral-800 dark:text-indigo-100">
                Site address
              </label>
              <div className="flex items-stretch overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 focus-within:border-violet-400 dark:border-white/10 dark:bg-black/30 dark:focus-within:border-violet-400/60">
                <span className="flex items-center whitespace-nowrap pl-3 text-sm text-neutral-500 dark:text-indigo-200/60">
                  <span className="hidden text-neutral-400 dark:text-indigo-200/40 sm:inline">https://</span>
                  {prefix}
                </span>
                <input
                  ref={inputRef}
                  id={inputId}
                  value={value}
                  onChange={(event) => {
                    setTouched(true);
                    // The prefix is fixed: drop it if pasted along with the name.
                    setValue(stripNamePrefix(event.target.value.toLowerCase().replace(/\s+/g, "-"), prefix));
                  }}
                  onBlur={() => {
                    // Tidy obvious slips (trailing hyphen, stray symbols) once the user leaves the field.
                    if (touched && value && !validateSubdomain(value, prefix).ok) {
                      const tidied = normalizeSubdomain(value);
                      if (tidied && validateSubdomain(tidied, prefix).ok) setValue(tidied);
                    }
                  }}
                  disabled={busy}
                  maxLength={maxNameLength(prefix) + prefix.length + 8}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={check.kind === "invalid" || check.kind === "taken"}
                  aria-describedby={statusId}
                  placeholder="acme-hr"
                  className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:opacity-60 dark:text-white dark:placeholder:text-indigo-200/30"
                />
                <span className="flex items-center whitespace-nowrap pr-3 text-sm text-neutral-500 dark:text-indigo-200/60">
                  {suffix ?? "…"}
                </span>
              </div>
              <p id={statusId} role="status" aria-live="polite" className={`text-xs ${statusTone}`}>
                {statusText}
              </p>
              {changingAddress && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  This changes the address. The old site at{" "}
                  {legacyUrl ?? `${prefix}${currentSubdomain}${suffix}`} stays online until it is removed from the
                  hosting account.
                </p>
              )}
            </div>

            {missingNarration.count > 0 && phase.kind === "edit" && (
              <p className="text-xs text-neutral-500 dark:text-indigo-200/60">
                {missingNarration.outdated > 0
                  ? `Narration needs updating for ${plural(missingNarration.outdated, "chapter")}`
                  : ""}
                {missingNarration.outdated > 0 && missingNarration.count > missingNarration.outdated ? " and " : ""}
                {missingNarration.count > missingNarration.outdated
                  ? `${plural(missingNarration.count - missingNarration.outdated, "chapter")} ${
                      missingNarration.count - missingNarration.outdated === 1 ? "has" : "have"
                    } no narration yet`
                  : ""}
                . It will be generated first{voice ? ` with the ${voice} voice` : ""}.
                {needsVoice && " Pick a voice on the project page first."}
              </p>
            )}

            {phase.kind === "narrating" && (
              <LoadingBar
                label={`Generating narration ${Math.min(phase.completed + 1, phase.total)}/${phase.total}`}
                progress={phase.total > 0 ? phase.completed / phase.total : undefined}
                detail={`${phase.completed} / ${phase.total} done`}
              />
            )}
            {phase.kind === "publishing" && <LoadingBar label="Publishing the site… this can take a minute or two." />}

            {templateGone && (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{TEMPLATE_UNAVAILABLE_NOTICE}</p>
            )}
            {error && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canPublish}
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-neutral-950 shadow-[0_0_28px_rgba(16,185,129,0.45)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-30"
              >
                {phase.kind === "narrating"
                  ? "Generating narration…"
                  : phase.kind === "publishing"
                    ? "Publishing…"
                    : isUpdate && !changingAddress
                      ? "Publish update"
                      : "Publish"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
