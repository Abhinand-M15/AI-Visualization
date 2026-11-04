import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { assertSameOrigin } from "@/lib/auth/session";
import { signupStatus } from "@/lib/auth/availability";
import { isEmailAllowed, normalizeEmail } from "@/lib/auth/signupPolicy";
import { validateNewPassword } from "@/lib/auth/password";
import { apiErrorResponse, HttpError } from "@/lib/server/errors";

/**
 * Server-side sign-up with an allow-list (SEC-10). The browser never calls
 * Supabase's public sign-up; turn "Allow new users to sign up" OFF in the
 * Supabase dashboard so the allow-list cannot be skipped.
 *
 * GET  -> SignupStatus { open, reason?, message?, allowedDomains? }
 * POST { email, password, displayName }
 *      -> 201 { ok: true, signedIn: boolean, next: "/settings?onboarding=1" }
 *         (a session cookie is set when signedIn is true)
 *      -> 4xx { error, code } with code one of: signup_closed, email_not_allowed,
 *         invalid_email, weak_password, user_exists, bad_request
 */

const ONBOARDING_PATH = "/settings?onboarding=1";
const MAX_DISPLAY_NAME = 80;

export async function GET() {
  return NextResponse.json(signupStatus(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    await assertSameOrigin();
    const status = signupStatus();
    if (!status.open) {
      throw new HttpError(403, "signup_closed", status.message ?? "New sign-ups are turned off.");
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const email = normalizeEmail(body?.email);
    if (!email) throw new HttpError(400, "invalid_email", "Please enter a valid email address.");
    if (!isEmailAllowed(email)) {
      throw new HttpError(
        403,
        "email_not_allowed",
        status.allowedDomains?.length
          ? `Sign up with your ${status.allowedDomains.map((domain) => `@${domain}`).join(" or ")} email address.`
          : "This email address can't be used to sign up. Ask your admin to add you."
      );
    }
    const password = typeof body?.password === "string" ? body.password : "";
    if (password.length > 128) throw new HttpError(400, "weak_password", "Use a password of at most 128 characters.");
    const passwordProblem = validateNewPassword(password, password);
    if (passwordProblem) throw new HttpError(400, "weak_password", passwordProblem);
    const displayName = typeof body?.displayName === "string" ? body.displayName.trim().slice(0, MAX_DISPLAY_NAME) : "";
    if (!displayName) throw new HttpError(400, "bad_request", "Please enter a display name.");

    // The admin API works even with public sign-ups switched off in Supabase.
    // email_confirm: no email is sent (email is not set up); the allow-list is the gate.
    const { error: createError } = await getSupabase().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (createError) {
      const code = (createError as { code?: string }).code ?? "";
      if (code === "email_exists" || code === "user_already_exists" || /already (been )?registered|already exists/i.test(createError.message)) {
        throw new HttpError(409, "user_exists", "An account with this email already exists. Try logging in instead.");
      }
      if (code === "weak_password") throw new HttpError(400, "weak_password", "That password is too weak. Use a longer one.");
      throw new Error(`createUser failed: ${createError.message}`);
    }

    // Sign the new user in, so the session cookie rides on this response.
    let signedIn = false;
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) console.error("sign-up: account created but sign-in failed:", signInError.message);
      else signedIn = true;
    }
    return NextResponse.json({ ok: true, signedIn, next: ONBOARDING_PATH }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "sign-up");
  }
}
