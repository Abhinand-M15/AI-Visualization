/**
 * Text-to-speech entry point. Callers only use `listVoices()` and
 * `generateSpeech()`; the provider is picked by `TTS_PROVIDER`:
 *
 * - `edge`:   in-process Microsoft Edge read-aloud voices (src/lib/tts/edge.ts).
 *             Works on Vercel with no separate server. Default when
 *             TTS_SERVER_URL is not set.
 * - `server`: the external OpenAI-compatible TTS server (TTS_SERVER_URL +
 *             TTS_API_KEY). Default when TTS_SERVER_URL is set, so an existing
 *             local setup keeps working unchanged.
 *
 * Both return 24 kHz mono mp3 and the same Edge voice names.
 */
import { generateEdgeSpeech, listEdgeVoices } from "./tts/edge";
import { generateServerSpeech, listServerVoices } from "./tts/server";

export interface TtsVoice {
  name: string;
  language: string;
  gender: string;
}

type TtsProvider = "edge" | "server";

function getProvider(): TtsProvider {
  const configured = process.env.TTS_PROVIDER?.trim().toLowerCase();
  if (!configured) return process.env.TTS_SERVER_URL ? "server" : "edge";
  if (configured === "edge" || configured === "server") return configured;
  throw new Error(`TTS_PROVIDER must be "edge" or "server" (got "${process.env.TTS_PROVIDER}").`);
}

export async function listVoices(): Promise<TtsVoice[]> {
  return getProvider() === "edge" ? listEdgeVoices() : listServerVoices();
}

/** Returns mp3 audio for `text` spoken by `voice` (an Edge voice ShortName, e.g. "en-AU-WilliamMultilingualNeural"). */
export async function generateSpeech(text: string, voice: string): Promise<Buffer> {
  return getProvider() === "edge" ? generateEdgeSpeech(text, voice) : generateServerSpeech(text, voice);
}
