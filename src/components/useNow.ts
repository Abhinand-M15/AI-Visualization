"use client";

import { useEffect, useState } from "react";

/** The current time, refreshed every `intervalMs` (for "seems stuck" checks without calling Date.now() in render). */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}
