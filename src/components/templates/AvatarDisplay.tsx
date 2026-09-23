"use client";

import { useEffect, useState } from "react";
import { getAvatarImage, type Avatar } from "@/lib/avatars";
import type { EmotionKey } from "@/lib/types";
import { Avatar3D } from "@/components/ui/avatar-3d";
import { Avatar3DErrorBoundary } from "@/components/ui/avatar-3d-error-boundary";
import { hasWebGLSupport } from "@/lib/hasWebGL";
import { ReactiveMouthOverlay } from "@/components/ui/reactive-mouth-overlay";

/**
 * Drop-in replacement for the old `<img src={avatarImage} className="..." />`
 * used across every template. Renders the same way for any avatar without a
 * `modelUrl` (still a flat image, still emotion-specific); an avatar with a
 * `modelUrl` renders as a live 3D model instead — one static pose standing
 * in for every emotion, since the model has no expression variants.
 *
 * Every render starts as the plain image (matches SSR, no hydration
 * mismatch) and only swaps to the 3D model after mount, once a real WebGL
 * context is confirmed. On a browser with the GPU/WebGL disabled, a
 * `<canvas>` can fail asynchronously (context-creation error, not a
 * synchronous render error) which an error boundary cannot catch — that
 * left the model area blank instead of falling back. Probing WebGL up
 * front means the canvas is never mounted at all in that case.
 *
 * `mode="video"` is an explicit per-template override (e.g. LunarTemplate
 * asking for the avatar's video instead of its 3D model) — it does not
 * replace the 3D model wiring above, which every other template still uses
 * via the default `mode="auto"`.
 *
 * Deliberately no `autoPlay` here: with one `<video>` per chunk/section, an
 * unconditional autoplay would mean every section's clip starts decoding and
 * looping at once on page load — the previous attempt at this did exactly
 * that and it bogged the page down badly enough to disrupt scroll-triggered
 * narration too. Instead the enclosing template's scroll-activation logic
 * (the same one that starts/stops narration audio per section) calls
 * `.play()`/`.pause()` on this element directly, so only the active
 * section's video is ever actually playing.
 *
 * `mode="reactive"` is another explicit per-template override: the static
 * image with a small canvas animating over the screen-mouth region in time
 * with whatever narration audio is actually playing for this section. This
 * exists because true lip-sync (Wav2Lip) doesn't apply to this avatar at all
 * — its "face" is an LED-dot screen icon, not a human mouth, so a model
 * trained on human faces can't target it. This is a lighter-weight stand-in:
 * not lip-sync, just "the screen visibly reacts to speech."
 */
export function AvatarDisplay({
  avatar,
  emotion,
  className,
  mode = "auto",
  videoUrl,
}: {
  avatar: Avatar;
  emotion: EmotionKey | undefined;
  className?: string;
  mode?: "auto" | "video" | "reactive";
  videoUrl?: string;
}) {
  const src = getAvatarImage(avatar, emotion);
  const [use3D, setUse3D] = useState(false);
  const [reactiveWrapEl, setReactiveWrapEl] = useState<HTMLDivElement | null>(null);
  const [sectionAudio, setSectionAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (mode === "auto" && avatar.modelUrl && hasWebGLSupport()) setUse3D(true);
  }, [mode, avatar.modelUrl]);

  useEffect(() => {
    if (mode !== "reactive" || !reactiveWrapEl) return;
    const section = reactiveWrapEl.closest(".case-study-section, .lunar-section");
    setSectionAudio(section?.querySelector("audio") ?? null);
  }, [mode, reactiveWrapEl]);

  if (mode === "reactive") {
    return (
      <div ref={setReactiveWrapEl} className={className} style={{ position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        <ReactiveMouthOverlay audioEl={sectionAudio} containerEl={reactiveWrapEl} />
      </div>
    );
  }

  if (mode === "video" && videoUrl) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video src={videoUrl} className={className} muted loop playsInline preload="metadata" />
    );
  }

  if (mode === "auto" && avatar.modelUrl && use3D) {
    return (
      <Avatar3DErrorBoundary
        fallback={
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className={className} />
        }
      >
        <Avatar3D url={avatar.modelUrl} className={className} />
      </Avatar3DErrorBoundary>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} />
  );
}
