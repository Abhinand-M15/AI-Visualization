import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { getUserKey, isKeyProvider, testGeminiKey, testOpenAiKey } from "@/lib/userKeys";

/**
 * POST { provider?: 'gemini' | 'openai', key?: string }
 * Tests `key` if given (e.g. before saving it), otherwise the caller's saved
 * key, with one cheap read-only request to that provider. Replies { ok, message }; the
 * key is never echoed back.
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json().catch(() => null)) as { provider?: unknown; key?: unknown } | null;
    const provider = body?.provider ?? "gemini";
    if (!isKeyProvider(provider)) {
      return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
    }

    let key = typeof body?.key === "string" ? body.key.trim() : "";
    if (!key) {
      if (!user) {
        return NextResponse.json({ error: "Enter a key to test." }, { status: 400 });
      }
      key = (await getUserKey(user.id, provider)) ?? "";
      if (!key) {
        return NextResponse.json({ error: "No saved key to test yet." }, { status: 400 });
      }
    }

    return NextResponse.json(provider === "openai" ? await testOpenAiKey(key) : await testGeminiKey(key));
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("test key failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
