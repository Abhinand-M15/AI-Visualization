"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BoxGeometry,
  CatmullRomCurve3,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { runWhenIdle } from "./runWhenIdle";

export type FlowLineProps = {
  /** Two gradient stops, start and end of the line. */
  colors: [string, string];
  /** Control points as fractions of the wrapper box, origin top-left, y down. */
  points: [number, number][];
  /** Tube radius as a fraction of the wrapper width. */
  radius?: number;
  /** [from, to] scroll ratios (0..1 of the wrapper travelling through the viewport) over which the line draws. */
  range?: [number, number];
  /** >1 keeps the line closer to the first colour for longer. */
  gradientBias?: number;
  /** ms before the scene is created (stagger several lines). */
  delay?: number;
  className?: string;
};

const VERT = /* glsl */ `
  varying vec3 vNormal;
  varying float vAlong;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vAlong = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform float uProgress;
  uniform float uHalo;
  uniform float uBias;
  varying vec3 vNormal;
  varying float vAlong;
  void main() {
    if (vAlong > uProgress) discard;
    vec3 n = normalize(vNormal);
    vec3 base = mix(uColor0, uColor1, pow(vAlong, uBias));
    if (uHalo > 0.5) {
      float a = pow(max(n.z, 0.0), 1.5) * 0.28;
      gl_FragColor = vec4(base, a);
      return;
    }
    float diffuse = 0.55 + 0.45 * max(dot(n, normalize(vec3(-0.3, 0.6, 0.75))), 0.0);
    float rim = pow(1.0 - max(n.z, 0.0), 2.5);
    float spec = pow(max(dot(n, normalize(vec3(0.25, 0.55, 0.8))), 0.0), 28.0);
    // brighten the head of the line while it is still drawing
    float head = smoothstep(uProgress - 0.04, uProgress, vAlong) * 0.6;
    vec3 col = base * diffuse + base * rim * 0.9 + vec3(spec) * 0.55 + vec3(head);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function smooth(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

export function FlowLine({
  colors,
  points,
  radius = 0.012,
  range = [0.1, 0.9],
  gradientBias = 1,
  delay = 500,
  className,
}: FlowLineProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    let cleanup: (() => void) | undefined;
    const cancel = runWhenIdle(() => {
      cleanup = setup();
    }, delay);
    return () => {
      cancel();
      cleanup?.();
    };

    function setup(): (() => void) | undefined {
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    host.appendChild(canvas);

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      canvas.remove();
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, -2000, 2000);
    camera.position.z = 10;
    const group = new Group();
    scene.add(group);

    const mat = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uColor0: { value: new Color(colors[0]) },
        uColor1: { value: new Color(colors[1]) },
        uProgress: { value: 0 },
        uHalo: { value: 0 },
        uBias: { value: gradientBias },
      },
    });
    const haloMat = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uColor0: { value: new Color(colors[0]) },
        uColor1: { value: new Color(colors[1]) },
        uProgress: { value: 0 },
        uHalo: { value: 1 },
        uBias: { value: gradientBias },
      },
    });
    const crossMat = new MeshBasicMaterial({ color: new Color(colors[1]) });
    const crossStartMat = new MeshBasicMaterial({ color: new Color(colors[0]) });

    let width = 1;
    let height = 1;
    let curve: CatmullRomCurve3 | null = null;
    let tubeMesh: Mesh | null = null;
    let haloMesh: Mesh | null = null;
    const crossStart = new Group();
    const crossEnd = new Group();
    group.add(crossStart, crossEnd);

    const buildCross = (g: Group, m: MeshBasicMaterial, size: number) => {
      g.clear();
      const t = size / 8;
      const a = new Mesh(new BoxGeometry(size, t, 1), m);
      const b = new Mesh(new BoxGeometry(t, size, 1), m);
      g.add(a, b);
    };

    const disposeTubes = () => {
      for (const mesh of [tubeMesh, haloMesh]) {
        if (mesh) {
          group.remove(mesh);
          mesh.geometry.dispose();
        }
      }
      tubeMesh = null;
      haloMesh = null;
      for (const g of [crossStart, crossEnd]) {
        g.children.forEach((c) => (c as Mesh).geometry.dispose());
      }
    };

    const rebuild = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      // keep the drawing buffer small on tall hosts
      const pr = Math.max(
        0.75,
        Math.min(window.devicePixelRatio, 1.5, Math.sqrt(3_500_000 / (width * height))),
      );
      renderer.setPixelRatio(pr);
      renderer.setSize(width, height, false);
      dirty = true;
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();

      disposeTubes();
      const pts = points.map(([x, y]) => new Vector3((x - 0.5) * width, (0.5 - y) * height, 0));
      curve = new CatmullRomCurve3(pts, false, "catmullrom", 0.5);
      const r = radius * width;
      tubeMesh = new Mesh(new TubeGeometry(curve, 420, r, 28, false), mat);
      haloMesh = new Mesh(new TubeGeometry(curve, 420, r * 2.4, 20, false), haloMat);
      haloMesh.position.z = -1;
      group.add(haloMesh, tubeMesh);

      const cs = Math.max(14, Math.min(32, width * 0.014));
      buildCross(crossStart, crossStartMat, cs);
      buildCross(crossEnd, crossMat, cs);
      crossStart.position.copy(curve.getPoint(0));
      crossEnd.position.copy(curve.getPoint(1));
    };

    let dirty = true;
    let lastRendered = -1;
    let frame = 0;
    let progress = 0;
    let shown = 0;
    let visible = true;

    const measure = () => {
      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh - rect.top) / (rect.height + vh);
      progress = smooth((raw - range[0]) / (range[1] - range[0]));
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.documentElement.hasAttribute("data-pt-busy")) return;
      measure();
      // ease toward the scroll-driven target so the line trails the scroll slightly
      shown += (progress - shown) * 0.12;
      if (Math.abs(progress - shown) < 0.0004) shown = progress;
      // nothing moved since the last draw: skip the GPU work
      if (!dirty && shown === lastRendered) return;
      dirty = false;
      lastRendered = shown;
      mat.uniforms.uProgress.value = shown;
      haloMat.uniforms.uProgress.value = shown;
      crossStart.visible = shown > 0.002;
      crossEnd.visible = shown > 0.985;
      renderer.render(scene, camera);
    };

    rebuild();
    const ro = new ResizeObserver(rebuild);
    ro.observe(host);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
      },
      { rootMargin: "100px" },
    );
    io.observe(host);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      disposeTubes();
      mat.dispose();
      haloMat.dispose();
      crossMat.dispose();
      crossStartMat.dispose();
      renderer.dispose();
      canvas.remove();
    };    }

  }, [colors, points, radius, range, gradientBias, delay]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}
