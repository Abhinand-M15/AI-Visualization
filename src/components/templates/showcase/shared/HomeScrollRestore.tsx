"use client";

import { useLayoutEffect } from "react";
import { arriveHome } from "./projectTransition";

/**
 * After the chapter page's Back button: put the home page back where the user
 * left it, then let the transition land the picture on its tile.
 */
export function HomeScrollRestore() {
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem("sc-home-restore") === "1") {
        sessionStorage.removeItem("sc-home-restore");
        const y = Number(sessionStorage.getItem("sc-home-scroll"));
        if (Number.isFinite(y) && y > 0) window.scrollTo(0, y);
      }
    } catch {
      // storage unavailable: stay at the top
    }
    arriveHome();
  }, []);
  return null;
}
