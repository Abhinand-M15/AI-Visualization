import { NextResponse } from "next/server";
import { generateSpeech } from "@/lib/tts";

const SAMPLE_TEXT = "Hi, this is WarpDrive bot.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.voice !== "string" || !body.voice) {
      return NextResponse.json({ error: "Body must include 'voice'." }, { status: 400 });
    }

    const audioBuffer = await generateSpeech(SAMPLE_TEXT, body.voice);
    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("preview-voice failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
