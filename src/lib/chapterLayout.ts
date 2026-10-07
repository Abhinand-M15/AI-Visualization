import { voyageBullets, voyagePullQuote } from "@/lib/voyage";

/**
 * The shared chapter layout: a chapter's images stack vertically as large
 * rounded pictures that ease in on scroll (reveal, zoom, slight 3D tilt, soft
 * blur), with a text panel beside them (sticky on desktop): the narration, a
 * pill button and two small uppercase-labelled lists. Normal vertical scroll
 * only.
 *
 * One source for both render paths. The React previews use ChapterLayout.tsx
 * and the static published pages use chapterLayoutHtml(); both take the same
 * CSS (CHAPTER_LAYOUT_CSS) and run the same behaviour (initChapterLayout), so
 * they cannot drift apart. Each template passes its own ChapterTheme tokens and
 * keeps its identity (background, fonts, music, narration dock, avatars).
 * Framework-free: no React, no DOM access at import time.
 */

/** Colours a template hands to the layout. Any CSS colour string. */
export interface ChapterTheme {
  /** Heading and spoken-text colour. */
  text: string;
  /** Labels, list items and other secondary text. */
  muted: string;
  /** Pill dot, list-label colour. */
  accent: string;
  panelBg: string;
  panelBorder: string;
  /** Behind a picture while it loads and behind avatar slots. */
  mediaBg: string;
  pillBg: string;
  pillText: string;
  /** Hairline between the lists and the text. */
  rule: string;
  /** Picture drop shadow. */
  shadow?: string;
}

/** Most pictures one chapter shows: scene image, then the avatar. */
export const CHAPTER_MEDIA_MAX = 3;

/** Each template's tokens, used by its React preview and its static page alike. The case-study layout reuses these by theme (its light look is `light`). */
export const CHAPTER_THEMES = {
  light: {
    text: "#171717",
    muted: "#525252",
    accent: "#737373",
    panelBg: "#fafafa",
    panelBorder: "#e5e5e5",
    mediaBg: "#f5f5f5",
    pillBg: "#171717",
    pillText: "#ffffff",
    rule: "#e5e5e5",
    shadow: "0 24px 60px rgba(0,0,0,.14)",
  },
  space: {
    text: "#f2f4f8",
    muted: "rgba(255,255,255,.62)",
    accent: "#ffffff",
    panelBg: "rgba(0,0,0,.4)",
    panelBorder: "rgba(255,255,255,.15)",
    mediaBg: "rgba(255,255,255,.05)",
    pillBg: "#ffffff",
    pillText: "#0a0a0a",
    rule: "rgba(255,255,255,.15)",
    shadow: "0 24px 60px rgba(0,0,0,.5)",
  },
  lunar: {
    text: "#f2f4f8",
    muted: "rgba(255,255,255,.62)",
    accent: "#67e8f9",
    panelBg: "rgba(0,0,0,.4)",
    panelBorder: "rgba(103,232,249,.2)",
    mediaBg: "rgba(255,255,255,.05)",
    pillBg: "#67e8f9",
    pillText: "#0a0a0a",
    rule: "rgba(103,232,249,.2)",
    shadow: "0 24px 60px rgba(0,0,0,.5)",
  },
  airlock: {
    text: "#f2f4f8",
    muted: "rgba(255,255,255,.62)",
    accent: "#ffffff",
    panelBg: "rgba(0,0,0,.4)",
    panelBorder: "rgba(255,255,255,.15)",
    mediaBg: "rgba(255,255,255,.05)",
    pillBg: "#ffffff",
    pillText: "#0a0a0a",
    rule: "rgba(255,255,255,.15)",
    shadow: "0 24px 60px rgba(0,0,0,.5)",
  },
  /** Accent/glass follow each chapter's Voyage palette through the page's own custom properties. */
  voyage: {
    text: "#ffffff",
    muted: "rgba(255,255,255,.82)",
    accent: "var(--vg-accent)",
    panelBg: "var(--vg-glass)",
    panelBorder: "var(--vg-accent)",
    mediaBg: "rgba(10,6,20,.45)",
    pillBg: "var(--vg-accent)",
    pillText: "#0a0614",
    rule: "rgba(255,255,255,.18)",
    shadow: "0 24px 60px rgba(0,0,0,.45)",
  },
} satisfies Record<string, ChapterTheme>;

const THEME_VARS: [keyof ChapterTheme, string][] = [
  ["text", "--cl-text"],
  ["muted", "--cl-muted"],
  ["accent", "--cl-accent"],
  ["panelBg", "--cl-panel-bg"],
  ["panelBorder", "--cl-panel-border"],
  ["mediaBg", "--cl-media-bg"],
  ["pillBg", "--cl-pill-bg"],
  ["pillText", "--cl-pill-text"],
  ["rule", "--cl-rule"],
  ["shadow", "--cl-shadow"],
];

/** The theme as CSS custom properties, for React `style`. */
export function chapterThemeVars(theme: ChapterTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, name] of THEME_VARS) {
    const value = theme[key];
    if (value) vars[name] = value;
  }
  return vars;
}

/** The theme as an inline style string, for the static markup. */
export function chapterThemeStyle(theme: ChapterTheme): string {
  return Object.entries(chapterThemeVars(theme))
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
}

export interface ChapterLists {
  /** "Key points": the pull-quote and supporting sentences, as the Voyage key-point card derives them. */
  keyPoints: string[];
  /** "Up next": the next chapter's title and where this one sits. */
  upNext: string[];
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * The two lists of chapter `index`, derived with the Voyage helpers
 * (voyagePullQuote, voyageBullets) so every template shows the same thing the
 * Voyage key-point card does. `chapters` is the whole story in order.
 */
export function chapterLists(
  chapters: { title: string; text: string }[],
  index: number,
): ChapterLists {
  const total = chapters.length;
  const text = chapters[index]?.text ?? "";
  const quote = text.trim() ? voyagePullQuote(text) : "";
  const keyPoints = [quote, ...voyageBullets(text, quote)]
    .filter(Boolean)
    .slice(0, 3);
  const next = chapters[index + 1];
  const upNext = [
    next ? next.title : "Final chapter",
    `Chapter ${pad2(index + 1)} of ${pad2(total)}`,
  ];
  return { keyPoints, upNext };
}

/** Pill label: advance to the next chapter, or return to the top after the last. */
export function chapterNextLabel(index: number, total: number): string {
  return index + 1 < total ? "Next chapter" : "Back to top";
}

export const CHAPTER_LAYOUT_CSS = `
.cl{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(24px,4vw,64px);width:100%;max-width:1320px;margin:0 auto;color:var(--cl-text,#171717);scroll-margin-top:32px;box-sizing:border-box;}
@media(min-width:900px){.cl{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);align-items:start;}}
.cl-media{display:flex;flex-direction:column;gap:clamp(16px,2.5vw,32px);min-width:0;}
.cl-fig{position:relative;margin:0;width:100%;aspect-ratio:16/9;border-radius:24px;overflow:hidden;background:var(--cl-media-bg,rgba(127,127,127,.12));box-shadow:var(--cl-shadow,0 24px 60px rgba(0,0,0,.25));transform-origin:50% 100%;}
.cl-fig>img{display:block;width:100%;height:100%;object-fit:cover;}
.cl-fig-avatar>.avatar-box,.cl-fig-avatar>.cl-fill{position:absolute;inset:0;width:100%;height:100%;box-sizing:border-box;padding:3%;}
.cl-fill>*{width:100%;height:100%;object-fit:contain;}
.cl-panel{min-width:0;display:flex;flex-direction:column;gap:20px;padding:clamp(22px,2.6vw,36px);border-radius:24px;border:1px solid var(--cl-panel-border,rgba(127,127,127,.25));background:var(--cl-panel-bg,transparent);box-sizing:border-box;}
@media(min-width:900px){.cl-panel{position:sticky;top:96px;}}
.cl-eyebrow{font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:var(--cl-muted,#737373);}
.cl-panel h2{margin:0;font-size:1.125rem;font-weight:500;line-height:1.3;color:var(--cl-text,#171717);}
.cl-pill{align-self:flex-start;display:inline-flex;align-items:center;gap:10px;margin:4px 0 0;padding:12px 24px;border:0;border-radius:999px;background:var(--cl-pill-bg,#171717);color:var(--cl-pill-text,#fff);font:inherit;font-size:.8125rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:transform .2s ease,filter .2s ease;}
.cl-pill::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--cl-accent,currentColor);flex-shrink:0;}
.cl-pill:hover{transform:translateY(-1px);filter:brightness(1.08);}
.cl-pill:focus-visible{outline:2px solid var(--cl-accent,currentColor);outline-offset:3px;}
.cl-lists{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;padding-top:20px;border-top:1px solid var(--cl-rule,rgba(127,127,127,.25));}
@media(min-width:1180px){.cl-lists{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:28px;}}
.cl-list h3{margin:0 0 10px;font-size:.6875rem;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:var(--cl-accent,#737373);}
.cl-list ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;font-size:.9375rem;line-height:1.45;color:var(--cl-muted,#737373);}
/* Entrance: only when the script is running, so no-JS pages stay readable. */
.cl-js .cl-fig,.cl-js .cl-panel{opacity:0;transition:opacity .9s ease,transform 1.1s cubic-bezier(.2,.7,.2,1),filter .9s ease;}
/* Compositor layers only while a block is about to enter or is entering (cl-near, dropped once settled), not for the whole page. */
.cl-js .cl-fig.cl-near{will-change:transform,opacity,filter;}
.cl-js .cl-panel.cl-near{will-change:transform,opacity;}
.cl-js .cl-fig{transform:perspective(1200px) translate3d(0,56px,0) rotateX(8deg) scale(.92);filter:blur(10px);}
.cl-js .cl-fig>img,.cl-js .cl-fig>.avatar-box,.cl-js .cl-fig>.cl-fill{transform:scale(1.14);transition:transform 1.6s cubic-bezier(.2,.7,.2,1);}
.cl-js .cl-panel{transform:translate3d(0,28px,0);transition-delay:.15s;}
.cl-js .cl-fig.in,.cl-js .cl-panel.in{opacity:1;transform:none;filter:none;}
.cl-js .cl-fig.in>img,.cl-js .cl-fig.in>.avatar-box,.cl-js .cl-fig.in>.cl-fill{transform:none;}
@media(min-width:900px){.cl-js .cl-panel.in{position:sticky;}}
@media(prefers-reduced-motion:reduce){
.cl-js .cl-fig,.cl-js .cl-panel,.cl-js .cl-fig>img,.cl-js .cl-fig>.avatar-box,.cl-js .cl-fig>.cl-fill{opacity:1;transform:none;filter:none;transition:none;will-change:auto;}
.cl-pill{transition:none;}
}
`;

/**
 * Behaviour of the layout, shared by both render paths. Pass a `.cl` element
 * (React) or the document (static pages): it marks the layout as scripted,
 * reveals pictures and panel as they scroll into view (instantly under
 * prefers-reduced-motion) and wires the pill. Returns a cleanup.
 *
 * Must stay self-contained (no imports, no outer references): the static pages
 * embed it via `toString()` (see CHAPTER_LAYOUT_JS).
 */
export function initChapterLayout(root: ParentNode | Element): () => void {
  const reduced = !!(
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const layouts: Element[] = Array.prototype.slice.call(
    root.querySelectorAll(".cl"),
  );
  if ((root as Element).matches && (root as Element).matches(".cl"))
    layouts.unshift(root as Element);
  const cleanups: (() => void)[] = [];

  // One observer for every block under the root (not one per layout), plus a
  // second that only flags blocks that are about to scroll in so they get a
  // compositor layer just in time and give it back once their entrance is done.
  let revealObserver: IntersectionObserver | null = null;
  let nearObserver: IntersectionObserver | null = null;
  const timers: number[] = [];
  const allTargets: Element[] = [];

  layouts.forEach(function (layout) {
    layout.classList.add("cl-js");
    const targets: Element[] = Array.prototype.slice
      .call(layout.querySelectorAll(".cl-fig, .cl-panel"))
      .filter(function (el: Element) {
        return !el.classList.contains("in");
      });
    targets.forEach(function (el) {
      allTargets.push(el);
    });
    const pill = layout.querySelector(".cl-pill");
    if (pill && !pill.hasAttribute("data-cl-custom")) {
      const onClick = function () {
        const all: Element[] = Array.prototype.slice.call(
          document.querySelectorAll(".cl"),
        );
        const next = all[all.indexOf(layout) + 1];
        const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
        if (next) next.scrollIntoView({ behavior: behavior, block: "start" });
        else window.scrollTo({ top: 0, behavior: behavior });
      };
      pill.addEventListener("click", onClick);
      cleanups.push(function () {
        pill!.removeEventListener("click", onClick);
      });
    }
  });

  if (reduced || typeof IntersectionObserver === "undefined") {
    allTargets.forEach(function (el) {
      el.classList.add("in");
    });
  } else if (allTargets.length) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("in");
          revealObserver!.unobserve(el);
          nearObserver!.unobserve(el);
          // Entrance done (longest transition 1.6s): release the layer.
          timers.push(
            window.setTimeout(function () {
              el.classList.remove("cl-near");
              el.classList.add("cl-settled");
            }, 1900),
          );
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    nearObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("cl-near", entry.isIntersecting);
        });
      },
      { rootMargin: "0px 0px 60% 0px" },
    );
    allTargets.forEach(function (el) {
      revealObserver!.observe(el);
      nearObserver!.observe(el);
    });
  }

  return function () {
    if (revealObserver) revealObserver.disconnect();
    if (nearObserver) nearObserver.disconnect();
    timers.forEach(function (id) {
      window.clearTimeout(id);
    });
    cleanups.forEach(function (cleanup) {
      cleanup();
    });
  };
}

/** Script for the static pages: runs initChapterLayout over the whole document. */
/** The init function's source, for pages (Voyage) that build their chapter DOM at runtime and call it themselves. */
export const CHAPTER_LAYOUT_FN = initChapterLayout.toString();

export const CHAPTER_LAYOUT_JS = `(${initChapterLayout.toString()})(document);`;

/** Tiny head script so the entrance start state applies before first paint (no flash of visible-then-hidden). */
export const CHAPTER_LAYOUT_BOOT = `<script>document.documentElement.classList.add('cl-js')</script>`;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface ChapterMediaHtml {
  kind: "scene" | "avatar";
  /** Inner markup of the picture frame (an <img>, or an avatar box/video). */
  html: string;
}

export interface ChapterLayoutHtmlInput {
  theme: ChapterTheme;
  index: number;
  total: number;
  eyebrow: string;
  title: string;
  /** Narration paragraph, already built and escaped by the template (keeps its own `.word` spans). */
  textHtml: string;
  /** Narration <audio> element, or "". */
  audioHtml?: string;
  media: ChapterMediaHtml[];
  lists: ChapterLists;
  /** Pill label override; with it the pill is left to the page to wire (data-cl-custom). */
  nextLabel?: string;
}

function listHtml(label: string, items: string[]): string {
  if (items.length === 0) return "";
  return `<div class="cl-list"><h3>${label}</h3><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`;
}

function figureInner(item: ChapterMediaHtml): string {
  // The static templates hand over a ready avatar box; a bare <img>/<video> gets the fill wrapper.
  if (item.kind !== "avatar" || item.html.startsWith('<div class="avatar-box"')) return item.html;
  return `<div class="cl-fill">${item.html}</div>`;
}

/** Static-site markup of one chapter, the twin of ChapterLayout.tsx. */
export function chapterLayoutHtml(input: ChapterLayoutHtmlInput): string {
  const media = input.media.slice(0, CHAPTER_MEDIA_MAX);
  const lists =
    listHtml("Key points", input.lists.keyPoints) +
    listHtml("Up next", input.lists.upNext);
  return `<div class="cl" style="${chapterThemeStyle(input.theme)}">
  <div class="cl-media">${media
    .map(
      (item) =>
        `<figure class="cl-fig cl-fig-${item.kind}">${figureInner(item)}</figure>`,
    )
    .join("")}</div>
  <aside class="cl-panel">
    <span class="cl-eyebrow">${escapeHtml(input.eyebrow)}</span>
    <h2>${escapeHtml(input.title)}</h2>
    ${input.textHtml}
    ${input.audioHtml ?? ""}
    <button type="button" class="cl-pill"${input.nextLabel ? " data-cl-custom" : ""}>${input.nextLabel ?? chapterNextLabel(input.index, input.total)}</button>
    ${lists ? `<div class="cl-lists">${lists}</div>` : ""}
  </aside>
</div>`;
}
