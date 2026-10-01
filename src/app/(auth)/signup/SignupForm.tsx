"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authCallbackUrl, getSupabaseBrowserClient } from "@/lib/auth/client";
import { friendlyAuthError } from "@/lib/auth/errors";
import { validateNewPassword } from "@/lib/auth/password";
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** First stop after sign-up: Settings, where the user adds their Gemini key (agent B's page). */
const ONBOARDING_PATH = "/settings?onboarding=1";

export function SignupForm({ next, unavailableReason }: { next: string; unavailableReason: string | null }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resend, setResend] = useState<"idle" | "sending" | "sent">("idle");

  const disabled = Boolean(unavailableReason) || busy;
  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const name = displayName.trim();
    const address = email.trim();
    if (!name) return setError("Please enter a display name.");
    if (!EMAIL_PATTERN.test(address)) return setError("Please enter a valid email address.");
    const passwordProblem = validateNewPassword(password, confirm);
    if (passwordProblem) return setError(passwordProblem);

    setBusy(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: address,
        password,
        options: {
          data: { display_name: name },
          emailRedirectTo: authCallbackUrl(next),
        },
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        // "Confirm email" is off in Supabase, so the user is already signed in.
        // Full page load (lets the browser offer to save the password and the
        // server see the new cookie) straight to the Gemini-key onboarding step.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(ONBOARDING_PATH);
        return;
      }
      // Fallback: confirmation is on, so no session until the email link is opened.
      setSentTo(address);
    } catch (err) {
      setError(friendlyAuthError(err).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !sentTo) return;
    setResend("sending");
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: sentTo,
        options: { emailRedirectTo: authCallbackUrl(next) },
      });
      if (resendError) throw resendError;
      setResend("sent");
    } catch (err) {
      setError(friendlyAuthError(err).message);
      setResend("idle");
    }
  }

  if (sentTo) {
    return (
      <AuthCard
        title="Check your email"
        subtitle={
          <>
            We sent a confirmation link to <span className="font-medium text-neutral-800 dark:text-white">{sentTo}</span>.
            Open it to activate your account, then log in.
          </>
        }
        footer={
          <Link href={loginHref} className={linkClass}>
            Back to log in
          </Link>
        }
      >
        <div className="flex flex-col gap-4">
          <Notice tone="info">
            Didn&apos;t get it? Check your spam folder. If you already have an account with this email, log in
            instead.
          </Notice>
          {error && <Notice tone="error">{error}</Notice>}
          {resend === "sent" ? (
            <Notice tone="success">A new confirmation email is on its way.</Notice>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resend === "sending"}
              className={`${secondaryButtonClass} self-start`}
            >
              {resend === "sending" ? "Sending…" : "Resend confirmation email"}
            </button>
          )}
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Your email is your username. We'll send a link to confirm it."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className={linkClass}>
            Log in
          </Link>
        </>
      }
    >
      {/* A real POST form with name/id + autocomplete so browsers offer to save the new password. */}
      <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {unavailableReason && <AuthUnavailable reason={unavailableReason} />}
        {error && <Notice tone="error">{error}</Notice>}

        <TextField
          id="displayName"
          label="Display name"
          type="text"
          autoComplete="name"
          maxLength={80}
          required
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          disabled={disabled}
          hint="Shown in the app. You can use your full name or a nickname."
        />

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
        />

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          showStrength
          disabled={disabled}
        />

        <div>
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
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
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
