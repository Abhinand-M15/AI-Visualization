import type { Chunk, Project } from "@/lib/types";
import { getAvatarImage, type Avatar } from "@/lib/avatars";
import { flattenCaseStudySections, type CaseStudySection } from "@/lib/caseStudySections";

const GSAP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
const SCROLLTRIGGER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";

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

function documentWrap(title: string, css: string, body: string, js: string): string {
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

function renderCaseStudy(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const sections = flattenCaseStudySections(project.caseStudyBinding?.slots ?? null);
  const sectionAudio = project.caseStudyBinding?.sectionAudio;
  // Case-study projects always render this layout regardless of
  // selectedTemplateId (see renderStaticSite) — picking "space" there is
  // still how they opt into the Space template's particle background rather
  // than losing access to it entirely.
  const isSpace = project.selectedTemplateId === "space";

  // Same big-text, word-highlight-as-spoken treatment as renderEditorial —
  // this template is the case-study data source with Editorial's visuals,
  // with a dark/particle variant when isSpace.
  const css =
    (isSpace ? ASMR_CSS : `:root{color-scheme:light}\nbody{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:#fff;color:#171717;}`) +
    `
.header{${isSpace ? "position:relative;" : ""}padding:96px 32px 64px;}
.header .kicker{font-size:.75rem;text-transform:uppercase;letter-spacing:${isSpace ? ".4em" : ".05em"};font-weight:${isSpace ? "300" : "400"};color:${isSpace ? "rgba(255,255,255,.3)" : "#a3a3a3"};}
.header h1{margin:12px 0 0;max-width:760px;font-size:2.5rem;font-weight:500;line-height:1.2;}
@media(min-width:768px){.header h1{font-size:3rem;}}
.section{${isSpace ? "position:relative;" : ""}min-height:100vh;display:flex;flex-direction:column;align-items:center;gap:40px;border-top:1px solid ${isSpace ? "rgba(255,255,255,.05)" : "#f0f0f0"};padding:80px 32px;box-sizing:border-box;}
@media(min-width:768px){.section{flex-direction:row;gap:64px;padding:80px 64px;}}
.section.reversed{flex-direction:column;}
@media(min-width:768px){.section.reversed{flex-direction:row-reverse;}}
.avatar-wrap{width:100%;flex-shrink:0;display:flex;justify-content:center;}
@media(min-width:768px){.avatar-wrap{width:36%;}}
.avatar-wrap img{width:280px;height:280px;object-fit:contain;${isSpace ? "filter:drop-shadow(0 0 60px rgba(180,220,255,.15));" : ""}}
@media(min-width:768px){.avatar-wrap img{width:420px;height:420px;}}
.copy{opacity:0;transform:translateY(24px);width:100%;display:flex;flex-direction:column;gap:24px;${
      isSpace
        ? "border-radius:16px;border:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.02);backdrop-filter:blur(4px);padding:32px;box-sizing:border-box;"
        : ""
    }}
@media(min-width:768px){.copy{width:64%;}}
.eyebrow{font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:${isSpace ? "rgba(255,255,255,.3)" : "#a3a3a3"};}
.copy h2{font-size:1.5rem;font-weight:500;margin:0;}
@media(min-width:768px){.copy h2{font-size:1.75rem;}}
.big-text{font-weight:500;line-height:1.15;letter-spacing:-0.01em;font-size:clamp(1.75rem, 4.6vw, 5rem);margin:0;}
.word{color:${isSpace ? "rgba(255,255,255,.25)" : "#d4d4d4"};transition:color .15s;}
.word.spoken{color:${isSpace ? "#fff" : "#171717"};}
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

  const body = `
${isSpace ? ASMR_MARKUP : ""}
<header class="header"><span class="kicker">${isSpace ? "Space" : "Case study"}</span><h1>${escapeHtml(project.title)}</h1></header>
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
` + (isSpace ? ASMR_INIT_JS : "");

  return documentWrap(project.title, css, body, js);
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
    case "editorial":
    default:
      return renderEditorial(project, avatars, supabaseUrl);
  }
}
