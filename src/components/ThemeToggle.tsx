"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Switch between light and dark theme"
      className="fixed right-5 top-5 z-50 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-900/90 dark:text-indigo-100 dark:hover:bg-neutral-800"
    >
      {theme === "dark" ? "Light theme" : "Dark theme"}
    </button>
  );
}
