/**
 * Coalescing "save progress" helper for long-running generation routes
 * (generate-audio, generate-case-study-audio).
 *
 * Each finished item calls schedule(). At most one save runs at a time; any
 * schedule() calls that arrive while a save is in flight collapse into one
 * follow-up save, which reads the latest in-memory state. So if the function
 * is killed (e.g. Vercel's 300 s limit), every item that finished before the
 * last completed save is already linked in the database, and a retry only has
 * to redo the rest.
 *
 * Save failures are reported through onError and never thrown: the route's
 * own final save is the one that must succeed.
 */
export function createProgressSaver(save: () => Promise<void>, onError: (error: unknown) => void) {
  let running: Promise<void> | null = null;
  let dirty = false;

  async function loop() {
    while (dirty) {
      dirty = false;
      try {
        await save();
      } catch (error) {
        onError(error);
      }
    }
    running = null;
  }

  return {
    schedule() {
      dirty = true;
      if (!running) running = loop();
    },
    /** Waits for any in-flight / pending save to finish. */
    async flush() {
      while (running) await running;
    },
  };
}
