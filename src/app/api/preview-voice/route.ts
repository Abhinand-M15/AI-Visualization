import { NextResponse } from "next/server";
import { generateSpeech } from "@/lib/tts";
import { requireUser } from "@/lib/auth/session";
import { apiErrorResponse, toProviderError } from "@/lib/server/errors";
import { requireQuota } from "@/lib/server/quota";

const SAMPLE_TEXT = "Hi, this is WarpDrive bot.";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json().catch(() => null)) as { voice?: unknown } | null;
    if (typeof body?.voice !== "string" || !body.voice || body.voice.length > 200) {
      return NextResponse.json({ error: "Body must include 'voice'.", code: "bad_request" }, { status: 400 });
    }

    // Per-user rate limit on the shared TTS endpoint (SEC-11).
    await requireQuota(user, "voice_preview");
    let audioBuffer: Buffer;
    try {
      audioBuffer = await generateSpeech(SAMPLE_TEXT, body.voice);
    } catch (error) {
      console.error("preview-voice: tts failed:", error);
      throw toProviderError(error, "tts");
    }
    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    return apiErrorResponse(error, "preview-voice");
  }
}
