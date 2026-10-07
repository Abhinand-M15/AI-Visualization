"use client";

import { useEffect, useRef, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { chapterPicture, type ShowcaseChapter } from "@/lib/showcase";
import { useShowcase } from "../shared/ShowcaseContext";
import { startOpen } from "../shared/projectTransition";

const EASE_OUT = "cubic-bezier(.16,1,.3,1)";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Adds `fw-in` once when the element first enters the viewport. */
function useRevealOnce(ref: RefObject<HTMLElement | null>, threshold: number): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.classList.add("fw-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("fw-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
}

function ProjectImage({ src, label }: { src: string; label: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      width={1600}
      height={1040}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="fw-img block h-full w-full object-cover"
    />
  );
}

function Row({ chapter, index }: { chapter: ShowcaseChapter; index: number }) {
  const { router } = useShowcase();
  const ref = useRef<HTMLAnchorElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const parRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useRevealOnce(ref, 0.2);

  // Remember where the grid was so Back can return to this tile.
  const rememberScroll = (): void => {
    try {
      sessionStorage.setItem("sc-home-scroll", String(Math.round(window.scrollY)));
    } catch {
      // storage unavailable
    }
  };

  // Tile click: play the zoom transition (falls back to normal navigation).
  const onTileClick = (e: ReactMouseEvent<HTMLAnchorElement>): void => {
    rememberScroll();
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const media = mediaRef.current;
    const row = ref.current;
    if (!media || !row) return;
    const started = startOpen({
      router,
      href: chapter.href,
      slug: chapter.slug,
      src: chapterPicture(chapter),
      bg: chapter.theme.bg,
      media,
      row,
    });
    if (started) e.preventDefault();
  };

  // Blur burst inside the tile where it is pressed.
  const onPointerDown = (e: ReactPointerEvent<HTMLAnchorElement>): void => {
    const media = mediaRef.current;
    if (!media || prefersReducedMotion()) return;
    const r = media.getBoundingClientRect();
    const x = clamp(e.clientX - r.left, 0, r.width);
    const y = clamp(e.clientY - r.top, 0, r.height);
    const burst = document.createElement("span");
    burst.className = "fw-burst";
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.style.setProperty("--fw-size", `${Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) * 2}px`);
    media.appendChild(burst);
    burst.addEventListener("animationend", () => burst.remove(), { once: true });
  };

  // Vertical drift of the image canvas while the card crosses the viewport.
  useEffect(() => {
    const main = mainRef.current;
    const par = parRef.current;
    if (!main || !par || prefersReducedMotion()) return;

    let visible = false;
    let raf = 0;

    const update = (): void => {
      raf = 0;
      const rect = main.getBoundingClientRect();
      const vh = window.innerHeight;
      // +1 when the card is entering at the bottom, -1 once it has left at the top.
      const p = clamp((rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2), -1, 1);
      par.style.transform = `translate3d(0, ${(p * 0.04 * par.offsetHeight).toFixed(2)}px, 0)`;
    };
    const schedule = (): void => {
      if (visible && raf === 0) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible = e.isIntersecting;
        schedule();
      },
      { rootMargin: "100px 0px" },
    );
    io.observe(main);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <a ref={ref} href={chapter.href} className="fw-row" data-col={index % 2} onPointerDown={onPointerDown} onClick={onTileClick} data-fw-slug={chapter.slug}>
      <div ref={mainRef} className="fw-main">
        <div ref={mediaRef} className="fw-media">
          <div ref={parRef} className="fw-par">
            <div className="fw-scale">
              <ProjectImage src={chapterPicture(chapter)} label={chapter.title} />
            </div>
          </div>
        </div>
        <span className="fw-chip">View</span>
      </div>
      <div className="fw-foot">
        <div className="fw-tag-mask">
          <p className="fw-tags">{chapter.tags.join(" • ")}</p>
        </div>
        <h3 className="fw-title" aria-label={chapter.title}>
          <span className="fw-arrow" aria-hidden="true" />
          <span className="fw-title-rise">
            <span className="fw-title-inner">
              {Array.from(chapter.title).map((ch, i) => (
                <span key={i} aria-hidden="true" className="fw-letter" style={{ transitionDelay: `${i * 18}ms` }}>
                  <span className="fw-letter-a">{ch === " " ? " " : ch}</span>
                  <span className="fw-letter-b">{ch === " " ? " " : ch}</span>
                </span>
              ))}
            </span>
          </span>
        </h3>
      </div>
    </a>
  );
}

const HEADING_WORDS: readonly string[] = ["The", "Chapters"];
const SUB_LINES: readonly string[] = [
  "Every part of the story,",
  "one tile at a time. Open any",
  "tile to read it and listen.",
];

export function FeaturedWork() {
  const { story } = useShowcase();
  const headRef = useRef<HTMLElement>(null);
  const headInnerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useRevealOnce(headRef, 0.3);
  useRevealOnce(ctaRef, 0.5);

  // Scroll parallax for the heading block: translateY -160px -> 0.
  useEffect(() => {
    const head = headRef.current;
    const inner = headInnerRef.current;
    if (!head || !inner || prefersReducedMotion()) return;

    let raf = 0;
    const update = (): void => {
      raf = 0;
      const vh = window.innerHeight;
      const p = clamp((vh - head.getBoundingClientRect().top) / (vh * 0.8), 0, 1);
      inner.style.transform = `translate3d(0, ${(-160 * (1 - p)).toFixed(2)}px, 0)`;
    };
    const schedule = (): void => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="fw-section" style={{ fontFamily: "var(--sc-font-sans), sans-serif" }}>
      <header ref={headRef} className="fw-head">
        <div ref={headInnerRef} className="fw-head-inner">
          <h2 className="fw-heading" aria-label="The Chapters">
            {HEADING_WORDS.map((w, i) => (
              <span key={w} className="fw-wm" aria-hidden="true">
                <span className="fw-w" style={{ "--i": i } as CSSProperties}>
                  {w}
                </span>
              </span>
            ))}
          </h2>
          <p className="fw-sub">
            {SUB_LINES.map((line, i) => (
              <span key={line} className="fw-sl-m">
                <span className="fw-sl" style={{ "--i": i } as CSSProperties}>
                  {line}
                </span>
              </span>
            ))}
          </p>
        </div>
      </header>
      <div className="fw-list">
        {story.chapters.map((chapter, i) => (
          <Row key={chapter.slug} chapter={chapter} index={i} />
        ))}
      </div>
      <div ref={ctaRef} className="fw-cta">
        <div className="fw-cta-in">
          <a href={story.chapters[0]?.href ?? "#/"} className="fw-pill">
            <span className="fw-dot-w" aria-hidden="true">
              <span className="fw-dot" />
            </span>
            <span>START FROM CHAPTER 1</span>
            <svg
              className="fw-pill-arrow"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
      <style>{`
        .fw-section { position: relative; z-index: 1; background: transparent; color: #000; padding: calc(var(--sc-pad-y) * 2) var(--sc-pad-x) calc(var(--sc-pad-y) * 3); }
        .fw-head { margin-bottom: 8vh; }
        .fw-head-inner { display: flex; justify-content: space-between; align-items: flex-end; gap: 4vw; will-change: transform; }
        .fw-heading { font-size: 8vw; font-weight: 500; line-height: 1; letter-spacing: -0.03em; margin: 0; }
        .fw-wm { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.1em; margin-bottom: -0.1em; margin-right: 0.22em; }
        .fw-wm:last-child { margin-right: 0; }
        .fw-w { display: inline-block; transform: translate3d(200px, 100%, 0); transition: transform 1.1s ${EASE_OUT}; transition-delay: calc(var(--i) * 0.08s); }
        .fw-head.fw-in .fw-w { transform: translate3d(0, 0, 0); }
        .fw-sub { display: flex; flex-direction: column; font-size: 0.75rem; line-height: 1.1; text-transform: uppercase; margin: 0; max-width: 22vw; }
        .fw-sl-m { display: block; overflow: hidden; }
        .fw-sl { display: block; transform: translateY(110%); transition: transform 1.1s ${EASE_OUT}; transition-delay: calc(0.3s + var(--i) * 0.06s); }
        .fw-head.fw-in .fw-sl { transform: none; }
        .fw-list { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--sc-grid-gap); }
        .fw-row { --fw-d: 0s; grid-column: span 6 / span 6; display: block; color: #000; text-decoration: none; cursor: pointer; }
        .fw-row[data-col="1"] { --fw-d: 0.12s; }
        .fw-row:nth-child(n+3) { margin-top: 10em; }
        .fw-main { position: relative; padding-top: 65%; }
        .fw-media { position: absolute; inset: 0; overflow: hidden; border-radius: 15px; background: var(--sc-dark-white); clip-path: inset(100% 0 0 0 round 15px); transition: clip-path 1.2s ${EASE_OUT} var(--fw-d); }
        .fw-row.fw-in .fw-media { clip-path: inset(0 round 15px); }
        .fw-burst { position: absolute; z-index: 3; width: var(--fw-size); height: var(--fw-size); margin: calc(var(--fw-size) / -2) 0 0 calc(var(--fw-size) / -2); border-radius: 50%; pointer-events: none; transform: scale(0); opacity: 1; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); background: radial-gradient(circle, rgba(255,255,255,.2), rgba(255,255,255,0) 70%); -webkit-mask-image: radial-gradient(circle, #000 45%, transparent 70%); mask-image: radial-gradient(circle, #000 45%, transparent 70%); animation: fw-burst .9s ${EASE_OUT} forwards; }
        @keyframes fw-burst { 0% { transform: scale(0); opacity: 1; } 55% { opacity: .9; } 100% { transform: scale(1); opacity: 0; } }
        .fw-par { position: absolute; left: 0; right: 0; top: -5%; height: 110%; will-change: transform; }
        .fw-scale { width: 100%; height: 100%; transform: scale(1.25); transition: transform 1.6s ${EASE_OUT} var(--fw-d); }
        .fw-row.fw-in .fw-scale { transform: none; }
        .fw-img { transition: transform 1.1s ${EASE_OUT}; }
        .fw-row:hover .fw-img { transform: scale(1.05); }
        .fw-chip { position: absolute; right: 10px; bottom: 10px; height: 2em; line-height: 2em; padding: 0 1em; background: var(--sc-off-white); border-radius: 1em; font-family: var(--sc-font-mono), monospace; font-weight: 500; font-size: 0.7rem; text-transform: uppercase; opacity: 0; transform: translateY(8px); transition: opacity .4s, transform .4s ${EASE_OUT}; }
        .fw-row:hover .fw-chip { opacity: 1; transform: none; }
        .fw-foot { position: relative; width: 100%; }
        .fw-tag-mask { overflow: hidden; margin: 1.5em 0 1em; }
        .fw-tags { font-size: 0.9vw; line-height: 1.3; margin: 0; text-transform: uppercase; transform: translateY(110%); transition: transform 1.1s ${EASE_OUT} calc(var(--fw-d) + 0.1s); }
        .fw-row.fw-in .fw-tags { transform: none; }
        .fw-title { position: relative; font-size: 3vw; font-weight: 500; height: 1em; line-height: 1; margin: 0; left: -0.06em; overflow: hidden; }
        .fw-title-rise { display: block; transform: translateY(110%); transition: transform 1.1s ${EASE_OUT} calc(var(--fw-d) + 0.2s); }
        .fw-row.fw-in .fw-title-rise { transform: none; }
        .fw-title-inner { position: relative; display: flex; bottom: 0.1em; transition: transform .55s ${EASE_OUT}; }
        .fw-arrow { position: absolute; width: 0.8em; height: 0.8em; top: 0.1em; left: -1em; transition: left .55s ${EASE_OUT}; background: no-repeat center / contain url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'><path d='M4 12h16M14 6l6 6-6 6'/></svg>"); }
        .fw-row:hover .fw-arrow { left: 0; }
        .fw-row:hover .fw-title-inner { transform: translateX(0.9em); }
        .fw-letter { position: relative; display: inline-block; overflow: hidden; height: 1.2em; }
        .fw-letter-a, .fw-letter-b { display: block; transition: transform .55s ${EASE_OUT}; transition-delay: inherit; }
        .fw-letter-b { position: absolute; left: 0; top: 100%; }
        .fw-row:hover .fw-letter-a { transform: translateY(-100%); }
        .fw-row:hover .fw-letter-b { transform: translateY(-100%); }
        .fw-cta { display: flex; justify-content: center; margin-top: 12vh; }
        .fw-cta-in { opacity: 0; transform: translateY(40px); transition: opacity 1s ${EASE_OUT}, transform 1s ${EASE_OUT}; }
        .fw-cta.fw-in .fw-cta-in { opacity: 1; transform: none; }
        .fw-pill { display: inline-flex; align-items: center; gap: 0.7em; padding: 0 1.4em; height: 3.2em; border-radius: 999px; background: #2b2e3a; color: #f0f1fa; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.04em; text-decoration: none; transition: background-color .4s, color .4s; }
        .fw-pill:hover, .fw-pill:focus-visible { background: #1a2ffb; }
        .fw-dot-w { display: inline-flex; align-items: center; justify-content: center; width: 12px; height: 12px; flex: none; }
        .fw-dot { display: block; width: 8px; height: 8px; border-radius: 50%; background: currentColor; transition: width .4s, height .4s; }
        .fw-pill:hover .fw-dot, .fw-pill:focus-visible .fw-dot { width: 12px; height: 12px; }
        .fw-pill-arrow { flex: none; transition: transform .4s; }
        .fw-pill:hover .fw-pill-arrow, .fw-pill:focus-visible .fw-pill-arrow { transform: translateX(4px); }
        @media (max-width: 1024px) {
          .fw-row { grid-column: span 12 / span 12; }
          .fw-row:nth-child(n+2) { margin-top: 5em; }
          .fw-row[data-col="1"] { --fw-d: 0s; }
          .fw-tags { font-size: 2.5vw; }
          .fw-title { font-size: 6.5vw; }
          .fw-heading { font-size: 14vw; }
          .fw-head-inner { flex-direction: column; align-items: flex-start; }
          .fw-sub { max-width: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fw-head-inner, .fw-par { transform: none !important; }
          .fw-w, .fw-sl, .fw-tags, .fw-title-rise, .fw-scale { transform: none; transition: none; }
          .fw-media { clip-path: inset(0 round 15px); transition: none; }
          .fw-cta-in { opacity: 1; transform: none; transition: none; }
        }
      `}</style>
    </section>
  );
}
