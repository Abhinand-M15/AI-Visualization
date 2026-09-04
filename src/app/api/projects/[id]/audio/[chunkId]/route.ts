import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";

const AUDIO_BUCKET = "chunk-audio";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; chunkId: string }> }
) {
  try {
    const { id, chunkId } = await context.params;
    const path = `${id}/${chunkId}.mp3`;

    const { data } = getSupabase().storage.from(AUDIO_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      return NextResponse.json({ error: "Audio not found for this chunk." }, { status: 404 });
    }

    return NextResponse.redirect(data.publicUrl);
  } catch (error) {
    console.error("get chunk audio failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
