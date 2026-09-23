"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Avatar } from "@/lib/avatars";
import type { CaseStudySection } from "@/lib/caseStudySections";
import { avatarForIndex } from "./types";
import { AvatarDisplay } from "./AvatarDisplay";
import { ASMRBackground } from "@/components/ui/asmr-background";
import { LunarBackground } from "@/components/ui/lunar-background";
import AirlockHero from "@/components/ui/airlock-spaceship-hero";
import { NarrationMasterControl } from "@/components/ui/NarrationMasterControl";
import { isNarrationPaused } from "@/lib/narrationControl";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

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
export default function CaseStudyTemplate({
  title,
  sections,
  sectionAudio,
  sectionVideo,
  avatars,
  theme = "light",
}: CaseStudyTemplateProps) {
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
          if (!isNarrationPaused()) {
            audio.play().catch(() => {
              // Autoplay can be blocked before the user has interacted with the page —
              // the visible <audio> controls still let them start it manually.
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
      <NarrationMasterControl />
      {theme === "space" && <ASMRBackground />}
      {theme === "lunar" && <LunarBackground />}
      {theme === "airlock" ? (
        <AirlockHero title={title} />
      ) : (
        <header className="relative px-10 pb-16 pt-24">
          {label && <span className={`text-xs font-light uppercase tracking-[0.4em] ${accent}`}>{label}</span>}
          <h1 className={`max-w-3xl text-4xl font-medium leading-tight md:text-5xl ${isDark ? "mt-4" : ""}`}>
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
              {avatar && (
                <AvatarDisplay
                  avatar={avatar}
                  emotion={section.emotion}
                  mode={avatarMode}
                  videoUrl={wav2lipVideoUrl}
                  className={`h-[340px] w-[340px] object-contain md:h-[520px] md:w-[520px] ${glow}`}
                />
              )}
            </div>

            <div
              className={`case-study-copy flex w-full flex-col gap-6 md:w-[64%] ${
                isDark
                  ? `rounded-2xl border ${border} bg-black/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)]`
                  : ""
              }`}
            >
              <span className={`text-xs font-medium uppercase tracking-wide ${accent}`}>
                {section.sectionLabel}
              </span>
              <h2 className="text-2xl font-medium md:text-3xl">{section.title}</h2>
              <p
                className="font-medium leading-[1.15] tracking-tight"
                style={{ fontSize: isDark ? "clamp(1.5rem, 3.2vw, 3rem)" : "clamp(1.75rem, 4.6vw, 5rem)" }}
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
