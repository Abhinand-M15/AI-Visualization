"use client";

import { useTheme } from "@/components/ThemeProvider";

/**
 * Light/dark switch. The label comes from CSS (the `.dark` class set before
 * paint), so the server-rendered HTML never shows the wrong label (UI-07).
 */
export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-900/90 dark:text-indigo-100 dark:hover:bg-neutral-800"
    >
      <span className="dark:hidden">Dark theme</span>
      <span className="hidden dark:inline">Light theme</span>
      <span className="sr-only"> (switch between light and dark theme)</span>
    </button>
  );
}
