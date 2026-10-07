"use client";

import { useEffect, useRef } from "react";
import { createHeroCrosses } from "../scenes/HeroCrosses";
import { runWhenIdle } from "../shared/runWhenIdle";
import { useShowcase } from "../shared/ShowcaseContext";

const CROSS_POSITIONS = ["0%", "33.33%", "66.66%", "100%"] as const;

export function HeroSection() {
  const { story } = useShowcase();
  const count = story.chapters.length;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const cancel = runWhenIdle(() => {
      cleanup = setup();
    }, 100);
    return () => {
      cancel();
      cleanup?.();
    };

    function setup(): (() => void) | undefined {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: { dispose(): void } | null = null;
    try {
      scene = createHeroCrosses(canvas);
    } catch {
      scene = null;
    }
    return () => {
      scene?.dispose();
    };    }

  }, []);

  return (
    <section
      className="flex min-h-screen w-full flex-col bg-[#f0f1fa] text-black"
      style={{
        fontFamily: "var(--sc-font-sans), sans-serif",
        padding: "calc(var(--sc-pad-y) * 2) var(--sc-pad-x) var(--sc-pad-y)",
        gap: "calc(var(--sc-pad-y) * 1.2)",
      }}
    >
      <div
        className="grid w-full grid-cols-12"
        style={{ columnGap: "var(--sc-grid-gap)" }}
      >
        <div className="col-span-6 md:col-[4/span_5]">
          <h1 className="m-0 text-[6vw] leading-[1.1] font-normal text-black md:text-[2.5vw]">
            {story.title}
          </h1>
          <p className="mt-[1.2em] max-w-[34em] text-[3.6vw] leading-[1.3] text-black/60 md:text-[1.05vw]">
            A story told in {count} {count === 1 ? "chapter" : "chapters"}. Scroll to begin, then open any chapter to read it and listen.
          </p>
        </div>
      </div>

      <div
        className="relative h-[70vh] w-full overflow-hidden bg-[#0a0d1a] md:h-[450px]"
        style={{ borderRadius: "var(--sc-radius)" }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>

      <div className="relative mt-auto flex h-8 w-full items-center justify-center">
        {CROSS_POSITIONS.map((left) => (
          <span
            key={left}
            aria-hidden="true"
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 leading-none font-light"
            style={{ left, fontSize: "var(--sc-cross-size)" }}
          >
            +
          </span>
        ))}
        <span className="text-xs font-medium tracking-wide uppercase">
          Scroll to begin
        </span>
      </div>
    </section>
  );
}
