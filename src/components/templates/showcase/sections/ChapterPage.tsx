"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { chapterPicture, mediaItemPicture, type ShowcaseChapter, type ShowcaseMediaItem } from "@/lib/showcase";
import { isAutoScrollOn, isNarrationPaused, setNarrationPaused, subscribeNarrationPaused } from "@/lib/narrationControl";
import { useShowcase } from "../shared/ShowcaseContext";
import { arriveDetail, startBack } from "../shared/projectTransition";
import { SmoothScroll } from "../shared/SmoothScroll";
import { Header } from "./Header";

/**
 * Chapter page template. One layout, filled from a `ShowcaseChapter`.
 *
 * A single vertical column (desktop and mobile alike): title and tags, the
 * pictures, the narration text, then the Next pill and chapter links. The page
 * scrolls normally; each picture gets its own scroll effect (zoom, tilt, reveal,
 * inner slide, rise) from its position in the viewport, and the text blocks rise
 * into place from below as they come into view.
 */

type FxKind = "main" | "zoom" | "tilt" | "reveal" | "slide" | "rise";
/** Scroll effect per gallery item after the main one, repeating. */
const FX_CYCLE: readonly FxKind[] = ["zoom", "tilt", "reveal", "slide", "rise"];

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** The avatar's looping video, drawn over the art; plays only while on screen. */
function LazyVideo({ item }: { item: ShowcaseMediaItem }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) void video.play().catch(() => undefined);
          else video.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} muted loop playsInline preload="metadata" className="absolute inset-0 block h-full w-full object-contain">
      {item.videoFallback ? (
        <>
          <source src={item.videoSrc} type="video/webm" />
          <source src={item.videoFallback} type="video/mp4" />
        </>
      ) : (
        <source src={item.videoSrc} />
      )}
    </video>
  );
}

/** One gallery item: the picture (generated art unless the real-picture slot is filled),
 *  with the avatar's image or video on top when the item has one. */
function Media({ item, picture, priority }: { item: ShowcaseMediaItem; picture: string; priority: boolean }) {
  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={picture}
        alt={item.alt}
        width={item.width}
        height={item.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="block h-full w-full object-cover"
        style={item.focus ? { objectPosition: item.focus } : undefined}
      />
      {item.videoSrc ? (
        <LazyVideo item={item} />
      ) : item.overlay ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.overlay}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="absolute inset-x-0 bottom-0 mx-auto block h-[90%] w-auto max-w-[90%] object-contain"
        />
      ) : null}
    </div>
  );
}

/** Title font sizes (desktop, mobile) by length, so a long chapter title still fits its column. */
function titleSizes(title: string): { lg: string; sm: string } {
  const n = title.length;
  if (n <= 14) return { lg: "4.5vw", sm: "13vw" };
  if (n <= 26) return { lg: "3.4vw", sm: "10vw" };
  if (n <= 44) return { lg: "2.7vw", sm: "8vw" };
  return { lg: "2.2vw", sm: "6.5vw" };
}

/** Desktop width of a gallery figure: wide pictures fill most of the column, portrait ones are narrower; never taller than ~82vh. */
function figureWidth(item: ShowcaseMediaItem): string {
  const ratio = item.width / item.height;
  return `min(${ratio >= 1 ? "var(--pd-col)" : "42vw"}, ${(82 * ratio).toFixed(1)}vh)`;
}

/** Splits a paragraph into word spans the audio can light up. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        part === "" || /^\s+$/.test(part) ? (
          part
        ) : (
          <span key={i} className="sc-word">
            {part}
          </span>
        ),
      )}
    </>
  );
}

export function ChapterPage({ chapter }: { chapter: ShowcaseChapter }) {
  const { story, router } = useShowcase();
  const total = story.chapters.length;
  const prev = chapter.index > 0 ? story.chapters[chapter.index - 1] : null;
  const next = chapter.index + 1 < total ? story.chapters[chapter.index + 1] : null;
  const rootRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [leaving, setLeaving] = useState(false);

  // Coming from a tile: hide the main picture until the transition lands on it.
  // Any other way in (menu, links, deep link, auto-advance) just fades the page in.
  useLayoutEffect(() => {
    const fromTile = mainRef.current ? arriveDetail(mainRef.current) : false;
    if (fromTile) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) rootRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: "ease-out" });
  }, []);

  // Narration: starts when the chapter opens and stops when it closes. Words light up
  // with the audio (weighted by word length). When it ends, auto-scroll (if on and not
  // paused) fades on to the next chapter. The pause button is the shared narration dock.
  useEffect(() => {
    const audio = audioRef.current;
    const text = textRef.current;
    if (!audio || !text || !chapter.audioUrl) return;
    const words = Array.from(text.querySelectorAll<HTMLElement>(".sc-word"));
    const weights = words.map((word) => (word.textContent?.trim().length ?? 0) + 3);
    const cumulative = weights.reduce<number[]>((acc, w) => {
      acc.push((acc[acc.length - 1] ?? 0) + w);
      return acc;
    }, []);
    const totalWeight = cumulative[cumulative.length - 1] ?? 1;
    const onTimeUpdate = () => {
      if (!audio.duration) return;
      const target = (audio.currentTime / audio.duration) * totalWeight;
      let index = cumulative.findIndex((w) => w >= target);
      if (index === -1) index = words.length - 1;
      words.forEach((word, i) => word.classList.toggle("on", i <= index));
    };
    let advanceTimer = 0;
    const onEnded = () => {
      words.forEach((word) => word.classList.add("on"));
      if (!next || !isAutoScrollOn() || isNarrationPaused()) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        router.push(next.href);
        return;
      }
      setLeaving(true);
      advanceTimer = window.setTimeout(() => router.push(next.href), 650);
    };
    const play = () => {
      audio.play().catch((error: unknown) => {
        // Autoplay can be blocked before the first click; the dock then shows "Play".
        if (error instanceof DOMException && error.name === "NotAllowedError") setNarrationPaused(true);
      });
    };
    const unsubscribe = subscribeNarrationPaused((paused) => {
      if (paused) audio.pause();
      else if (audio.paused && !audio.ended) play();
    });
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    const start = window.setTimeout(() => {
      audio.currentTime = 0;
      if (!isNarrationPaused()) play();
    }, 900);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(advanceTimer);
      unsubscribe();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, [chapter.audioUrl, chapter.slug, next, router]);

  // Scroll effects. The page scrolls normally; each picture gets its own effect from
  // where it sits in the viewport (t: -1 above centre ... +1 below), applied with one
  // transform per picture per frame from positions measured up front (no layout reads
  // while scrolling). The text blocks rise into place from below as they appear.
  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const risers = Array.from(column.querySelectorAll<HTMLElement>(".sc-rise"));
    let io: IntersectionObserver | null = null;
    if (reduce) {
      for (const el of risers) el.classList.add("sc-in");
      return undefined;
    }
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("sc-in");
            io?.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    for (const el of risers) io.observe(el);

    interface Fx {
      el: HTMLElement;
      img: HTMLElement | null;
      kind: FxKind;
      top: number;
      height: number;
    }
    const items: Fx[] = Array.from(column.querySelectorAll<HTMLElement>("figure")).map((el, i) => ({
      el,
      img: el.firstElementChild instanceof HTMLElement ? el.firstElementChild : null,
      kind: i === 0 ? "main" : FX_CYCLE[(i - 1) % FX_CYCLE.length],
      top: 0,
      height: 0,
    }));

    let raf = 0;
    let lastY = Number.NaN;
    let lastBlur = -1;
    let smoothed = 0;

    const applyItems = (y: number, blur: number): void => {
      const vh = window.innerHeight;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const cy = it.top + it.height / 2 - y;
        const t = Math.max(-1.6, Math.min(1.6, (cy - vh / 2) / (vh * 0.6)));
        const a = Math.min(1, Math.abs(t));
        const stretch = 1 + blur * 0.008;
        // every picture but the first (the one the tile lands on) also eases up from below
        const enter = it.kind === "main" ? 0 : Math.max(0, t - 0.55) * 0.09 * vh;
        let figureT = `scaleY(${stretch.toFixed(3)})`;
        let imgT = "";
        let clip = "";
        switch (it.kind) {
          case "main":
            // clamps keep the picture's scaled-up margin from running out at the extremes
            imgT = `translate3d(0, ${(-Math.max(-1.1, Math.min(1.1, t)) * 6).toFixed(2)}%, 0) scale(1.14)`;
            break;
          case "zoom":
            figureT = `scale(${(1 - 0.1 * a).toFixed(3)}) ${figureT}`;
            imgT = `scale(${(1 + 0.24 * a).toFixed(3)})`;
            break;
          case "tilt":
            figureT = `perspective(1400px) rotateX(${(t * 14).toFixed(2)}deg) ${figureT}`;
            imgT = "scale(1.1)";
            break;
          case "reveal":
            clip = `inset(0 ${(Math.max(0, Math.min(1, (t - 0.05) / 0.85)) * 100).toFixed(2)}% 0 0 round 15px)`;
            imgT = `translate3d(${(Math.max(-0.75, Math.min(0.75, t)) * 8).toFixed(2)}%, 0, 0) scale(1.12)`;
            break;
          case "slide":
            imgT = `translate3d(${(-Math.max(-1.15, Math.min(1.15, t)) * 12).toFixed(2)}%, 0, 0) scale(1.28)`;
            break;
          case "rise":
            figureT = `translate3d(0, ${(t * 7 * (i % 2 ? 1 : -1) * (vh / 100)).toFixed(1)}px, 0) ${figureT}`;
            imgT = "scale(1.08)";
            break;
        }
        if (enter > 0) figureT = `translate3d(0, ${enter.toFixed(1)}px, 0) ${figureT}`;
        it.el.style.transform = figureT;
        it.el.style.willChange = "transform";
        it.el.style.filter = blur > 0 ? `blur(${blur}px)` : "";
        it.el.style.clipPath = clip;
        if (it.img) {
          it.img.style.transform = imgT;
          it.img.style.willChange = "transform";
        }
      }
    };

    function apply(): void {
      raf = 0;
      const y = window.scrollY;
      // scroll speed -> motion blur and stretch (quantised, so it rarely repaints)
      const dy = Number.isNaN(lastY) ? 0 : Math.abs(y - lastY);
      smoothed = smoothed * 0.7 + clamp01(dy / 45) * 0.3;
      const blur = smoothed < 0.04 ? 0 : Math.min(6, Math.round(smoothed * 7));
      if (y !== lastY || blur !== lastBlur) {
        lastY = y;
        lastBlur = blur;
        applyItems(y, blur);
      }
      // keep easing the blur out after the scroll stops
      if (smoothed >= 0.04) schedule();
    }
    function schedule(): void {
      if (raf === 0) raf = requestAnimationFrame(apply);
    }
    const measure = (): void => {
      const columnTop = column.getBoundingClientRect().top + window.scrollY;
      for (const it of items) {
        it.top = columnTop + it.el.offsetTop;
        it.height = it.el.offsetHeight;
      }
      lastY = Number.NaN;
      schedule();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(column);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      io?.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, [chapter.slug]);

  const goBack = (): void => {
    try {
      sessionStorage.setItem("sc-home-restore", "1");
    } catch {
      // storage unavailable: the grid opens at the top
    }
    const started = startBack({
      router,
      slug: chapter.slug,
      src: chapterPicture(chapter),
      bg: chapter.theme.bg,
      figure: mainRef.current,
    });
    if (!started) router.push("#/", { scroll: false });
  };

  const { theme } = chapter;
  const sizes = titleSizes(chapter.title);
  const rootStyle = {
    background: theme.bg,
    color: theme.text,
    opacity: leaving ? 0 : undefined,
    transition: leaving ? "opacity .6s ease" : undefined,
    "--sc-black": theme.highlight,
    "--pd-highlight": theme.highlight,
    "--pd-text": theme.text,
    "--pd-btn-bg": theme.btnBg,
    "--pd-btn-text": theme.btnText,
    "--pd-title": sizes.lg,
    "--pd-title-m": sizes.sm,
    "--pd-col": "min(76vw, 1200px)",
  } as CSSProperties;

  return (
    <div ref={rootRef} className="relative min-h-screen" style={{ ...rootStyle, fontFamily: "var(--sc-font-sans), sans-serif" }}>
      <SmoothScroll />
      <Header />

      <button
        type="button"
        onClick={goBack}
        className="group fixed left-1/2 z-50 flex h-[3.2em] -translate-x-1/2 items-center gap-[0.6em] overflow-hidden rounded-full px-[1.4em] text-[0.875rem] font-medium uppercase"
        style={{ top: "var(--sc-pad-y)", background: "var(--pd-btn-bg)", color: "var(--pd-btn-text)" }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100"
          style={{ background: "var(--pd-highlight)" }}
        />
        <svg aria-hidden="true" viewBox="0 0 16 16" className="relative h-[1em] w-[1em]">
          <path d="M14 8H3M7 4 3 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="relative">Back</span>
      </button>

      <div
        ref={columnRef}
        className="relative mx-auto flex flex-col items-center gap-[10vw] px-[var(--sc-pad-x)] pb-[12vw] pt-[26vw] lg:gap-[11vh] lg:pb-[16vh] lg:pt-[19vh]"
      >
        <section className="pd-fx w-full lg:w-[var(--pd-col)]" style={{ "--pd-d": "0.1s" } as CSSProperties}>
          <h1 className="m-0 text-[length:var(--pd-title-m)] font-medium leading-[0.95] tracking-[-0.02em] lg:max-w-[60vw] lg:text-[length:var(--pd-title)]">
            {chapter.title}
          </h1>
          <p
            className="mt-[1.5em] text-[0.75rem] uppercase leading-[1.3] lg:text-[0.8vw]"
            style={{ color: "var(--pd-highlight)" }}
          >
            {chapter.tags.join(" • ")}
          </p>
        </section>

        {chapter.items.map((item, i) => (
          <figure
            key={i}
            ref={i === 0 ? mainRef : undefined}
            className={`m-0 w-full shrink-0 overflow-hidden rounded-[15px] lg:w-[var(--pd-w)] ${i > 0 ? "pd-fade" : ""}`}
            style={
              {
                aspectRatio: `${item.width} / ${item.height}`,
                "--pd-d": `${0.15 + i * 0.12}s`,
                "--pd-w": figureWidth(item),
              } as CSSProperties
            }
          >
            <Media item={item} picture={i === 0 ? chapterPicture(chapter) : mediaItemPicture(item)} priority={i < 2} />
          </figure>
        ))}

        <section className="flex w-full flex-col lg:w-[min(var(--pd-col),46rem)]">
          <div
            ref={textRef}
            className="sc-rise sc-text max-w-[30em] text-[4.2vw] leading-[1.5] lg:max-w-none lg:text-[1.2vw] lg:leading-[1.55]"
            data-audio={chapter.audioUrl ? "" : undefined}
          >
            {chapter.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "m-0" : "mt-[1em]"}>
                {chapter.audioUrl ? <Words text={p} /> : p}
              </p>
            ))}
            {chapter.audioUrl && <audio ref={audioRef} src={chapter.audioUrl} preload="none" />}
          </div>

          <a
            href={next ? next.href : "#/"}
            className="sc-rise group relative mt-[3em] flex h-[3.375em] w-fit items-center gap-[1.1em] overflow-hidden rounded-full pl-[1.1em] pr-[1.5em] text-[0.875rem] font-medium uppercase no-underline"
            style={{ background: "var(--pd-btn-bg)", color: "var(--pd-btn-text)" }}
          >
            <span
              aria-hidden="true"
              className="z-[1] block h-[0.5em] w-[0.5em] rounded-full transition-transform duration-[400ms] ease-[cubic-bezier(.35,0,0,1)] group-hover:translate-x-[5em] group-hover:scale-[26]"
              style={{ background: "var(--pd-btn-text)" }}
            />
            <span className="relative z-[2] transition-colors duration-500 group-hover:[color:var(--pd-text)]">
              {next ? "Next chapter" : "All chapters"}
            </span>
          </a>

          <div className="sc-rise mt-[4em] grid grid-cols-2 gap-[4vw] text-[4vw] leading-[1.4] lg:gap-[2vw] lg:text-[1vw]">
            <div>
              <h4 className="m-0 mb-[1em] text-[0.8em] font-normal uppercase" style={{ color: "var(--pd-highlight)" }}>
                Chapter
              </h4>
              <div>
                {chapter.index + 1} of {total}
              </div>
            </div>
            <div>
              <h4 className="m-0 mb-[1em] text-[0.8em] font-normal uppercase" style={{ color: "var(--pd-highlight)" }}>
                Navigate
              </h4>
              {prev && (
                <div>
                  <a href={prev.href} className="underline-offset-4 hover:underline">
                    Previous: {prev.title}
                  </a>
                </div>
              )}
              {next && (
                <div>
                  <a href={next.href} className="underline-offset-4 hover:underline">
                    Next: {next.title}
                  </a>
                </div>
              )}
              <div>
                <a href="#/" className="underline-offset-4 hover:underline">
                  All chapters
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
