"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/** Template previews show the story as it will be published: no app chrome on top (UI-02). */
export function isPreviewPath(pathname: string | null): boolean {
  return Boolean(pathname && /^\/projects\/[^/]+\/(preview|case-study-preview)(\/|$)/.test(pathname));
}

/**
 * The app's top bar: product name (a way home from every screen) and, on the
 * right, the theme toggle plus the account menu passed in as children. It is
 * a real sticky bar with a background once the page scrolls, so the controls
 * never float over form fields at any width (UI-10). Hidden on the template
 * preview routes, which have their own minimal bar.
 *
 * Height is --app-bar-height (globals.css).
 */
export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isPreviewPath(pathname)) return null;

  return (
    <div
      className={`sticky top-0 z-40 flex h-[var(--app-bar-height)] w-full shrink-0 items-center justify-between gap-3 px-4 transition-colors sm:px-6 ${
        scrolled
          ? "border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/70"
          : "border-b border-transparent"
      }`}
    >
      <Link
        href="/"
        className="min-w-0 truncate rounded text-sm font-semibold tracking-tight text-neutral-800 hover:text-violet-700 dark:text-indigo-50 dark:hover:text-violet-300"
      >
        Story Site Generator
      </Link>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}
