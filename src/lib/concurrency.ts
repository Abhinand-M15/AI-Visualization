/**
 * Runs `fn` over `items` with at most `limit` in flight at once, instead of
 * firing all of them at the same time (which is what Promise.all does). This
 * matters once there are many items — e.g. a case-study document with 100+
 * chunks — since the local TTS server (and any real network dependency)
 * isn't built to handle that many simultaneous requests and starts throwing
 * "fetch failed" for a chunk here and there under that load.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
  /** Called after each item settles (success or failure) — lets a caller report progress. */
  onItemDone?: (completed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  let completed = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
      completed += 1;
      onItemDone?.(completed, items.length);
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Retries a transient failure (e.g. "fetch failed" from a momentary network
 * blip, more likely to actually occur once many requests are in flight) a
 * few times with backoff before giving up.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 500): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
      }
    }
  }
  throw lastError;
}
