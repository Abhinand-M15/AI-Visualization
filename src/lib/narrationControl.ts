import gsap from "gsap";
import { AUTOSCROLL_STORAGE_KEY } from "@/lib/narrationDock";

/**
 * One global pause/play switch for every narration <audio> element on the
 * page, regardless of which template rendered them. Pausing immediately
 * stops whatever is currently playing and remembers it; playing again
 * resumes exactly that (rather than replaying from the start or requiring
 * the reader to re-trigger a scroll event).
 *
 * Also owns the auto-scroll switch (advance to the next section when a
 * section's narration ends) and the smooth scroll it uses.
 */
type Listener = (paused: boolean) => void;

let paused = false;
const listeners = new Set<Listener>();

export function isNarrationPaused(): boolean {
  return paused;
}

export function setNarrationPaused(next: boolean): void {
  paused = next;
  if (typeof document === "undefined") return;

  if (paused) {
    document.querySelectorAll("audio, video").forEach((el) => {
      const media = el as HTMLMediaElement;
      if (!media.paused) media.dataset.wasPlayingBeforePause = "1";
      media.pause();
    });
  } else {
    document.querySelectorAll("audio, video").forEach((el) => {
      const media = el as HTMLMediaElement;
      if (media.dataset.wasPlayingBeforePause === "1") {
        delete media.dataset.wasPlayingBeforePause;
        media.play().catch(() => {
          // Autoplay can still be blocked before the user has interacted —
          // pressing the pause/play button again retries.
        });
      }
    });
  }

  listeners.forEach((listener) => listener(paused));
}

export function subscribeNarrationPaused(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------------------------------------------------------------------------
// Auto-scroll. Default on; the choice is remembered in localStorage.
// ---------------------------------------------------------------------------

let autoScroll = true;
let autoScrollLoaded = false;
const autoScrollListeners = new Set<(on: boolean) => void>();

export function isAutoScrollOn(): boolean {
  if (!autoScrollLoaded && typeof window !== "undefined") {
    autoScrollLoaded = true;
    try {
      if (window.localStorage.getItem(AUTOSCROLL_STORAGE_KEY) === "0") autoScroll = false;
    } catch {
      // Storage can be blocked (private windows) — keep the default.
    }
  }
  return autoScroll;
}

export function setAutoScroll(next: boolean): void {
  autoScroll = next;
  autoScrollLoaded = true;
  try {
    window.localStorage.setItem(AUTOSCROLL_STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Not persisted — still applies for this visit.
  }
  autoScrollListeners.forEach((listener) => listener(next));
}

export function subscribeAutoScroll(listener: (on: boolean) => void): () => void {
  autoScrollListeners.add(listener);
  return () => autoScrollListeners.delete(listener);
}

let scrollTween: gsap.core.Tween | null = null;
let restoreSnap: (() => void) | null = null;

function stopAutoScroll() {
  scrollTween?.kill();
  scrollTween = null;
  restoreSnap?.();
  restoreSnap = null;
}

/** Scroll position that brings a section into view: its top, or centred when it
 *  is shorter than the viewport (so a short card doesn't leave its neighbour
 *  under the viewport centre, which is where the scroll triggers fire). */
function sectionTarget(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const vh = window.innerHeight;
  const y = rect.height < vh ? top - (vh - rect.height) / 2 : top;
  return Math.max(0, Math.min(y, document.documentElement.scrollHeight - vh));
}

/** Smooth ease-in-out scroll (about a second). A gsap tween rather than
 *  scrollTo({ behavior: "smooth" }): the duration is predictable and it never
 *  fights scroll-snap, which is switched off while the tween runs. */
function scrollToY(y: number) {
  stopAutoScroll();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || Math.abs(y - window.scrollY) < 2) {
    window.scrollTo(0, y);
    return;
  }
  const root = document.documentElement;
  const prevSnap = root.style.scrollSnapType;
  root.style.scrollSnapType = "none";
  restoreSnap = () => {
    root.style.scrollSnapType = prevSnap;
  };
  const proxy = { y: window.scrollY };
  scrollTween = gsap.to(proxy, {
    y,
    duration: 1,
    ease: "power2.inOut",
    onUpdate: () => window.scrollTo(0, proxy.y),
    onComplete: stopAutoScroll,
  });
}

/** Called when a section's narration has ended: moves to the next section if
 *  auto-scroll is on, narration isn't paused, and the section that finished is
 *  still the one under the viewport centre (the reader hasn't scrolled away).
 *  Does nothing after the last section. */
export function advanceFromSection(section: HTMLElement, sections: HTMLElement[]): void {
  if (!isAutoScrollOn() || paused) return;
  const rect = section.getBoundingClientRect();
  const middle = window.innerHeight / 2;
  if (rect.top > middle + 2 || rect.bottom < middle - 2) return;
  const next = sections[sections.indexOf(section) + 1];
  if (next) scrollToY(sectionTarget(next));
}

/** Installs the listeners that hand control back to the reader mid-scroll.
 *  Returns the cleanup. */
export function installAutoScrollInterrupts(): () => void {
  const types = ["wheel", "touchstart", "keydown", "mousedown"] as const;
  types.forEach((type) => window.addEventListener(type, stopAutoScroll, { passive: true }));
  return () => {
    types.forEach((type) => window.removeEventListener(type, stopAutoScroll));
    stopAutoScroll();
  };
}
