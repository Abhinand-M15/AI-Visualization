"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import {
  isAutoScrollOn,
  isNarrationPaused,
  setAutoScroll,
  setNarrationPaused,
  subscribeAutoScroll,
  subscribeNarrationPaused,
} from "@/lib/narrationControl";
import { NARRATION_DOCK_CSS, NARRATION_DOCK_ICONS, type NarrationDockTheme } from "@/lib/narrationDock";

/**
 * The one fixed pause/play control for every narration audio element on the
 * page, plus the auto-scroll switch next to it. Pausing stops whatever is
 * currently playing outright and prevents scroll-triggered sections from
 * starting new narration until un-paused. Styled per template through
 * `theme` (same stylesheet as the published sites — see lib/narrationDock.ts).
 */
export function NarrationMasterControl({ theme }: { theme: NarrationDockTheme }) {
  const paused = useSyncExternalStore(subscribeNarrationPaused, isNarrationPaused, () => false);
  const autoScroll = useSyncExternalStore(subscribeAutoScroll, isAutoScrollOn, () => true);

  const vars: Record<string, string> = {};
  if (theme.variant !== "voyage" && theme.accent) vars["--nd-accent"] = theme.accent;
  if (theme.variant === "dark" && theme.border) vars["--nd-border"] = theme.border;

  return (
    <div className={`nd-dock nd-${theme.variant}`} data-paused={paused} style={vars as CSSProperties}>
      <style>{NARRATION_DOCK_CSS}</style>
      <button
        type="button"
        className="nd-pause"
        aria-label={paused ? "Play narration" : "Pause narration"}
        onClick={() => setNarrationPaused(!paused)}
      >
        <span className="nd-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: NARRATION_DOCK_ICONS }} />
        <span className="nd-label">{paused ? "Play" : "Pause"}</span>
      </button>
      <button
        type="button"
        className="nd-auto"
        role="switch"
        aria-checked={autoScroll}
        onClick={() => setAutoScroll(!autoScroll)}
      >
        <span className="nd-track" aria-hidden="true">
          <span className="nd-thumb" />
        </span>
        <span>Auto-scroll</span>
      </button>
    </div>
  );
}
