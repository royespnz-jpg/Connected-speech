// Audio engine. For each request it tries, in order:
//   1. a pre-generated ElevenLabs clip listed in audio/manifest.json
//   2. live ElevenLabs TTS with the key saved in this browser (cached)
//   3. the browser's own speech synthesis
import {
  API_BASE,
  DEFAULT_MODEL,
  DEFAULT_VOICES,
  MODES,
  audioKey,
  ttsRequestBody,
  ttsUrl,
  words,
} from './audio-core.js';

const SETTINGS_KEY = 'cs.settings.v1';
const CACHE_NAME = 'cs-tts-v1';

const state = {
  manifest: { items: {} },
  memory: new Map(), // cache key → object URL
  audio: null,
  token: 0,
  listeners: new Set(),
};

// ─── settings ───────────────────────────────────────────────────────────────

export function getSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    /* storage unavailable */
  }
  return {
    apiKey: '',
    model: DEFAULT_MODEL,
    voiceA: DEFAULT_VOICES.A,
    voiceB: DEFAULT_VOICES.B,
    preferLive: false,
    ...saved,
  };
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  emit({ type: 'settings' });
  return next;
}

// ─── events (so the UI can show what is playing and from where) ─────────────

export function onAudioEvent(fn) {
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}

function emit(event) {
  for (const fn of state.listeners) fn(event);
}

// ─── manifest ───────────────────────────────────────────────────────────────

export async function loadManifest() {
  try {
    const res = await fetch('audio/manifest.json', { cache: 'no-cache' });
    if (res.ok) state.manifest = await res.json();
  } catch {
    /* no pre-generated audio */
  }
  state.manifest.items ||= {};
  return state.manifest;
}

export function manifestInfo() {
  return {
    count: Object.keys(state.manifest.items || {}).length,
    model: state.manifest.model,
    voices: state.manifest.voices,
    generatedAt: state.manifest.generatedAt,
  };
}

export function hasPregenerated(text, mode = 'natural', voice = 'A') {
  return Boolean(state.manifest.items?.[audioKey(text, mode, voice)]);
}

export function engineSummary() {
  const s = getSettings();
  const { count } = manifestInfo();
  if (s.apiKey && s.preferLive) return 'ElevenLabs (live)';
  if (count && s.apiKey) return 'ElevenLabs (pre-generated + live)';
  if (count) return 'ElevenLabs (pre-generated) + browser voice';
  if (s.apiKey) return 'ElevenLabs (live)';
  return 'Browser voice — add an ElevenLabs key in Settings';
}

// ─── playback ───────────────────────────────────────────────────────────────

export function stop() {
  state.token++;
  if (state.audio) {
    state.audio.pause();
    state.audio = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  emit({ type: 'stop' });
}

// Resolves when playback finishes (or is stopped).
export async function play(text, { mode = 'natural', voice = 'A' } = {}) {
  stop();
  const token = state.token;
  const settings = getSettings();
  const key = audioKey(text, mode, voice);
  const pre = state.manifest.items?.[key];

  if (pre && !(settings.preferLive && settings.apiKey)) {
    return playUrl(pre, token, 'pre-generated');
  }
  if (settings.apiKey) {
    try {
      emit({ type: 'loading', text, mode });
      const url = await liveUrl(text, mode, voice, settings);
      if (token !== state.token) return;
      return playUrl(url, token, 'ElevenLabs');
    } catch (err) {
      emit({ type: 'error', message: err.message });
      if (pre) return playUrl(pre, token, 'pre-generated');
    }
  }
  if (token !== state.token) return;
  return speakFallback(text, mode, voice, token);
}

function playUrl(url, token, source) {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    state.audio = audio;
    const done = () => {
      if (state.audio === audio) state.audio = null;
      emit({ type: 'end' });
      resolve();
    };
    audio.addEventListener('ended', done);
    audio.addEventListener('error', () => {
      emit({ type: 'error', message: 'Could not play audio file.' });
      done();
    });
    audio
      .play()
      .then(() => token === state.token && emit({ type: 'play', source }))
      .catch(done);
  });
}

async function liveUrl(text, mode, voice, settings) {
  const voiceId = voice === 'B' ? settings.voiceB : settings.voiceA;
  const cacheKey = `${voiceId}|${settings.model}|${audioKey(text, mode, voice)}`;
  if (state.memory.has(cacheKey)) return state.memory.get(cacheKey);

  const cacheReq = new Request(`https://tts-cache.invalid/${encodeURIComponent(cacheKey)}`);
  let blob = null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(cacheReq);
    if (hit) blob = await hit.blob();
  } catch {
    /* Cache API unavailable */
  }

  if (!blob) {
    const res = await fetch(ttsUrl(voiceId), {
      method: 'POST',
      headers: { 'xi-api-key': settings.apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(ttsRequestBody(text, mode, settings.model)),
    });
    if (!res.ok) throw new Error(await describeError(res));
    blob = await res.blob();
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(cacheReq, new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } }));
    } catch {
      /* Cache API unavailable */
    }
  }
  const url = URL.createObjectURL(blob);
  state.memory.set(cacheKey, url);
  return url;
}

async function describeError(res) {
  let detail = '';
  try {
    const body = await res.json();
    detail = body?.detail?.message || body?.detail?.status || (typeof body?.detail === 'string' ? body.detail : '');
  } catch {
    /* not JSON */
  }
  if (res.status === 401) return `ElevenLabs rejected the API key. ${detail}`.trim();
  if (res.status === 429) return `ElevenLabs rate limit or quota reached. ${detail}`.trim();
  return `ElevenLabs error ${res.status}. ${detail}`.trim();
}

// ─── browser speech fallback ────────────────────────────────────────────────

let browserVoices = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const load = () => (browserVoices = speechSynthesis.getVoices());
  load();
  speechSynthesis.addEventListener?.('voiceschanged', load);
}

function pickBrowserVoice(voice) {
  const us = browserVoices.filter((v) => /en[-_]US/i.test(v.lang));
  const pool = us.length ? us : browserVoices.filter((v) => /^en/i.test(v.lang));
  if (!pool.length) return null;
  return pool[voice === 'B' && pool.length > 1 ? 1 : 0];
}

function speakFallback(text, mode, voice, token) {
  if (!('speechSynthesis' in window)) {
    emit({ type: 'error', message: 'No audio available: add an ElevenLabs key in Settings.' });
    return Promise.resolve();
  }
  const chunks = mode === 'words' ? words(text) : [text];
  const rate = mode === 'slow' ? 0.7 : mode === 'words' ? 0.85 : 1;
  const v = pickBrowserVoice(voice);
  emit({ type: 'play', source: 'browser voice' });
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (token !== state.token || i >= chunks.length) {
        emit({ type: 'end' });
        return resolve();
      }
      const u = new SpeechSynthesisUtterance(chunks[i++]);
      u.lang = 'en-US';
      u.rate = rate;
      if (v) u.voice = v;
      u.onend = () => setTimeout(next, mode === 'words' ? 250 : 0);
      u.onerror = () => next();
      speechSynthesis.speak(u);
    };
    next();
  });
}

// ─── account helpers for the Settings page ──────────────────────────────────

async function api(path, apiKey) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) throw new Error(await describeError(res));
  return res.json();
}

export async function fetchVoices(apiKey) {
  const data = await api('/voices', apiKey);
  return (data.voices || []).map((v) => ({
    id: v.voice_id,
    name: v.name,
    accent: v.labels?.accent || '',
    gender: v.labels?.gender || '',
    category: v.category || '',
  }));
}

export async function fetchSubscription(apiKey) {
  return api('/user/subscription', apiKey);
}

export async function clearAudioCache() {
  for (const url of state.memory.values()) URL.revokeObjectURL(url);
  state.memory.clear();
  try {
    await caches.delete(CACHE_NAME);
  } catch {
    /* Cache API unavailable */
  }
}

export { MODES };
