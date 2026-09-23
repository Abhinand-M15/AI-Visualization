"use client";

import { useEffect, useRef } from "react";

const INTRINSIC_SIZE = 640;
/** Mouth region on avatar-1's static PNGs (neutral/happy/confused/idea/solution —
 *  all rendered from the same fixed camera framing, only the screen graphic
 *  differs), as a fraction of the 640x640 source image. */
const MOUTH_BOX = { left: 0.414, top: 0.344, width: 0.18, height: 0.075 };

/**
 * Draws a small canvas over the avatar's screen-mouth region and animates its
 * height with the real-time amplitude of whichever `<audio>` element is
 * passed in — a lightweight "the screen is reacting to speech" effect,
 * not lip-sync. (True lip-sync via Wav2Lip was tried and doesn't apply here:
 * this robot's "face" is an LED-dot screen icon, not a human mouth — see the
 * avatar-lipsync evaluation.) Renders nothing, and does nothing, when no
 * audio element is supplied or Web Audio isn't available.
 *
 * `containerEl` is measured (and re-measured on resize) rather than trusting
 * static CSS percentages: the avatar box isn't reliably square (it's a flex
 * item and can get width-squeezed below its own w-[Npx] class at some
 * viewport widths), which lets the square 640x640 image letterbox inside it
 * — a percentage positioned against the box, not the actual letterboxed
 * image rect, drifted off the real mouth position when that happened.
 */
export function ReactiveMouthOverlay({
  audioEl,
  containerEl,
}: {
  audioEl: HTMLAudioElement | null;
  containerEl: HTMLDivElement | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep the canvas aligned to the image's actual (possibly letterboxed)
  // rendered rect, not the wrapper's own box.
  useEffect(() => {
    if (!containerEl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    function reposition() {
      if (!containerEl || !canvas) return;
      const cw = containerEl.clientWidth;
      const ch = containerEl.clientHeight;
      if (cw === 0 || ch === 0) return;
      const scale = Math.min(cw / INTRINSIC_SIZE, ch / INTRINSIC_SIZE);
      const imgW = INTRINSIC_SIZE * scale;
      const imgH = INTRINSIC_SIZE * scale;
      const offsetX = (cw - imgW) / 2;
      const offsetY = (ch - imgH) / 2;

      canvas.style.left = `${offsetX + MOUTH_BOX.left * imgW}px`;
      canvas.style.top = `${offsetY + MOUTH_BOX.top * imgH}px`;
      canvas.style.width = `${MOUTH_BOX.width * imgW}px`;
      canvas.style.height = `${MOUTH_BOX.height * imgH}px`;
    }

    reposition();
    const observer = new ResizeObserver(reposition);
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl]);

  useEffect(() => {
    if (!audioEl) return;

    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    let audioCtx: AudioContext;
    let analyser: AnalyserNode;
    try {
      audioCtx = new AudioContextCtor();
      // A given <audio> element can only ever have one MediaElementAudioSourceNode
      // created for it (a second attempt throws) — scrolling back to a section
      // remounts this component against the same element, so the node (and its
      // permanent connection into the element's own output) is cached on the
      // element itself and reused rather than recreated.
      type ReactiveTap = { source: MediaElementAudioSourceNode; ctx: AudioContext };
      const tapped = audioEl as HTMLAudioElement & { __reactiveTap?: ReactiveTap };
      let source: MediaElementAudioSourceNode;
      if (tapped.__reactiveTap) {
        source = tapped.__reactiveTap.source;
        audioCtx = tapped.__reactiveTap.ctx;
      } else {
        source = audioCtx.createMediaElementSource(audioEl);
        tapped.__reactiveTap = { source, ctx: audioCtx };
      }
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      // Route back to real output — createMediaElementSource otherwise silences
      // the element entirely, since it takes over as the sole audio destination.
      source.connect(audioCtx.destination);
    } catch {
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let rafId = 0;
    let smoothed = 0;

    function draw() {
      rafId = requestAnimationFrame(draw);
      if (!ctx || !canvas) return;

      analyser.getByteTimeDomainData(dataArray);
      let sumSq = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / dataArray.length);
      // Gained up so normal speech volume visibly opens the mouth rather than
      // just flickering near zero; RMS on typical narration rarely nears 1.
      const target = Math.min(1, rms * 4.5);
      smoothed += (target - smoothed) * 0.35;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      // Blot out the PNG's own printed smile with the screen's black first.
      ctx.fillStyle = "#070907";
      ctx.fillRect(0, 0, w, h);

      const openness = 0.16 + smoothed * 0.84;
      const rx = (w * 0.68) / 2;
      const ry = Math.max(1.5, (h * openness) / 2);
      ctx.fillStyle = "#8CF26B";
      ctx.shadowColor = "#8CF26B";
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    draw();

    return () => cancelAnimationFrame(rafId);
  }, [audioEl]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={56}
      style={{ position: "absolute", pointerEvents: "none" }}
    />
  );
}
