import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";

const VIDEO_BUCKET = "chunk-video";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; chunkId: string }> }
) {
  try {
    const { id, chunkId } = await context.params;
    const path = `${id}/${chunkId}.mp4`;

    const { data } = getSupabase().storage.from(VIDEO_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      return NextResponse.json({ error: "Video not found for this chunk." }, { status: 404 });
    }

    return NextResponse.redirect(data.publicUrl);
  } catch (error) {
    console.error("get chunk video failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
