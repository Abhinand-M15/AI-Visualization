"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ASMRBackground } from "@/components/ui/asmr-background";
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

const CHAPTER_THEME = CHAPTER_THEMES.space;

export default function SpaceTemplate({ title, chunks, avatars, logoUrl }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useNarrationAutoScroll(containerRef, ".space-section");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(".space-section");
      let currentAudio: HTMLAudioElement | null = null;
      let currentHandler: (() => void) | null = null;

      function stopHighlightTracking() {
        if (currentAudio && currentHandler) currentAudio.removeEventListener("timeupdate", currentHandler);
        currentHandler = null;
      }

      // Driven by the <audio> element's own "timeupdate" event rather than
      // requestAnimationFrame — rAF is tied to the page's paint loop, which
      // browsers throttle or pause outright once a tab isn't the actively
      // rendered one, silently freezing the highlight mid-playback even
      // though the audio itself keeps going. "timeupdate" is a native media
      // event that fires from the audio/video decode pipeline, independent
      // of paint throttling, so the highlight can't desync from playback.
      //
      // The TTS server doesn't return real per-word timestamps, so word
      // position is estimated from elapsed time — but weighted by each
      // word's character count (plus a fixed per-word floor) rather than
      // splitting the audio into equal-length slices. Equal slices visibly
      // drift out of sync on real narration ("a" and "extraordinarily" do
      // not take the same time to say); length-weighting tracks natural
      // speech pacing far more closely.
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
    <div ref={containerRef} className="relative text-white">
      <ASMRBackground />
      <NarrationMasterControl theme={NARRATION_DOCK_THEMES.space} />
      <StoryLogo logoUrl={logoUrl} />

      <header className="relative px-10 pb-16 pt-24">
        <span className="text-xs font-light uppercase tracking-[0.4em] text-white/30">Space</span>
        <h1 className="mt-4 max-w-3xl text-2xl font-medium leading-tight md:text-[1.75rem]">{title}</h1>
      </header>

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
            className="space-section relative border-t border-white/5 px-6 py-16 md:px-12 md:py-24"
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
