import type { Metadata } from "next";
import { safeNextPath } from "@/lib/auth/config";
import { authUnavailableReason, passwordResetEnabled } from "@/lib/auth/availability";
import { CALLBACK_ERROR_MESSAGES } from "@/lib/auth/errors";
import { firstParam, type AuthSearchParams } from "../_components/searchParams";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

const INFO_MESSAGES: Record<string, string> = {
  signed_out: "You've been signed out.",
  password_updated: "Your password was updated. Log in with your new password.",
  account_created: "Your account is ready. Log in with the email and password you just chose.",
};

export default async function LoginPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  const errorCode = firstParam(params.error);
  const messageCode = firstParam(params.message);

  return (
    <LoginForm
      next={safeNextPath(firstParam(params.next))}
      unavailableReason={authUnavailableReason()}
      initialError={errorCode ? (CALLBACK_ERROR_MESSAGES[errorCode] ?? CALLBACK_ERROR_MESSAGES.link_invalid) : null}
      initialInfo={messageCode ? (INFO_MESSAGES[messageCode] ?? null) : null}
      passwordResetEnabled={passwordResetEnabled()}
    />
  );
}
