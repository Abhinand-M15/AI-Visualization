"use client";

import { useEffect, useRef } from "react";
import { createTunnel } from "../scenes/Tunnel";
import { runWhenIdle } from "../shared/runWhenIdle";
import { useShowcase } from "../shared/ShowcaseContext";

const HEADING = "End of story";

export function CtaSection() {
  const { story } = useShowcase();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  // Arrival: the tunnel emerges from the dark while it settles from a zoomed-in
  // state (the video stage just zoomed in), and the heading scales up into place.
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const veil = veilRef.current;
    const head = headRef.current;
    if (!section || !stage || !canvas || !veil || !head) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let lastE = -1;
    const smooth = (a: number, b: number, x: number): number => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const update = (): void => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const entered = Math.min(1, Math.max(0, 1 - rect.top / window.innerHeight));
      const e = reduce.matches ? 1 : smooth(0.4, 1, entered);
      if (e === lastE) return;
      lastE = e;
      veil.style.opacity = (1 - e).toFixed(3);
      canvas.style.transform = `scale(${(1.32 - 0.32 * e).toFixed(4)})`;
      head.style.transform = `scale(${(0.82 + 0.18 * e).toFixed(4)})`;
      head.style.opacity = Math.min(1, e * 1.6).toFixed(3);
    };
    const schedule = (): void => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };

    // the letters rise once the stage is on screen
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          section.setAttribute("data-in", "1");
          io.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    io.observe(stage);

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const cancel = runWhenIdle(() => {
      cleanup = setup();
    }, 900);
    return () => {
      cancel();
      cleanup?.();
    };

    function setup(): (() => void) | undefined {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const getProgress = (): number => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / total));
    };

    const tunnel = createTunnel(canvas, getProgress);
    return () => tunnel.dispose();    }

  }, []);

  const words = HEADING.split(" ");

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "300vh", background: "#05060d", color: "#f0f1fa" }}
    >
      <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full will-change-transform"
          style={{ transform: "scale(1.32)" }}
          aria-hidden="true"
        />
        <div
          ref={headRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[var(--sc-pad-x)] text-center will-change-transform"
          style={{ transform: "scale(0.82)", opacity: 0 }}
        >
          <p
            className="mb-6 max-w-[80vw] text-[clamp(0.7rem,1vw,1rem)] uppercase tracking-[0.15em]"
            style={{ fontFamily: "var(--sc-font-mono), 'IBM Plex Mono', monospace" }}
          >
            {story.title}
          </p>
          <h2
            className="font-medium leading-[1] tracking-[-0.03em]"
            style={{
              fontFamily: "var(--sc-font-sans), sans-serif",
              fontSize: "9vw",
            }}
            aria-label={HEADING}
          >
            {words.map((word, wi) => (
              <span key={wi} className="inline-block whitespace-nowrap" aria-hidden="true">
                {Array.from(word).map((ch, ci) => (
                  <span
                    key={ci}
                    className="sc-cta-letter inline-block"
                    style={{ transitionDelay: `${(wi * 6 + ci) * 45}ms` }}
                  >
                    {ch}
                  </span>
                ))}
                {wi < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h2>
        </div>
        <div ref={veilRef} aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "#05060d" }} />
        <div
          className="absolute bottom-[var(--sc-pad-y)] left-0 right-0 text-center text-[0.75rem] uppercase tracking-[0.15em]"
          style={{ fontFamily: "var(--sc-font-mono), 'IBM Plex Mono', monospace" }}
        >
          SCROLL TO THE END
        </div>
      </div>
      <style>{`
        .sc-cta-letter {
          opacity: 0;
          transform: translateY(60%) rotate(6deg);
          transition: opacity 1.1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        [data-in] .sc-cta-letter {
          opacity: 1;
          transform: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .sc-cta-letter { transition: none; opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
