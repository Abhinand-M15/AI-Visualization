import type { Chunk, Project } from "@/lib/types";
import { getAvatarImage, type Avatar } from "@/lib/avatars";
import { flattenCaseStudySections, type CaseStudySection } from "@/lib/caseStudySections";

const GSAP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
const SCROLLTRIGGER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function audioUrl(supabaseUrl: string, projectId: string, chunk: Chunk): string | null {
  if (!chunk.audioUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/chunk-audio/${projectId}/${chunk.id}.mp3`;
}

function sectionAudioUrl(
  supabaseUrl: string,
  projectId: string,
  section: CaseStudySection,
  sectionAudio: Record<string, string> | undefined
): string | null {
  if (!sectionAudio?.[section.key]) return null;
  return `${supabaseUrl}/storage/v1/object/public/chunk-audio/${projectId}/case-study-${section.key}.mp3`;
}

/** Strips the leading slash so the path works as a relative reference inside the deploy bundle. */
function bundlePath(imageUrl: string): string {
  return imageUrl.replace(/^\//, "");
}

function avatarForIndex(index: number, avatars: Avatar[]): Avatar | undefined {
  if (avatars.length === 0) return undefined;
  return avatars[index % avatars.length];
}

function avatarImagePath(chunk: Chunk, index: number, avatars: Avatar[]): string | null {
  const avatar = avatarForIndex(index, avatars);
  if (!avatar) return null;
  return bundlePath(getAvatarImage(avatar, chunk.emotion));
}

function documentWrap(title: string, css: string, body: string, js: string, extraScripts: string[] = []): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${css}</style>
</head>
<body>
${body}
${extraScripts.map((src) => `<script src="${src}"></script>`).join("\n")}
<script src="${GSAP_CDN}"></script>
<script src="${SCROLLTRIGGER_CDN}"></script>
<script>${js}</script>
</body>
</html>`;
}

function renderEditorial(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const css = `
:root{color-scheme:light}
body{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:#fff;color:#171717;}
.header{padding:96px 32px 64px;}
.header h1{max-width:760px;font-size:2.5rem;font-weight:500;line-height:1.2;margin:0;}
@media(min-width:768px){.header h1{font-size:3rem;}}
.section{min-height:100vh;display:flex;flex-direction:column;align-items:center;gap:40px;border-top:1px solid #f0f0f0;padding:80px 32px;box-sizing:border-box;}
@media(min-width:768px){.section{flex-direction:row;gap:64px;padding:80px 64px;}}
.section.reversed{flex-direction:column;}
@media(min-width:768px){.section.reversed{flex-direction:row-reverse;}}
.avatar-wrap{width:100%;flex-shrink:0;display:flex;justify-content:center;}
@media(min-width:768px){.avatar-wrap{width:36%;}}
.avatar-wrap img{width:280px;height:280px;object-fit:contain;}
@media(min-width:768px){.avatar-wrap img{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#a3a3a3;}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(1.75rem, 4.6vw, 5rem);margin:0;}
.word{color:#d4d4d4;transition:color .15s;}
.word.spoken{color:#171717;}
audio{margin-top:8px;height:36px;max-width:360px;}
`;

  const sectionsHtml = project.chunks
    .map((chunk, index) => {
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const src = audioUrl(supabaseUrl, project.id, chunk);
      const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
      const wordsHtml = words.map((w) => `<span class="word">${escapeHtml(w)} </span>`).join("");
      return `
<section class="section${index % 2 === 1 ? " reversed" : ""}">
  <div class="avatar-wrap">${avatarImage ? `<img src="${avatarImage}" alt="" />` : ""}</div>
  <div class="copy">
    <span class="eyebrow">${String(index + 1).padStart(2, "0")} / ${String(project.chunks.length).padStart(2, "0")}</span>
    <h2>${escapeHtml(chunk.title)}</h2>
    <p class="big-text">${wordsHtml}</p>
    ${src ? `<audio controls src="${src}"></audio>` : ""}
  </div>
</section>`;
    })
    .join("\n");

  const body = `
<header class="header"><h1>${escapeHtml(project.title)}</h1></header>
${sectionsHtml}
`;

  const js = `
gsap.registerPlugin(ScrollTrigger);
var currentAudio = null;
var currentHandler = null;

function stopHighlightTracking() {
  if (currentAudio && currentHandler) currentAudio.removeEventListener('timeupdate', currentHandler);
  currentHandler = null;
}

// Driven by the <audio> element's own "timeupdate" event rather than
// requestAnimationFrame — rAF is tied to the page's paint loop, which
// browsers throttle or pause outright once a tab isn't the actively
// rendered one, silently freezing the highlight mid-playback even though
// the audio itself keeps going. "timeupdate" is a native media event that
// fires from the audio/video decode pipeline, independent of paint
// throttling, so the highlight can't desync from playback.
//
// The TTS server doesn't return real per-word timestamps, so word position
// is estimated from elapsed time — but weighted by each word's character
// count (plus a fixed per-word floor) rather than splitting the audio into
// equal-length slices. Equal slices visibly drift out of sync on real
// narration ("a" and "extraordinarily" do not take the same time to say);
// length-weighting tracks natural speech pacing far more closely.
function trackHighlight(audio, words) {
  var weights = words.map(function(word) { return (word.textContent || '').trim().length + 3; });
  var totalWeight = weights.reduce(function(sum, w) { return sum + w; }, 0);
  var cumulativeWeights = [];
  var running = 0;
  weights.forEach(function(w) { running += w; cumulativeWeights.push(running); });

  function onTimeUpdate() {
    if (!audio.duration) return;
    var targetWeight = (audio.currentTime / audio.duration) * totalWeight;
    var activeIndex = cumulativeWeights.findIndex(function(w) { return w >= targetWeight; });
    if (activeIndex === -1) activeIndex = words.length - 1;
    words.forEach(function(word, i) { word.classList.toggle('spoken', i <= activeIndex); });
  }
  audio.addEventListener('timeupdate', onTimeUpdate);
  currentHandler = onTimeUpdate;
}

function activateSection(section) {
  var audio = section.querySelector('audio');
  var words = Array.from(section.querySelectorAll('.word'));
  if (currentAudio && currentAudio !== audio) currentAudio.pause();
  stopHighlightTracking();
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(function(){});
    currentAudio = audio;
    trackHighlight(audio, words);
  }
}

document.querySelectorAll('.section').forEach(function(section){
  var audio = section.querySelector('audio');
  ScrollTrigger.create({
    trigger: section, start: 'top center', end: 'bottom center',
    onEnter: function(){ activateSection(section); },
    onEnterBack: function(){ activateSection(section); },
    onLeave: function(){ if (audio) audio.pause(); },
    onLeaveBack: function(){ if (audio) audio.pause(); }
  });
  gsap.fromTo(section.querySelector('.copy'), {opacity:0, y:24}, {
    opacity:1, y:0, duration:0.6, ease:'power2.out',
    scrollTrigger:{trigger:section, start:'top 75%'}
  });
});
`;

  return documentWrap(project.title, css, body, js);
}

function renderClarity(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const css = `
body{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:#fafafa;color:#171717;}
.wrap{max-width:680px;margin:0 auto;padding:80px 24px;display:flex;flex-direction:column;gap:56px;}
h1{font-size:1.875rem;font-weight:500;letter-spacing:-0.01em;margin:0;}
.cards{display:flex;flex-direction:column;gap:20px;}
.card{opacity:0;transform:translateY(16px);display:flex;gap:16px;border-radius:16px;border:1px solid #e5e5e5;background:#fff;padding:24px;box-shadow:0 1px 2px rgba(0,0,0,.04);box-sizing:border-box;}
.avatar-badge{width:48px;height:48px;border-radius:9999px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.avatar-badge img{width:40px;height:40px;object-fit:contain;}
.card-body{display:flex;flex-direction:column;gap:8px;flex:1;}
.chunk-label{font-size:.75rem;font-weight:500;color:#a3a3a3;}
.card h2{font-size:1.125rem;font-weight:500;margin:0;}
.card p{font-size:.9rem;line-height:1.7;color:#525252;margin:0;}
audio{margin-top:4px;height:36px;}
`;

  const cardsHtml = project.chunks
    .map((chunk, index) => {
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const src = audioUrl(supabaseUrl, project.id, chunk);
      return `
<article class="card">
  ${avatarImage ? `<div class="avatar-badge"><img src="${avatarImage}" alt="" /></div>` : ""}
  <div class="card-body">
    <span class="chunk-label">Chunk ${chunk.order}</span>
    <h2>${escapeHtml(chunk.title)}</h2>
    <p>${escapeHtml(chunk.narrativeText)}</p>
    ${src ? `<audio controls src="${src}"></audio>` : ""}
  </div>
</article>`;
    })
    .join("\n");

  const body = `
<div class="wrap">
  <h1>${escapeHtml(project.title)}</h1>
  <div class="cards">${cardsHtml}</div>
</div>
`;

  const js = `
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('.card').forEach(function(card){
  gsap.fromTo(card, {opacity:0, y:16}, {
    opacity:1, y:0, duration:0.5, ease:'power2.out',
    scrollTrigger:{trigger:card, start:'top 85%'}
  });
});
`;

  return documentWrap(project.title, css, body, js);
}

function renderCinematic(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const palette = ["#0b0d12", "#151822", "#1a1024", "#101a17", "#1c1410"];
  const css = `
body{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;color:#fff;}
.hero{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 24px;text-align:center;background:${palette[0]};box-sizing:border-box;}
.hero h1{max-width:640px;font-size:2.25rem;font-weight:500;line-height:1.2;margin:0;}
.hero p{margin-top:16px;font-size:.8rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.5);}
.cine-section{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:0 24px;text-align:center;box-sizing:border-box;}
.cine-content{opacity:0;transform:scale(0.94);display:flex;flex-direction:column;align-items:center;gap:24px;}
.cine-content img{width:176px;height:176px;object-fit:contain;filter:drop-shadow(0 0 60px rgba(255,255,255,.15));}
.cine-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.4);}
.cine-content h2{max-width:640px;font-size:1.5rem;font-weight:500;margin:0;}
.cine-content p{max-width:560px;font-size:1.125rem;line-height:1.7;color:rgba(255,255,255,.7);margin:0;}
.play-btn{border-radius:9999px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#fff;padding:10px 20px;font-size:.9rem;font-weight:500;cursor:pointer;}
.play-btn:hover{background:rgba(255,255,255,.1);}
`;

  const sectionsHtml = project.chunks
    .map((chunk, index) => {
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const bg = palette[(index + 1) % palette.length];
      const src = audioUrl(supabaseUrl, project.id, chunk);
      return `
<section class="cine-section" style="background:${bg}">
  <div class="cine-content">
    ${avatarImage ? `<img src="${avatarImage}" alt="" />` : ""}
    <span class="cine-label">Chunk ${chunk.order} of ${project.chunks.length}</span>
    <h2>${escapeHtml(chunk.title)}</h2>
    <p>${escapeHtml(chunk.narrativeText)}</p>
    ${
      src
        ? `<audio id="audio-${chunk.id}" src="${src}"></audio>
    <button class="play-btn" data-audio="audio-${chunk.id}">&#9654; Play narration</button>`
        : ""
    }
  </div>
</section>`;
    })
    .join("\n");

  const body = `
<div class="hero"><h1>${escapeHtml(project.title)}</h1><p>Scroll to begin</p></div>
${sectionsHtml}
`;

  const js = `
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('.cine-section').forEach(function(section){
  var content = section.querySelector('.cine-content');
  gsap.fromTo(content, {opacity:0, scale:0.94}, {
    opacity:1, scale:1, duration:0.7, ease:'power2.out',
    scrollTrigger:{trigger:section, start:'top 60%', end:'bottom 40%', toggleActions:'play reverse play reverse'}
  });
});
document.querySelectorAll('.play-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    var audio = document.getElementById(btn.dataset.audio);
    if (!audio) return;
    if (audio.paused) audio.play(); else audio.pause();
  });
});
`;

  return documentWrap(project.title, css, body, js);
}

/** Fixed full-page canvas + custom cursor dot — shared by every space-themed render (the standalone Space template and the case-study layout when it opts into the Space background). */
const ASMR_CSS = `
:root{color-scheme:dark}
body{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:#0A0A0C;color:#fff;}
#asmr-canvas{position:fixed;inset:0;z-index:-10;display:block;width:100%;height:100%;background:#0A0A0C;}
#asmr-cursor{position:fixed;left:0;top:0;z-index:50;width:16px;height:16px;border-radius:9999px;border:1px solid rgba(255,255,255,.2);pointer-events:none;transition:transform .075s ease-out;}
`;

const ASMR_MARKUP = `<canvas id="asmr-canvas"></canvas>
<div id="asmr-cursor"></div>`;

/** Vanilla-JS port of ASMRBackground's canvas particle field (see components/ui/asmr-background.tsx) — kept in exact sync with that component's physics constants. */
const ASMR_INIT_JS = `
(function(){
  var canvas = document.getElementById('asmr-canvas');
  var cursor = document.getElementById('asmr-cursor');
  var ctx = canvas.getContext('2d');
  var width, height, particles = [], animationFrameId;
  var mouse = { x: -1000, y: -1000 };
  var PARTICLE_COUNT = 1000, MAGNETIC_RADIUS = 280, VORTEX_STRENGTH = 0.07, PULL_STRENGTH = 0.12;

  function Particle() { this.reset(); }
  Particle.prototype.reset = function() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 1.5 + 0.5;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = (Math.random() - 0.5) * 0.2;
    var isGlass = Math.random() > 0.7;
    this.color = isGlass ? '240, 245, 255' : '80, 80, 85';
    this.alpha = Math.random() * 0.4 + 0.1;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    this.frictionGlow = 0;
  };
  Particle.prototype.update = function() {
    var dx = mouse.x - this.x, dy = mouse.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MAGNETIC_RADIUS) {
      var force = (MAGNETIC_RADIUS - dist) / MAGNETIC_RADIUS;
      this.vx += (dx / dist) * force * PULL_STRENGTH;
      this.vy += (dy / dist) * force * PULL_STRENGTH;
      this.vx += (dy / dist) * force * VORTEX_STRENGTH * 10;
      this.vy -= (dx / dist) * force * VORTEX_STRENGTH * 10;
      this.frictionGlow = force * 0.7;
    } else {
      this.frictionGlow *= 0.92;
    }
    this.x += this.vx; this.y += this.vy;
    this.vx *= 0.95; this.vy *= 0.95;
    this.vx += (Math.random() - 0.5) * 0.04;
    this.vy += (Math.random() - 0.5) * 0.04;
    this.rotation += this.rotationSpeed + (Math.abs(this.vx) + Math.abs(this.vy)) * 0.05;
    if (this.x < -20) this.x = width + 20;
    if (this.x > width + 20) this.x = -20;
    if (this.y < -20) this.y = height + 20;
    if (this.y > height + 20) this.y = -20;
  };
  Particle.prototype.draw = function() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    var finalAlpha = Math.min(this.alpha + this.frictionGlow, 0.9);
    ctx.fillStyle = 'rgba(' + this.color + ', ' + finalAlpha + ')';
    if (this.frictionGlow > 0.3) {
      ctx.shadowBlur = 8 * this.frictionGlow;
      ctx.shadowColor = 'rgba(180, 220, 255, ' + this.frictionGlow + ')';
    }
    ctx.beginPath();
    ctx.moveTo(0, -this.size * 2.5);
    ctx.lineTo(this.size, 0);
    ctx.lineTo(0, this.size * 2.5);
    ctx.lineTo(-this.size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function render() {
    ctx.fillStyle = 'rgba(10, 10, 12, 0.18)';
    ctx.fillRect(0, 0, width, height);
    particles.forEach(function(p) { p.update(); p.draw(); });
    animationFrameId = requestAnimationFrame(render);
  }

  window.addEventListener('resize', init);
  window.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
    cursor.style.transform = 'translate(calc(' + e.clientX + 'px - 50%), calc(' + e.clientY + 'px - 50%))';
  });
  window.addEventListener('touchmove', function(e) {
    if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
  });

  init();
  render();
})();
`;

/** Fixed full-page 3D canvas — shared by every lunar-themed render (the standalone Lunar template and the case-study layout when it opts into the Lunar background). */
const LUNAR_CSS = `
:root{color-scheme:dark}
body{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:#000;color:#fff;}
#lunar-canvas{position:fixed;inset:0;z-index:-10;display:block;width:100%;height:100%;}
`;

const LUNAR_MARKUP = `<canvas id="lunar-canvas"></canvas>`;

const LUNAR_MOON_TEXTURE_URL =
  "https://cdn.21st.dev/assets/mirror/fc/fcb0f1f5548e6e18d40063dd55c6aacd3daedf2407b181dab85b61e22bf9fe57.jpg";

/**
 * Vanilla-three.js port of LunarBackground (see components/ui/lunar-background.tsx
 * and lunar-gravity-card.tsx) — a textured moon, a 60k-particle ring with the
 * same custom vertex/fragment shader patch, and a 75-piece orbiting asteroid
 * belt that pushes the ring's particles aside as it passes through them.
 * react-three-fiber and drei are React bindings with no equivalent in a
 * hand-rolled static HTML page, so this rebuilds the same scene directly on
 * three.js (loaded from THREE_CDN) — kept in exact sync with the React
 * version's constants/algorithms. One intentional simplification: drei's
 * `<Environment preset="city">` (an auto-fetched HDRI reflection map) is
 * skipped here in favor of plain directional/ambient lights, to avoid a
 * second fragile external asset dependency in the published output; the
 * moon and asteroids still read as correctly lit, just without the subtle
 * environment reflections the in-app preview has.
 */
const LUNAR_INIT_JS = `
(function(){
  var canvas = document.getElementById('lunar-canvas');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 4, 10);
  camera.lookAt(0, 0, 0);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  resize();
  window.addEventListener('resize', resize);

  scene.add(new THREE.AmbientLight(0xffffff, 0.02));
  var keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(8, 5, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  scene.add(keyLight);
  var rimLight = new THREE.DirectionalLight(0x4a90e2, 0.15);
  rimLight.position.set(-5, -3, -5);
  scene.add(rimLight);

  var group = new THREE.Group();
  group.rotation.x = Math.PI / 8;
  scene.add(group);

  var textureLoader = new THREE.TextureLoader();
  var moonTexture = textureLoader.load('${LUNAR_MOON_TEXTURE_URL}');

  var RADIUS = 2.0;
  var moon = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS, 64, 64),
    new THREE.MeshStandardMaterial({ map: moonTexture, bumpMap: moonTexture, bumpScale: 0.02, roughness: 0.8, metalness: 0.1 })
  );
  moon.castShadow = true;
  moon.receiveShadow = true;
  group.add(moon);

  var PARTICLE_COUNT = 60000;
  var ringPositions = new Float32Array(PARTICLE_COUNT * 3);
  var ringColors = new Float32Array(PARTICLE_COUNT * 3);
  var ringRandoms = new Float32Array(PARTICLE_COUNT);
  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var angle = Math.random() * Math.PI * 2;
    var rDist = Math.pow(Math.random(), 1.5);
    var radius = 2.2 + rDist * 2.2;
    var thickness = 0.4 - (rDist * 0.2);
    var ySpread = (Math.random() + Math.random() + Math.random() - 1.5);
    var y = ySpread * thickness;
    ringPositions[i * 3] = Math.cos(angle) * radius;
    ringPositions[i * 3 + 1] = y;
    ringPositions[i * 3 + 2] = Math.sin(angle) * radius;
    var intensity = 1.0 - rDist;
    var paletteType = Math.random();
    var baseR, baseG, baseB;
    if (paletteType < 0.80) { baseR = 0.25; baseG = 0.30; baseB = 0.35; }
    else if (paletteType < 0.92) { baseR = 0.0; baseG = 0.6; baseB = 0.8; }
    else { baseR = 0.6; baseG = 0.2; baseB = 0.8; }
    baseR = Math.min(1.0, Math.max(0.0, baseR + (Math.random() - 0.5) * 0.1));
    baseG = Math.min(1.0, Math.max(0.0, baseG + (Math.random() - 0.5) * 0.1));
    baseB = Math.min(1.0, Math.max(0.0, baseB + (Math.random() - 0.5) * 0.1));
    var sparkle = Math.random() > 0.95 ? 2.5 : 1.0;
    ringColors[i * 3] = baseR * intensity * sparkle;
    ringColors[i * 3 + 1] = baseG * intensity * sparkle;
    ringColors[i * 3 + 2] = baseB * intensity * sparkle;
    ringRandoms[i] = Math.random();
  }

  var ringGeometry = new THREE.BufferGeometry();
  ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
  ringGeometry.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));
  ringGeometry.setAttribute('aRandom', new THREE.BufferAttribute(ringRandoms, 1));

  var ringUniforms = { uAsteroids: { value: new Float32Array(75 * 4) }, time: { value: 0 } };
  var ringMaterial = new THREE.PointsMaterial({
    size: 0.008, vertexColors: true, transparent: true, opacity: 0.8,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  ringMaterial.onBeforeCompile = function(shader) {
    shader.uniforms.uAsteroids = ringUniforms.uAsteroids;
    shader.uniforms.time = ringUniforms.time;
    shader.vertexShader = 'uniform vec4 uAsteroids[75];\\nuniform float time;\\nattribute float aRandom;\\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', \`
      vec3 transformed = vec3(position);
      transformed.y += sin(atan(transformed.x, transformed.z) * 10.0 + time) * 0.05 * aRandom;
      for(int i = 0; i < 75; i++) {
        vec4 astData = uAsteroids[i];
        vec3 delta = transformed - astData.xyz;
        float dist = length(delta);
        float rad = astData.w * 2.0 + 0.15;
        if (dist < rad) {
          float force = pow((rad - dist) / rad, 2.0);
          transformed += normalize(delta) * force * 0.4;
          transformed.y += force * 0.20 * (aRandom - 0.5);
        }
      }
    \`);
  };
  var ring = new THREE.Points(ringGeometry, ringMaterial);
  ring.rotation.set(-Math.PI / 2, 0, 0);
  group.add(ring);

  function generateAsteroids(count) {
    var data = [];
    for (var i = 0; i < count; i++) {
      var baseRadius = 2.8 + Math.random() * 2.0;
      var radialAmplitude = 0.5 + Math.random() * 1.5;
      var radialSpeed = 0.15 + Math.random() * 0.25;
      var phase = Math.random() * Math.PI * 2;
      var angle = Math.random() * Math.PI * 2;
      var zOffset = (Math.random() - 0.5) * 0.8;
      var speed = (0.04 + Math.random() * 0.08) * (Math.random() > 0.5 ? 1 : -1);
      var scale = 0.02 + Math.pow(Math.random(), 4) * 0.18;
      data.push({
        angle: angle, baseRadius: baseRadius, radialAmplitude: radialAmplitude, radialSpeed: radialSpeed,
        phase: phase, zOffset: zOffset, speed: speed,
        rx: Math.random() * Math.PI, ry: Math.random() * Math.PI, rz: Math.random() * Math.PI,
        rsx: (Math.random() - 0.5) * 0.05, rsy: (Math.random() - 0.5) * 0.05, rsz: (Math.random() - 0.5) * 0.05,
        scale: scale
      });
    }
    data.sort(function(a, b) { return b.scale - a.scale; });
    return data;
  }

  var ASTEROID_COUNT = 75;
  var asteroidTexture = textureLoader.load('${LUNAR_MOON_TEXTURE_URL}');
  var asteroids = generateAsteroids(ASTEROID_COUNT);
  var asteroidMesh = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ map: asteroidTexture, bumpMap: asteroidTexture, bumpScale: 0.08, color: 0xffffff, roughness: 0.7, metalness: 0.1 }),
    ASTEROID_COUNT
  );
  asteroidMesh.castShadow = true;
  asteroidMesh.receiveShadow = true;
  group.add(asteroidMesh);

  var massiveAsteroids = new Float32Array(ASTEROID_COUNT * 4);
  var dummy = new THREE.Object3D();
  var asteroidScale = 0;

  var clock = { last: performance.now() / 1000 };
  function tick() {
    var now = performance.now() / 1000;
    var delta = Math.min(0.1, now - clock.last);
    clock.last = now;

    group.rotation.y += delta * 0.05;
    moon.rotation.y += delta * 0.05;
    ring.rotation.y -= delta * 0.02;

    ring.updateMatrix();
    var invMat = new THREE.Matrix4().copy(ring.matrix).invert();
    var localAsteroids = new Float32Array(ASTEROID_COUNT * 4);
    var v = new THREE.Vector3();
    for (var i = 0; i < ASTEROID_COUNT; i++) {
      v.set(massiveAsteroids[i * 4], massiveAsteroids[i * 4 + 1], massiveAsteroids[i * 4 + 2]);
      v.applyMatrix4(invMat);
      localAsteroids[i * 4] = v.x;
      localAsteroids[i * 4 + 1] = v.y;
      localAsteroids[i * 4 + 2] = v.z;
      localAsteroids[i * 4 + 3] = massiveAsteroids[i * 4 + 3];
    }
    ringUniforms.uAsteroids.value = localAsteroids;
    ringUniforms.time.value = now;

    asteroidScale += (1 - asteroidScale) * Math.min(1, delta * 2);
    asteroids.forEach(function(ast, i) {
      ast.angle += ast.speed * delta;
      ast.phase += ast.radialSpeed * delta;
      var currentRadius = ast.baseRadius + Math.sin(ast.phase) * ast.radialAmplitude;
      if (currentRadius < 2.15) currentRadius = 2.15 + (2.15 - currentRadius) * 0.85;
      var x = Math.cos(ast.angle) * currentRadius;
      var y = Math.sin(ast.angle) * currentRadius;
      massiveAsteroids[i * 4] = x;
      massiveAsteroids[i * 4 + 1] = y;
      massiveAsteroids[i * 4 + 2] = ast.zOffset;
      massiveAsteroids[i * 4 + 3] = ast.scale;
      ast.rx += ast.rsx; ast.ry += ast.rsy; ast.rz += ast.rsz;
      dummy.position.set(x, y, ast.zOffset);
      dummy.rotation.set(ast.rx, ast.ry, ast.rz);
      dummy.scale.setScalar(ast.scale * asteroidScale);
      dummy.updateMatrix();
      asteroidMesh.setMatrixAt(i, dummy.matrix);
    });
    asteroidMesh.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
})();
`;

function renderSpace(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const css =
    ASMR_CSS +
    `
.header{position:relative;padding:96px 32px 64px;}
.header .kicker{font-size:.75rem;font-weight:300;text-transform:uppercase;letter-spacing:.4em;color:rgba(255,255,255,.3);}
.header h1{margin:16px 0 0;max-width:760px;font-size:2.5rem;font-weight:500;line-height:1.2;}
@media(min-width:768px){.header h1{font-size:3rem;}}
.section{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;gap:40px;border-top:1px solid rgba(255,255,255,.05);padding:80px 32px;box-sizing:border-box;}
@media(min-width:768px){.section{flex-direction:row;gap:64px;padding:80px 64px;}}
.section.reversed{flex-direction:column;}
@media(min-width:768px){.section.reversed{flex-direction:row-reverse;}}
.avatar-wrap{width:100%;flex-shrink:0;display:flex;justify-content:center;}
@media(min-width:768px){.avatar-wrap{width:36%;}}
.avatar-wrap img{width:280px;height:280px;object-fit:contain;filter:drop-shadow(0 0 60px rgba(180,220,255,.15));}
@media(min-width:768px){.avatar-wrap img{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;border-radius:16px;border:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.02);backdrop-filter:blur(4px);padding:32px;box-sizing:border-box;}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:rgba(255,255,255,.3);}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(1.75rem, 4.6vw, 5rem);margin:0;}
.word{color:rgba(255,255,255,.25);transition:color .15s;}
.word.spoken{color:#fff;}
audio{margin-top:8px;height:36px;max-width:360px;}
`;

  const sectionsHtml = project.chunks
    .map((chunk, index) => {
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const src = audioUrl(supabaseUrl, project.id, chunk);
      const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
      const wordsHtml = words.map((w) => `<span class="word">${escapeHtml(w)} </span>`).join("");
      return `
<section class="section${index % 2 === 1 ? " reversed" : ""}">
  <div class="avatar-wrap">${avatarImage ? `<img src="${avatarImage}" alt="" />` : ""}</div>
  <div class="copy">
    <span class="eyebrow">${String(index + 1).padStart(2, "0")} / ${String(project.chunks.length).padStart(2, "0")}</span>
    <h2>${escapeHtml(chunk.title)}</h2>
    <p class="big-text">${wordsHtml}</p>
    ${src ? `<audio controls src="${src}"></audio>` : ""}
  </div>
</section>`;
    })
    .join("\n");

  const body = `
${ASMR_MARKUP}
<header class="header"><span class="kicker">Space</span><h1>${escapeHtml(project.title)}</h1></header>
${sectionsHtml}
`;

  // Word-highlight scroll wiring (same mechanism as renderEditorial/renderCaseStudy)
  // plus the shared ASMR_INIT_JS canvas particle field — the fixed #asmr-canvas
  // sits behind every section, not just a single hero screen.
  const js = `
gsap.registerPlugin(ScrollTrigger);
var currentAudio = null;
var currentHandler = null;

function stopHighlightTracking() {
  if (currentAudio && currentHandler) currentAudio.removeEventListener('timeupdate', currentHandler);
  currentHandler = null;
}

// Driven by the <audio> element's own "timeupdate" event rather than
// requestAnimationFrame — rAF is tied to the page's paint loop, which
// browsers throttle or pause outright once a tab isn't the actively
// rendered one, silently freezing the highlight mid-playback even though
// the audio itself keeps going. "timeupdate" is a native media event that
// fires from the audio/video decode pipeline, independent of paint
// throttling, so the highlight can't desync from playback.
//
// The TTS server doesn't return real per-word timestamps, so word position
// is estimated from elapsed time — but weighted by each word's character
// count (plus a fixed per-word floor) rather than splitting the audio into
// equal-length slices. Equal slices visibly drift out of sync on real
// narration ("a" and "extraordinarily" do not take the same time to say);
// length-weighting tracks natural speech pacing far more closely.
function trackHighlight(audio, words) {
  var weights = words.map(function(word) { return (word.textContent || '').trim().length + 3; });
  var totalWeight = weights.reduce(function(sum, w) { return sum + w; }, 0);
  var cumulativeWeights = [];
  var running = 0;
  weights.forEach(function(w) { running += w; cumulativeWeights.push(running); });

  function onTimeUpdate() {
    if (!audio.duration) return;
    var targetWeight = (audio.currentTime / audio.duration) * totalWeight;
    var activeIndex = cumulativeWeights.findIndex(function(w) { return w >= targetWeight; });
    if (activeIndex === -1) activeIndex = words.length - 1;
    words.forEach(function(word, i) { word.classList.toggle('spoken', i <= activeIndex); });
  }
  audio.addEventListener('timeupdate', onTimeUpdate);
  currentHandler = onTimeUpdate;
}

function activateSection(section) {
  var audio = section.querySelector('audio');
  var words = Array.from(section.querySelectorAll('.word'));
  if (currentAudio && currentAudio !== audio) currentAudio.pause();
  stopHighlightTracking();
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(function(){});
    currentAudio = audio;
    trackHighlight(audio, words);
  }
}

document.querySelectorAll('.section').forEach(function(section){
  var audio = section.querySelector('audio');
  ScrollTrigger.create({
    trigger: section, start: 'top center', end: 'bottom center',
    onEnter: function(){ activateSection(section); },
    onEnterBack: function(){ activateSection(section); },
    onLeave: function(){ if (audio) audio.pause(); },
    onLeaveBack: function(){ if (audio) audio.pause(); }
  });
  gsap.fromTo(section.querySelector('.copy'), {opacity:0, y:24}, {
    opacity:1, y:0, duration:0.6, ease:'power2.out',
    scrollTrigger:{trigger:section, start:'top 75%'}
  });
});
` + ASMR_INIT_JS;

  return documentWrap(project.title, css, body, js);
}

function renderLunar(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const css =
    LUNAR_CSS +
    `
.header{position:relative;padding:96px 32px 64px;}
.header .kicker{font-size:.75rem;font-weight:300;text-transform:uppercase;letter-spacing:.4em;color:rgba(103,232,249,.4);}
.header h1{margin:16px 0 0;max-width:760px;font-size:2.5rem;font-weight:500;line-height:1.2;}
@media(min-width:768px){.header h1{font-size:3rem;}}
.section{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;gap:40px;border-top:1px solid rgba(34,211,238,.1);padding:80px 32px;box-sizing:border-box;}
@media(min-width:768px){.section{flex-direction:row;gap:64px;padding:80px 64px;}}
.section.reversed{flex-direction:column;}
@media(min-width:768px){.section.reversed{flex-direction:row-reverse;}}
.avatar-wrap{width:100%;flex-shrink:0;display:flex;justify-content:center;}
@media(min-width:768px){.avatar-wrap{width:36%;}}
.avatar-wrap img{width:280px;height:280px;object-fit:contain;filter:drop-shadow(0 0 60px rgba(120,180,255,.2));}
@media(min-width:768px){.avatar-wrap img{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;border-radius:16px;border:1px solid rgba(34,211,238,.1);background:rgba(255,255,255,.03);backdrop-filter:blur(4px);padding:32px;box-sizing:border-box;}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:rgba(165,243,252,.5);}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(1.75rem, 4.6vw, 5rem);margin:0;}
.word{color:rgba(255,255,255,.25);transition:color .15s;}
.word.spoken{color:#fff;}
audio{margin-top:8px;height:36px;max-width:360px;}
`;

  const sectionsHtml = project.chunks
    .map((chunk, index) => {
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const src = audioUrl(supabaseUrl, project.id, chunk);
      const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
      const wordsHtml = words.map((w) => `<span class="word">${escapeHtml(w)} </span>`).join("");
      return `
<section class="section${index % 2 === 1 ? " reversed" : ""}">
  <div class="avatar-wrap">${avatarImage ? `<img src="${avatarImage}" alt="" />` : ""}</div>
  <div class="copy">
    <span class="eyebrow">${String(index + 1).padStart(2, "0")} / ${String(project.chunks.length).padStart(2, "0")}</span>
    <h2>${escapeHtml(chunk.title)}</h2>
    <p class="big-text">${wordsHtml}</p>
    ${src ? `<audio controls src="${src}"></audio>` : ""}
  </div>
</section>`;
    })
    .join("\n");

  const body = `
${LUNAR_MARKUP}
<header class="header"><span class="kicker">Lunar</span><h1>${escapeHtml(project.title)}</h1></header>
${sectionsHtml}
`;

  // Word-highlight scroll wiring (same mechanism as renderSpace/renderCaseStudy)
  // plus the shared LUNAR_INIT_JS three.js scene — the fixed #lunar-canvas
  // sits behind every section, not just a single hero screen.
  const js = `
gsap.registerPlugin(ScrollTrigger);
var currentAudio = null;
var currentHandler = null;

function stopHighlightTracking() {
  if (currentAudio && currentHandler) currentAudio.removeEventListener('timeupdate', currentHandler);
  currentHandler = null;
}

function trackHighlight(audio, words) {
  var weights = words.map(function(word) { return (word.textContent || '').trim().length + 3; });
  var totalWeight = weights.reduce(function(sum, w) { return sum + w; }, 0);
  var cumulativeWeights = [];
  var running = 0;
  weights.forEach(function(w) { running += w; cumulativeWeights.push(running); });

  function onTimeUpdate() {
    if (!audio.duration) return;
    var targetWeight = (audio.currentTime / audio.duration) * totalWeight;
    var activeIndex = cumulativeWeights.findIndex(function(w) { return w >= targetWeight; });
    if (activeIndex === -1) activeIndex = words.length - 1;
    words.forEach(function(word, i) { word.classList.toggle('spoken', i <= activeIndex); });
  }
  audio.addEventListener('timeupdate', onTimeUpdate);
  currentHandler = onTimeUpdate;
}

function activateSection(section) {
  var audio = section.querySelector('audio');
  var words = Array.from(section.querySelectorAll('.word'));
  if (currentAudio && currentAudio !== audio) currentAudio.pause();
  stopHighlightTracking();
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(function(){});
    currentAudio = audio;
    trackHighlight(audio, words);
  }
}

document.querySelectorAll('.section').forEach(function(section){
  var audio = section.querySelector('audio');
  ScrollTrigger.create({
    trigger: section, start: 'top center', end: 'bottom center',
    onEnter: function(){ activateSection(section); },
    onEnterBack: function(){ activateSection(section); },
    onLeave: function(){ if (audio) audio.pause(); },
    onLeaveBack: function(){ if (audio) audio.pause(); }
  });
  gsap.fromTo(section.querySelector('.copy'), {opacity:0, y:24}, {
    opacity:1, y:0, duration:0.6, ease:'power2.out',
    scrollTrigger:{trigger:section, start:'top 75%'}
  });
});
` + LUNAR_INIT_JS;

  return documentWrap(project.title, css, body, js, [THREE_CDN]);
}

type CaseStudyRenderTheme = "light" | "space" | "lunar";

function renderCaseStudy(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const sections = flattenCaseStudySections(project.caseStudyBinding?.slots ?? null);
  const sectionAudio = project.caseStudyBinding?.sectionAudio;
  // Case-study projects always render this layout regardless of
  // selectedTemplateId (see renderStaticSite) — picking "space"/"lunar" there
  // is still how they opt into those templates' backgrounds rather than
  // losing access to them entirely.
  const theme: CaseStudyRenderTheme =
    project.selectedTemplateId === "space" || project.selectedTemplateId === "lunar" ? project.selectedTemplateId : "light";
  const isDark = theme !== "light";
  const kicker = theme === "space" ? "Space" : theme === "lunar" ? "Lunar" : "Case study";
  const kickerColor = theme === "lunar" ? "rgba(103,232,249,.4)" : isDark ? "rgba(255,255,255,.3)" : "#a3a3a3";
  const eyebrowColor = theme === "lunar" ? "rgba(165,243,252,.5)" : isDark ? "rgba(255,255,255,.3)" : "#a3a3a3";
  const borderColor = theme === "lunar" ? "rgba(34,211,238,.1)" : isDark ? "rgba(255,255,255,.05)" : "#f0f0f0";
  const avatarGlow = theme === "lunar" ? "rgba(120,180,255,.2)" : "rgba(180,220,255,.15)";
  const copyBg = theme === "lunar" ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.02)";

  // Same big-text, word-highlight-as-spoken treatment as renderEditorial —
  // this template is the case-study data source with Editorial's visuals,
  // with a dark backdrop (particle field or 3D moon scene) when isDark.
  const css =
    (isDark
      ? theme === "lunar"
        ? LUNAR_CSS
        : ASMR_CSS
      : `:root{color-scheme:light}\nbody{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:#fff;color:#171717;}`) +
    `
.header{${isDark ? "position:relative;" : ""}padding:96px 32px 64px;}
.header .kicker{font-size:.75rem;text-transform:uppercase;letter-spacing:${isDark ? ".4em" : ".05em"};font-weight:${isDark ? "300" : "400"};color:${kickerColor};}
.header h1{margin:12px 0 0;max-width:760px;font-size:2.5rem;font-weight:500;line-height:1.2;}
@media(min-width:768px){.header h1{font-size:3rem;}}
.section{${isDark ? "position:relative;" : ""}min-height:100vh;display:flex;flex-direction:column;align-items:center;gap:40px;border-top:1px solid ${borderColor};padding:80px 32px;box-sizing:border-box;}
@media(min-width:768px){.section{flex-direction:row;gap:64px;padding:80px 64px;}}
.section.reversed{flex-direction:column;}
@media(min-width:768px){.section.reversed{flex-direction:row-reverse;}}
.avatar-wrap{width:100%;flex-shrink:0;display:flex;justify-content:center;}
@media(min-width:768px){.avatar-wrap{width:36%;}}
.avatar-wrap img{width:280px;height:280px;object-fit:contain;${isDark ? `filter:drop-shadow(0 0 60px ${avatarGlow});` : ""}}
@media(min-width:768px){.avatar-wrap img{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;${
      isDark
        ? `border-radius:16px;border:1px solid ${borderColor};background:${copyBg};backdrop-filter:blur(4px);padding:32px;box-sizing:border-box;`
        : ""
    }}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:${eyebrowColor};}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(1.75rem, 4.6vw, 5rem);margin:0;}
.word{color:${isDark ? "rgba(255,255,255,.25)" : "#d4d4d4"};transition:color .15s;}
.word.spoken{color:${isDark ? "#fff" : "#171717"};}
audio{margin-top:8px;height:36px;max-width:360px;}
`;

  const sectionsHtml = sections
    .map((section, index) => {
      const avatar = avatarForIndex(index, avatars);
      const avatarImage = avatar ? bundlePath(getAvatarImage(avatar, section.emotion)) : null;
      const src = sectionAudioUrl(supabaseUrl, project.id, section, sectionAudio);
      const words = section.body.split(/\s+/).filter(Boolean);
      const wordsHtml = words.map((w) => `<span class="word">${escapeHtml(w)} </span>`).join("");
      return `
<section class="section${index % 2 === 1 ? " reversed" : ""}">
  <div class="avatar-wrap">${avatarImage ? `<img src="${avatarImage}" alt="" />` : ""}</div>
  <div class="copy">
    <span class="eyebrow">${escapeHtml(section.sectionLabel)}</span>
    <h2>${escapeHtml(section.title)}</h2>
    <p class="big-text">${wordsHtml}</p>
    ${src ? `<audio controls src="${src}"></audio>` : ""}
  </div>
</section>`;
    })
    .join("\n");

  const backdropMarkup = theme === "space" ? ASMR_MARKUP : theme === "lunar" ? LUNAR_MARKUP : "";

  const body = `
${backdropMarkup}
<header class="header"><span class="kicker">${kicker}</span><h1>${escapeHtml(project.title)}</h1></header>
${sectionsHtml}
`;

  const js = `
gsap.registerPlugin(ScrollTrigger);
var currentAudio = null;
var currentHandler = null;

function stopHighlightTracking() {
  if (currentAudio && currentHandler) currentAudio.removeEventListener('timeupdate', currentHandler);
  currentHandler = null;
}

// Driven by the <audio> element's own "timeupdate" event rather than
// requestAnimationFrame — rAF is tied to the page's paint loop, which
// browsers throttle or pause outright once a tab isn't the actively
// rendered one, silently freezing the highlight mid-playback even though
// the audio itself keeps going. "timeupdate" is a native media event that
// fires from the audio/video decode pipeline, independent of paint
// throttling, so the highlight can't desync from playback.
//
// The TTS server doesn't return real per-word timestamps, so word position
// is estimated from elapsed time — but weighted by each word's character
// count (plus a fixed per-word floor) rather than splitting the audio into
// equal-length slices. Equal slices visibly drift out of sync on real
// narration ("a" and "extraordinarily" do not take the same time to say);
// length-weighting tracks natural speech pacing far more closely.
function trackHighlight(audio, words) {
  var weights = words.map(function(word) { return (word.textContent || '').trim().length + 3; });
  var totalWeight = weights.reduce(function(sum, w) { return sum + w; }, 0);
  var cumulativeWeights = [];
  var running = 0;
  weights.forEach(function(w) { running += w; cumulativeWeights.push(running); });

  function onTimeUpdate() {
    if (!audio.duration) return;
    var targetWeight = (audio.currentTime / audio.duration) * totalWeight;
    var activeIndex = cumulativeWeights.findIndex(function(w) { return w >= targetWeight; });
    if (activeIndex === -1) activeIndex = words.length - 1;
    words.forEach(function(word, i) { word.classList.toggle('spoken', i <= activeIndex); });
  }
  audio.addEventListener('timeupdate', onTimeUpdate);
  currentHandler = onTimeUpdate;
}

function activateSection(section) {
  var audio = section.querySelector('audio');
  var words = Array.from(section.querySelectorAll('.word'));
  if (currentAudio && currentAudio !== audio) currentAudio.pause();
  stopHighlightTracking();
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(function(){});
    currentAudio = audio;
    trackHighlight(audio, words);
  }
}

document.querySelectorAll('.section').forEach(function(section){
  var audio = section.querySelector('audio');
  ScrollTrigger.create({
    trigger: section, start: 'top center', end: 'bottom center',
    onEnter: function(){ activateSection(section); },
    onEnterBack: function(){ activateSection(section); },
    onLeave: function(){ if (audio) audio.pause(); },
    onLeaveBack: function(){ if (audio) audio.pause(); }
  });
  gsap.fromTo(section.querySelector('.copy'), {opacity:0, y:24}, {
    opacity:1, y:0, duration:0.6, ease:'power2.out',
    scrollTrigger:{trigger:section, start:'top 75%'}
  });
});
` + (theme === "space" ? ASMR_INIT_JS : theme === "lunar" ? LUNAR_INIT_JS : "");

  return documentWrap(project.title, css, body, js, theme === "lunar" ? [THREE_CDN] : []);
}

export function renderStaticSite(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  // Case-study projects always publish their bound layout — Company/Domain/
  // Customer/Problem/Solution/Impact — never the generic chunk-based
  // templates below, regardless of selectedTemplateId.
  if (project.documentType === "case-study" && project.caseStudyBinding?.slots) {
    return renderCaseStudy(project, avatars, supabaseUrl);
  }

  switch (project.selectedTemplateId) {
    case "clarity":
      return renderClarity(project, avatars, supabaseUrl);
    case "cinematic":
      return renderCinematic(project, avatars, supabaseUrl);
    case "space":
      return renderSpace(project, avatars, supabaseUrl);
    case "lunar":
      return renderLunar(project, avatars, supabaseUrl);
    case "editorial":
    default:
      return renderEditorial(project, avatars, supabaseUrl);
  }
}
