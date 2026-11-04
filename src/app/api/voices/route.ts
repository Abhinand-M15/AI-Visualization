import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/server/errors";
import { listVoices } from "@/lib/tts";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireUser();
    const voices = await listVoices();
    return NextResponse.json({ voices });
  } catch (error) {
    return apiErrorResponse(error, "list voices");
  }
}
