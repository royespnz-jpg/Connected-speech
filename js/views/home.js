import { topics, topicGroups, SOURCES, topicById } from '../content.js';
import { exerciseSets } from '../exercises-data.js';
import { renderMarkup } from '../markup.js';
import { playButton, esc, sourceBadges } from '../ui.js';

function countExamples(topic) {
  return topic.sections.reduce((n, s) => n + (s.examples?.length || 0) + (s.dialogues?.reduce((m, d) => m + d.lines.length, 0) || 0), 0);
}

function topicCard(t) {
  return `<a class="card topic-card" href="#/topic/${t.id}">
    <h3>${esc(t.title)}</h3>
    <p>${esc(t.short)}</p>
    <div class="meta">${sourceBadges(t.sources)}<span class="badge">${countExamples(t)} audio examples</span></div>
  </a>`;
}

export function renderHome() {
  const demo = 'Did you eat your lunch yet?';
  return `
  <section class="hero">
    <div class="eyebrow">Connected speech · sandhi · North American English</div>
    <h1>Hear how English words run together.</h1>
    <p class="lede">In real speech, words aren't produced one by one — they link, merge, change and disappear.
      This lab turns two classic readings into examples you can <strong>see</strong>, <strong>hear</strong> with natural
      ElevenLabs voices, <strong>record yourself</strong> saying, and <strong>practice</strong>.</p>
    <div class="hero-demo">
      <div class="card demo-card">
        <div class="eyebrow">Word by word</div>
        <div class="big">Did · you · eat · your · lunch · yet?</div>
        <div class="row">${playButton(demo, { mode: 'words', main: true })}</div>
      </div>
      <div class="card demo-card">
        <div class="eyebrow">Connected</div>
        <div class="big">${renderMarkup('Di*d*_*y*ou_ea*t*_*y*our lunch yet?')}</div>
        <div class="row">${playButton(demo, { main: true })}${playButton(demo, { mode: 'slow' })}
          <span class="ipa muted">/dɪdʒə iytʃər lʌntʃ yɛt/</span></div>
      </div>
    </div>
  </section>

  <section class="home-section">
    <h2>Why it matters</h2>
    <p>A learner says her child swallowed a <em>pill</em>; the listener hears <em>peel</em>. Segmental mistakes like
      this usually cause small, repairable misunderstandings. Problems with connected speech, stress and rhythm are
      more serious: speech that doesn't link sounds choppy, wrong intonation can sound abrupt or rude, and very
      non-native rhythm may not be understood at all.</p>
    <p class="quote">Speech organs, “instead of taking a new position for each sound, tend to draw sounds together with
      the purpose of saving time and energy.” <span class="muted">— Clarey &amp; Dixson (1963), quoted in Celce-Murcia et al.</span></p>
    <p>Why do the changes happen? For <strong>ease of articulation</strong>, to keep English's <strong>preferred syllable
      structure</strong>, to <strong>preserve grammatical information</strong> — and above all to keep the regular,
      stress-timed <strong>rhythm</strong> of English by squeezing syllables between the stressed ones.</p>
  </section>

  <section class="home-section">
    <h2>Two ways to classify the changes</h2>
    <div class="frameworks">
      <div class="card framework">
        <div class="row">${sourceBadges(['CM'])}</div>
        <h3 style="margin-top:8px">Connected speech</h3>
        <ol>
          <li><a href="#/topic/contractions">Contractions, blends &amp; reductions</a></li>
          <li><a href="#/topic/linking">Linking</a> — smooth connection of sounds</li>
          <li><a href="#/topic/assimilation">Assimilation</a> — neighbors become more alike</li>
          <li><a href="#/topic/epenthesis">Dissimilation</a> — neighbors become less alike</li>
          <li><a href="#/topic/deletion">Deletion</a> — a sound disappears</li>
          <li><a href="#/topic/epenthesis">Epenthesis</a> — a sound is added</li>
        </ol>
      </div>
      <div class="card framework">
        <div class="row">${sourceBadges(['PR'])}</div>
        <h3 style="margin-top:8px">Sandhi — “placing together”</h3>
        <ol>
          <li><a href="#/topic/assimilation">Assimilation</a> — voicing or place becomes more similar</li>
          <li><a href="#/topic/weak-forms">Obscuration</a> — less clarity and effort (unstressed vowels)</li>
          <li><a href="#/topic/deletion">Omission</a> — a sound suggested by spelling is dropped</li>
          <li><a href="#/topic/epenthesis">Insertion</a> — a sound that makes the next one easier</li>
        </ol>
        <p class="muted" style="margin-top:10px;font-size:.9rem">Sandhi happens inside words (<em>internal</em>) and between
          words (<em>external</em>) through the same processes.</p>
      </div>
    </div>
  </section>

  ${topicGroups
    .map(
      (g) => `<section class="home-section">
      <h2>${esc(g.title)} <span class="badge ${g.source.toLowerCase()}" title="${esc(SOURCES[g.source].long)}">${esc(SOURCES[g.source].short)}</span></h2>
      <div class="grid">${g.ids.map((id) => topicCard(topicById(id))).join('')}</div>
    </section>`,
    )
    .join('')}

  <section class="home-section">
    <h2>Practice</h2>
    <div class="grid">
      <a class="card topic-card" href="#/practice"><h3>${exerciseSets.length} exercise sets</h3>
        <p>Name the process, gonna vs. going to, palatalized sounds, the -ty numbers, dictation…</p></a>
      <a class="card topic-card" href="#/lab"><h3>Connected Speech Lab</h3>
        <p>Type any sentence: see its links, merges and deletions, hear it, and record yourself.</p></a>
    </div>
  </section>

  <section class="home-section">
    <h2>How to read the examples</h2>
    <div class="legend-inline">
      <span>${renderMarkup('stop_it')} link</span>
      <span>${renderMarkup('stay_[y]up')} inserted sound</span>
      <span>${renderMarkup('choc(o)late')} not pronounced</span>
      <span>${renderMarkup('mi*ss*_*y*ou')} sounds that change</span>
    </div>
    <p class="muted" style="margin-top:14px">Transcriptions use the books' notation:</p>
    <div class="notation">
      <div><span>/y/</span> = IPA /j/</div><div><span>/iy/</span> = /iː/</div><div><span>/uw/</span> = /uː/</div>
      <div><span>/ey/</span> = /eɪ/</div><div><span>/ow/</span> = /oʊ/</div><div><span>/ay/ /aw/ /ɔy/</span> = /aɪ aʊ ɔɪ/</div>
      <div><span>[ɾ]</span> = flap (“d-like t”)</div><div><span>[t̚]</span> = unreleased</div><div><span>n̩ l̩</span> = syllabic</div>
    </div>
  </section>

  <p class="muted" style="font-size:.85rem">Based on: ${esc(SOURCES.CM.long)}; ${esc(SOURCES.PR.long)}.
    Content is paraphrased for study; the original readings are not included. ${topics.length} topics.</p>`;
}
