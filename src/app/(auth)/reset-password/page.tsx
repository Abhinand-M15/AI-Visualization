import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authUnavailableReason, passwordResetEnabled } from "@/lib/auth/availability";
import { getCurrentUser } from "@/lib/auth/session";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Set a new password · Story Site Generator" };

export default async function ResetPasswordPage() {
  // Only reachable from a reset email, which is only sent when AUTH_PASSWORD_RESET=1.
  // Signed-in users change their password in Settings (ChangePasswordForm) instead.
  if (!passwordResetEnabled()) redirect("/login");
  const unavailableReason = authUnavailableReason();
  // The reset link goes through /auth/callback, which signs the user in with
  // a short-lived recovery session. Without it there is nothing to update.
  const user = unavailableReason ? null : await getCurrentUser();
  return (
    <ResetPasswordForm
      unavailableReason={unavailableReason}
      hasSession={Boolean(user)}
      email={user?.email ?? null}
    />
  );
}
