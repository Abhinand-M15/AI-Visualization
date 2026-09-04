"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { avatarImageForChunk, type TemplateProps } from "./types";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function EditorialTemplate({ title, chunks, avatars }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(".editorial-section");
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

        function onTimeUpdate() {
          if (!audio.duration) return;
          const targetWeight = (audio.currentTime / audio.duration) * totalWeight;
          let activeIndex = cumulativeWeights.findIndex((w) => w >= targetWeight);
          if (activeIndex === -1) activeIndex = words.length - 1;
          words.forEach((word, i) => {
            word.classList.toggle("text-neutral-900", i <= activeIndex);
            word.classList.toggle("text-neutral-300", i > activeIndex);
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
          section.querySelector(".editorial-copy"),
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
    <div ref={containerRef} className="bg-white text-neutral-900">
      <header className="px-10 pb-16 pt-24">
        <h1 className="max-w-3xl text-4xl font-medium leading-tight md:text-5xl">{title}</h1>
      </header>

      {chunks.map((chunk, index) => {
        const avatarImage = avatarImageForChunk(chunk, index, avatars);
        const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
        const isReversed = index % 2 === 1;

        return (
          <section
            key={chunk.id}
            className={`editorial-section flex min-h-screen flex-col items-center gap-10 border-t border-neutral-100 px-8 py-20 md:gap-16 md:px-16 ${
              isReversed ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div className="flex w-full flex-shrink-0 justify-center md:w-[36%]">
              {avatarImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarImage}
                  alt=""
                  className="h-[280px] w-[280px] object-contain md:h-[420px] md:w-[420px]"
                />
              )}
            </div>

            <div className="editorial-copy flex w-full flex-col gap-6 md:w-[64%]">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {String(index + 1).padStart(2, "0")} / {String(chunks.length).padStart(2, "0")}
              </span>
              <h2 className="text-2xl font-medium md:text-3xl">{chunk.title}</h2>
              <p
                className="font-medium leading-[1.15] tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 4.6vw, 5rem)" }}
              >
                {words.map((word, i) => (
                  <span key={i} className="word text-neutral-300 transition-colors duration-150">
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
