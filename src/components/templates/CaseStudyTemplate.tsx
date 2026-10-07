"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Avatar } from "@/lib/avatars";
import type { CaseStudySection } from "@/lib/caseStudySections";
import { avatarForIndex } from "./types";
import { AvatarDisplay } from "./AvatarDisplay";
import { StoryLogo } from "./StoryLogo";
import { ChapterLayout, type ChapterMediaItem } from "./ChapterLayout";
import { CHAPTER_THEMES, chapterLists } from "@/lib/chapterLayout";
import { ASMRBackground } from "@/components/ui/asmr-background";
import { lunarHeroDescription } from "@/lib/lunarHero";
import { LunarHero } from "./LunarHero";
import AirlockHero from "@/components/ui/airlock-spaceship-hero";
import { NarrationMasterControl } from "@/components/ui/NarrationMasterControl";
import { isNarrationPaused } from "@/lib/narrationControl";
import { useNarrationAutoScroll } from "@/lib/useNarrationAutoScroll";
import { NARRATION_DOCK_THEMES } from "@/lib/narrationDock";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export type CaseStudyTheme = "light" | "space" | "lunar" | "airlock";

export interface CaseStudyTemplateProps {
  title: string;
  sections: CaseStudySection[];
  sectionAudio: Record<string, string>;
  /** Wav2Lip-rendered avatar video per section (see CaseStudyBinding.sectionVideo).
   *  Falls back to the audio-reactive screen animation (AvatarDisplay's
   *  `mode="reactive"`) when a section hasn't been generated — never to the
   *  static photo. True lip-sync doesn't apply to this avatar's screen-icon
   *  "face"; see the mode selection below for why. */
  sectionVideo?: Record<string, string>;
  avatars: Avatar[];
  /** Company logo (public URL), shown with the shared StoryLogo element. */
  logoUrl?: string;
  /** Renders the Space/Lunar/Airlock template's backdrop or hero + dark glass-panel copy instead of the plain white layout. */
  theme?: CaseStudyTheme;
}

const THEME_CONFIG: Record<CaseStudyTheme, { label: string | null; accent: string; border: string; glow: string }> = {
  light: { label: null, accent: "text-neutral-400", border: "border-neutral-100", glow: "" },
  space: {
    label: "Space",
    accent: "text-white/40",
    border: "border-white/15",
    glow: "drop-shadow-[0_0_60px_rgba(180,220,255,0.15)]",
  },
  lunar: {
    label: "Lunar",
    accent: "text-cyan-200/60",
    border: "border-cyan-300/20",
    glow: "drop-shadow-[0_0_60px_rgba(120,180,255,0.2)]",
  },
  // No `label` kicker — AirlockHero already carries the title in its own
  // full-screen intro, so the plain header block is skipped entirely for
  // this theme (see the `theme === "airlock"` branch in the header render).
  airlock: {
    label: null,
    accent: "text-white/40",
    border: "border-white/15",
    glow: "drop-shadow-[0_0_60px_rgba(255,255,255,0.1)]",
  },
};

const CASE_STUDY_CHAPTER_THEMES = {
  light: CHAPTER_THEMES.light,
  space: CHAPTER_THEMES.space,
  lunar: CHAPTER_THEMES.lunar,
  airlock: CHAPTER_THEMES.airlock,
};

/**
 * The case-study experience — the pinned-avatar, big-text,
 * word-highlight-as-spoken pattern, walking the fixed Company → Domain → Customer → Problem → Solution →
 * Impact sections produced by the layout-binding agent (see
 * caseStudySections.ts) instead of raw chunks. Case-study projects always
 * use this layout regardless of selectedTemplateId (see renderStaticSite) —
 * `theme` is how they still pick up the Space/Lunar templates' backgrounds
 * rather than losing access to them entirely.
 */
export default function CaseStudyTemplate({
  title,
  sections,
  sectionAudio,
  sectionVideo,
  avatars,
  logoUrl,
  theme = "light",
}: CaseStudyTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useNarrationAutoScroll(containerRef, ".case-study-section");
  const isDark = theme !== "light";
  const { label, accent, border } = THEME_CONFIG[theme];

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

        // Only the words between the previous and the new position are
        // touched; the first event after a (re)start repaints them all.
        let shown = -2;
        function setSpoken(word: HTMLElement, spoken: boolean) {
          word.classList.toggle(spokenClass, spoken);
          word.classList.toggle(unspokenClass, !spoken);
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

        // Same on/off-screen play/pause as the audio above, not `autoPlay` —
        // one <video> per section left to autoplay unconditionally is what
        // bogged the page down last time. Restarting from 0 on every
        // (re)entry is what makes scrolling back up to an earlier section
        // replay its clip from the top rather than resuming mid-loop.
        const video = section.querySelector<HTMLVideoElement>("video");
        if (video) {
          video.currentTime = 0;
          if (!isNarrationPaused()) {
            video.play().catch(() => {});
          }
        }
      }

      sectionEls.forEach((section) => {
        const audio = section.querySelector<HTMLAudioElement>("audio");
        const video = section.querySelector<HTMLVideoElement>("video");

        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => activateSection(section),
          onEnterBack: () => activateSection(section),
          onLeave: () => {
            audio?.pause();
            video?.pause();
          },
          onLeaveBack: () => {
            audio?.pause();
            video?.pause();
          },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, [sections, theme]);

  return (
    <div
      ref={containerRef}
      className={theme === "lunar" ? "relative bg-black text-white" : isDark ? "relative text-white" : "bg-white text-neutral-900"}
    >
      <NarrationMasterControl theme={NARRATION_DOCK_THEMES[theme]} />
      <StoryLogo logoUrl={logoUrl} />
      {theme === "space" && <ASMRBackground />}
      {theme === "airlock" ? (
        <AirlockHero title={title} />
      ) : theme === "lunar" ? (
        <LunarHero title={title} description={lunarHeroDescription(sections[0]?.body)} />
      ) : (
        <header className="relative px-10 pb-16 pt-24">
          {label && <span className={`text-xs font-light uppercase tracking-[0.4em] ${accent}`}>{label}</span>}
          <h1 className={`max-w-3xl text-2xl font-medium leading-tight md:text-[1.75rem] ${isDark ? "mt-4" : ""}`}>
            {title}
          </h1>
        </header>
      )}

      {sections.map((section, index) => {
        const avatar = avatarForIndex(index, avatars);
        // Priority for the Lunar theme: a real Wav2Lip-rendered section video
        // if one exists, else the audio-reactive screen animation. True
        // lip-sync doesn't apply to this avatar at all — its "face" is an
        // LED-dot screen icon, not a human mouth, so Wav2Lip's face detector
        // can't target it (confirmed via the avatar-lipsync service: it
        // throws "Face not detected" every time). The reactive mode is the
        // practical stand-in until/unless a lip-sync-compatible avatar shows
        // up. Every other theme keeps the default (3D model, if any).
        const wav2lipVideoUrl = theme === "lunar" ? sectionVideo?.[section.key] : undefined;
        const avatarMode = wav2lipVideoUrl ? "video" : theme === "lunar" ? "reactive" : "auto";
        const audioUrl = sectionAudio[section.key];
        const words = section.body.split(/\s+/).filter(Boolean);
        const media: ChapterMediaItem[] = [];
        if (avatar) {
          media.push({
            kind: "avatar",
            node: (
              <AvatarDisplay
                avatar={avatar}
                emotion={section.emotion}
                mode={avatarMode}
                videoUrl={wav2lipVideoUrl}
                className="h-full w-full object-contain"
              />
            ),
          });
        }

        return (
          <section
            key={section.key}
            className={`case-study-section relative border-t px-6 py-16 md:px-12 md:py-24 ${border}`}
          >
            <ChapterLayout
              theme={CASE_STUDY_CHAPTER_THEMES[theme]}
              index={index}
              total={sections.length}
              eyebrow={section.sectionLabel}
              title={section.title}
              media={media}
              lists={chapterLists(sections.map((s) => ({ title: s.title, text: s.body })), index)}
            >
              <p
                className="font-medium leading-normal tracking-tight"
                style={{ fontSize: "clamp(0.9375rem, 1.25vw, 1.125rem)" }}
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
              {audioUrl && <audio src={audioUrl} />}
            </ChapterLayout>
          </section>
        );
      })}
    </div>
  );
}
