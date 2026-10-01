"use client";

import type { CSSProperties } from "react";
import { Component as LunarGravityCard } from "@/components/ui/lunar-gravity-card";
import { lunarHeroTitleParts, lunarHeroTitleSize } from "@/lib/lunarHero";

/**
 * The Lunar theme's hero: the prompt's demo layout (components/ui/lunar-gravity-card.tsx
 * + its demo.tsx wrapper) used as-is, with the project's title and a one-line
 * description in place of the card's "Lunar Gravity." demo copy. The title
 * keeps the card's two-tone styling (white lead words, gradient last word);
 * only its size steps down for long titles (see lunarHeroTitleSize).
 */
export function LunarHero({ title, description }: { title: string; description: string }) {
  const { lead, accent } = lunarHeroTitleParts(title);
  const size = lunarHeroTitleSize(title);
  const sizeVars = { "--lunar-title-m": size.mobile, "--lunar-title-d": size.desktop } as CSSProperties;

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-10 font-sans">
      <div className="relative w-full max-w-[1000px]">
        <LunarGravityCard
          title={
            <span
              style={sizeVars}
              className="block text-[length:var(--lunar-title-m)] md:text-[length:var(--lunar-title-d)]"
            >
              {lead && (
                <>
                  <span className="text-zinc-50 drop-shadow-sm">{lead}</span>
                  <br />
                </>
              )}
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-800 drop-shadow-md">
                {accent}
              </span>
            </span>
          }
          description={description}
        />
        <div className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center z-50 text-white/50 hover:text-white backdrop-blur-md transition-all hover:scale-110">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            <path d="M2 12h20"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
