import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Fog,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Quaternion,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

const BG = 0x05060d;
const ACCENT = 0xc1ff00;
const TUNNEL_LENGTH = 120;
const HALF = 5; // half-width of corridor
const SHATTER_START = 0.78;
const PARTICLES = 900;

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(a: number, b: number, v: number): number {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}

export function createTunnel(
  canvas: HTMLCanvasElement,
  getProgress: () => number,
): { dispose(): void } {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(BG, 1);
  const scene = new Scene();
  scene.fog = new Fog(BG, 8, 48);
  const camera = new PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, 0);

  scene.add(new AmbientLight(0x8890c0, 0.8));
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(2, 3, 4);
  scene.add(key);

  const rand = mulberry32(1337);
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];

  // ---- Corridor boxes (instanced) ----
  const boxGeo = new BoxGeometry(1, 1, 1);
  const boxMat = new MeshStandardMaterial({
    color: 0x10132a,
    roughness: 0.6,
    metalness: 0.3,
  });
  geometries.push(boxGeo);
  materials.push(boxMat);

  const cells = Math.floor(TUNNEL_LENGTH / 2.5);
  const perRing = 4 * 5;
  const count = cells * perRing;
  const boxes = new InstancedMesh(boxGeo, boxMat, count);
  const m = new Matrix4();
  const q = new Quaternion();
  const s = new Vector3();
  const p = new Vector3();
  let idx = 0;
  for (let i = 0; i < cells; i++) {
    const z = -i * 2.5 - 2;
    for (let side = 0; side < 4; side++) {
      for (let k = 0; k < 5; k++) {
        const u = (k - 2) * 2 + (rand() - 0.5) * 0.3;
        const depth = 0.4 + rand() * 1.4;
        const w = 1.4 + rand() * 0.5;
        const h = 1.4 + rand() * 0.5;
        const off = HALF + depth / 2 - 0.2;
        if (side === 0) {
          p.set(u, off, z);
          s.set(w, depth, h);
        } else if (side === 1) {
          p.set(u, -off, z);
          s.set(w, depth, h);
        } else if (side === 2) {
          p.set(off, u, z);
          s.set(depth, w, h);
        } else {
          p.set(-off, u, z);
          s.set(depth, w, h);
        }
        m.compose(p, q, s);
        boxes.setMatrixAt(idx++, m);
      }
    }
  }
  boxes.instanceMatrix.needsUpdate = true;
  scene.add(boxes);

  // Grid lines running down the corridor
  const gridPts: number[] = [];
  for (let i = -HALF; i <= HALF; i += 2.5) {
    gridPts.push(i, HALF, 0, i, HALF, -TUNNEL_LENGTH);
    gridPts.push(i, -HALF, 0, i, -HALF, -TUNNEL_LENGTH);
    gridPts.push(HALF, i, 0, HALF, i, -TUNNEL_LENGTH);
    gridPts.push(-HALF, i, 0, -HALF, i, -TUNNEL_LENGTH);
  }
  for (let z = 0; z >= -TUNNEL_LENGTH; z -= 5) {
    gridPts.push(-HALF, HALF, z, HALF, HALF, z);
    gridPts.push(-HALF, -HALF, z, HALF, -HALF, z);
    gridPts.push(HALF, -HALF, z, HALF, HALF, z);
    gridPts.push(-HALF, -HALF, z, -HALF, HALF, z);
  }
  const gridGeo = new BufferGeometry();
  gridGeo.setAttribute("position", new BufferAttribute(new Float32Array(gridPts), 3));
  const gridMat = new LineBasicMaterial({ color: 0x2b2e3a, transparent: true, opacity: 0.9 });
  geometries.push(gridGeo);
  materials.push(gridMat);
  scene.add(new LineSegments(gridGeo, gridMat));

  // Accent edge outlines on a sparse subset of ring frames
  const frameGeo = new EdgesGeometry(new BoxGeometry(HALF * 2, HALF * 2, 0.05));
  const frameMat = new LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.55 });
  geometries.push(frameGeo);
  materials.push(frameMat);
  for (let z = -20; z > -TUNNEL_LENGTH; z -= 20) {
    const f = new LineSegments(frameGeo, frameMat);
    f.position.z = z;
    scene.add(f);
  }

  // ---- Stylised floating figure from primitives ----
  const figure = new Group();
  const figMat = new MeshStandardMaterial({ color: 0xf0f1fa, roughness: 0.35, metalness: 0.1 });
  const accentMat = new MeshStandardMaterial({
    color: ACCENT,
    emissive: ACCENT,
    emissiveIntensity: 0.5,
    roughness: 0.4,
  });
  materials.push(figMat, accentMat);

  const headGeo = new SphereGeometry(0.34, 24, 16);
  const torsoGeo = new CylinderGeometry(0.3, 0.42, 1.0, 20);
  const limbGeo = new CylinderGeometry(0.1, 0.08, 0.9, 12);
  const jointGeo = new SphereGeometry(0.13, 12, 10);
  const haloGeo = new EdgesGeometry(new BoxGeometry(1.6, 1.6, 1.6));
  geometries.push(headGeo, torsoGeo, limbGeo, jointGeo, haloGeo);

  const head = new Mesh(headGeo, figMat);
  head.position.y = 0.95;
  const torso = new Mesh(torsoGeo, figMat);
  const chest = new Mesh(jointGeo, accentMat);
  chest.position.set(0, 0.15, 0.36);
  chest.scale.setScalar(1.4);

  function limb(x: number, y: number, rz: number): Object3D {
    const pivot = new Group();
    pivot.position.set(x, y, 0);
    pivot.rotation.z = rz;
    const l = new Mesh(limbGeo, figMat);
    l.position.y = -0.45;
    const j = new Mesh(jointGeo, accentMat);
    pivot.add(l, j);
    return pivot;
  }
  const armL = limb(-0.45, 0.4, 2.5);
  const armR = limb(0.45, 0.4, -2.5);
  const legL = limb(-0.2, -0.5, 0.25);
  const legR = limb(0.2, -0.5, -0.25);
  const halo = new LineSegments(haloGeo, new LineBasicMaterial({ color: ACCENT }));
  materials.push(halo.material as Material);
  figure.add(head, torso, chest, armL, armR, legL, legR, halo);
  const FIG_Z = -TUNNEL_LENGTH + 18;
  figure.position.set(0, 0, FIG_Z);
  scene.add(figure);

  const figLight = new DirectionalLight(ACCENT, 1.2);
  figLight.position.set(-2, 1, FIG_Z + 4);
  scene.add(figLight);

  // ---- Glass pane in front of the figure ----
  const paneGeo = new PlaneGeometry(HALF * 2 - 0.4, HALF * 2 - 0.4);
  const paneMat = new MeshStandardMaterial({
    color: 0x9fb4ff,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
    metalness: 0.6,
    side: DoubleSide,
  });
  geometries.push(paneGeo);
  materials.push(paneMat);
  const pane = new Mesh(paneGeo, paneMat);
  const PANE_Z = FIG_Z + 9;
  pane.position.z = PANE_Z;
  scene.add(pane);

  // ---- Shatter particles ----
  const origins = new Float32Array(PARTICLES * 3);
  const vels = new Float32Array(PARTICLES * 3);
  const positions = new Float32Array(PARTICLES * 3);
  const spin = new Float32Array(PARTICLES);
  for (let i = 0; i < PARTICLES; i++) {
    origins[i * 3] = (rand() - 0.5) * (HALF * 2 - 0.4);
    origins[i * 3 + 1] = (rand() - 0.5) * (HALF * 2 - 0.4);
    origins[i * 3 + 2] = PANE_Z;
    const dx = origins[i * 3];
    const dy = origins[i * 3 + 1];
    vels[i * 3] = dx * 1.4 + (rand() - 0.5) * 3;
    vels[i * 3 + 1] = dy * 1.4 + (rand() - 0.5) * 3;
    vels[i * 3 + 2] = -4 - rand() * 14;
    spin[i] = rand() * Math.PI * 2;
  }
  const pGeo = new BufferGeometry();
  const posAttr = new BufferAttribute(positions, 3);
  pGeo.setAttribute("position", posAttr);
  const pMat = new PointsMaterial({
    color: new Color(0xc9d6ff),
    size: 0.14,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  geometries.push(pGeo);
  materials.push(pMat);
  const shards = new Points(pGeo, pMat);
  shards.frustumCulled = false;
  scene.add(shards);

  // ---- Sizing ----
  function resize(): void {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  // ---- Loop ----
  let raf = 0;
  let smooth = clamp01(getProgress());
  const start = performance.now();
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    if (document.documentElement.hasAttribute("data-pt-busy")) return;
    const t = reduced ? 0 : (now - start) / 1000;
    smooth += (clamp01(getProgress()) - smooth) * 0.1;
    const prog = smooth;

    const camZ = -prog * (TUNNEL_LENGTH - 30);
    camera.position.set(Math.sin(t * 0.4) * 0.15, Math.cos(t * 0.3) * 0.1, camZ);
    camera.rotation.z = Math.sin(prog * Math.PI * 2) * 0.05;

    figure.position.y = Math.sin(t * 1.2) * 0.25;
    figure.rotation.y = Math.sin(t * 0.5) * 0.5 + prog * Math.PI;
    armL.rotation.z = 2.5 + Math.sin(t * 1.6) * 0.2;
    armR.rotation.z = -2.5 - Math.sin(t * 1.6 + 1) * 0.2;
    halo.rotation.set(t * 0.4, t * 0.5, 0);

    // Shatter progress 0..1
    const sp = clamp01((prog - SHATTER_START) / (1 - SHATTER_START));
    pane.visible = sp === 0;
    paneMat.opacity = 0.18 + smoothstep(0.5, SHATTER_START, prog) * 0.12;
    if (sp > 0) {
      const tt = sp * 2.2;
      for (let i = 0; i < PARTICLES; i++) {
        const i3 = i * 3;
        positions[i3] = origins[i3] + vels[i3] * tt + Math.sin(spin[i] + tt * 3) * 0.1;
        positions[i3 + 1] = origins[i3 + 1] + vels[i3 + 1] * tt - tt * tt * 1.5;
        positions[i3 + 2] = origins[i3 + 2] + vels[i3 + 2] * tt;
      }
      posAttr.needsUpdate = true;
      pMat.opacity = Math.min(1, sp * 6) * (1 - smoothstep(0.6, 1, sp) * 0.7);
      shards.visible = true;
    } else {
      shards.visible = false;
    }

    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    dispose(): void {
      cancelAnimationFrame(raf);
      observer.disconnect();
      scene.traverse((o) => {
        const mesh = o as Mesh;
        if (mesh.geometry) geometries.push(mesh.geometry);
      });
      new Set(geometries).forEach((g) => g.dispose());
      new Set(materials).forEach((mt) => mt.dispose());
      boxes.dispose();
      renderer.dispose();
    },
  };
}
