"use client";

import { useEffect, useRef } from "react";
import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";
import { runWhenIdle } from "../shared/runWhenIdle";

/**
 * Scroll-scrubbed video card morph (WebGL).
 *
 * A subdivided plane carries a texture. Scroll progress (0 = small thumbnail,
 * 1 = full card) drives its rectangle, a vertex warp (taper, curved edges,
 * velocity shear and ripple) and a fragment duotone that turns the footage
 * blue while keeping a pink highlight. Everything is scrubbed by scroll, so it
 * plays in reverse when scrolling back.
 *
 * The card shows the story's first picture (generated art, or the scene-image
 * slot once it is filled) with the avatar on top: its looping video when it has
 * one, else its emotion image. `source` (a playing <video> or a canvas) replaces
 * all of that.
 */

const THUMB_WIDTH = 0.26; // of viewport width
const THUMB_TOP = 0.04; // of viewport width
const FULL_HEIGHT = 0.74; // of stage height
const RADIUS_THUMB = 20;
const RADIUS_FULL = 24;
const PROGRESS_LERP = 0.1;
/** Share of the scroll track used for the morph; the rest holds the full card in place. */
const MORPH_END = 0.55;
const VELOCITY_SMOOTH = 0.14;

const VERT = /* glsl */ `
  uniform vec4 uRect0;
  uniform vec4 uRect1;
  uniform float uP;
  uniform float uVel;
  uniform float uTime;
  uniform vec2 uView;
  varying vec2 vUv;
  varying vec2 vSize;
  void main() {
    vUv = uv;
    float u = uv.x;
    float v = 1.0 - uv.y;
    vec4 r = mix(uRect0, uRect1, uP);
    vSize = r.zw;
    vec2 pos = r.xy + vec2(u, v) * r.zw;

    float bell = 4.0 * uP * (1.0 - uP);
    // taper and skew while moving: top-right stretches out, right side pulls in
    pos.x += bell * r.z * (0.20 * u * u * (1.0 - v) - 0.10 * u * v);
    pos.y += bell * r.w * (-0.12 * u * (1.0 - v) + 0.06 * u * u);
    // concave bottom edge
    pos.y += bell * r.w * 0.10 * sin(u * 3.14159) * v * v;
    // slightly bowed edges at rest in the full state
    float bow = smoothstep(0.6, 1.0, uP);
    pos.y += bow * r.w * 0.02 * sin(u * 3.14159) * (v * 2.0 - 1.0);
    pos.x += bow * r.z * 0.008 * sin(v * 3.14159) * (u * 2.0 - 1.0);
    // scroll-velocity shear and ripple
    pos.x += uVel * r.z * 0.10 * (0.5 - v);
    pos.y += sin(u * 7.0 + v * 3.0 + uTime * 2.5) * abs(uVel) * r.w * 0.035 * (0.3 + bell);

    vec2 c = (pos - 0.5 * uView) * vec2(1.0, -1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(c, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uP;
  uniform float uRadius;
  varying vec2 vUv;
  varying vec2 vSize;
  void main() {
    vec2 uvc = (vUv - 0.5) / mix(1.25, 1.0, uP) + 0.5;
    vec3 c = texture2D(uTex, uvc).rgb;
    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    // footage turns into a flat saturated blue duotone as the card shrinks
    float tint = 1.0 - smoothstep(0.55, 0.95, uP);
    vec3 duo = mix(vec3(0.02, 0.03, 0.62), vec3(0.55, 0.6, 1.0), clamp(lum * 1.5, 0.0, 1.0));
    float pink = clamp((c.r - c.g) * 2.2 - 0.1, 0.0, 1.0);
    vec3 col = mix(c, duo, tint);
    col = mix(col, vec3(0.93, 0.86, 1.0), pink * tint * 0.6);
    // rounded rectangle mask
    vec2 p = (vUv - 0.5) * vSize;
    vec2 q = abs(p) - 0.5 * vSize + uRadius;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
    float a = 1.0 - smoothstep(-1.0, 1.0, d);
    gl_FragColor = vec4(col, a);
  }
`;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Slow pan and zoom over the picture, the avatar on top, and a soft shade so the title stays readable. */
function paintPicture(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  avatar: HTMLImageElement | HTMLVideoElement | null,
  w: number,
  h: number,
  t: number,
): void {
  const zoom = 1.1 + 0.05 * Math.sin(t * 0.12);
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const iw = img.naturalWidth * scale;
  const ih = img.naturalHeight * scale;
  const ox = (w - iw) / 2 + Math.sin(t * 0.09) * (iw - w) * 0.35;
  const oy = (h - ih) / 2 + Math.cos(t * 0.07) * (ih - h) * 0.35;
  ctx.drawImage(img, ox, oy, iw, ih);
  if (avatar) {
    const aw = avatar instanceof HTMLVideoElement ? avatar.videoWidth : avatar.naturalWidth;
    const ah = avatar instanceof HTMLVideoElement ? avatar.videoHeight : avatar.naturalHeight;
    if (aw > 0 && ah > 0) {
      const as = Math.min((w * 0.8) / aw, (h * 0.86) / ah);
      const dw = aw * as;
      const dh = ah * as;
      ctx.drawImage(avatar, (w - dw) / 2, h - dh - h * 0.02, dw, dh);
    }
  }
  const shade = ctx.createLinearGradient(0, 0, 0, h);
  shade.addColorStop(0, "rgba(5,6,13,0.18)");
  shade.addColorStop(1, "rgba(5,6,13,0.38)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
}

/** Original placeholder footage: dark UI panels, a light web, a pink panel with spheres. */
function paintFootage(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#120a2c");
  bg.addColorStop(1, "#2a0f58");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // dark UI panels
  const panels: [number, number, number, number][] = [
    [0.03, 0.08, 0.3, 0.34],
    [0.36, 0.05, 0.28, 0.3],
    [0.03, 0.5, 0.26, 0.4],
    [0.33, 0.52, 0.3, 0.38],
  ];
  for (const [px, py, pw, ph] of panels) {
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.strokeStyle = "rgba(190,160,255,0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(px * w, py * h, pw * w, ph * h, 10);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = "rgba(210,190,255,0.22)";
      ctx.fillRect(px * w + 14, py * h + 18 + i * 22, pw * w * (0.35 + 0.4 * ((i * 37) % 7) / 7), 6);
    }
  }

  // drifting light web in the middle
  const nodes: [number, number][] = [];
  for (let i = 0; i < 11; i++) {
    nodes.push([
      w * (0.36 + 0.26 * Math.sin(t * 0.5 + i * 1.7) * 0.5 + 0.13 * Math.cos(i * 2.3)),
      h * (0.4 + 0.3 * Math.cos(t * 0.4 + i * 1.3) * 0.5 + 0.08 * Math.sin(i * 1.9)),
    ]);
  }
  ctx.lineWidth = 1.5;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i][0] - nodes[j][0];
      const dy = nodes[i][1] - nodes[j][1];
      const dist = Math.hypot(dx, dy);
      if (dist < w * 0.26) {
        ctx.strokeStyle = `rgba(200,170,255,${(0.5 * (1 - dist / (w * 0.26))).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(nodes[i][0], nodes[i][1]);
        ctx.lineTo(nodes[j][0], nodes[j][1]);
        ctx.stroke();
      }
    }
  }
  for (const [nx, ny] of nodes) {
    const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 16);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(1, "rgba(160,120,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(nx - 16, ny - 16, 32, 32);
  }

  // pink panel on the right with glossy spheres
  const pg = ctx.createLinearGradient(w * 0.7, 0, w, h * 0.7);
  pg.addColorStop(0, "#ff9be8");
  pg.addColorStop(1, "#c46bff");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.roundRect(w * 0.7, h * 0.06, w * 0.27, h * 0.52, 12);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    const sx = w * (0.78 + 0.12 * ((i * 53) % 5) / 5);
    const sy = h * (0.16 + 0.1 * i) + Math.sin(t * 1.2 + i) * 4;
    const sg = ctx.createRadialGradient(sx - 6, sy - 6, 1, sx, sy, 22);
    sg.addColorStop(0, "#ffffff");
    sg.addColorStop(1, "rgba(255,200,255,0.2)");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // glowing hexagons along the bottom
  for (let i = 0; i < 6; i++) {
    const hx = w * (0.52 + i * 0.075);
    const hy = h * 0.86 + Math.sin(t * 1.4 + i) * 3;
    ctx.fillStyle = i % 2 ? "rgba(120,255,200,0.75)" : "rgba(255,255,255,0.7)";
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const ang = (Math.PI / 3) * k;
      ctx.lineTo(hx + Math.cos(ang) * 16, hy + Math.sin(ang) * 14);
    }
    ctx.closePath();
    ctx.fill();
  }
}

export type ReelMorphSceneProps = {
  /** The scroll track (tall block) whose progress scrubs the morph. */
  trackRef: React.RefObject<HTMLDivElement | null>;
  /** The picture behind the avatar (generated art or the scene-image slot). */
  picture?: string;
  /** The avatar's transparent emotion image, drawn over the picture. */
  avatarImage?: string;
  /** The avatar's looping video (webm with an mp4 fallback), drawn over the picture. */
  avatarVideo?: string;
  avatarVideoFallback?: string;
  /** A playing <video> or a canvas that replaces everything above. */
  source?: HTMLVideoElement | HTMLCanvasElement | null;
  /** Optional click handler for the play button. */
  onPlay?: () => void;
};

export function ReelMorphScene({ trackRef, picture, avatarImage, avatarVideo, avatarVideoFallback, source, onPlay }: ReelMorphSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const crossTopRef = useRef<HTMLDivElement>(null);
  const crossBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    let cleanup: (() => void) | undefined;
    const cancel = runWhenIdle(() => {
      cleanup = setup();
    }, 250);
    return () => {
      cancel();
      cleanup?.();
    };

    function setup(): (() => void) | undefined {
    const track = trackRef.current;
    const text = textRef.current;
    const crossTop = crossTopRef.current;
    const crossBottom = crossBottomRef.current;
    if (!host || !track || !text || !crossTop || !crossBottom) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    host.insertBefore(canvas, host.firstChild);

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      canvas.remove();
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // footage texture: external source or generated placeholder
    let footage: HTMLCanvasElement | HTMLVideoElement;
    let ownCanvas: HTMLCanvasElement | null = null;
    let ownCtx: CanvasRenderingContext2D | null = null;
    if (source) {
      footage = source;
    } else {
      ownCanvas = document.createElement("canvas");
      ownCanvas.width = 1920;
      ownCanvas.height = 1080;
      ownCtx = ownCanvas.getContext("2d");
      footage = ownCanvas;
    }
    // the picture and the avatar; the generated scene shows until the picture has loaded
    let photo: HTMLImageElement | null = null;
    let avatarEl: HTMLImageElement | HTMLVideoElement | null = null;
    let video: HTMLVideoElement | null = null;
    if (!source) {
      if (picture) {
        const img = new Image();
        // drawn into a canvas that feeds the 3D scene: a cross-origin scene image must be CORS-readable
        // (otherwise it simply never loads and the generated scene stays)
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.onload = () => {
          photo = img;
        };
        img.src = picture;
      }
      if (avatarVideo) {
        video = document.createElement("video");
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "auto";
        if (avatarVideoFallback) {
          const webm = document.createElement("source");
          webm.src = avatarVideo;
          webm.type = "video/webm";
          const mp4 = document.createElement("source");
          mp4.src = avatarVideoFallback;
          mp4.type = "video/mp4";
          video.append(webm, mp4);
        } else {
          video.src = avatarVideo;
        }
        avatarEl = video;
      } else if (avatarImage) {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          avatarEl = img;
        };
        img.src = avatarImage;
      }
    }

    const texture = new CanvasTexture(footage);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);
    camera.position.z = 5;

    const uniforms = {
      uTex: { value: texture },
      uRect0: { value: new Vector4() },
      uRect1: { value: new Vector4() },
      uP: { value: 0 },
      uVel: { value: 0 },
      uTime: { value: 0 },
      uView: { value: new Vector2(1, 1) },
      uRadius: { value: RADIUS_THUMB },
    };
    const geometry = new PlaneGeometry(1, 1, 64, 40);
    const material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 1;
    let height = 1;
    let stageH = 1;
    let padX = 0;
    let thumbBottom = 0;
    let fullRect = { x: 0, y: 0, w: 1, h: 1 };
    let current = 0;
    let target = 0;
    let lastTarget = 0;
    let velocity = 0;
    let lastTime = performance.now();
    let frame = 0;
    let visible = true;
    let lastPaint = 0;

    const readTarget = (): number => {
      const rect = track.getBoundingClientRect();
      const range = Math.max(1, track.offsetHeight - stageH);
      return easeInOutCubic(clamp01(-rect.top / range / MORPH_END));
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      stageH = height;
      renderer.setSize(width, height, false);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      uniforms.uView.value.set(width, height);

      const parent = host.parentElement;
      padX = parent ? parseFloat(getComputedStyle(parent).paddingLeft) || 0 : 0;
      const tw = window.innerWidth * THUMB_WIDTH;
      const th = (tw * 3) / 4;
      const tx = padX;
      const ty = window.innerWidth * THUMB_TOP;
      thumbBottom = ty + th;
      const fw = Math.max(1, width - padX * 2);
      const fh = height * FULL_HEIGHT;
      fullRect = { x: padX, y: (height - fh) / 2, w: fw, h: fh };
      uniforms.uRect0.value.set(tx, ty, tw, th);
      uniforms.uRect1.value.set(fullRect.x, fullRect.y, fullRect.w, fullRect.h);
      target = readTarget();
      lastTarget = target;
      if (reduceMq.matches) current = 1;
    };

    const layoutOverlay = (p: number) => {
      // ghosted title drifts down and fades as the card shrinks
      const textY0 = thumbBottom + height * 0.1;
      const dy = lerp(textY0 - height / 2, 0, p);
      text.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
      text.style.opacity = (0.14 + 0.86 * smoothstep(0.6, 1, p)).toFixed(3);
      const decoOpacity = smoothstep(0.85, 1, p).toFixed(3);
      crossTop.style.opacity = decoOpacity;
      crossBottom.style.opacity = decoOpacity;
      crossTop.style.top = `${(fullRect.y - 28).toFixed(1)}px`;
      crossBottom.style.top = `${(fullRect.y + fullRect.h + 12).toFixed(1)}px`;
      crossTop.style.left = crossBottom.style.left = `${fullRect.x}px`;
      crossTop.style.width = crossBottom.style.width = `${fullRect.w}px`;
    };

    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (!visible || document.documentElement.hasAttribute("data-pt-busy")) {
        lastTime = now;
        return;
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (!reduceMq.matches) {
        target = readTarget();
        current += (target - current) * PROGRESS_LERP;
        if (Math.abs(target - current) < 0.0004) current = target;
      } else {
        current = 1;
      }
      // signed scroll velocity, smoothed, decays when idle
      const raw = (target - lastTarget) / dt;
      lastTarget = target;
      velocity += (clamp01(Math.abs(raw) * 0.35) * Math.sign(raw) - velocity) * VELOCITY_SMOOTH;
      if (Math.abs(velocity) < 0.002) velocity = 0;

      uniforms.uP.value = current;
      uniforms.uVel.value = velocity;
      uniforms.uTime.value = now / 1000;
      uniforms.uRadius.value = lerp(RADIUS_THUMB, RADIUS_FULL, current);

      if (ownCtx && ownCanvas && now - lastPaint > 33) {
        if (photo) paintPicture(ownCtx, photo, avatarEl, ownCanvas.width, ownCanvas.height, now / 1000);
        else paintFootage(ownCtx, ownCanvas.width, ownCanvas.height, now / 1000);
        texture.needsUpdate = true;
        lastPaint = now;
      } else if (source) {
        texture.needsUpdate = true;
      }

      layoutOverlay(current);
      renderer.render(scene, camera);
    };

    resize();
    layoutOverlay(current);
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (video) {
          if (visible) void video.play().catch(() => undefined);
          else video.pause();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(host);
    current = target;
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.replaceChildren();
        video.load();
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      canvas.remove();
    };    }

  }, [trackRef, source, picture, avatarImage, avatarVideo, avatarVideoFallback]);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-visible">
      {/* canvas is inserted here by the effect */}
      <div
        ref={crossTopRef}
        aria-hidden="true"
        className="pointer-events-none absolute flex justify-between text-[1.1vw] leading-none text-black opacity-0"
      >
        <span>+</span>
        <span className="max-lg:hidden">+</span>
        <span>+</span>
        <span className="max-lg:hidden">+</span>
        <span>+</span>
      </div>
      <div
        ref={crossBottomRef}
        aria-hidden="true"
        className="pointer-events-none absolute flex justify-between text-[1.1vw] leading-none text-black opacity-0"
      >
        <span>+</span>
        <span className="max-lg:hidden">+</span>
        <span>+</span>
        <span className="max-lg:hidden">+</span>
        <span>+</span>
      </div>
      <div
        ref={textRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[3vw] text-[9vw] font-medium leading-none text-white will-change-transform"
        style={{ opacity: 0.14 }}
      >
        <span>PLAY</span>
        <button
          type="button"
          aria-label="Start the story"
          onClick={onPlay}
          className="pointer-events-auto flex h-[6.2vw] w-[9vw] items-center justify-center rounded-full bg-white transition-transform duration-300 hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="h-[2.6vw] w-[2.6vw] fill-black" aria-hidden="true">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
        </button>
        <span>STORY</span>
      </div>
    </div>
  );
}
