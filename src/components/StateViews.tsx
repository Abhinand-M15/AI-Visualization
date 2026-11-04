import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass, cardClass } from "@/components/ui/button";
import { isKeyProblem, settingsHrefFor } from "@/components/apiError";
import { cn } from "@/lib/utils";

/**
 * Shared loading / empty / error views (UI-16) so every screen shows the same
 * kind of feedback: a friendly message, a Retry where it helps, and a link to
 * Settings when the problem is the user's API key.
 */

export function ErrorState({
  title = "Something went wrong",
  message,
  code,
  onRetry,
  retryLabel = "Try again",
  children,
  className,
  compact = false,
}: {
  title?: string;
  message: string;
  /** Server error code; key problems add an "Open Settings" link. */
  code?: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** Extra actions (e.g. "Start over"). */
  children?: ReactNode;
  className?: string;
  /** Inline (inside a card) instead of a card of its own. */
  compact?: boolean;
}) {
  const keyProblem = isKeyProblem(code);
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 border border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100",
        compact ? "rounded-xl p-3 text-sm" : "rounded-2xl p-5 text-sm",
        className
      )}
    >
      <div>
        {!compact && <p className="text-base font-semibold">{title}</p>}
        <p className={compact ? "" : "mt-1"}>{message}</p>
      </div>
      {(onRetry || keyProblem || children) && (
        <div className="flex flex-wrap items-center gap-2">
          {keyProblem && (
            <Link href={settingsHrefFor(code)} className={buttonClass("primary", compact ? "xs" : "sm")}>
              Open Settings
            </Link>
          )}
          {onRetry && (
            <button type="button" onClick={onRetry} className={buttonClass("secondary", compact ? "xs" : "sm")}>
              {retryLabel}
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={cn(cardClass, "flex flex-col items-center gap-3 border-dashed p-10 text-center")}>
      <p className="text-base font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

/** Grey placeholder blocks while something loads; `label` is announced to screen readers. */
export function Skeleton({ lines = 3, label = "Loading…", className }: { lines?: number; label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn(cardClass, "flex flex-col gap-3 p-5", className)}>
      <span className="sr-only">{label}</span>
      <div aria-hidden className="h-5 w-1/3 animate-pulse rounded-full bg-neutral-200 motion-reduce:animate-none dark:bg-white/10" />
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          aria-hidden
          className="h-3 animate-pulse rounded-full bg-neutral-200 motion-reduce:animate-none dark:bg-white/10"
          style={{ width: `${90 - index * 15}%` }}
        />
      ))}
    </div>
  );
}

/** Small inline status line (role=status) for progress / success text. */
export function StatusText({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "success" | "warning" }) {
  const toneClass =
    tone === "success"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "warning"
        ? "text-amber-800 dark:text-amber-200"
        : "text-muted-foreground";
  return (
    <p role="status" className={cn("text-xs", toneClass)}>
      {children}
    </p>
  );
}

/** Inline error line (role=alert). */
export function InlineError({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p role="alert" className={cn("text-xs text-red-700 dark:text-red-300", className)}>
      {children}
    </p>
  );
}
