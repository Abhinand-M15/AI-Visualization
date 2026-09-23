"use client";

import type { CSSProperties } from "react";
import { useTheme } from "@/components/ThemeProvider";
import {
  ASTEROIDS,
  LIGHT_METEORS,
  LIGHT_NEBULA_LAYER,
  LIGHT_STARS_LAYER,
  METEORS,
  NEBULA_LAYER,
  STARS_LAYER,
  type AsteroidConfig,
  type MeteorConfig,
} from "@/lib/spaceTheme";

function Meteors({ meteors, color }: { meteors: MeteorConfig[]; color: string }) {
  return meteors.map((m, i) => (
    <div
      key={i}
      className="meteor"
      style={
        {
          top: m.top,
          left: m.left,
          background: `linear-gradient(90deg, transparent, ${color})`,
          "--meteor-angle": `${m.angle}deg`,
          "--meteor-duration": m.duration,
          "--meteor-delay": m.delay,
        } as CSSProperties
      }
    />
  ));
}

function Asteroids({
  asteroids,
  background,
  glow,
}: {
  asteroids: AsteroidConfig[];
  background: string;
  glow: string;
}) {
  return asteroids.map((a, i) => (
    <div
      key={i}
      className="asteroid"
      style={
        {
          top: a.top,
          left: a.left,
          width: a.size,
          height: a.size,
          background,
          boxShadow: `0 0 ${a.size * 2.5}px ${glow}`,
          "--asteroid-dx": a.dx,
          "--asteroid-dy": a.dy,
          "--asteroid-spin": `${a.spin}deg`,
          "--asteroid-duration": a.duration,
          "--asteroid-delay": a.delay,
        } as CSSProperties
      }
    />
  ));
}

/**
 * Fixed, full-viewport background — sits behind page content so the theme
 * (dark or light nebula + drifting sparkles, plus sparse shooting stars and
 * slow-tumbling asteroids) fills the whole screen regardless of how narrow
 * the content column above it is. Meteors/asteroids are deliberately kept
 * low-opacity and slow so they read as ambient texture, not a distraction.
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
        <Meteors meteors={LIGHT_METEORS} color="rgba(124,58,237,0.55)" />
        <Asteroids
          asteroids={ASTEROIDS}
          background="radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), rgba(139,92,246,0.35) 55%, rgba(99,102,241,0.3) 100%)"
          glow="rgba(139,92,246,0.55)"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={NEBULA_LAYER}>
      <div className="stars-layer absolute inset-0" style={STARS_LAYER} />
      <Meteors meteors={METEORS} color="rgba(255,255,255,0.95)" />
      <Asteroids
        asteroids={ASTEROIDS}
        background="radial-gradient(circle at 35% 30%, #fff, rgba(210,200,190,0.85) 45%, rgba(150,140,130,0.75) 100%)"
        glow="rgba(220,225,255,0.85)"
      />
    </div>
  );
}
