"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PasswordField } from "@/app/(auth)/_components/PasswordField";
import { Notice, primaryButtonClass } from "@/app/(auth)/_components/ui";
import { getSupabaseBrowserClient } from "@/lib/auth/client";
import { publicAuthConfig } from "@/lib/auth/config";
import { friendlyAuthError } from "@/lib/auth/errors";
import { validateNewPassword } from "@/lib/auth/password";

type LoadState = { status: "loading" } | { status: "unavailable" } | { status: "ready"; email: string };

/**
 * "Change password" card for Settings. Verifies the current password by
 * signing in with it, then sets the new one with updateUser(). Uses a real
 * POST form with a hidden username field and current-/new-password
 * autocomplete so browsers update the saved password.
 *
 * Self-contained: reads the signed-in user's email from the browser session,
 * so it can be dropped in with `<ChangePasswordForm />`. Shows a short note
 * instead when nobody is signed in (e.g. AUTH_ENABLED is off).
 */
export function ChangePasswordForm() {
  // Env config is inlined at build time, so server and client agree on this.
  const [load, setLoad] = useState<LoadState>(() =>
    publicAuthConfig() ? { status: "loading" } : { status: "unavailable" },
  );
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [wrongCurrent, setWrongCurrent] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (cancelled) return;
        const email = data.user?.email;
        setLoad(email ? { status: "ready", email } : { status: "unavailable" });
      })
      .catch(() => {
        if (!cancelled) setLoad({ status: "unavailable" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const email = load.status === "ready" ? load.email : null;
  const disabled = !email || busy;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email) return;
    setError(null);
    setSuccess(false);
    setWrongCurrent(false);

    if (!current) return setError("Enter your current password.");
    const problem = validateNewPassword(password, confirm);
    if (problem) return setError(problem);
    if (password === current) return setError("Your new password must be different from your current one.");

    setBusy(true);
    try {
      // 1. Prove the user knows the current password.
      const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: current });
      if (verifyError) {
        const friendly = friendlyAuthError(verifyError);
        if (friendly.kind === "invalid_credentials") {
          setWrongCurrent(true);
          setError("Your current password isn't right. Check it and try again.");
        } else {
          setError(friendly.message);
        }
        return;
      }
      // 2. Set the new one.
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setCurrent("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(friendlyAuthError(err).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="change-password-heading"
      className="flex flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_60px_rgba(99,102,241,0.08)] dark:backdrop-blur-sm"
    >
      <div>
        <h2 id="change-password-heading" className="text-xl font-semibold tracking-tight">
          Change password
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-indigo-200/70">
          Enter your current password, then choose a new one.
        </p>
      </div>

      {load.status === "unavailable" && (
        <Notice tone="info">Sign in to change your password. (Accounts may be switched off for this app.)</Notice>
      )}

      <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {success && <Notice tone="success">Your password has been changed.</Notice>}
        {error && <Notice tone="error">{error}</Notice>}

        {/* Tells the browser's password manager which account this password belongs to. */}
        <input
          type="email"
          name="username"
          autoComplete="username"
          value={email ?? ""}
          readOnly
          hidden
        />

        <PasswordField
          id="currentPassword"
          label="Current password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          disabled={disabled}
          invalid={wrongCurrent}
        />

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
            id="confirmNewPassword"
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

        <button type="submit" disabled={disabled} className={`${primaryButtonClass} sm:w-auto sm:self-start`}>
          {busy ? "Saving…" : "Change password"}
        </button>
      </form>
    </section>
  );
}
