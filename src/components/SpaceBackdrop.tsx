"use client";

import { useTheme } from "@/components/ThemeProvider";
import { LIGHT_NEBULA_LAYER, LIGHT_STARS_LAYER, NEBULA_LAYER, STARS_LAYER } from "@/lib/spaceTheme";

/**
 * Fixed, full-viewport background — sits behind page content so the theme
 * (dark or light nebula + drifting sparkles) fills the whole screen
 * regardless of how narrow the content column above it is.
 */
export function SpaceBackdrop() {
  const { theme } = useTheme();

  if (theme === "light") {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden" style={LIGHT_NEBULA_LAYER}>
        <div
          className="orb orb-a"
          style={{ top: "-8%", left: "6%", width: 340, height: 340, background: "#8b5cf6", opacity: 0.45 }}
        />
        <div
          className="orb orb-b"
          style={{ top: "-4%", right: "8%", width: 300, height: 300, background: "#22d3ee", opacity: 0.4 }}
        />
        <div
          className="orb orb-c"
          style={{ bottom: "-12%", left: "38%", width: 360, height: 360, background: "#ec4899", opacity: 0.35 }}
        />
        <div className="stars-layer absolute inset-0" style={LIGHT_STARS_LAYER} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10" style={NEBULA_LAYER}>
      <div className="stars-layer absolute inset-0" style={STARS_LAYER} />
    </div>
  );
}
