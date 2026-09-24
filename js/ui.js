import { escapeHtml as esc, renderMarkup } from './markup.js';
import { wordsModeAllowed } from './audio-core.js';
import { exampleText } from './audio-items.js';
import { SOURCES } from './content.js';

export { esc };

export const icons = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  slow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V4zm-1 3v6l5 3 1-1.7-4-2.3V7h-2z"/></svg>',
  words: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="9" width="5" height="6" rx="1.5"/><rect x="9.5" y="9" width="5" height="6" rx="1.5"/><rect x="17" y="9" width="5" height="6" rx="1.5"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.4 6.6 14 5.2 7.2 12l6.8 6.8 1.4-1.4L10 12z"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 17.4 10 18.8l6.8-6.8L10 5.2 8.6 6.6 14 12z"/></svg>',
  arrowUR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 15.6 15.6 7H9V5h10v10h-2V8.4L8.4 17z"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6z"/></svg>',
};

const EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

export function playButton(text, { mode = 'natural', voice = 'A', label, main = false, round = false } = {}) {
  const defaults = { natural: 'Play', slow: 'Slow', words: 'Word by word' };
  const icon = mode === 'slow' ? icons.slow : mode === 'words' ? icons.words : icons.play;
  const lbl = label ?? defaults[mode];
  const content = mode === 'words' ? '<span class="lbl-long">Word by word</span>' : lbl ? `<span>${esc(lbl)}</span>` : '';
  const title =
    mode === 'words'
      ? 'Each word on its own — the unlinked, “choppy” version'
      : mode === 'slow'
        ? 'Slower connected speech'
        : 'Natural connected speech';
  return `<button type="button" class="pbtn${main ? ' main' : ''}${round ? ' round' : ''}" data-play data-mode="${mode}" data-voice="${voice}"
    data-text="${esc(text)}" title="${title}" aria-label="${esc(`${lbl || 'Play'}: ${text}`)}">${icon}${EQ}${content}</button>`;
}

export function audioButtons(text, { voice = 'A', words = true, slow = true } = {}) {
  let html = playButton(text, { mode: 'natural', voice, main: true, round: true });
  if (slow) html += playButton(text, { mode: 'slow', voice });
  if (words && wordsModeAllowed(text)) html += playButton(text, { mode: 'words', voice });
  return html;
}

export function recButton(text) {
  return `<button type="button" class="pbtn rec" data-rec data-text="${esc(text)}" title="Record yourself and compare"
    aria-label="Record yourself saying: ${esc(text)}">${icons.mic}<span class="lbl-long">Record</span></button>`;
}

export function exampleItem(ex) {
  const text = exampleText(ex);
  return `<li class="ex">
    <div class="ex-body">
      <span class="ex-mark">${renderMarkup(ex.m)}</span>
      ${ex.ipa ? `<span class="ex-ipa ipa">${esc(ex.ipa)}</span>` : ''}
      ${ex.note ? `<span class="ex-note">${esc(ex.note)}</span>` : ''}
    </div>
    <div class="ex-actions">${audioButtons(text)}${recButton(text)}</div>
    <div class="rec-out" hidden></div>
  </li>`;
}

export function examplesList(examples) {
  return `<ul class="examples">${examples.map(exampleItem).join('')}</ul>`;
}

export function tableHtml({ head, rows }) {
  return `<div class="table-wrap"><table>
    <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

let dialogueSeq = 0;
export function dialogueHtml(d) {
  const id = `dlg-${++dialogueSeq}`;
  const lines = d.lines
    .map((line) => {
      const text = exampleText(line);
      return `<li class="dlg-line voice-${line.voice || 'A'}">
        <span class="who" title="${esc(line.who)}"><span aria-hidden="true">${esc(line.who.slice(0, 1))}</span><span class="sr-only">${esc(line.who)}:</span></span>
        <span class="said">${renderMarkup(line.m)}${line.note ? `<small>${esc(line.note)}</small>` : ''}</span>
        ${playButton(text, { voice: line.voice || 'A', label: '', round: true })}
      </li>`;
    })
    .join('');
  return `<div class="dialogue" id="${id}">
    <div class="dlg-head"><h3>${esc(d.title)}</h3>
      <button type="button" class="pbtn main" data-play-dialogue="${id}">${icons.play}<span>Play all</span></button>
    </div>
    <ol class="dlg-lines">${lines}</ol>
  </div>`;
}

export function sourceBadges(sources) {
  return sources
    .map((s) => `<span class="badge ${s.toLowerCase()}" title="${esc(SOURCES[s].long)}">${esc(SOURCES[s].short)}</span>`)
    .join('');
}

let toastTimer;
export function toast(message, ms = 4000) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), ms);
}
