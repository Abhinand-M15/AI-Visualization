"use client";

import { useMemo } from "react";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { buildShowcaseStory } from "@/lib/showcase";
import { ShowcaseApp } from "./showcase/ShowcaseApp";
import type { TemplateProps } from "./types";

// OFL fonts. The published site ships the same two families as files (see
// publish/showcaseSite.ts); the preview gets them through next/font.
const sans = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500"], variable: "--sc-font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--sc-font-mono", display: "swap" });

/**
 * Showcase: a scroll-driven 3D portfolio. Each chapter is a tile in the grid and
 * opens as its own page. Everything lives in ./showcase/ShowcaseApp, which also
 * powers the published site, so the preview and the live page behave the same.
 */
export default function ShowcaseTemplate({ title, chunks, avatars, logoUrl }: TemplateProps) {
  const story = useMemo(() => buildShowcaseStory({ title, chunks, avatars, logoUrl }), [title, chunks, avatars, logoUrl]);
  return <ShowcaseApp story={story} className={`${sans.variable} ${mono.variable}`} />;
}
