import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireGeminiKeyOrOnboard } from "@/app/settings/keyGate";

export const metadata: Metadata = { title: "New story" };

/** Server-side first-run gate (no flash of the upload form before the redirect to Settings). */
export default async function NewStoryLayout({ children }: { children: ReactNode }) {
  await requireGeminiKeyOrOnboard();
  return children;
}
