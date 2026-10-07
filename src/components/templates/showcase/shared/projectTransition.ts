/**
 * Tile <-> project page transition.
 *
 * One fixed overlay holds a copy of the picture and a background colour. The
 * picture moves with a single transform (plus a short blur), so it stays on
 * the GPU. The sequence is explicit and slow enough to read:
 *
 *   open:  words drift away -> picture lifts to the centre -> zooms to fill the
 *          screen -> project page loads underneath -> picture settles into its
 *          place on the page.
 *   back:  the reverse, ending with the picture shrinking into its tile.
 *
 * Browser-only: call from event handlers and layout effects.
 */

type RouterLike = {
  push: (href: string, options?: { scroll?: boolean }) => void;
  prefetch: (href: string) => void;
};

interface Box {
  x: number;
  y: number;
  s: number;
}

interface Session {
  mode: "open" | "back";
  slug: string;
  overlay: HTMLDivElement;
  bgEl: HTMLDivElement;
  box: HTMLDivElement;
  w0: number;
  h0: number;
  cover: Box;
  covered: boolean;
  target: HTMLElement | null;
  timer: number;
  failSafe: number;
}

const RADIUS = 15;
const EASE_MOVE = "cubic-bezier(0.65, 0, 0.35, 1)";
const EASE_ZOOM = "cubic-bezier(0.7, 0, 0.2, 1)";
const EASE_SETTLE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Durations in ms. Raise these to slow the whole sequence down. */
export const TIMING = {
  lift: 650,
  zoom: 800,
  settle: 900,
  bgFade: 550,
  pushAt: 450,
} as const;

let session: Session | null = null;

function reduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const transformOf = (b: Box): string => `translate3d(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px, 0) scale(${b.s.toFixed(4)})`;

function centred(w: number, h: number, s: number): Box {
  return { x: (window.innerWidth - w * s) / 2, y: (window.innerHeight - h * s) / 2, s };
}

function coverBox(w: number, h: number): Box {
  const s = Math.max(window.innerWidth / w, window.innerHeight / h) * 1.04;
  return centred(w, h, s);
}

/** Moves the box between two states, with an optional blur peak halfway. */
function play(box: HTMLElement, a: Box, b: Box, duration: number, easing: string, blur = 0, radiusTo?: number): Promise<void> {
  const rTo = radiusTo ?? (b.s > 4 ? 0 : RADIUS);
  const frames: Keyframe[] = [
    { transform: transformOf(a), borderRadius: `${RADIUS / a.s}px`, filter: "blur(0px)" },
    { transform: transformOf(b), borderRadius: `${rTo / b.s}px`, filter: "blur(0px)" },
  ];
  if (blur > 0) frames.splice(1, 0, { offset: 0.5, filter: `blur(${blur}px)` });
  const anim = box.animate(frames, { duration, easing, fill: "forwards" });
  // also finish on a timer: a backgrounded tab pauses animations, and the sequence must still land
  return Promise.race([anim.finished.then(() => undefined), wait(duration + 250)]).then(() => {
    box.style.transform = transformOf(b);
    box.style.borderRadius = `${rTo / b.s}px`;
    anim.cancel();
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function build(mode: "open" | "back", slug: string, src: string, bg: string, rect: DOMRect, bgOpacity: number): Session {
  const overlay = document.createElement("div");
  overlay.setAttribute("data-pt-overlay", "");
  overlay.style.cssText = "position:fixed;inset:0;z-index:200;overflow:hidden;pointer-events:auto;";

  const bgEl = document.createElement("div");
  bgEl.style.cssText = `position:absolute;inset:0;background:${bg};opacity:${bgOpacity};`;

  const box = document.createElement("div");
  box.style.cssText = `position:absolute;left:0;top:0;width:${rect.width}px;height:${rect.height}px;transform-origin:0 0;overflow:hidden;will-change:transform;border-radius:${RADIUS}px;`;
  box.style.transform = transformOf({ x: rect.left, y: rect.top, s: 1 });
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  img.draggable = false;
  img.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;";
  box.appendChild(img);

  overlay.append(bgEl, box);
  document.body.appendChild(overlay);

  const s: Session = {
    mode,
    slug,
    overlay,
    bgEl,
    box,
    w0: rect.width,
    h0: rect.height,
    cover: coverBox(rect.width, rect.height),
    covered: false,
    target: null,
    timer: 0,
    failSafe: 0,
  };
  // never leave the page blocked if something goes wrong
  s.failSafe = window.setTimeout(() => cleanup(s), 12000);
  return s;
}

function cleanup(s: Session): void {
  window.clearTimeout(s.failSafe);
  window.clearTimeout(s.timer);
  if (s.target) s.target.style.visibility = "";
  s.overlay.remove();
  const root = document.documentElement;
  root.classList.remove("pt-leaving");
  root.removeAttribute("data-pt-hold");
  root.removeAttribute("data-pt-back");
  root.removeAttribute("data-pt-busy");
  if (session === s) session = null;
}

/** Click on a tile. Returns false when the caller should navigate normally. */
export function startOpen(o: {
  router: RouterLike;
  href: string;
  slug: string;
  src: string;
  bg: string;
  media: HTMLElement;
  row: HTMLElement;
}): boolean {
  if (session || reduced()) return false;
  const rect = o.media.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return false;

  const s = build("open", o.slug, o.src, o.bg, rect, 0);
  session = s;
  o.router.prefetch(o.href);

  const root = document.documentElement;
  root.classList.add("pt-leaving");
  root.setAttribute("data-pt-busy", "1");
  o.row.setAttribute("data-pt-active", "");
  o.media.style.visibility = "hidden";
  s.target = null;

  const startBox: Box = { x: rect.left, y: rect.top, s: 1 };
  // lift to the centre, never taller than 70% of the screen
  const lift = Math.min((window.innerWidth * 0.6) / s.w0, (window.innerHeight * 0.7) / s.h0);
  const liftBox = centred(s.w0, s.h0, lift);

  void (async () => {
    s.bgEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: TIMING.bgFade, easing: "ease-in-out", fill: "forwards" });
    s.timer = window.setTimeout(() => o.router.push(o.href), TIMING.pushAt);
    await play(s.box, startBox, liftBox, TIMING.lift, EASE_MOVE);
    await play(s.box, liftBox, s.cover, TIMING.zoom, EASE_ZOOM);
    s.covered = true;
    // the page the user left is no longer needed; restore the tile for the way back
    o.media.style.visibility = "";
    o.row.removeAttribute("data-pt-active");
    if (s.target) void handoffOpen(s);
  })();
  return true;
}

/** Chapter page mounted: hide its main picture until the overlay lands on it.
 *  Returns false when no tile transition is running (the page was opened some other way). */
export function arriveDetail(figure: HTMLElement): boolean {
  if (!session || session.mode !== "open") return false;
  session.target = figure;
  figure.style.visibility = "hidden";
  document.documentElement.setAttribute("data-pt-hold", "1");
  window.scrollTo(0, 0);
  if (session.covered) void handoffOpen(session);
  return true;
}

async function handoffOpen(s: Session): Promise<void> {
  const target = s.target;
  if (!target) return;
  await wait(40);
  const r = target.getBoundingClientRect();
  const landing: Box = { x: r.left, y: r.top, s: r.width / s.w0 };
  document.documentElement.removeAttribute("data-pt-hold"); // page content drifts in now
  await play(s.box, s.cover, landing, TIMING.settle, EASE_SETTLE, 0, RADIUS);
  target.style.visibility = "";
  s.bgEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
  await wait(320);
  cleanup(s);
}

/** Back button on the project page. Returns false to fall back to normal navigation. */
export function startBack(o: {
  router: RouterLike;
  slug: string;
  src: string;
  bg: string;
  figure: HTMLElement | null;
}): boolean {
  if (session || reduced() || !o.figure) return false;
  let rect = o.figure.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const onScreen = rect.right > 0 && rect.left < vw && rect.bottom > 0 && rect.top < vh && rect.width > 10;
  if (!onScreen) {
    const w = Math.min(vw * 0.5, vh * 0.55 * (rect.width / Math.max(1, rect.height)));
    const h = w * (rect.height / Math.max(1, rect.width));
    rect = new DOMRect((vw - w) / 2, (vh - h) / 2, w, h);
  }

  const s = build("back", o.slug, o.src, o.bg, rect, 0);
  session = s;
  o.router.prefetch("/");
  const root = document.documentElement;
  root.classList.add("pt-leaving"); // the grid arrives with its words hidden
  root.setAttribute("data-pt-busy", "1");
  root.setAttribute("data-pt-back", "1"); // and static, so nothing re-animates under us
  const startBox: Box = { x: rect.left, y: rect.top, s: 1 };
  o.figure.style.visibility = "hidden";

  void (async () => {
    s.bgEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: TIMING.bgFade * 0.8, easing: "ease-in-out", fill: "forwards" });
    s.timer = window.setTimeout(() => o.router.push("/", { scroll: false }), TIMING.pushAt);
    await play(s.box, startBox, s.cover, TIMING.zoom, EASE_ZOOM);
    s.covered = true;
    if (s.target) void finishBack(s);
  })();
  return true;
}

/** Grid mounted after Back: find the tile and shrink the picture into it. */
export function arriveHome(): void {
  if (!session || session.mode !== "back") return;
  const media = document.querySelector<HTMLElement>(`[data-fw-slug="${session.slug}"] .fw-media`);
  if (!media) {
    cleanup(session);
    return;
  }
  session.target = media;
  media.style.visibility = "hidden";
  if (session.covered) void finishBack(session);
}

async function finishBack(s: Session): Promise<void> {
  const target = s.target;
  if (!target) return;
  await wait(40);
  const r = target.getBoundingClientRect();
  const tile: Box = { x: r.left, y: r.top, s: r.width / s.w0 };
  document.documentElement.classList.remove("pt-leaving"); // words drift back in
  s.bgEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: TIMING.settle * 0.7, delay: 150, easing: "ease-in-out", fill: "forwards" });
  await play(s.box, s.cover, tile, TIMING.settle, EASE_SETTLE, 0, RADIUS);
  target.style.visibility = "";
  await wait(120);
  cleanup(s);
}
