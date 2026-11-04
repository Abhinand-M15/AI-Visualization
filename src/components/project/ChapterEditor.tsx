"use client";

import { useRef, type KeyboardEvent } from "react";
import type { Chunk } from "@/lib/types";
import { chunkNarrationState, type NarrationState } from "@/lib/contentVersion";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Button, fieldClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NARRATION_BADGE: Record<Exclude<NarrationState, "ok">, { label: string; className: string }> = {
  outdated: {
    label: "Narration outdated",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200",
  },
  missing: {
    label: "No narration",
    className: "bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-neutral-200",
  },
};

export function NarrationBadge({ state }: { state: NarrationState }) {
  if (state === "ok") return null;
  const badge = NARRATION_BADGE[state];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>;
}

export interface ChapterEditorProps {
  chunks: Chunk[];
  /** The saved chapters, to tell which narration an unsaved edit will make outdated. */
  savedChunks: Chunk[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onEdit: (chunkId: string, field: "title" | "narrativeText", value: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onAdd: (afterIndex: number) => void;
  onDelete: (index: number) => void;
  /** Why editing is paused right now (e.g. narration is being generated), or null. */
  lockedReason: string | null;
  /** Narration controls per chapter (hidden for case studies, which narrate their sections). */
  narration?: {
    voice: string;
    generatingChunkId: string | null;
    disabledReason: string | null;
    onGenerate: (chunkId: string) => void;
  };
  /** Shown after a delete so it can be undone. */
  undo?: { label: string; onUndo: () => void } | null;
}

/**
 * The chapters as a plain list plus one editor (UX-10, UI-06): every chapter
 * is visible in the list, the page scrolls normally (no wheel hijacking), and
 * only the open chapter's fields exist, so Tab never lands in a hidden card.
 * Arrow keys move through the list.
 */
export function ChapterEditor({
  chunks,
  savedChunks,
  activeIndex,
  onSelect,
  onEdit,
  onMove,
  onAdd,
  onDelete,
  lockedReason,
  narration,
  undo,
}: ChapterEditorProps) {
  const listRef = useRef<HTMLOListElement | null>(null);
  const index = Math.min(Math.max(activeIndex, 0), Math.max(chunks.length - 1, 0));
  const chunk = chunks[index];
  const locked = Boolean(lockedReason);
  const savedById = new Map(savedChunks.map((saved) => [saved.id, saved]));

  function focusItem(next: number) {
    onSelect(next);
    window.setTimeout(() => listRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus(), 0);
  }

  function onListKeyDown(event: KeyboardEvent<HTMLOListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(Math.min(chunks.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(Math.max(0, index - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItem(chunks.length - 1);
    }
  }

  function narrationStateOf(item: Chunk): NarrationState | "unsaved" {
    const saved = savedById.get(item.id);
    if (saved && saved.narrativeText !== item.narrativeText) return "unsaved";
    return chunkNarrationState(item, narration?.voice || undefined);
  }

  if (!chunk) return <p className="text-sm text-muted-foreground">This story has no chapters yet.</p>;

  const state = narrationStateOf(chunk);
  const isNew = !savedById.has(chunk.id);

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <nav aria-label="Chapters" className="min-w-0">
        <ol
          ref={listRef}
          onKeyDown={onListKeyDown}
          className="thin-scroll flex max-h-64 flex-col gap-1 overflow-y-auto rounded-xl border border-neutral-200 p-1 dark:border-white/10 md:max-h-[34rem]"
        >
          {chunks.map((item, i) => {
            const itemState = narration ? narrationStateOf(item) : "ok";
            const active = i === index;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex w-full min-w-0 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-violet-100 font-medium text-violet-950 dark:bg-violet-500/20 dark:text-white"
                      : "text-neutral-800 hover:bg-neutral-100 dark:text-indigo-100 dark:hover:bg-white/5"
                  )}
                >
                  <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{item.title.trim() || "Untitled chapter"}</span>
                  {itemState !== "ok" && (
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        itemState === "missing" ? "bg-neutral-400" : itemState === "unsaved" ? "bg-violet-500" : "bg-amber-500"
                      )}
                      title={
                        itemState === "missing" ? "No narration" : itemState === "unsaved" ? "Unsaved text change" : "Narration outdated"
                      }
                    >
                      <span className="sr-only">
                        {itemState === "missing" ? " (no narration)" : itemState === "unsaved" ? " (unsaved)" : " (narration outdated)"}
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        <Button size="xs" className="mt-2" onClick={() => onAdd(chunks.length - 1)} disabled={locked}>
          + Add a chapter at the end
        </Button>
      </nav>

      <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-neutral-200 p-3 dark:border-white/10 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-300">Chapter {index + 1}</h3>
            {chunk.userEdited && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
                Edited
              </span>
            )}
            {narration &&
              (state === "unsaved" ? (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-400/15 dark:text-violet-200">
                  Unsaved · narration will need updating
                </span>
              ) : (
                <NarrationBadge state={state} />
              ))}
          </div>
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label={`Chapter ${index + 1} actions`}>
            <Button size="xs" onClick={() => onMove(index, -1)} disabled={locked || index === 0} aria-label="Move chapter up">
              <span aria-hidden>↑</span> Up
            </Button>
            <Button
              size="xs"
              onClick={() => onMove(index, 1)}
              disabled={locked || index === chunks.length - 1}
              aria-label="Move chapter down"
            >
              <span aria-hidden>↓</span> Down
            </Button>
            <Button size="xs" onClick={() => onAdd(index)} disabled={locked} aria-label="Add a chapter after this one">
              + After
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
              onClick={() => onDelete(index)}
              disabled={locked || chunks.length <= 1}
              title={chunks.length <= 1 ? "A story needs at least one chapter" : undefined}
            >
              Delete
            </Button>
          </div>
        </div>

        {lockedReason && (
          <p role="status" className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-900 dark:bg-sky-400/10 dark:text-sky-100">
            {lockedReason}
          </p>
        )}
        {undo && (
          <p role="status" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {undo.label}
            <Button size="xs" variant="ghost" onClick={undo.onUndo}>
              Undo
            </Button>
          </p>
        )}

        <label htmlFor={`chapter-title-${chunk.id}`} className="text-xs font-medium text-muted-foreground">
          Title
        </label>
        <input
          id={`chapter-title-${chunk.id}`}
          value={chunk.title}
          placeholder="Chapter title"
          readOnly={locked}
          aria-readonly={locked || undefined}
          onChange={(event) => onEdit(chunk.id, "title", event.target.value)}
          className={cn(fieldClass, "font-medium", locked && "opacity-70")}
        />
        <label htmlFor={`chapter-text-${chunk.id}`} className="text-xs font-medium text-muted-foreground">
          Narration text <span className="font-normal">(what the voice reads and the site shows)</span>
        </label>
        <textarea
          id={`chapter-text-${chunk.id}`}
          value={chunk.narrativeText}
          readOnly={locked}
          aria-readonly={locked || undefined}
          onChange={(event) => onEdit(chunk.id, "narrativeText", event.target.value)}
          rows={8}
          className={cn(fieldClass, "leading-relaxed", locked && "opacity-70")}
        />

        {narration && (
          <div className="flex flex-wrap items-center gap-2">
            {chunk.audioUrl && <AudioPlayer key={chunk.audioUrl} src={chunk.audioUrl} />}
            <Button
              size="xs"
              onClick={() => narration.onGenerate(chunk.id)}
              disabled={Boolean(narration.disabledReason) || isNew}
              title={isNew ? "Save the new chapter first" : narration.disabledReason ?? undefined}
            >
              {narration.generatingChunkId === chunk.id
                ? "Generating…"
                : chunk.audioUrl
                  ? "Regenerate narration"
                  : "Generate narration"}
            </Button>
            {(isNew || narration.disabledReason) && narration.generatingChunkId !== chunk.id && (
              <span className="text-xs text-muted-foreground">{isNew ? "Save the new chapter first." : narration.disabledReason}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
