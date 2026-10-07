import type { Chunk, Project } from "@/lib/types";
import { avatarVideoFallbackUrl, getAvatarImage, type Avatar } from "@/lib/avatars";
import {
  VOYAGE_ASSET_ROOT,
  VOYAGE_MUSIC_ICON,
  VOYAGE_PALETTES,
  destinationFor,
  voyageTitleFontSize,
  type VoyageMood,
} from "@/lib/voyage";
import { VOYAGE_CSS } from "@/lib/voyageCss";
import {
  CHAPTER_LAYOUT_CSS,
  CHAPTER_LAYOUT_FN,
  CHAPTER_THEMES,
  chapterLayoutHtml,
  chapterLists,
} from "@/lib/chapterLayout";
import { chapterImageHtml } from "@/components/templates/storyMedia";
import { NARRATION_DOCK_CSS, NARRATION_DOCK_JS, narrationDockMarkup } from "@/lib/narrationDock";
import { VOYAGE_MUSIC_JS } from "@/lib/voyageMusic";

/**
 * Published (static HTML) version of the Voyage template — a vanilla-JS port of
 * components/templates/VoyageTemplate.tsx. Same class names and the same shared
 * stylesheet (lib/voyageCss.ts), so the two render identically; only the
 * view-switching, scroll wiring and narration are re-implemented without React.
 *
 * The page is built from one JSON blob (#vg-data) at load: palettes, and per
 * chunk its text, audio URL, avatar markup and derived labels. Only the active
 * chunk and its neighbours ever have sky layers in the DOM.
 */

const GSAP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
const SCROLLTRIGGER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Unbounded:wght@800&display=swap";

export interface VoyageSiteOptions {
  /** Audio files that replace the generated music bed for a mood (bundle paths). */
  customMusic?: Partial<Record<VoyageMood, string>>;
}

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** JSON for an inline <script type="application/json"> — `<` is escaped so the
 *  data can never close the tag or open a comment. */
function inlineJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028").replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
}

/** Strips the leading slash so the path works as a relative reference inside the deploy bundle. */
const bundlePath = (path: string) => path.replace(/^\//, "");

function chunkAudioUrl(supabaseUrl: string, projectId: string, chunk: Chunk): string | null {
  if (!chunk.audioUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/chunk-audio/${projectId}/${chunk.id}.mp3`;
}

/** The avatar slot for one chunk: its video (webm + mp4 fallback) when it has
 *  one, otherwise the emotion image. Voyage never loads the 3D model. */
function avatarMarkup(chunk: Chunk, index: number, avatars: Avatar[]): string {
  if (avatars.length === 0) return "";
  const avatar = avatars[index % avatars.length];
  const videos = avatar.videoUrls ?? [];
  if (videos.length > 0) {
    const url = videos[index % videos.length];
    const fallback = avatarVideoFallbackUrl(url);
    if (fallback) {
      return `<video muted loop playsinline preload="metadata"><source src="${bundlePath(url)}" type="video/webm" /><source src="${bundlePath(fallback)}" type="video/mp4" /></video>`;
    }
    return `<video src="${bundlePath(url)}" muted loop playsinline preload="metadata"></video>`;
  }
  return `<img src="${bundlePath(getAvatarImage(avatar, chunk.emotion))}" alt="" decoding="async" />`;
}

const GATE_CSS = `
body{margin:0;background:#05030c;}
#narration-gate{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(5,3,12,.66);transition:opacity .3s;}
#narration-gate.hidden{opacity:0;pointer-events:none;}
#narration-gate .gate-card{max-width:360px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;border-radius:16px;border:1px solid rgba(131,239,255,.3);background:rgba(10,6,20,.82);padding:32px 24px;color:#fff;font-family:inherit;}
#narration-gate .gate-card p{margin:0;font-size:.9375rem;line-height:1.5;color:rgba(255,255,255,.78);}
#narration-gate button{font:inherit;cursor:pointer;}
#narration-start{border:0;border-radius:999px;padding:12px 28px;font-size:1rem;font-weight:600;background:#83efff;color:#04121a;}
#narration-skip{border:0;background:none;padding:4px;font-size:.8125rem;color:rgba(255,255,255,.6);text-decoration:underline;}
#vg-music-toggle{display:none;}
#vg-music-toggle.visible{display:inline-flex;}
`;

/** Client script. No backticks or template placeholders inside — it is embedded
 *  verbatim in a template literal. */
const VOYAGE_INIT_JS = `
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
(function () {
  var D = JSON.parse(document.getElementById('vg-data').textContent);
  var total = D.chunks.length;
  var root = document.getElementById('vg-root');
  var backdrop = document.getElementById('vg-backdrop');
  var viewHost = document.getElementById('vg-view');
  var segs = document.getElementById('vg-segs');
  var navFill = document.getElementById('vg-nav-fill');
  var btnPrev = document.getElementById('vg-prev');
  var btnNext = document.getElementById('vg-next-nav');
  var btnCount = document.getElementById('vg-count');
  var audio = document.getElementById('vg-audio');
  var gate = document.getElementById('narration-gate');
  var narrationToggle = ndPause;
  var musicToggle = document.getElementById('vg-music-toggle');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = !window.matchMedia('(pointer: coarse)').matches;
  var music = createVoyageMusic({ files: D.music || {} });

  var view = 'select';
  var active = 0;
  var busy = false;
  var viewChangedAt = 0;
  var motion = null;          // gsap.context for the current chunk page
  var layoutCleanup = null;   // cleanup of the chapter layout on the current chunk page
  var narrationTimer = 0;
  var narrationEnabled = false;
  var narrationPaused = false;
  var highlightHandler = null;

  var WHEEL_THROTTLE = 800;
  var SWIPE_MIN = 50;

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function q(sel, scope) { return (scope || document).querySelector(sel); }
  function qa(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function palette(i) { return D.palettes[D.chunks[i].palette]; }
  function mounted() {
    if (total <= 3) { var all = []; for (var i = 0; i < total; i++) all.push(i); return all; }
    return [(active + total - 1) % total, active, (active + 1) % total];
  }

  // ------------------------------------------------------------ backdrop
  function buildSky(i) {
    var p = palette(i);
    var chunk = D.chunks[i];
    var sky = document.createElement('div');
    sky.className = 'vg-sky';
    sky.dataset.i = i;
    if (chunk.hue) sky.style.filter = 'hue-rotate(' + chunk.hue + 'deg)';
    var layers = p.sky.map(function (l, j) {
      return '<img src="' + esc(l.src) + '" alt="" decoding="async"' + (j === 0 ? ' class="vg-sky-twinkle"' : '') +
        (l.depth !== undefined ? ' data-parallax="' + l.depth + '"' : '') +
        ' style="opacity:' + l.opacity + (l.rotate180 ? ';transform:rotate(180deg)' : '') + '" />';
    }).join('');
    sky.innerHTML =
      '<div class="vg-sky-grad" style="background:linear-gradient(180deg,' + p.gradient[0] + ' 0%,' + p.gradient[1] + ' 55%,' + p.gradient[2] + ' 100%)"></div>' +
      '<div class="vg-sky-layers">' + layers + '</div>' +
      '<div class="vg-sky-dim" style="background:' + p.overlay + '"></div>';
    return sky;
  }

  function renderBackdrop() {
    var want = mounted();
    qa('.vg-sky', backdrop).forEach(function (n) {
      if (want.indexOf(Number(n.dataset.i)) < 0) backdrop.removeChild(n);
    });
    want.forEach(function (i) {
      var n = q('.vg-sky[data-i="' + i + '"]', backdrop);
      if (!n) {
        n = buildSky(i);
        backdrop.appendChild(n);
        void n.offsetWidth; // let the opacity transition start from 0
      }
      n.classList.toggle('on', i === active);
    });
    root.style.setProperty('--vg-accent', palette(active).accent);
  }

  // ------------------------------------------------------------ navigation bar
  function setFill(v) { navFill.style.transform = 'scaleX(' + Math.min(1, Math.max(0, v)) + ')'; }

  function updateNav() {
    var inChunk = view === 'chunk';
    var prev = D.chunks[(active + total - 1) % total];
    var next = D.chunks[(active + 1) % total];
    btnPrev.textContent = '\\u2039 ' + prev.giant;
    btnPrev.title = prev.full;
    btnPrev.disabled = inChunk ? active === 0 : total < 2;
    btnCount.textContent = D.chunks[active].label;
    btnCount.title = inChunk ? 'All chapters' : 'Open chapter';
    var last = inChunk && active + 1 >= total;
    btnNext.textContent = last ? 'Chapters \\u203a' : next.giant + ' \\u203a';
    btnNext.title = next.full;
    btnNext.disabled = !inChunk && total < 2;
    qa('button', segs).forEach(function (b, i) {
      b.className = i === active ? 'on' : i < active ? 'done' : '';
      if (i === active) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    setFill(inChunk ? active / total : (active + 1) / total);
  }

  // ------------------------------------------------------------ select view
  function syncPlanets(fg) {
    var want = mounted();
    qa('.vg-planet', fg).forEach(function (n) {
      if (want.indexOf(Number(n.dataset.i)) < 0) fg.removeChild(n);
    });
    want.forEach(function (i) {
      var n = q('.vg-planet[data-i="' + i + '"]', fg);
      if (!n) {
        n = document.createElement('div');
        n.className = 'vg-planet';
        n.dataset.i = i;
        n.setAttribute('aria-hidden', 'true');
        n.innerHTML = '<img src="' + esc(palette(i).wheelPlanet) + '" alt="" decoding="async" style="--r:' + D.chunks[i].wheel + 'deg" />';
        fg.insertBefore(n, q('.vg-select-card', fg));
        void n.offsetWidth;
      }
      n.dataset.pos = i === active ? 'on' : i === (active + 1) % total ? 'next' : 'prev';
    });
  }

  function updateSelect() {
    var fg = q('.vg-select-fg', viewHost);
    if (!fg) return;
    var c = D.chunks[active];
    var old = q('.vg-marquee', fg);
    var marquee = document.createElement('div');
    marquee.className = 'vg-marquee';
    marquee.setAttribute('aria-hidden', 'true');
    var spans = '';
    for (var k = 0; k < 8; k++) spans += '<span>' + esc(c.giant) + '</span>';
    marquee.innerHTML = '<div class="vg-marquee-inner">' + spans + '</div>';
    if (old) fg.replaceChild(marquee, old); else fg.insertBefore(marquee, fg.firstChild);
    syncPlanets(fg);
    q('.vg-select-card h2', fg).textContent = c.full;
    q('.vg-meta', fg).textContent = 'Chapter ' + c.label + ' \\u00b7 ' + c.dur;
  }

  function buildSelect() {
    var fg = document.createElement('div');
    fg.className = 'vg-select-fg';
    fg.setAttribute('data-vg-fg', '');
    fg.innerHTML =
      '<div class="vg-rocks" aria-hidden="true"><img src="' + esc(D.rocks) + '" alt="" data-parallax="0.8" /></div>' +
      '<div class="vg-select-card"><span class="vg-kicker">' + esc(D.title) + '</span><h2></h2><span class="vg-meta"></span>' +
      '<button type="button" class="vg-btn" id="vg-open">Open chapter</button></div>';
    viewHost.appendChild(fg);
    q('#vg-open', fg).addEventListener('click', function () { go('chunk', active); });
    updateSelect();
  }

  // ------------------------------------------------------------ chunk view
  function buildChunk() {
    var c = D.chunks[active];
    var p = palette(active);
    var tagline = c.full.split(/\\s+/).filter(Boolean).slice(0, 10).map(function (w) {
      return '<span class="vg-mask"><span>' + esc(w) + '</span></span>';
    }).join(' ');
    var art = document.createElement('div');
    art.className = 'vg-art';
    art.setAttribute('aria-hidden', 'true');
    art.innerHTML = '<div class="vg-tagline"><h2>' + tagline + '</h2></div>' + p.art.map(function (l) {
      var s = l.scrub;
      return '<div class="vg-art-layer vg-art-' + l.key + '" data-scrub="' + [s.y, s.x || 0, s.rotate || 0, s.zoom || 1].join(',') + '"><img src="' + esc(l.src) + '" alt="" decoding="async" /></div>';
    }).join('');

    var more = active + 1 < total;
    var page = document.createElement('div');
    page.className = 'vg-page';
    page.setAttribute('data-vg-fg', '');
    page.innerHTML =
      '<section class="vg-hero"><div class="vg-stage"><div class="vg-hero-row"><span>' + esc(c.label) + '</span><span>' + esc(c.dur) + '</span></div>' +
      '<h1 class="vg-hero-title" style="font-size:' + c.titleSize + '">' + esc(c.giant) + '</h1>' +
      '</div></section>' +
      '<div class="vg-gap"></div>' +
      '<section class="vg-info">' + c.layout + '</section>' +
      '<section class="vg-end"><p>' + (more ? 'Up next: ' + esc(D.chunks[active + 1].full) : 'That was the last chapter.') + '</p>' +
      '<button type="button" class="vg-btn vg-next" id="vg-next-cta"><span class="vg-next-bar"></span><span style="position:relative">' + (more ? 'Next chapter' : 'All chapters') + '</span></button></section>';

    viewHost.appendChild(art);
    viewHost.appendChild(page);
    q('#vg-next-cta', page).addEventListener('click', function () {
      if (more) go('chunk', active + 1); else go('select', active);
    });
    var pill = q('.cl-pill', page);
    if (pill) pill.addEventListener('click', function () {
      if (more) go('chunk', active + 1); else go('select', active);
    });
    layoutCleanup = initChapterLayout(page);
    bindChunkMotion(page);
  }

  function bindChunkMotion(page) {
    motion = gsap.context(function () {
      var scrub = { trigger: page, scrub: true };
      function st(extra) { return { trigger: scrub.trigger, scrub: true, start: extra.start, end: extra.end }; }
      gsap.to('.vg-hero-title', { yPercent: -30, ease: 'none', scrollTrigger: st({ start: 'top top', end: '+=100%' }) });
      gsap.fromTo('.vg-tagline .vg-mask > span', { yPercent: 120 }, {
        yPercent: 0, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: '.vg-gap', start: 'top 70%', end: 'center center', scrub: true }
      });
      gsap.to('.vg-tagline', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.vg-info', start: 'top 85%', end: 'top 35%', scrub: true } });
      qa('.vg-art-layer[data-scrub]').forEach(function (el) {
        var v = (el.dataset.scrub || '0').split(',').map(Number);
        gsap.to(el, { yPercent: v[0] || 0, xPercent: v[1] || 0, rotate: v[2] || 0, scale: v[3] || 1, ease: 'none', scrollTrigger: st({ start: 'top top', end: 'bottom bottom' }) });
      });
      ScrollTrigger.create({
        trigger: page, start: 'top top', end: 'bottom bottom',
        onUpdate: function (self) { setFill((active + self.progress) / total); }
      });
    }, viewHost);
    ScrollTrigger.refresh();
  }

  // ------------------------------------------------------------ narration
  function stopHighlight() {
    if (highlightHandler) audio.removeEventListener('timeupdate', highlightHandler);
    highlightHandler = null;
  }

  function trackHighlight() {
    var words = qa('.vg-word', viewHost);
    var weights = words.map(function (w) { return (w.textContent || '').trim().length + 3; });
    var cumulative = [];
    var running = 0;
    weights.forEach(function (w) { running += w; cumulative.push(running); });
    var totalWeight = running || 1;
    var shown = -2;
    highlightHandler = function () {
      if (!audio.duration) return;
      var target = (audio.currentTime / audio.duration) * totalWeight;
      var idx = cumulative.findIndex(function (w) { return w >= target; });
      if (idx === -1) idx = words.length - 1;
      if (idx === shown) return;
      var k;
      if (shown === -2) { for (k = 0; k < words.length; k++) words[k].classList.toggle('on', k <= idx); }
      else if (idx > shown) { for (k = shown + 1; k <= idx; k++) words[k].classList.add('on'); }
      else { for (k = idx + 1; k <= shown; k++) words[k].classList.remove('on'); }
      shown = idx;
    };
    audio.addEventListener('timeupdate', highlightHandler);
  }

  function playNarration() {
    if (!narrationEnabled || narrationPaused) return;
    audio.play().catch(function (err) {
      // Still blocked — ask for the gesture again rather than failing silently.
      if (err && err.name === 'NotAllowedError' && gate) { narrationEnabled = false; gate.classList.remove('hidden'); }
    });
  }

  function startChunkNarration() {
    stopHighlight();
    var c = D.chunks[active];
    var video = q('.cl-fig video', viewHost);
    if (video) { video.currentTime = 0; video.play().catch(function () {}); }
    if (!c.audio) return;
    if (audio.getAttribute('src') !== c.audio) audio.src = c.audio;
    audio.currentTime = 0;
    trackHighlight();
    playNarration();
  }

  function stopNarration() {
    window.clearTimeout(narrationTimer);
    stopHighlight();
    audio.pause();
    var video = q('.cl-fig video', viewHost);
    if (video) video.pause();
  }

  audio.addEventListener('play', function () { music.duck(true); });
  audio.addEventListener('pause', function () { music.duck(false); });
  // Auto-scroll: when the narration ends, open the next chapter. Nothing happens
  // after the last one, when the switch is off, or while narration is paused.
  audio.addEventListener('ended', function () {
    music.duck(false);
    if (view !== 'chunk' || active + 1 >= total) return;
    if (ndAutoOn && narrationEnabled && !narrationPaused) go('chunk', active + 1);
  });

  // ------------------------------------------------------------ view switching
  function teardown() {
    stopNarration();
    if (motion) { motion.revert(); motion = null; }
    if (layoutCleanup) { layoutCleanup(); layoutCleanup = null; }
    while (viewHost.firstChild) viewHost.removeChild(viewHost.firstChild);
    root.style.setProperty('--vg-down', '0');
  }

  function enter() {
    var fg = q('[data-vg-fg]', viewHost);
    var release = window.setTimeout(function () { busy = false; }, 1500);
    if (!fg || reduced) { busy = false; window.clearTimeout(release); return; }
    gsap.fromTo(fg, { opacity: 0, filter: 'blur(16px)', scale: 0.94 }, {
      opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.8, ease: 'power3.out',
      clearProps: 'filter,transform,opacity',
      onComplete: function () { busy = false; window.clearTimeout(release); }
    });
    if (view === 'chunk') {
      gsap.from('.vg-art', { opacity: 0, scale: 1.08, duration: 1.2, ease: 'power3.out', clearProps: 'all' });
      gsap.from('.vg-hero-row > span', { yPercent: 120, duration: 0.8, delay: 0.2, ease: 'power4.out' });
    }
  }

  function render() {
    renderBackdrop();
    if (view === 'select') buildSelect(); else buildChunk();
    updateNav();
    music.setMood(D.chunks[active].mood);
    enter();
    if (view === 'chunk') narrationTimer = window.setTimeout(startChunkNarration, 700);
  }

  function go(toView, toActive, push) {
    if (busy || total === 0) return;
    busy = true;
    stopNarration();
    music.whoosh();
    function commit() {
      viewChangedAt = Date.now();
      teardown();
      view = toView;
      active = toActive;
      window.scrollTo(0, 0);
      if (push !== false) history.pushState(null, '', toView === 'chunk' ? '#/chunk-' + (toActive + 1) : '#/');
      render();
    }
    var fg = q('[data-vg-fg]', viewHost);
    if (!fg || reduced) { commit(); return; }
    gsap.to(fg, { opacity: 0, filter: 'blur(18px)', scale: 1.12, duration: 0.5, ease: 'power3.in', onComplete: commit });
  }

  function select(i) {
    active = ((i % total) + total) % total;
    renderBackdrop();
    updateSelect();
    updateNav();
    music.setMood(D.chunks[active].mood);
  }

  function parseHash() {
    var m = /^#\\/chunk-(\\d+)$/.exec(window.location.hash);
    var idx = m ? Number(m[1]) - 1 : -1;
    return idx >= 0 && idx < total ? { view: 'chunk', index: idx } : { view: 'select', index: 0 };
  }

  window.addEventListener('popstate', function () {
    var next = parseHash();
    busy = false;
    viewChangedAt = Date.now();
    teardown();
    view = next.view;
    if (next.view === 'chunk') active = next.index;
    window.scrollTo(0, 0);
    render();
  });

  // ------------------------------------------------------------ controls
  btnPrev.addEventListener('click', function () { if (view === 'chunk') go('chunk', active - 1); else select(active - 1); });
  btnNext.addEventListener('click', function () {
    if (view === 'select') select(active + 1);
    else if (active + 1 < total) go('chunk', active + 1);
    else go('select', active);
  });
  btnCount.addEventListener('click', function () { if (view === 'chunk') go('select', active); else go('chunk', active); });

  D.chunks.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Chapter ' + (i + 1) + ': ' + c.full);
    b.addEventListener('click', function () { if (view === 'chunk') go('chunk', i); else select(i); });
    segs.appendChild(b);
  });
  if (total < 2) segs.style.display = 'none';

  function step(dir) {
    if (busy) return;
    if (view === 'select') select(active + dir);
    else if (dir === 1) { if (active + 1 < total) go('chunk', active + 1); else go('select', active); }
    else if (active > 0) go('chunk', active - 1);
  }

  var lastWheel = 0;
  window.addEventListener('wheel', function (e) {
    if (view !== 'select' || Math.abs(e.deltaY) <= 10) return;
    var now = Date.now();
    if (now - viewChangedAt < WHEEL_THROTTLE || now - lastWheel < WHEEL_THROTTLE) return;
    lastWheel = now;
    step(e.deltaY > 0 ? 1 : -1);
  }, { passive: true });

  var touchX = null;
  window.addEventListener('touchstart', function (e) { touchX = view === 'select' && e.touches[0] ? e.touches[0].clientX : null; }, { passive: true });
  window.addEventListener('touchend', function (e) {
    var end = e.changedTouches[0] ? e.changedTouches[0].clientX : undefined;
    var start = touchX;
    touchX = null;
    if (start === null || end === undefined) return;
    if (end - start > SWIPE_MIN) step(-1); else if (end - start < -SWIPE_MIN) step(1);
  }, { passive: true });

  window.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT|AUDIO|VIDEO)$/.test(t.tagName)) return;
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Enter' && view === 'select' && !(t && t.tagName === 'BUTTON')) go('chunk', active);
    else if (e.key === 'Escape' && view === 'chunk') go('select', active);
  });

  // Scrolling past the end of a chunk fills the bar on the "next chapter"
  // button, then opens the next chunk (or the chapter list after the last).
  var down = 0, lastDownWheel = 0, downTimer = 0;
  function paintDown() { root.style.setProperty('--vg-down', String(Math.round(down))); }
  window.addEventListener('wheel', function (e) {
    if (view !== 'chunk') return;
    var now = Date.now();
    if (now - lastDownWheel <= 60) return;
    lastDownWheel = now;
    var atBottom = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 6;
    if (atBottom && e.deltaY > 0 && !busy) {
      down = Math.min(100, down + e.deltaY * 0.3);
      paintDown();
      window.clearTimeout(downTimer);
      downTimer = window.setTimeout(function () { down = 0; paintDown(); }, 500);
      if (down >= 100) {
        down = 0;
        if (active + 1 < total) go('chunk', active + 1); else go('select', active);
      }
    } else if (!atBottom && down > 0) { down = 0; paintDown(); }
  }, { passive: true });

  if (finePointer && !reduced) {
    var frame = 0;
    window.addEventListener('mousemove', function (e) {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        qa('.vg-sky.on [data-parallax], [data-vg-fg] [data-parallax]').forEach(function (el) {
          var depth = parseFloat(el.dataset.parallax || '1') || 1;
          gsap.to(el, { x: ((e.clientX - cx) / cx) * -20 * depth, y: ((e.clientY - cy) / cy) * -30 * depth, ease: 'power2.out', duration: 4, overwrite: 'auto' });
        });
      });
    }, { passive: true });
  }

  // ------------------------------------------------------------ sound gate + toggles
  function syncToggles() {
    ndSync(narrationPaused || !narrationEnabled);
    if (musicToggle) {
      var musicOn = music.isStarted() && !music.isMuted();
      musicToggle.setAttribute('data-on', musicOn ? 'true' : 'false');
      q('.vg-music-label', musicToggle).textContent = musicOn ? 'Music: on' : 'Music: off';
    }
  }
  music.onChange(syncToggles);

  function showToggles() {
    if (D.narrated) ndShow();
    if (musicToggle) musicToggle.classList.add('visible');
    syncToggles();
  }

  // Called from inside the tap: starting (muted) and immediately pausing the
  // shared <audio> element while the gesture is live unlocks it for iOS Safari.
  function enableSound() {
    narrationEnabled = true;
    narrationPaused = false;
    music.start();
    var prime = Promise.resolve();
    if (D.narrated) {
      // The element needs a source for the priming play() to count as an unlock.
      if (!audio.getAttribute('src')) {
        var firstNarrated = D.chunks.find(function (c) { return c.audio; });
        if (firstNarrated) audio.src = firstNarrated.audio;
      }
      audio.muted = true;
      var p = audio.play();
      prime = (p && p.then ? p : Promise.resolve()).then(function () { audio.pause(); audio.currentTime = 0; }).catch(function () {}).then(function () { audio.muted = false; });
    }
    if (gate) gate.classList.add('hidden');
    showToggles();
    prime.then(function () { if (view === 'chunk') startChunkNarration(); });
  }

  if (gate) {
    q('#narration-start').addEventListener('click', enableSound);
    q('#narration-skip').addEventListener('click', function () {
      gate.classList.add('hidden');
      narrationPaused = true;
      showToggles();
    });
  }
  if (narrationToggle) {
    narrationToggle.addEventListener('click', function () {
      if (!narrationEnabled) { enableSound(); return; }
      narrationPaused = !narrationPaused;
      syncToggles();
      if (narrationPaused) audio.pause(); else if (view === 'chunk') playNarration();
    });
  }
  if (musicToggle) {
    musicToggle.addEventListener('click', function () {
      if (!music.isStarted()) { music.start(); music.setMuted(false); }
      else music.setMuted(!music.isMuted());
      syncToggles();
    });
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) audio.pause(); });

  // ------------------------------------------------------------ boot
  if (total > 0) {
    var start = parseHash();
    view = start.view;
    active = start.index;
    render();
  }
})();
`;

export function renderVoyage(
  project: Project,
  avatars: Avatar[],
  supabaseUrl: string,
  options: VoyageSiteOptions = {}
): string {
  const total = project.chunks.length;
  const narrated = project.chunks.some((chunk) => Boolean(chunkAudioUrl(supabaseUrl, project.id, chunk)));

  const chunks = project.chunks.map((chunk, index) => {
    const dest = destinationFor(chunk, index, total);
    return {
      palette: index % VOYAGE_PALETTES.length,
      hue: dest.hueShift,
      wheel: Math.round(dest.wheelAngle * 100) / 100,
      label: dest.chapterLabel,
      giant: dest.giantTitle,
      titleSize: voyageTitleFontSize(dest.giantTitle),
      full: dest.fullTitle,
      dur: dest.duration,
      mood: dest.mood,
      audio: chunkAudioUrl(supabaseUrl, project.id, chunk),
      layout: chapterLayoutHtml({
        theme: CHAPTER_THEMES.voyage,
        index,
        total,
        eyebrow: `Chapter ${String(index + 1).padStart(2, "0")}`,
        title: dest.fullTitle,
        textHtml: `<p class="vg-text"${chunk.audioUrl ? ' data-audio=""' : ""}>${chunk.narrativeText
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => `<span class="vg-word">${escapeHtml(w)}</span>`)
          .join(" ")}</p>`,
        media: [
          ...(chunk.imageUrl ? [{ kind: "scene" as const, html: chapterImageHtml(chunk.imageUrl) }] : []),
          ...(avatarMarkup(chunk, index, avatars) ? [{ kind: "avatar" as const, html: avatarMarkup(chunk, index, avatars) }] : []),
        ],
        lists: chapterLists(
          project.chunks.map((c) => ({ title: c.title, text: c.narrativeText })),
          index
        ),
        nextLabel: index + 1 < total ? "Next chapter" : "All chapters",
      }),
    };
  });

  const data = {
    title: project.title,
    narrated,
    rocks: bundlePath(`${VOYAGE_ASSET_ROOT}/rocks.svg`),
    music: Object.fromEntries(Object.entries(options.customMusic ?? {}).map(([mood, path]) => [mood, bundlePath(path)])),
    palettes: VOYAGE_PALETTES.map((p) => ({
      gradient: p.gradient,
      accent: p.accent,
      overlay: p.overlay,
      wheelPlanet: bundlePath(p.wheelPlanet),
      sky: p.sky.map((l) => ({ ...l, src: bundlePath(l.src) })),
      art: p.art.map((l) => ({ ...l, src: bundlePath(l.src) })),
    })),
    chunks,
  };

  const gateCopy = narrated
    ? "This story is narrated, with ambient music. Each chapter plays automatically as you open it."
    : "This story has ambient music. Tap to start.";

  const body = `
<div class="vg-root" id="vg-root">
  <div class="vg-backdrop" id="vg-backdrop" aria-hidden="true"></div>
  <div id="vg-view"></div>
  <div class="vg-segs" id="vg-segs" role="group" aria-label="Chapters"></div>
  <nav class="vg-nav" aria-label="Story navigation">
    <div class="vg-nav-edge"></div>
    <div class="vg-nav-frame"><div class="vg-nav-fill" id="vg-nav-fill"></div></div>
    <div class="vg-nav-row">
      <button type="button" class="prev" id="vg-prev"></button>
      <button type="button" class="count" id="vg-count"></button>
      <button type="button" class="next" id="vg-next-nav"></button>
    </div>
  </nav>
  <audio id="vg-audio" preload="none"></audio>
  <div id="narration-gate" role="dialog" aria-label="Start sound">
    <div class="gate-card">
      <p>${escapeHtml(gateCopy)}</p>
      <button type="button" id="narration-start">Tap to start</button>
      <button type="button" id="narration-skip">Continue without sound</button>
    </div>
  </div>
  ${narrationDockMarkup({ variant: "voyage" })}
  <button type="button" id="vg-music-toggle" class="vg-music" data-on="true"><span class="vg-music-icon" aria-hidden="true">${VOYAGE_MUSIC_ICON}</span><span class="vg-music-label">Music: on</span></button>
</div>
<script type="application/json" id="vg-data">${inlineJson(data)}</script>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(project.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="${FONTS_HREF}" />
<style>${VOYAGE_CSS}${CHAPTER_LAYOUT_CSS}${NARRATION_DOCK_CSS}${GATE_CSS}</style>
</head>
<body>
${body}
<script src="${GSAP_CDN}"></script>
<script src="${SCROLLTRIGGER_CDN}"></script>
<script>var initChapterLayout = ${CHAPTER_LAYOUT_FN};</script>
<script>${VOYAGE_MUSIC_JS}${NARRATION_DOCK_JS}${VOYAGE_INIT_JS}</script>
</body>
</html>`;
}
