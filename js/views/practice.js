import {
  exerciseSets,
  exerciseGroups,
  setById,
  itemSay,
  itemOptions,
  itemCount,
  diffWords,
  hWords,
  hLineText,
  gapCorrect,
  pickText,
  stepsOf,
  isScored,
  stepCount,
  linkTokens,
  writeCorrect,
  SPELLING_INPUTS,
} from '../exercises-data.js';
import { SPEAKER_VOICE } from '../exercises-pp.js';
import { BOOK_TRACKS, bookClip } from '../book-audio.js';
import { SOURCES } from '../content.js';
import { renderMarkup, spokenText } from '../markup.js';
import {
  esc,
  playButton,
  recButton,
  sourceBadges,
  icons,
  dialogueHtml,
  examplesList,
  bookAudio,
  tableHtml,
  toast,
} from '../ui.js';
import { saveSettings, getSettings } from '../tts.js';
import { sheetConfigured, studentName, newId, sendResult } from '../sheets.js';

const PROGRESS_KEY = 'cs.progress.v1';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveBest(setId, correct, total) {
  const all = loadProgress();
  const prev = all[setId];
  if (!prev || correct / total > prev.correct / prev.total) all[setId] = { correct, total };
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

const asExamples = (items) => items.map((it) => (typeof it === 'string' ? { m: it } : it));

// ─── list ───────────────────────────────────────────────────────────────────

function setCard(set, progress) {
  const p = progress[set.id];
  const pct = p ? Math.round((100 * p.correct) / p.total) : 0;
  const scored = stepsOf(set).some(isScored);
  const n = itemCount(set);
  const count = set.steps ? `${set.steps.length} steps · ${n} ${scored ? 'points' : 'lines'}` : `${n} ${scored ? 'items' : 'sentences'}`;
  return `<a class="card set-card" href="#/practice/${set.id}">
    <div class="row">${set.book ? `<span class="badge book">${esc(set.book)}</span>` : sourceBadges([set.source])}
      <span class="badge">${count}</span></div>
    <h3 style="margin:6px 0 0">${esc(set.title)}</h3>
    <p>${esc(set.intro)}</p>
    ${
      scored
        ? `<div class="progress" title="Best score: ${pct}%"><span style="width:${pct}%"></span></div>
    <small class="muted">${p ? `Best: ${p.correct}/${p.total}` : 'Not tried yet'}</small>`
        : '<small class="muted">Listen · repeat · record</small>'
    }
  </a>`;
}

export function renderPracticeList() {
  const progress = loadProgress();
  const groups = exerciseGroups
    .map((g) => {
      const sets = exerciseSets.filter((set) => (set.group || 'readings') === g.id);
      return `<section class="practice-group" id="${g.id}">
        <div class="group-head"><p class="kicker">${esc(g.kicker)}</p><h2>${esc(g.title)}</h2></div>
        <div class="grid">${sets.map((set) => setCard(set, progress)).join('')}</div>
      </section>`;
    })
    .join('');
  return `<header class="topic-head">
      <div class="eyebrow">Practice</div>
      <h1>Exercises</h1>
      <p class="lede">Session VI: the teacher’s practices from <em>Pronunciation Plus</em> (Units 36–37) and
        <em>Pronunciation Pairs</em> (practices 1–13), step by step as in the book, with the book’s recordings. Then,
        exercises adapted from both readings. Your best score is saved in this browser.</p>
    </header>
    ${groups}`;
}

// ─── a set ──────────────────────────────────────────────────────────────────

export function renderPracticeSet(id) {
  const set = setById(id);
  if (!set) return null;
  const idx = exerciseSets.indexOf(set);
  const next = exerciseSets[idx + 1];
  const scored = stepsOf(set).some(isScored);
  const total = itemCount(set);
  const body = set.steps ? sheetBody(set) : `<div class="step plain" data-step="0">${stepBody(set)}</div>`;

  return `<span hidden data-practice data-set="${set.id}"></span>
    <header class="topic-head">
      <div class="eyebrow"><a href="#/practice">Practice</a> · ${idx + 1} of ${exerciseSets.length}</div>
      <h1>${esc(set.title)}</h1>
      <p class="lede">${esc(set.intro)}</p>
      <div class="row">${sourceBadges([set.source])}${set.book ? `<span class="badge book">${esc(set.book)}</span>` : ''}</div>
    </header>
    ${bookAudio(set.tracks)}
    ${set.steps ? '' : examplesSection(set)}
    ${
      scored
        ? `<div class="scorebar" data-scorebar data-set="${set.id}" data-total="${total}"
      data-attempt="${newId()}" data-started="${Date.now()}">
      <span class="score" data-score>0 / ${total}</span>
      <div class="progress"><span data-bar style="width:0%"></span></div>
      <button type="button" class="btn" data-reset>Start over</button>
    </div>`
        : ''
    }
    ${body}
    ${scored ? '<div class="card done-panel" data-done hidden aria-live="polite"></div>' : ''}
    <nav class="pager">
      <a class="btn back" href="#/practice">${icons.arrowL}All exercises</a>
      ${next ? `<a class="btn primary" href="#/practice/${next.id}">${esc(next.title)}${icons.arrowR}</a>` : ''}
    </nav>
    <p class="muted" style="font-size:.85rem;margin-top:24px">Source: ${esc(SOURCES[set.source].long)}</p>`;
}

// A worksheet: the book's sections (E, F…) and their numbered steps.
function sheetBody(set) {
  const out = [];
  let part = null;
  set.steps.forEach((step, k) => {
    if (step.part !== part) {
      if (part) out.push('</section>');
      part = step.part;
      const title = part.title
        ? `<h2 class="part-h">${part.label ? `<span class="part-letter">${esc(part.label)}</span>` : ''}<span>${esc(part.title)}</span></h2>`
        : '';
      out.push(`<section class="book-part">${title}${part.rule ? `<div class="part-rule">${part.rule}</div>` : ''}`);
    }
    out.push(stepSection(set, step, k));
  });
  out.push('</section>');
  return out.join('');
}

const stepName = (step) => (step.part.label ? `step ${step.key}` : `exercise ${step.key}`);

function stepSection(set, step, k) {
  const after = step.after && set.steps.find((s) => s.key === step.after);
  const track = step.track && BOOK_TRACKS[step.track];
  return `<section class="step${after ? ' locked' : ''}" data-step="${k}" data-key="${esc(step.key)}"${after ? ` data-after="${esc(after.key)}"` : ''}>
    <div class="step-head">
      ${step.n ? `<span class="step-n">${esc(step.n)}</span>` : ''}
      <p class="step-task">${track ? `<span class="step-audio" title="Book recording: ${esc(track.label)}">${icons.headphones}</span>` : ''}${step.task}</p>
    </div>
    ${step.note ? `<p class="step-note">${esc(step.note)}</p>` : ''}
    ${step.appVoice ? '<p class="step-note app-voice">The teacher’s folder has no recording of this part: the app’s voice reads it.</p>' : ''}
    ${after ? `<p class="lock-note">${icons.lock}<span>Answer ${esc(stepName(after))} first: this part shows the answers.</span></p>` : ''}
    <div class="step-body">${stepBody(step)}</div>
  </section>`;
}

function stepBody(step) {
  switch (step.type) {
    case 'choice':
    case 'blank':
      return listenCard(step) + (step.table ? tableHtml(step.table) : '') + choiceItems(step);
    case 'pick':
      return pickPassage(step);
    case 'dictation':
      return dictationItems(step);
    case 'gap':
      return gapItems(step);
    case 'hdrop':
      return hdropConversations(step);
    case 'repeat':
      return step.sections ? repeatSections(step) : examplesList(asExamples(step.items));
    case 'dialogues':
      return step.dialogues.map((d) => dialogueHtml(d, { rec: true })).join('');
    case 'link':
      return linkLines(step);
    case 'select':
      return selectOptions(step);
    case 'write':
      return writeItems(step);
    case 'spelling':
      return spellingRows(step);
    case 'speak':
      return speakTask(step);
    case 'interview':
      return interviewItems(step);
    case 'build':
      return buildTask(step);
    default:
      return '';
  }
}

// A conversation to listen to before answering; its text stays blurred until
// the step is finished or the student asks for it.
function listenCard(step) {
  if (!step.dialogue) return '';
  return `<div class="listen-card" data-listen-card data-transcript="hidden">
    ${dialogueHtml(step.dialogue, { playLabel: 'Play the conversation' })}
    <button type="button" class="btn" data-show-text>Show the text</button>
  </div>`;
}

function choiceItems(step) {
  // When the audio would give the answer away, it appears after answering.
  const after = step.type === 'blank' || step.listenAfter;
  return `<ol class="items">${step.items
    .map((item, i) => {
      const opts = itemOptions(step, item);
      const say = itemSay(step, item);
      const mark = item.example && item.after ? item.after : item.m;
      const q =
        step.type === 'blank'
          ? esc(item.s).replace('___', '<span class="blank" data-blank>&nbsp;</span>')
          : mark
            ? `<span class="q-mark" data-q-mark>${renderMarkup(mark)}</span>`
            : item.q;
      const listen = say && (!after || item.example) ? playButton(say, { label: 'Listen' }) : '';
      const reveal = item.dialogue
        ? dialogueHtml({ lines: item.dialogue }, { playLabel: 'Play the conversation', rec: true })
        : say && after
          ? playButton(say, { label: 'Hear it' })
          : '';
      if (item.example) {
        return `<li class="card item-example">
          <div class="item-q"><div class="q">${q}</div><div class="row">${item.dialogue ? '' : listen}</div></div>
          <div class="options">${opts
            .map((o, k) => `<button type="button" class="opt${k === item.answer ? ' correct' : ''}" disabled>${esc(o)}</button>`)
            .join('')}</div>
          <div class="feedback"><span class="verdict ok">Example</span><span class="why">${item.explain || ''}</span>${item.dialogue ? reveal : ''}</div>
        </li>`;
      }
      return `<li class="card item" data-item="${i}" data-answer="${item.answer}">
        <div class="item-q"><div class="q">${q}</div><div class="row">${listen}</div></div>
        <div class="options">${opts
          .map((o, k) => `<button type="button" class="opt" data-opt="${k}">${esc(o)}</button>`)
          .join('')}</div>
        <div class="feedback" data-feedback hidden>
          <span class="verdict"></span><span class="why">${item.explain || ''}</span>
          ${reveal}
        </div>
      </li>`;
    })
    .join('')}</ol>`;
}

// Listen-and-repeat lines shown above a (non-worksheet) exercise.
function examplesSection(set) {
  if (!set.examples?.length) return '';
  return `<section class="section examples-first"><h2>Listen and repeat</h2>
    ${examplesList(asExamples(set.examples))}</section>`;
}

function pickWords(text) {
  return text
    .split(/(\s+)/)
    .map((w) => {
      if (/^\s+$/.test(w)) return w;
      const m = w.match(/^([^A-Za-z]*)([A-Za-z]+)(.*)$/);
      if (!m) return esc(w);
      return `${esc(m[1])}<button type="button" class="pw" data-word="${esc(m[2].toLowerCase())}">${esc(m[2])}</button>${esc(m[3])}`;
    })
    .join('');
}

function pickPassage(step) {
  const html = step.lines
    ? `<ol class="pick-lines">${step.lines.map((l) => `<li>${pickWords(l)}</li>`).join('')}</ol>`
    : pickWords(step.passage);
  return `<div class="card">
      <div class="row" style="margin-bottom:10px">${playButton(pickText(step), { label: step.lines ? 'Listen to the sentences' : 'Listen to the passage' })}</div>
      <div class="passage" data-passage>${html}</div>
      <div class="row" style="margin-top:14px">
        <button type="button" class="btn primary" data-check-pick>Check</button>
        <span class="muted" data-pick-count>0 selected</span>
      </div>
      <div class="callout" data-pick-explain hidden><p>${step.explain}</p></div>
      ${step.reveal ? `<div data-pick-reveal hidden><h3 class="reveal-h">Listen, repeat and check</h3>${examplesList(step.reveal.map((m) => ({ m })))}</div>` : ''}
    </div>`;
}

function dictationItems(step) {
  return `<ol class="items">${step.items
    .map(
      (item, i) => `<li class="card item" data-item="${i}">
        <div class="item-q"><div class="q muted">Sentence ${i + 1}</div>
          <div class="row">${playButton(item.say, { main: true })}${playButton(item.say, { mode: 'slow' })}</div></div>
        <form data-dict-form>
          <input class="dict-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
            aria-label="Type sentence ${i + 1}" placeholder="Type what you hear…">
          <div class="row" style="margin-top:8px"><button class="btn" type="submit">Check</button></div>
        </form>
        <div class="feedback" data-feedback hidden></div>
      </li>`,
    )
    .join('')}</ol>`;
}

let gapSeq = 0;
function gapItems(step) {
  const compare = step.compare?.length
    ? `<section class="section compare">
        <h2>Listen and compare</h2>
        ${examplesList(step.compare.flat().map((m) => ({ m })))}
      </section>`
    : '';
  const items = step.items
    .map((item, i) => {
      const id = `gap-${++gapSeq}`;
      const full = itemSay(step, item);
      let k = 0;
      const b = item.example
        ? esc(item.b).replace(/___/g, () => `<span class="blank filled">${esc(item.answer[k++])}</span>`)
        : esc(item.b).replace(/___/g, '<span class="blank" data-blank>&nbsp;</span>');
      const prompt = `<div class="q${item.prompt ? '' : ' muted'}">${item.prompt ? esc(item.prompt) : `Conversation ${i + 1}`}</div>`;
      const aLine = item.a
        ? `<li class="dlg-line voice-A"><span class="who" aria-hidden="true">A</span>
            <span class="said">${esc(item.a)}</span>${playButton(item.a, { voice: 'A', label: '', round: true })}</li>`
        : '';
      if (item.example) {
        return `<li class="card item-example gap-item">
          <div class="item-q">${prompt}</div>
          <ol class="dlg-lines">${aLine}<li class="dlg-line voice-B"><span class="who" aria-hidden="true">${item.a ? 'B' : '→'}</span>
            <span class="said">${b}</span>${playButton(full, { voice: 'B', label: '', round: true })}</li></ol>
          <div class="feedback"><span class="verdict ok">Example</span>${item.note ? `<span>${esc(item.note)}</span>` : ''}</div>
        </li>`;
      }
      // listenAfter: answer first, then the recording is there to check.
      const controls = step.listenAfter
        ? ''
        : `<div class="row">
            <button type="button" class="pbtn main" data-play-dialogue="${id}">${icons.play}<span>Play</span></button>
            ${bookClip(full) ? '' : playButton(full, { mode: 'slow', voice: 'B' })}
          </div>`;
      const bPlay = step.listenAfter ? '' : playButton(full, { voice: 'B', label: '', round: true });
      return `<li class="card item gap-item" data-item="${i}" id="${id}">
        <div class="item-q">${prompt}${controls}</div>
        <ol class="dlg-lines">${aLine}
          <li class="dlg-line voice-B"><span class="who" aria-hidden="true">${item.a ? 'B' : '→'}</span>
            <span class="said">${b}</span>${bPlay}</li>
        </ol>
        <form data-dict-form class="gap-form row">
          ${item.answer
            .map(
              (_, n) => `<input class="dict-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
            aria-label="Missing word ${item.answer.length > 1 ? `${n + 1} ` : ''}in conversation ${i + 1}"
            placeholder="${item.answer.length > 1 ? `Word ${n + 1}…` : 'The missing word…'}">`,
            )
            .join('')}
          <button class="btn" type="submit">Check</button>
        </form>
        <div class="feedback" data-feedback hidden></div>
      </li>`;
    })
    .join('');
  return `${compare}<ol class="items">${items}</ol>`;
}

let hdSeq = 0;
function hdropLine(text) {
  return esc(text).replace(/\{(\^?)([^}]+)\}/g, (_, drop, w) => {
    const [, h, rest] = w.match(/^(w?h)(.*)$/i); // the letters spelling /h/: h, or wh in "who"
    return `<button type="button" class="hw" data-drop="${drop ? 1 : 0}" aria-pressed="false"><span class="h">${h}</span>${rest}</button>`;
  });
}

function hdropConversations(step) {
  const convs = step.conversations
    .map((lines, n) => {
      const id = `hd-${++hdSeq}`;
      return `<div class="dialogue hd" id="${id}">
        <div class="dlg-head"><h3>Conversation ${n + 1}</h3>
          <button type="button" class="pbtn main" data-play-dialogue="${id}">${icons.play}<span>Play all</span></button></div>
        <ol class="dlg-lines">${lines
          .map(([who, text]) => {
            const voice = SPEAKER_VOICE[who] || 'A';
            return `<li class="dlg-line voice-${voice}"><span class="who" aria-hidden="true">${who}</span>
              <span class="said">${hdropLine(text)}</span>${playButton(hLineText(text), { voice, label: '', round: true })}</li>`;
          })
          .join('')}</ol>
      </div>`;
    })
    .join('');
  return `<div class="hd-wrap" data-hd>
      ${convs}
      <div class="row hd-check"><button type="button" class="btn primary" data-check-h>Check</button>
        <span class="muted" data-h-count>0 marked</span></div>
      <div class="callout" data-h-explain hidden><p>${step.explain}</p></div>
    </div>`;
}

function repeatSections(step) {
  return step.sections
    .map(
      (sec) => `<section class="section">
        <h2>${esc(sec.h)}</h2>
        ${sec.note ? `<p class="muted">${esc(sec.note)}</p>` : ''}
        ${examplesList(asExamples(sec.items))}
      </section>`,
    )
    .join('');
}

// "Draw a linking line": tap the space between two words.
const GLIDE_CYCLE = { '': 'y', y: 'w', w: '' };
const linkState = (step, links, g) => (links[g] ? (step.glides ? links[g] : 'link') : '');

function linkLines(step) {
  const solved = step.solved || 0;
  const lines = step.lines
    .map((m, i) => {
      const { words, links } = linkTokens(m);
      const isSolved = i < solved;
      const text = words
        .map((w, g) => {
          if (g === words.length - 1) return `<span class="lk-w">${esc(w)}</span>`;
          const state = isSolved ? linkState(step, links, g) : '';
          return `<span class="lk-w">${esc(w)}</span><button type="button" class="lk-gap" data-gap="${g}" data-state="${state}" aria-pressed="${Boolean(state)}"${isSolved ? ' disabled' : ''}
            aria-label="Link “${esc(w)}” and “${esc(words[g + 1])}”"></button>`;
        })
        .join('');
      return `<li class="lk-line${isSolved ? ' solved' : ''}" data-line="${i}">
        <div class="lk-row"><span class="lk-text">${text}</span>
          ${isSolved ? '<span class="lk-tag">Example</span>' : ''}${step.listen || isSolved ? playButton(spokenText(m), { label: '', round: true }) : ''}</div>
        <div class="lk-answer" hidden></div>
      </li>`;
    })
    .join('');
  const how = step.glides
    ? 'Tap the space between two words to draw a link with /y/; tap again for /w/, and once more to erase it.'
    : 'Tap the space between two words to draw a link; tap again to erase it.';
  return `<p class="step-note">${how}</p>
    <ol class="lk-lines">${lines}</ol>
    <div class="row"><button type="button" class="btn primary" data-check-link>Check</button></div>
    <div class="callout" data-link-explain hidden><p>${step.explain || ''}</p></div>`;
}

function selectOptions(step) {
  return `<div class="sel-opts${step.html ? ' list' : ''}">${step.options
    .map(
      (o, i) => `<span class="so-wrap"><button type="button" class="so" data-so="${i}" aria-pressed="false">${step.html ? o : esc(o)}</button>${
        step.play ? playButton(o, { label: '', round: true }) : ''
      }</span>`,
    )
    .join('')}</div>
    <div class="row"><button type="button" class="btn primary" data-check-select>Check</button>
      <span class="muted" data-select-count>0 chosen</span></div>
    <div class="callout" data-select-explain hidden><p>${step.explain || ''}</p></div>`;
}

function writeItems(step) {
  return `<ol class="items">${step.items
    .map(
      (item, i) => `<li class="card item write-item" data-item="${i}">
        <div class="item-q"><div class="q">${esc(item.q)}</div></div>
        <form data-dict-form class="gap-form row">
          <input class="dict-input" type="text" autocomplete="off" spellcheck="false" aria-label="${esc(item.q)}" placeholder="Your answer…">
          <button class="btn" type="submit">Check</button>
        </form>
        <div class="feedback" data-feedback hidden></div>
      </li>`,
    )
    .join('')}</ol>`;
}

function spellingRows(step) {
  const rows = step.rows
    .map(
      (r, i) => `<div class="sp-row" data-row="${i}">
        <span class="sp-label">${esc(r.label)}</span>
        <span class="sp-words"><span class="sp-given">${r.given.map(esc).join(', ')},</span>
          ${Array.from(
            { length: SPELLING_INPUTS },
            (_, k) => `<input class="sp-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-k="${k}"
            aria-label="Another word with ${esc(step.sound)} spelled ${esc(r.label)}" placeholder="another word">`,
          ).join('')}</span>
        <div class="sp-fb" hidden></div>
      </div>`,
    )
    .join('');
  const info = (step.info || [])
    .map(([label, words]) => `<div class="sp-row info"><span class="sp-label">${esc(label)}</span><span class="sp-words">${esc(words)}</span></div>`)
    .join('');
  return `<div class="card spell">${rows}${info}</div>
    <div class="row"><button type="button" class="btn primary" data-check-spelling>Check</button></div>`;
}

function speakTask(step) {
  const prompts = step.prompts?.length
    ? `<p class="step-note">Questions you can use:</p>${examplesList(step.prompts.map((m) => ({ m })))}`
    : '';
  return `${prompts}
    <div class="card rec-host free-rec">
      <p><b>Record the ${esc(step.label.replace(/:.*/, '').toLowerCase())}</b> (up to 2 minutes), listen to it, and send it to your teacher if you like.</p>
      <div class="row">${recButton(step.label, { free: true, max: 120 })}</div>
      <div class="rec-out" hidden></div>
    </div>`;
}

const ivQuestion = ([a, b]) => `Would you rather ${a} or ${b}?`;

function interviewItems(step) {
  return `<ol class="items interview">${step.items
    .map((pair, i) => {
      const q = ivQuestion(pair);
      return `<li class="card iv rec-host" data-iv="${i}">
        <div class="item-q"><div class="q">Would you rather <b>${esc(pair[0])}</b> or <b>${esc(pair[1])}</b>?</div>
          <div class="row">${playButton(q, { label: '', round: true })}${recButton(q, { round: true })}</div></div>
        <div class="options">
          <button type="button" class="opt" data-iv-pick="1" aria-pressed="false">${esc(pair[0])} · 1 point</button>
          <button type="button" class="opt" data-iv-pick="0" aria-pressed="false">${esc(pair[1])} · 0 points</button>
        </div>
        <div class="rec-out" hidden></div>
      </li>`;
    })
    .join('')}</ol>
    <p class="card iv-total" data-iv-total aria-live="polite">Your partner’s points: <b>0</b> / ${step.items.length}</p>`;
}

const buildTexts = (v) => ({
  a: `Which jacket do you think is ${v.a} than the others?`,
  b: `I think the ${v.jacket} ${v.verb} ${v.b} than the others.`,
});

function buildTask(step) {
  const sel = (name, opts, label) =>
    `<select class="bd-sel" data-b="${name}" aria-label="${esc(label)}">${opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  const t = buildTexts({ a: step.words[0], b: step.words[0], jacket: step.jackets[0], verb: step.verbs[0] });
  const actions = (text) =>
    `<span class="dlg-actions">${playButton(text, { label: '', round: true })}${recButton(text, { round: true })}</span>`;
  return `<div class="dialogue build" data-build>
      <ol class="dlg-lines">
        <li class="dlg-line voice-A rec-host" data-bline="a"><span class="who" aria-hidden="true">A</span>
          <span class="said">Which jacket do you think is ${sel('a', step.words, 'A’s word')} than the others?</span>
          ${actions(t.a)}<div class="rec-out" hidden></div></li>
        <li class="dlg-line voice-B rec-host" data-bline="b"><span class="who" aria-hidden="true">B</span>
          <span class="said">I think the ${sel('jacket', step.jackets, 'Which jacket')} ${sel('verb', step.verbs, 'is or looks')}
            ${sel('b', step.words, 'B’s word')} ${renderMarkup('than the_[y]others.')}</span>
          ${actions(t.b)}<div class="rec-out" hidden></div></li>
      </ol>
    </div>`;
}

// ─── score ──────────────────────────────────────────────────────────────────

function currentSet(root) {
  return setById(root.querySelector('[data-practice]')?.dataset.set);
}

const WHOLE_STEP = { pick: '.pw.correct', hdrop: '.hw.ok', link: '.lk-line.ok', select: '.so.ok', spelling: '.sp-in.ok' };

// How much of a scored step is answered, and how much is right.
function stepProgress(step, el) {
  const total = stepCount(step);
  if (WHOLE_STEP[step.type]) {
    return { total, answered: el.dataset.checked ? total : 0, correct: el.querySelectorAll(WHOLE_STEP[step.type]).length };
  }
  let answered = 0;
  let correct = 0;
  el.querySelectorAll('.item').forEach((it) => {
    if (it.dataset.result) answered++;
    if (it.dataset.result === 'ok') correct++;
  });
  return { total, answered, correct };
}

// A finished step opens the steps that wait for it and shows its transcript.
function stepDone(root, step, el) {
  root.querySelectorAll(`[data-after="${step.key}"]`).forEach((s) => s.classList.remove('locked'));
  el.querySelector('[data-listen-card]')?.setAttribute('data-transcript', 'shown');
}

function updateScore(root) {
  const set = currentSet(root);
  let total = 0;
  let answered = 0;
  let correct = 0;
  stepsOf(set).forEach((step, k) => {
    if (!isScored(step)) return;
    const el = root.querySelector(`[data-step="${k}"]`);
    const p = stepProgress(step, el);
    total += p.total;
    answered += p.answered;
    correct += p.correct;
    if (p.answered === p.total && !el.dataset.done) {
      el.dataset.done = '1';
      stepDone(root, step, el);
    }
  });
  const bar = root.querySelector('[data-scorebar]');
  if (!bar || !total) return;
  bar.querySelector('[data-score]').textContent = `${correct} / ${total}`;
  bar.querySelector('[data-bar]').style.width = `${(100 * answered) / total}%`;
  if (answered === total) {
    saveBest(set.id, correct, total);
    finish(root, set, correct, total);
  }
}

// ─── finishing: summary + sending to the teacher's Google Sheet ─────────────

function textOf(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent.trim();
}

// A line as the student drew it: "There was no‿w answer."
function linkLineText(el) {
  return [...el.querySelectorAll('.lk-w')]
    .map((w) => {
      const gap = w.nextElementSibling?.matches('.lk-gap') ? w.nextElementSibling.dataset.state : '';
      return w.textContent + (gap === 'link' ? '‿' : gap ? `‿${gap} ` : ' ');
    })
    .join('')
    .trim();
}

function stepAnswers(step, el) {
  if (step.type === 'pick') {
    const rows = [];
    el.querySelectorAll('.pw').forEach((b) => {
      const word = b.textContent;
      if (b.classList.contains('correct')) rows.push({ prompt: word, answer: 'marked', expected: 'marked', correct: true });
      if (b.classList.contains('wrong')) rows.push({ prompt: word, answer: 'marked', expected: 'not marked', correct: false });
      if (b.classList.contains('missed')) rows.push({ prompt: word, answer: 'not marked', expected: 'marked', correct: false });
    });
    return rows;
  }
  if (step.type === 'hdrop') {
    const words = hWords(step);
    return [...el.querySelectorAll('.hw')].map((b, i) => ({
      prompt: `Conversation ${words[i].conv + 1}: ${words[i].word}`,
      answer: b.classList.contains('sel') ? 'no /h/' : '/h/',
      expected: words[i].drop ? 'no /h/' : '/h/',
      correct: b.classList.contains('ok'),
    }));
  }
  if (step.type === 'link') {
    return [...el.querySelectorAll('.lk-line:not(.solved)')].map((li) => {
      const m = step.lines[Number(li.dataset.line)];
      return {
        prompt: spokenText(m),
        answer: linkLineText(li),
        expected: m.replace(/_\[([wy])\]/g, '‿$1 ').replace(/_/g, '‿'),
        correct: li.classList.contains('ok'),
      };
    });
  }
  if (step.type === 'select') {
    return [...el.querySelectorAll('.so')].map((b, i) => ({
      prompt: textOf(b.innerHTML),
      answer: b.classList.contains('sel') ? 'chosen' : 'not chosen',
      expected: step.optional?.includes(i) ? 'either' : step.answers.includes(i) ? 'chosen' : 'not chosen',
      correct: b.classList.contains('ok'),
    }));
  }
  if (step.type === 'spelling') {
    return [...el.querySelectorAll('.sp-in')].map((input) => {
      const row = step.rows[Number(input.closest('[data-row]').dataset.row)];
      return {
        prompt: `Another ${step.sound} word spelled ${row.label}`,
        answer: input.value.trim(),
        expected: `a word with ${step.sound} spelled ${row.label}`,
        correct: input.classList.contains('ok'),
      };
    });
  }
  return [...el.querySelectorAll('.item')].map((it) => {
    const item = step.items[Number(it.dataset.item)];
    if (step.type === 'dictation') {
      return { prompt: `Dictation ${Number(it.dataset.item) + 1}`, answer: it.dataset.typed || '', expected: item.answer, correct: it.dataset.result === 'ok' };
    }
    if (step.type === 'gap') {
      return { prompt: item.a ? `${item.a} / ${item.b}` : `${item.prompt} ${item.b}`, answer: it.dataset.typed || '', expected: item.answer.join(' / '), correct: it.dataset.result === 'ok' };
    }
    if (step.type === 'write') {
      return { prompt: item.q, answer: it.dataset.typed || '', expected: item.answer, correct: it.dataset.result === 'ok' };
    }
    const opts = itemOptions(step, item);
    return {
      prompt: step.type === 'blank' ? item.s : item.m ? spokenText(item.m) : step.hideWord ? item.say : textOf(item.q),
      answer: opts[Number(it.dataset.chosen)] ?? '',
      expected: opts[item.answer],
      correct: it.dataset.result === 'ok',
    };
  });
}

function collectAnswers(root, set) {
  const rows = [];
  stepsOf(set).forEach((step, k) => {
    if (!isScored(step)) return;
    const el = root.querySelector(`[data-step="${k}"]`);
    const prefix = set.steps ? `${step.key} · ` : '';
    for (const r of stepAnswers(step, el)) rows.push({ ...r, prompt: prefix + r.prompt });
  });
  return rows.map((r, i) => ({ n: i + 1, ...r }));
}

function finish(root, set, correct, total) {
  const bar = root.querySelector('[data-scorebar]');
  if (bar.dataset.finished) return;
  bar.dataset.finished = '1';
  const started = Number(bar.dataset.started);
  root.csResult = {
    id: bar.dataset.attempt,
    setId: set.id,
    setTitle: set.book ? `${set.book} · ${set.title}` : set.title,
    correct,
    total,
    durationSec: Math.round((Date.now() - started) / 1000),
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    items: collectAnswers(root, set),
  };
  root.querySelectorAll('[data-listen-card]').forEach((c) => c.setAttribute('data-transcript', 'shown'));
  const panel = root.querySelector('[data-done]');
  panel.hidden = false;
  panel.innerHTML = `<h2 style="margin:0 0 6px">Finished: ${correct} / ${total} (${Math.round((100 * correct) / total)}%)</h2>
    <div data-sheet-status></div>`;
  if (!sheetConfigured()) return;
  if (studentName()) submitResult(root);
  else showNameForm(root);
}

function showNameForm(root) {
  const s = getSettings();
  root.querySelector('[data-sheet-status]').innerHTML = `<form class="row" data-name-form>
      <input class="dict-input" style="flex:1 1 180px;margin:0" name="student" required maxlength="80" placeholder="Your name" aria-label="Your name" value="${esc(s.student)}">
      <input class="dict-input" style="flex:0 1 140px;margin:0" name="group" maxlength="40" placeholder="Class / group" aria-label="Class or group" value="${esc(s.group)}">
      <button class="btn primary" type="submit">Send to my teacher</button>
    </form>`;
}

async function submitResult(root) {
  const status = root.querySelector('[data-sheet-status]');
  if (!status || !root.csResult) return;
  status.innerHTML = '<p class="muted">Sending your results to your teacher…</p>';
  try {
    await sendResult(root.csResult);
    const s = getSettings();
    status.innerHTML = `<p class="sent">✓ Sent to your teacher's sheet as <b>${esc(s.student)}</b>${s.group ? ` (${esc(s.group)})` : ''}.</p>`;
  } catch (err) {
    status.innerHTML = `<p class="muted">Couldn't send (${esc(err.message)}). It's saved and will be sent again automatically.</p>
      <button type="button" class="btn" data-send-results>Try again</button>`;
  }
}

export function handleNameForm(form, root) {
  const data = new FormData(form);
  const student = String(data.get('student') || '').trim();
  if (!student) return;
  saveSettings({ student, group: String(data.get('group') || '').trim() });
  submitResult(root);
}

// ─── interaction (called from app.js on click / submit / change) ────────────

function stepAt(root, target) {
  const set = currentSet(root);
  const el = target.closest('[data-step]');
  return { set, el, step: set && el ? stepsOf(set)[Number(el.dataset.step)] : null };
}

export function handlePracticeClick(target, root) {
  const { el, step } = stepAt(root, target);

  const opt = target.closest('.opt[data-opt]');
  if (opt && !opt.disabled && step) {
    const item = opt.closest('.item');
    const answer = Number(item.dataset.answer);
    const chosen = Number(opt.dataset.opt);
    item.querySelectorAll('.opt').forEach((b, k) => {
      b.disabled = true;
      if (k === answer) b.classList.add('correct');
    });
    if (chosen !== answer) opt.classList.add('wrong');
    item.dataset.chosen = String(chosen);
    item.dataset.result = chosen === answer ? 'ok' : 'no';
    const fb = item.querySelector('[data-feedback]');
    fb.hidden = false;
    const v = fb.querySelector('.verdict');
    v.textContent = chosen === answer ? 'Correct.' : 'Not quite.';
    v.className = `verdict ${chosen === answer ? 'ok' : 'no'}`;
    const data = step.items[Number(item.dataset.item)];
    if (step.type === 'blank') {
      const blank = item.querySelector('[data-blank]');
      blank.textContent = itemOptions(step, data)[answer];
      blank.classList.add('filled');
    }
    if (data.after) item.querySelector('[data-q-mark]').innerHTML = renderMarkup(data.after);
    updateScore(root);
    return true;
  }

  if (target.closest('[data-show-text]')) {
    target.closest('[data-listen-card]')?.setAttribute('data-transcript', 'shown');
    return true;
  }

  const hw = target.closest('.hw');
  if (hw) {
    if (el.dataset.checked) return true;
    hw.classList.toggle('sel');
    hw.setAttribute('aria-pressed', String(hw.classList.contains('sel')));
    el.querySelector('[data-h-count]').textContent = `${el.querySelectorAll('.hw.sel').length} marked`;
    return true;
  }

  if (target.closest('[data-check-h]')) {
    el.dataset.checked = '1';
    el.querySelectorAll('.hw').forEach((b) => {
      const drop = b.dataset.drop === '1';
      const sel = b.classList.contains('sel');
      b.disabled = true;
      b.classList.add(drop === sel ? 'ok' : 'no');
      if (drop) b.classList.add('dropped');
    });
    el.querySelector('[data-h-explain]').hidden = false;
    target.closest('[data-check-h]').disabled = true;
    updateScore(root);
    return true;
  }

  const pw = target.closest('.pw');
  if (pw) {
    if (el.dataset.checked) return true;
    pw.classList.toggle('sel');
    el.querySelector('[data-pick-count]').textContent = `${el.querySelectorAll('.pw.sel').length} selected`;
    return true;
  }

  if (target.closest('[data-check-pick]')) {
    const answers = new Set(step.answers);
    el.dataset.checked = '1';
    el.querySelectorAll('.pw').forEach((b) => {
      const right = answers.has(b.dataset.word);
      const sel = b.classList.contains('sel');
      b.classList.remove('sel');
      if (right && sel) b.classList.add('correct');
      else if (!right && sel) b.classList.add('wrong');
      else if (right) b.classList.add('missed');
    });
    el.querySelector('[data-pick-explain]').hidden = false;
    const reveal = el.querySelector('[data-pick-reveal]');
    if (reveal) reveal.hidden = false;
    target.closest('[data-check-pick]').disabled = true;
    updateScore(root);
    return true;
  }

  const gap = target.closest('.lk-gap');
  if (gap) {
    if (gap.disabled) return true;
    const state = gap.dataset.state;
    gap.dataset.state = step.glides ? GLIDE_CYCLE[state] : state ? '' : 'link';
    gap.setAttribute('aria-pressed', String(Boolean(gap.dataset.state)));
    gap.title = gap.dataset.state && gap.dataset.state !== 'link' ? `/${gap.dataset.state}/` : '';
    return true;
  }

  if (target.closest('[data-check-link]')) {
    checkLinks(step, el);
    target.closest('[data-check-link]').disabled = true;
    updateScore(root);
    return true;
  }

  const so = target.closest('.so');
  if (so) {
    if (el.dataset.checked) return true;
    so.classList.toggle('sel');
    so.setAttribute('aria-pressed', String(so.classList.contains('sel')));
    el.querySelector('[data-select-count]').textContent = `${el.querySelectorAll('.so.sel').length} chosen`;
    return true;
  }

  if (target.closest('[data-check-select]')) {
    el.dataset.checked = '1';
    el.querySelectorAll('.so').forEach((b, i) => {
      const right = step.answers.includes(i);
      const sel = b.classList.contains('sel');
      const either = step.optional?.includes(i);
      b.disabled = true;
      b.classList.add(either || right === sel ? 'ok' : 'no');
      if (right && !sel) b.classList.add('missed');
    });
    el.querySelector('[data-select-explain]').hidden = false;
    target.closest('[data-check-select]').disabled = true;
    updateScore(root);
    return true;
  }

  const check = target.closest('[data-check-spelling]');
  if (check) {
    checkSpelling(step, el, check).then((ok) => ok && updateScore(root));
    return true;
  }

  const pick = target.closest('[data-iv-pick]');
  if (pick) {
    const row = pick.closest('[data-iv]');
    row.querySelectorAll('[data-iv-pick]').forEach((b) => {
      b.classList.toggle('chosen', b === pick);
      b.setAttribute('aria-pressed', String(b === pick));
    });
    row.dataset.points = pick.dataset.ivPick;
    updateInterview(step, el);
    return true;
  }

  if (target.closest('[data-send-results]')) {
    submitResult(root);
    return true;
  }

  if (target.closest('[data-reset]')) {
    return 'rerender';
  }
  return false;
}

function checkLinks(step, el) {
  el.dataset.checked = '1';
  el.querySelectorAll('.lk-line:not(.solved)').forEach((li) => {
    const m = step.lines[Number(li.dataset.line)];
    const { links } = linkTokens(m);
    let ok = true;
    li.querySelectorAll('.lk-gap').forEach((b) => {
      const expected = linkState(step, links, Number(b.dataset.gap));
      const state = b.dataset.state;
      b.disabled = true;
      if (state === expected) return;
      ok = false;
      b.classList.add(expected && !state ? 'missed' : 'wrong');
    });
    li.classList.add(ok ? 'ok' : 'no');
    const answer = li.querySelector('.lk-answer');
    answer.hidden = false;
    answer.innerHTML = `<span class="verdict ${ok ? 'ok' : 'no'}">${ok ? 'Correct' : 'Answer'}</span>
      <span class="lk-right">${renderMarkup(m)}</span>`;
  });
  el.querySelector('[data-link-explain]').hidden = !step.explain;
}

// Words for the spelling rows, loaded the first time they are needed.
let spellingWords = null;
async function wordList(id) {
  if (!spellingWords) {
    const { SPELLING_WORDS } = await import('../spelling-words.js');
    spellingWords = Object.fromEntries(Object.entries(SPELLING_WORDS).map(([k, v]) => [k, new Set(v.split(' '))]));
  }
  return spellingWords[id];
}

async function checkSpelling(step, el, button) {
  const inputs = [...el.querySelectorAll('.sp-in')];
  const empty = inputs.find((i) => !i.value.trim());
  if (empty) {
    toast('Write a word in every space first.');
    empty.focus();
    return false;
  }
  button.disabled = true;
  for (const rowEl of el.querySelectorAll('.sp-row[data-row]')) {
    const row = step.rows[Number(rowEl.dataset.row)];
    const list = await wordList(row.list);
    const spell = new RegExp(row.spell);
    const seen = new Set(row.given.map((w) => w.toLowerCase()));
    const notes = [];
    for (const input of rowEl.querySelectorAll('.sp-in')) {
      const word = input.value.trim().toLowerCase().replace(/[^a-z']/g, '');
      input.disabled = true;
      let why = '';
      if (seen.has(word)) why = 'is already in the list: write a new word';
      else if (!spell.test(word)) why = `isn’t spelled with ${row.label}`;
      else if (!list.has(word)) why = `doesn’t have the sound ${step.sound}, or it isn’t in the app’s word list. Listen:`;
      seen.add(word);
      input.classList.add(why ? 'no' : 'ok');
      notes.push(
        why
          ? `<span class="sp-no">✕ <b>${esc(word)}</b> ${esc(why)}${why.endsWith('Listen:') ? ` ${playButton(word, { label: '', round: true })}` : ''}</span>`
          : `<span class="sp-ok">✓ <b>${esc(word)}</b></span>`,
      );
    }
    const fb = rowEl.querySelector('.sp-fb');
    fb.hidden = false;
    fb.innerHTML = notes.join('');
  }
  el.dataset.checked = '1';
  return true;
}

function updateInterview(step, el) {
  const rows = [...el.querySelectorAll('[data-iv]')];
  const answered = rows.filter((r) => r.dataset.points !== undefined);
  const points = answered.reduce((n, r) => n + Number(r.dataset.points), 0);
  const done = answered.length === rows.length;
  el.querySelector('[data-iv-total]').innerHTML = `Your partner’s points: <b>${points}</b> / ${rows.length}${
    done
      ? ` — the first choices are the riskier ones: ${points >= rows.length / 2 ? 'your partner likes to take risks!' : 'your partner is more cautious.'} Now change roles.`
      : ''
  }`;
}

export function handlePracticeChange(target, root) {
  const build = target.closest('[data-build]');
  if (!build) return false;
  const v = Object.fromEntries([...build.querySelectorAll('[data-b]')].map((s) => [s.dataset.b, s.value]));
  const texts = buildTexts(v);
  for (const [line, text] of Object.entries(texts)) {
    build.querySelectorAll(`[data-bline="${line}"] [data-play], [data-bline="${line}"] [data-rec]`).forEach((b) => {
      b.dataset.text = text;
      b.setAttribute('aria-label', `${b.matches('[data-rec]') ? 'Record yourself saying' : 'Play'}: ${text}`);
    });
  }
  return true;
}

export function handlePracticeSubmit(form, root) {
  const item = form.closest('.item');
  const { step } = stepAt(root, form);
  if (!item || !step) return;
  const data = step.items[Number(item.dataset.item)];
  if (step.type === 'gap') return checkGap(root, step, item, form, data);
  if (step.type === 'write') return checkWrite(root, item, form, data);
  const typed = form.querySelector('input').value;
  if (!typed.trim()) return;
  const { ops, correct } = diffWords(data.answer, typed);
  item.dataset.typed = typed.trim();
  item.dataset.result = correct ? 'ok' : 'no';
  const fb = item.querySelector('[data-feedback]');
  fb.hidden = false;
  fb.innerHTML = correct
    ? `<span class="verdict ok">Correct!</span><span>${esc(data.answer)}</span>`
    : `<span class="verdict no">Check the differences:</span>
       <span class="diff">${ops.map((o) => `<span class="${o.op}" title="${o.op}">${esc(o.w)}</span>`).join('')}</span>
       <span class="muted">Answer: ${esc(data.answer)}</span>`;
  updateScore(root);
}

function checkWrite(root, item, form, data) {
  if (item.dataset.result) return;
  const typed = form.querySelector('input').value.trim();
  if (!typed) return;
  const { ok, typo } = writeCorrect(data, typed);
  item.dataset.typed = typed;
  item.dataset.result = ok ? 'ok' : 'no';
  form.querySelectorAll('input, button').forEach((el) => (el.disabled = true));
  const fb = item.querySelector('[data-feedback]');
  fb.hidden = false;
  fb.innerHTML = `<span class="verdict ${ok ? 'ok' : 'no'}">${ok ? 'Correct!' : 'Not quite.'}</span>
    <span>${ok ? '' : `You wrote “${esc(typed)}”. `}Answer: <b>${esc(data.answer)}</b>${typo ? ' (check the spelling)' : ''}</span>
    ${
      data.from
        ? `<span class="from">You hear it in <span class="q-mark">${renderMarkup(data.from)}</span></span>${playButton(spokenText(data.from), { label: 'Hear it' })}`
        : ''
    }`;
  updateScore(root);
}

function checkGap(root, step, item, form, data) {
  if (item.dataset.result) return;
  const typed = [...form.querySelectorAll('input')].map((el) => el.value.trim());
  if (typed.some((t) => !t)) return;
  const right = data.answer.map((a, k) => gapCorrect(a, typed[k]));
  const correct = right.every(Boolean);
  item.dataset.typed = typed.join(' / ');
  item.dataset.result = correct ? 'ok' : 'no';
  form.querySelectorAll('input, button').forEach((el) => (el.disabled = true));
  item.querySelectorAll('[data-blank]').forEach((blank, k) => {
    blank.textContent = data.answer[k];
    blank.classList.add('filled');
  });
  const answer = data.answer.join(' … ');
  const fb = item.querySelector('[data-feedback]');
  fb.hidden = false;
  const why = data.note || step.gapNote || '';
  fb.innerHTML = `<span class="verdict ${correct ? 'ok' : 'no'}">${correct ? 'Correct!' : 'Not quite.'}</span>
    <span>${correct ? '' : `You wrote “${esc(typed.join(' … '))}”. Answer: `}<b>${esc(answer)}</b>${
      data.ipa ? ` <span class="ipa">${esc(data.ipa)}</span>` : ''
    }${why ? ` — ${esc(why)}` : ''}</span>
    ${step.listenAfter ? playButton(itemSay(step, data), { label: 'Hear it' }) : ''}`;
  updateScore(root);
}
