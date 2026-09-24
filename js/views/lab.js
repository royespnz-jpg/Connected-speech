import { analyze, TYPES } from '../analyzer.js';
import { esc, audioButtons, recButton } from '../ui.js';

const SAMPLES = [
  'Did you eat your lunch yet?',
  "I'm going to pick it up at eight.",
  'Could you give me a hand with this old bag?',
  'What do you want to do this evening?',
  'Put your money where your mouth is.',
  'A penny saved is a penny earned.',
  "Tell her I'll call her back in a minute.",
  'We used to live in Toronto, but now we live in Atlanta.',
  'Is that your dog? He looks like a hot dog!',
];

const LAST_KEY = 'cs.lab.last';

function lastText() {
  try {
    return localStorage.getItem(LAST_KEY) || SAMPLES[0];
  } catch {
    return SAMPLES[0];
  }
}

export function renderLab() {
  return `<header class="topic-head">
      <div class="eyebrow">Connected Speech Lab</div>
      <h1>Analyze any sentence</h1>
      <p class="lede">Type a sentence to see where it links, merges, drops sounds and uses weak forms. Then listen to it
        connected and word by word, and record yourself.</p>
    </header>
    <label for="lab-input" class="sr-only">Sentence to analyze</label>
    <textarea id="lab-input" class="lab-input" maxlength="400" spellcheck="true">${esc(lastText())}</textarea>
    <div class="chips" aria-label="Examples">${SAMPLES.map((s) => `<button type="button" class="chip" data-sample="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <div class="lab-grid" id="lab-out"></div>`;
}

function wordHtml(word, marks) {
  const flags = new Array(word.length).fill(null);
  let weak = null;
  for (const m of marks) {
    if (m.type === 'weak-form') {
      if (!m.strong) weak = m;
      continue;
    }
    m.flags?.forEach((f, i) => {
      if (f && i < flags.length) flags[i] = flags[i] === 'del' ? 'del' : f;
    });
  }
  let inner = '';
  for (let i = 0; i < word.length; i++) {
    const ch = esc(word[i]);
    inner += flags[i] === 'del' ? `<span class="d">${ch}</span>` : flags[i] === 'hl' ? `<span class="h">${ch}</span>` : ch;
  }
  const title = marks
    .filter((m) => m.type !== 'weak-form' || !m.strong)
    .map((m) => `${TYPES[m.type].label}${m.type === 'weak-form' ? `: ${m.result}` : ''}`)
    .join(' · ');
  return `<span class="aw${weak ? ' weak' : ''}"${title ? ` title="${esc(title)}"` : ''}>${inner}</span>`;
}

function junctionLabel(f) {
  switch (f.type) {
    case 'glide':
      return f.result.replace(/[[\]]/g, '');
    case 'palatalization':
      return f.result.replace(/\//g, '');
    case 'flap':
      return 'ɾ';
    case 'gemination':
      return 'ː';
    case 'unreleased':
      return f.result.replace(/[[\]]/g, '');
    case 'td-deletion':
      return '∅';
    case 'nasal-assimilation':
    case 'place-assimilation':
      return f.result.split('→')[1].replace(/[[\]\s]/g, '');
    case 'sibilant-assimilation':
      return 'ʃ';
    case 'h-drop':
      return 'h̶';
    default:
      return '';
  }
}

function annotatedHtml(result) {
  const { tokens, wordIdx, junctions, wordMarks, findings } = result;
  const reductions = new Map(findings.filter((f) => f.type === 'reduction').map((f) => [f.at, f]));
  let html = '';
  let k = -1;
  let openRed = null;
  tokens.forEach((t, i) => {
    if (t.kind === 'word') {
      k = wordIdx.indexOf(i);
      if (reductions.has(k)) {
        openRed = reductions.get(k);
        html += `<span class="red" data-label="${esc(openRed.result)}" title="${esc(`${openRed.text} → ${openRed.result} (${openRed.note || TYPES.reduction.label})`)}">`;
      }
      html += wordHtml(t.text, wordMarks[k]);
      if (openRed && k === openRed.at + 1) {
        html += '</span>';
        openRed = null;
      }
      return;
    }
    const j = k >= 0 && k < junctions.length ? junctions[k] : null;
    const isGap = /^\s+$/.test(t.text) && j?.length;
    if (!isGap) {
      html += esc(t.text);
      return;
    }
    const primary = j.find((f) => f.type !== 'h-drop') || j[0];
    const label = junctionLabel(primary);
    const linky = ['link-cv', 'resyllabification', 'glide', 'vv-smooth', 'flap', 'palatalization', 'h-drop'].includes(primary.type);
    const title = j.map((f) => `${TYPES[f.type].label}${f.result ? `: ${f.result}` : ''}`).join(' · ');
    html += `<span class="jn t-${primary.type}" title="${esc(title)}">${linky ? '<span class="arc">‿</span>' : ' '}${
      label ? `<span class="lab">${esc(label)}</span>` : ''
    }<span class="sr-only"> (${esc(title)}) </span></span>`;
  });
  if (openRed) html += '</span>';
  return html;
}

export function renderLabResult(text) {
  const out = document.getElementById('lab-out');
  if (!out) return;
  try {
    localStorage.setItem(LAST_KEY, text);
  } catch {
    /* storage unavailable */
  }
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) {
    out.innerHTML = '<p class="muted">Type a sentence above.</p>';
    return;
  }
  const result = analyze(clean);
  const main = result.findings.filter((f) => f.type !== 'weak-form').sort((a, b) => a.at - b.at);
  const weak = result.findings.filter((f) => f.type === 'weak-form');
  const findingItems = main
    .map((f) => {
      const info = TYPES[f.type];
      const res = f.result || f.mark || '';
      return `<li class="finding t-${f.type}"><span class="dot" aria-hidden="true"></span>
        <span class="what"><b>${esc(info.label)}</b> — ${esc(f.text)}${res ? `<span class="res">→ ${esc(res)}</span>` : ''}${
          f.note ? ` <span class="muted">(${esc(f.note)})</span>` : ''
        }</span>
        <a href="#/topic/${info.topic}">Learn</a></li>`;
    })
    .join('');

  out.innerHTML = `
    <div class="card rec-host">
      <div class="annot" aria-label="Annotated sentence">${annotatedHtml(result)}</div>
      <div class="row">${audioButtons(clean)}${recButton(clean)}</div>
      <div class="rec-out" hidden style="margin-top:10px"></div>
    </div>
    <div>
      <h2>What happens here</h2>
      ${main.length ? `<ul class="findings">${findingItems}</ul>` : '<p class="muted">No boundary changes detected.</p>'}
      ${
        weak.length
          ? `<h3 style="margin-top:18px">Function words</h3><div class="weak-list">${weak
              .map((w) => `<span title="${esc(TYPES['weak-form'].label)}">${esc(w.text)} ${esc(w.strong ? '— strong (end of phrase)' : w.result)}</span>`)
              .join('')}</div>`
          : ''
      }
      <p class="muted" style="font-size:.85rem;margin-top:16px">The analysis is based on spelling and simple rules from the
        readings, so treat it as a guide: it can miss changes or suggest ones a speaker wouldn't make — check with your ear.
        Sentences you type are not pre-generated, so their audio uses live ElevenLabs (with a key) or the browser voice.</p>
    </div>`;
}
