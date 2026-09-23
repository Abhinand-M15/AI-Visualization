"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, Center, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/** Cloned per instance — the same GLB can appear in several chunks on one
 *  page, and a single Object3D can only live under one parent at a time.
 *  Gently scales up on hover/drag as a hint that it's interactive. */
function Model({ url, onHoverChange }: { url: string; onHoverChange: (hovered: boolean) => void }) {
  const { scene } = useGLTF(url);
  const cloned = useRef<THREE.Object3D | null>(null);
  if (!cloned.current) cloned.current = scene.clone();
  const groupRef = useRef<THREE.Group>(null);
  const hoveredRef = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = hoveredRef.current ? 1.08 : 1;
    const s = THREE.MathUtils.damp(groupRef.current.scale.x || 1, target, 6, delta);
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoveredRef.current = true;
        onHoverChange(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        hoveredRef.current = false;
        onHoverChange(false);
      }}
    >
      <primitive object={cloned.current} />
    </group>
  );
}

function AvatarCanvas({ url }: { url: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ width: "100%", height: "100%", cursor: hovered ? "grab" : "default", touchAction: "pan-y" }}>
      <Canvas
        camera={{ fov: 32 }}
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          // A real, working WebGL context is guaranteed by the time this
          // ever mounts (AvatarDisplay probes for a disabled/sandboxed GPU
          // first and falls back to the static image otherwise) — asking
          // for the strongest available GPU here, not the weakest, is what
          // keeps drag-rotate smooth instead of laggy.
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ width: "100%", height: "100%", background: "transparent", touchAction: "pan-y" }}
        onCreated={({ gl }) => {
          // Browsers sometimes drop a context under memory/GPU pressure —
          // without this the tab just goes black; with it, three.js gets a
          // chance to restore the context instead of dying silently.
          gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
        }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} />
        <Suspense fallback={null}>
          {/* margin kept tight so the model fills most of its box — this is
              the "make the bot bigger" lever, shared by every template. */}
          <Bounds fit clip observe margin={1.05}>
            <Center>
              <Model url={url} onHoverChange={setHovered} />
            </Center>
          </Bounds>
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate
          enableDamping
          dampingFactor={0.12}
          makeDefault
          onStart={() => {
            document.body.style.cursor = "grabbing";
          }}
          onEnd={() => {
            document.body.style.cursor = "auto";
          }}
        />
      </Canvas>
    </div>
  );
}

// ------------------------------------------------------------------
// Global single-slot lock: guarantees AT MOST ONE avatar WebGL context
// exists anywhere on the page at any instant, with no overlap window.
// The first (per-instance) fix only stopped mounting avatars that were
// far from the viewport, but two adjacent full-height sections can both
// be briefly on-screen during a scroll transition — on a GPU-constrained
// browser (the reported "GL_VENDOR=Disabled, Sandboxed=yes" case) even
// two simultaneous contexts is enough to fail. Instances that want the
// slot but don't hold it just wait and poll, rather than mounting anyway.
// ------------------------------------------------------------------
let activeAvatarSlot: symbol | null = null;

function useAvatarSlot(wantsSlot: boolean): boolean {
  const idRef = useRef<symbol | null>(null);
  if (!idRef.current) idRef.current = Symbol("avatar-slot");
  const [hasSlot, setHasSlot] = useState(false);

  useEffect(() => {
    const id = idRef.current!;
    if (!wantsSlot) {
      if (activeAvatarSlot === id) activeAvatarSlot = null;
      setHasSlot(false);
      return;
    }
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    function tryAcquire() {
      if (cancelled) return;
      if (activeAvatarSlot === null || activeAvatarSlot === id) {
        activeAvatarSlot = id;
        setHasSlot(true);
      } else {
        setHasSlot(false);
        timeoutId = setTimeout(tryAcquire, 350);
      }
    }
    tryAcquire();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (activeAvatarSlot === id) activeAvatarSlot = null;
    };
  }, [wantsSlot]);

  return hasSlot;
}

/**
 * Live 3D stand-in for a static avatar image. Takes the exact className the
 * old `<img>` used, so it drops into the same layout slot at the same size.
 *
 * Mounts its Canvas (and the WebGL context that comes with it) only while
 * scrolled near the viewport AND only if no other avatar currently holds
 * the single global slot — see `useAvatarSlot` above. With one avatar per
 * story chunk, mounting all of them at once tries to open one WebGL context
 * per chunk simultaneously; on a GPU-constrained or sandboxed browser that
 * exhausts the context limit almost immediately and every canvas fails
 * ("WebGLRenderer: Error creating WebGL context"). Guaranteeing exactly one
 * (never even briefly two) avoids that entirely.
 */
export function Avatar3D({ url, className }: { url: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNearViewport(entry.isIntersecting), {
      rootMargin: "100px 0px",
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hasSlot = useAvatarSlot(nearViewport);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {hasSlot && <AvatarCanvas url={url} />}
    </div>
  );
}
