import type { CSSProperties } from "react";

/** Soft nebula glow — stays still, only the star layer drifts. */
export const NEBULA_LAYER: CSSProperties = {
  backgroundColor: "#040308",
  backgroundImage: [
    "radial-gradient(ellipse 1100px 700px at 12% -10%, rgba(139,92,246,0.35), transparent 60%)",
    "radial-gradient(ellipse 900px 600px at 90% 0%, rgba(34,211,238,0.18), transparent 55%)",
    "radial-gradient(ellipse 1000px 800px at 50% 120%, rgba(99,102,241,0.22), transparent 60%)",
  ].join(","),
  backgroundRepeat: "no-repeat, no-repeat, no-repeat",
};

/** Scattered star dots, tiled — animated via the `.stars-layer` class (globals.css). */
export const STARS_LAYER: CSSProperties = {
  backgroundImage: [
    "radial-gradient(1.5px 1.5px at 10% 15%, #fff, transparent)",
    "radial-gradient(1px 1px at 25% 55%, #fff, transparent)",
    "radial-gradient(1.5px 1.5px at 40% 20%, #fff, transparent)",
    "radial-gradient(1px 1px at 55% 70%, #fff, transparent)",
    "radial-gradient(1.5px 1.5px at 70% 35%, #fff, transparent)",
    "radial-gradient(1px 1px at 85% 60%, #fff, transparent)",
    "radial-gradient(1.5px 1.5px at 95% 15%, #fff, transparent)",
    "radial-gradient(1px 1px at 15% 85%, #fff, transparent)",
    "radial-gradient(1px 1px at 65% 90%, #fff, transparent)",
    "radial-gradient(1.5px 1.5px at 30% 40%, #fff, transparent)",
  ].join(","),
  backgroundRepeat: "repeat",
  backgroundSize: "220px 220px, 260px 260px, 300px 300px, 240px 240px, 280px 280px, 320px 320px, 260px 260px, 300px 300px, 240px 240px, 280px 280px",
};

/** "Daytime nebula" glow for light theme — bold pastel washes on a lavender-
 *  tinted base, strong enough to read clearly (not just a near-white page). */
export const LIGHT_NEBULA_LAYER: CSSProperties = {
  backgroundColor: "#f1effb",
  backgroundImage: [
    "radial-gradient(ellipse 1200px 750px at 12% -10%, rgba(139,92,246,0.30), transparent 62%)",
    "radial-gradient(ellipse 950px 650px at 92% 0%, rgba(34,211,238,0.24), transparent 58%)",
    "radial-gradient(ellipse 1050px 820px at 50% 115%, rgba(236,72,153,0.20), transparent 62%)",
  ].join(","),
  backgroundRepeat: "no-repeat, no-repeat, no-repeat",
};

/** Colorful sparkle dots for light theme — same drift animation as STARS_LAYER,
 *  bigger and more saturated than the first pass so they're clearly visible. */
export const LIGHT_STARS_LAYER: CSSProperties = {
  backgroundImage: [
    "radial-gradient(3px 3px at 10% 15%, rgba(124,58,237,0.85), transparent)",
    "radial-gradient(2.5px 2.5px at 25% 55%, rgba(99,102,241,0.7), transparent)",
    "radial-gradient(3px 3px at 40% 20%, rgba(236,72,153,0.75), transparent)",
    "radial-gradient(2.5px 2.5px at 55% 70%, rgba(99,102,241,0.65), transparent)",
    "radial-gradient(3px 3px at 70% 35%, rgba(6,182,212,0.8), transparent)",
    "radial-gradient(2.5px 2.5px at 85% 60%, rgba(124,58,237,0.7), transparent)",
    "radial-gradient(3px 3px at 95% 15%, rgba(139,92,246,0.75), transparent)",
    "radial-gradient(2.5px 2.5px at 15% 85%, rgba(99,102,241,0.65), transparent)",
    "radial-gradient(2.5px 2.5px at 65% 90%, rgba(6,182,212,0.7), transparent)",
    "radial-gradient(3px 3px at 30% 40%, rgba(236,72,153,0.65), transparent)",
  ].join(","),
  backgroundRepeat: "repeat",
  backgroundSize: "200px 200px, 240px 240px, 280px 280px, 220px 220px, 260px 260px, 300px 300px, 240px 240px, 280px 280px, 220px 220px, 260px 260px",
};
