"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * First-run gate for / and /new: when accounts are on and the signed-in user
 * hasn't saved a Gemini key yet, send them to Settings with a friendly
 * onboarding message. Does nothing while accounts are off, or if the status
 * check itself fails (the generate routes still reply 412 missing_api_key).
 */
export function useApiKeyGate() {
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings/keys", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { authEnabled?: boolean; keys?: { provider: string; hasKey: boolean }[] } | null) => {
        if (cancelled || !data?.authEnabled) return;
        const hasGemini = data.keys?.some((k) => k.provider === "gemini" && k.hasKey);
        if (!hasGemini) router.replace("/settings?onboarding=1");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router]);
}
