import { MODELS, DEFAULT_VOICES } from '../audio-core.js';
import { getSettings, manifestInfo } from '../tts.js';
import { esc, playButton } from '../ui.js';

export function renderSettings() {
  const s = getSettings();
  const m = manifestInfo();
  return `<header class="topic-head">
      <div class="eyebrow">Settings</div>
      <h1>Audio &amp; ElevenLabs</h1>
      <p class="lede">The lab plays pre-generated ElevenLabs audio when it exists, then live ElevenLabs audio if you add
        your key, and otherwise your browser's built-in voice.</p>
    </header>

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
