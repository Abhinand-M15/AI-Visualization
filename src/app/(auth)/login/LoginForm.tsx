"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authCallbackUrl, getSupabaseBrowserClient } from "@/lib/auth/client";
import { friendlyAuthError, type FriendlyAuthError } from "@/lib/auth/errors";
import { PasswordField } from "../_components/PasswordField";
import {
  AuthCard,
  AuthUnavailable,
  Notice,
  TextField,
  linkClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../_components/ui";

export function LoginForm({
  next,
  unavailableReason,
  initialError,
  initialInfo,
  passwordResetEnabled,
}: {
  next: string;
  unavailableReason: string | null;
  initialError: string | null;
  initialInfo: string | null;
  /** AUTH_PASSWORD_RESET=1: show the self-service "Forgot password?" flow. */
  passwordResetEnabled: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FriendlyAuthError | null>(
    initialError ? { kind: "unknown", message: initialError } : null,
  );
  const [resend, setResend] = useState<"idle" | "sending" | "sent">("idle");

  const disabled = Boolean(unavailableReason) || busy;
  const signupHref = next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setResend("idle");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw signInError;
    } catch (err) {
      setError(friendlyAuthError(err));
      setBusy(false);
      return;
    }
    // Full navigation so the server (proxy, layout, user menu) sees the new
    // session cookie straight away. B's /settings gate handles the first-run
    // "add your Gemini key" step.
    window.location.assign(next);
  }

  async function handleResend() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email.trim()) return;
    setResend("sending");
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: authCallbackUrl(next) },
      });
      if (resendError) throw resendError;
      setResend("sent");
    } catch (err) {
      setError(friendlyAuthError(err));
      setResend("idle");
    }
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back. Sign in to continue to your stories."
      footer={
        <>
          New here?{" "}
          <Link href={signupHref} className={linkClass}>
            Create an account
          </Link>
        </>
      }
    >
      {/* A real POST form with name/id + autocomplete so browsers offer to save and fill the password. */}
      <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {unavailableReason && <AuthUnavailable reason={unavailableReason} />}
        {initialInfo && !error && <Notice tone="success">{initialInfo}</Notice>}
        {error && (
          <Notice tone="error">
            <p>{error.message}</p>
            {error.kind === "email_not_confirmed" && (
              <div className="mt-3">
                {resend === "sent" ? (
                  <p className="font-medium">We sent a new confirmation email to {email.trim()}.</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resend === "sending" || !email.trim()}
                    className={secondaryButtonClass}
                  >
                    {resend === "sending" ? "Sending…" : "Resend confirmation email"}
                  </button>
                )}
              </div>
            )}
            {error.kind === "invalid_credentials" && passwordResetEnabled && (
              <p className="mt-2">
                <Link href="/forgot-password" className={linkClass}>
                  Reset your password
                </Link>
              </p>
            )}
          </Notice>
        )}

        <TextField
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={disabled}
          aria-invalid={error?.kind === "invalid_credentials" || undefined}
        />

        <div>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={disabled}
            invalid={error?.kind === "invalid_credentials"}
          />
          {passwordResetEnabled ? (
            <div className="mt-2 text-right text-sm">
              <Link href="/forgot-password" className={linkClass}>
                Forgot password?
              </Link>
            </div>
          ) : (
            <p className="mt-2 text-right text-xs text-neutral-500 dark:text-indigo-200/50">
              Forgot your password? Ask your admin to reset it.
            </p>
          )}
        </div>

        <button type="submit" disabled={disabled || !email || !password} className={primaryButtonClass}>
          {busy ? "Signing in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}
