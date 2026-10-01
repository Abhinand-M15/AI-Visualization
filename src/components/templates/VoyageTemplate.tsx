"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Manrope, Unbounded } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NarrationMasterControl } from "@/components/ui/NarrationMasterControl";
import { NARRATION_DOCK_THEMES } from "@/lib/narrationDock";
import { isAutoScrollOn, isNarrationPaused } from "@/lib/narrationControl";
import {
  VOYAGE_ASSET_ROOT,
  VOYAGE_MUSIC_ICON,
  destinationFor,
  mountedIndices,
  voyageTitleFontSize,
  type VoyageDestination,
} from "@/lib/voyage";
import { VOYAGE_CSS } from "@/lib/voyageCss";
import { createVoyageMusic, type VoyageMusic } from "@/lib/voyageMusic";
import { AvatarDisplay } from "./AvatarDisplay";
import { avatarForIndex, type TemplateProps } from "./types";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const display = Unbounded({ subsets: ["latin"], variable: "--vg-display", display: "swap" });
const body = Manrope({ subsets: ["latin"], variable: "--vg-body", display: "swap" });

type View = "select" | "chunk";

const WHEEL_THROTTLE_MS = 800;
const WHEEL_MIN_DELTA = 10;
const SWIPE_MIN_DISTANCE = 50;
const TRANSITION_OUT_S = 0.5;

const pad2 = (n: number) => String(n).padStart(2, "0");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Read once, in the useState initialisers, so a deep link opens straight into its
// chunk. Only safe because the preview page mounts templates client-side after
// the project has loaded; server-rendering this component would mismatch on hydrate.
function parseHash(total: number): { view: View; index: number } {
  if (typeof window === "undefined") return { view: "select", index: 0 };
  const match = /^#\/chunk-(\d+)$/.exec(window.location.hash);
  const index = match ? Number(match[1]) - 1 : -1;
  return index >= 0 && index < total ? { view: "chunk", index } : { view: "select", index: 0 };
}

export default function VoyageTemplate({ title, chunks, avatars }: TemplateProps) {
  const total = chunks.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const navFillRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  // When the view last changed: a wheel gesture that started in the old view
  // keeps sending momentum events, which must not nudge the new view.
  const viewChangedAt = useRef(0);
  // A deep link (#/chunk-3) opens straight into that chunk.
  const [view, setView] = useState<View>(() => parseHash(total).view);
  const [active, setActive] = useState(() => parseHash(total).index);
  const live = useRef({ view, active });
  const music = useRef<VoyageMusic | null>(null);
  const [sound, setSound] = useState({ muted: false, started: false });

  const destinations = useMemo(() => chunks.map((chunk, i) => destinationFor(chunk, i, total)), [chunks, total]);
  const current = destinations[active];

  useEffect(() => {
    live.current = { view, active };
  }, [view, active]);

  // Ambient music: browsers only allow audio after a gesture, so it starts on
  // the reader's first click or key press. The mood follows the active chunk.
  useEffect(() => {
    const engine = createVoyageMusic();
    music.current = engine;
    engine.onChange((muted, started) => setSound({ muted, started }));
    const unlock = () => {
      engine.start();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      engine.destroy();
      music.current = null;
    };
  }, []);

  const activeMood = destinations[active]?.mood;
  useEffect(() => {
    if (activeMood) music.current?.setMood(activeMood);
  }, [activeMood]);

  const setFill = useCallback((value: number) => {
    if (navFillRef.current) navFillRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
  }, []);

  const pauseNarration = useCallback(() => {
    rootRef.current?.querySelectorAll("audio, video").forEach((el) => (el as HTMLMediaElement).pause());
  }, []);

  /** Fade the foreground out, then swap view/chunk. The enter animation runs in
   *  the effect below once the new foreground has mounted. */
  const go = useCallback(
    (toView: View, toActive: number, options: { push?: boolean } = {}) => {
      if (busy.current || total === 0) return;
      busy.current = true;
      pauseNarration();
      music.current?.whoosh();
      const commit = () => {
        viewChangedAt.current = Date.now();
        setView(toView);
        setActive(toActive);
        window.scrollTo(0, 0);
        if (options.push !== false) {
          window.history.pushState(null, "", toView === "chunk" ? `#/chunk-${toActive + 1}` : "#/");
        }
      };
      const fg = rootRef.current?.querySelector<HTMLElement>("[data-vg-fg]");
      if (!fg || reducedMotion()) {
        commit();
        return;
      }
      gsap.to(fg, {
        opacity: 0,
        filter: "blur(18px)",
        scale: 1.12,
        duration: TRANSITION_OUT_S,
        ease: "power3.in",
        onComplete: commit,
      });
    },
    [pauseNarration, total],
  );

  const select = useCallback((index: number) => setActive(((index % total) + total) % total), [total]);

  // Deep links and the back button.
  useEffect(() => {
    if (total === 0) return;
    const onPop = () => {
      const next = parseHash(total);
      busy.current = false;
      viewChangedAt.current = Date.now();
      pauseNarration();
      setView(next.view);
      if (next.view === "chunk") setActive(next.index);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [total, pauseNarration]);

  // Enter animation for whatever view/chunk just mounted.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || total === 0) return;
    const release = window.setTimeout(() => (busy.current = false), 1500);
    const fg = root.querySelector<HTMLElement>("[data-vg-fg]");
    if (!fg || reducedMotion()) {
      busy.current = false;
      return () => window.clearTimeout(release);
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fg,
        { opacity: 0, filter: "blur(16px)", scale: 0.94 },
        {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "filter,transform,opacity",
          onComplete: () => {
            busy.current = false;
          },
        },
      );
      if (view === "chunk") {
        gsap.from(".vg-art", { opacity: 0, scale: 1.08, duration: 1.2, ease: "power3.out", clearProps: "all" });
        gsap.from(".vg-video", { filter: "blur(40px)", scale: 0.6, duration: 0.9, ease: "power4.out", clearProps: "filter,scale" });
        gsap.from(".vg-hero-row > span", { yPercent: 120, duration: 0.8, delay: 0.2, ease: "power4.out" });
      }
    }, root);
    return () => {
      window.clearTimeout(release);
      ctx.revert();
    };
  }, [view, active, total]);

  // Scroll-linked motion on the chunk page.
  useEffect(() => {
    const root = rootRef.current;
    if (view !== "chunk" || !root || total === 0) return;
    const ctx = gsap.context(() => {
      const page = root.querySelector<HTMLElement>(".vg-page");
      if (!page) return;
      const scrub = { trigger: page, scrub: true } as const;

      gsap.to(".vg-hero-title", { yPercent: -30, ease: "none", scrollTrigger: { ...scrub, start: "top top", end: "+=100%" } });
      gsap.to(".vg-video", { yPercent: -55, ease: "none", scrollTrigger: { ...scrub, start: "top top", end: "+=100%" } });

      gsap.fromTo(
        ".vg-tagline .vg-mask > span",
        { yPercent: 120 },
        {
          yPercent: 0,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: ".vg-gap", start: "top 70%", end: "center center", scrub: true },
        },
      );
      gsap.to(".vg-tagline", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".vg-info", start: "top 85%", end: "top 35%", scrub: true },
      });

      root.querySelectorAll<HTMLElement>(".vg-art-layer[data-scrub]").forEach((el) => {
        const [y = 0, x = 0, rotate = 0, zoom = 1] = (el.dataset.scrub ?? "0").split(",").map(Number);
        gsap.to(el, { yPercent: y, xPercent: x, rotate, scale: zoom, ease: "none", scrollTrigger: { ...scrub, start: "top top", end: "bottom bottom" } });
      });

      gsap.fromTo(
        ".vg-card-1",
        { yPercent: 8, opacity: 0 },
        { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".vg-info", start: "top 80%", end: "top 30%", scrub: true } },
      );
      gsap.fromTo(
        ".vg-card-2",
        { yPercent: 30, opacity: 0 },
        { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".vg-info", start: "top 80%", end: "top 15%", scrub: true } },
      );

      ScrollTrigger.create({
        trigger: page,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setFill((live.current.active + self.progress) / total),
      });
    }, root);
    setFill(active / total);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [view, active, total, setFill]);

  useEffect(() => {
    if (view === "select") setFill((active + 1) / total);
  }, [view, active, total, setFill]);

  // Scrolling past the end of a chunk fills the bar on the "next chapter" button,
  // then opens the next chunk (or returns to the chapter select after the last).
  useEffect(() => {
    const root = rootRef.current;
    if (view !== "chunk" || !root) return;
    let progress = 0;
    let last = 0;
    let resetTimer = 0;
    const paint = () => root.style.setProperty("--vg-down", String(Math.round(progress)));
    const onWheel = (event: WheelEvent) => {
      const now = Date.now();
      if (now - last <= 60) return;
      last = now;
      const atBottom = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 6;
      if (atBottom && event.deltaY > 0 && !busy.current) {
        progress = Math.min(100, progress + event.deltaY * 0.3);
        paint();
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          progress = 0;
          paint();
        }, 500);
        if (progress >= 100) {
          progress = 0;
          const { active: index } = live.current;
          if (index + 1 < total) go("chunk", index + 1);
          else go("select", index);
        }
      } else if (!atBottom && progress > 0) {
        progress = 0;
        paint();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.clearTimeout(resetTimer);
      root.style.setProperty("--vg-down", "0");
    };
  }, [view, active, total, go]);

  // Wheel, swipe and keys: move the selection (select view) or change chunk (chunk view).
  useEffect(() => {
    if (total === 0) return;
    let lastWheel = 0;
    let touchX: number | null = null;

    const step = (dir: 1 | -1) => {
      const { view: v, active: a } = live.current;
      if (busy.current) return;
      if (v === "select") select(a + dir);
      else if (dir === 1) {
        if (a + 1 < total) go("chunk", a + 1);
        else go("select", a);
      } else if (a > 0) go("chunk", a - 1);
    };

    const onWheel = (event: WheelEvent) => {
      if (live.current.view !== "select" || Math.abs(event.deltaY) <= WHEEL_MIN_DELTA) return;
      const now = Date.now();
      if (now - viewChangedAt.current < WHEEL_THROTTLE_MS) return;
      if (now - lastWheel < WHEEL_THROTTLE_MS) return;
      lastWheel = now;
      step(event.deltaY > 0 ? 1 : -1);
    };
    const onTouchStart = (event: TouchEvent) => {
      touchX = live.current.view === "select" ? (event.touches[0]?.clientX ?? null) : null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const end = event.changedTouches[0]?.clientX;
      const start = touchX;
      touchX = null;
      if (start === null || end === undefined) return;
      if (end - start > SWIPE_MIN_DISTANCE) step(-1);
      else if (end - start < -SWIPE_MIN_DISTANCE) step(1);
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT|AUDIO|VIDEO)$/.test(target.tagName)) return;
      const { view: v, active: a } = live.current;
      if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "Enter" && v === "select" && target?.tagName !== "BUTTON") go("chunk", a);
      else if (event.key === "Escape" && v === "chunk") go("select", a);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [total, go, select]);

  // Mouse parallax on the visible sky layers and the hero video (fine pointers only).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(pointer: coarse)").matches || reducedMotion()) return;
    let frame = 0;
    const onMove = (event: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        root.querySelectorAll<HTMLElement>(".vg-sky.on [data-parallax], [data-vg-fg] [data-parallax]").forEach((el) => {
          const depth = parseFloat(el.dataset.parallax ?? "1") || 1;
          gsap.to(el, {
            x: ((event.clientX - cx) / cx) * -20 * depth,
            y: ((event.clientY - cy) / cy) * -30 * depth,
            ease: "power2.out",
            duration: 4,
          });
        });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Narration: starts when a chunk opens, stops when it closes. Words light up
  // with the audio, weighted by length (same approach as the other templates).
  useEffect(() => {
    const root = rootRef.current;
    if (view !== "chunk" || !root) return;
    const audio = root.querySelector<HTMLAudioElement>("audio");
    if (!audio) return;
    const words = Array.from(root.querySelectorAll<HTMLElement>(".vg-word"));
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
    // Music sits lower while the narrator speaks.
    const duck = () => music.current?.duck(true);
    const unduck = () => music.current?.duck(false);
    // Auto-scroll: when the narration ends, open the next chapter (nothing
    // happens after the last one, or when the switch is off or narration paused).
    const onEnded = () => {
      unduck();
      const { view: v, active: a } = live.current;
      if (v !== "chunk" || a !== active || a + 1 >= total) return;
      if (isAutoScrollOn() && !isNarrationPaused()) go("chunk", a + 1);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", duck);
    audio.addEventListener("pause", unduck);
    audio.addEventListener("ended", onEnded);
    const start = window.setTimeout(() => {
      audio.currentTime = 0;
      if (!isNarrationPaused()) audio.play().catch(() => {});
    }, 700);
    return () => {
      window.clearTimeout(start);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", duck);
      audio.removeEventListener("pause", unduck);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      unduck();
    };
  }, [view, active, total, go]);

  if (total === 0) {
    return <div className="p-10 text-sm text-neutral-400">This story has no chunks yet.</div>;
  }

  const prevDest = destinations[(active + total - 1) % total];
  const nextDest = destinations[(active + 1) % total];
  const inChunk = view === "chunk";
  const avatar = avatarForIndex(active, avatars);
  const chunk = chunks[active];
  const mounted = mountedIndices(active, total);
  const rootStyle = { "--vg-accent": current.palette.accent } as CSSProperties;

  return (
    <div ref={rootRef} className={`vg-root ${display.variable} ${body.variable}`} style={rootStyle}>
      <style>{VOYAGE_CSS}</style>
      <NarrationMasterControl theme={NARRATION_DOCK_THEMES.voyage} />
      <button
        type="button"
        onClick={() => {
          const engine = music.current;
          if (!engine) return;
          if (!engine.isStarted()) {
            engine.start();
            engine.setMuted(false);
          } else engine.setMuted(!engine.isMuted());
        }}
        className="vg-music"
        data-on={sound.started && !sound.muted}
      >
        <span className="vg-music-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: VOYAGE_MUSIC_ICON }} />
        <span className="vg-music-label">{sound.started && !sound.muted ? "Music: on" : "Music: off"}</span>
      </button>

      <div className="vg-backdrop" aria-hidden="true">
        {mounted.map((i) => {
          const dest = destinations[i];
          return (
            <div
              key={i}
              className={`vg-sky${i === active ? " on" : ""}`}
              style={dest.hueShift ? { filter: `hue-rotate(${dest.hueShift}deg)` } : undefined}
            >
              <div
                className="vg-sky-grad"
                style={{
                  background: `linear-gradient(180deg, ${dest.palette.gradient[0]} 0%, ${dest.palette.gradient[1]} 55%, ${dest.palette.gradient[2]} 100%)`,
                }}
              />
              <div className="vg-sky-layers">
                {dest.palette.sky.map((layer, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={j}
                    src={layer.src}
                    alt=""
                    className={j === 0 ? "vg-sky-twinkle" : undefined}
                    data-parallax={layer.depth !== undefined ? String(layer.depth) : undefined}
                    style={{ opacity: layer.opacity, transform: layer.rotate180 ? "rotate(180deg)" : undefined }}
                  />
                ))}
              </div>
              <div className="vg-sky-dim" style={{ background: dest.palette.overlay }} />
            </div>
          );
        })}
      </div>

      {!inChunk && (
        <div className="vg-select-fg" data-vg-fg="">
          <div className="vg-marquee" key={`m-${active}`} aria-hidden="true">
            <div className="vg-marquee-inner">
              {Array.from({ length: 8 }, (_, n) => (
                <span key={n}>{current.giantTitle}</span>
              ))}
            </div>
          </div>
          <div className="vg-rocks" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${VOYAGE_ASSET_ROOT}/rocks.svg`} alt="" data-parallax="0.8" />
          </div>
          {mounted.map((i) => {
            const pos = i === active ? "on" : i === (active + 1) % total ? "next" : "prev";
            return (
              <div key={i} className="vg-planet" data-pos={pos} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={destinations[i].palette.wheelPlanet}
                  alt=""
                  style={{ "--r": `${destinations[i].wheelAngle}deg` } as CSSProperties}
                />
              </div>
            );
          })}
          <div className="vg-select-card">
            <span className="vg-kicker">{title}</span>
            <h2>{current.fullTitle}</h2>
            <span className="vg-meta">
              Chapter {current.chapterLabel} · {current.duration}
            </span>
            <button type="button" className="vg-btn" onClick={() => go("chunk", active)}>
              Open chapter
            </button>
          </div>
        </div>
      )}

      {inChunk && (
        <>
          <ChunkArt key={`art-${active}`} dest={current} />
          <div className="vg-page" data-vg-fg="" key={`page-${active}`}>
            <section className="vg-hero">
              <div className="vg-stage">
                <div className="vg-hero-row">
                  <span>{current.chapterLabel}</span>
                  <span>{current.duration}</span>
                </div>
                <h1 className="vg-hero-title" style={{ fontSize: voyageTitleFontSize(current.giantTitle) }}>
                  {current.giantTitle}
                </h1>
                {avatar && (
                  <div className="vg-video">
                    <AvatarDisplay avatar={avatar} emotion={chunk.emotion} />
                  </div>
                )}
              </div>
            </section>

            <div className="vg-gap" />

            <section className="vg-info">
              <div className="vg-cards">
                <ChunkCard className="vg-card-1" tab={`Chapter ${pad2(active + 1)}`}>
                  <h3>{chunk.title}</h3>
                  <p className="vg-text" data-audio={chunk.audioUrl ? "" : undefined}>
                    {chunk.narrativeText
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((word, i) => (
                        <Fragment key={i}>
                          <span className="vg-word">{word}</span>{" "}
                        </Fragment>
                      ))}
                  </p>
                  {chunk.audioUrl && <audio src={chunk.audioUrl} />}
                </ChunkCard>
                <ChunkCard className="vg-card-2" tab="Key point" mirror>
                  {current.pullQuote && (
                    <blockquote className="vg-quote">
                      <p>{current.pullQuote}</p>
                    </blockquote>
                  )}
                  {current.bullets.length > 0 && (
                    <ul className="vg-points">
                      {current.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  <p className="vg-upnext">
                    {active + 1 < total ? (
                      <>
                        <span className="k">Up next</span>
                        <span>{nextDest.fullTitle}</span>
                      </>
                    ) : (
                      <span className="k">Final chapter</span>
                    )}
                  </p>
                </ChunkCard>
              </div>
            </section>

            <section className="vg-end">
              <p>{active + 1 < total ? `Up next: ${nextDest.fullTitle}` : "That was the last chapter."}</p>
              <button
                type="button"
                className="vg-btn vg-next"
                onClick={() => (active + 1 < total ? go("chunk", active + 1) : go("select", active))}
              >
                <span className="vg-next-bar" />
                <span style={{ position: "relative" }}>{active + 1 < total ? "Next chapter" : "All chapters"}</span>
              </button>
            </section>
          </div>
        </>
      )}

      {total > 1 && (
        <div className="vg-segs" role="group" aria-label="Chapters">
          {destinations.map((dest, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Chapter ${i + 1}: ${dest.fullTitle}`}
              aria-current={i === active ? "true" : undefined}
              className={i === active ? "on" : i < active ? "done" : undefined}
              onClick={() => (inChunk ? go("chunk", i) : select(i))}
            />
          ))}
        </div>
      )}

      <nav className="vg-nav" aria-label="Story navigation">
        <div className="vg-nav-edge" />
        <div className="vg-nav-frame">
          <div className="vg-nav-fill" ref={navFillRef} />
        </div>
        <div className="vg-nav-row">
          <button
            type="button"
            className="prev"
            disabled={inChunk ? active === 0 : total < 2}
            onClick={() => (inChunk ? go("chunk", active - 1) : select(active - 1))}
            title={prevDest.fullTitle}
          >
            ‹ {prevDest.giantTitle}
          </button>
          <button
            type="button"
            className="count"
            onClick={() => (inChunk ? go("select", active) : go("chunk", active))}
            title={inChunk ? "All chapters" : "Open chapter"}
          >
            {current.chapterLabel}
          </button>
          <button
            type="button"
            className="next"
            disabled={!inChunk && total < 2}
            onClick={() => {
              if (!inChunk) select(active + 1);
              else if (active + 1 < total) go("chunk", active + 1);
              else go("select", active);
            }}
            title={nextDest.fullTitle}
          >
            {inChunk && active + 1 >= total ? "Chapters ›" : `${nextDest.giantTitle} ›`}
          </button>
        </div>
      </nav>
    </div>
  );
}

function ChunkArt({ dest }: { dest: VoyageDestination }) {
  const tagline = dest.fullTitle.split(/\s+/).filter(Boolean).slice(0, 10);
  return (
    <div className="vg-art" aria-hidden="true">
      <div className="vg-tagline">
        <h2>
          {tagline.map((word, i) => (
            <Fragment key={i}>
              <span className="vg-mask">
                <span>{word}</span>
              </span>{" "}
            </Fragment>
          ))}
        </h2>
      </div>
      {dest.palette.art.map((layer) => {
        const { y, x = 0, rotate = 0, zoom = 1 } = layer.scrub;
        return (
          <div key={layer.key} className={`vg-art-layer vg-art-${layer.key}`} data-scrub={[y, x, rotate, zoom].join(",")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={layer.src} alt="" />
          </div>
        );
      })}
    </div>
  );
}

function ChunkCard({
  tab,
  mirror,
  className,
  children,
}: {
  tab: string;
  mirror?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`vg-card${mirror ? " mirror" : ""} ${className ?? ""}`}>
      <div className="vg-card-edge" />
      <h2 className="vg-card-tab">
        <span>{tab}</span>
      </h2>
      <div className="vg-card-body">{children}</div>
    </div>
  );
}
