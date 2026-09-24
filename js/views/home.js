import { topicGroups, SOURCES, topicById } from '../content.js';
import { exerciseSets } from '../exercises-data.js';
import { renderMarkup } from '../markup.js';
import { playButton, esc, sourceBadges, icons } from '../ui.js';

const DEMO = 'Did you eat your lunch yet?';

// A looping waveform: the path repeats every half width, so translating it by
// -50% loops seamlessly.
function wavePath(amp, periods, phase) {
  const W = 1200;
  const mid = 42;
  let d = '';
  for (let x = 0; x <= W; x += 8) {
    const env = 0.55 + 0.45 * Math.sin((x / W) * Math.PI * 4 + phase);
    const y = mid + amp * env * Math.sin((x / W) * periods * Math.PI * 2 + phase);
    d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
  }
  return d;
}

const MARQUEE = [
  ['Di*d*_*y*ou?', '/dɪdʒuw/'],
  ['stay_[y]up', '/stey yʌp/'],
  ['win(t)er', '= winner'],
  ["I'm *gonna* go", '/gənə/'],
  ['hot_dog', '[t̚d]'],
  ['less_serious', '[sː]'],
  ['Feb(r)uary', '/fɛbyuwɛriy/'],
  ['ask_(h)er', '/æskər/'],
  ['Pa*ss*_*y*our plate', '/pæʃər/'],
  ['go_[w]away', '/gow wəwey/'],
  ['choc(o)late', '/tʃɔklət/'],
  ['wa*t*er', '[wɔɾər]'],
];

function stage() {
  const w = (html) => `<span class="w">${html}</span>`;
  const lk = (k) => `<span class="lk" style="--k:${k}" aria-hidden="true"></span><span class="sr-only"> </span>`;
  const phrase =
    w('Di<b class="hl">d</b>') + lk(0) + w('<b class="hl">y</b>ou') + lk(1) + w('ea<b class="hl">t</b>') + lk(2) +
    w('<b class="hl">y</b>our') + ' ' + w('lunch') + ' ' + w('yet?');
  return `<div class="stage" data-stage>
    <div class="eyebrow">Hear the difference</div>
    <div>
      <div class="stage-toggle" data-mode="natural" role="group" aria-label="How to say it">
        <button type="button" data-stage-mode="words" aria-pressed="false">Word by word</button>
        <button type="button" data-stage-mode="natural" aria-pressed="true">Connected</button>
      </div>
    </div>
    <div class="stage-phrase" data-mode="natural" aria-label="${esc(DEMO)}">${phrase}</div>
    <div class="ipa" data-stage-ipa>/dɪdʒə iytʃər lʌntʃ yɛt/</div>
    <div class="wave" aria-hidden="true">
      <svg viewBox="0 0 1200 84" preserveAspectRatio="none"><g>
        <path class="w3" d="${wavePath(16, 10, 1.3)}"/>
        <path class="w2" d="${wavePath(22, 6, 0.4)}"/>
        <path class="w1" d="${wavePath(30, 8, 0)}"/>
      </g></svg>
    </div>
    <div class="row">
      ${playButton(DEMO, { main: true, label: 'Listen' }).replace('data-play', 'data-play data-stage-play')}
      ${playButton(DEMO, { mode: 'slow' })}
    </div>
  </div>`;
}

function indexRows() {
  let n = 0;
  return topicGroups
    .map(
      (g) => `<section class="home-section">
      <div class="row" style="justify-content:space-between;align-items:flex-end">
        <h2 style="margin:0">${esc(g.title)}</h2>
        <span class="badge ${g.source.toLowerCase()}" title="${esc(SOURCES[g.source].long)}">${esc(SOURCES[g.source].short)}</span>
      </div>
      <ul class="index-list">${g.ids
        .map((id) => {
          const t = topicById(id);
          n++;
          return `<li><a class="index-row" href="#/topic/${t.id}">
            <span class="idx">${String(n).padStart(2, '0')}</span>
            <span><span class="t">${esc(t.title)}</span><span class="s">${esc(t.short)}</span></span>
            <span class="go" aria-hidden="true">${icons.arrowR}</span></a></li>`;
        })
        .join('')}</ul>
    </section>`,
    )
    .join('');
}

export function renderHome() {
  const marquee = MARQUEE.map(([m, ipa]) => `<span>${renderMarkup(m)}<i>${esc(ipa)}</i></span>`).join('');
  return `
  <section class="hero">
    <div>
      <p class="kicker">Connected speech · Sandhi · American English</p>
      <h1>
        <span class="line"><span style="--l:0">Words don't</span></span>
        <span class="line"><span style="--l:1">stop at</span></span>
        <span class="line"><span style="--l:2"><em>the spaces.</em></span></span>
      </h1>
      <p class="lede">Real English runs together: sounds link, merge, change and disappear. See every change,
        hear it in natural ElevenLabs voices, record yourself, and practice until it sounds right.</p>
      <div class="row hero-cta">
        <a class="btn primary" href="#/topic/linking">Start with linking ${icons.arrowR}</a>
        <a class="btn" href="#/lab">Open the Lab</a>
      </div>
    </div>
    ${stage()}
  </section>

  <div class="marquee" aria-hidden="true"><div class="marquee-track">${marquee}${marquee}</div></div>

  <section class="home-section split">
    <div>
      <p class="kicker">Why it matters</p>
      <h2>A misheard <em>pill</em> is a small problem.</h2>
      <div class="minimal-pair"><span>pill</span><span class="vs">heard as</span><s>peel</s></div>
      <p class="muted">A wrong vowel usually causes a quick, repairable misunderstanding.</p>
    </div>
    <div>
      <p>Speech that never links sounds <strong>choppy</strong>. The wrong rhythm or intonation can sound abrupt or even rude,
        and rhythm that is far from native may not be understood at all. Connected speech keeps the regular,
        stress-timed beat of English by squeezing syllables between the stressed ones.</p>
      <blockquote class="pull">Instead of taking a new position for each sound, the speech organs tend to draw sounds together
        to save time and energy.<cite>Clarey &amp; Dixson (1963), in Celce-Murcia et al.</cite></blockquote>
    </div>
  </section>

  <section class="home-section">
    <p class="kicker">Two ways to classify the changes</p>
    <h2>Same phenomena, <em>two lenses.</em></h2>
    <div class="frameworks">
      <div class="card framework">
        ${sourceBadges(['CM'])}
        <h3>Connected speech</h3>
        <ol>
          <li><a href="#/topic/contractions">Contractions, blends &amp; reductions</a></li>
          <li><a href="#/topic/linking">Linking</a> — the smooth connection of sounds</li>
          <li><a href="#/topic/assimilation">Assimilation</a> — neighbors become more alike</li>
          <li><a href="#/topic/epenthesis">Dissimilation</a> — neighbors become less alike</li>
          <li><a href="#/topic/deletion">Deletion</a> — a sound disappears</li>
          <li><a href="#/topic/epenthesis">Epenthesis</a> — a sound is added</li>
        </ol>
      </div>
      <div class="card framework">
        ${sourceBadges(['PR'])}
        <h3>Sandhi — “placing together”</h3>
        <ol>
          <li><a href="#/topic/assimilation">Assimilation</a> — voicing or place becomes more similar</li>
          <li><a href="#/topic/weak-forms">Obscuration</a> — less clarity and effort in unstressed syllables</li>
          <li><a href="#/topic/deletion">Omission</a> — a sound suggested by spelling is dropped</li>
          <li><a href="#/topic/epenthesis">Insertion</a> — a sound that makes the next one easier</li>
        </ol>
      </div>
    </div>
  </section>

  ${indexRows()}

  <section class="home-section cta-grid">
    <a class="cta-card dark" href="#/practice">
      <span class="arrow" aria-hidden="true">${icons.arrowR}</span>
      <span class="big-num">${exerciseSets.length}</span>
      <h3>Exercise sets</h3>
      <p>Name the process, gonna or going to, palatalized sounds, the -ty numbers, dictation at real speed.</p>
    </a>
    <a class="cta-card" href="#/lab">
      <span class="arrow" aria-hidden="true">${icons.arrowR}</span>
      <span class="big-num">${renderMarkup('_')}</span>
      <h3>The Lab</h3>
      <p>Type any sentence: see where it links, merges and drops sounds, hear it, and record yourself.</p>
    </a>
  </section>

  <section class="home-section">
    <p class="kicker">How to read the examples</p>
    <div class="legend-inline">
      <span><span class="sample">${renderMarkup('stop_it')}</span> link</span>
      <span><span class="sample">${renderMarkup('stay_[y]up')}</span> inserted sound</span>
      <span><span class="sample">${renderMarkup('choc(o)late')}</span> not pronounced</span>
      <span><span class="sample">${renderMarkup('mi*ss*_*y*ou')}</span> sounds that change</span>
    </div>
    <p class="muted" style="margin-top:22px">Transcriptions use the books' notation:</p>
    <div class="notation">
      <div><span>/y/</span> = IPA /j/</div><div><span>/iy/</span> = /iː/</div><div><span>/uw/</span> = /uː/</div>
      <div><span>/ey/</span> = /eɪ/</div><div><span>/ow/</span> = /oʊ/</div><div><span>/ay aw ɔy/</span> = /aɪ aʊ ɔɪ/</div>
      <div><span>[ɾ]</span> = flap (“d-like t”)</div><div><span>[t̚]</span> = unreleased</div><div><span>n̩ l̩</span> = syllabic</div>
    </div>
  </section>

  <p class="colophon">Based on ${esc(SOURCES.CM.long)} and ${esc(SOURCES.PR.long)}. Content is paraphrased for study;
    the original readings are not included.</p>`;
}

// Toggle between the word-by-word and connected versions on the stage.
export function handleStageClick(target) {
  const btn = target.closest('[data-stage-mode]');
  if (!btn) return false;
  const stageEl = btn.closest('[data-stage]');
  const mode = btn.dataset.stageMode;
  stageEl.querySelector('.stage-toggle').dataset.mode = mode;
  stageEl.querySelectorAll('[data-stage-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  stageEl.querySelector('.stage-phrase').dataset.mode = mode;
  stageEl.querySelector('[data-stage-ipa]').textContent =
    mode === 'words' ? '/dɪd · yuw · iyt · yʊr · lʌntʃ · yɛt/' : '/dɪdʒə iytʃər lʌntʃ yɛt/';
  stageEl.querySelector('[data-stage-play]').dataset.mode = mode;
  stageEl.style.setProperty('--arc-delay', '60ms');
  return true;
}
