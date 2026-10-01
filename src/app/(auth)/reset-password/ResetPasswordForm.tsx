"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/auth/client";
import { friendlyAuthError } from "@/lib/auth/errors";
import { validateNewPassword } from "@/lib/auth/password";
import { PasswordField } from "../_components/PasswordField";
import { AuthCard, AuthUnavailable, Notice, linkClass, primaryButtonClass } from "../_components/ui";

export function ResetPasswordForm({
  unavailableReason,
  hasSession,
  email,
}: {
  unavailableReason: string | null;
  hasSession: boolean;
  email: string | null;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [done, setDone] = useState(false);

  const linkMissing = !unavailableReason && (!hasSession || expired);
  const disabled = Boolean(unavailableReason) || linkMissing || busy;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const problem = validateNewPassword(password, confirm);
    if (problem) return setError(problem);

    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      // Deliberate full navigation (as after login) so the server-rendered
      // layout and user menu pick up the updated session cookie.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.setTimeout(() => window.location.assign("/"), 1800);
    } catch (err) {
      const friendly = friendlyAuthError(err);
      if (friendly.kind === "session_missing") setExpired(true);
      else setError(friendly.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="You're signed in with your new password. Taking you to the app…">
        <Link href="/" className={linkClass}>
          Continue now
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle={email ? `For ${email}. Choose something you haven't used before.` : "Choose a new password for your account."}
      footer={
        <Link href="/login" className={linkClass}>
          Back to log in
        </Link>
      }
    >
      <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {unavailableReason && <AuthUnavailable reason={unavailableReason} />}
        {linkMissing && (
          <Notice tone="error">
            This page only works from the link in your password-reset email, and that link has expired or was already
            used.{" "}
            <Link href="/forgot-password" className={linkClass}>
              Request a new link
            </Link>
          </Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}

        {/* Hidden username helps password managers save the new password against the right account. */}
        {email && <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />}

        <PasswordField
          id="newPassword"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          showStrength
          disabled={disabled}
        />

        <div>
          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            disabled={disabled}
            invalid={passwordsMismatch}
          />
          {passwordsMismatch && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-300">The two passwords don&apos;t match yet.</p>
          )}
        </div>

        <button type="submit" disabled={disabled} className={primaryButtonClass}>
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthCard>
  );
}
