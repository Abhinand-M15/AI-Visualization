"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { chapterPicture } from "@/lib/showcase";
import { useShowcase } from "../shared/ShowcaseContext";
import { ReelFrame } from "./ReelFrame";
import { ReelMorphScene } from "./ReelMorphScene";

/** The first chapter's title as one or two balanced lines of at most five words. */
function titleLines(title: string): string[][] {
  const words = title.trim().split(/\s+/).filter(Boolean).slice(0, 5);
  if (words.length === 0) return [["Chapter", "One"]];
  if (words.length <= 2) return [words];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut), words.slice(cut)];
}

const TITLE_BASE_DELAY = 0.1;
const TITLE_STAGGER = 0.08;
const DESC_BASE_DELAY = 0.5;
const DESC_STAGGER = 0.06;
const TITLE_EASE = "cubic-bezier(.16,1,.3,1)";

const TITLE_PARALLAX_PX = 160;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function ReelSection() {
  const { story, router } = useShowcase();
  const first = story.chapters[0];
  const lines = titleLines(first?.title ?? "");
  const lineOffsets = lines.map((_, i) => lines.slice(0, i).reduce((n, l) => n + l.length, 0));
  const descriptionWords = (first?.summary ?? "").split(" ").filter(Boolean);
  const picture = first ? chapterPicture(first) : undefined;
  const startStory = () => router.push(first?.href ?? "#/");
  const sectionRef = useRef<HTMLElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const titleInnerRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  // Reveal when the title top enters the viewport
  useEffect(() => {
    const el = titleWrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Description: stagger per visual line (measured from word positions)
  useEffect(() => {
    const p = descRef.current;
    if (!p) return;
    const assign = () => {
      const words = p.querySelectorAll<HTMLElement>("[data-desc-word]");
      let line = -1;
      let lastTop = Number.NEGATIVE_INFINITY;
      words.forEach((word) => {
        if (Math.abs(word.offsetTop - lastTop) > 2) {
          line += 1;
          lastTop = word.offsetTop;
        }
        word.style.transitionDelay = `${(
          DESC_BASE_DELAY +
          line * DESC_STAGGER
        ).toFixed(3)}s`;
      });
    };
    assign();
    window.addEventListener("resize", assign);
    const fonts = document.fonts;
    if (fonts) void fonts.ready.then(assign);
    return () => window.removeEventListener("resize", assign);
  }, []);

  // Title parallax, driven by scroll
  useEffect(() => {
    const titleWrap = titleWrapRef.current;
    const titleInner = titleInnerRef.current;
    if (!titleWrap || !titleInner) return;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateTitle = () => {
      if (reduceMq.matches) {
        titleInner.style.removeProperty("transform");
        return;
      }
      const rect = titleWrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const t = clamp01((vh - rect.top) / (vh * 1.5));
      titleInner.style.transform = `translate3d(0, ${(
        -TITLE_PARALLAX_PX *
        (1 - t)
      ).toFixed(2)}px, 0)`;
    };

    updateTitle();
    window.addEventListener("scroll", updateTitle, { passive: true });
    window.addEventListener("resize", updateTitle);
    reduceMq.addEventListener("change", updateTitle);
    return () => {
      window.removeEventListener("scroll", updateTitle);
      window.removeEventListener("resize", updateTitle);
      reduceMq.removeEventListener("change", updateTitle);
    };
  }, []);

  return (
    <section
      className="relative z-[1] w-full bg-transparent pb-[var(--sc-pad-y)] pt-[calc(var(--sc-pad-y)*3)] text-black"
      ref={sectionRef}
      style={{ fontFamily: "var(--sc-font-sans), sans-serif" }}
    >
      <div
        className="grid grid-cols-12 items-start"
        style={{
          paddingInline: "var(--sc-pad-x)",
          columnGap: "var(--sc-grid-gap)",
          rowGap: "4vw",
        }}
      >
        <div ref={titleWrapRef} className="col-span-12">
          <div ref={titleInnerRef} className="will-change-transform">
            <h2 className="m-0 text-[13vw] font-medium leading-none text-black md:text-[9vw]">
              {lines.map((line, li) => (
                <span
                  key={li}
                  className="-mb-[0.14em] block overflow-hidden pb-[0.14em]"
                >
                  {line.map((word, wi) => {
                    const i = lineOffsets[li] + wi;
                    return (
                      <span
                        key={wi}
                        className="mr-[0.24em] inline-block align-top motion-reduce:transition-none"
                        style={{
                          transform: revealed
                            ? "translate3d(0,0,0)"
                            : "translate3d(200px,100%,0)",
                          transition: `transform 1.1s ${TITLE_EASE} ${(
                            TITLE_BASE_DELAY +
                            i * TITLE_STAGGER
                          ).toFixed(2)}s`,
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </span>
              ))}
            </h2>
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-[4vw] md:gap-[2.5vw]">
          <p
            ref={descRef}
            className="m-0 w-full text-[4.2vw] leading-[1.15] text-black md:w-7/12 md:text-[2vw]"
          >
            {descriptionWords.map((word, i) => (
              <Fragment key={i}>
                <span
                  data-desc-word
                  className="inline-block transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
                  style={{
                    opacity: revealed ? 1 : 0,
                    transform: revealed
                      ? "translate3d(0,0,0)"
                      : "translate3d(0,0.6em,0)",
                  }}
                >
                  {word}
                </span>{" "}
              </Fragment>
            ))}
          </p>

          <div
            className="w-fit transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translate3d(0,0,0)" : "translate3d(0,24px,0)",
              transitionDelay: `${DESC_BASE_DELAY + 0.4}s`,
            }}
          >
            <a
              href={first?.href ?? "#/"}
              className="group inline-flex items-center gap-3 rounded-full border border-black bg-transparent px-5 py-3 text-black no-underline transition-[background-color,color,border-color] duration-[400ms] hover:border-[#1a2ffb] hover:bg-[#1a2ffb] hover:text-white focus-visible:border-[#1a2ffb] focus-visible:bg-[#1a2ffb] focus-visible:text-white"
              style={{ fontSize: "var(--sc-header-size)" }}
            >
              <span
                aria-hidden="true"
                className="block h-2 w-2 rounded-full bg-[#1a2ffb] transition-[transform,background-color] duration-[400ms] group-hover:scale-[1.8] group-hover:bg-white group-focus-visible:scale-[1.8] group-focus-visible:bg-white"
              />
              <span>Start reading</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-4 w-4 transition-transform duration-[400ms] group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5"
              >
                <path
                  d="M2 8 H13 M9 4 L13 8 L9 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Desktop: tall track, sticky stage; a WebGL card morphs from thumbnail to full reel */}
      <div ref={trackRef} className="mt-[4vw] hidden md:block md:h-[360vh]">
        <div
          ref={stageRef}
          className="relative sticky top-0 h-screen"
          style={{ paddingInline: "var(--sc-pad-x)" }}
        >
          <ReelMorphScene
            trackRef={trackRef}
            picture={picture}
            avatarImage={first?.avatarImage}
            avatarVideo={first?.avatarVideo}
            avatarVideoFallback={first?.avatarVideoFallback}
            onPlay={startStory}
          />
        </div>
      </div>

      {/* Mobile: static frame, no morph */}
      <div className="mt-[4vw] px-[var(--sc-pad-x)] md:hidden">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-[#2a38ee]">
          <ReelFrame onPlay={startStory}>
            {picture && (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={picture} alt="" className="absolute inset-0 h-full w-full object-cover" />
                {first?.avatarImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={first.avatarImage} alt="" className="absolute inset-x-0 bottom-0 mx-auto h-[78%] w-auto max-w-[80%] object-contain" />
                )}
              </div>
            )}
          </ReelFrame>
        </div>
      </div>
    </section>
  );
}
