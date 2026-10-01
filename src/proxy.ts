import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/proxySession";

/**
 * Request guard (Next 16 renamed `middleware` to `proxy`).
 *
 * AUTH_ENABLED != 1: passes every request through untouched (today's behaviour).
 * AUTH_ENABLED == 1: refreshes the Supabase session cookie and sends signed-out
 * visitors of app pages to /login?next=<path>. The auth pages and /auth/*
 * handlers stay reachable. API routes are not matched at all (so large upload
 * bodies are never buffered here); they return 401 through requireUser().
 */
export async function proxy(request: NextRequest) {
  if (process.env.AUTH_ENABLED !== "1") return NextResponse.next();
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
