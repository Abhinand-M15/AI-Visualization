import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { serverAuthConfig } from "@/lib/auth/config";

/**
 * Supabase client bound to the current request's cookies, for Server
 * Components, Route Handlers and Server Functions. Create one per request.
 * Returns null when the anon key / URL are not configured.
 *
 * Server Components cannot write cookies; there the write is skipped and the
 * proxy (src/proxy.ts) is responsible for keeping the session cookie fresh.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const config = serverAuthConfig();
  if (!config) return null;
  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: cookies are read-only there.
        }
      },
    },
  });
}
