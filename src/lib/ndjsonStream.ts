/**
 * Wraps a long-running route handler body in a newline-delimited-JSON
 * streaming response, so the client can render real progress (e.g. "42/127
 * chunks done") instead of staring at a spinner for however long a bulk
 * audio generation takes. `run` calls `send(obj)` as many times as it likes
 * (typically `{type:"progress", completed, total}`) and is expected to send
 * exactly one terminal `{type:"done", ...}` message before returning; any
 * thrown error is converted into a `{type:"error", message}` message so the
 * client always gets a well-formed final line instead of a truncated stream.
 */
export function createNdjsonStream(run: (send: (obj: unknown) => void) => Promise<void>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: unknown) {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      }
      try {
        await run(send);
      } catch (error) {
        console.error("ndjson stream handler failed:", error);
        send({ type: "error", message: error instanceof Error ? error.message : String(error) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
