import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ROUTE_PREFIX, PUBLIC_AUTH_PATHS, safeNextPath, serverAuthConfig } from "@/lib/auth/config";

/**
 * Proxy-side session handling (only called when AUTH_ENABLED=1):
 *  1. refreshes the Supabase session cookie (token rotation) on every page request,
 *  2. sends signed-out visitors of app pages to /login?next=<path>,
 *  3. sends signed-in visitors of /login and /signup back into the app.
 * API routes are excluded by the proxy matcher; they answer 401 via requireUser().
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const isAuthPage = (PUBLIC_AUTH_PATHS as readonly string[]).includes(pathname);
  const isAuthRoute = pathname.startsWith(AUTH_ROUTE_PREFIX);

  const config = serverAuthConfig();
  if (!config) {
    // Auth is switched on but not configured: let the auth pages explain,
    // and keep everything else behind the login page.
    if (isAuthPage || isAuthRoute) return NextResponse.next();
    return redirectToLogin(request, pathname + search);
  }

  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Mirror the refreshed cookies onto the request (for the page render)
        // and onto the response (for the browser).
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        cacheHeaders = { ...cacheHeaders, ...headers };
      },
    },
  });

  // Must run before anything else: validates the JWT with Supabase and
  // triggers the refresh that calls setAll above.
  let userId: string | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  let result: NextResponse = response;
  if (!userId && !isAuthPage && !isAuthRoute) {
    // Keep cookie writes (e.g. a stale session being cleared) on the redirect.
    result = redirectPreservingCookies(response, loginUrl(request, pathname + search));
  } else if (userId && (pathname === "/login" || pathname === "/signup")) {
    result = redirectPreservingCookies(
      response,
      new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url),
    );
  }

  for (const [key, value] of Object.entries(cacheHeaders)) result.headers.set(key, value);
  return result;
}

function loginUrl(request: NextRequest, next: string): URL {
  const url = new URL("/login", request.url);
  if (next && next !== "/") url.searchParams.set("next", next);
  return url;
}

function redirectToLogin(request: NextRequest, next: string): NextResponse {
  return NextResponse.redirect(loginUrl(request, next));
}

/** A redirect that keeps any Set-Cookie headers the session refresh produced. */
function redirectPreservingCookies(from: NextResponse, to: URL): NextResponse {
  const redirect = NextResponse.redirect(to);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}
