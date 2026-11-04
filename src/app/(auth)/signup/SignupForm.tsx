"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { SignupStatus } from "@/lib/auth/availability";
import { validateNewPassword } from "@/lib/auth/password";
import { ApiError, errorMessage, requestJson } from "@/components/apiError";
import { PasswordField } from "../_components/PasswordField";
import { AuthCard, AuthUnavailable, Notice, TextField, linkClass, primaryButtonClass } from "../_components/ui";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** First stop after sign-up: Settings, where the user adds their Gemini key. */
const ONBOARDING_PATH = "/settings?onboarding=1";

interface SignupReply {
  ok: boolean;
  signedIn: boolean;
  next?: string;
}

/**
 * Sign-up through the app's own route (POST /api/auth/signup), which checks
 * the allow-list and creates the account without any confirmation email, then
 * signs the user in. When sign-up is closed (invite only, accounts off) the
 * form says so instead of offering fields that can't work.
 */
export function SignupForm({
  next,
  unavailableReason,
  status,
}: {
  next: string;
  unavailableReason: string | null;
  status: SignupStatus;
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const closed = !status.open;
  const disabled = Boolean(unavailableReason) || closed || busy;
  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;
  const domainHint = status.allowedDomains?.length
    ? `Use your ${status.allowedDomains.map((domain) => `@${domain}`).join(" or ")} email address.`
    : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    const name = displayName.trim();
    const address = email.trim();
    if (!name) return setError({ message: "Please enter a display name." });
    if (!EMAIL_PATTERN.test(address)) return setError({ message: "Please enter a valid email address." });
    const passwordProblem = validateNewPassword(password, confirm);
    if (passwordProblem) return setError({ message: passwordProblem });

    setBusy(true);
    setError(null);
    try {
      const reply = await requestJson<SignupReply>(
        "/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: address, password, displayName: name }),
        },
        "Your account couldn't be created. Try again."
      );
      if (reply.signedIn) {
        // Full page load so the server (proxy, layout, account menu) sees the new session,
        // straight to the Gemini-key onboarding step.
        window.location.assign(reply.next && reply.next.startsWith("/") ? reply.next : ONBOARDING_PATH);
        return;
      }
      // Account made, but the automatic log-in didn't happen: log in by hand.
      const params = new URLSearchParams({ message: "account_created" });
      if (next !== "/") params.set("next", next);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full load, like the signed-in path
      window.location.assign(`/login?${params}`);
    } catch (err) {
      setError({ message: errorMessage(err, "Your account couldn't be created. Try again."), code: err instanceof ApiError ? err.code : undefined });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle={closed ? undefined : "Your email is your username."}
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
      <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {unavailableReason ? (
          <AuthUnavailable reason={unavailableReason} />
        ) : (
          closed && <AuthUnavailable reason={status.message ?? "New sign-ups are turned off. Ask your admin to add you."} />
        )}
        {error && (
          <Notice tone="error">
            <p>{error.message}</p>
            {error.code === "user_exists" && (
              <p className="mt-2">
                <Link href={loginHref} className={linkClass}>
                  Log in instead
                </Link>
              </p>
            )}
          </Notice>
        )}

        {!closed && (
          <>
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
              aria-invalid={error?.code === "email_not_allowed" || error?.code === "invalid_email" || undefined}
              hint={domainHint}
            />

            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              showStrength
              disabled={disabled}
              invalid={error?.code === "weak_password"}
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
                <p className="mt-2 text-xs text-red-700 dark:text-red-300">The two passwords don&apos;t match yet.</p>
              )}
            </div>

            <button type="submit" disabled={disabled} className={primaryButtonClass}>
              {busy ? "Creating account…" : "Create account"}
            </button>
          </>
        )}
      </form>
    </AuthCard>
  );
}
