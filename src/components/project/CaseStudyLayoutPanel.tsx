"use client";

import type { CaseStudyBinding } from "@/lib/types";
import type { CaseStudySection } from "@/lib/caseStudySections";
import { sectionNarrationState } from "@/lib/contentVersion";
import { formatDate } from "@/lib/projects";
import { CASE_STUDY_TEMPLATE_CONTRACT } from "@/lib/agent/caseStudyTemplateContract";
import { LoadingBar } from "@/components/LoadingBar";
import { Button, fieldClass } from "@/components/ui/button";
import { InlineError } from "@/components/StateViews";
import { NarrationBadge } from "@/components/project/ChapterEditor";
import { cn } from "@/lib/utils";

/** maxChars of a slot field from the case-study contract, when the contract defines one. */
function contractMaxChars(slotId: string, field: string): number | undefined {
  const slot = (CASE_STUDY_TEMPLATE_CONTRACT.slots as readonly { id: string; fields: readonly { name: string; maxChars: number }[] }[]).find(
    (entry) => entry.id === slotId
  );
  return slot?.fields.find((entry) => entry.name === field)?.maxChars;
}

function CharCount({ value, max, id }: { value: string; max?: number; id: string }) {
  if (!max) return null;
  const over = value.length > max;
  return (
    <span id={id} className={`text-xs ${over ? "font-medium text-amber-800 dark:text-amber-200" : "text-muted-foreground"}`}>
      {value.length}/{max} characters
      {over ? " · longer than the layout is designed for" : ""}
    </span>
  );
}

/** Plain words for the binder's diagnostics (UX-24). */
const ISSUE_TEXT: Record<CaseStudyBinding["diagnostics"][number]["issue"], string> = {
  unsupported: "the document doesn't cover it, so it was left out",
  under_min: "shorter than the layout expects",
  dropped_entries: "some items were left out to fit",
  hard_compression: "shortened a lot to fit",
};

export function sectionName(section: Pick<CaseStudySection, "sectionLabel" | "index">): string {
  return `${section.sectionLabel}${section.index !== null ? ` ${section.index + 1}` : ""}`;
}

/**
 * Case study layout (part of step 1, "Content"): make or remake the fixed
 * Company → Impact layout from the chapters, edit each section's text, and
 * see what had to be shortened. This is what a case study publishes.
 */
export function CaseStudyLayoutPanel({
  binding,
  sections,
  sectionDrafts,
  onEditSection,
  voice,
  generating,
  error,
  onGenerate,
  lockedReason,
}: {
  binding: CaseStudyBinding | null | undefined;
  sections: CaseStudySection[];
  sectionDrafts: Record<string, { title?: string; body?: string }>;
  onEditSection: (key: string, field: "title" | "body", value: string) => void;
  voice: string;
  generating: boolean;
  error: string | null;
  onGenerate: () => void;
  lockedReason: string | null;
}) {
  const labels = Array.from(new Set(sections.map((section) => section.sectionLabel)));
  const diagnostics = binding?.diagnostics ?? [];
  const sectionForSlot = (slotId: string) => sections.find((section) => section.slotId === slotId);
  const locked = Boolean(lockedReason);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Fits the chapters into the case study page
        {labels.length > 0 ? ` (${labels.join(" → ")})` : " (Company → Domain → Customer → Problem → Solution → Impact)"}.
        This is what a case study publishes.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant={binding ? "secondary" : "primary"} size="sm" onClick={onGenerate} disabled={generating || locked}>
          {generating ? "Making the layout…" : binding ? "Remake layout from chapters" : "Make case study layout"}
        </Button>
        {binding && (
          <span className="text-xs text-muted-foreground">
            Layout made {formatDate(binding.boundAt, true)}
            {diagnostics.length > 0
              ? ` · ${diagnostics.length} ${diagnostics.length === 1 ? "section was" : "sections were"} adjusted to fit (see below)`
              : " · every section fits"}
          </span>
        )}
      </div>
      {lockedReason && <p className="text-xs text-muted-foreground">{lockedReason}</p>}
      {generating && <LoadingBar label="Making the case study layout… this usually takes under a minute." />}
      {error && <InlineError>{error}</InlineError>}

      {binding?.chunksChangedAt && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          The chapters were edited on {formatDate(binding.chunksChangedAt, true)}, after this layout was made. The
          published case study shows the section text below: edit it directly, or remake the layout to rebuild every
          section from the chapters (this replaces section edits and their narration).
        </p>
      )}

      {diagnostics.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">
          {diagnostics.map((diagnostic, index) => {
            const section = sectionForSlot(diagnostic.slotId);
            return (
              <li key={index}>
                <span className="font-semibold">{section ? section.sectionLabel : "A section"}</span>:{" "}
                {ISSUE_TEXT[diagnostic.issue] ?? "adjusted to fit"}.
              </li>
            );
          })}
        </ul>
      )}

      {binding && sections.length > 0 && (
        <details className="group rounded-xl border border-neutral-200 p-3 dark:border-white/10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded text-sm font-semibold text-neutral-900 dark:text-indigo-50">
            <span>Edit section text ({sections.length})</span>
            <span aria-hidden className="text-xs font-normal text-muted-foreground transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <p className="mt-2 text-xs text-muted-foreground">
            This is the text the published case study shows and narrates. Changing a section&apos;s text marks its
            narration as outdated; it&apos;s recorded again when you publish.
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {sections.map((section) => {
              const draft = sectionDrafts[section.key];
              const titleValue = draft?.title ?? section.title;
              const bodyValue = draft?.body ?? section.body;
              const state = sectionNarrationState(binding, section.key, voice || undefined);
              const bodyChanged = draft?.body !== undefined && draft.body !== section.body;
              const titleMax = section.titleField ? contractMaxChars(section.slotId, section.titleField) : undefined;
              const bodyMax = contractMaxChars(section.slotId, "body");
              return (
                <div key={section.key} className="flex flex-col gap-1.5 rounded-xl border border-neutral-200 p-3 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
                      {sectionName(section)}
                    </span>
                    {bodyChanged ? (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-400/15 dark:text-violet-200">
                        Unsaved · narration will need updating
                      </span>
                    ) : (
                      <NarrationBadge state={state} />
                    )}
                  </div>
                  {section.titleField && (
                    <>
                      <label className="sr-only" htmlFor={`section-title-${section.key}`}>
                        {sectionName(section)} title
                      </label>
                      <input
                        id={`section-title-${section.key}`}
                        value={titleValue}
                        readOnly={locked}
                        aria-describedby={titleMax ? `section-title-${section.key}-count` : undefined}
                        onChange={(event) => onEditSection(section.key, "title", event.target.value)}
                        className={cn(fieldClass, "font-medium", locked && "opacity-70")}
                      />
                      <CharCount id={`section-title-${section.key}-count`} value={titleValue} max={titleMax} />
                    </>
                  )}
                  <label className="sr-only" htmlFor={`section-body-${section.key}`}>
                    {sectionName(section)} text
                  </label>
                  <textarea
                    id={`section-body-${section.key}`}
                    value={bodyValue}
                    readOnly={locked}
                    aria-describedby={bodyMax ? `section-body-${section.key}-count` : undefined}
                    onChange={(event) => onEditSection(section.key, "body", event.target.value)}
                    rows={4}
                    className={cn(fieldClass, "leading-relaxed", locked && "opacity-70")}
                  />
                  <CharCount id={`section-body-${section.key}-count`} value={bodyValue} max={bodyMax} />
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
