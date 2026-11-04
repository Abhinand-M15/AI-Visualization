"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * The preview's own minimal bar (UI-02, UX-20): a small tab at the bottom-left
 * that never covers a template's header. Previews open in a new tab from the
 * project page, so it offers "Close preview" (back to the editor that is
 * already open) instead of opening a second editor; opened directly, it links
 * back. It can be collapsed to a dot to see the page edge to edge.
 */
export function PreviewBar({ projectId }: { projectId: string }) {
  const [collapsed, setCollapsed] = useState(false);
  // window.opener exists only on the client; the server render shows the link.
  const openedByApp = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(window.opener),
    () => false
  );

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        aria-label="Show preview controls"
        className="fixed bottom-4 left-4 z-[3000] h-9 w-9 rounded-full bg-black/70 text-xs font-semibold text-white shadow-lg backdrop-blur hover:bg-black/85"
      >
        <span aria-hidden>⋯</span>
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label="Preview controls"
      className="fixed bottom-4 left-4 z-[3000] flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full bg-black/75 p-1 text-xs text-white shadow-lg backdrop-blur"
    >
      <span className="hidden px-2 font-medium sm:inline">Preview · saved version</span>
      {openedByApp ? (
        <button
          type="button"
          onClick={() => window.close()}
          className="rounded-full bg-white/15 px-3 py-1.5 font-semibold hover:bg-white/25"
        >
          Close preview
        </button>
      ) : (
        <Link href={`/projects/${projectId}`} className="rounded-full bg-white/15 px-3 py-1.5 font-semibold hover:bg-white/25">
          <span aria-hidden>←</span> Back to project
        </Link>
      )}
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        aria-label="Hide preview controls"
        className="rounded-full px-2.5 py-1.5 hover:bg-white/15"
      >
        <span aria-hidden>–</span>
      </button>
    </div>
  );
}

/** Message page for a preview that can't render yet (missing layout, avatar or template). */
export function PreviewMessage({ projectId, children, tone = "info" }: { projectId: string; children: React.ReactNode; tone?: "info" | "error" }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-background px-6 py-16 text-foreground">
      <Link href={`/projects/${projectId}`} className="self-start rounded text-sm text-muted-foreground hover:underline">
        <span aria-hidden>←</span> Back to project
      </Link>
      <p
        role={tone === "error" ? "alert" : "status"}
        className={tone === "error" ? "text-sm text-red-700 dark:text-red-300" : "text-sm text-neutral-700 dark:text-indigo-100"}
      >
        {children}
      </p>
    </main>
  );
}
