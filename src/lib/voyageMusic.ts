import type { VoyageMood } from "@/lib/voyage";

/**
 * Ambient music for the Voyage template, generated live with the Web Audio API
 * (no audio files, so nothing to license or download). Three beds — calm, tense,
 * bright — crossfade as chapters change, the whole mix ducks while narration is
 * speaking, and a soft whoosh marks chapter transitions.
 *
 * The engine is plain ES5-style JavaScript kept in one string so the exact same
 * code runs in the in-app preview (evaluated by `createVoyageMusic` below) and in
 * the published static site (embedded by publish/voyageSite.ts). If a mood has a
 * file in `files`, that audio file is looped instead of the generated bed.
 */
export const VOYAGE_MUSIC_JS = `
function createVoyageMusic(opts) {
  opts = opts || {};
  var files = opts.files || {};
  var KEY = 'voyageMusicMuted';
  var BASE = 0.35;   // master level
  var DUCK = 0.34;   // multiplier while narration speaks (about 0.12 absolute)
  var FADE = 1.5;    // seconds, mood crossfade
  var ctx = null, master = null, duckGain = null, noise = null;
  var current = null, started = false, ducked = false, wanted = 'calm';
  var muted = false;
  var listeners = [];
  try { muted = window.localStorage.getItem(KEY) === '1'; } catch (e) {}

  var CHORDS = {
    calm:   { notes: [110.0, 164.81, 220.0, 246.94],  type: 'sine',     cutoff: 1100, lfo: 0.07 },
    tense:  { notes: [73.42, 77.78, 110.0, 155.56],   type: 'sawtooth', cutoff: 420,  lfo: 0.23 },
    bright: { notes: [130.81, 164.81, 196.0, 246.94], type: 'triangle', cutoff: 1800, lfo: 0.11 }
  };
  var PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0];

  function ensure() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : BASE;
    duckGain = ctx.createGain();
    duckGain.gain.value = ducked ? DUCK : 1;
    duckGain.connect(master);
    master.connect(ctx.destination);
    return true;
  }

  function buildSynthBed(mood) {
    var chord = CHORDS[mood];
    var out = ctx.createGain();
    out.gain.value = 0;
    out.connect(duckGain);
    var swell = ctx.createGain();
    swell.gain.value = 1;
    swell.connect(out);
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = chord.cutoff;
    filter.Q.value = 0.7;
    filter.connect(swell);

    var nodes = [];
    chord.notes.forEach(function (freq, i) {
      [-6, 6].forEach(function (detune) {
        var osc = ctx.createOscillator();
        osc.type = chord.type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        var g = ctx.createGain();
        g.gain.value = (0.16 / chord.notes.length) * (i === 0 ? 1.4 : 1);
        osc.connect(g);
        g.connect(filter);
        osc.start();
        nodes.push(osc);
      });
    });

    // Slow filter sweep so the pad breathes.
    var lfo = ctx.createOscillator();
    lfo.frequency.value = chord.lfo;
    var lfoDepth = ctx.createGain();
    lfoDepth.gain.value = chord.cutoff * 0.35;
    lfo.connect(lfoDepth);
    lfoDepth.connect(filter.frequency);
    lfo.start();
    nodes.push(lfo);

    var stopped = false;
    var timer = 0;

    if (mood === 'tense') {
      // A slow pulse on the whole drone.
      var pulse = ctx.createOscillator();
      pulse.frequency.value = 0.6;
      var pulseDepth = ctx.createGain();
      pulseDepth.gain.value = 0.22;
      swell.gain.value = 0.78;
      pulse.connect(pulseDepth);
      pulseDepth.connect(swell.gain);
      pulse.start();
      nodes.push(pulse);
    }

    if (mood === 'bright') {
      // Sparse pentatonic plucks with an echo.
      var echo = ctx.createDelay(1);
      echo.delayTime.value = 0.38;
      var feedback = ctx.createGain();
      feedback.gain.value = 0.35;
      echo.connect(feedback);
      feedback.connect(echo);
      echo.connect(out);
      var pluck = function () {
        if (stopped) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
        var g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.07, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0008, now + 1.6);
        osc.connect(g);
        g.connect(out);
        g.connect(echo);
        osc.start(now);
        osc.stop(now + 1.7);
        timer = window.setTimeout(pluck, 1400 + Math.random() * 2600);
      };
      timer = window.setTimeout(pluck, 800);
    }

    return {
      gain: out,
      stop: function () {
        stopped = true;
        window.clearTimeout(timer);
        nodes.forEach(function (n) { try { n.stop(); } catch (e) {} });
        try { out.disconnect(); } catch (e) {}
      }
    };
  }

  function buildFileBed(url) {
    var el = new Audio(url);
    el.loop = true;
    el.crossOrigin = 'anonymous';
    var out = ctx.createGain();
    out.gain.value = 0;
    ctx.createMediaElementSource(el).connect(out);
    out.connect(duckGain);
    el.play().catch(function () {});
    return {
      gain: out,
      stop: function () {
        el.pause();
        try { out.disconnect(); } catch (e) {}
      }
    };
  }

  function setMood(mood) {
    wanted = mood;
    if (!started || !ctx) return;
    if (current && current.mood === mood) return;
    var now = ctx.currentTime;
    var next = files[mood] ? buildFileBed(files[mood]) : buildSynthBed(mood);
    next.mood = mood;
    next.gain.gain.setValueAtTime(0, now);
    next.gain.gain.linearRampToValueAtTime(1, now + FADE);
    if (current) {
      var old = current;
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setValueAtTime(old.gain.gain.value, now);
      old.gain.gain.linearRampToValueAtTime(0, now + FADE);
      window.setTimeout(old.stop, FADE * 1000 + 200);
    }
    current = next;
  }

  function notify() { listeners.forEach(function (fn) { fn(muted, started); }); }

  function onVisibility() {
    if (!ctx || !started) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  }
  document.addEventListener('visibilitychange', onVisibility);

  return {
    /** Must be called from a user gesture (tap, click, key). */
    start: function () {
      if (!ensure()) return false;
      ctx.resume();
      started = true;
      setMood(wanted);
      notify();
      return true;
    },
    isStarted: function () { return started; },
    setMood: setMood,
    duck: function (flag) {
      ducked = flag;
      if (ctx) duckGain.gain.setTargetAtTime(flag ? DUCK : 1, ctx.currentTime, 0.15);
    },
    whoosh: function () {
      if (!ctx || !started || muted) return;
      var now = ctx.currentTime;
      if (!noise) {
        noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.8), ctx.sampleRate);
        var data = noise.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      var src = ctx.createBufferSource();
      src.buffer = noise;
      var band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.value = 0.9;
      band.frequency.setValueAtTime(220, now);
      band.frequency.exponentialRampToValueAtTime(2400, now + 0.6);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.22, now + 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      src.connect(band);
      band.connect(g);
      g.connect(duckGain);
      src.start(now);
      src.stop(now + 0.8);
    },
    setMuted: function (flag) {
      muted = flag;
      try { window.localStorage.setItem(KEY, flag ? '1' : '0'); } catch (e) {}
      if (ctx) master.gain.setTargetAtTime(flag ? 0 : BASE, ctx.currentTime, 0.12);
      notify();
    },
    isMuted: function () { return muted; },
    onChange: function (fn) { listeners.push(fn); },
    destroy: function () {
      document.removeEventListener('visibilitychange', onVisibility);
      if (current) current.stop();
      current = null;
      started = false;
      if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
    }
  };
}
`;

export interface VoyageMusic {
  start(): boolean;
  isStarted(): boolean;
  setMood(mood: VoyageMood): void;
  duck(flag: boolean): void;
  whoosh(): void;
  setMuted(flag: boolean): void;
  isMuted(): boolean;
  onChange(fn: (muted: boolean, started: boolean) => void): void;
  destroy(): void;
}

/** Evaluates the shared engine source in the browser (preview only — the
 *  published site embeds the same string directly). */
export function createVoyageMusic(files?: Partial<Record<VoyageMood, string>>): VoyageMusic {
  const factory = new Function(`${VOYAGE_MUSIC_JS}; return createVoyageMusic;`)() as (opts: object) => VoyageMusic;
  return factory({ files });
}
