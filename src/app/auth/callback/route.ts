import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/config";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { authEnabled } from "@/lib/auth/session";

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/**
 * Landing point for every email link (sign-up confirmation, password reset).
 * Handles both link styles Supabase can send:
 *  - PKCE:        /auth/callback?code=...&next=...          (default templates)
 *  - token hash:  /auth/callback?token_hash=...&type=...&next=...  (recommended
 *                 templates; works even if opened in a different browser)
 * On success the session cookie is set and the user is sent to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const type = EMAIL_OTP_TYPES.includes(rawType as EmailOtpType) ? (rawType as EmailOtpType) : null;
  const isRecovery = type === "recovery" || searchParams.get("next")?.startsWith("/reset-password") === true;
  const next = safeNextPath(searchParams.get("next"), isRecovery ? "/reset-password" : "/");

  const fail = (reason: "link_invalid" | "link_expired" | "confirm_failed") => {
    const target = isRecovery ? new URL("/forgot-password", request.url) : new URL("/login", request.url);
    target.searchParams.set("error", isRecovery ? "link_expired" : reason);
    return NextResponse.redirect(target);
  };

  if (!authEnabled()) return NextResponse.redirect(new URL("/", request.url));

  // Supabase puts problems (expired / already-used link) on the query string.
  if (searchParams.get("error") || searchParams.get("error_code")) {
    return fail(isRecovery ? "link_expired" : "link_invalid");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("link_invalid");

  try {
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (error) return fail(isRecovery ? "link_expired" : "link_invalid");
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      // A PKCE link opened in a different browser has no code verifier. For a
      // sign-up link Supabase has already confirmed the email by this point,
      // so the user just needs to log in.
      if (error) return fail(isRecovery ? "link_expired" : "confirm_failed");
    } else {
      return fail("link_invalid");
    }
  } catch {
    return fail("link_invalid");
  }

  return NextResponse.redirect(new URL(next, request.url));
}
