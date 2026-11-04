"use client";

import { useEffect, useRef } from "react";

/**
 * Warns before work is lost (UX-04) while `active` is true:
 * - closing or reloading the tab, or a full-page navigation (sign out),
 *   gets the browser's own "Leave site?" prompt (beforeunload);
 * - clicking any in-app link (back links, the account menu, the app name)
 *   asks `message` first and stays on the page when the user cancels.
 *
 * The link check runs in the capture phase on the document, before Next's
 * <Link> handler, so cancelling stops the client-side navigation too. Links
 * that open a new tab, downloads and modified clicks are left alone.
 * The browser Back button is not intercepted (it can't be blocked reliably);
 * the /new draft is also kept in storage so Back loses nothing there.
 */
export function useUnsavedChangesWarning(active: boolean, message: string) {
  const messageRef = useRef(message);
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Older browsers need returnValue set to show the prompt.
      event.returnValue = "";
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same page (only the hash changes): nothing is lost.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm(messageRef.current)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);
}
