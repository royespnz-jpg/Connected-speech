import { MODELS, DEFAULT_VOICES } from '../audio-core.js';
import { getSettings, manifestInfo } from '../tts.js';
import { esc, playButton } from '../ui.js';
import { isSheetUrl, pendingCount, studentLink } from '../sheets.js';

export function renderSettings() {
  const s = getSettings();
  const m = manifestInfo();
  return `<header class="topic-head">
      <div class="eyebrow">Settings</div>
      <h1>Results &amp; audio</h1>
      <p class="lede">Connect a Google Sheet to collect results, and choose where the audio comes from: pre-generated
        ElevenLabs clips, live ElevenLabs with your key, or your browser's built-in voice.</p>
    </header>

    ${sheetForm(s)}

    <section class="card" style="margin-bottom:18px">
      <h2>Pre-generated audio</h2>
      ${
        m.count
          ? `<dl class="kv"><dt>Clips</dt><dd>${m.count}</dd><dt>Model</dt><dd>${esc(m.model || '—')}</dd>
             <dt>Voices</dt><dd class="ipa">${esc(Object.values(m.voices || {}).join(', ') || '—')}</dd>
             <dt>Generated</dt><dd>${esc(m.generatedAt ? new Date(m.generatedAt).toLocaleString() : '—')}</dd></dl>`
          : `<p class="muted">None yet. Run <code>npm run audio</code> locally, or the “Generate audio (ElevenLabs)” GitHub
             Action, to create the clips once and serve them to everybody without exposing a key.</p>`
      }
    </section>

    <form class="card form" id="settings-form" autocomplete="off">
      <h2 style="margin:0">Live ElevenLabs voice</h2>
      <div class="field">
        <label for="api-key">ElevenLabs API key</label>
        <div class="row">
          <input id="api-key" name="apiKey" type="password" value="${esc(s.apiKey)}" placeholder="sk_…" style="flex:1 1 240px" spellcheck="false">
          <button type="button" class="btn" data-toggle-key>Show</button>
        </div>
        <div class="hint">Saved only in this browser (localStorage) and sent only to api.elevenlabs.io. Don't use it on a shared
          computer. For a public site, prefer pre-generated audio.</div>
      </div>
      <div class="field">
        <label for="model">Model</label>
        <select id="model" name="model">${MODELS.map((o) => `<option value="${o.id}"${o.id === s.model ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label for="voiceA">Voice A (examples, female speakers)</label>
        <input id="voiceA" name="voiceA" type="text" value="${esc(s.voiceA)}" list="voice-list" spellcheck="false">
        <div class="hint">Default: Sarah <code>${DEFAULT_VOICES.A}</code></div>
      </div>
      <div class="field">
        <label for="voiceB">Voice B (second speaker in dialogues)</label>
        <input id="voiceB" name="voiceB" type="text" value="${esc(s.voiceB)}" list="voice-list" spellcheck="false">
        <div class="hint">Default: Brian <code>${DEFAULT_VOICES.B}</code></div>
      </div>
      <datalist id="voice-list"></datalist>
      <label class="check"><input type="checkbox" name="preferLive"${s.preferLive ? ' checked' : ''}>
        <span>Always use the live voice (ignore pre-generated clips) — uses credits for every new clip.</span></label>
      <div class="row">
        <button type="submit" class="btn primary">Save</button>
        <button type="button" class="btn" data-load-voices>Load my voices</button>
        <button type="button" class="btn" data-check-credits>Check credits</button>
        <button type="button" class="btn" data-clear-cache>Clear audio cache</button>
      </div>
      <div id="voices-out"></div>
      <div id="credits-out"></div>
    </form>

    <section class="card" style="margin-top:18px">
      <h2>Test</h2>
      <div class="row">
        ${playButton('Did you eat your lunch yet?', { main: true, label: 'Voice A' })}
        ${playButton("Who's there?", { voice: 'B', label: 'Voice B' })}
      </div>
    </section>`;
}

export function renderVoices(voices) {
  const list = document.getElementById('voice-list');
  const out = document.getElementById('voices-out');
  if (!list || !out) return;
  list.innerHTML = voices.map((v) => `<option value="${esc(v.id)}">${esc(`${v.name} · ${v.accent} ${v.gender}`)}</option>`).join('');
  const american = voices.filter((v) => /americ/i.test(v.accent));
  const show = (american.length ? american : voices).slice(0, 30);
  out.innerHTML = `<p class="muted" style="margin:0 0 6px">${voices.length} voices. ${american.length ? 'American voices:' : ''}</p>
    <div class="table-wrap"><table><thead><tr><th>Name</th><th>Accent</th><th>Gender</th><th>ID</th><th></th></tr></thead><tbody>
    ${show
      .map(
        (v) => `<tr><td>${esc(v.name)}</td><td>${esc(v.accent)}</td><td>${esc(v.gender)}</td><td><code>${esc(v.id)}</code></td>
        <td><button type="button" class="pbtn" data-use-voice="${esc(v.id)}" data-slot="A">Use as A</button>
            <button type="button" class="pbtn" data-use-voice="${esc(v.id)}" data-slot="B">Use as B</button></td></tr>`,
      )
      .join('')}
    </tbody></table></div>`;
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
  return `<form class="card form" id="sheet-form" autocomplete="off" style="margin-bottom:18px">
      <h2 style="margin:0">Results → Google Sheets</h2>
      <p class="muted" style="margin:0">Finished exercises (and recordings you choose to send) go to your teacher's Google
        Sheet. Teachers: set up the sheet with <code>google-apps-script/Code.gs</code> from the repository.</p>
      <div class="row">
        <div class="field" style="flex:1 1 200px"><label for="student">Your name</label>
          <input id="student" name="student" type="text" maxlength="80" value="${esc(s.student)}"></div>
        <div class="field" style="flex:0 1 160px"><label for="group">Class / group</label>
          <input id="group" name="group" type="text" maxlength="40" value="${esc(s.group)}"></div>
      </div>
      <div class="field">
        <label for="sheet-url">Google Apps Script web app URL</label>
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
