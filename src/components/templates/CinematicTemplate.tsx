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

const PALETTE = ["#0b0d12", "#151822", "#1a1024", "#101a17", "#1c1410"];

export default function CinematicTemplate({ title, chunks, avatars }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useNarrationAutoScroll(containerRef, ".cinematic-section");

  useEffect(() => {
    const ctx = gsap.context(() => {
      let currentAudio: HTMLAudioElement | null = null;

      function activateSection(audio: HTMLAudioElement) {
        if (currentAudio && currentAudio !== audio) currentAudio.pause();
        audio.currentTime = 0;
        if (!isNarrationPaused()) {
          audio.play().catch(() => {
            // Autoplay can be blocked before the user has interacted with the page —
            // scrolling the section back into view tries again.
          });
        }
        currentAudio = audio;
      }

      gsap.utils.toArray<HTMLElement>(".cinematic-section").forEach((section) => {
        const audio = section.querySelector<HTMLAudioElement>("audio");
        if (audio) {
          ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onEnter: () => activateSection(audio),
            onEnterBack: () => activateSection(audio),
            onLeave: () => audio.pause(),
            onLeaveBack: () => audio.pause(),
          });
        }
        const content = section.querySelector(".cinematic-content");
        gsap.fromTo(
          content,
          { opacity: 0, scale: 0.94 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 60%",
              end: "bottom 40%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [chunks]);

  return (
    <div ref={containerRef} className="text-white">
      <NarrationMasterControl theme={NARRATION_DOCK_THEMES.cinematic} />
      <div className="flex h-screen flex-col items-center justify-center px-6" style={{ background: PALETTE[0] }}>
        <h1 className="max-w-2xl text-center text-2xl font-medium leading-tight">{title}</h1>
        <p className="mt-4 text-sm uppercase tracking-widest text-white/50">Scroll to begin</p>
      </div>

      {chunks.map((chunk, index) => {
        const avatar = avatarForIndex(index, avatars);
        const bg = PALETTE[(index + 1) % PALETTE.length];
        return (
          <section
            key={chunk.id}
            className="cinematic-section flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
            style={{ background: bg }}
          >
            <div className="cinematic-content flex flex-col items-center gap-6">
              {avatar && (
                <AvatarDisplay
                  avatar={avatar}
                  emotion={chunk.emotion}
                  className="h-56 w-56 object-contain drop-shadow-[0_0_60px_rgba(255,255,255,0.15)]"
                />
              )}
              <span className="text-xs uppercase tracking-widest text-white/40">
                Chunk {chunk.order} of {chunks.length}
              </span>
              <h2 className="max-w-xl text-lg font-medium">{chunk.title}</h2>
              <p className="max-w-lg text-[0.9375rem] leading-relaxed text-white/70">{chunk.narrativeText}</p>

              {chunk.audioUrl && (
                <audio src={chunk.audioUrl} />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
