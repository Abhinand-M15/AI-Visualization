/** Shared helpers for the TTS providers (text splitting, timeouts, retries). */

/**
 * Splits narration into pieces of at most `maxChars`, breaking at sentence
 * ends first, then at commas/semicolons, then at spaces, and only as a last
 * resort mid-word. The Edge read-aloud service rejects or truncates very long
 * SSML requests, so long chapters are synthesised piece by piece and the mp3s
 * are joined afterwards.
 */
export function splitText(text: string, maxChars: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  // Sentence-sized units ("Hello there." / "Really?!" / trailing text).
  const sentences = clean.match(/[^.!?…]+(?:[.!?…]+["'”’)\]]*|$)\s*/g) ?? [clean];

  const pieces: string[] = [];
  let current = "";
  const flush = () => {
    if (current.trim()) pieces.push(current.trim());
    current = "";
  };

  for (const sentence of sentences) {
    for (const unit of breakLongUnit(sentence, maxChars)) {
      if (current.length + unit.length > maxChars) flush();
      current += unit;
    }
  }
  flush();
  return pieces;
}

/** Breaks a single over-long sentence at clause boundaries, then spaces, then hard. */
function breakLongUnit(unit: string, maxChars: number): string[] {
  if (unit.length <= maxChars) return [unit];
  const out: string[] = [];
  let rest = unit;
  while (rest.length > maxChars) {
    const window = rest.slice(0, maxChars);
    let cut = Math.max(window.lastIndexOf(", "), window.lastIndexOf("; "), window.lastIndexOf(": "));
    if (cut < maxChars / 3) cut = window.lastIndexOf(" ");
    if (cut < maxChars / 3) cut = maxChars - 1;
    out.push(rest.slice(0, cut + 1));
    rest = rest.slice(cut + 1);
  }
  if (rest) out.push(rest);
  return out;
}

/** Escapes text so it can be embedded in SSML without being parsed as markup. */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Rejects with a clear error if `promise` hasn't settled within `ms`; runs `onTimeout` for cleanup. */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string, onTimeout?: () => void): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout?.();
      reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s.`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** An error that retrying won't fix (bad voice, auth failure, bad request). */
export class TtsPermanentError extends Error {}

/**
 * Runs `fn` up to `attempts` times with exponential backoff (+ jitter),
 * stopping early on a `TtsPermanentError`.
 */
export async function retryWithBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  attempts: number,
  baseDelayMs: number
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (error instanceof TtsPermanentError || attempt === attempts) break;
      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
