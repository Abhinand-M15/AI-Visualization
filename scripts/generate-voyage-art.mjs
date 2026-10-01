// Generates the Voyage template's layered art as small SVGs under public/themes/voyage/.
// Everything is drawn from scratch (no third-party artwork) and is deterministic: the same
// script always writes the same files. Run from the project root:
//   node scripts/generate-voyage-art.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("public/themes/voyage");
mkdirSync(OUT, { recursive: true });

const PALETTES = {
  ember: {
    cloudLight: "#ffb08a", cloudShade: "#c2457a",
    planetLight: "#ffd39a", planetMid: "#e2763f", planetDark: "#6d1f3f",
    band: ["#ffe2b8", "#c2502f", "#9a2f4a", "#f2a65a"],
    accent: "#f28c51", deep: "#3a1030",
  },
  glacier: {
    cloudLight: "#b6f0ff", cloudShade: "#3f86d0",
    planetLight: "#e2f8ff", planetMid: "#5aa8e0", planetDark: "#0f2f63",
    band: ["#e2f8ff", "#7cc4ee", "#3a78b8", "#b6e6ff"],
    accent: "#83efff", deep: "#0a1838",
  },
  meadow: {
    cloudLight: "#e2f8c4", cloudShade: "#3f9a78",
    planetLight: "#ecfbb8", planetMid: "#7fc07a", planetDark: "#18503f",
    band: ["#f2fcd0", "#9ad27e", "#3f9a70", "#c8ee9a"],
    accent: "#a7db8d", deep: "#0c2e28",
  },
};

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => Math.round(n * 10) / 10;
const between = (r, a, b) => a + r() * (b - a);

function write(name, svg) {
  writeFileSync(path.join(OUT, name), svg.replace(/\n\s*/g, "\n").trim() + "\n");
}
const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n${body}\n</svg>`;

function poly(cx, cy, r, n, jitter, r0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 - jitter + r0() * jitter * 2);
    pts.push(`${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)}`);
  }
  return pts.join(" ");
}

// ---------------------------------------------------------------- stars + rocks (shared)
{
  const r = rng(11);
  let body = "";
  for (let i = 0; i < 240; i++) {
    const big = r() < 0.08;
    const rad = big ? between(r, 1.6, 2.6) : between(r, 0.5, 1.4);
    const tint = r() < 0.25 ? "#f7f7b6" : "#ffffff";
    body += `<circle cx="${f(r() * 1600)}" cy="${f(r() * 1000)}" r="${f(rad)}" fill="${tint}" opacity="${f(between(r, 0.3, 0.95))}"/>`;
  }
  write("stars.svg", svg(1600, 1000, body));
}
{
  const r = rng(23);
  let defs = `<radialGradient id="rk" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#8a6f9a"/><stop offset="1" stop-color="#2a1838"/></radialGradient>`;
  let body = "";
  const rocks = [[180, 240, 70], [520, 120, 42], [860, 300, 96], [1180, 160, 52], [1420, 330, 78], [330, 560, 34], [1010, 600, 44], [1500, 640, 30], [660, 700, 58]];
  for (const [x, y, s] of rocks) {
    body += `<polygon points="${poly(x, y, s, 9, 0.28, r)}" fill="url(#rk)" opacity="0.92"/>`;
  }
  write("rocks.svg", svg(1600, 800, `<defs>${defs}</defs>${body}`));
}

// ---------------------------------------------------------------- clouds
function clouds(name, p, seed, { count, rx, ry, yMin, yMax, opacity }) {
  const r = rng(seed);
  const defs =
    `<radialGradient id="l"><stop offset="0" stop-color="${p.cloudLight}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${p.cloudLight}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="s"><stop offset="0" stop-color="${p.cloudShade}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${p.cloudShade}" stop-opacity="0"/></radialGradient>`;
  let body = "";
  for (let i = 0; i < count; i++) {
    const cx = between(r, -100, 1700);
    const cy = between(r, yMin, yMax);
    const w = between(r, rx * 0.6, rx);
    const h = between(r, ry * 0.6, ry);
    body += `<ellipse cx="${f(cx)}" cy="${f(cy + h * 0.25)}" rx="${f(w)}" ry="${f(h)}" fill="url(#s)"/>`;
    body += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(w * 0.9)}" ry="${f(h * 0.8)}" fill="url(#l)"/>`;
  }
  write(name, svg(1600, 900, `<defs>${defs}</defs>${body}`));
}

// ---------------------------------------------------------------- planets
function planetDisc(p, id, r, kind, seed, cx = 500, cy = 500) {
  const rand = rng(seed);
  const defs =
    `<radialGradient id="${id}b" cx="32%" cy="28%" r="85%"><stop offset="0" stop-color="${p.planetLight}"/><stop offset="0.45" stop-color="${p.planetMid}"/><stop offset="1" stop-color="${p.planetDark}"/></radialGradient>` +
    `<radialGradient id="${id}t" cx="30%" cy="26%" r="95%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05020f" stop-opacity="0.65"/></radialGradient>` +
    `<clipPath id="${id}c"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`;
  let body = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}b)"/><g clip-path="url(#${id}c)">`;
  if (kind === "bands") {
    body += `<g transform="rotate(-12 ${cx} ${cy})">`;
    for (let i = 0; i < 11; i++) {
      const y = cy - r + (i / 11) * r * 2 + between(rand, -10, 10);
      const h = between(rand, r * 0.05, r * 0.16);
      const col = p.band[Math.floor(rand() * p.band.length)];
      body += `<rect x="${cx - r - 20}" y="${f(y)}" width="${r * 2 + 40}" height="${f(h)}" fill="${col}" opacity="${f(between(rand, 0.18, 0.4))}"/>`;
    }
    body += `</g><ellipse cx="${f(cx + r * 0.25)}" cy="${f(cy + r * 0.22)}" rx="${f(r * 0.17)}" ry="${f(r * 0.09)}" fill="${p.band[2]}" opacity="0.55" transform="rotate(-12 ${cx} ${cy})"/>`;
  } else if (kind === "craters") {
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * r * 0.92;
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d;
      const cr = between(rand, r * 0.03, r * 0.14);
      body += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(cr)}" fill="${p.planetDark}" opacity="0.28"/>`;
      body += `<circle cx="${f(x - cr * 0.12)}" cy="${f(y - cr * 0.12)}" r="${f(cr * 0.9)}" fill="none" stroke="${p.planetLight}" stroke-width="${f(cr * 0.1)}" opacity="0.3"/>`;
    }
  } else {
    body += `<g transform="rotate(-8 ${cx} ${cy})">`;
    for (let i = 0; i < 7; i++) {
      const y = cy - r + (i / 7) * r * 2 + between(rand, -8, 8);
      const h = between(rand, r * 0.06, r * 0.18);
      body += `<rect x="${cx - r - 20}" y="${f(y)}" width="${r * 2 + 40}" height="${f(h)}" fill="${p.band[Math.floor(rand() * p.band.length)]}" opacity="${f(between(rand, 0.15, 0.32))}"/>`;
    }
    body += `</g>`;
  }
  body += `</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}t)"/>`;
  return { defs, body };
}

function planetBack(name, p, kind, seed, { glow }) {
  // The ringed planet is drawn smaller so its ring still fits inside the 1000x1000 canvas.
  const R = kind === "ring" ? 285 : 380;
  const { defs, body } = planetDisc(p, "p", R, kind, seed);
  let extra = "";
  let extraDefs = "";
  if (glow) {
    extraDefs = `<radialGradient id="h"><stop offset="0.7" stop-color="${p.accent}" stop-opacity="0.35"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></radialGradient>`;
    extra = `<circle cx="500" cy="500" r="490" fill="url(#h)"/>`;
  }
  if (kind === "ring") {
    // Back half of the ring sits behind the disc, the front half in front of it.
    const ring = (clip) => {
      let s = "";
      [[1.62, 0.44, 22, 0.35], [1.47, 0.4, 12, 0.5], [1.34, 0.36, 7, 0.4]].forEach(([k, e, w, o]) => {
        s += `<ellipse cx="500" cy="500" rx="${f(R * k)}" ry="${f(R * k * e)}" fill="none" stroke="${p.band[0]}" stroke-width="${w}" opacity="${o}" transform="rotate(-14 500 500)" clip-path="url(#${clip})"/>`;
      });
      return s;
    };
    const clips =
      `<clipPath id="rb"><rect x="-200" y="-200" width="1400" height="${500 + 200 - 6}" transform="rotate(-14 500 500)"/></clipPath>` +
      `<clipPath id="rf"><rect x="-200" y="494" width="1400" height="700" transform="rotate(-14 500 500)"/></clipPath>`;
    write(name, svg(1000, 1000, `<defs>${extraDefs}${defs}${clips}</defs>${extra}${ring("rb")}${body}${ring("rf")}`));
    return;
  }
  write(name, svg(1000, 1000, `<defs>${extraDefs}${defs}</defs>${extra}${body}`));
}

function planetFloor(name, p, seed) {
  const r = rng(seed);
  const defs =
    `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.planetLight}"/><stop offset="0.12" stop-color="${p.planetMid}"/><stop offset="1" stop-color="${p.planetDark}"/></linearGradient>` +
    `<radialGradient id="a" cx="50%" cy="0%" r="60%"><stop offset="0" stop-color="${p.accent}" stop-opacity="0.45"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></radialGradient>`;
  let body = `<ellipse cx="1000" cy="1240" rx="1790" ry="1000" fill="url(#a)"/><ellipse cx="1000" cy="1260" rx="1700" ry="980" fill="url(#g)"/>`;
  for (let i = 0; i < 22; i++) {
    const x = between(r, 150, 1850);
    const y = between(r, 340, 760);
    const w = between(r, 30, 150);
    body += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w * 0.26)}" fill="${p.planetDark}" opacity="0.3"/>`;
    body += `<ellipse cx="${f(x)}" cy="${f(y - w * 0.03)}" rx="${f(w)}" ry="${f(w * 0.26)}" fill="none" stroke="${p.planetLight}" stroke-width="3" opacity="0.22"/>`;
  }
  write(name, svg(2000, 800, `<defs>${defs}</defs>${body}`));
}

// ---------------------------------------------------------------- props
function prop(name, p, kind, seed) {
  const r = rng(seed);
  let defs = "";
  let body = "";
  if (kind === "rocket") {
    defs =
      `<linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9e4f2"/><stop offset="0.55" stop-color="#ffffff"/><stop offset="1" stop-color="#a79cbd"/></linearGradient>` +
      `<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c0"/><stop offset="0.4" stop-color="${p.accent}"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></linearGradient>`;
    body = `<g transform="rotate(32 300 300)">
<path d="M300 430 C280 470 290 520 300 560 C310 520 320 470 300 430Z" fill="url(#fl)"/>
<path d="M230 330 L170 420 L232 392Z" fill="${p.accent}"/><path d="M370 330 L430 420 L368 392Z" fill="${p.accent}"/>
<path d="M300 50 C385 130 405 260 382 400 L218 400 C195 260 215 130 300 50Z" fill="url(#b)"/>
<path d="M300 50 C333 82 356 118 370 160 L230 160 C244 118 267 82 300 50Z" fill="${p.accent}"/>
<circle cx="300" cy="250" r="44" fill="${p.deep}"/><circle cx="300" cy="250" r="36" fill="${p.planetMid}" opacity="0.85"/><circle cx="288" cy="238" r="10" fill="#fff" opacity="0.55"/>
<rect x="222" y="380" width="156" height="26" rx="6" fill="${p.deep}" opacity="0.55"/></g>`;
  } else if (kind === "satellite") {
    defs =
      `<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f1fa"/><stop offset="1" stop-color="#8f86a8"/></linearGradient>` +
      `<pattern id="pn" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="${p.planetDark}"/><path d="M0 0H26V26" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.7"/></pattern>`;
    body = `<g transform="rotate(-24 300 300)">
<rect x="20" y="245" width="190" height="110" fill="url(#pn)" stroke="${p.accent}" stroke-width="3"/>
<rect x="390" y="245" width="190" height="110" fill="url(#pn)" stroke="${p.accent}" stroke-width="3"/>
<rect x="210" y="296" width="30" height="8" fill="#8f86a8"/><rect x="360" y="296" width="30" height="8" fill="#8f86a8"/>
<rect x="240" y="230" width="120" height="140" rx="18" fill="url(#b)"/>
<rect x="258" y="255" width="84" height="26" rx="6" fill="${p.deep}"/><circle cx="300" cy="330" r="14" fill="${p.accent}"/>
<line x1="300" y1="230" x2="300" y2="170" stroke="#c9c2dc" stroke-width="6"/>
<path d="M248 140 A52 52 0 0 0 352 140Z" fill="url(#b)"/><circle cx="300" cy="130" r="8" fill="${p.accent}"/></g>`;
  } else {
    defs =
      `<radialGradient id="a" cx="32%" cy="28%" r="85%"><stop offset="0" stop-color="${p.planetLight}"/><stop offset="0.5" stop-color="${p.planetMid}"/><stop offset="1" stop-color="${p.planetDark}"/></radialGradient>`;
    const rocks = [[290, 300, 190], [480, 170, 86], [135, 470, 66]];
    for (const [x, y, s] of rocks) {
      body += `<polygon points="${poly(x, y, s, 11, 0.2, r)}" fill="url(#a)"/>`;
      for (let i = 0; i < 4; i++) {
        const cr = between(r, s * 0.08, s * 0.18);
        body += `<circle cx="${f(x + between(r, -s * 0.5, s * 0.5))}" cy="${f(y + between(r, -s * 0.5, s * 0.5))}" r="${f(cr)}" fill="${p.planetDark}" opacity="0.35"/>`;
      }
    }
  }
  write(name, svg(600, 600, `<defs>${defs}</defs>${body}`));
}

// ---------------------------------------------------------------- build the set
const SET = [
  { id: "ember", kind: "bands", prop: "rocket" },
  { id: "glacier", kind: "craters", prop: "satellite" },
  { id: "meadow", kind: "ring", prop: "asteroids" },
];
SET.forEach((s, i) => {
  const p = PALETTES[s.id];
  const base = 100 + i * 40;
  clouds(`${s.id}-cloud-far.svg`, p, base + 1, { count: 16, rx: 420, ry: 120, yMin: 60, yMax: 760, opacity: 0.5 });
  clouds(`${s.id}-cloud-mid.svg`, p, base + 2, { count: 12, rx: 520, ry: 150, yMin: 120, yMax: 820, opacity: 0.6 });
  clouds(`${s.id}-cloud-near.svg`, p, base + 3, { count: 9, rx: 640, ry: 190, yMin: 560, yMax: 960, opacity: 0.75 });
  planetBack(`${s.id}-planet-back.svg`, p, s.kind, base + 4, { glow: false });
  planetBack(`${s.id}-planet-wheel.svg`, p, s.kind, base + 5, { glow: true });
  planetFloor(`${s.id}-planet-floor.svg`, p, base + 6);
  prop(`${s.id}-prop.svg`, p, s.prop, base + 7);
});

console.log(`voyage art written to ${OUT}`);
