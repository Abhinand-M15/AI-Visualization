"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Client half of <UserMenu /> (src/components/UserMenu.tsx): the account
 * button and its popover, shown in the app's top bar (AppChrome) next to the
 * theme toggle.
 *
 * A plain disclosure (button + list of links), not an ARIA menu (UX-23): Tab
 * and Shift+Tab move through the items, focus goes to the first item when it
 * opens, and Escape or clicking outside closes it and returns focus.
 */
export function UserMenuDropdown({ displayName, email }: { displayName: string; email: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const panelId = useId();
  const initial = (displayName || email || "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onFocusIn(event: FocusEvent) {
      // Tabbing out of the panel closes it.
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Account: ${displayName || email}`}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 py-1 pl-1 pr-1 text-sm font-medium text-neutral-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-neutral-50 sm:pr-4 dark:border-white/10 dark:bg-neutral-900/90 dark:text-indigo-100 dark:hover:bg-neutral-800"
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
          id={panelId}
          className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white text-sm shadow-xl dark:border-white/10 dark:bg-neutral-900"
        >
          <div className="border-b border-neutral-200 px-4 py-3 dark:border-white/10">
            {displayName && <p className="truncate font-medium text-neutral-900 dark:text-white">{displayName}</p>}
            <p className="truncate text-muted-foreground">{email}</p>
          </div>
          <ul>
            <li>
              <Link
                ref={firstItemRef}
                href="/settings"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-neutral-800 hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-offset-[-2px] dark:text-indigo-100 dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
              >
                Settings
              </Link>
            </li>
            <li>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="block w-full px-4 py-2.5 text-left text-red-700 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-offset-[-2px] dark:text-red-300 dark:hover:bg-red-500/10 dark:focus-visible:bg-red-500/10"
                >
                  Log out
                </button>
              </form>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
