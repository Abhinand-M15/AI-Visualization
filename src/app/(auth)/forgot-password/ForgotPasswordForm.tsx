"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authCallbackUrl, getSupabaseBrowserClient } from "@/lib/auth/client";
import { friendlyAuthError } from "@/lib/auth/errors";
import { AuthCard, AuthUnavailable, Notice, TextField, linkClass, primaryButtonClass } from "../_components/ui";

const NEUTRAL_MESSAGE =
  "If an account exists for that email, we've sent a link to reset your password. It can take a minute to arrive; check your spam folder too.";

export function ForgotPasswordForm({
  unavailableReason,
  initialError,
}: {
  unavailableReason: string | null;
  initialError: string | null;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const disabled = Boolean(unavailableReason) || busy;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: authCallbackUrl("/reset-password"),
      });
      // Only rate limiting / network problems are surfaced. Anything else
      // (including "no such user") gets the same neutral message, so this
      // form never reveals whether an email has an account.
      if (resetError) {
        const friendly = friendlyAuthError(resetError);
        if (friendly.kind === "rate_limited" || friendly.kind === "network") {
          setError(friendly.message);
          return;
        }
      }
      setSent(true);
    } catch (err) {
      const friendly = friendlyAuthError(err);
      if (friendly.kind === "rate_limited" || friendly.kind === "network") setError(friendly.message);
      else setSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter the email you signed up with and we'll send you a link to set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className={linkClass}>
            Back to log in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="flex flex-col gap-4">
          <Notice tone="success">{NEUTRAL_MESSAGE}</Notice>
          <button
            type="button"
            onClick={() => setSent(false)}
            className={`${linkClass} self-start text-sm`}
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5">
          {unavailableReason && <AuthUnavailable reason={unavailableReason} />}
          {error && <Notice tone="error">{error}</Notice>}
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
          <button type="submit" disabled={disabled || !email.trim()} className={primaryButtonClass}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
