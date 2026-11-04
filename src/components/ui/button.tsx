import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The app's one set of button styles (UI-15). Use `buttonClass()` for links
 * styled as buttons and `<Button>` for real buttons, so every screen shares
 * one primary style, one disabled style and one glow.
 *
 * - primary: violet-to-cyan gradient, the main action of a card or page
 * - secondary: outlined, for everything next to a primary action
 * - ghost: text only (toolbar links, low-emphasis actions)
 * - danger: destructive confirmations
 * - success: publishing (green, matches the "Published" badge)
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-violet-500 to-cyan-400 font-semibold text-neutral-950 shadow-glow hover:brightness-110 disabled:hover:brightness-100",
  secondary:
    "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-white/15 dark:bg-white/5 dark:text-indigo-50 dark:hover:bg-white/10",
  ghost:
    "text-neutral-700 hover:bg-neutral-100 dark:text-indigo-100 dark:hover:bg-white/10",
  danger: "bg-red-600 font-semibold text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  success:
    "bg-emerald-500 font-semibold text-neutral-950 shadow-glow-success hover:brightness-110 disabled:hover:brightness-100",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "px-3 py-1 text-xs",
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "sm", extra?: string): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], extra);
}

export function Button({
  variant = "secondary",
  size = "sm",
  className,
  type = "button",
  ...props
}: ComponentPropsWithRef<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

/** Shared form-control look: inputs, selects and textareas (focus ring comes from globals.css). */
export const fieldClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-black/30 dark:text-white dark:placeholder:text-indigo-200/50 dark:focus:border-violet-400";

/** Card surface used by every app screen. */
export const cardClass =
  "rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-sm";

/** Page title (28px) and its subtitle. */
export const pageTitleClass = "text-title font-semibold tracking-tight";
export const pageSubtitleClass = "text-sm text-muted-foreground";
