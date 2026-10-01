import { NextResponse } from "next/server";
import { listVoices } from "@/lib/tts";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireUser();
    const voices = await listVoices();
    return NextResponse.json({ voices });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("list voices failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
