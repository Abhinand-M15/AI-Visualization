/**
 * In-process TTS using Microsoft Edge's online "read aloud" voices (the same
 * service the Python edge-tts package and the old text-to-voice server use),
 * via the `msedge-tts` package. It opens an outbound secure WebSocket to
 * speech.platform.bing.com, so it runs anywhere Node.js can make outbound
 * connections, including Vercel Functions: no separate server needed.
 *
 * Output matches the old server: 24 kHz, 48 kbit/s, mono mp3.
 */
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import type { TtsVoice } from "../tts";
import { TtsPermanentError, errorMessage, escapeXml, retryWithBackoff, splitText, withTimeout } from "./util";

const OUTPUT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;
/** Longest piece sent in one request (Python edge-tts caps requests at ~4 KB of SSML). */
const MAX_PIECE_CHARS = 2000;
const CONNECT_TIMEOUT_MS = 15_000;
/** Per piece: generous, a 2000-char piece is ~2-3 minutes of speech but streams back in seconds. */
const PIECE_TIMEOUT_MS = 60_000;
const VOICES_TIMEOUT_MS = 15_000;
const ATTEMPTS = 3;
const BASE_DELAY_MS = 1_000;
const VOICE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let voiceCache: { voices: TtsVoice[]; expires: number } | null = null;
let voiceRequest: Promise<TtsVoice[]> | null = null;

export async function listEdgeVoices(): Promise<TtsVoice[]> {
  if (voiceCache && voiceCache.expires > Date.now()) return voiceCache.voices;
  // De-duplicate concurrent first calls; a failure isn't cached so the next call retries.
  voiceRequest ??= retryWithBackoff(
    async () => {
      const raw = await withTimeout(new MsEdgeTTS().getVoices(), VOICES_TIMEOUT_MS, "Fetching the Edge voice list");
      if (!Array.isArray(raw) || raw.length === 0) throw new Error("The Edge voice list came back empty.");
      return raw.map((v) => ({ name: v.ShortName, language: v.Locale, gender: v.Gender }));
    },
    ATTEMPTS,
    BASE_DELAY_MS
  )
    .then((voices) => {
      voiceCache = { voices, expires: Date.now() + VOICE_CACHE_TTL_MS };
      return voices;
    })
    .catch((error) => {
      throw new Error(`Could not list Edge TTS voices: ${errorMessage(error)}`);
    })
    .finally(() => {
      voiceRequest = null;
    });
  return voiceRequest;
}

/** Rejects unknown voice names up front (clear error, no pointless retries). Skipped if the list can't be fetched. */
async function assertKnownVoice(voice: string): Promise<void> {
  let voices: TtsVoice[];
  try {
    voices = await listEdgeVoices();
  } catch {
    return; // the synthesis call itself will surface any real problem
  }
  if (!voices.some((v) => v.name === voice)) {
    throw new TtsPermanentError(`Unknown Edge TTS voice "${voice}". Pick one from /api/voices.`);
  }
}

async function synthesizePiece(text: string, voice: string): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  try {
    await withTimeout(tts.setMetadata(voice, OUTPUT), CONNECT_TIMEOUT_MS, "Connecting to the Edge TTS service", () =>
      tts.close()
    );
    const { audioStream } = tts.toStream(escapeXml(text), { rate: "+0%", pitch: "+0Hz", volume: "+0%" });
    const collected = new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.once("end", () => resolve(Buffer.concat(chunks)));
      audioStream.once("error", reject);
    });
    const audio = await withTimeout(collected, PIECE_TIMEOUT_MS, "Edge TTS synthesis", () => audioStream.destroy());
    if (audio.length === 0) throw new Error("Edge TTS returned no audio.");
    return audio;
  } finally {
    tts.close();
  }
}

export async function generateEdgeSpeech(text: string, voice: string): Promise<Buffer> {
  const pieces = splitText(text, MAX_PIECE_CHARS);
  if (pieces.length === 0) throw new Error("Cannot generate speech for empty text.");
  await assertKnownVoice(voice);

  const buffers: Buffer[] = [];
  for (const [index, piece] of pieces.entries()) {
    try {
      buffers.push(await retryWithBackoff(() => synthesizePiece(piece, voice), ATTEMPTS, BASE_DELAY_MS));
    } catch (error) {
      const where = pieces.length > 1 ? ` (piece ${index + 1} of ${pieces.length})` : "";
      throw new Error(`Edge TTS failed for voice "${voice}"${where}: ${errorMessage(error)}`);
    }
  }
  // The service streams bare MPEG frames (no ID3 header), so pieces can simply be concatenated.
  return Buffer.concat(buffers);
}
