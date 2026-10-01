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
} from '../exercises-data.js';
import { SPEAKER_VOICE } from '../exercises-pp.js';
import { bookClip } from '../book-audio.js';
import { SOURCES } from '../content.js';
import { renderMarkup, spokenText } from '../markup.js';
import { esc, playButton, sourceBadges, icons, dialogueHtml, examplesList, bookAudio } from '../ui.js';
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

// ─── list ───────────────────────────────────────────────────────────────────

function setCard(set, progress) {
  const p = progress[set.id];
  const pct = p ? Math.round((100 * p.correct) / p.total) : 0;
  const repeat = set.type === 'repeat';
  return `<a class="card set-card" href="#/practice/${set.id}">
    <div class="row">${set.book ? `<span class="badge book">${esc(set.book)}</span>` : sourceBadges([set.source])}
      <span class="badge">${itemCount(set)} ${repeat ? 'sentences' : 'items'}</span></div>
    <h3 style="margin:6px 0 0">${esc(set.title)}</h3>
    <p>${esc(set.intro)}</p>
    ${
      repeat
        ? '<small class="muted">Listen · repeat · record</small>'
        : `<div class="progress" title="Best score: ${pct}%"><span style="width:${pct}%"></span></div>
    <small class="muted">${p ? `Best: ${p.correct}/${p.total}` : 'Not tried yet'}</small>`
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
      <p class="lede">Session VI from <em>Pronunciation Plus</em> (Units 36–37), plus exercises adapted from both readings.
        Every item has audio, and your best score is saved in this browser.</p>
    </header>
    ${groups}`;
}

// ─── a set ──────────────────────────────────────────────────────────────────

export function renderPracticeSet(id) {
  const set = setById(id);
  if (!set) return null;
  const idx = exerciseSets.indexOf(set);
  const next = exerciseSets[idx + 1];
  let body = '';
  if (set.type === 'choice' || set.type === 'blank') body = listenCard(set) + choiceItems(set);
  else if (set.type === 'pick') body = pickPassage(set);
  else if (set.type === 'dictation') body = dictationItems(set);
  else if (set.type === 'gap') body = gapItems(set);
  else if (set.type === 'hdrop') body = hdropConversations(set);
  else if (set.type === 'repeat') body = repeatSections(set);

  const scored = set.type !== 'repeat';
  return `<header class="topic-head">
      <div class="eyebrow"><a href="#/practice">Practice</a> · ${idx + 1} of ${exerciseSets.length}</div>
      <h1>${esc(set.title)}</h1>
      <p class="lede">${esc(set.intro)}</p>
      <div class="row">${sourceBadges([set.source])}${set.book ? `<span class="badge book">${esc(set.book)}</span>` : ''}</div>
    </header>
    ${bookAudio(set.tracks)}
    ${examplesSection(set)}
    ${
      scored
        ? `<div class="scorebar" data-scorebar data-set="${set.id}" data-total="${itemCount(set)}"
      data-attempt="${newId()}" data-started="${Date.now()}">
      <span class="score" data-score>0 / ${itemCount(set)}</span>
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

// A conversation to listen to before answering; its text stays blurred until
// the set is finished or the student asks for it.
function listenCard(set) {
  if (!set.dialogue) return '';
  return `<div class="listen-card" data-listen-card data-transcript="hidden">
    ${dialogueHtml(set.dialogue, { playLabel: 'Play the conversation' })}
    <button type="button" class="btn" data-show-text>Show the text</button>
  </div>`;
}

function choiceItems(set) {
  // When the audio would give the answer away, it appears after answering.
  const after = set.type === 'blank' || set.listenAfter;
  return `<ol class="items">${set.items
    .map((item, i) => {
      const opts = itemOptions(set, item);
      const say = itemSay(set, item);
      const q =
        set.type === 'blank'
          ? esc(item.s).replace('___', '<span class="blank" data-blank>&nbsp;</span>')
          : item.m
            ? `<span class="q-mark" data-q-mark>${renderMarkup(item.m)}</span>`
            : item.q;
      const listen = say && !after ? playButton(say, { label: 'Listen' }) : '';
      const reveal = item.dialogue
        ? dialogueHtml({ lines: item.dialogue }, { playLabel: 'Play the conversation' })
        : say && after
          ? playButton(say, { label: 'Hear it' })
          : '';
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

// Listen-and-repeat lines shown above any exercise.
function examplesSection(set) {
  if (!set.examples?.length) return '';
  return `<section class="section examples-first"><h2>Listen and repeat</h2>
    ${examplesList(set.examples.map((e) => (typeof e === 'string' ? { m: e } : e)))}</section>`;
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

function pickPassage(set) {
  const html = set.lines
    ? `<ol class="pick-lines">${set.lines.map((l) => `<li>${pickWords(l)}</li>`).join('')}</ol>`
    : pickWords(set.passage);
  return `<div class="card">
      <div class="row" style="margin-bottom:10px">${playButton(pickText(set), { label: set.lines ? 'Listen to the sentences' : 'Listen to the passage' })}</div>
      <div class="passage" data-passage>${html}</div>
      <div class="row" style="margin-top:14px">
        <button type="button" class="btn primary" data-check-pick>Check</button>
        <span class="muted" data-pick-count>0 selected</span>
      </div>
      <div class="callout" data-pick-explain hidden><p>${set.explain}</p></div>
      ${set.reveal ? `<div data-pick-reveal hidden><h3 class="reveal-h">Listen, repeat and check</h3>${examplesList(set.reveal.map((m) => ({ m })))}</div>` : ''}
    </div>`;
}

function dictationItems(set) {
  return `<ol class="items">${set.items
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
function gapItems(set) {
  const compare = set.compare?.length
    ? `<section class="section compare">
        <h2>Listen and compare</h2>
        ${examplesList(set.compare.flat().map((m) => ({ m })))}
      </section>`
    : '';
  const items = set.items
    .map((item, i) => {
      const id = `gap-${++gapSeq}`;
      const full = itemSay(set, item);
      const b = esc(item.b).replace(/___/g, '<span class="blank" data-blank>&nbsp;</span>');
      return `<li class="card item gap-item" data-item="${i}" id="${id}">
        <div class="item-q"><div class="q muted">Conversation ${i + 1}</div>
          <div class="row">
            <button type="button" class="pbtn main" data-play-dialogue="${id}">${icons.play}<span>Play</span></button>
            ${bookClip(full) ? '' : playButton(full, { mode: 'slow', voice: 'B' })}
          </div></div>
        <ol class="dlg-lines">
          <li class="dlg-line voice-A"><span class="who" aria-hidden="true">A</span>
            <span class="said">${esc(item.a)}</span>${playButton(item.a, { voice: 'A', label: '', round: true })}</li>
          <li class="dlg-line voice-B"><span class="who" aria-hidden="true">B</span>
            <span class="said">${b}</span>${playButton(full, { voice: 'B', label: '', round: true })}</li>
        </ol>
        <form data-dict-form class="gap-form row">
          ${item.answer
            .map(
              (_, k) => `<input class="dict-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
            aria-label="Missing word ${item.answer.length > 1 ? `${k + 1} ` : ''}in conversation ${i + 1}"
            placeholder="${item.answer.length > 1 ? `Word ${k + 1}…` : 'The missing word…'}">`,
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
  return esc(text).replace(
    /\{(\^?)([^}]+)\}/g,
    (_, drop, w) => {
      const [, h, rest] = w.match(/^(w?h)(.*)$/i); // the letters spelling /h/: h, or wh in "who"
      return `<button type="button" class="hw" data-drop="${drop ? 1 : 0}" aria-pressed="false"><span class="h">${h}</span>${rest}</button>`;
    },
  );
}

function hdropConversations(set) {
  const convs = set.conversations
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
      <div class="callout" data-h-explain hidden><p>${set.explain}</p></div>
    </div>`;
}

function repeatSections(set) {
  return set.sections
    .map(
      (sec) => `<section class="section">
        <h2>${esc(sec.h)}</h2>
        ${sec.note ? `<p class="muted">${esc(sec.note)}</p>` : ''}
        ${examplesList(sec.items.map((it) => (typeof it === 'string' ? { m: it } : it)))}
      </section>`,
    )
    .join('');
}

// ─── interaction (called from app.js on click / submit) ─────────────────────

function updateScore(root) {
  const bar = root.querySelector('[data-scorebar]');
  if (!bar) return;
  const set = setById(bar.dataset.set);
  const total = Number(bar.dataset.total);
  let correct = 0;
  let answered = 0;
  if (set.type === 'pick') {
    answered = root.querySelector('[data-passage]').dataset.checked ? total : 0;
    correct = root.querySelectorAll('.pw.correct').length;
  } else if (set.type === 'hdrop') {
    answered = root.querySelector('[data-hd]').dataset.checked ? total : 0;
    correct = root.querySelectorAll('.hw.ok').length;
  } else {
    root.querySelectorAll('.item').forEach((el) => {
      if (el.dataset.result) answered++;
      if (el.dataset.result === 'ok') correct++;
    });
  }
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

function collectAnswers(root, set) {
  if (set.type === 'pick') {
    const rows = [];
    root.querySelectorAll('.pw').forEach((b) => {
      const word = b.textContent;
      if (b.classList.contains('correct')) rows.push({ prompt: word, answer: 'marked', expected: 'marked', correct: true });
      if (b.classList.contains('wrong')) rows.push({ prompt: word, answer: 'marked', expected: 'not marked', correct: false });
      if (b.classList.contains('missed')) rows.push({ prompt: word, answer: 'not marked', expected: 'marked', correct: false });
    });
    return rows.map((r, i) => ({ n: i + 1, ...r }));
  }
  if (set.type === 'hdrop') {
    const words = hWords(set);
    return [...root.querySelectorAll('.hw')].map((b, i) => ({
      n: i + 1,
      prompt: `Conversation ${words[i].conv + 1}: ${words[i].word}`,
      answer: b.classList.contains('sel') ? 'no /h/' : '/h/',
      expected: words[i].drop ? 'no /h/' : '/h/',
      correct: b.classList.contains('ok'),
    }));
  }
  return [...root.querySelectorAll('.item')].map((el) => {
    const i = Number(el.dataset.item);
    const item = set.items[i];
    if (set.type === 'dictation') {
      return { n: i + 1, prompt: `Dictation ${i + 1}`, answer: el.dataset.typed || '', expected: item.answer, correct: el.dataset.result === 'ok' };
    }
    if (set.type === 'gap') {
      return { n: i + 1, prompt: `${item.a} / ${item.b}`, answer: el.dataset.typed || '', expected: item.answer.join(' / '), correct: el.dataset.result === 'ok' };
    }
    const opts = itemOptions(set, item);
    return {
      n: i + 1,
      prompt: set.type === 'blank' ? item.s : item.m ? spokenText(item.m) : textOf(item.q),
      answer: opts[Number(el.dataset.chosen)] ?? '',
      expected: opts[item.answer],
      correct: el.dataset.result === 'ok',
    };
  });
}

function finish(root, set, correct, total) {
  const bar = root.querySelector('[data-scorebar]');
  if (bar.dataset.finished) return;
  bar.dataset.finished = '1';
  const started = Number(bar.dataset.started);
  root.csResult = {
    id: bar.dataset.attempt,
    setId: set.id,
    setTitle: set.title,
    correct,
    total,
    durationSec: Math.round((Date.now() - started) / 1000),
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    items: collectAnswers(root, set),
  };
  root.querySelector('[data-listen-card]')?.setAttribute('data-transcript', 'shown');
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

export function handlePracticeClick(target, root) {
  const opt = target.closest('.opt');
  if (opt && !opt.disabled) {
    const item = opt.closest('.item');
    const set = setById(root.querySelector('[data-scorebar]').dataset.set);
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
    const data = set.items[Number(item.dataset.item)];
    if (set.type === 'blank') {
      const blank = item.querySelector('[data-blank]');
      blank.textContent = itemOptions(set, data)[answer];
      blank.classList.add('filled');
    }
    if (data.after) item.querySelector('[data-q-mark]').innerHTML = renderMarkup(data.after);
    updateScore(root);
    return true;
  }

  if (target.closest('[data-show-text]')) {
    root.querySelector('[data-listen-card]')?.setAttribute('data-transcript', 'shown');
    return true;
  }

  const hw = target.closest('.hw');
  if (hw) {
    const wrap = hw.closest('[data-hd]');
    if (wrap.dataset.checked) return true;
    hw.classList.toggle('sel');
    hw.setAttribute('aria-pressed', String(hw.classList.contains('sel')));
    root.querySelector('[data-h-count]').textContent = `${wrap.querySelectorAll('.hw.sel').length} marked`;
    return true;
  }

  if (target.closest('[data-check-h]')) {
    const wrap = root.querySelector('[data-hd]');
    wrap.dataset.checked = '1';
    wrap.querySelectorAll('.hw').forEach((b) => {
      const drop = b.dataset.drop === '1';
      const sel = b.classList.contains('sel');
      b.disabled = true;
      b.classList.add(drop === sel ? 'ok' : 'no');
      if (drop) b.classList.add('dropped');
    });
    root.querySelector('[data-h-explain]').hidden = false;
    target.closest('[data-check-h]').disabled = true;
    updateScore(root);
    return true;
  }

  const pw = target.closest('.pw');
  if (pw) {
    const passage = pw.closest('[data-passage]');
    if (passage.dataset.checked) return true;
    pw.classList.toggle('sel');
    root.querySelector('[data-pick-count]').textContent = `${passage.querySelectorAll('.pw.sel').length} selected`;
    return true;
  }

  if (target.closest('[data-check-pick]')) {
    const set = setById(root.querySelector('[data-scorebar]').dataset.set);
    const passage = root.querySelector('[data-passage]');
    const answers = new Set(set.answers);
    passage.dataset.checked = '1';
    passage.querySelectorAll('.pw').forEach((b) => {
      const right = answers.has(b.dataset.word);
      const sel = b.classList.contains('sel');
      b.classList.remove('sel');
      if (right && sel) b.classList.add('correct');
      else if (!right && sel) b.classList.add('wrong');
      else if (right) b.classList.add('missed');
    });
    root.querySelector('[data-pick-explain]').hidden = false;
    const reveal = root.querySelector('[data-pick-reveal]');
    if (reveal) reveal.hidden = false;
    target.closest('[data-check-pick]').disabled = true;
    updateScore(root);
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

export function handlePracticeSubmit(form, root) {
  const item = form.closest('.item');
  const set = setById(root.querySelector('[data-scorebar]').dataset.set);
  const data = set.items[Number(item.dataset.item)];
  if (set.type === 'gap') return checkGap(root, item, form, data);
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

function checkGap(root, item, form, data) {
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
  fb.innerHTML = `<span class="verdict ${correct ? 'ok' : 'no'}">${correct ? 'Correct!' : 'Not quite.'}</span>
    <span>${correct ? '' : `You wrote “${esc(typed.join(' … '))}”. `}It's <b>${esc(answer)}</b>
    <span class="ipa">${esc(data.ipa || '')}</span>: the first syllable is just a short /ə/.</span>`;
  updateScore(root);
}
