import { orderedTopics as topics, topicById } from '../content.js';
import { esc, examplesList, tableHtml, dialogueHtml, sourceBadges, icons } from '../ui.js';

function sectionHtml(s) {
  return `<section class="section">
    <h2>${esc(s.h)}</h2>
    ${s.p || ''}
    ${s.rule ? `<div class="rule">${s.rule}</div>` : ''}
    ${s.bullets ? `<ul class="bullets">${s.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>` : ''}
    ${s.table ? tableHtml(s.table) : ''}
    ${s.examples?.length ? examplesList(s.examples) : ''}
    ${(s.dialogues || []).map(dialogueHtml).join('')}
    ${s.note ? `<div class="callout">${s.note}</div>` : ''}
  </section>`;
}

export function renderTopic(id) {
  const t = topicById(id);
  if (!t) return null;
  const i = topics.indexOf(t);
  const prev = topics[i - 1];
  const next = topics[i + 1];
  return `
  <header class="topic-head">
    <div class="eyebrow">Topic ${i + 1} of ${topics.length}</div>
    <h1>${esc(t.title)}</h1>
    <p class="lede">${esc(t.short)}</p>
    <div class="row">${sourceBadges(t.sources)}</div>
  </header>
  ${t.intro || ''}
  ${t.sections.map(sectionHtml).join('')}
  <nav class="pager" aria-label="Topics">
    ${prev ? `<a class="btn" href="#/topic/${prev.id}">${icons.arrowL}${esc(prev.title)}</a>` : '<span></span>'}
    ${next ? `<a class="btn" href="#/topic/${next.id}">${esc(next.title)}${icons.arrowR}</a>` : `<a class="btn primary" href="#/practice">Practice${icons.arrowR}</a>`}
  </nav>`;
}
