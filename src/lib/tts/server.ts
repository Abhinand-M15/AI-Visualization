/**
 * TTS via the external OpenAI-compatible server (text-to-voice/server/server.py,
 * a Python edge-tts wrapper). This is the owner's original local setup.
 */
import type { TtsVoice } from "../tts";
import { TtsPermanentError, errorMessage, retryWithBackoff, splitText, withTimeout } from "./util";

const DEFAULT_TTS_SERVER_URL = "http://localhost:5050";
/** The server handles long text itself; only very long chapters are split, to keep each request short. */
const MAX_PIECE_CHARS = 5000;
const REQUEST_TIMEOUT_MS = 90_000;
const VOICES_TIMEOUT_MS = 15_000;
const ATTEMPTS = 3;
const BASE_DELAY_MS = 1_000;

let voiceCache: TtsVoice[] | null = null;

function getConfig() {
  const baseUrl = (process.env.TTS_SERVER_URL ?? DEFAULT_TTS_SERVER_URL).replace(/\/+$/, "");
  const apiKey = process.env.TTS_API_KEY;
  if (!apiKey) {
    throw new Error("TTS_API_KEY is not set. Add it to .env.local (see .env.local.example).");
  }
  return { baseUrl, apiKey };
}

async function request(url: string, init: RequestInit, timeoutMs: number, label: string): Promise<Response> {
  const controller = new AbortController();
  let res: Response;
  try {
    res = await withTimeout(fetch(url, { ...init, signal: controller.signal }), timeoutMs, label, () =>
      controller.abort()
    );
  } catch (error) {
    throw new Error(`${label} failed (is the TTS server at ${url} running?): ${errorMessage(error)}`);
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const message = `TTS server returned ${res.status} ${label.toLowerCase()}: ${errText.slice(0, 200)}`;
    // 4xx (bad key, bad voice, bad body) won't succeed on retry; 5xx / 429 might.
    throw res.status >= 400 && res.status < 500 && res.status !== 429 ? new TtsPermanentError(message) : new Error(message);
  }
  return res;
}

export async function listServerVoices(): Promise<TtsVoice[]> {
  if (voiceCache) return voiceCache;
  const { baseUrl, apiKey } = getConfig();
  const voices = await retryWithBackoff(
    async () => {
      const res = await request(
        `${baseUrl}/v1/voices`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
        VOICES_TIMEOUT_MS,
        "Listing voices"
      );
      const data = await res.json();
      return data.voices as TtsVoice[];
    },
    ATTEMPTS,
    BASE_DELAY_MS
  );
  voiceCache = voices;
  return voices;
}

export async function generateServerSpeech(text: string, voice: string): Promise<Buffer> {
  const { baseUrl, apiKey } = getConfig();
  const pieces = splitText(text, MAX_PIECE_CHARS);
  if (pieces.length === 0) throw new Error("Cannot generate speech for empty text.");

  const buffers: Buffer[] = [];
  for (const piece of pieces) {
    buffers.push(
      await retryWithBackoff(
        async () => {
          const res = await request(
            `${baseUrl}/v1/audio/speech`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({ input: piece, voice, response_format: "mp3", speed: 1.0 }),
            },
            REQUEST_TIMEOUT_MS,
            "Generating audio"
          );
          return Buffer.from(await res.arrayBuffer());
        },
        ATTEMPTS,
        BASE_DELAY_MS
      )
    );
  }
  return Buffer.concat(buffers);
}
