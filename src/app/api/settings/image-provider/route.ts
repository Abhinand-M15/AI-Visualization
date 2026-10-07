import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { getImageProviderFor, isImageProvider, setImageProviderFor } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";

/**
 * GET -> { provider: 'gemini' | 'openai' }   ('gemini' with accounts off or before migration 003)
 * PUT { provider } -> { provider }
 */

function errorResponse(error: unknown, label: string) {
  const unauthorized = unauthorizedResponse(error);
  if (unauthorized) return unauthorized;
  console.error(`${label} failed:`, error instanceof Error ? error.message : error);
  return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
}

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ provider: "gemini" });
    return NextResponse.json({ provider: await getImageProviderFor(user.id) });
  } catch (error) {
    return errorResponse(error, "get image provider");
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Accounts are turned off, so images use Gemini." }, { status: 400 });
    }
    const body = (await request.json().catch(() => null)) as { provider?: unknown } | null;
    if (!isImageProvider(body?.provider)) {
      return NextResponse.json({ error: "Unknown image provider." }, { status: 400 });
    }
    await setImageProviderFor(user.id, body.provider);
    await logActivity(user, null, "settings.image_provider_updated", { provider: body.provider });
    return NextResponse.json({ provider: body.provider });
  } catch (error) {
    return errorResponse(error, "save image provider");
  }
}
