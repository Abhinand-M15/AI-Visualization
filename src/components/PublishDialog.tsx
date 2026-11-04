"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/lib/types";
import { LoadingBar } from "@/components/LoadingBar";
import { plural, summarizeNarration } from "@/lib/contentVersion";
import { flattenCaseStudySections } from "@/lib/caseStudySections";
import { Button, buttonClass } from "@/components/ui/button";
import { ApiError, ensureOk, errorMessage, readJson, streamError } from "@/components/apiError";
import { friendlyVoiceId } from "@/components/VoicePicker";
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
  /** Some chapters still have no narration: publishing needs an explicit "publish without it" (UX-09). */
  | { kind: "confirm-missing"; ids: string[]; reason: string }
  | { kind: "publishing" }
  | { kind: "done"; url: string };

/** Server codes meaning "narration is missing; resend with allowMissingAudio to publish anyway". */
const MISSING_AUDIO_CODES = new Set(["narration_incomplete", "missing_audio", "narration_missing"]);

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
  const confirmRef = useRef<HTMLInputElement | null>(null);

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
  const [confirmedMissing, setConfirmedMissing] = useState(false);

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
  const unit = missingNarration.kind === "case-study" ? "section" : "chapter";

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
    if (phase.kind === "confirm-missing") confirmRef.current?.focus();
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

  /** Names of chapters / sections, for "these still have no narration" lists. */
  function itemName(itemId: string): string {
    if (missingNarration.kind === "case-study") {
      const section = flattenCaseStudySections(project.caseStudyBinding?.slots ?? null).find((entry) => entry.key === itemId);
      return section ? `${section.sectionLabel}${section.index !== null ? ` ${section.index + 1}` : ""}` : "a section";
    }
    const chunk = project.chunks.find((entry) => entry.id === itemId);
    return chunk ? `Chapter ${chunk.order}${chunk.title ? `: ${chunk.title}` : ""}` : "a chapter";
  }

  /**
   * Same client call + NDJSON stream handling as the project page's narration
   * buttons. Returns the ids that still need narration afterwards (failures,
   * or a stream cut off by the server's time limit), using the freshest
   * project the server sent back.
   */
  async function generateMissingNarration(): Promise<string[]> {
    const isCaseStudy = missingNarration.kind === "case-study";
    const endpoint = isCaseStudy ? "generate-case-study-audio" : "generate-audio";
    // onlyMissing: the server skips anything that already has audio (and saves
    // per item), so publishing never regenerates existing narration and a
    // retry after a timeout only does what's still missing.
    const payload = isCaseStudy
      ? { voice, sectionKeys: missingNarration.ids, onlyMissing: true }
      : { voice, chunkIds: missingNarration.ids, onlyMissing: true };
    setPhase({ kind: "narrating", completed: 0, total: missingNarration.count });

    let fresh: Project | null = null;
    let cut = false;
    // The server stops each call at its time budget and reports `remaining`: keep going until none are left.
    for (let round = 0; round < 20; round++) {
      const res = await fetch(`/api/projects/${project.id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await ensureOk(res, "Narration couldn't be generated.");

      let remaining = 0;
      let quota = false;
      let sawDone = false;
      const { completed } = await readNdjsonStream(res, (message) => {
        const msg = message as
          | { type: "progress"; completed: number; total: number }
          | { type: "done"; project: Project; remaining?: number; quotaExceeded?: unknown }
          | { type: "error"; message: string; code?: string };
        if (msg.type === "progress") setPhase({ kind: "narrating", completed: msg.completed, total: msg.total });
        else if (msg.type === "done") {
          sawDone = true;
          fresh = msg.project;
          remaining = msg.remaining ?? 0;
          quota = Boolean(msg.quotaExceeded);
          onProjectUpdate(msg.project);
        } else if (msg.type === "error") throw streamError(msg.message, msg.code, "Narration couldn't be generated.");
      });
      if (!completed || !sawDone) {
        cut = true;
        break;
      }
      if (quota || remaining === 0) break;
    }

    if (cut || !fresh) {
      // Cut off part-way: re-read what the server saved.
      try {
        const reread = await fetch(`/api/projects/${project.id}`, { cache: "no-store" });
        const data = await readJson<{ project: Project }>(reread);
        fresh = data.project;
        onProjectUpdate(data.project);
      } catch {
        return missingNarration.ids;
      }
    }
    return summarizeNarration(fresh as Project, voice || undefined).needed;
  }

  async function publish(allowMissingAudio: boolean) {
    setPhase({ kind: "publishing" });
    const res = await fetch(`/api/projects/${project.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(keepingLegacy ? {} : { subdomain: validation.value }),
        ...(allowMissingAudio ? { allowMissingAudio: true } : {}),
      }),
    });
    let data: { project: Project; url?: string };
    try {
      data = await readJson<{ project: Project; url?: string }>(res, "The site couldn't be published.");
    } catch (err) {
      if (err instanceof ApiError && err.code && MISSING_AUDIO_CODES.has(err.code)) {
        setConfirmedMissing(false);
        const missing = Array.isArray(err.data?.missing) ? (err.data.missing as unknown[]).filter((v): v is string => typeof v === "string") : [];
        setPhase({ kind: "confirm-missing", ids: missing.length > 0 ? missing : missingNarration.ids, reason: err.message });
        return;
      }
      throw err;
    }
    onProjectUpdate(data.project);
    setPhase({ kind: "done", url: data.url || data.project?.publishedUrl || "" });
  }

  async function handlePublish(event?: React.FormEvent) {
    event?.preventDefault();
    if ((!keepingLegacy && !validation.ok) || !canPublish) return;
    setError(null);
    try {
      if (missingNarration.count > 0) {
        if (!voice) {
          setConfirmedMissing(false);
          setPhase({ kind: "confirm-missing", ids: missingNarration.ids, reason: "No voice is chosen, so narration can't be recorded." });
          return;
        }
        const stillMissing = await generateMissingNarration();
        if (stillMissing.length > 0) {
          setConfirmedMissing(false);
          setPhase({
            kind: "confirm-missing",
            ids: stillMissing,
            reason: "Narration couldn't be recorded for everything (the server stopped or some items failed). What finished is saved.",
          });
          return;
        }
      }
      await publish(false);
    } catch (err) {
      setError(errorMessage(err, "The site couldn't be published. Try again."));
      setPhase({ kind: "edit" });
    }
  }

  async function publishWithoutMissing() {
    if (!confirmedMissing) return;
    setError(null);
    try {
      await publish(true);
    } catch (err) {
      setError(errorMessage(err, "The site couldn't be published. Try again."));
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

  const canPublish =
    !busy &&
    !templateGone &&
    (keepingLegacy || check.kind === "available" || check.kind === "yours" || check.kind === "current");
  const changingAddress =
    (currentSubdomain !== null && validation.ok && validation.value !== currentSubdomain) ||
    (Boolean(legacyUrl) && addressMode === "new");

  const statusTone =
    check.kind === "available" || check.kind === "current" || check.kind === "yours"
      ? "text-emerald-800 dark:text-emerald-300"
      : check.kind === "taken" || check.kind === "invalid"
        ? "text-red-700 dark:text-red-300"
        : check.kind === "unknown"
          ? "text-amber-800 dark:text-amber-200"
          : "text-muted-foreground";
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
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-900 shadow-2xl dark:border-white/10 dark:bg-neutral-950 dark:text-white dark:shadow-[0_0_60px_rgba(16,185,129,0.12)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {phase.kind === "done"
                ? "Your story is live"
                : phase.kind === "confirm-missing"
                  ? "Publish without some narration?"
                  : isUpdate
                    ? "Publish update"
                    : "Publish your story"}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
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
            className={buttonClass("secondary", "xs", "h-8 w-8 shrink-0 px-0")}
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {phase.kind === "done" ? (
          <div className="flex flex-col gap-3">
            <p className="break-all rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {phase.url}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button ref={copyButtonRef} size="md" onClick={() => handleCopy(phase.url)}>
                {copied ? "Copied" : "Copy link"}
              </Button>
              <a href={phase.url} target="_blank" rel="noopener noreferrer" className={buttonClass("success", "md")}>
                Open site<span className="sr-only"> (new tab)</span> <span aria-hidden>↗</span>
              </a>
              <span className="sr-only" aria-live="polite">
                {copied ? "Link copied to clipboard" : ""}
              </span>
            </div>
            {error && (
              <p role="alert" className="text-xs text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
          </div>
        ) : phase.kind === "confirm-missing" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">{phase.reason}</p>
            <p className="text-sm">
              These {missingNarration.kind === "case-study" ? "sections" : "chapters"} would be published without sound:
            </p>
            <ul className="max-h-40 list-disc overflow-y-auto rounded-xl bg-amber-50 py-2 pl-7 pr-3 text-sm text-amber-950 dark:bg-amber-400/10 dark:text-amber-100">
              {phase.ids.map((itemId) => (
                <li key={itemId}>{itemName(itemId)}</li>
              ))}
            </ul>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                ref={confirmRef}
                checked={confirmedMissing}
                onChange={(event) => setConfirmedMissing(event.target.checked)}
                className="mt-1 accent-emerald-600"
              />
              <span>I understand visitors won&apos;t hear narration for these. Publish anyway.</span>
            </label>
            {error && (
              <p role="alert" className="text-xs text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button size="md" onClick={() => setPhase({ kind: "edit" })}>
                Back
              </Button>
              {voice && (
                <Button size="md" onClick={() => void handlePublish()}>
                  Try narration again
                </Button>
              )}
              <Button variant="success" size="md" onClick={() => void publishWithoutMissing()} disabled={!confirmedMissing}>
                Publish without it
              </Button>
            </div>
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
                    <span className="block break-all text-xs text-muted-foreground">{legacyUrl}</span>
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
              <div className="flex items-stretch overflow-hidden rounded-xl border border-neutral-300 bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-ring dark:border-white/15 dark:bg-black/30 dark:focus-within:border-violet-400">
                <span className="flex items-center whitespace-nowrap pl-3 text-sm text-muted-foreground">
                  <span className="hidden sm:inline">https://</span>
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
                  className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm font-medium text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none disabled:opacity-60 dark:text-white dark:placeholder:text-indigo-200/50"
                />
                <span className="flex items-center whitespace-nowrap pr-3 text-sm text-muted-foreground">
                  {suffix ?? "…"}
                </span>
              </div>
              <p id={statusId} role="status" aria-live="polite" className={`text-xs ${statusTone}`}>
                {statusText}
              </p>
              {changingAddress && (
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  This changes the address. The old site at {legacyUrl ?? `${prefix}${currentSubdomain}${suffix}`} stays
                  online; ask your admin to take it down if it should go.
                </p>
              )}
            </div>

            {missingNarration.count > 0 && phase.kind === "edit" && (
              <p className="text-xs text-muted-foreground">
                {missingNarration.outdated > 0
                  ? `Narration needs updating for ${plural(missingNarration.outdated, unit)}`
                  : ""}
                {missingNarration.outdated > 0 && missingNarration.count > missingNarration.outdated ? " and " : ""}
                {missingNarration.count > missingNarration.outdated
                  ? `${plural(missingNarration.count - missingNarration.outdated, unit)} ${
                      missingNarration.count - missingNarration.outdated === 1 ? "has" : "have"
                    } no narration yet`
                  : ""}
                .{" "}
                {voice
                  ? `It's recorded first, in the voice ${friendlyVoiceId(voice)}. Keep this window open.`
                  : "No voice is chosen, so you'll be asked whether to publish without it."}
              </p>
            )}

            {phase.kind === "narrating" && (
              <LoadingBar
                label={`Recording narration ${Math.min(phase.completed + 1, phase.total)} of ${phase.total}…`}
                progress={phase.total > 0 ? phase.completed / phase.total : undefined}
                detail={`${phase.completed} / ${phase.total} done`}
              />
            )}
            {phase.kind === "publishing" && <LoadingBar label="Publishing the site… this usually takes 1 to 2 minutes. Keep this window open." />}

            {templateGone && (
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{TEMPLATE_UNAVAILABLE_NOTICE}</p>
            )}
            {error && (
              <p role="alert" className="text-xs text-red-700 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button size="md" onClick={onClose} disabled={busy}>
                Cancel
              </Button>
              <button type="submit" disabled={!canPublish} className={buttonClass("success", "md")}>
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
