/**
 * Reads a newline-delimited-JSON streaming response (see ndjsonStream.ts)
 * client-side, calling `onMessage` for each parsed line as it arrives.
 *
 * Returns whether a `{ type: "done" }` line arrived. A stream that ends
 * without one was cut off (Vercel's 300 s limit, a network drop): callers
 * must treat that as "stopped part-way", reload what the server saved and
 * offer to continue, never as success (UX-09). A connection that drops while
 * reading is reported the same way instead of as a raw network error.
 * Lines that aren't valid JSON (a proxy error page, a truncated last line)
 * are skipped.
 */
export interface NdjsonResult {
  completed: boolean;
}

function isDone(message: unknown): boolean {
  return typeof message === "object" && message !== null && (message as { type?: unknown }).type === "done";
}

export async function readNdjsonStream(response: Response, onMessage: (message: unknown) => void): Promise<NdjsonResult> {
  if (!response.body) {
    throw new Error("Your browser couldn't read the server's progress updates. Reload the page to see what was saved.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;

  const handle = (line: string) => {
    if (!line.trim()) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      return;
    }
    if (isDone(parsed)) completed = true;
    onMessage(parsed);
  };

  while (true) {
    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await reader.read();
    } catch {
      // Connection dropped mid-stream: same as a stream that ended early.
      return { completed };
    }
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) handle(line);
  }

  handle(buffer);
  return { completed };
}
