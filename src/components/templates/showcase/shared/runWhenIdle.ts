/**
 * Runs `fn` after `delay` ms, then at the next idle period. Used to stagger
 * heavy WebGL setup so a page (re)mount never does all of it in one frame.
 * Returns a cancel function.
 */
export function runWhenIdle(fn: () => void, delay = 0): () => void {
  let cancelled = false;
  let idleId = 0;
  const timer = window.setTimeout(() => {
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(
        () => {
          if (!cancelled) fn();
        },
        { timeout: 1200 },
      );
    } else if (!cancelled) {
      fn();
    }
  }, delay);
  return () => {
    cancelled = true;
    window.clearTimeout(timer);
    if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
  };
}
