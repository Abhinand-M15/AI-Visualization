/**
 * The narration "dock": the one pause/play button plus the auto-scroll switch,
 * fixed at the bottom-right of every template. One stylesheet, one set of icon
 * paths and one markup builder, shared by the in-app preview
 * (components/ui/NarrationMasterControl.tsx) and the published static sites
 * (publish/staticSite.ts, publish/voyageSite.ts), so the two can't drift apart.
 * Pure strings only — safe to import from client and server code.
 */

export type NarrationDockVariant = "light" | "dark" | "voyage";

export interface NarrationDockTheme {
  variant: NarrationDockVariant;
  /** Icon badge, switch track and hover/focus colour. Voyage ignores it and uses --vg-accent. */
  accent?: string;
  /** Border colour of the glass pills (dark variant). */
  border?: string;
}

/** Per-template looks: dark glass for the space-like templates, light for the case-study layout,
 *  chamfered accent for Voyage. Used by the preview components and the published pages alike. */
export const NARRATION_DOCK_THEMES = {
  light: { variant: "light" },
  space: { variant: "dark", accent: "#fff", border: "rgba(255,255,255,.18)" },
  airlock: { variant: "dark", accent: "#fff", border: "rgba(255,255,255,.18)" },
  lunar: { variant: "dark", accent: "#67e8f9", border: "rgba(103,232,249,.3)" },
  voyage: { variant: "voyage" },
} as const satisfies Record<string, NarrationDockTheme>;

export type NarrationDockThemeId = keyof typeof NARRATION_DOCK_THEMES;

/** localStorage key for the auto-scroll switch ("0" = off; anything else/absent = on). */
export const AUTOSCROLL_STORAGE_KEY = "story-autoscroll";

/** Inner SVG of the two glyphs; the CSS shows one of them per data-paused state. */
export const NARRATION_DOCK_ICONS = `<svg class="i-pause" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="3.4" height="12" rx="1"/><rect x="9.6" y="2" width="3.4" height="12" rx="1"/></svg><svg class="i-play" viewBox="0 0 16 16" fill="currentColor"><path d="M4.6 2.7c0-.8.9-1.3 1.6-.9l7 4.6c.6.4.6 1.3 0 1.7l-7 4.6c-.7.4-1.6-.1-1.6-.9z"/></svg>`;

export const NARRATION_DOCK_CSS = `
.nd-dock{--nd-accent:#171717;--nd-on-accent:#fff;--nd-fg:#171717;--nd-bg:rgba(255,255,255,.9);--nd-border:rgba(0,0,0,.12);--nd-shadow:0 6px 24px rgba(0,0,0,.14);position:fixed;right:16px;bottom:16px;bottom:max(16px,env(safe-area-inset-bottom));z-index:40;display:flex;align-items:center;gap:8px;font-family:inherit;font-size:13px;line-height:1;color:var(--nd-fg);-webkit-font-smoothing:antialiased}
.nd-dock.nd-gated{display:none}
.nd-dock *{box-sizing:border-box}
.nd-dock button{font:inherit;color:inherit;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.nd-pause,.nd-auto{display:inline-flex;align-items:center;gap:8px;height:40px;border:1px solid var(--nd-border);border-radius:999px;background:var(--nd-bg);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:var(--nd-shadow);font-weight:600;white-space:nowrap;transition:transform .18s cubic-bezier(.3,.7,.4,1),background .2s,border-color .2s,color .2s,box-shadow .2s}
.nd-pause{padding:0 16px 0 6px}
.nd-auto{padding:0 14px 0 11px}
.nd-pause:hover,.nd-auto:hover{transform:translateY(-1px);border-color:var(--nd-accent)}
.nd-pause:active,.nd-auto:active{transform:scale(.96)}
.nd-pause:focus-visible,.nd-auto:focus-visible{outline:2px solid var(--nd-accent);outline-offset:3px}
.nd-icon{display:grid;place-items:center;flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--nd-accent);color:var(--nd-on-accent);transition:transform .2s cubic-bezier(.3,.7,.4,1),background .2s,color .2s}
.nd-pause:hover .nd-icon{transform:scale(1.08)}
.nd-icon svg{display:block;width:14px;height:14px}
.nd-icon .i-play{display:none;margin-left:1px}
.nd-dock[data-paused=true] .i-pause{display:none}
.nd-dock[data-paused=true] .i-play{display:block}
.nd-track{position:relative;flex-shrink:0;width:28px;height:16px;border-radius:999px;background:rgba(127,127,127,.45);transition:background .2s}
.nd-thumb{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:transform .2s cubic-bezier(.3,.7,.4,1),background .2s}
.nd-auto[aria-checked=true] .nd-track{background:var(--nd-accent)}
.nd-auto[aria-checked=true] .nd-thumb{transform:translateX(12px);background:var(--nd-on-accent)}

.nd-dark{--nd-accent:#fff;--nd-on-accent:#05070d;--nd-fg:#fff;--nd-bg:rgba(10,12,20,.72);--nd-border:rgba(255,255,255,.18);--nd-shadow:0 6px 28px rgba(0,0,0,.5)}

.nd-voyage{--nd-accent:var(--vg-accent,#F28C51);--nd-on-accent:#0a0614;--nd-fg:#fff;--nd-bg:rgba(10,6,20,.6);--nd-shadow:none;gap:6px}
.nd-voyage .nd-pause,.nd-voyage .nd-auto{border-radius:0;border-color:var(--nd-accent);font-size:12px;letter-spacing:.1em;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));box-shadow:none}
.nd-voyage .nd-pause{padding:0 18px 0 12px}
.nd-voyage .nd-auto{padding:0 16px 0 12px}
.nd-voyage .nd-pause:hover,.nd-voyage .nd-auto:hover{transform:none;background:var(--nd-accent);color:var(--nd-on-accent)}
.nd-voyage .nd-pause:focus-visible,.nd-voyage .nd-auto:focus-visible{outline:2px solid #fff;outline-offset:-5px}
.nd-voyage .nd-icon{width:16px;height:16px;border-radius:0;background:none;color:var(--nd-accent)}
.nd-voyage .nd-icon svg{width:14px;height:14px}
.nd-voyage .nd-pause:hover .nd-icon{transform:none;color:var(--nd-on-accent)}
.nd-voyage .nd-track{border-radius:0;background:rgba(255,255,255,.22)}
.nd-voyage .nd-thumb{border-radius:0}
.nd-voyage .nd-auto:hover .nd-track{background:rgba(10,6,20,.35)}
.nd-voyage .nd-auto[aria-checked=true] .nd-track{background:var(--nd-accent)}
.nd-voyage .nd-auto[aria-checked=true]:hover .nd-track{background:var(--nd-on-accent)}
.nd-voyage .nd-auto[aria-checked=true]:hover .nd-thumb{background:var(--nd-accent)}
@media(max-width:360px){.nd-voyage .nd-label{display:none}.nd-voyage .nd-pause{padding:0 12px}}
@media(prefers-reduced-motion:reduce){.nd-pause,.nd-auto,.nd-icon,.nd-track,.nd-thumb{transition:none}}
`;

/** Inline custom properties for a theme's accent/border, e.g. for a style="" attribute. */
export function narrationDockStyleVars(theme: NarrationDockTheme): string {
  const parts: string[] = [];
  if (theme.variant !== "voyage" && theme.accent) parts.push(`--nd-accent:${theme.accent}`);
  if (theme.variant === "dark" && theme.border) parts.push(`--nd-border:${theme.border}`);
  return parts.join(";");
}

/** The dock's HTML for the published sites. Starts hidden (`nd-gated`) and is
 *  revealed by NARRATION_DOCK_JS once the visitor has answered the start gate. */
export function narrationDockMarkup(theme: NarrationDockTheme): string {
  const vars = narrationDockStyleVars(theme);
  return `<div id="narration-dock" class="nd-dock nd-${theme.variant} nd-gated" data-paused="false"${vars ? ` style="${vars}"` : ""}>
  <button type="button" id="narration-toggle" class="nd-pause" aria-label="Pause narration"><span class="nd-icon" aria-hidden="true">${NARRATION_DOCK_ICONS}</span><span class="nd-label">Pause</span></button>
  <button type="button" id="autoscroll-toggle" class="nd-auto" role="switch" aria-checked="true"><span class="nd-track" aria-hidden="true"><span class="nd-thumb"></span></span><span>Auto-scroll</span></button>
</div>`;
}

/**
 * Client script shared by every published template: the dock's state (pause
 * label/icon, auto-scroll switch persisted in localStorage) and the smooth
 * scroll used to advance to the next section. No backticks or template
 * placeholders inside — it is embedded verbatim in a template literal. Needs
 * gsap (for the tween) to be loaded first. Everything is prefixed `nd` so it
 * can sit in the global scope beside a template's own variables.
 */
export const NARRATION_DOCK_JS = `
var ndDock = document.getElementById('narration-dock');
var ndPause = document.getElementById('narration-toggle');
var ndAuto = document.getElementById('autoscroll-toggle');
var ndAutoOn = true;
try { if (window.localStorage.getItem('${AUTOSCROLL_STORAGE_KEY}') === '0') ndAutoOn = false; } catch (e) {}
var ndTween = null;
var ndSnapRestore = null;

function ndSync(paused) {
  if (ndDock) ndDock.setAttribute('data-paused', paused ? 'true' : 'false');
  if (ndPause) {
    ndPause.setAttribute('aria-label', paused ? 'Play narration' : 'Pause narration');
    var label = ndPause.querySelector('.nd-label');
    if (label) label.textContent = paused ? 'Play' : 'Pause';
  }
  if (ndAuto) ndAuto.setAttribute('aria-checked', ndAutoOn ? 'true' : 'false');
}
function ndShow() { if (ndDock) ndDock.classList.remove('nd-gated'); }
if (ndAuto) {
  ndAuto.addEventListener('click', function() {
    ndAutoOn = !ndAutoOn;
    try { window.localStorage.setItem('${AUTOSCROLL_STORAGE_KEY}', ndAutoOn ? '1' : '0'); } catch (e) {}
    ndAuto.setAttribute('aria-checked', ndAutoOn ? 'true' : 'false');
  });
}

// Scroll position that brings a section into view: its top, or centred when it
// is shorter than the viewport (so a short card does not leave its neighbour
// under the viewport centre, which is where the scroll triggers fire).
function ndSectionTarget(el) {
  var rect = el.getBoundingClientRect();
  var top = rect.top + window.pageYOffset;
  var vh = window.innerHeight;
  var y = rect.height < vh ? top - (vh - rect.height) / 2 : top;
  return Math.max(0, Math.min(y, document.documentElement.scrollHeight - vh));
}
function ndStopScroll() {
  if (ndTween) { ndTween.kill(); ndTween = null; }
  if (ndSnapRestore) { ndSnapRestore(); ndSnapRestore = null; }
}
// Smooth ease-in-out scroll (about a second). A gsap tween rather than
// scrollTo({behavior:'smooth'}): the duration is predictable and it never
// fights scroll-snap, which is switched off while the tween runs.
function ndScrollTo(y) {
  ndStopScroll();
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || Math.abs(y - window.pageYOffset) < 2) { window.scrollTo(0, y); return; }
  var root = document.documentElement;
  var prevSnap = root.style.scrollSnapType;
  root.style.scrollSnapType = 'none';
  ndSnapRestore = function() { root.style.scrollSnapType = prevSnap; };
  var proxy = { y: window.pageYOffset };
  ndTween = gsap.to(proxy, {
    y: y, duration: 1, ease: 'power2.inOut',
    onUpdate: function() { window.scrollTo(0, proxy.y); },
    onComplete: function() { ndTween = null; if (ndSnapRestore) { ndSnapRestore(); ndSnapRestore = null; } }
  });
}
// The reader taking over cancels the automatic scroll.
['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function(type) {
  window.addEventListener(type, ndStopScroll, { passive: true });
});
`;
