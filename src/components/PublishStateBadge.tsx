import { PUBLISH_STATES, publishStateInfo, type PublishStateKey } from "@/lib/contentVersion";

const TONE_CLASSES: Record<(typeof PUBLISH_STATES)[number]["tone"], string> = {
  neutral: "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300",
  info: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200",
  danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
};

/** Status pill for a project's publish state (label and tone come from PUBLISH_STATES). */
export function PublishStateBadge({ state }: { state: PublishStateKey }) {
  const info = publishStateInfo(state);
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[info.tone]}`}
    >
      {info.label}
    </span>
  );
}
