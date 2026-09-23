import type { CSSProperties } from "react";

/** A meteor's position + timing, expressed as the CSS custom properties
 *  `.meteor` (globals.css) reads to drive `meteor-fall`. */
export interface MeteorConfig {
  top: string;
  left: string;
  angle: number;
  duration: string;
  delay: string;
}

/** An asteroid's start position (just off one edge of the viewport), the
 *  distance it travels to exit off the far edge, and its spin — expressed as
 *  the CSS custom properties `.asteroid` (globals.css) reads to drive
 *  `asteroid-drift`. `top`/`left` are viewport-relative percentages and
 *  `dx`/`dy` are vw/vh-based CSS length strings (not raw px) so the crossing
 *  always spans the *entire* viewport — edge to opposite edge — regardless
 *  of screen size, instead of a small fixed-pixel wobble. */
export interface AsteroidConfig {
  top: string;
  left: string;
  size: number;
  dx: string;
  dy: string;
  spin: number;
  duration: string;
  delay: string;
}

/** Sparse, staggered so they never all streak at once — long, varied
 *  durations/delays keep it "a lot happening" without being distracting. */
export const METEORS: MeteorConfig[] = [
  { top: "8%", left: "78%", angle: -35, duration: "9s", delay: "0s" },
  { top: "18%", left: "15%", angle: -30, duration: "13s", delay: "3s" },
  { top: "4%", left: "48%", angle: -40, duration: "11s", delay: "6.5s" },
  { top: "30%", left: "92%", angle: -35, duration: "16s", delay: "2s" },
  { top: "12%", left: "35%", angle: -28, duration: "14s", delay: "9s" },
  { top: "22%", left: "62%", angle: -38, duration: "10s", delay: "5s" },
];

export const LIGHT_METEORS: MeteorConfig[] = METEORS;

/** Small rocky specks, each starting just off one edge of the viewport and
 *  travelling in a straight line all the way through to the far edge (see
 *  `AsteroidConfig`) — a mix of horizontal, vertical, and diagonal crossings
 *  starting from different sides so it doesn't read as one repeating path. */
export const ASTEROIDS: AsteroidConfig[] = [
  { top: "12%", left: "-8%", size: 5, dx: "122vw", dy: "18vh", spin: 190, duration: "38s", delay: "0s" },
  { top: "70%", left: "108%", size: 7, dx: "-122vw", dy: "-22vh", spin: -160, duration: "46s", delay: "5s" },
  { top: "-8%", left: "25%", size: 4, dx: "12vw", dy: "122vh", spin: 210, duration: "42s", delay: "10s" },
  { top: "108%", left: "75%", size: 6, dx: "-14vw", dy: "-122vh", spin: -200, duration: "50s", delay: "3s" },
  { top: "-8%", left: "-8%", size: 3, dx: "125vw", dy: "125vh", spin: 170, duration: "44s", delay: "16s" },
  { top: "-8%", left: "108%", size: 5, dx: "-125vw", dy: "125vh", spin: -180, duration: "40s", delay: "8s" },
  { top: "108%", left: "-8%", size: 4, dx: "125vw", dy: "-125vh", spin: 220, duration: "48s", delay: "20s" },
  { top: "45%", left: "-8%", size: 6, dx: "122vw", dy: "-15vh", spin: -190, duration: "36s", delay: "13s" },
];

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

/** Scattered star dots, tiled — animated via the `.stars-layer` class (globals.css).
 *  Each stop is a bright white core with a soft glowing halo (rather than a
 *  hard-edged dot) so stars read as brighter/more visible against the dark
 *  nebula, not just bigger. */
export const STARS_LAYER: CSSProperties = {
  backgroundImage: [
    "radial-gradient(2.5px 2.5px at 10% 15%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
    "radial-gradient(2px 2px at 25% 55%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
    "radial-gradient(2.5px 2.5px at 40% 20%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
    "radial-gradient(2px 2px at 55% 70%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
    "radial-gradient(2.5px 2.5px at 70% 35%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
    "radial-gradient(2px 2px at 85% 60%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
    "radial-gradient(2.5px 2.5px at 95% 15%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
    "radial-gradient(2px 2px at 15% 85%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
    "radial-gradient(2px 2px at 65% 90%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
    "radial-gradient(2.5px 2.5px at 30% 40%, #fff, rgba(255,255,255,0.7) 55%, transparent 75%)",
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
