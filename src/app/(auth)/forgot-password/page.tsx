import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authUnavailableReason, passwordResetEnabled } from "@/lib/auth/availability";
import { CALLBACK_ERROR_MESSAGES } from "@/lib/auth/errors";
import { firstParam, type AuthSearchParams } from "../_components/searchParams";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password · Story Site Generator" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: AuthSearchParams }) {
  // Self-service reset is off unless AUTH_PASSWORD_RESET=1 (no emails are sent).
  if (!passwordResetEnabled()) redirect("/login");
  const params = await searchParams;
  const errorCode = firstParam(params.error);
  return (
    <ForgotPasswordForm
      unavailableReason={authUnavailableReason()}
      initialError={errorCode ? (CALLBACK_ERROR_MESSAGES[errorCode] ?? CALLBACK_ERROR_MESSAGES.link_expired) : null}
    />
  );
}
