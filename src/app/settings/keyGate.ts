import { redirect } from "next/navigation";
import { connection } from "next/server";
import { authEnabled, getCurrentUser } from "@/lib/auth/session";
import { getKeyStatus } from "@/lib/userKeys";

/**
 * First-run gate for / and /new, done on the server before anything renders
 * (UX-26): when accounts are on and the signed-in user has no Gemini key yet,
 * redirect to Settings with the onboarding message. Does nothing while
 * accounts are off, when nobody is signed in (the proxy handles that) or if
 * the key lookup fails (the generate routes still answer with a key error).
 */
export async function requireGeminiKeyOrOnboard(): Promise<void> {
  if (!authEnabled()) return;
  await connection();
  const user = await getCurrentUser();
  if (!user) return;
  let hasGemini = true;
  try {
    const keys = await getKeyStatus(user.id);
    hasGemini = keys.some((key) => key.provider === "gemini" && key.hasKey);
  } catch {
    return;
  }
  if (!hasGemini) redirect("/settings?onboarding=1");
}
