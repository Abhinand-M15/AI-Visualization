"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Avatar } from "@/lib/avatars";
import { getAvatarImage } from "@/lib/avatars";
import type { CaseStudySection } from "@/lib/caseStudySections";
import { avatarForIndex } from "./types";
import { ASMRBackground } from "@/components/ui/asmr-background";
import { LunarBackground } from "@/components/ui/lunar-background";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export type CaseStudyTheme = "light" | "space" | "lunar";

export interface CaseStudyTemplateProps {
  title: string;
  sections: CaseStudySection[];
  sectionAudio: Record<string, string>;
  avatars: Avatar[];
  /** Renders the Space/Lunar template's backdrop + dark glass-panel copy instead of the plain white layout. */
  theme?: CaseStudyTheme;
}

const THEME_CONFIG: Record<CaseStudyTheme, { label: string | null; accent: string; border: string; glow: string }> = {
  light: { label: null, accent: "text-neutral-400", border: "border-neutral-100", glow: "" },
  space: {
    label: "Space",
    accent: "text-white/30",
    border: "border-white/5",
    glow: "drop-shadow-[0_0_60px_rgba(180,220,255,0.15)]",
  },
  lunar: {
    label: "Lunar",
    accent: "text-cyan-200/50",
    border: "border-cyan-500/10",
    glow: "drop-shadow-[0_0_60px_rgba(120,180,255,0.2)]",
  },
};

/**
 * The case-study experience — pixel-for-pixel the same pinned-avatar,
 * big-text, word-highlight-as-spoken pattern as EditorialTemplate, just
 * walking the fixed Company → Domain → Customer → Problem → Solution →
 * Impact sections produced by the layout-binding agent (see
 * caseStudySections.ts) instead of raw chunks. Case-study projects always
 * use this layout regardless of selectedTemplateId (see renderStaticSite) —
 * `theme` is how they still pick up the Space/Lunar templates' backgrounds
 * rather than losing access to them entirely.
 */
export default function CaseStudyTemplate({ title, sections, sectionAudio, avatars, theme = "light" }: CaseStudyTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme !== "light";
  const { label, accent, border, glow } = THEME_CONFIG[theme];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sectionEls = gsap.utils.toArray<HTMLElement>(".case-study-section");
      let currentAudio: HTMLAudioElement | null = null;
      let currentHandler: (() => void) | null = null;
      const spokenClass = isDark ? "text-white" : "text-neutral-900";
      const unspokenClass = isDark ? "text-white/25" : "text-neutral-300";

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

        function onTimeUpdate() {
          if (!audio.duration) return;
          const targetWeight = (audio.currentTime / audio.duration) * totalWeight;
          let activeIndex = cumulativeWeights.findIndex((w) => w >= targetWeight);
          if (activeIndex === -1) activeIndex = words.length - 1;
          words.forEach((word, i) => {
            word.classList.toggle(spokenClass, i <= activeIndex);
            word.classList.toggle(unspokenClass, i > activeIndex);
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
          audio.play().catch(() => {
            // Autoplay can be blocked before the user has interacted with the page —
            // the visible <audio> controls still let them start it manually.
          });
          currentAudio = audio;
          trackHighlight(audio, words);
        }
      }

      sectionEls.forEach((section) => {
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
          section.querySelector(".case-study-copy"),
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
  }, [sections, theme]);

  return (
    <div ref={containerRef} className={isDark ? "relative text-white" : "bg-white text-neutral-900"}>
      {theme === "space" && <ASMRBackground />}
      {theme === "lunar" && <LunarBackground />}
      <header className="relative px-10 pb-16 pt-24">
        {label && <span className={`text-xs font-light uppercase tracking-[0.4em] ${accent}`}>{label}</span>}
        <h1 className={`max-w-3xl text-4xl font-medium leading-tight md:text-5xl ${isDark ? "mt-4" : ""}`}>
          {title}
        </h1>
      </header>

      {sections.map((section, index) => {
        const avatar = avatarForIndex(index, avatars);
        const avatarImage = avatar ? getAvatarImage(avatar, section.emotion) : undefined;
        const words = section.body.split(/\s+/).filter(Boolean);
        const audioUrl = sectionAudio[section.key];
        const isReversed = index % 2 === 1;

        return (
          <section
            key={section.key}
            className={`case-study-section relative flex min-h-screen flex-col items-center gap-10 px-8 py-20 md:gap-16 md:px-16 border-t ${border} ${
              isReversed ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div className="flex w-full flex-shrink-0 justify-center md:w-[36%]">
              {avatarImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarImage}
                  alt=""
                  className={`h-[280px] w-[280px] object-contain md:h-[420px] md:w-[420px] ${glow}`}
                />
              )}
            </div>

            <div
              className={`case-study-copy flex w-full flex-col gap-6 md:w-[64%] ${
                isDark ? `rounded-2xl border ${border} bg-white/[0.02] p-8 backdrop-blur-sm` : ""
              }`}
            >
              <span className={`text-xs font-medium uppercase tracking-wide ${accent}`}>
                {section.sectionLabel}
              </span>
              <h2 className="text-2xl font-medium md:text-3xl">{section.title}</h2>
              <p
                className="font-medium leading-[1.15] tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 4.6vw, 5rem)" }}
              >
                {words.map((word, i) => (
                  <span
                    key={i}
                    className={`word transition-colors duration-150 ${isDark ? "text-white/25" : "text-neutral-300"}`}
                  >
                    {word}{" "}
                  </span>
                ))}
              </p>
              {audioUrl && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio controls src={audioUrl} className="mt-2 h-9 max-w-sm" />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
