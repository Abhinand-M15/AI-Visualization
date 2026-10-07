/**
 * Template-level CSS for Showcase: the design tokens, the tile <-> chapter page
 * transition rules and a few helpers. Shared by the in-app preview
 * (ShowcaseApp injects it in a <style>) and the published static page
 * (publish/showcaseSite.ts inlines it), so the two can't drift apart. The
 * Tailwind utility classes the components use are generated separately; for the
 * published page `npm run build:showcase` bakes them into showcase.css.
 */
export const SHOWCASE_CSS = `
.sc-root {
  --sc-off-white: #f0f1fa;
  --sc-dark-white: #e4e6ef;
  --sc-black: #000;
  --sc-blue: #1a2ffb;
  --sc-dark-blue: #071bdf;
  --sc-grey-blue: #2b2e3a;
  --sc-green: #c1ff00;
  --sc-red: #ff4c41;
  --sc-purple: #8832f7;
  --sc-radius: 20px;
  --sc-grid-gap: 2vw;
  --sc-pad-x: max(5vw, 40px);
  --sc-pad-y: clamp(30px, 4vw, 50px);
  --sc-header-size: clamp(1rem, 1vw, 2rem);
  --sc-cross-size: clamp(0.875rem, 1vw, 2rem);
  font-family: var(--sc-font-sans), ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* chapter tile <-> chapter page: words and neighbouring tiles leave, page content arrives */
.fw-head,
.fw-foot {
  transition: opacity 0.7s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.fw-main {
  transition: opacity 0.8s ease, transform 1s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease;
}
html.pt-leaving .fw-head,
html.pt-leaving .fw-foot {
  opacity: 0;
  transform: translate3d(-4vw, -28px, 0);
}
html.pt-leaving .fw-row[data-col="0"]:not([data-pt-active]) .fw-main {
  opacity: 0;
  transform: translate3d(-9vw, 0, 0) scale(0.96);
  filter: blur(4px);
}
html.pt-leaving .fw-row[data-col="1"]:not([data-pt-active]) .fw-main {
  opacity: 0;
  transform: translate3d(9vw, 0, 0) scale(0.96);
  filter: blur(4px);
}
/* arriving from a tile: hold the page content until the picture lands */
.pd-fx {
  transition: opacity 1s ease var(--pd-d, 0s), transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) var(--pd-d, 0s);
}
.pd-fade {
  transition: opacity 1s ease var(--pd-d, 0s);
}
html[data-pt-hold] .pd-fx {
  opacity: 0;
  transform: translate3d(0, 32px, 0);
}
html[data-pt-hold] .pd-fade {
  opacity: 0;
}
/* arriving on the grid from Back: keep the tiles static under the overlay */
html[data-pt-back] .fw-row,
html[data-pt-back] .fw-media {
  transition: none !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: inset(0 round 15px) !important;
}

/* menu links scale with the number of chapters */
.sc-menu-link { font-size: var(--sc-menu-size, 4vw); }
@media (max-width: 767px) {
  .sc-menu-link { font-size: var(--sc-menu-size-m, 8vw); }
}

/* narration text: words light up as the audio plays */
.sc-text[data-audio] .sc-word { opacity: 0.45; transition: opacity 0.3s ease; }
.sc-text[data-audio] .sc-word.on { opacity: 1; }

/* the shared narration dock, dressed like the template's pills */
.sc-root .nd-dock {
  --nd-accent: #c1ff00;
  --nd-on-accent: #05060d;
  --nd-fg: #f0f1fa;
  --nd-bg: #2b2e3a;
  --nd-border: transparent;
  --nd-shadow: 0 6px 24px rgba(5, 6, 13, 0.28);
  font-family: var(--sc-font-sans), ui-sans-serif, system-ui, sans-serif;
}
.sc-root .nd-pause,
.sc-root .nd-auto {
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  height: 3.2em;
  font-size: 0.8125rem;
}
.sc-root .nd-pause:hover,
.sc-root .nd-auto:hover {
  background: #1a2ffb;
  border-color: #1a2ffb;
  transform: none;
}
.sc-root .nd-track { background: rgba(240, 241, 250, 0.3); }
.sc-root .nd-auto:hover .nd-track { background: rgba(240, 241, 250, 0.4); }
.sc-root .nd-auto[aria-checked=true] .nd-thumb { background: var(--nd-on-accent); }
.sc-root .nd-dock { z-index: 60; }

@media (prefers-reduced-motion: reduce) {
  .fw-head, .fw-foot, .fw-main, .pd-fx, .pd-fade { transition: none; }
  .sc-text[data-audio] .sc-word { transition: none; }
}
`;
