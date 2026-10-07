import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { deleteUserKey, getKeyStatus, isKeyProvider, saveUserKey } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";

/**
 * GET    -> { authEnabled, keys: KeyStatus[] }   (never the key itself)
 * PUT    { provider: 'gemini' | 'openai', key }           -> { key: KeyStatus }
 * DELETE ?provider=gemini|openai                     -> { ok: true }
 *
 * With accounts off there is nobody to store a key for: GET reports
 * authEnabled:false and the server keeps using GEMINI_API_KEY from the env.
 */

const ACCOUNTS_OFF = "Accounts are turned off, so the server uses GEMINI_API_KEY from its environment.";

function errorResponse(error: unknown, label: string) {
  const unauthorized = unauthorizedResponse(error);
  if (unauthorized) return unauthorized;
  console.error(`${label} failed:`, error instanceof Error ? error.message : error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unexpected error" },
    { status: 500 }
  );
}

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ authEnabled: false, keys: [] });
    return NextResponse.json({ authEnabled: true, keys: await getKeyStatus(user.id) });
  } catch (error) {
    return errorResponse(error, "get key status");
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: ACCOUNTS_OFF }, { status: 400 });

    const body = (await request.json().catch(() => null)) as { provider?: unknown; key?: unknown } | null;
    const provider = body?.provider ?? "gemini";
    if (!isKeyProvider(provider)) {
      return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
    }
    const key = typeof body?.key === "string" ? body.key.trim() : "";
    if (key.length < 20 || key.length > 256 || /\s/.test(key)) {
      return NextResponse.json({ error: "That doesn't look like a valid API key." }, { status: 400 });
    }

    const status = await saveUserKey(user.id, provider, key);
    await logActivity(user, null, "keys.updated", { provider, hint: status.hint });
    return NextResponse.json({ key: status });
  } catch (error) {
    return errorResponse(error, "save key");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: ACCOUNTS_OFF }, { status: 400 });

    const provider = new URL(request.url).searchParams.get("provider") ?? "gemini";
    if (!isKeyProvider(provider)) {
      return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
    }
    await deleteUserKey(user.id, provider);
    await logActivity(user, null, "keys.deleted", { provider });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "delete key");
  }
}
