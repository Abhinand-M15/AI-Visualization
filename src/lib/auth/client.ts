"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicAuthConfig } from "@/lib/auth/config";

let browserClient: SupabaseClient | null = null;

/**
 * Supabase client for Client Components (sign in, sign up, reset password).
 * Stores the session in cookies so the server and the proxy can read it.
 * Returns null when NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are missing, so the auth pages can show a friendly message instead of crashing.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient) return browserClient;
  const config = publicAuthConfig();
  if (!config) return null;
  browserClient = createBrowserClient(config.url, config.anonKey);
  return browserClient;
}

/** Absolute URL of the auth callback, used for email links. */
export function authCallbackUrl(next: string): string {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
