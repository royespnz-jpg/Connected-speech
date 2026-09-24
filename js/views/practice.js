import { exerciseSets, setById, itemSay, itemOptions, diffWords } from '../exercises-data.js';
import { SOURCES } from '../content.js';
import { esc, playButton, sourceBadges, icons } from '../ui.js';
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

function itemCount(set) {
  return set.type === 'pick' ? set.answers.length : set.items.length;
}

// ─── list ───────────────────────────────────────────────────────────────────

export function renderPracticeList() {
  const progress = loadProgress();
  const cards = exerciseSets
    .map((set) => {
      const p = progress[set.id];
      const pct = p ? Math.round((100 * p.correct) / p.total) : 0;
      return `<a class="card set-card" href="#/practice/${set.id}">
        <div class="row">${sourceBadges([set.source])}<span class="badge">${itemCount(set)} items</span></div>
        <h3 style="margin:6px 0 0">${esc(set.title)}</h3>
        <p>${esc(set.intro)}</p>
        <div class="progress" title="Best score: ${pct}%"><span style="width:${pct}%"></span></div>
        <small class="muted">${p ? `Best: ${p.correct}/${p.total}` : 'Not tried yet'}</small>
      </a>`;
    })
    .join('');
  return `<header class="topic-head">
      <div class="eyebrow">Practice</div>
      <h1>Exercises</h1>
      <p class="lede">Adapted from the exercises in both readings. Every item has audio, and your best score is saved in this browser.</p>
    </header>
    <div class="grid">${cards}</div>`;
}

// ─── a set ──────────────────────────────────────────────────────────────────

export function renderPracticeSet(id) {
  const set = setById(id);
  if (!set) return null;
  const idx = exerciseSets.indexOf(set);
  const next = exerciseSets[idx + 1];
  let body = '';
  if (set.type === 'choice' || set.type === 'blank') body = choiceItems(set);
  else if (set.type === 'pick') body = pickPassage(set);
  else if (set.type === 'dictation') body = dictationItems(set);

  return `<header class="topic-head">
      <div class="eyebrow"><a href="#/practice">Practice</a> · ${idx + 1} of ${exerciseSets.length}</div>
      <h1>${esc(set.title)}</h1>
      <p class="lede">${esc(set.intro)}</p>
      <div class="row">${sourceBadges([set.source])}</div>
    </header>
    <div class="scorebar" data-scorebar data-set="${set.id}" data-total="${itemCount(set)}"
      data-attempt="${newId()}" data-started="${Date.now()}">
      <span class="score" data-score>0 / ${itemCount(set)}</span>
      <div class="progress"><span data-bar style="width:0%"></span></div>
      <button type="button" class="btn" data-reset>Start over</button>
    </div>
    ${body}
    <div class="card done-panel" data-done hidden aria-live="polite"></div>
    <nav class="pager">
      <a class="btn" href="#/practice">${icons.arrowL}All exercises</a>
      ${next ? `<a class="btn primary" href="#/practice/${next.id}">${esc(next.title)}${icons.arrowR}</a>` : ''}
    </nav>
    <p class="muted" style="font-size:.85rem;margin-top:24px">Source: ${esc(SOURCES[set.source].long)}</p>`;
}

function choiceItems(set) {
  return `<ol class="items">${set.items
    .map((item, i) => {
      const opts = itemOptions(set, item);
      const say = itemSay(set, item);
      const q =
        set.type === 'blank'
          ? esc(item.s).replace('___', '<span class="blank" data-blank>&nbsp;</span>')
          : item.q;
      // For "blank" sets the audio would give the answer away, so it appears after answering.
      const listen = say && set.type !== 'blank' ? playButton(say, { label: 'Listen' }) : '';
      return `<li class="card item" data-item="${i}" data-answer="${item.answer}">
        <div class="item-q"><div class="q">${q}</div><div class="row">${listen}</div></div>
        <div class="options">${opts
          .map((o, k) => `<button type="button" class="opt" data-opt="${k}">${esc(o)}</button>`)
          .join('')}</div>
        <div class="feedback" data-feedback hidden>
          <span class="verdict"></span><span class="why">${item.explain || ''}</span>
          ${say && set.type === 'blank' ? playButton(say, { label: 'Hear it' }) : ''}
        </div>
      </li>`;
    })
    .join('')}</ol>`;
}

function pickPassage(set) {
  const words = set.passage.split(/(\s+)/);
  const html = words
    .map((w) => {
      if (/^\s+$/.test(w)) return w;
      const m = w.match(/^([A-Za-z]+)(.*)$/);
      if (!m) return esc(w);
      return `<button type="button" class="pw" data-word="${esc(m[1].toLowerCase())}">${esc(m[1])}</button>${esc(m[2])}`;
    })
    .join('');
  return `<div class="card">
      <div class="row" style="margin-bottom:10px">${playButton(set.passage, { label: 'Listen to the passage' })}</div>
      <div class="passage" data-passage>${html}</div>
      <div class="row" style="margin-top:14px">
        <button type="button" class="btn primary" data-check-pick>Check</button>
        <span class="muted" data-pick-count>0 selected</span>
      </div>
      <div class="callout" data-pick-explain hidden><p>${set.explain}</p></div>
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
  return [...root.querySelectorAll('.item')].map((el) => {
    const i = Number(el.dataset.item);
    const item = set.items[i];
    if (set.type === 'dictation') {
      return { n: i + 1, prompt: `Dictation ${i + 1}`, answer: el.dataset.typed || '', expected: item.answer, correct: el.dataset.result === 'ok' };
    }
    const opts = itemOptions(set, item);
    return {
      n: i + 1,
      prompt: set.type === 'blank' ? item.s : textOf(item.q),
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
    if (set.type === 'blank') {
      const blank = item.querySelector('[data-blank]');
      blank.textContent = itemOptions(set, set.items[Number(item.dataset.item)])[answer];
      blank.classList.add('filled');
    }
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
