/**
 * One global pause/play switch for every narration <audio> element on the
 * page, regardless of which template rendered them. Pausing immediately
 * stops whatever is currently playing and remembers it; playing again
 * resumes exactly that (rather than replaying from the start or requiring
 * the reader to re-trigger a scroll event).
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
          // the per-section audio/video's own controls remain a manual fallback.
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
