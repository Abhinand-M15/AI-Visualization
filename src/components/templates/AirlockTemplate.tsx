"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AirlockHero from "@/components/ui/airlock-spaceship-hero";
import { avatarForIndex, type TemplateProps } from "./types";
import { AvatarDisplay } from "./AvatarDisplay";
import { NarrationMasterControl } from "@/components/ui/NarrationMasterControl";
import { isNarrationPaused } from "@/lib/narrationControl";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Opens with the scroll-locked, scrub-driven video hero (see
 * components/ui/airlock-spaceship-hero.tsx) — scroll is captured and spent
 * on the video's currentTime until it finishes, then handed back to the page
 * for the normal chunked story below, styled to match the hero's dark
 * "vacuum" palette so the hand-off doesn't jar.
 */
export default function AirlockTemplate({ title, chunks, avatars }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(".airlock-section");
      let currentAudio: HTMLAudioElement | null = null;
      let currentHandler: (() => void) | null = null;

      function stopHighlightTracking() {
        if (currentAudio && currentHandler) currentAudio.removeEventListener("timeupdate", currentHandler);
        currentHandler = null;
      }

      // See SpaceTemplate.tsx for why this is "timeupdate"-driven (not
      // requestAnimationFrame) and why word timing is character-weighted
      // rather than split into equal-length slices.
      function trackHighlight(audio: HTMLAudioElement, words: HTMLElement[]) {
        const weights = words.map((word) => (word.textContent?.trim().length ?? 0) + 3);
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const cumulativeWeights = weights.reduce<number[]>((acc, w) => {
          acc.push((acc[acc.length - 1] ?? 0) + w);
          return acc;
        }, []);

        function onTimeUpdate() {
          if (!audio.duration) return;
          const targetWeight = (audio.currentTime / audio.duration) * totalWeight;
          let activeIndex = cumulativeWeights.findIndex((w) => w >= targetWeight);
          if (activeIndex === -1) activeIndex = words.length - 1;
          words.forEach((word, i) => {
            word.classList.toggle("text-white", i <= activeIndex);
            word.classList.toggle("text-white/25", i > activeIndex);
          });
        }
        audio.addEventListener("timeupdate", onTimeUpdate);
        currentHandler = onTimeUpdate;
      }

      function activateSection(section: HTMLElement) {
        const audio = section.querySelector<HTMLAudioElement>("audio");
        const words = Array.from(section.querySelectorAll<HTMLElement>(".word"));
        if (currentAudio && currentAudio !== audio) currentAudio.pause();
        stopHighlightTracking();
        if (audio) {
          audio.currentTime = 0;
          if (!isNarrationPaused()) {
            audio.play().catch(() => {
              // Autoplay can be blocked before the user has interacted with the page —
              // the visible <audio> controls still let them start it manually.
            });
          }
          currentAudio = audio;
          trackHighlight(audio, words);
        }
      }

      sections.forEach((section) => {
        const audio = section.querySelector<HTMLAudioElement>("audio");

        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => activateSection(section),
          onEnterBack: () => activateSection(section),
          onLeave: () => audio?.pause(),
          onLeaveBack: () => audio?.pause(),
        });

        gsap.fromTo(
          section.querySelector(".airlock-copy"),
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 75%" },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [chunks]);

  return (
    <div ref={containerRef} className="relative bg-[#05070d] text-[#f2f4f8]">
      <NarrationMasterControl />
      <AirlockHero title={title} />

      {chunks.map((chunk, index) => {
        const avatar = avatarForIndex(index, avatars);
        const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
        const isReversed = index % 2 === 1;

        return (
          <section
            key={chunk.id}
            className={`airlock-section relative flex min-h-screen flex-col items-center gap-10 border-t border-white/5 px-8 py-20 md:gap-16 md:px-16 ${
              isReversed ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div className="flex w-full flex-shrink-0 justify-center md:w-[36%]">
              {avatar && (
                <AvatarDisplay
                  avatar={avatar}
                  emotion={chunk.emotion}
                  className="h-[340px] w-[340px] object-contain drop-shadow-[0_0_60px_rgba(255,255,255,0.1)] md:h-[520px] md:w-[520px]"
                />
              )}
            </div>

            <div className="airlock-copy flex w-full flex-col gap-6 rounded-2xl border border-white/15 bg-black/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)] md:w-[64%]">
              <span className="text-xs font-medium uppercase tracking-wide text-white/40">
                {String(index + 1).padStart(2, "0")} / {String(chunks.length).padStart(2, "0")}
              </span>
              <h2 className="text-2xl font-medium md:text-3xl">{chunk.title}</h2>
              <p
                className="font-medium leading-[1.15] tracking-tight"
                style={{ fontSize: "clamp(1.5rem, 3.2vw, 3rem)" }}
              >
                {words.map((word, i) => (
                  <span key={i} className="word text-white/25 transition-colors duration-150">
                    {word}{" "}
                  </span>
                ))}
              </p>
              {chunk.audioUrl && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio controls src={chunk.audioUrl} className="mt-2 h-9 max-w-sm" />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
