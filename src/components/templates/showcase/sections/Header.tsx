"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useShowcase } from "../shared/ShowcaseContext";

type SoundName = "hover" | "click" | "focus" | "page";

const EASE = "cubic-bezier(.7,0,.2,1)";

/** The sound toggle survives page changes (the header remounts with each page). */
let soundPreference = false;

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M1 6h10M6.5 1.5 11 6l-4.5 4.5" />
    </svg>
  );
}

function SwapText({ children }: { children: string }) {
  return (
    <span className="relative inline-block max-w-full overflow-hidden whitespace-nowrap align-top leading-[1.1]">
      <span className="block transition-transform duration-500 [transition-timing-function:cubic-bezier(.7,0,.2,1)] group-hover/swap:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-full block transition-transform duration-500 [transition-timing-function:cubic-bezier(.7,0,.2,1)] group-hover/swap:-translate-y-full"
      >
        {children}
      </span>
    </span>
  );
}

function Dot({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-[0.4em] w-[0.4em] rounded-full bg-current ${className}`}
    />
  );
}

/** Menu link size by chapter count, so a long list still fits the panel. */
function menuFontSize(count: number): { desktop: string; mobile: string } {
  if (count <= 5) return { desktop: "6vw", mobile: "12vw" };
  if (count <= 8) return { desktop: "4vw", mobile: "8vw" };
  if (count <= 12) return { desktop: "2.8vw", mobile: "6vw" };
  return { desktop: "2vw", mobile: "5vw" };
}

export function Header() {
  const { story, router } = useShowcase();
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(soundPreference);
  const soundOnRef = useRef(soundPreference);
  const audioRefs = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});
  const audioBase = `${story.assetBase}/audio`;
  const size = menuFontSize(story.chapters.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const play = useCallback(
    (name: SoundName) => {
      if (!soundOnRef.current) return;
      let audio = audioRefs.current[name];
      if (!audio) {
        audio = new Audio(`${audioBase}/${name}.ogg`);
        audio.volume = 0.5;
        audioRefs.current[name] = audio;
      }
      audio.currentTime = 0;
      void audio.play().catch(() => undefined);
    },
    [audioBase],
  );

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundOnRef.current = next;
    soundPreference = next;
    if (next) play("click");
  };

  const toggleMenu = () => {
    play("page");
    setOpen((v) => !v);
  };

  const hoverProps = { onMouseEnter: () => play("hover") };
  const pill =
    "group/swap inline-flex h-[3.2em] items-center gap-[0.7em] rounded-[6.25em] px-[1.4em] text-[.875em] font-medium uppercase transition-[color,background-color] duration-[400ms] max-md:px-[1.1em] max-md:text-[.75em]";

  const bar = (delay: string): ReactNode => (
    <span
      className="block w-[2px] origin-center rounded-full bg-current"
      style={{
        height: soundOn ? "40%" : "2px",
        animation: soundOn ? `sc-bar 0.9s ease-in-out ${delay} infinite alternate` : "none",
        transition: "height .4s",
      }}
    />
  );

  return (
    <>
      <style>{`@keyframes sc-bar{from{transform:scaleY(.35)}to{transform:scaleY(1.6)}}`}</style>
      <header
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 text-[var(--sc-black)]"
        style={{
          paddingInline: "var(--sc-pad-x)",
          paddingBlock: "var(--sc-pad-y)",
          fontFamily: "var(--sc-font-sans)",
        }}
      >
        <a
          href="#/"
          title={story.title}
          className="min-w-0 max-w-[46vw] truncate text-[1.8vw] font-medium uppercase leading-none tracking-tight max-md:text-[5vw]"
          onClick={() => {
            play("click");
            setOpen(false);
          }}
          {...hoverProps}
        >
          {story.title}
        </a>

        <div className="flex shrink-0 items-center gap-[0.5em] text-base max-md:text-[.9rem]">
          <button
            type="button"
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            aria-pressed={soundOn}
            onClick={toggleSound}
            {...hoverProps}
            className="flex h-[3.2em] w-[3.2em] items-center justify-center gap-[3px] rounded-full bg-[var(--sc-dark-white)] text-[var(--sc-black)] transition-[background-color,color] duration-[400ms] hover:bg-[var(--sc-grey-blue)] hover:text-white"
          >
            {bar("0s")}
            {bar(".15s")}
            {bar(".3s")}
            {bar(".1s")}
          </button>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="sc-menu-panel"
            onClick={toggleMenu}
            {...hoverProps}
            className={`${pill} bg-[var(--sc-dark-white)] text-[var(--sc-black)] hover:bg-[var(--sc-black)] hover:text-white`}
          >
            <SwapText>{open ? "Close" : "Menu"}</SwapText>
            <span className="flex flex-col gap-[0.25em]" aria-hidden="true">
              <Dot className="h-[0.3em] w-[0.3em]" />
              <Dot className="h-[0.3em] w-[0.3em]" />
            </span>
          </button>
        </div>
      </header>

      <div
        id="sc-menu-panel"
        role="dialog"
        aria-label="Chapters"
        aria-hidden={!open}
        className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[var(--sc-off-white)] text-[var(--sc-black)]"
        style={{
          fontFamily: "var(--sc-font-sans)",
          paddingInline: "var(--sc-pad-x)",
          paddingTop: "calc(var(--sc-pad-y) * 2 + 3.2em)",
          paddingBottom: "var(--sc-pad-y)",
          clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
          visibility: open ? "visible" : "hidden",
          transition: `clip-path .6s ${EASE}, visibility 0s linear ${open ? "0s" : ".6s"}`,
        }}
      >
        <nav aria-label="Chapters" className="flex flex-col">
          {story.chapters.map((chapter, i) => (
            <a
              key={chapter.slug}
              href={chapter.href}
              tabIndex={open ? 0 : -1}
              onClick={(e) => {
                e.preventDefault();
                play("click");
                setOpen(false);
                router.push(chapter.href);
              }}
              onMouseEnter={() => play("hover")}
              className="sc-menu-link group/swap flex items-center gap-[2vw] font-medium uppercase leading-[1.05] tracking-tight"
              style={{
                ["--sc-menu-size" as string]: size.desktop,
                ["--sc-menu-size-m" as string]: size.mobile,
                transform: open ? "translateY(0)" : "translateY(40px)",
                opacity: open ? 1 : 0,
                transition: `transform .6s ${EASE} ${0.1 + Math.min(i, 12) * 0.05}s, opacity .6s ${EASE} ${0.1 + Math.min(i, 12) * 0.05}s`,
              }}
            >
              <span className="min-w-0 truncate">
                <SwapText>{chapter.title}</SwapText>
              </span>
              <ArrowIcon className="shrink-0 text-[.5em] opacity-0 transition-opacity duration-[400ms] group-hover/swap:opacity-100" />
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
