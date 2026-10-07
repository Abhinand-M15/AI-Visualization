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
 * Desktop: a sticky 100vh stage; vertical scroll slides a horizontal strip
 * (title, media, the narration text and chapter links) with a single transform
 * per frame. Mobile: the same content stacked vertically.
 */

const DESKTOP_QUERY = "(min-width: 1024px)";

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

/** One strip item: the picture (generated art unless the real-picture slot is filled),
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
  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
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

  // Vertical scroll -> horizontal strip (desktop only). One transform on the strip,
  // plus a different scroll effect per gallery item, all driven from known positions
  // (no layout reads while scrolling).
  useEffect(() => {
    const track = trackRef.current;
    const strip = stripRef.current;
    if (!track || !strip) return;
    const mq = window.matchMedia(DESKTOP_QUERY);

    interface Fx {
      el: HTMLElement;
      img: HTMLElement | null;
      kind: FxKind;
      left: number;
      width: number;
    }
    const items: Fx[] = Array.from(strip.querySelectorAll<HTMLElement>("figure")).map((el, i) => ({
      el,
      img: el.firstElementChild instanceof HTMLElement ? el.firstElementChild : null,
      kind: i === 0 ? "main" : FX_CYCLE[(i - 1) % FX_CYCLE.length],
      left: 0,
      width: 0,
    }));

    let max = 0;
    let raf = 0;
    let lastX = Number.NaN;
    let smoothed = 0;

    const clearItems = (): void => {
      for (const it of items) {
        it.el.style.removeProperty("transform");
        it.el.style.removeProperty("filter");
        it.el.style.removeProperty("clip-path");
        it.el.style.removeProperty("will-change");
        it.img?.style.removeProperty("transform");
        it.img?.style.removeProperty("will-change");
      }
    };

    const applyItems = (x: number, blur: number): void => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const cx = it.left + it.width / 2 + x;
        const t = Math.max(-1.6, Math.min(1.6, (cx - vw / 2) / (vw * 0.6)));
        const a = Math.min(1, Math.abs(t));
        const stretch = 1 + blur * 0.008;
        let figureT = `scaleX(${stretch.toFixed(3)})`;
        let imgT = "";
        let clip = "";
        switch (it.kind) {
          case "main":
            imgT = `translate3d(${(-t * 6).toFixed(2)}%, 0, 0) scale(1.14)`;
            break;
          case "zoom":
            figureT = `scale(${(1 - 0.1 * a).toFixed(3)}) ${figureT}`;
            imgT = `scale(${(1 + 0.24 * a).toFixed(3)})`;
            break;
          case "tilt":
            figureT = `perspective(1400px) rotateY(${(-t * 16).toFixed(2)}deg) ${figureT}`;
            imgT = "scale(1.1)";
            break;
          case "reveal":
            clip = `inset(0 ${(Math.max(0, Math.min(1, (t - 0.05) / 0.85)) * 100).toFixed(2)}% 0 0 round 15px)`;
            imgT = `translate3d(${(t * 8).toFixed(2)}%, 0, 0) scale(1.12)`;
            break;
          case "slide":
            imgT = `translate3d(${(-t * 12).toFixed(2)}%, 0, 0) scale(1.28)`;
            break;
          case "rise":
            figureT = `translate3d(0, ${(t * 7 * (i % 2 ? 1 : -1) * (vh / 100)).toFixed(1)}px, 0) ${figureT}`;
            imgT = "scale(1.08)";
            break;
        }
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
      if (!mq.matches || !track || !strip) return;
      const progress = max > 0 ? clamp01(-track.getBoundingClientRect().top / max) : 0;
      const x = Math.round(-progress * max * 100) / 100;
      // scroll speed -> motion blur (quantised, so it rarely repaints)
      const dx = Number.isNaN(lastX) ? 0 : Math.abs(x - lastX);
      smoothed = smoothed * 0.7 + clamp01(dx / 45) * 0.3;
      const blur = smoothed < 0.04 ? 0 : Math.min(6, Math.round(smoothed * 7));
      if (x !== lastX || blur > 0) {
        lastX = x;
        strip.style.transform = `translate3d(${x}px, 0, 0)`;
        applyItems(x, blur);
      }
      // keep easing the blur out after the scroll stops
      if (smoothed >= 0.04) schedule();
    }
    function schedule(): void {
      if (raf === 0) raf = requestAnimationFrame(apply);
    }
    const measure = (): void => {
      if (!mq.matches) {
        track.style.removeProperty("height");
        strip.style.removeProperty("transform");
        clearItems();
        lastX = Number.NaN;
        return;
      }
      for (const it of items) {
        it.left = it.el.offsetLeft;
        it.width = it.el.offsetWidth;
      }
      max = Math.max(0, strip.scrollWidth - window.innerWidth);
      track.style.height = `${max + window.innerHeight}px`;
      lastX = Number.NaN;
      schedule();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
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

      <div ref={trackRef} className="relative">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
          <div
            ref={stripRef}
            className="flex flex-col gap-[10vw] px-[var(--sc-pad-x)] pb-[12vw] pt-[26vw] lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-[5vw] lg:pb-0 lg:pt-[6vh] lg:will-change-transform"
          >
            <section className="pd-fx shrink-0 lg:w-[36vw]" style={{ "--pd-d": "0.1s" } as CSSProperties}>
              <h1 className="m-0 text-[length:var(--pd-title-m)] font-medium leading-[0.95] tracking-[-0.02em] lg:text-[length:var(--pd-title)]">
                {chapter.title}
              </h1>
              <p
                className="mt-[1.5em] text-[0.75rem] uppercase leading-[1.3] lg:text-[0.8vw]"
                style={{ color: "var(--pd-highlight)" }}
              >
                {chapter.tags.join(" • ")}
              </p>
              <p className="mt-[3em] hidden items-center gap-[0.6em] text-[0.75rem] uppercase lg:flex">
                <span>Scroll to continue</span>
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-[1em] w-[1em]">
                  <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </p>
            </section>

            {chapter.items.map((item, i) => (
              <figure
                key={i}
                ref={i === 0 ? mainRef : undefined}
                className={`m-0 w-full shrink-0 overflow-hidden rounded-[15px] lg:h-[62vh] lg:w-auto ${i > 0 ? "pd-fade" : ""}`}
                style={{ aspectRatio: `${item.width} / ${item.height}`, "--pd-d": `${0.15 + i * 0.12}s` } as CSSProperties}
              >
                <Media item={item} picture={i === 0 ? chapterPicture(chapter) : mediaItemPicture(item)} priority={i < 2} />
              </figure>
            ))}

            <section className="shrink-0 lg:w-[46vw]">
              <div
                ref={textRef}
                className="sc-text max-w-[30em] text-[4.2vw] leading-[1.5] lg:text-[1.2vw]"
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
                className="group relative mt-[3em] flex h-[3.375em] w-fit items-center gap-[1.1em] overflow-hidden rounded-full pl-[1.1em] pr-[1.5em] text-[0.875rem] font-medium uppercase no-underline"
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

              <div className="mt-[4em] grid grid-cols-2 gap-[4vw] text-[4vw] leading-[1.4] lg:text-[1vw]">
                <div>
                  <h4
                    className="m-0 mb-[1em] text-[0.8em] font-normal uppercase"
                    style={{ color: "var(--pd-highlight)" }}
                  >
                    Chapter
                  </h4>
                  <div>
                    {chapter.index + 1} of {total}
                  </div>
                </div>
                <div>
                  <h4
                    className="m-0 mb-[1em] text-[0.8em] font-normal uppercase"
                    style={{ color: "var(--pd-highlight)" }}
                  >
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
      </div>
    </div>
  );
}
