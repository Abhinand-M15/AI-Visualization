import type { Metadata } from "next";
import { connection } from "next/server";
import { safeNextPath } from "@/lib/auth/config";
import { authUnavailableReason, signupStatus } from "@/lib/auth/availability";
import { firstParam, type AuthSearchParams } from "../_components/searchParams";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: { searchParams: AuthSearchParams }) {
  // Per request: whether sign-up is open depends on server settings (same answer as GET /api/auth/signup).
  await connection();
  const params = await searchParams;
  return (
    <SignupForm
      next={safeNextPath(firstParam(params.next))}
      unavailableReason={authUnavailableReason()}
      status={signupStatus()}
    />
  );
}
