"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AirlockHero from "@/components/ui/airlock-spaceship-hero";
import { avatarForIndex, type TemplateProps } from "./types";
import { AvatarDisplay } from "./AvatarDisplay";
import { ChapterLayout, SceneImg, type ChapterMediaItem } from "./ChapterLayout";
import { CHAPTER_THEMES, chapterLists } from "@/lib/chapterLayout";
import { StoryLogo } from "./StoryLogo";
import { NarrationMasterControl } from "@/components/ui/NarrationMasterControl";
import { NARRATION_DOCK_THEMES } from "@/lib/narrationDock";
import { isNarrationPaused } from "@/lib/narrationControl";
import { useNarrationAutoScroll } from "@/lib/useNarrationAutoScroll";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const CHAPTER_THEME = CHAPTER_THEMES.airlock;

/**
 * Opens with the scroll-locked, scrub-driven video hero (see
 * components/ui/airlock-spaceship-hero.tsx) — scroll is captured and spent
 * on the video's currentTime until it finishes, then handed back to the page
 * for the normal chunked story below, styled to match the hero's dark
 * "vacuum" palette so the hand-off doesn't jar.
 */
export default function AirlockTemplate({ title, chunks, avatars, logoUrl }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useNarrationAutoScroll(containerRef, ".airlock-section");

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

        // Only the words between the previous and the new position are
        // touched; the first event after a (re)start repaints them all.
        let shown = -2;
        function setSpoken(word: HTMLElement, spoken: boolean) {
          word.classList.toggle("text-white", spoken);
          word.classList.toggle("text-white/25", !spoken);
        }
        function onTimeUpdate() {
          if (!audio.duration) return;
          const targetWeight = (audio.currentTime / audio.duration) * totalWeight;
          let activeIndex = cumulativeWeights.findIndex((w) => w >= targetWeight);
          if (activeIndex === -1) activeIndex = words.length - 1;
          if (activeIndex === shown) return;
          if (shown === -2) words.forEach((word, i) => setSpoken(word, i <= activeIndex));
          else if (activeIndex > shown) for (let i = shown + 1; i <= activeIndex; i++) setSpoken(words[i], true);
          else for (let i = activeIndex + 1; i <= shown; i++) setSpoken(words[i], false);
          shown = activeIndex;
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
              // scrolling the section back into view tries again.
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
      });
    }, containerRef);
    return () => ctx.revert();
  }, [chunks]);

  return (
    <div ref={containerRef} className="relative bg-[#05070d] text-[#f2f4f8]">
      <NarrationMasterControl theme={NARRATION_DOCK_THEMES.airlock} />
      <StoryLogo logoUrl={logoUrl} />
      <AirlockHero title={title} />

      {chunks.map((chunk, index) => {
        const avatar = avatarForIndex(index, avatars);
        const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
        const media: ChapterMediaItem[] = [];
        if (chunk.imageUrl) media.push({ kind: "scene", node: <SceneImg src={chunk.imageUrl} /> });
        if (avatar) {
          media.push({
            kind: "avatar",
            node: <AvatarDisplay avatar={avatar} emotion={chunk.emotion} className="h-full w-full object-contain" />,
          });
        }

        return (
          <section
            key={chunk.id}
            className="airlock-section relative border-t border-white/5 px-6 py-16 md:px-12 md:py-24"
          >
            <ChapterLayout
              theme={CHAPTER_THEME}
              index={index}
              total={chunks.length}
              eyebrow={`${String(index + 1).padStart(2, "0")} / ${String(chunks.length).padStart(2, "0")}`}
              title={chunk.title}
              media={media}
              lists={chapterLists(chunks.map((c) => ({ title: c.title, text: c.narrativeText })), index)}
            >
              <p
                className="font-medium leading-normal tracking-tight"
                style={{ fontSize: "clamp(0.9375rem, 1.25vw, 1.125rem)" }}
              >
                {words.map((word, i) => (
                  <span key={i} className="word text-white/25 transition-colors duration-150">
                    {word}{" "}
                  </span>
                ))}
              </p>
              {chunk.audioUrl && <audio src={chunk.audioUrl} />}
            </ChapterLayout>
          </section>
        );
      })}
    </div>
  );
}
