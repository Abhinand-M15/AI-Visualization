"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Client half of <UserMenu /> (src/components/UserMenu.tsx): the button and
 * popover. Sits to the left of the fixed ThemeToggle (right-5 top-5).
 */
export function UserMenuDropdown({ displayName, email }: { displayName: string; email: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const initial = (displayName || email || "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed right-36 top-5 z-50">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${displayName || email}`}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 py-1 pl-1 pr-1 text-sm font-medium text-neutral-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:pr-4 dark:border-white/10 dark:bg-neutral-900/90 dark:text-indigo-100 dark:hover:bg-neutral-800"
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-semibold text-neutral-950"
        >
          {initial}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">{displayName || email}</span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white text-sm shadow-xl dark:border-white/10 dark:bg-neutral-900"
        >
          <div className="border-b border-neutral-200 px-4 py-3 dark:border-white/10">
            {displayName && <p className="truncate font-medium text-neutral-900 dark:text-white">{displayName}</p>}
            <p className="truncate text-neutral-500 dark:text-indigo-200/60">{email}</p>
          </div>
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none dark:text-indigo-100 dark:hover:bg-white/5 dark:focus:bg-white/5"
          >
            Settings
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none dark:text-red-300 dark:hover:bg-red-500/10 dark:focus:bg-red-500/10"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
