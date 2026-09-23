"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import { RealisticMoon, ParticleRing, AsteroidBelt } from "./lunar-gravity-card";

function AutoRotateGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
  });
  return (
    <group ref={groupRef} rotation={[Math.PI / 8, 0, 0]}>
      {children}
    </group>
  );
}

/**
 * Fixed full-page 3D backdrop — the moon + particle ring + asteroid belt
 * scene from LunarGravityCard (components/ui/lunar-gravity-card.tsx),
 * stripped of its card chrome, title/copy, and click-to-reveal gating (the
 * ring and asteroids are always shown, mid-formation) so it reads as an
 * ambient background behind scrolling page content — the same role
 * ASMRBackground plays for the Space template.
 *
 * Draggable via OrbitControls (rotate only — no zoom/pan, matching the
 * original card; damping on so it keeps drifting briefly after release,
 * which is what actually makes the drag *read* as working rather than a
 * one-pixel nudge you have to squint to notice). Mouse only: `touches={{}}`
 * leaves one- and two-finger touch gestures unhandled by OrbitControls, and
 * `touchAction: "pan-y"` overrides react-three-fiber's own default of
 * `touch-action: none` on its event-root div — without that override, a
 * touch-scroll anywhere on the page (this backdrop covers all of it) would
 * still get swallowed by the canvas at the browser level even with
 * OrbitControls itself refusing to handle it.
 *
 * The wrapper div stays `pointer-events-none` (so it never intercepts
 * anything by default); only the canvas re-enables pointer events, and real
 * page content still wins every hit-test where it visually covers the
 * canvas — only the empty background responds to hover/drag.
 */
export function LunarBackground() {
  const massiveAsteroidsRef = useRef<Float32Array>(new Float32Array(75 * 4));

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-black">
      <Canvas
        shadows
        camera={{ position: [0, 4, 10], fov: 45 }}
        dpr={[1, 2]}
        style={{ pointerEvents: "auto", touchAction: "pan-y" }}
      >
        <ambientLight intensity={0.02} />
        <directionalLight position={[8, 5, 5]} intensity={1.5} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-5, -3, -5]} intensity={0.15} color="#4a90e2" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate
          enableDamping
          dampingFactor={0.08}
          touches={{}}
          onStart={() => {
            document.body.style.cursor = "grabbing";
          }}
          onEnd={() => {
            document.body.style.cursor = "auto";
          }}
        />
        <Suspense fallback={null}>
          <AutoRotateGroup>
            <RealisticMoon />
            <ParticleRing ringState="visible" massiveAsteroidsRef={massiveAsteroidsRef} />
            <AsteroidBelt ringState="visible" massiveAsteroidsRef={massiveAsteroidsRef} />
          </AutoRotateGroup>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
