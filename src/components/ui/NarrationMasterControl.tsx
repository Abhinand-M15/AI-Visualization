"use client";

import { useEffect, useState } from "react";
import { isNarrationPaused, setNarrationPaused, subscribeNarrationPaused } from "@/lib/narrationControl";

/**
 * One fixed, always-visible pause/play control for every narration audio
 * element on the page. Pausing stops whatever is currently playing outright
 * and prevents scroll-triggered sections from starting new narration until
 * un-paused — the per-section players still work individually, this is the
 * single override switch on top of them.
 */
export function NarrationMasterControl() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setPaused(isNarrationPaused());
    return subscribeNarrationPaused(setPaused);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setNarrationPaused(!paused)}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-black/85 px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur transition-colors hover:bg-black"
    >
      <span aria-hidden="true">{paused ? "▶" : "⏸"}</span>
      {paused ? "Play narration" : "Pause narration"}
    </button>
  );
}
