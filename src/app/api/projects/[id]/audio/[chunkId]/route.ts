import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { apiErrorResponse } from "@/lib/server/errors";
import { chunkAudioPath, isValidChunkId, isValidProjectId } from "@/lib/server/ids";

const AUDIO_BUCKET = "chunk-audio";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; chunkId: string }> }
) {
  try {
    const user = await requireUser();
    const { id, chunkId } = await context.params;
    if (!isValidProjectId(id) || !isValidChunkId(chunkId)) {
      return NextResponse.json({ error: "Not found.", code: "not_found" }, { status: 404 });
    }
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

    const path = chunkAudioPath(id, chunkId);
    const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      return NextResponse.json({ error: "Audio not found for this chunk." }, { status: 404 });
    }

    return NextResponse.redirect(data.publicUrl);
  } catch (error) {
    return apiErrorResponse(error, "get chunk audio");
  }
}
