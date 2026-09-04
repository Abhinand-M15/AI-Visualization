"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
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
 * ASMRBackground plays for the Space template. No OrbitControls: a
 * background needs to let scroll/click events pass through to the real page
 * content above it, and OrbitControls' drag-to-orbit handling would instead
 * capture and block those; a slow constant auto-rotate gives the same "alive"
 * feel without hijacking input.
 */
export function LunarBackground() {
  const massiveAsteroidsRef = useRef<Float32Array>(new Float32Array(75 * 4));

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-black">
      <Canvas shadows camera={{ position: [0, 4, 10], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.02} />
        <directionalLight position={[8, 5, 5]} intensity={1.5} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-5, -3, -5]} intensity={0.15} color="#4a90e2" />
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
