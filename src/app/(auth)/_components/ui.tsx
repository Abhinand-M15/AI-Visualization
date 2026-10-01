import type { InputHTMLAttributes, ReactNode } from "react";

/** Presentational building blocks shared by the auth pages (no state). */

export const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 aria-[invalid=true]:border-red-400 disabled:opacity-60 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-indigo-200/30 dark:focus:border-violet-400/60";

export const primaryButtonClass =
  "w-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-base font-semibold text-neutral-950 shadow-[0_0_30px_rgba(139,92,246,0.45)] transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40 dark:focus-visible:ring-offset-neutral-950";

export const secondaryButtonClass =
  "rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10";

export const linkClass =
  "font-medium text-violet-600 underline-offset-4 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-violet-400 dark:text-cyan-300";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_60px_rgba(99,102,241,0.08)] dark:backdrop-blur-sm">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-base text-neutral-500 dark:text-indigo-200/70">{subtitle}</p>}
      <div className="mt-6">{children}</div>
      {footer && (
        <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-600 dark:border-white/10 dark:text-indigo-100/70">
          {footer}
        </div>
      )}
    </section>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-neutral-700 dark:text-indigo-100">
      {children}
    </label>
  );
}

export function TextField({
  id,
  label,
  hint,
  ...inputProps
}: { id: string; label: string; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} name={id} aria-describedby={hintId} className={inputClass} {...inputProps} />
      {hint && (
        <p id={hintId} className="mt-2 text-xs text-neutral-500 dark:text-indigo-200/50">
          {hint}
        </p>
      )}
    </div>
  );
}

const NOTICE_STYLES = {
  error: "border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
  info: "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100/80",
} as const;

export function Notice({ tone, children }: { tone: keyof typeof NOTICE_STYLES; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${NOTICE_STYLES[tone]}`}
    >
      {children}
    </div>
  );
}

/** Shown instead of a working form when accounts are off or not configured. */
export function AuthUnavailable({ reason }: { reason: string }) {
  return <Notice tone="info">{reason}</Notice>;
}
