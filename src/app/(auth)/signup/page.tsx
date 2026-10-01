import type { Metadata } from "next";
import { safeNextPath } from "@/lib/auth/config";
import { authUnavailableReason } from "@/lib/auth/availability";
import { firstParam, type AuthSearchParams } from "../_components/searchParams";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Sign up · Story Site Generator" };

export default async function SignupPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  return <SignupForm next={safeNextPath(firstParam(params.next))} unavailableReason={authUnavailableReason()} />;
}
