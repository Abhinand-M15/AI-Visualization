const DEFAULT_TTS_SERVER_URL = "http://localhost:5050";

function getConfig() {
  const baseUrl = process.env.TTS_SERVER_URL ?? DEFAULT_TTS_SERVER_URL;
  const apiKey = process.env.TTS_API_KEY;
  if (!apiKey) {
    throw new Error("TTS_API_KEY is not set. Add it to .env.local (see .env.local.example).");
  }
  return { baseUrl, apiKey };
}

export interface TtsVoice {
  name: string;
  language: string;
  gender: string;
}

export async function listVoices(): Promise<TtsVoice[]> {
  const { baseUrl, apiKey } = getConfig();
  const res = await fetch(`${baseUrl}/v1/voices`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`TTS server returned ${res.status} listing voices.`);
  }
  const data = await res.json();
  return data.voices as TtsVoice[];
}

export async function generateSpeech(text: string, voice: string): Promise<Buffer> {
  const { baseUrl, apiKey } = getConfig();
  const res = await fetch(`${baseUrl}/v1/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: text, voice, response_format: "mp3", speed: 1.0 }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`TTS server returned ${res.status} generating audio: ${errText.slice(0, 200)}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
