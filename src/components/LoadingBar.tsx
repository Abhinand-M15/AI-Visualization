interface LoadingBarProps {
  label: string;
  /** 0-1. Omit for an indeterminate sweep (used when there's no real sub-step count, e.g. a single Gemini call). */
  progress?: number;
  /** Shown right-aligned next to the label, e.g. "42 / 127". */
  detail?: string;
}

/**
 * Two variants sharing one track: a determinate fill (real progress, e.g.
 * "N of M chunks done" from a streamed audio-generation response) and an
 * indeterminate sweep (a single atomic call like story generation, which has
 * no natural sub-steps to report — this is honest "something is happening"
 * feedback, not a fabricated percentage).
 */
export function LoadingBar({ label, progress, detail }: LoadingBarProps) {
  const isDeterminate = typeof progress === "number";
  const clamped = isDeterminate ? Math.max(0, Math.min(1, progress)) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-medium text-neutral-600 dark:text-indigo-200/70">{label}</span>
        {detail && (
          <span className="text-sm font-medium tabular-nums text-neutral-400 dark:text-indigo-200/50">{detail}</span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
        {isDeterminate ? (
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-[width] duration-300 ease-out"
            style={{ width: `${Math.round(clamped * 100)}%` }}
          />
        ) : (
          <div className="loading-bar-indeterminate-fill h-full w-1/3 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
        )}
      </div>
    </div>
  );
}
