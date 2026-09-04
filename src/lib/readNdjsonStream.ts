/**
 * Reads a newline-delimited-JSON streaming response (see ndjsonStream.ts)
 * client-side, calling `onMessage` for each parsed line as it arrives.
 */
export async function readNdjsonStream(response: Response, onMessage: (message: unknown) => void): Promise<void> {
  if (!response.body) {
    throw new Error("Response has no readable body — the browser or server doesn't support streaming here.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      onMessage(JSON.parse(line));
    }
  }

  if (buffer.trim()) {
    onMessage(JSON.parse(buffer));
  }
}
