"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NarrationMasterControl } from "@/components/ui/NarrationMasterControl";
import { parseShowcaseHash, type ShowcaseStory } from "@/lib/showcase";
import { SHOWCASE_CSS } from "@/lib/showcaseCss";
import { ChapterPage } from "./sections/ChapterPage";
import { CtaSection } from "./sections/CtaSection";
import { FeaturedWork } from "./sections/FeaturedWork";
import { Footer } from "./sections/Footer";
import { Header } from "./sections/Header";
import { HeroSection } from "./sections/HeroSection";
import { ReelSection } from "./sections/ReelSection";
import { FlowLine } from "./shared/FlowLine";
import { HomeScrollRestore } from "./shared/HomeScrollRestore";
import { ShowcaseProvider, type ShowcaseRouter } from "./shared/ShowcaseContext";
import { SmoothScroll } from "./shared/SmoothScroll";

/**
 * The Showcase template, independent of Next.js: a tiny hash router (#/ is the
 * home page, #/chapter-N a chapter page) around the two pages. The in-app preview
 * (ShowcaseTemplate.tsx) and the published site's prebuilt script (standalone.tsx)
 * both render this component, so the two behave identically.
 */

function readIndex(total: number): number | null {
  if (typeof window === "undefined") return null;
  return parseShowcaseHash(window.location.hash, total);
}

function HomePage() {
  return (
    <div className="bg-[#f0f1fa] text-black">
      <HomeScrollRestore />
      <SmoothScroll />
      <Header />
      <main>
        <HeroSection />
        <div className="relative bg-[#f0f1fa]">
          <ReelSection />
          <FlowLine
            colors={["#5a90ff", "#2a38ee"]}
            points={[
              [-0.03, 0.03], [0.22, 0.07], [0.46, 0.17], [0.56, 0.3], [0.44, 0.42],
              [0.26, 0.36], [0.16, 0.5], [0.3, 0.64], [0.52, 0.62], [0.74, 0.7],
              [0.92, 0.86], [1.03, 0.98],
            ]}
            radius={0.0055}
            range={[0.15, 0.75]}
            delay={500}
          />
        </div>
        <div className="relative bg-[#f0f1fa]">
          <FeaturedWork />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1400px]">
            <FlowLine
              colors={["#5a90ff", "#2a38ee"]}
              points={[
                [-0.03, 0.45], [0.2, 0.55], [0.42, 0.72], [0.5, 0.86], [0.38, 0.93],
                [0.28, 0.85], [0.5, 0.8], [0.8, 0.88], [1.03, 0.97],
              ]}
              radius={0.0035}
              range={[0.2, 0.85]}
              delay={700}
            />
          </div>
        </div>
        {/* soft white-to-black blend between the grid and the closing scene */}
        <div
          data-seam
          aria-hidden="true"
          className="h-[38vh] w-full"
          style={{ background: "linear-gradient(to bottom, rgb(240 241 250) 0%, rgb(233 234 243) 10%, rgb(216 217 225) 20%, rgb(189 190 199) 30%, rgb(157 158 167) 40%, rgb(122 124 132) 50%, rgb(88 89 96) 60%, rgb(56 57 64) 70%, rgb(29 30 38) 80%, rgb(12 13 20) 90%, rgb(5 6 13) 100%)" }}
        />
        <div id="end" className="bg-[#05060d]">
          <CtaSection />
          <Footer />
        </div>
      </main>
    </div>
  );
}

export function ShowcaseApp({ story, className = "" }: { story: ShowcaseStory; className?: string }) {
  const total = story.chapters.length;
  const [index, setIndex] = useState<number | null>(() => readIndex(total));
  // Whether the next route change should scroll to the top (Back keeps the grid position).
  const scrollTop = useRef(true);
  const shown = useRef(index);

  const router = useMemo<ShowcaseRouter>(
    () => ({
      push(href, options) {
        scrollTop.current = options?.scroll !== false;
        const hash = href === "/" || href === "" ? "#/" : href;
        if (window.location.hash === hash || (hash === "#/" && window.location.hash === "")) {
          setIndex(readIndex(total));
        } else {
          window.location.hash = hash;
        }
      },
      prefetch() {},
    }),
    [total],
  );

  useEffect(() => {
    const onHash = () => setIndex(readIndex(total));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [total]);

  useLayoutEffect(() => {
    if (shown.current === index) return;
    shown.current = index;
    if (scrollTop.current) window.scrollTo(0, 0);
    scrollTop.current = true;
  }, [index]);

  if (total === 0) {
    return <div className="p-10 text-sm text-neutral-400">This story has no chunks yet.</div>;
  }

  const chapter = index !== null ? story.chapters[index] : null;

  return (
    <ShowcaseProvider value={{ story, router }}>
      <div className={`sc-root ${className}`}>
        <style>{SHOWCASE_CSS}</style>
        {chapter ? <ChapterPage key={chapter.slug} chapter={chapter} /> : <HomePage />}
        {chapter?.audioUrl && <NarrationMasterControl theme={{ variant: "light" }} />}
      </div>
    </ShowcaseProvider>
  );
}
