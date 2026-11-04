import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";
import { authEnabled, getCurrentUser } from "@/lib/auth/session";
import { getSupabase } from "@/lib/db";
import { cloudflareConfigured } from "@/lib/imageGen/cloudflare";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { cardClass, pageSubtitleClass, pageTitleClass } from "@/components/ui/button";
import { ApiKeysSection } from "./ApiKeysSection";

export const metadata: Metadata = { title: "Settings" };

async function loadDisplayName(userId: string): Promise<string | null> {
  try {
    const { data } = await getSupabase().from("profiles").select("display_name").eq("id", userId).maybeSingle();
    return (data as { display_name: string | null } | null)?.display_name ?? null;
  } catch {
    return null;
  }
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Per-request: AUTH_ENABLED and the signed-in user must never be baked in at build time.
  await connection();
  const params = await searchParams;
  const onboarding = params.onboarding === "1";
  const enabled = authEnabled();
  const user = await getCurrentUser();
  const displayName = user ? await loadDisplayName(user.id) : null;
  // When the shared free image service is set up, it is used for everyone (UX-15).
  const sharedImages = cloudflareConfigured();

  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pb-16 pt-2 sm:px-6">
      <SpaceBackdrop />
      <div>
        <Link href="/" className="rounded text-sm whitespace-nowrap text-muted-foreground hover:text-neutral-900 dark:hover:text-white">
          <span aria-hidden>←</span> My stories
        </Link>
      </div>
      <header>
        <h1 className={pageTitleClass}>Settings</h1>
        <p className={`mt-1 ${pageSubtitleClass}`}>Your account and the API keys used for your stories.</p>
      </header>

      {onboarding && enabled && (
        <div
          role="status"
          className="rounded-2xl border border-violet-300 bg-violet-50 p-5 text-sm text-violet-950 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-100"
        >
          <p className="font-medium">Welcome{displayName ? `, ${displayName}` : ""}! One quick step before your first story.</p>
          <p className="mt-1">
            Stories are written with your own Gemini API key. Add it below, then you can upload a document.
          </p>
        </div>
      )}

      <ApiKeysSection authEnabled={enabled} onboarding={onboarding} sharedImages={sharedImages} />

      <section aria-labelledby="account-heading" className={`${cardClass} flex flex-col gap-3 p-5 sm:p-6`}>
        <h2 id="account-heading" className="text-section font-semibold">
          Account
        </h2>
        {user ? (
          <dl className="grid grid-cols-1 gap-y-1 text-sm sm:grid-cols-[8rem_1fr] sm:gap-y-2">
            <dt className="text-muted-foreground">Display name</dt>
            <dd className="mb-2 sm:mb-0">{displayName || <span className="text-muted-foreground">Not set</span>}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="break-all">{user.email}</dd>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            {enabled ? "You're not logged in." : "Accounts are turned off on this server, so there's no account to show."}
          </p>
        )}
      </section>

      {/* The form is its own card with its own heading (no card inside a card, UX-22). */}
      {user && <ChangePasswordForm />}
    </main>
  );
}
