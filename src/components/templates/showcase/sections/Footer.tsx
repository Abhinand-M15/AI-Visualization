"use client";

import { useShowcase } from "../shared/ShowcaseContext";

export function Footer() {
  const { story } = useShowcase();
  return (
    <footer
      className="w-full px-[var(--sc-pad-x)] pb-[var(--sc-pad-y)] pt-[calc(var(--sc-pad-y)*2)]"
      style={{ background: "#05060d", color: "#f0f1fa", fontFamily: "var(--sc-font-sans), sans-serif" }}
    >
      <p
        className="m-0 border-t pt-6 text-[0.75rem] uppercase"
        style={{ borderColor: "var(--sc-grey-blue)", fontFamily: "var(--sc-font-mono), 'IBM Plex Mono', monospace" }}
      >
        {story.title}
      </p>
    </footer>
  );
}
