"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { avatarForIndex, type TemplateProps } from "./types";
import { AvatarDisplay } from "./AvatarDisplay";
import { NarrationMasterControl } from "@/components/ui/NarrationMasterControl";
import { NARRATION_DOCK_THEMES } from "@/lib/narrationDock";
import { isNarrationPaused } from "@/lib/narrationControl";
import { useNarrationAutoScroll } from "@/lib/useNarrationAutoScroll";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function ClarityTemplate({ title, chunks, avatars }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useNarrationAutoScroll(containerRef, ".clarity-card");

  useEffect(() => {
    const ctx = gsap.context(() => {
      let currentAudio: HTMLAudioElement | null = null;

      function activateCard(audio: HTMLAudioElement) {
        if (currentAudio && currentAudio !== audio) currentAudio.pause();
        audio.currentTime = 0;
        if (!isNarrationPaused()) {
          audio.play().catch(() => {
            // Autoplay can be blocked before the user has interacted with the page —
            // scrolling the card back into view tries again.
          });
        }
        currentAudio = audio;
      }

      gsap.utils.toArray<HTMLElement>(".clarity-card").forEach((card) => {
        const audio = card.querySelector<HTMLAudioElement>("audio");
        if (audio) {
          ScrollTrigger.create({
            trigger: card,
            start: "top center",
            end: "bottom center",
            onEnter: () => activateCard(audio),
            onEnterBack: () => activateCard(audio),
            onLeave: () => audio.pause(),
            onLeaveBack: () => audio.pause(),
          });
        }
        gsap.fromTo(
          card,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 85%" },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [chunks]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fafafa] px-6 pb-[50vh] pt-20 text-neutral-900">
      <NarrationMasterControl theme={NARRATION_DOCK_THEMES.light} />
      <div className="mx-auto flex max-w-2xl flex-col gap-14">
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>

        <div className="flex flex-col gap-5">
          {chunks.map((chunk, index) => {
            const avatar = avatarForIndex(index, avatars);
            return (
              <article
                key={chunk.id}
                className="clarity-card flex gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                {avatar && (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    <AvatarDisplay avatar={avatar} emotion={chunk.emotion} className="h-16 w-16 object-contain" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-xs font-medium text-neutral-400">Chunk {chunk.order}</span>
                  <h2 className="text-base font-medium">{chunk.title}</h2>
                  <p className="text-sm leading-relaxed text-neutral-600">{chunk.narrativeText}</p>
                  {chunk.audioUrl && (
                    <audio src={chunk.audioUrl} />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
