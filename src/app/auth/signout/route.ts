import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { authEnabled } from "@/lib/auth/session";

/**
 * POST /auth/signout: ends the Supabase session (clears the auth cookies) and
 * sends the user to the login page. POST-only so a link or prefetch can never
 * sign someone out; 303 turns the form POST into a GET of /login.
 */
export async function POST(request: NextRequest) {
  if (authEnabled()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Cookies are cleared locally even if the revoke call fails.
      }
    }
  }
  const target = new URL(authEnabled() ? "/login?message=signed_out" : "/", request.url);
  return NextResponse.redirect(target, { status: 303 });
}
