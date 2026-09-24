import { exerciseSets, setById, itemSay, itemOptions, diffWords } from '../exercises-data.js';
import { SOURCES } from '../content.js';
import { esc, playButton, sourceBadges, icons } from '../ui.js';

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
    <div class="scorebar" data-scorebar data-set="${set.id}" data-total="${itemCount(set)}">
      <span class="score" data-score>0 / ${itemCount(set)}</span>
      <div class="progress"><span data-bar style="width:0%"></span></div>
      <button type="button" class="btn" data-reset>Start over</button>
    </div>
    ${body}
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
  if (answered === total) saveBest(set.id, correct, total);
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
