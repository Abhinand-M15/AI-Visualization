import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";

const VIDEO_BUCKET = "chunk-video";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; chunkId: string }> }
) {
  try {
    const user = await requireUser();
    const { id, chunkId } = await context.params;
    const supabase = getSupabase();

    if (user) {
      const { data: owned, error: ownedError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", id)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (ownedError) throw new Error(ownedError.message);
      if (!owned) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const path = `${id}/${chunkId}.mp4`;
    const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      return NextResponse.json({ error: "Video not found for this chunk." }, { status: 404 });
    }

    return NextResponse.redirect(data.publicUrl);
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("get chunk video failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
