"use client";

/**
 * Shows the domain's two generated avatars (generating on first use). Owned by stage S3.
 * Renders only the domain avatars; the page keeps showing the static ones itself.
 * Renders nothing when the domain has no avatars (e.g. migration not applied).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface DomainAvatarPickerProps {
  domainId: string;
  /** Currently selected avatar id ("domain:<id>" or a static id), if any. */
  value: string | null;
  /** Called with the chosen id ("domain:<domain_avatars.id>"). */
  onSelect(avatarId: string): void;
}

interface AvatarItem {
  id: string;
  gender: "male" | "female";
  imageUrl: string | null;
  status: "pending" | "ready" | "failed";
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; avatars: AvatarItem[] }
  | { kind: "missing-key"; message: string }
  | { kind: "error"; message: string };

/** A result tagged with the domain it belongs to, so a domain change shows "loading" without an effect. */
type Tagged = { domainId: string; state: LoadState };

const POLL_MS = 4000;

export default function DomainAvatarPicker({ domainId, value, onSelect }: DomainAvatarPickerProps) {
  const [tagged, setTagged] = useState<Tagged>({ domainId, state: { kind: "loading" } });
  const state: LoadState = tagged.domainId === domainId ? tagged.state : { kind: "loading" };
  const setState = useCallback((next: LoadState) => setTagged({ domainId, state: next }), [domainId]);
  const [retrying, setRetrying] = useState(false);
  const requestRef = useRef(0);

  const load = useCallback(
    async (query: string) => {
      const ticket = ++requestRef.current;
      try {
        const res = await fetch(`/api/domains/${encodeURIComponent(domainId)}/avatars${query}`, { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as {
          avatars?: AvatarItem[];
          error?: string;
          code?: string;
        };
        if (ticket !== requestRef.current) return;
        if (res.status === 412 && data.code === "missing_api_key") {
          setState({ kind: "missing-key", message: data.error || "Add your API key in Settings to generate avatars." });
        } else if (!res.ok) {
          setState({ kind: "error", message: data.error || "Could not load the avatars." });
        } else {
          setState({ kind: "ready", avatars: Array.isArray(data.avatars) ? data.avatars : [] });
        }
      } catch {
        if (ticket === requestRef.current) setState({ kind: "error", message: "Could not load the avatars." });
      }
    },
    [domainId, setState]
  );

  const invalidate = useCallback(() => {
    requestRef.current++;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(""), 0);
    return () => {
      clearTimeout(timer);
      invalidate();
    };
  }, [load, invalidate]);

  // Another request may be generating them: poll (read-only) until none is pending.
  const hasPending = state.kind === "ready" && state.avatars.some((a) => a.status === "pending");
  useEffect(() => {
    if (!hasPending) return;
    const timer = setInterval(() => void load("?generate=0"), POLL_MS);
    return () => clearInterval(timer);
  }, [hasPending, load]);

  async function retry() {
    setRetrying(true);
    setState({ kind: "loading" });
    await load("?retry=1");
    setRetrying(false);
  }

  if (!domainId) return null;
  if (state.kind === "ready" && state.avatars.length === 0) return null;

  const heading = (
    <div>
      <p className="text-xs font-semibold text-neutral-800 dark:text-indigo-100">Industry avatars</p>
      <p className="text-xs text-neutral-500 dark:text-indigo-200/50">Made for this story&apos;s domain.</p>
    </div>
  );

  if (state.kind === "loading") {
    return (
      <div className="flex flex-col gap-2">
        {heading}
        <p className="text-xs text-neutral-500 dark:text-indigo-200/60" role="status">
          {retrying ? "Retrying" : "Preparing"} the industry avatars. On first use this can take a minute…
        </p>
      </div>
    );
  }

  if (state.kind === "missing-key") {
    return (
      <div className="flex flex-col gap-2">
        {heading}
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {state.message}{" "}
          <Link href="/settings" className="font-semibold underline">
            Open Settings
          </Link>
        </p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="flex flex-col gap-2">
        {heading}
        <p className="text-xs text-red-600 dark:text-red-400">{state.message}</p>
        <button
          type="button"
          onClick={() => {
            setState({ kind: "loading" });
            void load("");
          }}
          className="self-start rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {heading}
      <div className="flex flex-wrap gap-2">
        {state.avatars.map((avatar) => {
          const avatarId = `domain:${avatar.id}`;
          const label = avatar.gender === "female" ? "Female" : "Male";
          if (avatar.status === "ready" && avatar.imageUrl) {
            const active = value === avatarId;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onSelect(avatarId)}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1 rounded-xl border px-4 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 ${
                  active
                    ? "border-violet-400 bg-violet-50 shadow-[0_0_20px_rgba(139,92,246,0.2)] dark:border-violet-400/60 dark:bg-violet-500/10 dark:shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                    : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar.imageUrl} alt={`${label} avatar`} className="h-12 w-12 rounded-lg object-cover" />
                <span className="text-neutral-700 dark:text-indigo-100">{label}</span>
              </button>
            );
          }
          if (avatar.status === "failed") {
            return (
              <div
                key={avatar.id}
                className="flex flex-col items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs dark:border-red-400/30 dark:bg-red-500/10"
              >
                <span className="text-red-700 dark:text-red-300">{label}: failed</span>
                <button
                  type="button"
                  onClick={() => void retry()}
                  className="font-semibold text-red-700 underline dark:text-red-300"
                >
                  Retry
                </button>
              </div>
            );
          }
          return (
            <div
              key={avatar.id}
              className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs dark:border-white/10 dark:bg-white/5"
              role="status"
            >
              <span className="h-12 w-12 animate-pulse rounded-lg bg-neutral-200 dark:bg-white/10" />
              <span className="text-neutral-500 dark:text-indigo-200/60">{label}: generating…</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
