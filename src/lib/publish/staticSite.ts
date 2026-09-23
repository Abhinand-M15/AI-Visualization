import type { Chunk, Project } from "@/lib/types";
import { getAvatarImage, type Avatar } from "@/lib/avatars";
import { flattenCaseStudySections, type CaseStudySection } from "@/lib/caseStudySections";

const GSAP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
const SCROLLTRIGGER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
// Classic non-module build matching r128 above — attaches THREE.OrbitControls
// as a global once loaded after THREE_CDN. Later three.js versions dropped
// this non-module form in favor of ES modules, which a hand-rolled <script
// src> page like this one can't consume, so the version is pinned deliberately.
const ORBIT_CONTROLS_CDN = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js";
// Matching non-module GLTFLoader build for the avatar 3D model (see below) —
// pinned to the same r128 release as THREE_CDN/ORBIT_CONTROLS_CDN.
const GLTF_LOADER_CDN = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
const AVATAR_MODEL_CDN_SCRIPTS = [THREE_CDN, ORBIT_CONTROLS_CDN, GLTF_LOADER_CDN];

function needsAvatarModel(avatars: Avatar[]): boolean {
  return avatars.some((avatar) => Boolean(avatar.modelUrl));
}

/** Some templates (Lunar) already need THREE_CDN/ORBIT_CONTROLS_CDN for their
 *  own background scene — avoid loading the same CDN script twice. */
function dedupeScripts(urls: string[]): string[] {
  return Array.from(new Set(urls));
}

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

/** Renders the avatar slot markup: a plain `<img>` fallback always present,
 *  plus a `data-model` attribute the shared AVATAR3D_INIT_JS script picks up
 *  to swap in a live, rotatable 3D canvas when the avatar has a `modelUrl`
 *  and the visitor's browser can actually run WebGL. */
function avatarBoxHtml(avatarImage: string | null, avatar: Avatar | undefined): string {
  if (!avatarImage) return "";
  const modelAttr = avatar?.modelUrl ? ` data-model="${bundlePath(avatar.modelUrl)}"` : "";
  return `<div class="avatar-box"${modelAttr}><img src="${avatarImage}" alt="" /></div>`;
}

/** Video-mode avatar slot — a template-level choice (only Lunar asks for
 *  this), not a fallback: no `<img>` alongside it, matching the live
 *  preview's rule of never showing the static photo when a 3D model or
 *  video is available. Muted/looping/no-autoplay — the enclosing
 *  template's own scroll-activation JS calls play()/pause() on it exactly
 *  like it already does for narration audio (see activateSection). */
function avatarVideoBoxHtml(videoUrl: string | undefined): string {
  if (!videoUrl) return "";
  return `<div class="avatar-box"><video src="${bundlePath(videoUrl)}" muted loop playsinline preload="metadata"></video></div>`;
}

function avatarVideoPath(index: number, avatar: Avatar | undefined): string | undefined {
  if (!avatar?.videoUrls || avatar.videoUrls.length === 0) return undefined;
  return avatar.videoUrls[index % avatar.videoUrls.length];
}

/** Wav2Lip-rendered per-section video, baked in at publish time as the real
 *  Supabase public URL (same treatment as sectionAudioUrl above), falling
 *  back to the avatar's default looping clip when that section hasn't been
 *  generated yet — never to the static photo, same fallback semantics as
 *  the live preview (see CaseStudyTemplate.tsx). */
function sectionVideoPath(
  supabaseUrl: string,
  projectId: string,
  section: CaseStudySection,
  index: number,
  avatar: Avatar | undefined,
  sectionVideo: Record<string, string> | undefined
): string | undefined {
  if (sectionVideo?.[section.key]) {
    return `${supabaseUrl}/storage/v1/object/public/chunk-video/${projectId}/case-study-${section.key}.mp4`;
  }
  return avatarVideoPath(index, avatar);
}

/** Shared sizing/positioning rules for the avatar slot — each template still
 *  sets `.avatar-box`'s (or `.avatar-badge .avatar-box`'s) width/height/filter
 *  itself, matching whatever the old `.avatar-wrap img` rule used to size. */
const AVATAR_BOX_CSS = `
.avatar-box{position:relative;}
.avatar-box img,.avatar-box canvas,.avatar-box video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;}
.avatar-box canvas{display:none;touch-action:pan-y;cursor:grab;}
.avatar-box.dragging canvas{cursor:grabbing;}
`;

/**
 * Vanilla-three.js port of components/ui/avatar-3d.tsx for the published
 * static site — no react-three-fiber/drei here, so this hand-rolls the same
 * behavior: lazy-mount only near the viewport, at most one live WebGL
 * context at a time (guards the same GPU-constrained/sandboxed-browser
 * failure the React version was hardened against), a disabled-GPU probe
 * that leaves the fallback `<img>` in place instead of ever mounting a
 * canvas that would just stay blank, damped drag-to-rotate, and a gentle
 * hover scale bump. The GLTF is fetched once and cloned per instance,
 * exactly like the React `Model` component does.
 */
const AVATAR3D_INIT_JS = `
(function(){
  function hasWebGLSupport() {
    try {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return false;
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        var vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
        var renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
        if (typeof vendor === 'string' && /disabled/i.test(vendor)) return false;
        if (typeof renderer === 'string' && /disabled/i.test(renderer)) return false;
      }
      return true;
    } catch (e) { return false; }
  }

  if (typeof THREE === 'undefined' || !THREE.GLTFLoader || !hasWebGLSupport()) return;

  var boxes = Array.prototype.slice.call(document.querySelectorAll('.avatar-box[data-model]'));
  if (boxes.length === 0) return;

  var gltfCache = {};
  var loader = new THREE.GLTFLoader();
  function loadModel(url) {
    if (!gltfCache[url]) {
      gltfCache[url] = new Promise(function(resolve, reject) {
        loader.load(url, function(gltf) { resolve(gltf.scene); }, undefined, reject);
      });
    }
    return gltfCache[url];
  }

  var activeSlot = null;

  function setupBox(box) {
    var url = box.getAttribute('data-model');
    var img = box.querySelector('img');
    var canvas = null, renderer = null, scene = null, camera = null, controls = null, modelGroup = null;
    var hovered = false, rafId = 0, resizeObs = null, mounted = false, cancelled = false;

    function frameCamera(object) {
      var box3 = new THREE.Box3().setFromObject(object);
      var size = new THREE.Vector3();
      box3.getSize(size);
      var center = new THREE.Vector3();
      box3.getCenter(center);
      object.position.sub(center);
      var diag = size.length() || 1;
      var margin = 1.05;
      var fitDistance = (diag * margin) / (2 * Math.tan((camera.fov * Math.PI) / 360));
      camera.position.set(0, 0, fitDistance);
      camera.near = fitDistance / 100;
      camera.far = fitDistance * 100;
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.update();
    }

    function resize() {
      if (!renderer) return;
      var rect = box.getBoundingClientRect();
      var w = Math.max(1, rect.width), h = Math.max(1, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function mount() {
      if (mounted) return;
      mounted = true;
      cancelled = false;

      canvas = document.createElement('canvas');
      box.appendChild(canvas);

      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.domElement.addEventListener('webglcontextlost', function(e) { e.preventDefault(); });

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0, 5);

      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      var key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(3, 5, 4);
      scene.add(key);
      var fill = new THREE.DirectionalLight(0xffffff, 0.5);
      fill.position.set(-4, 2, -3);
      scene.add(fill);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableRotate = true;
      controls.enableDamping = true;
      controls.dampingFactor = 0.12;
      controls.addEventListener('start', function() { box.classList.add('dragging'); });
      controls.addEventListener('end', function() { box.classList.remove('dragging'); });

      modelGroup = new THREE.Group();
      scene.add(modelGroup);

      resize();
      resizeObs = new ResizeObserver(resize);
      resizeObs.observe(box);
      // A ResizeObserver's first callback can land a beat late in some
      // browsers — this guarantees the canvas is never stuck at a stale size.
      setTimeout(resize, 50);

      box.addEventListener('pointerenter', function() { hovered = true; });
      box.addEventListener('pointerleave', function() { hovered = false; });

      loadModel(url).then(function(sourceScene) {
        if (cancelled) return;
        var cloned = sourceScene.clone();
        modelGroup.add(cloned);
        frameCamera(cloned);
        img.style.display = 'none';
        canvas.style.display = 'block';
      }).catch(function() {
        unmount();
      });

      var clock = performance.now() / 1000;
      function tick() {
        var now = performance.now() / 1000;
        var delta = Math.min(0.1, now - clock);
        clock = now;
        var target = hovered ? 1.08 : 1;
        modelGroup.scale.setScalar(modelGroup.scale.x + (target - modelGroup.scale.x) * Math.min(1, delta * 6));
        controls.update();
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
      }
      tick();
    }

    function unmount() {
      if (!mounted) return;
      mounted = false;
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (resizeObs) resizeObs.disconnect();
      if (controls) controls.dispose();
      if (renderer) renderer.dispose();
      if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
      if (img) img.style.display = '';
      canvas = null; renderer = null; scene = null; camera = null; controls = null; modelGroup = null;
    }

    var wantsSlot = false;
    function tryAcquireSlot() {
      if (!wantsSlot) return;
      if (activeSlot === null || activeSlot === box) {
        activeSlot = box;
        mount();
      } else {
        setTimeout(tryAcquireSlot, 350);
      }
    }

    new IntersectionObserver(function(entries) {
      wantsSlot = entries[0].isIntersecting;
      if (wantsSlot) {
        tryAcquireSlot();
      } else {
        if (activeSlot === box) activeSlot = null;
        unmount();
      }
    }, { rootMargin: '100px 0px', threshold: 0.01 }).observe(box);
  }

  boxes.forEach(setupBox);
})();
`;

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
.avatar-wrap .avatar-box{width:280px;height:280px;}
@media(min-width:768px){.avatar-wrap .avatar-box{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#a3a3a3;}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(1.75rem, 4.6vw, 5rem);margin:0;}
.word{color:#d4d4d4;transition:color .15s;}
.word.spoken{color:#171717;}
audio{margin-top:8px;height:36px;max-width:360px;}
` + AVATAR_BOX_CSS;

  const sectionsHtml = project.chunks
    .map((chunk, index) => {
      const avatar = avatarForIndex(index, avatars);
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const src = audioUrl(supabaseUrl, project.id, chunk);
      const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
      const wordsHtml = words.map((w) => `<span class="word">${escapeHtml(w)} </span>`).join("");
      return `
<section class="section${index % 2 === 1 ? " reversed" : ""}">
  <div class="avatar-wrap">${avatarBoxHtml(avatarImage, avatar)}</div>
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

  const needsModel = needsAvatarModel(avatars);
  return documentWrap(
    project.title,
    css,
    body,
    js + (needsModel ? AVATAR3D_INIT_JS : ""),
    needsModel ? AVATAR_MODEL_CDN_SCRIPTS : []
  );
}

function renderClarity(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const css = `
body{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:#fafafa;color:#171717;}
.wrap{max-width:680px;margin:0 auto;padding:80px 24px;display:flex;flex-direction:column;gap:56px;}
h1{font-size:1.875rem;font-weight:500;letter-spacing:-0.01em;margin:0;}
.cards{display:flex;flex-direction:column;gap:20px;}
.card{opacity:0;transform:translateY(16px);display:flex;gap:16px;border-radius:16px;border:1px solid #e5e5e5;background:#fff;padding:24px;box-shadow:0 1px 2px rgba(0,0,0,.04);box-sizing:border-box;}
.avatar-badge{width:48px;height:48px;border-radius:9999px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.avatar-badge .avatar-box{width:40px;height:40px;}
.card-body{display:flex;flex-direction:column;gap:8px;flex:1;}
.chunk-label{font-size:.75rem;font-weight:500;color:#a3a3a3;}
.card h2{font-size:1.125rem;font-weight:500;margin:0;}
.card p{font-size:.9rem;line-height:1.7;color:#525252;margin:0;}
audio{margin-top:4px;height:36px;}
` + AVATAR_BOX_CSS;

  const cardsHtml = project.chunks
    .map((chunk, index) => {
      const avatar = avatarForIndex(index, avatars);
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const src = audioUrl(supabaseUrl, project.id, chunk);
      return `
<article class="card">
  ${avatarImage ? `<div class="avatar-badge">${avatarBoxHtml(avatarImage, avatar)}</div>` : ""}
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

  const needsModel = needsAvatarModel(avatars);
  return documentWrap(
    project.title,
    css,
    body,
    js + (needsModel ? AVATAR3D_INIT_JS : ""),
    needsModel ? AVATAR_MODEL_CDN_SCRIPTS : []
  );
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
.cine-content .avatar-box{width:176px;height:176px;filter:drop-shadow(0 0 60px rgba(255,255,255,.15));}
.cine-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.4);}
.cine-content h2{max-width:640px;font-size:1.5rem;font-weight:500;margin:0;}
.cine-content p{max-width:560px;font-size:1.125rem;line-height:1.7;color:rgba(255,255,255,.7);margin:0;}
.play-btn{border-radius:9999px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#fff;padding:10px 20px;font-size:.9rem;font-weight:500;cursor:pointer;}
.play-btn:hover{background:rgba(255,255,255,.1);}
` + AVATAR_BOX_CSS;

  const sectionsHtml = project.chunks
    .map((chunk, index) => {
      const avatar = avatarForIndex(index, avatars);
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const bg = palette[(index + 1) % palette.length];
      const src = audioUrl(supabaseUrl, project.id, chunk);
      return `
<section class="cine-section" style="background:${bg}">
  <div class="cine-content">
    ${avatarBoxHtml(avatarImage, avatar)}
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

  const needsModel = needsAvatarModel(avatars);
  return documentWrap(
    project.title,
    css,
    body,
    js + (needsModel ? AVATAR3D_INIT_JS : ""),
    needsModel ? AVATAR_MODEL_CDN_SCRIPTS : []
  );
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
#lunar-canvas{position:fixed;inset:0;z-index:-10;display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab;}
#lunar-canvas.dragging{cursor:grabbing;}
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
  // react-three-fiber's Canvas defaults to sRGB output + ACES filmic tone
  // mapping; this r128 CDN build defaults to neither (linear output, no
  // tone mapping), which is what actually made the published moon look
  // flatter/greyer than the in-app preview — not the missing Environment
  // HDRI mentioned above, which only adds subtle reflections. Matching the
  // color pipeline here (not the scene/lighting/geometry) is what brings it
  // back in line with the reference look.
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 4, 10);
  camera.lookAt(0, 0, 0);

  // Draggable (rotate only, matching the original card — no zoom/pan), mouse
  // only: touches.ONE/TWO left null so a touch-drag on the page is never
  // hijacked into orbiting the camera instead of scrolling.
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.touches = { ONE: null, TWO: null };
  controls.addEventListener('start', function() { canvas.classList.add('dragging'); });
  controls.addEventListener('end', function() { canvas.classList.remove('dragging'); });

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

  // Hover feedback: a subtle scale bump while the pointer is over the moon
  // (matching RealisticMoon's React version — see lunar-gravity-card.tsx),
  // detected via raycasting since a bare canvas has no built-in per-mesh
  // pointer events the way react-three-fiber does.
  var raycaster = new THREE.Raycaster();
  var pointerNdc = new THREE.Vector2(-10, -10);
  var moonHover = 0;
  window.addEventListener('mousemove', function(e) {
    pointerNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

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

    raycaster.setFromCamera(pointerNdc, camera);
    var hovered = raycaster.intersectObject(moon, false).length > 0;
    moonHover += ((hovered ? 1 : 0) - moonHover) * Math.min(1, delta * 6);
    moon.scale.setScalar(1 + moonHover * 0.06);

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

    controls.update();
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
.avatar-wrap .avatar-box{width:280px;height:280px;filter:drop-shadow(0 0 60px rgba(180,220,255,.15));}
@media(min-width:768px){.avatar-wrap .avatar-box{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;border-radius:16px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.4);box-shadow:0 8px 32px rgba(0,0,0,.35);padding:32px;box-sizing:border-box;}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:rgba(255,255,255,.3);}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(1.5rem, 3.2vw, 3rem);margin:0;}
.word{color:rgba(255,255,255,.25);transition:color .15s;}
.word.spoken{color:#fff;}
audio{margin-top:8px;height:36px;max-width:360px;}
` + AVATAR_BOX_CSS;

  const sectionsHtml = project.chunks
    .map((chunk, index) => {
      const avatar = avatarForIndex(index, avatars);
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const src = audioUrl(supabaseUrl, project.id, chunk);
      const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
      const wordsHtml = words.map((w) => `<span class="word">${escapeHtml(w)} </span>`).join("");
      return `
<section class="section${index % 2 === 1 ? " reversed" : ""}">
  <div class="avatar-wrap">${avatarBoxHtml(avatarImage, avatar)}</div>
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

  const needsModel = needsAvatarModel(avatars);
  return documentWrap(
    project.title,
    css,
    body,
    js + (needsModel ? AVATAR3D_INIT_JS : ""),
    needsModel ? AVATAR_MODEL_CDN_SCRIPTS : []
  );
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
.avatar-wrap .avatar-box{width:280px;height:280px;filter:drop-shadow(0 0 60px rgba(120,180,255,.2));}
@media(min-width:768px){.avatar-wrap .avatar-box{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;border-radius:16px;border:1px solid rgba(103,232,249,.2);background:rgba(0,0,0,.4);box-shadow:0 8px 32px rgba(0,0,0,.35);padding:32px;box-sizing:border-box;}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:rgba(165,243,252,.5);}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(1.5rem, 3.2vw, 3rem);margin:0;}
.word{color:rgba(255,255,255,.25);transition:color .15s;}
.word.spoken{color:#fff;}
audio{margin-top:8px;height:36px;max-width:360px;}
` + AVATAR_BOX_CSS;

  const sectionsHtml = project.chunks
    .map((chunk, index) => {
      const avatar = avatarForIndex(index, avatars);
      const avatarImage = avatarImagePath(chunk, index, avatars);
      // Lunar always prefers the avatar's video over its 3D model, matching
      // the live preview — never the plain static image when either is available.
      const videoPath = avatarVideoPath(index, avatar);
      const avatarMarkup = videoPath ? avatarVideoBoxHtml(videoPath) : avatarBoxHtml(avatarImage, avatar);
      const src = audioUrl(supabaseUrl, project.id, chunk);
      const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
      const wordsHtml = words.map((w) => `<span class="word">${escapeHtml(w)} </span>`).join("");
      return `
<section class="section${index % 2 === 1 ? " reversed" : ""}">
  <div class="avatar-wrap">${avatarMarkup}</div>
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
  var video = section.querySelector('video');
  if (video) {
    video.currentTime = 0;
    video.play().catch(function(){});
  }
}

document.querySelectorAll('.section').forEach(function(section){
  var audio = section.querySelector('audio');
  var video = section.querySelector('video');
  ScrollTrigger.create({
    trigger: section, start: 'top center', end: 'bottom center',
    onEnter: function(){ activateSection(section); },
    onEnterBack: function(){ activateSection(section); },
    onLeave: function(){ if (audio) audio.pause(); if (video) video.pause(); },
    onLeaveBack: function(){ if (audio) audio.pause(); if (video) video.pause(); }
  });
  gsap.fromTo(section.querySelector('.copy'), {opacity:0, y:24}, {
    opacity:1, y:0, duration:0.6, ease:'power2.out',
    scrollTrigger:{trigger:section, start:'top 75%'}
  });
});
` + LUNAR_INIT_JS;

  // Lunar prefers video over the 3D model (see sectionsHtml above), so the
  // GLTFLoader/OrbitControls CDN scripts are only worth loading here for an
  // avatar that has a model but no video to prefer instead.
  const usesModelInLunar = avatars.some((avatar) => avatar.modelUrl && (!avatar.videoUrls || avatar.videoUrls.length === 0));
  return documentWrap(
    project.title,
    css,
    body,
    js + (usesModelInLunar ? AVATAR3D_INIT_JS : ""),
    dedupeScripts([THREE_CDN, ORBIT_CONTROLS_CDN, ...(usesModelInLunar ? AVATAR_MODEL_CDN_SCRIPTS : [])])
  );
}

const AIRLOCK_VIDEO_CDN = "https://cdn.jsdelivr.net/gh/yuraoak/airlock-hero-assets@main";
const AIRLOCK_VIDEO_SRC = `${AIRLOCK_VIDEO_CDN}/iss-hero-1080p.mp4`;
const AIRLOCK_POSTER_SRC = `${AIRLOCK_VIDEO_CDN}/iss-hero-poster.jpg`;
const AIRLOCK_SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const AIRLOCK_CSS = `
:root{color-scheme:dark}
body{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:#05070d;color:#f2f4f8;}
#airlock-hero{position:relative;height:100dvh;width:100%;overflow:hidden;background:#05070d;}
#airlock-video{position:absolute;inset:0;height:100%;width:100%;object-fit:cover;opacity:0;transform-origin:center center;will-change:transform;transition:opacity .6s ease;}
.airlock-overlay{pointer-events:none;position:absolute;inset:0;}
#airlock-title-wrap,#airlock-tagline-wrap{pointer-events:none;position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;}
#airlock-title-wrap{padding:0 6%;}
#airlock-tagline-wrap{padding:0 8%;opacity:0;}
#airlock-title-wrap h1{display:inline-block;margin:0;font-weight:800;line-height:1;letter-spacing:-0.02em;font-family:${AIRLOCK_SANS};font-size:clamp(30px,7vw,96px);color:#f2f4f8;text-shadow:0 4px 30px rgba(0,0,0,.55);will-change:transform,filter,opacity;}
#airlock-tagline-wrap p{margin:0;font-weight:700;letter-spacing:-0.01em;font-family:${AIRLOCK_SANS};font-size:clamp(20px,3.4vw,40px);line-height:1.2;color:#f2f4f8;text-shadow:0 4px 24px rgba(0,0,0,.6);}
#airlock-hint{pointer-events:none;position:absolute;bottom:clamp(20px,6vh,48px);left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;transition:opacity .4s;color:rgba(242,244,248,.72);font-family:${AIRLOCK_SANS};font-size:clamp(10px,1.4vw,12px);font-weight:600;letter-spacing:.3em;}
#airlock-hint svg{animation:airlock-bounce 1.6s ease-in-out infinite;}
@keyframes airlock-bounce{0%,100%{transform:translateY(0);opacity:.5;}50%{transform:translateY(5px);opacity:1;}}
@media(prefers-reduced-motion:reduce){#airlock-hint svg{animation:none!important;}}
#airlock-skip{position:absolute;left:50%;top:16px;transform:translateX(-50%);z-index:10;border-radius:9999px;border:0;padding:8px 16px;font-size:12px;font-weight:600;font-family:${AIRLOCK_SANS};color:#f2f4f8;background:rgba(5,7,13,.7);letter-spacing:.08em;opacity:0;cursor:pointer;transition:opacity .15s;}
#airlock-skip:focus-visible{opacity:1;outline:2px solid #f2f4f8;outline-offset:2px;}
#airlock-progress-track{position:absolute;inset-inline:0;bottom:0;height:2px;background:rgba(255,255,255,.12);}
#airlock-bar{height:100%;width:100%;transform-origin:left;background:linear-gradient(90deg, rgba(255,255,255,0.45), rgba(255,255,255,0.95));transform:scaleX(0);}
.section{min-height:100vh;display:flex;flex-direction:column;align-items:center;gap:40px;border-top:1px solid rgba(255,255,255,.05);padding:80px 32px;box-sizing:border-box;}
@media(min-width:768px){.section{flex-direction:row;gap:64px;padding:80px 64px;}}
.section.reversed{flex-direction:column;}
@media(min-width:768px){.section.reversed{flex-direction:row-reverse;}}
.avatar-wrap{width:100%;flex-shrink:0;display:flex;justify-content:center;}
@media(min-width:768px){.avatar-wrap{width:36%;}}
.avatar-wrap .avatar-box{width:280px;height:280px;filter:drop-shadow(0 0 60px rgba(255,255,255,.1));}
@media(min-width:768px){.avatar-wrap .avatar-box{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;border-radius:16px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.4);box-shadow:0 8px 32px rgba(0,0,0,.35);padding:32px;box-sizing:border-box;}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:rgba(255,255,255,.3);}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(1.5rem, 3.2vw, 3rem);margin:0;}
.word{color:rgba(255,255,255,.25);transition:color .15s;}
.word.spoken{color:#fff;}
audio{margin-top:8px;height:36px;max-width:360px;}
` + AVATAR_BOX_CSS;

function airlockHeroMarkup(title: string): string {
  return `
<div id="airlock-hero">
  <video id="airlock-video" src="${AIRLOCK_VIDEO_SRC}" poster="${AIRLOCK_POSTER_SRC}" muted playsinline preload="auto" aria-hidden="true"></video>
  <div class="airlock-overlay" style="background:linear-gradient(180deg, rgba(5,7,13,0.38), rgba(5,7,13,0) 30%, rgba(5,7,13,0.15) 70%, rgba(5,7,13,0.58));"></div>
  <div id="airlock-scrim" class="airlock-overlay" style="background:radial-gradient(ellipse 62% 44% at 50% 50%, rgba(5,7,13,0.68), rgba(5,7,13,0) 72%);"></div>
  <div id="airlock-title-wrap"><h1>${escapeHtml(title)}</h1></div>
  <div id="airlock-tagline-wrap"><p>Everything you know fits in one half of the frame.</p></div>
  <div id="airlock-hint">
    <span>SCROLL</span>
    <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true">
      <path d="M7 1 L7 17 M2 12 L7 17 L12 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
  <button id="airlock-skip" type="button">Skip intro</button>
  <div id="airlock-progress-track"><div id="airlock-bar"></div></div>
</div>`;
}

/**
 * Vanilla-JS port of AirlockHero (see components/ui/airlock-spaceship-hero.tsx)
 * — a scroll-locked, scrub-driven video hero. No React refs/state to adapt
 * here beyond the obvious (getElementById instead of useRef, closured
 * variables instead of useState): the original is already plain DOM/event
 * code inside a useEffect, so this is a near-verbatim transcription. Kept in
 * sync with the React version's constants and easing.
 */
const AIRLOCK_INIT_JS = `
(function(){
  var section = document.getElementById('airlock-hero');
  var video = document.getElementById('airlock-video');
  var titleWrap = document.getElementById('airlock-title-wrap');
  var taglineWrap = document.getElementById('airlock-tagline-wrap');
  var hint = document.getElementById('airlock-hint');
  var bar = document.getElementById('airlock-bar');
  var scrim = document.getElementById('airlock-scrim');
  var skipBtn = document.getElementById('airlock-skip');
  if (!video || !section) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var duration = 0, rafId = 0, target = 0, shown = 0, moved = false, seeking = false, queued = null;
  var locked = false, lockedY = 0, touchY = 0, released = false, lastY = 0;
  var scrubDistance = 3200, holdDistance = 1100;
  var totalDistance = scrubDistance + holdDistance;
  var scrubShare = scrubDistance / totalDistance;

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function seekTo(t) {
    if (seeking) { queued = t; return; }
    seeking = true;
    video.currentTime = t;
  }
  video.addEventListener('seeked', function() {
    seeking = false;
    if (queued !== null) {
      var t = queued;
      queued = null;
      seeking = true;
      video.currentTime = t;
    }
  });

  function paint(p) {
    var videoP = clamp(p / scrubShare, 0, 1);
    if (duration > 0) seekTo(Math.min(videoP * duration, duration - 0.04));
    var titleAlpha = 1 - clamp(videoP / 0.35, 0, 1);
    var taglineAlpha = clamp((videoP - 0.82) / 0.18, 0, 1);
    video.style.transform = 'scale(' + (1 + videoP * 0.06) + ')';
    if (scrim) scrim.style.opacity = String(Math.max(titleAlpha, taglineAlpha));
    if (titleWrap) {
      var h1 = titleWrap.querySelector('h1');
      h1.style.opacity = String(titleAlpha);
      h1.style.transform = 'translateY(' + ((1 - titleAlpha) * -24) + 'px) scale(' + (0.96 + titleAlpha * 0.04) + ')';
      h1.style.filter = 'blur(' + ((1 - titleAlpha) * 10) + 'px)';
    }
    if (hint) hint.style.opacity = moved ? '0' : '1';
    if (taglineWrap) {
      var p_ = taglineWrap.querySelector('p');
      taglineWrap.style.opacity = String(taglineAlpha);
      p_.style.transform = 'translateY(' + ((1 - taglineAlpha) * 20) + 'px) scale(' + (0.97 + taglineAlpha * 0.03) + ')';
      p_.style.filter = 'blur(' + ((1 - taglineAlpha) * 8) + 'px)';
    }
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
  }

  function engageLock() {
    if (locked) return;
    locked = true;
    released = false;
    lockedY = window.scrollY;
    var b = document.body.style;
    b.position = 'fixed'; b.top = '-' + lockedY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%';
  }
  function releaseLock() {
    if (!locked) return;
    locked = false;
    var y = lockedY;
    var b = document.body.style;
    b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = '';
    window.scrollTo(0, y);
    released = true;
    lastY = y;
  }

  function release() {
    target = shown = 1;
    moved = true;
    paint(1);
    releaseLock();
  }
  if (skipBtn) skipBtn.addEventListener('click', release);

  function consume(deltaY) {
    if (!locked) return false;
    if (target >= 1 && shown > 0.98 && deltaY > 0) { releaseLock(); return false; }
    target = clamp(target + deltaY / totalDistance, 0, 1);
    if (target > 0.001) moved = true;
    return true;
  }

  function onWheel(e) { if (consume(e.deltaY)) e.preventDefault(); }
  function onTouchStart(e) { touchY = (e.touches[0] || {}).clientY || 0; }
  function onTouchMove(e) {
    var y = (e.touches[0] || {}).clientY;
    if (y === undefined) y = touchY;
    var deltaY = touchY - y;
    touchY = y;
    if (consume(deltaY)) e.preventDefault();
  }
  var KEY_STEPS = { ArrowDown: 140, ArrowUp: -140, PageDown: 700, PageUp: -700, ' ': 700, End: Number.MAX_SAFE_INTEGER, Home: Number.MIN_SAFE_INTEGER };
  function onKeyDown(e) {
    var step = KEY_STEPS[e.key];
    if (step === undefined) return;
    if (consume(step)) e.preventDefault();
  }
  function onScroll() {
    if (locked || !released) return;
    var y = window.scrollY;
    var climbing = y < lastY;
    lastY = y;
    if (climbing && y <= section.offsetTop) {
      target = shown = 1;
      paint(1);
      engageLock();
    }
  }

  video.addEventListener('loadeddata', function() {
    duration = video.duration || 0;
    video.style.opacity = '1';
    if (reduceMotion) { target = shown = 1; moved = true; paint(1); }
  });

  if (!reduceMotion) {
    if (window.scrollY <= section.offsetTop + 1) engageLock();
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    (function frame() {
      shown += (target - shown) * 0.18;
      paint(shown);
      rafId = requestAnimationFrame(frame);
    })();
  }
})();
`;

function renderAirlock(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const css = AIRLOCK_CSS;

  const sectionsHtml = project.chunks
    .map((chunk, index) => {
      const avatar = avatarForIndex(index, avatars);
      const avatarImage = avatarImagePath(chunk, index, avatars);
      const src = audioUrl(supabaseUrl, project.id, chunk);
      const words = chunk.narrativeText.split(/\s+/).filter(Boolean);
      const wordsHtml = words.map((w) => `<span class="word">${escapeHtml(w)} </span>`).join("");
      return `
<section class="section${index % 2 === 1 ? " reversed" : ""}">
  <div class="avatar-wrap">${avatarBoxHtml(avatarImage, avatar)}</div>
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
${airlockHeroMarkup(project.title)}
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
` + AIRLOCK_INIT_JS;

  const needsModel = needsAvatarModel(avatars);
  return documentWrap(
    project.title,
    css,
    body,
    js + (needsModel ? AVATAR3D_INIT_JS : ""),
    needsModel ? AVATAR_MODEL_CDN_SCRIPTS : []
  );
}

type CaseStudyRenderTheme = "light" | "space" | "lunar" | "airlock";

function renderCaseStudy(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const sections = flattenCaseStudySections(project.caseStudyBinding?.slots ?? null);
  const sectionAudio = project.caseStudyBinding?.sectionAudio;
  const sectionVideo = project.caseStudyBinding?.sectionVideo;
  // Case-study projects always render this layout regardless of
  // selectedTemplateId (see renderStaticSite) — picking "space"/"lunar"/
  // "airlock" there is still how they opt into those templates'
  // backgrounds/heroes rather than losing access to them entirely.
  const theme: CaseStudyRenderTheme =
    project.selectedTemplateId === "space" ||
    project.selectedTemplateId === "lunar" ||
    project.selectedTemplateId === "airlock"
      ? project.selectedTemplateId
      : "light";
  const isDark = theme !== "light";
  const kicker = theme === "space" ? "Space" : theme === "lunar" ? "Lunar" : "Case study";
  const kickerColor = theme === "lunar" ? "rgba(103,232,249,.4)" : isDark ? "rgba(255,255,255,.3)" : "#a3a3a3";
  const eyebrowColor = theme === "lunar" ? "rgba(165,243,252,.6)" : isDark ? "rgba(255,255,255,.4)" : "#a3a3a3";
  const borderColor = theme === "lunar" ? "rgba(34,211,238,.1)" : isDark ? "rgba(255,255,255,.05)" : "#f0f0f0";
  const avatarGlow = theme === "lunar" ? "rgba(120,180,255,.2)" : "rgba(180,220,255,.15)";
  // Deliberately more opaque than borderColor/section dividers above: this is
  // the actual glass card the body copy sits on. No blur — a dark, mostly
  // transparent tint darkens the busy background just enough for text to
  // read, while keeping the background (moon surface, starfield) sharp and
  // visible through the card rather than dissolved into a blurred wash.
  const panelBorderColor = theme === "lunar" ? "rgba(103,232,249,.2)" : "rgba(255,255,255,.15)";
  const panelBg = "rgba(0,0,0,.4)";

  // Same big-text, word-highlight-as-spoken treatment as renderEditorial —
  // this template is the case-study data source with Editorial's visuals,
  // with a dark backdrop (particle field or 3D moon scene) when isDark.
  const css =
    (isDark
      ? theme === "lunar"
        ? LUNAR_CSS
        : theme === "airlock"
          ? AIRLOCK_CSS
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
.avatar-wrap .avatar-box{width:280px;height:280px;${isDark ? `filter:drop-shadow(0 0 60px ${avatarGlow});` : ""}}
@media(min-width:768px){.avatar-wrap .avatar-box{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;${
      isDark
        ? `border-radius:16px;border:1px solid ${panelBorderColor};background:${panelBg};box-shadow:0 8px 32px rgba(0,0,0,.35);padding:32px;box-sizing:border-box;`
        : ""
    }}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:${eyebrowColor};}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(${isDark ? "1.5rem, 3.2vw, 3rem" : "1.75rem, 4.6vw, 5rem"});margin:0;}
.word{color:${isDark ? "rgba(255,255,255,.25)" : "#d4d4d4"};transition:color .15s;}
.word.spoken{color:${isDark ? "#fff" : "#171717"};}
audio{margin-top:8px;height:36px;max-width:360px;}
` + AVATAR_BOX_CSS;

  const sectionsHtml = sections
    .map((section, index) => {
      const avatar = avatarForIndex(index, avatars);
      const avatarImage = avatar ? bundlePath(getAvatarImage(avatar, section.emotion)) : null;
      // Lunar always prefers the avatar's video over its 3D model, matching
      // the live preview — never the plain static image when either is available.
      const videoPath =
        theme === "lunar" ? sectionVideoPath(supabaseUrl, project.id, section, index, avatar, sectionVideo) : undefined;
      const avatarMarkup = videoPath ? avatarVideoBoxHtml(videoPath) : avatarBoxHtml(avatarImage, avatar);
      const src = sectionAudioUrl(supabaseUrl, project.id, section, sectionAudio);
      const words = section.body.split(/\s+/).filter(Boolean);
      const wordsHtml = words.map((w) => `<span class="word">${escapeHtml(w)} </span>`).join("");
      return `
<section class="section${index % 2 === 1 ? " reversed" : ""}">
  <div class="avatar-wrap">${avatarMarkup}</div>
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
  // Airlock's hero replaces the plain header entirely (it already carries the
  // title in its own full-screen intro) rather than sitting behind it like
  // the Space/Lunar backdrops do — see CaseStudyTemplate.tsx's equivalent branch.
  const headerOrHero =
    theme === "airlock"
      ? airlockHeroMarkup(project.title)
      : `${backdropMarkup}\n<header class="header"><span class="kicker">${kicker}</span><h1>${escapeHtml(project.title)}</h1></header>`;

  const body = `
${headerOrHero}
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
  var video = section.querySelector('video');
  if (video) {
    video.currentTime = 0;
    video.play().catch(function(){});
  }
}

document.querySelectorAll('.section').forEach(function(section){
  var audio = section.querySelector('audio');
  var video = section.querySelector('video');
  ScrollTrigger.create({
    trigger: section, start: 'top center', end: 'bottom center',
    onEnter: function(){ activateSection(section); },
    onEnterBack: function(){ activateSection(section); },
    onLeave: function(){ if (audio) audio.pause(); if (video) video.pause(); },
    onLeaveBack: function(){ if (audio) audio.pause(); if (video) video.pause(); }
  });
  gsap.fromTo(section.querySelector('.copy'), {opacity:0, y:24}, {
    opacity:1, y:0, duration:0.6, ease:'power2.out',
    scrollTrigger:{trigger:section, start:'top 75%'}
  });
});
` + (theme === "space" ? ASMR_INIT_JS : theme === "lunar" ? LUNAR_INIT_JS : theme === "airlock" ? AIRLOCK_INIT_JS : "");

  // Lunar prefers video over the 3D model (see sectionsHtml above), so the
  // GLTFLoader/OrbitControls CDN scripts are only worth loading here for an
  // avatar that has a model but no video to prefer instead.
  const usesModel =
    theme === "lunar"
      ? avatars.some((avatar) => avatar.modelUrl && (!avatar.videoUrls || avatar.videoUrls.length === 0))
      : needsAvatarModel(avatars);
  const themeScripts = theme === "lunar" ? [THREE_CDN, ORBIT_CONTROLS_CDN] : [];
  return documentWrap(
    project.title,
    css,
    body,
    js + (usesModel ? AVATAR3D_INIT_JS : ""),
    dedupeScripts([...themeScripts, ...(usesModel ? AVATAR_MODEL_CDN_SCRIPTS : [])])
  );
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
    case "airlock":
      return renderAirlock(project, avatars, supabaseUrl);
    case "editorial":
    default:
      return renderEditorial(project, avatars, supabaseUrl);
  }
}
