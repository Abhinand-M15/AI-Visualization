"use client";

import { useEffect, type RefObject } from "react";
import { advanceFromSection, installAutoScrollInterrupts } from "@/lib/narrationControl";

/**
 * Auto-scroll for the scrolling templates: when a section's narration audio
 * ends, glides to the next section (see advanceFromSection for the rules).
 * `sectionSelector` matches the template's own section elements inside the
 * container. Media "ended" events don't bubble, so this listens in the capture
 * phase on the document — one listener no matter how many sections there are.
 */
export function useNarrationAutoScroll(containerRef: RefObject<HTMLElement | null>, sectionSelector: string) {
  useEffect(() => {
    const onEnded = (event: Event) => {
      const container = containerRef.current;
      const audio = event.target;
      if (!container || !(audio instanceof HTMLAudioElement)) return;
      const section = audio.closest<HTMLElement>(sectionSelector);
      if (!section || !container.contains(section)) return;
      const sections = Array.from(container.querySelectorAll<HTMLElement>(sectionSelector));
      advanceFromSection(section, sections);
    };
    document.addEventListener("ended", onEnded, true);
    const removeInterrupts = installAutoScrollInterrupts();
    return () => {
      document.removeEventListener("ended", onEnded, true);
      removeInterrupts();
    };
  }, [containerRef, sectionSelector]);
}
