"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button, fieldClass } from "@/components/ui/button";
import { InlineError } from "@/components/StateViews";
import { errorMessage, readJson } from "@/components/apiError";

export interface Voice {
  name: string;
  language: string;
  gender: string;
}

function displayNames(type: "language" | "region"): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames(["en"], { type });
  } catch {
    return null;
  }
}

const LANGUAGE_NAMES = displayNames("language");
const REGION_NAMES = displayNames("region");

/** "en-US" → "en". */
function languageOf(locale: string): string {
  return locale.split("-")[0]?.toLowerCase() || locale;
}

function languageName(code: string): string {
  try {
    return LANGUAGE_NAMES?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "en-US" → "English (United States)". */
function localeName(locale: string): string {
  const [language, region] = locale.split("-");
  const name = languageName(language ?? locale);
  if (!region) return name;
  let regionName = region;
  try {
    regionName = REGION_NAMES?.of(region.toUpperCase()) ?? region;
  } catch {
    // keep the code
  }
  return `${name} (${regionName})`;
}

/** "en-US-AriaNeural" → "Aria"; "en-US-AndrewMultilingualNeural" → "Andrew Multilingual". */
export function friendlyVoiceName(voice: Pick<Voice, "name" | "language">): string {
  let rest = voice.name.startsWith(`${voice.language}-`) ? voice.name.slice(voice.language.length + 1) : voice.name;
  rest = rest.replace(/Neural$/, "");
  return rest.replace(/([a-z])([A-Z])/g, "$1 $2").trim() || voice.name;
}

export function voiceLabel(voices: Voice[] | null, name: string | undefined): string {
  if (!name) return "No voice chosen";
  const voice = voices?.find((entry) => entry.name === name);
  if (!voice) return name;
  return `${friendlyVoiceName(voice)}, ${voice.gender.toLowerCase()} · ${localeName(voice.language)}`;
}

/**
 * Voice choice with audition (UX-07): pick a language (English by default),
 * pick a voice from a list grouped by region with friendly names, and press
 * Listen to hear it WITHOUT changing the story's voice. "Use this voice"
 * commits it, asking first when narration already exists (it would all have
 * to be recorded again).
 */
export function VoicePicker({
  voices,
  loadError,
  value,
  onCommit,
  narratedCount,
  narrationUnit,
  disabled,
}: {
  voices: Voice[] | null;
  loadError?: string | null;
  /** The story's saved voice. */
  value: string;
  onCommit: (voice: string) => void;
  /** Chapters/sections that already have narration in the current voice. */
  narratedCount: number;
  narrationUnit: "chapter" | "section";
  disabled?: boolean;
}) {
  const languageId = useId();
  const voiceId = useId();
  const [language, setLanguage] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  const languages = useMemo(() => {
    const codes = Array.from(new Set((voices ?? []).map((voice) => languageOf(voice.language))));
    return codes
      .map((code) => ({ code, name: languageName(code) }))
      .sort((a, b) => (a.code === "en" ? -1 : b.code === "en" ? 1 : a.name.localeCompare(b.name)));
  }, [voices]);

  const currentVoice = voices?.find((voice) => voice.name === value);
  // Shown language: the user's pick, else the saved voice's language, else English.
  const activeLanguage = language ?? (currentVoice ? languageOf(currentVoice.language) : "en");
  const selected = candidate ?? value;

  const groups = useMemo(() => {
    const byLocale = new Map<string, Voice[]>();
    for (const voice of voices ?? []) {
      if (languageOf(voice.language) !== activeLanguage) continue;
      const list = byLocale.get(voice.language) ?? [];
      list.push(voice);
      byLocale.set(voice.language, list);
    }
    return Array.from(byLocale.entries())
      .map(([locale, list]) => ({
        locale,
        label: localeName(locale),
        voices: list.sort((a, b) => friendlyVoiceName(a).localeCompare(friendlyVoiceName(b))),
      }))
      .sort((a, b) => (a.locale === "en-US" ? -1 : b.locale === "en-US" ? 1 : a.label.localeCompare(b.label)));
  }, [voices, activeLanguage]);

  const inList = groups.some((group) => group.voices.some((voice) => voice.name === selected));

  async function listen(voice: string) {
    setPreviewError(null);
    setPreviewing(voice);
    try {
      audioRef.current?.pause();
      const res = await fetch("/api/preview-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice }),
      });
      if (!res.ok) await readJson(res, "This voice can't be played right now.");
      const blob = await res.blob();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(blob);
      const audio = new Audio(urlRef.current);
      audioRef.current = audio;
      audio.addEventListener("ended", () => setPlaying(false));
      setPlaying(true);
      await audio.play();
    } catch (err) {
      setPlaying(false);
      setPreviewError(errorMessage(err, "This voice can't be played right now."));
    } finally {
      setPreviewing(null);
    }
  }

  function stop() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  function commit() {
    if (!candidate || candidate === value) return;
    if (
      narratedCount > 0 &&
      !window.confirm(
        `Switch to ${voiceLabel(voices, candidate)}? The narration of ${narratedCount} ${narrationUnit}${
          narratedCount === 1 ? "" : "s"
        } was recorded in the current voice and will be recorded again (when you click Generate narration or publish).`
      )
    ) {
      return;
    }
    onCommit(candidate);
    setCandidate(null);
  }

  if (loadError) return <InlineError>{loadError}</InlineError>;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-800 dark:text-indigo-50">
        <span className="font-medium">Story voice:</span> {voiceLabel(voices, value)}
      </p>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor={languageId} className="text-xs font-medium text-muted-foreground">
            Language
          </label>
          <select
            id={languageId}
            value={activeLanguage}
            disabled={!voices || disabled}
            onChange={(event) => {
              setLanguage(event.target.value);
              setCandidate(null);
            }}
            className={fieldClass}
          >
            {!voices && <option>Loading…</option>}
            {languages.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor={voiceId} className="text-xs font-medium text-muted-foreground">
            Voice to try
          </label>
          <select
            id={voiceId}
            value={inList ? selected : ""}
            disabled={!voices || disabled}
            onChange={(event) => setCandidate(event.target.value)}
            className={fieldClass}
          >
            {!voices && <option>Loading voices…</option>}
            {voices && !inList && <option value="">Choose a voice…</option>}
            {groups.map((group) => (
              <optgroup key={group.locale} label={group.label}>
                {group.voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {friendlyVoiceName(voice)} ({voice.gender.toLowerCase()})
                    {voice.name === value ? " · current" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {playing ? (
          <Button size="xs" onClick={stop}>
            Stop
          </Button>
        ) : (
          <Button size="xs" onClick={() => void listen(selected)} disabled={!selected || previewing !== null}>
            {previewing ? "Loading…" : "Listen"}
          </Button>
        )}
        {candidate && candidate !== value && (
          <>
            <Button variant="primary" size="xs" onClick={commit} disabled={disabled}>
              Use this voice
            </Button>
            <Button variant="ghost" size="xs" onClick={() => setCandidate(null)}>
              Keep current
            </Button>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Listening doesn&apos;t change the story&apos;s voice.</p>
      {previewError && <InlineError>{previewError}</InlineError>}
    </div>
  );
}

/** Friendly label from a voice id alone ("en-US-AriaNeural" → "Aria (English, United States)"). */
export function friendlyVoiceId(name: string): string {
  const parts = name.split("-");
  if (parts.length < 3) return name;
  const locale = `${parts[0]}-${parts[1]}`;
  return `${friendlyVoiceName({ name, language: locale })} (${localeName(locale)})`;
}
