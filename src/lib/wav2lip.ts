const DEFAULT_WAV2LIP_SERVER_URL = "http://localhost:5060";

function getConfig() {
  const baseUrl = process.env.WAV2LIP_SERVER_URL ?? DEFAULT_WAV2LIP_SERVER_URL;
  const apiKey = process.env.WAV2LIP_API_KEY;
  if (!apiKey) {
    throw new Error("WAV2LIP_API_KEY is not set. Add it to .env.local (see .env.local.example).");
  }
  return { baseUrl, apiKey };
}

/**
 * Calls the local Wav2Lip inference service to render a lip-synced avatar
 * video: it fetches `sourceVideoUrl` itself and dubs `audioBuffer` onto it,
 * returning the resulting mp4 bytes. Mirrors tts.ts's shape (same config
 * pattern, same Bearer-auth'd local HTTP call) — audio is sent as base64 in
 * a JSON body rather than multipart, matching tts.ts's simplicity.
 */
export async function generateLipsyncVideo(sourceVideoUrl: string, audioBuffer: Buffer): Promise<Buffer> {
  const { baseUrl, apiKey } = getConfig();
  const res = await fetch(`${baseUrl}/v1/lipsync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_url: sourceVideoUrl,
      audio_base64: audioBuffer.toString("base64"),
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Wav2Lip server returned ${res.status} generating video: ${errText.slice(0, 200)}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
