import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/proxySession";
import { authEnabled, authMisconfigured } from "@/lib/auth/mode";

/**
 * Request guard (Next 16 renamed `middleware` to `proxy`).
 *
 * Production (NODE_ENV=production or on Vercel) without AUTH_ENABLED=1: every
 * page answers 503. Auth fails closed, so a deploy that lost its env var never
 * serves the app without sign-in (SEC-05). API routes refuse the same way
 * through requireUser().
 * AUTH_ENABLED != 1 in local development: passes every request through untouched.
 * AUTH_ENABLED == 1: refreshes the Supabase session cookie and sends signed-out
 * visitors of app pages to /login?next=<path>. The auth pages and /auth/*
 * handlers stay reachable. API routes are not matched at all (so large upload
 * bodies are never buffered here); they return 401 through requireUser().
 */
export async function proxy(request: NextRequest) {
  if (authMisconfigured()) {
    return new NextResponse(
      "This app is not configured correctly (sign-in is switched off on a production server), so it is refusing requests. Ask your admin.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }
  if (!authEnabled()) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except: API routes, Next internals, static asset folders in
     * public/ and any path that ends in a file extension (public files,
     * favicon.ico, robots.txt, images, audio, ...).
     */
    "/((?!api/|api$|_next/static|_next/image|themes/|videos/|textures/|avatars/|models/|published/|favicon\\.ico|.*\\.[A-Za-z0-9]+$).*)",
  ],
};
