import type { ReactNode } from "react";
import { cardClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StepStatus = "done" | "todo" | "optional";

/** Small done / to-do marker used by the step list and step headings. */
export function StepMarker({ number, status }: { number: number; status: StepStatus }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        status === "done"
          ? "bg-emerald-500 text-neutral-950"
          : "border border-neutral-300 bg-white text-neutral-700 dark:border-white/20 dark:bg-white/5 dark:text-indigo-100"
      )}
    >
      {status === "done" ? (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
          <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        number
      )}
    </span>
  );
}

const STATUS_TEXT: Record<StepStatus, string> = { done: "Done", todo: "To do", optional: "Optional" };

/**
 * One numbered step of the project page (UX-11). A real heading (h2) so the
 * page has structure for screen readers (UX-19), the step's status in words,
 * and an id the step list links to.
 */
export function StepSection({
  id,
  number,
  title,
  description,
  status,
  children,
}: {
  id: string;
  number: number;
  title: string;
  description?: ReactNode;
  status: StepStatus;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(cardClass, "flex scroll-mt-[calc(var(--app-bar-height)+1rem)] flex-col gap-5 p-4 sm:p-6")}
    >
      <div className="flex items-start gap-3">
        <StepMarker number={number} status={status} />
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-heading`} className="text-section font-semibold tracking-tight">
            <span className="sr-only">Step {number}: </span>
            {title}
            <span className="sr-only"> ({STATUS_TEXT[status]})</span>
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** A labelled sub-part inside a step (h3). */
export function StepPart({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3 border-t border-neutral-200 pt-5 first:border-t-0 first:pt-0 dark:border-white/10", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-indigo-50">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
