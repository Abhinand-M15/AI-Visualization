"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { avatarForIndex, type TemplateProps } from "./types";
import { AvatarDisplay } from "./AvatarDisplay";
import { NarrationMasterControl } from "@/components/ui/NarrationMasterControl";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function ClarityTemplate({ title, chunks, avatars }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".clarity-card").forEach((card) => {
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
    <div ref={containerRef} className="min-h-screen bg-[#fafafa] px-6 py-20 text-neutral-900">
      <NarrationMasterControl />
      <div className="mx-auto flex max-w-2xl flex-col gap-14">
        <h1 className="text-3xl font-medium tracking-tight">{title}</h1>

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
                  <h2 className="text-lg font-medium">{chunk.title}</h2>
                  <p className="text-sm leading-relaxed text-neutral-600">{chunk.narrativeText}</p>
                  {chunk.audioUrl && (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <audio controls src={chunk.audioUrl} className="mt-1 h-9" />
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
