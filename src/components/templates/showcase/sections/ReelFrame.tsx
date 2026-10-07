"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const CROSS_POSITIONS = [0, 25, 50, 75, 100] as const;
const GLYPH_COUNT = 8;
const TITLE = "PLAY STORY";
const LETTER_STAGGER_MS = 18;
const MARQUEE_MS = 15000;
const MARQUEE_HOVER_RATE = 3;
const CANVAS_W = 960;
const CANVAS_H = 600;

const BLOB_COLORS = ["#5a90ff", "#1a2ffb", "#2a38ee", "#5a90ff", "#1a2ffb"] as const;

function drawPlaceholder(ctx: CanvasRenderingContext2D, t: number): void {
  const w = CANVAS_W;
  const h = CANVAS_H;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#2a38ee";
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 6; i += 1) {
    const phase = t * 0.00035 * (1 + i * 0.17) + i * 1.3;
    const cx = w * (0.5 + 0.46 * Math.sin(phase));
    const cy = h * (0.5 + 0.42 * Math.cos(phase * 0.8 + i));
    const r = Math.max(w, h) * (0.3 + 0.12 * Math.sin(phase * 1.7));
    const color = BLOB_COLORS[i % BLOB_COLORS.length];
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `${color}d9`);
    g.addColorStop(1, `${color}00`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // faint drifting diagonal bands
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.35);
  const step = Math.max(w, h) / 8;
  const offset = (t * 0.025) % (step * 2);
  ctx.fillStyle = "rgba(255,255,255,0.055)";
  for (let x = -w * 1.5 - step * 2; x < w * 1.5; x += step * 2) {
    ctx.fillRect(x + offset, -h * 1.5, step, h * 3);
  }
  ctx.restore();
}

function Cross({ left }: { left: number }) {
  const hideBelowLg = left === 25 || left === 75;
  return (
    <span
      aria-hidden="true"
      className={`absolute top-1/2 block -translate-x-1/2 -translate-y-1/2 text-[clamp(10px,1.1cqw,28px)] leading-none text-white ${
        hideBelowLg ? "max-lg:hidden" : ""
      }`}
      style={{ left: `${left}%` }}
    >
      +
    </span>
  );
}

function Glyph({ index }: { index: number }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
  } as const;
  let shape: ReactNode;
  switch (index % 4) {
    case 0:
      shape = <circle cx="12" cy="12" r="8" {...common} />;
      break;
    case 1:
      shape = <rect x="4" y="4" width="16" height="16" {...common} />;
      break;
    case 2:
      shape = <path d="M12 3 L21 20 H3 Z" {...common} />;
      break;
    default:
      shape = <path d="M4 12 H20 M12 4 V20" {...common} />;
  }
  return (
    <span className="block shrink-0 px-[clamp(8px,1.5cqw,32px)]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="block h-[clamp(8px,1.5cqw,30px)] w-[clamp(8px,1.5cqw,30px)] text-white"
      >
        {shape}
      </svg>
    </span>
  );
}

interface DecorRowProps {
  strip: React.RefObject<HTMLDivElement | null>;
  position: "top" | "bottom";
}

function DecorRow({ strip, position }: DecorRowProps) {
  const crosses = (
    <div className="relative mx-[2.4cqw] h-[clamp(10px,1.4cqw,32px)]">
      {CROSS_POSITIONS.map((left) => (
        <Cross key={left} left={left} />
      ))}
    </div>
  );
  const glyphs = (
    <div className="overflow-hidden">
      <div ref={strip} className="flex w-max will-change-transform">
        {Array.from({ length: GLYPH_COUNT * 2 }, (_, i) => (
          <Glyph key={i} index={i} />
        ))}
      </div>
    </div>
  );
  return (
    <div
      className={`absolute inset-x-0 flex flex-col gap-[0.8cqw] ${
        position === "top" ? "top-[1.6cqw]" : "bottom-[1.6cqw]"
      }`}
    >
      {position === "top" ? (
        <>
          {crosses}
          {glyphs}
        </>
      ) : (
        <>
          {glyphs}
          {crosses}
        </>
      )}
    </div>
  );
}

interface PhoneCardProps {
  className: string;
  parallax: number;
}

function PhoneCard({ className, parallax }: PhoneCardProps) {
  const style: CSSProperties = {
    transform: `translate3d(0, calc(var(--reel-par, 0) * ${parallax}cqw), 0)`,
    background:
      "linear-gradient(165deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.07) 55%, rgba(26,47,251,0.25) 100%)",
  };
  return (
    <div
      aria-hidden="true"
      className={`absolute aspect-[9/16] rounded-[1.6cqw] border border-white/30 ${className}`}
      style={style}
    >
      <span className="absolute left-1/2 top-[3%] block h-[1.8%] w-[28%] -translate-x-1/2 rounded-full bg-white/40" />
    </div>
  );
}

export interface ReelFrameProps {
  /** Picture behind the title. When omitted, an animated canvas renders. */
  children?: ReactNode;
  /** Called when the play button is pressed. */
  onPlay?: () => void;
  className?: string;
}

export function ReelFrame({ children, onPlay, className = "" }: ReelFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const topStripRef = useRef<HTMLDivElement>(null);
  const bottomStripRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Placeholder canvas loop (only runs while visible and no media is supplied)
  const hasMedia = children !== undefined && children !== null;
  useEffect(() => {
    if (!visible || hasMedia) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const loop = (t: number) => {
      drawPlaceholder(ctx, t);
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, hasMedia]);

  // Marquee strips: top row drifts left, bottom row drifts right
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = topStripRef.current;
    const bottom = bottomStripRef.current;
    if (reduce || !top || !bottom) return;
    const options: KeyframeAnimationOptions = {
      duration: MARQUEE_MS,
      iterations: Infinity,
      easing: "linear",
    };
    const a = top.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }],
      options
    );
    const b = bottom.animate(
      [{ transform: "translateX(-50%)" }, { transform: "translateX(0)" }],
      options
    );
    const setRate = (rate: number) => {
      a.playbackRate = rate;
      b.playbackRate = rate;
    };
    const onEnter = () => setRate(MARQUEE_HOVER_RATE);
    const onLeave = () => setRate(1);
    const root = rootRef.current;
    root?.addEventListener("pointerenter", onEnter);
    root?.addEventListener("pointerleave", onLeave);
    return () => {
      root?.removeEventListener("pointerenter", onEnter);
      root?.removeEventListener("pointerleave", onLeave);
      a.cancel();
      b.cancel();
    };
  }, []);

  // Scroll parallax for the phone cards: -1 (frame below) .. 1 (frame above)
  useEffect(() => {
    if (!visible) return;
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = rect.top + rect.height / 2;
      const par = Math.max(-1, Math.min(1, (center - vh / 2) / vh));
      el.style.setProperty("--reel-par", par.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [visible]);

  return (
    <div
      ref={rootRef}
      className={`group/reel relative h-full w-full overflow-hidden bg-[#2a38ee] [container-type:inline-size] ${className}`}
    >
      {/* children: the story's picture; without it the animated canvas shows */}
      {hasMedia ? (
        <div className="absolute inset-0 [&>*]:h-full [&>*]:w-full [&>video]:object-cover">
          {children}
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          role="img"
          aria-label="Animated background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <DecorRow strip={topStripRef} position="top" />
      <DecorRow strip={bottomStripRef} position="bottom" />

      {/* Phone card placeholders */}
      <PhoneCard className="left-[10%] top-[18%] w-[13cqw]" parallax={-5} />
      <PhoneCard className="right-[10%] top-[34%] w-[13cqw]" parallax={-3} />

      {/* Title */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 m-0 flex -translate-y-1/2 justify-center whitespace-pre text-[10cqw] font-medium leading-none text-white"
      >
        {TITLE.split("").map((letter, i) => (
          <span key={i} className="relative block overflow-hidden">
            <span
              className="relative block transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/reel:-translate-y-full"
              style={{ transitionDelay: `${i * LETTER_STAGGER_MS}ms` }}
            >
              {letter === " " ? " " : letter}
              <span className="absolute left-0 top-full block">
                {letter === " " ? " " : letter}
              </span>
            </span>
          </span>
        ))}
      </p>

      {/* Centre phone card overlaps the title */}
      <PhoneCard
        className="left-1/2 top-[22%] w-[16cqw] -ml-[8cqw]"
        parallax={-8}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          aria-label="Start the story"
          onClick={onPlay}
          className="flex h-[clamp(36px,7cqw,120px)] w-[clamp(36px,7cqw,120px)] items-center justify-center rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-110 focus-visible:scale-110"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="ml-[6%] h-[34%] w-[34%] text-[#1a2ffb]"
          >
            <path d="M6 3.5 L20 12 L6 20.5 Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
