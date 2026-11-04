import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getUserKey, isKeyProvider, testGeminiKey, testOpenAiKey } from "@/lib/userKeys";
import { apiErrorResponse } from "@/lib/server/errors";
import { requireQuota } from "@/lib/server/quota";

/**
 * POST { provider?: 'gemini' | 'openai', key?: string }
 * Tests `key` if given (the key being typed in Settings, before saving it), otherwise the
 * caller's saved key, with one cheap read-only request to that provider. Replies { ok, message };
 * the key is never echoed back. Signed-in users only when accounts are on, and rate-limited
 * per user so the endpoint cannot be used to check stolen keys in bulk (SEC-16).
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json().catch(() => null)) as { provider?: unknown; key?: unknown } | null;
    const provider = body?.provider ?? "gemini";
    if (!isKeyProvider(provider)) {
      return NextResponse.json({ error: "Unknown provider.", code: "bad_request" }, { status: 400 });
    }

    let key = typeof body?.key === "string" ? body.key.trim() : "";
    if (key && (key.length < 20 || key.length > 256 || /\s/.test(key))) {
      return NextResponse.json({ ok: false, message: "That doesn't look like a valid API key." });
    }
    if (!key) {
      if (!user) {
        return NextResponse.json({ error: "Enter a key to test.", code: "bad_request" }, { status: 400 });
      }
      key = (await getUserKey(user.id, provider)) ?? "";
      if (!key) {
        return NextResponse.json({ error: "No saved key to test yet.", code: "bad_request" }, { status: 400 });
      }
    }

    await requireQuota(user, "key_test");
    return NextResponse.json(provider === "openai" ? await testOpenAiKey(key) : await testGeminiKey(key));
  } catch (error) {
    return apiErrorResponse(error, "test key");
  }
}
