import Link from "next/link";
import { connection } from "next/server";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";
import { authEnabled, getCurrentUser } from "@/lib/auth/session";
import { getSupabase } from "@/lib/db";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ApiKeysSection } from "./ApiKeysSection";

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

  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <SpaceBackdrop />
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-neutral-500">Your account and the API keys used for your stories.</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-white/10"
        >
          Back to stories
        </Link>
      </header>

      {onboarding && enabled && (
        <div className="rounded-xl border border-violet-300 bg-violet-50 p-5 text-sm text-violet-900 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-100">
          <p className="font-medium">Welcome{displayName ? `, ${displayName}` : ""}! One quick step before your first story.</p>
          <p className="mt-1">
            Stories are written with your own Gemini API key. Add it below, then you can upload a document.
          </p>
        </div>
      )}

      <ApiKeysSection authEnabled={enabled} onboarding={onboarding} />

      <section className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-white/[0.03] dark:backdrop-blur-sm">
        <h2 className="text-lg font-semibold">Account</h2>
        {user ? (
          <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
            <dt className="text-neutral-500">Display name</dt>
            <dd>{displayName || <span className="text-neutral-400">Not set</span>}</dd>
            <dt className="text-neutral-500">Email</dt>
            <dd className="break-all">{user.email}</dd>
          </dl>
        ) : (
          <p className="text-sm text-neutral-500">
            {enabled
              ? "You're not signed in."
              : "Accounts are turned off on this server, so there's no account to show."}
          </p>
        )}
      </section>

      {user && (
        <section className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-white/[0.03] dark:backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Change password</h2>
          <ChangePasswordForm />
        </section>
      )}
    </main>
  );
}
