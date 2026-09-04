"use client";

import { useEffect, useRef, useState } from "react";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
}

/**
 * Custom-styled audio player. Native <audio controls> renders with the OS's
 * own theme (always the same light-grey bar) regardless of our light/dark
 * palette, so the play/pause affordance disappears against a dark card —
 * this wraps a hidden <audio> element with a themed button + seek bar instead.
 */
export function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  return (
    <div className="flex flex-1 min-w-[220px] items-center gap-3 rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-2 pr-4 dark:border-white/10 dark:bg-black/30">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 text-neutral-950 shadow-[0_0_14px_rgba(139,92,246,0.45)] transition-transform hover:scale-105 active:scale-95"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="3.5" height="12" rx="1" />
            <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M2.5 1.3c0-.9 1-1.5 1.8-1L12 6.3c.8.5.8 1.7 0 2.2l-7.7 5.2c-.8.5-1.8-.1-1.8-1V1.3z" />
          </svg>
        )}
      </button>

      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => seek(Number(event.target.value))}
        className="h-1.5 flex-1 cursor-pointer accent-violet-500"
        aria-label="Seek"
      />

      <span className="w-16 shrink-0 text-right text-sm tabular-nums text-neutral-500 dark:text-indigo-200/60">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
