import { MODELS } from '../audio-core.js';
import { getSettings, manifestInfo, scriptStatus, voiceName, voiceById } from '../tts.js';
import { esc, playButton } from '../ui.js';
import { isSheetUrl, pendingCount, studentLink } from '../sheets.js';

export function renderSettings() {
  const s = getSettings();
  const m = manifestInfo();
  const st = scriptStatus();
  const engineText =
    s.engine === 'browser'
      ? 'Browser voice (ElevenLabs is off).'
      : s.apiKey
        ? 'ElevenLabs with your personal key.'
        : st.status === 'ok'
          ? `ElevenLabs through the Google Script${st.sheet ? ` of “${esc(st.sheet)}”` : ''}.`
          : st.status === 'no-tts'
            ? 'The Google Script is connected but has no ElevenLabs key yet (Connected Speech → Guardar API key de ElevenLabs).'
            : st.status === 'offline'
              ? `Can't reach the Google Script: ${esc(st.error || 'offline')}.`
              : 'Checking the Google Script…';
  return `<header class="topic-head">
      <div class="eyebrow">Settings</div>
      <h1>Voice &amp; <em>results</em></h1>
      <p class="lede">Pick the ElevenLabs voices, connect the teacher's Google Sheet, and fine-tune how audio is generated.</p>
    </header>

    <div class="settings-stack">
      <section class="card form">
        <h2>Voice engine</h2>
        <p class="muted" style="margin:0">${engineText}</p>
        <div class="row">
          <div class="field" style="flex:1 1 180px"><label>Main voice</label><div class="vp-tab" aria-hidden="true" style="pointer-events:none"><span>${esc(voiceName('A'))}</span></div></div>
          <div class="field" style="flex:1 1 180px"><label>Second speaker</label><div class="vp-tab" aria-hidden="true" style="pointer-events:none"><span>${esc(voiceName('B'))}</span></div></div>
        </div>
        <div class="row">
          <button type="button" class="btn primary" data-open-voices>Choose voices</button>
          ${playButton('Did you eat your lunch yet?', { label: 'Main voice' })}
          ${playButton("Who's there?", { voice: 'B', label: 'Second speaker' })}
        </div>
        <div class="field">
          <label for="model">ElevenLabs model</label>
          <select id="model" data-model>${MODELS.map((o) => `<option value="${o.id}"${o.id === s.model ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>
          <div class="hint">Multilingual v2 sounds best. Flash and Turbo cost half the credits.</div>
        </div>
      </section>

      ${sheetForm(s)}

      <details class="card">
        <summary>Your own ElevenLabs key <span class="muted" style="font-size:1rem">(optional)</span></summary>
        <form class="form" id="settings-form" autocomplete="off">
          <p class="muted" style="margin:0">Normally the Google Script generates the voices and keeps the key private. Add a key
            here only to use your own ElevenLabs account from this browser.</p>
          <div class="field">
            <label for="api-key">ElevenLabs API key</label>
            <div class="row">
              <input id="api-key" name="apiKey" type="password" value="${esc(s.apiKey)}" placeholder="sk_…" style="flex:1 1 240px" spellcheck="false" autocomplete="off">
              <button type="button" class="btn" data-toggle-key>Show</button>
            </div>
            <div class="hint">Saved only in this browser and sent only to api.elevenlabs.io. Don't use it on a shared computer.</div>
          </div>
          <div class="row">
            <button type="submit" class="btn primary">Save</button>
            <button type="button" class="btn" data-check-credits>Check credits</button>
            <button type="button" class="btn" data-clear-cache>Clear audio cache</button>
          </div>
          <div id="credits-out"></div>
        </form>
      </details>

      <details class="card">
        <summary>Pre-generated audio <span class="muted" style="font-size:1rem">(optional)</span></summary>
        ${
          m.count
            ? `<dl class="kv"><dt>Clips</dt><dd>${m.count}</dd><dt>Model</dt><dd>${esc(m.model || '—')}</dd>
               <dt>Voices</dt><dd>${esc(m.voices.map((id) => voiceById(id)?.name || id).join(', ') || '—')}</dd>
               <dt>Generated</dt><dd>${esc(m.generatedAt ? new Date(m.generatedAt).toLocaleString() : '—')}</dd></dl>`
            : `<p class="muted" style="margin:0">Not needed: the Google Script generates each clip the first time and keeps it in
               Drive. If you want static mp3 files anyway, run <code>npm run audio</code>.</p>`
        }
      </details>
    </div>`;
}

export function renderCredits(sub) {
  const out = document.getElementById('credits-out');
  if (!out) return;
  const used = sub.character_count ?? 0;
  const limit = sub.character_limit ?? 0;
  const pct = limit ? Math.min(100, (100 * used) / limit) : 0;
  const reset = sub.next_character_count_reset_unix ? new Date(sub.next_character_count_reset_unix * 1000).toLocaleDateString() : '—';
  out.innerHTML = `<div style="margin-top:6px"><b>${esc(sub.tier || 'plan')}</b>: ${used.toLocaleString()} of ${limit.toLocaleString()} credits used
    <div class="meter"><span style="width:${pct}%"></span></div>
    <small class="muted">${(limit - used).toLocaleString()} left · resets ${esc(reset)}</small></div>`;
}

function sheetForm(s) {
  const connected = isSheetUrl(s.sheetUrl);
  const pending = pendingCount();
  return `<form class="card form" id="sheet-form" autocomplete="off">
      <h2>Results → Google Sheets</h2>
      <p class="muted" style="margin:0">Finished exercises (and recordings you choose to send) go to your teacher's Google
        Sheet. Teachers: set up the sheet with <code>google-apps-script/Code.gs</code> from the repository.</p>
      <div class="row">
        <div class="field" style="flex:1 1 200px"><label for="student">Your name</label>
          <input id="student" name="student" type="text" maxlength="80" value="${esc(s.student)}"></div>
        <div class="field" style="flex:0 1 160px"><label for="group">Class / group</label>
          <input id="group" name="group" type="text" maxlength="40" value="${esc(s.group)}"></div>
      </div>
      <div class="field">
        <label for="sheet-url">Google Script URL (results + voice engine)</label>
        <input id="sheet-url" name="sheetUrl" type="text" spellcheck="false" value="${esc(s.sheetUrl)}"
          placeholder="https://script.google.com/macros/s/…/exec">
        <div class="hint">${connected ? '✓ Connected. ' : ''}Students: your teacher gives you this (or a link that fills it in).</div>
      </div>
      <div class="row">
        <button type="submit" class="btn primary">Save</button>
        <button type="button" class="btn" data-test-sheet>Test connection</button>
        ${pending ? `<button type="button" class="btn" data-flush-sheet>Send pending (${pending})</button>` : ''}
      </div>
      ${
        connected
          ? `<div class="field"><label for="student-link">Student link</label>
          <div class="row"><input id="student-link" type="text" readonly value="${esc(studentLink(s.sheetUrl))}" style="flex:1 1 240px">
            <button type="button" class="btn" data-copy-link>Copy</button></div>
          <div class="hint">Share it with your students: it opens the exercises already connected to your sheet.</div></div>`
          : ''
      }
    </form>`;
}
