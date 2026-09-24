import { topicGroups, topicById, SOURCES } from './content.js';
import { exerciseSets } from './exercises-data.js';
import {
  play,
  stop,
  loadManifest,
  onAudioEvent,
  engineSummary,
  getSettings,
  saveSettings,
  fetchVoices,
  fetchSubscription,
  clearAudioCache,
} from './tts.js';
import { handleRecorderClick } from './recorder.js';
import { esc, toast } from './ui.js';
import { renderHome } from './views/home.js';
import { renderTopic } from './views/topic.js';
import { renderPracticeList, renderPracticeSet, handlePracticeClick, handlePracticeSubmit } from './views/practice.js';
import { renderLab, renderLabResult } from './views/lab.js';
import { renderSettings, renderVoices, renderCredits } from './views/settings.js';

const main = document.getElementById('main');
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('scrim');
const menuBtn = document.getElementById('menu-btn');
const engineEl = document.getElementById('engine');
const stopBtn = document.getElementById('stop-btn');

// ─── navigation ─────────────────────────────────────────────────────────────

function renderSidebar(route) {
  const link = (href, label, extra = '') =>
    `<a class="nav-link" href="${href}"${route === href ? ' aria-current="page"' : ''}>${esc(label)}${extra}</a>`;
  sidebar.innerHTML = `
    <div class="nav-group">${link('#/', 'Overview')}</div>
    ${topicGroups
      .map(
        (g) => `<div class="nav-group">
          <div class="nav-title">${esc(g.title)}<small>${esc(SOURCES[g.source].short)}</small></div>
          ${g.ids.map((id) => link(`#/topic/${id}`, topicById(id).title)).join('')}
        </div>`,
      )
      .join('')}
    <div class="nav-group">
      <div class="nav-title">Practice</div>
      ${link('#/practice', 'Exercises', `<span class="num">${exerciseSets.length}</span>`)}
      ${link('#/lab', 'Connected Speech Lab')}
    </div>
    <div class="nav-group">${link('#/settings', 'Settings & ElevenLabs')}</div>`;
}

function setMenu(open) {
  sidebar.classList.toggle('open', open);
  scrim.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
}
menuBtn.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
scrim.addEventListener('click', () => setMenu(false));

function route() {
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  stop();
  let html = null;
  let active = hash;
  let title = 'Connected Speech Lab';

  if (!parts.length) {
    html = renderHome();
    active = '#/';
  } else if (parts[0] === 'topic') {
    html = renderTopic(parts[1]);
    if (html) title = `${topicById(parts[1]).title} · Connected Speech Lab`;
  } else if (parts[0] === 'practice') {
    html = parts[1] ? renderPracticeSet(parts[1]) : renderPracticeList();
    active = '#/practice';
    title = 'Practice · Connected Speech Lab';
  } else if (parts[0] === 'lab') {
    html = renderLab();
    title = 'Lab · Connected Speech Lab';
  } else if (parts[0] === 'settings') {
    html = renderSettings();
    title = 'Settings · Connected Speech Lab';
  }

  if (html == null) {
    html = `<h1>Page not found</h1><p><a href="#/">Back to the overview</a></p>`;
  }
  main.innerHTML = html;
  document.title = title;
  renderSidebar(active);
  setMenu(false);
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });

  if (parts[0] === 'lab') {
    const input = document.getElementById('lab-input');
    renderLabResult(input.value);
  }
}

window.addEventListener('hashchange', route);

// ─── audio state in the UI ──────────────────────────────────────────────────

let activeButton = null;

function refreshEngine() {
  const summary = engineSummary();
  engineEl.innerHTML = `<span class="engine-long">Audio: ${esc(summary)}</span><span class="engine-short">Audio</span>`;
  engineEl.setAttribute('aria-label', `Audio: ${summary}. Open settings`);
  engineEl.dataset.level = summary.startsWith('ElevenLabs') ? 'eleven' : 'browser';
}

function clearPlaying() {
  document.querySelectorAll('.is-playing, .is-loading').forEach((el) => el.classList.remove('is-playing', 'is-loading'));
  engineEl.classList.remove('is-playing');
  stopBtn.hidden = true;
}

onAudioEvent((e) => {
  if (e.type === 'loading') activeButton?.classList.add('is-loading');
  if (e.type === 'play') {
    activeButton?.classList.remove('is-loading');
    activeButton?.classList.add('is-playing');
    activeButton?.closest('.ex, .dlg-line')?.classList.add('is-playing');
    engineEl.classList.add('is-playing');
    engineEl.title = `Playing from: ${e.source}`;
    stopBtn.hidden = false;
  }
  if (e.type === 'end' || e.type === 'stop') clearPlaying();
  if (e.type === 'error') toast(e.message);
  if (e.type === 'settings') refreshEngine();
});

stopBtn.addEventListener('click', () => stop());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    stop();
    setMenu(false);
  }
});

async function playDialogue(container) {
  const buttons = [...container.querySelectorAll('.dlg-line [data-play]')];
  stop();
  for (const btn of buttons) {
    activeButton = btn;
    const token = Symbol('line');
    playDialogue.current = token;
    await play(btn.dataset.text, { mode: btn.dataset.mode, voice: btn.dataset.voice });
    if (playDialogue.current !== token || !document.body.contains(btn)) return;
    await new Promise((r) => setTimeout(r, 250));
    if (playDialogue.current !== token) return;
  }
}

// ─── delegated events ───────────────────────────────────────────────────────

document.addEventListener('click', async (e) => {
  const t = e.target;
  if (!(t instanceof Element)) return;

  const playBtn = t.closest('[data-play]');
  if (playBtn) {
    playDialogue.current = null;
    if (playBtn.classList.contains('is-playing')) {
      stop();
      return;
    }
    activeButton = playBtn;
    play(playBtn.dataset.text, { mode: playBtn.dataset.mode, voice: playBtn.dataset.voice });
    return;
  }

  const dlg = t.closest('[data-play-dialogue]');
  if (dlg) {
    playDialogue(document.getElementById(dlg.dataset.playDialogue));
    return;
  }

  if (handleRecorderClick(t)) return;

  const sample = t.closest('[data-sample]');
  if (sample) {
    const input = document.getElementById('lab-input');
    input.value = sample.dataset.sample;
    renderLabResult(input.value);
    return;
  }

  if (main.querySelector('[data-scorebar]')) {
    const r = handlePracticeClick(t, main);
    if (r === 'rerender') route();
    if (r) return;
  }

  // settings page
  if (t.closest('[data-toggle-key]')) {
    const input = document.getElementById('api-key');
    input.type = input.type === 'password' ? 'text' : 'password';
    t.closest('[data-toggle-key]').textContent = input.type === 'password' ? 'Show' : 'Hide';
    return;
  }
  if (t.closest('[data-load-voices]')) {
    const key = document.getElementById('api-key').value.trim() || getSettings().apiKey;
    if (!key) return toast('Enter your ElevenLabs API key first.');
    try {
      renderVoices(await fetchVoices(key));
    } catch (err) {
      toast(err.message);
    }
    return;
  }
  if (t.closest('[data-check-credits]')) {
    const key = document.getElementById('api-key').value.trim() || getSettings().apiKey;
    if (!key) return toast('Enter your ElevenLabs API key first.');
    try {
      renderCredits(await fetchSubscription(key));
    } catch (err) {
      toast(err.message);
    }
    return;
  }
  if (t.closest('[data-clear-cache]')) {
    await clearAudioCache();
    toast('Cached live audio cleared.');
    return;
  }
  const use = t.closest('[data-use-voice]');
  if (use) {
    document.getElementById(use.dataset.slot === 'B' ? 'voiceB' : 'voiceA').value = use.dataset.useVoice;
    toast(`Voice ${use.dataset.slot} set — press Save.`);
  }
});

document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.id === 'settings-form') {
    e.preventDefault();
    const data = new FormData(form);
    saveSettings({
      apiKey: String(data.get('apiKey') || '').trim(),
      model: String(data.get('model')),
      voiceA: String(data.get('voiceA') || '').trim() || undefined,
      voiceB: String(data.get('voiceB') || '').trim() || undefined,
      preferLive: data.get('preferLive') === 'on',
    });
    toast('Settings saved.');
    return;
  }
  if (form.matches('[data-dict-form]')) {
    e.preventDefault();
    handlePracticeSubmit(form, main);
  }
});

let labTimer;
document.addEventListener('input', (e) => {
  if (e.target.id === 'lab-input') {
    clearTimeout(labTimer);
    labTimer = setTimeout(() => renderLabResult(e.target.value), 250);
  }
});

// ─── start ──────────────────────────────────────────────────────────────────

refreshEngine();
route();
loadManifest().then(refreshEngine);
