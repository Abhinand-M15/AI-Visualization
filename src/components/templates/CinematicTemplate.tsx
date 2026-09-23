"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { avatarForIndex, type TemplateProps } from "./types";
import { AvatarDisplay } from "./AvatarDisplay";
import { NarrationMasterControl } from "@/components/ui/NarrationMasterControl";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const PALETTE = ["#0b0d12", "#151822", "#1a1024", "#101a17", "#1c1410"];

export default function CinematicTemplate({ title, chunks, avatars }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".cinematic-section").forEach((section) => {
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

  function togglePlay(el: HTMLAudioElement) {
    if (el.paused) el.play();
    else el.pause();
  }

  return (
    <div ref={containerRef} className="text-white">
      <NarrationMasterControl />
      <div className="flex h-screen flex-col items-center justify-center px-6" style={{ background: PALETTE[0] }}>
        <h1 className="max-w-2xl text-center text-4xl font-medium leading-tight">{title}</h1>
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
              <h2 className="max-w-xl text-2xl font-medium">{chunk.title}</h2>
              <p className="max-w-lg text-lg leading-relaxed text-white/70">{chunk.narrativeText}</p>

              {chunk.audioUrl && (
                <>
                  <audio
                    id={`cinematic-audio-${chunk.id}`}
                    src={chunk.audioUrl}
                    onEnded={(e) => e.currentTarget.currentTime && (e.currentTarget.currentTime = 0)}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const audio = document.getElementById(`cinematic-audio-${chunk.id}`) as HTMLAudioElement | null;
                      if (audio) togglePlay(audio);
                      e.currentTarget.blur();
                    }}
                    className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    ▶ Play narration
                  </button>
                </>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
