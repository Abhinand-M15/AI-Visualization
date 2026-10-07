import {
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  Euler,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const COUNT = 40;
const PALETTE = ["#16171d", "#ffffff", "#c9ccd8", "#1a2ffb"] as const;

interface Piece {
  nx: number;
  ny: number;
  z: number;
  scale: number;
  rot: Vector3;
  spin: Vector3;
  phase: number;
  floatAmp: number;
  offX: number;
  offY: number;
}

function createMatcapTexture(): CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(
      size * 0.36,
      size * 0.32,
      size * 0.02,
      size / 2,
      size / 2,
      size * 0.52,
    );
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.45, "#d6d8e2");
    g.addColorStop(0.8, "#7c8094");
    g.addColorStop(1, "#2c2f3d");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function buildCross(radius: number, length: number): BufferGeometry {
  const base = new CylinderGeometry(radius, radius, length, 28, 1);
  const x = base.clone();
  x.rotateZ(Math.PI / 2);
  const z = base.clone();
  z.rotateX(Math.PI / 2);
  const parts: BufferGeometry[] = [base, x, z];
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  if (!merged) throw new Error("Failed to merge cross geometry");
  return merged;
}

export function createHeroCrosses(canvas: HTMLCanvasElement): { dispose(): void } {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(new Color("#0a0d1a"), 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 22;

  const matcap = createMatcapTexture();
  const outerGeo = buildCross(0.32, 2);
  // Slightly longer, thinner, dark cylinders poke out of the arm ends to read as holes.
  const innerGeo = buildCross(0.17, 2.02);
  const outerMat = new MeshMatcapMaterial({ matcap });
  const innerMat = new MeshBasicMaterial({ color: new Color("#05060d") });
  const outer = new InstancedMesh(outerGeo, outerMat, COUNT);
  const inner = new InstancedMesh(innerGeo, innerMat, COUNT);
  outer.instanceMatrix.setUsage(DynamicDrawUsage);
  inner.instanceMatrix.setUsage(DynamicDrawUsage);
  scene.add(outer, inner);

  const tmpColor = new Color();
  const pieces: Piece[] = [];
  for (let i = 0; i < COUNT; i += 1) {
    pieces.push({
      nx: (Math.random() * 2 - 1) * 1.05,
      ny: (Math.random() * 2 - 1) * 1.05,
      z: -4 + Math.random() * 7,
      scale: 0.7 + Math.random() * 1.1,
      rot: new Vector3(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28),
      spin: new Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
      ),
      phase: Math.random() * 6.28,
      floatAmp: 0.15 + Math.random() * 0.3,
      offX: 0,
      offY: 0,
    });
    tmpColor.set(PALETTE[i % PALETTE.length]);
    outer.setColorAt(i, tmpColor);
  }
  if (outer.instanceColor) outer.instanceColor.needsUpdate = true;

  let halfW = 8;
  let halfH = 4;
  const resize = (): void => {
    const w = Math.max(canvas.clientWidth, 1);
    const h = Math.max(canvas.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    halfW = halfH * camera.aspect;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let px = 0;
  let py = 0;
  let active = false;
  let smx = 0;
  let smy = 0;
  const onMove = (ev: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    px = ((ev.clientX - r.left) / r.width) * 2 - 1;
    py = -(((ev.clientY - r.top) / r.height) * 2 - 1);
    active = px >= -1 && px <= 1 && py >= -1 && py <= 1;
  };
  const onLeave = (): void => {
    active = false;
  };
  window.addEventListener("pointermove", onMove);
  document.addEventListener("pointerleave", onLeave);

  const m = new Matrix4();
  const q = new Quaternion();
  const eul = new Euler();
  const pos = new Vector3();
  const scl = new Vector3();
  let raf = 0;
  let last = performance.now();
  let t = 0;

  const tick = (now: number): void => {
    raf = requestAnimationFrame(tick);
    if (document.documentElement.hasAttribute("data-pt-busy")) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    smx += ((active ? px : 0) - smx) * Math.min(dt * 3, 1);
    smy += ((active ? py : 0) - smy) * Math.min(dt * 3, 1);
    camera.position.x = smx * 0.8;
    camera.position.y = smy * 0.5;
    camera.lookAt(0, 0, 0);

    const pwx = px * halfW;
    const pwy = py * halfH;
    for (let i = 0; i < COUNT; i += 1) {
      const p = pieces[i];
      let tx = 0;
      let ty = 0;
      if (active) {
        const dx = p.nx * halfW - pwx;
        const dy = p.ny * halfH - pwy;
        const d = Math.hypot(dx, dy) + 0.0001;
        const f = Math.max(0, 1 - d / 3.5);
        tx = (dx / d) * f * 2.2;
        ty = (dy / d) * f * 2.2;
      }
      p.offX += (tx - p.offX) * Math.min(dt * 4, 1);
      p.offY += (ty - p.offY) * Math.min(dt * 4, 1);
      p.rot.x += p.spin.x * dt;
      p.rot.y += p.spin.y * dt;
      p.rot.z += p.spin.z * dt;
      pos.set(
        p.nx * halfW + p.offX,
        p.ny * halfH + p.offY + Math.sin(t * 0.8 + p.phase) * p.floatAmp,
        p.z,
      );
      eul.set(p.rot.x, p.rot.y, p.rot.z);
      q.setFromEuler(eul);
      scl.setScalar(p.scale);
      m.compose(pos, q, scl);
      outer.setMatrixAt(i, m);
      inner.setMatrixAt(i, m);
    }
    outer.instanceMatrix.needsUpdate = true;
    inner.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return {
    dispose(): void {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      outer.dispose();
      inner.dispose();
      outerGeo.dispose();
      innerGeo.dispose();
      outerMat.dispose();
      innerMat.dispose();
      matcap.dispose();
      renderer.dispose();
    },
  };
}
