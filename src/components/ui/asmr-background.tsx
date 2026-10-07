"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * ASMRBackground
 *
 * High-density particle system on a fixed full-viewport canvas, with a
 * reactive "magnetic vortex" effect on mouse/touch hover and a friction glow
 * on accelerating particles. Glass-shard and charcoal-dust aesthetic.
 *
 * Renders as a fixed backdrop (`position: fixed`, negative z-index) so it
 * sits behind scrolling page content instead of being confined to one
 * viewport-height hero section.
 */
export function ASMRBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width: number;
    let height: number;
    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: -1000, y: -1000 };

    const PARTICLE_COUNT = 1000;
    const MAGNETIC_RADIUS = 280;
    const VORTEX_STRENGTH = 0.07;
    const PULL_STRENGTH = 0.12;

    class Particle {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      size = 0;
      alpha = 0;
      color = "";
      rotation = 0;
      rotationSpeed = 0;
      frictionGlow = 0;
      // Fill style is only rebuilt when the alpha actually changes (most particles never glow).
      private styleAlpha = -1;
      private style = "";

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        // 70% Charcoal, 30% Glass
        const isGlass = Math.random() > 0.7;
        this.color = isGlass ? "240, 245, 255" : "80, 80, 85";
        this.alpha = Math.random() * 0.4 + 0.1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAGNETIC_RADIUS) {
          const force = (MAGNETIC_RADIUS - dist) / MAGNETIC_RADIUS;

          // Magnetic center pull
          this.vx += (dx / dist) * force * PULL_STRENGTH;
          this.vy += (dy / dist) * force * PULL_STRENGTH;

          // Swirl vortex motion (perpendicular to radius)
          this.vx += (dy / dist) * force * VORTEX_STRENGTH * 10;
          this.vy -= (dx / dist) * force * VORTEX_STRENGTH * 10;

          // Glow based on proximity and velocity
          this.frictionGlow = force * 0.7;
        } else {
          this.frictionGlow *= 0.92;
        }

        // Physics application
        this.x += this.vx;
        this.y += this.vy;

        // Friction / damping
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Background jitter (frozen static feel)
        this.vx += (Math.random() - 0.5) * 0.04;
        this.vy += (Math.random() - 0.5) * 0.04;

        this.rotation += this.rotationSpeed + (Math.abs(this.vx) + Math.abs(this.vy)) * 0.05;

        // Screen wrap
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;
      }

      draw() {
        if (!ctx) return;
        // One setTransform instead of save/translate/rotate/restore per particle.
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        ctx.setTransform(cos, sin, -sin, cos, this.x, this.y);

        const finalAlpha = Math.min(this.alpha + this.frictionGlow, 0.9);
        if (finalAlpha !== this.styleAlpha) {
          this.styleAlpha = finalAlpha;
          this.style = `rgba(${this.color}, ${finalAlpha})`;
        }
        ctx.fillStyle = this.style;

        const glowing = this.frictionGlow > 0.3;
        if (glowing) {
          ctx.shadowBlur = 8 * this.frictionGlow;
          ctx.shadowColor = `rgba(180, 220, 255, ${this.frictionGlow})`;
        }

        // Sharp shard geometry
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 2.5);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size * 2.5);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fill();

        if (glowing) ctx.shadowBlur = 0;
      }
    }

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    };

    // Resize is coalesced to one frame and keeps the particles (rescaled)
    // instead of respawning them: a phone's address bar collapsing while
    // scrolling fires resize and used to make the whole field jump.
    let resizeFrame = 0;
    const handleResize = () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        const nextW = window.innerWidth;
        const nextH = window.innerHeight;
        if (nextW === width && nextH === height) return;
        const sx = nextW / width;
        const sy = nextH / height;
        width = canvas.width = nextW;
        height = canvas.height = nextH;
        for (const p of particles) {
          p.x *= sx;
          p.y *= sy;
        }
      });
    };

    let cursorX = -1000;
    let cursorY = -1000;
    let cursorDirty = false;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      // The cursor dot follows the pointer, written once per frame rather than once per event.
      if (cursorDirty && cursorRef.current) {
        cursorDirty = false;
        cursorRef.current.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // Slight motion blur trail
      ctx.fillStyle = "rgba(10, 10, 12, 0.18)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorDirty = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    init();
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={cn("fixed inset-0 -z-10 bg-[#0A0A0C]", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-50 h-4 w-4 rounded-full border border-white/20 transition-transform duration-75 ease-out"
      />
    </div>
  );
}
