"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  CHAPTER_LAYOUT_CSS,
  CHAPTER_MEDIA_MAX,
  chapterLayoutClass,
  chapterNextLabel,
  chapterQuoteCard,
  chapterThemeVars,
  initChapterLayout,
  type ChapterLists,
  type ChapterTheme,
} from "@/lib/chapterLayout";

/** One picture in a chapter's stack: the generated scene image, or the avatar. */
export interface ChapterMediaItem {
  kind: "scene" | "avatar";
  node: ReactNode;
}

/**
 * The shared chapter layout (see src/lib/chapterLayout.ts): pictures stacked
 * vertically as large rounded frames with a soft scroll entrance, and a sticky
 * text panel beside them, on alternating sides per chapter (chapterLayoutClass). `children` is the narration text (the template keeps
 * its own word-highlight markup and <audio>); everything else is theme tokens
 * and data. The static published pages render the twin of this via
 * chapterLayoutHtml().
 */
export function ChapterLayout({
  theme,
  index,
  total,
  eyebrow,
  title,
  media,
  lists,
  onNext,
  nextLabel,
  children,
}: {
  theme: ChapterTheme;
  index: number;
  total: number;
  eyebrow: string;
  title: string;
  media: ChapterMediaItem[];
  lists: ChapterLists;
  /** Replaces the default "scroll to the next chapter" pill action (Voyage opens its next chapter view). */
  onNext?: () => void;
  nextLabel?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? initChapterLayout(ref.current) : undefined), []);
  const shown = media.slice(0, CHAPTER_MEDIA_MAX);
  // No picture: the visual side is the chapter's pull-quote card (same rule as chapterLayoutHtml).
  const card = shown.length === 0 ? chapterQuoteCard(lists, eyebrow, title) : null;
  const panelLists = card ? card.panelLists : lists;

  return (
    <div ref={ref} className={chapterLayoutClass(index)} style={chapterThemeVars(theme) as CSSProperties}>
      <style href="chapter-layout-css" precedence="default">
        {CHAPTER_LAYOUT_CSS}
      </style>
      <div className="cl-media">
        {card ? (
          <figure className="cl-fig cl-fig-quote">
            <blockquote className="cl-quote">
              <p>{card.quote}</p>
              <footer>{card.label}</footer>
            </blockquote>
          </figure>
        ) : (
          shown.map((item, i) => (
            <figure key={i} className={`cl-fig cl-fig-${item.kind}`}>
              {item.kind === "avatar" ? <div className="cl-fill">{item.node}</div> : item.node}
            </figure>
          ))
        )}
      </div>
      <aside className="cl-panel">
        <span className="cl-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {children}
        <button type="button" className="cl-pill" data-cl-custom={onNext ? "" : undefined} onClick={onNext}>
          {nextLabel ?? chapterNextLabel(index, total)}
        </button>
        {(panelLists.keyPoints.length > 0 || panelLists.upNext.length > 0) && (
          <div className="cl-lists">
            <ListBlock label="Key points" items={panelLists.keyPoints} />
            <ListBlock label="Up next" items={panelLists.upNext} />
          </div>
        )}
      </aside>
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="cl-list">
      <h3>{label}</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** Scene image frame content for the React templates. */
export function SceneImg({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" decoding="async" className="chapter-img" />;
}
