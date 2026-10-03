import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { topics, topicGroups, orderedTopics } from '../js/content.js';
import {
  exerciseSets,
  exerciseGroups,
  itemSay,
  itemOptions,
  itemCount,
  diffWords,
  normalizeWords,
  hWords,
  hLineText,
  gapCorrect,
  pickText,
  stepsOf,
  isScored,
  linkTokens,
  writeCorrect,
} from '../js/exercises-data.js';
import { collectAudioItems } from '../js/audio-items.js';
import { parseMarkup, spokenText, renderMarkup } from '../js/markup.js';
import { audioKey, ttsTextFor } from '../js/audio-core.js';

test('markup: spoken text drops inserted sounds and link marks', () => {
  assert.equal(spokenText('stay_[y]up'), 'stay up');
  assert.equal(spokenText('choc(o)late'), 'chocolate');
  assert.equal(spokenText('hi*d*(e)_*y*our'), 'hide your');
  assert.equal(spokenText('ba*g**s*'), 'bags');
  assert.deepEqual(
    parseMarkup('be[y]ing').map((p) => p.t),
    ['text', 'ins', 'text'],
  );
  assert.match(renderMarkup('<b>_x'), /&lt;b&gt;/);
});

test('every topic is reachable and has content', () => {
  const grouped = topicGroups.flatMap((g) => g.ids);
  assert.equal(new Set(grouped).size, topics.length);
  assert.equal(orderedTopics.length, topics.length);
  for (const t of topics) {
    assert.ok(t.sections.length, t.id);
    for (const s of t.sections) {
      for (const ex of s.examples || []) {
        const text = ex.say || spokenText(ex.m);
        assert.ok(text.length > 0, `${t.id}: empty example`);
        assert.ok(!/[_[\]*]/.test(text), `${t.id}: markup left in spoken text: ${text}`);
        assert.ok(!/\s'|'\s/.test(text.replace(/'(em|im|cause|bout|round)\b/gi, '')), `${t.id}: stray apostrophe: ${text}`);
      }
    }
  }
});

test('exercise answers are valid', async () => {
  const { SPELLING_WORDS } = await import('../js/spelling-words.js');
  for (const set of exerciseSets) {
    const keys = [];
    for (const step of stepsOf(set)) {
      const id = set.steps ? `${set.id} ${step.key}` : set.id;
      if (step.after) assert.ok(keys.includes(step.after), `${id}: waits for a later or missing step`);
      keys.push(step.key);
      checkStep(step, id, SPELLING_WORDS);
    }
    assert.ok(itemCount(set) > 0, set.id);
  }
});

function checkStep(step, id, SPELLING_WORDS) {
  switch (step.type) {
    case 'repeat':
      assert.ok((step.items || step.sections).length > 0, id);
      return;
    case 'dialogues':
      for (const d of step.dialogues) assert.ok(d.lines.every((l) => l.who && l.m), id);
      return;
    case 'speak':
    case 'build':
    case 'interview':
      return;
    case 'hdrop': {
      const words = hWords(step);
      assert.ok(words.some((w) => w.drop) && words.some((w) => !w.drop), id);
      for (const w of words) assert.match(w.word, /^w?h/i, `${id}: ${w.word} is not an h-word`);
      return;
    }
    case 'pick': {
      const words = new Set(pickText(step).toLowerCase().match(/[a-z]+/g));
      for (const a of step.answers) assert.ok(words.has(a), `${id}: ${a} not in passage`);
      return;
    }
    case 'link':
      step.lines.forEach((m, i) => {
        const { words, links } = linkTokens(m);
        assert.ok(Object.keys(links).length > 0 && words.length > 1, `${id}: line ${i + 1} has no link`);
        if (step.glides) for (const g of Object.values(links)) assert.match(g, /^[wy]$/, `${id}: line ${i + 1} needs /w/ or /y/`);
      });
      return;
    case 'select':
      assert.ok(step.answers.length && step.answers.every((a) => a >= 0 && a < step.options.length), id);
      return;
    case 'write':
      for (const item of step.items) assert.ok(writeCorrect(item, item.answer).ok, `${id}: “${item.answer}” should be right`);
      return;
    case 'spelling':
      for (const row of step.rows) {
        const list = new Set(SPELLING_WORDS[row.list].split(' '));
        for (const w of row.given.filter((g) => /^[a-z]+$/.test(g))) {
          assert.ok(list.has(w) && new RegExp(row.spell).test(w), `${id}: the book's “${w}” should be accepted in row ${row.label}`);
        }
      }
      return;
  }
  for (const item of step.items) {
    if (step.type === 'dictation') {
      assert.ok(diffWords(item.answer, item.say).correct, `${id}: "${item.say}" should match "${item.answer}"`);
      continue;
    }
    if (step.type === 'gap') {
      assert.equal(item.b.split('___').length - 1, item.answer.length, `${id}: one answer per blank`);
      for (const a of item.answer) assert.ok(itemSay(step, item).includes(a), id);
      continue;
    }
    if (item.m) assert.ok(!/[_[\]*]/.test(itemSay(step, item)), `${id}: markup left in ${itemSay(step, item)}`);
    const opts = itemOptions(step, item);
    assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < opts.length, `${id}: bad answer`);
    if (step.type === 'blank') {
      assert.ok(item.s.includes('___'));
      assert.ok(!itemSay(step, item).includes('___'));
    }
  }
}

test('every exercise set is listed under a group', () => {
  const ids = new Set(exerciseGroups.map((g) => g.id));
  for (const set of exerciseSets) assert.ok(ids.has(set.group || 'readings'), set.id);
  assert.equal(new Set(exerciseSets.map((s) => s.id)).size, exerciseSets.length);
});

test('Session VI answers match the book recordings', () => {
  const step = (setId, key) => exerciseSets.find((s) => s.id === setId).steps.find((st) => st.key === key);
  const wy = step('pp-36', '6');
  for (const item of wy.items) {
    const glide = item.after.match(/_\[([wy])\]/)[1];
    assert.equal(wy.options[item.answer], glide, item.m);
  }
  // Exercise 8: five two-line conversations, each reply used once.
  const conv = step('pp-36', '8');
  assert.equal(new Set(conv.items.map((i) => i.answer)).size, conv.items.length);
  // Exercise 1: answered from the sentences of exercises 4 and 5.
  const q = step('pp-36', '1');
  assert.ok(writeCorrect(q.items[0], 'on thrusday').ok && !writeCorrect(q.items[0], 'Friday').ok);
  assert.ok(writeCorrect(q.items[1], 'an umbrella').ok);
  assert.ok(writeCorrect(q.items[2], 'Saturday').ok && !writeCorrect(q.items[2], 'Thursday evening').ok);
  // Unit 37, track 08: item 6 has two blanks, item 7 is "asleep".
  const short = step('pp-37', '2');
  assert.equal(itemSay(short, short.items[5]), "Yes. It's about five minutes away.");
  assert.equal(itemSay(short, short.items[6]), "Sorry, he's asleep right now.");
  assert.ok(gapCorrect('across', ' Across. ') && !gapCorrect('across', 'cross'));
  // Unit 37, track 10: the /h/ is lost in exactly these words.
  const lost = hWords(step('pp-37', '4')).filter((w) => w.drop).map((w) => w.word);
  assert.deepEqual(lost, ['him', 'who', 'he', 'her', 'him', 'his', 'him', 'have', 'he', 'him']);
  assert.equal(hLineText('Did {^he} tell {^her}?'), 'Did he tell her?');
  // …and exercise 6 shows those links: "Have they found‿him?"
  assert.equal(step('pp-37', '6').dialogues[0].lines[0].m, 'Have they found_(h)im?');
  // Pronunciation Pairs 1: every sentence has one /ow/ link; the replies are a one-to-one match.
  const linking = step('pairs-1', 'E2');
  for (const m of linking.lines) assert.deepEqual(Object.values(linkTokens(m).links), ['w'], m);
  const scrambled = step('pairs-1', 'F1');
  assert.equal(new Set(scrambled.items.map((i) => i.answer)).size, scrambled.items.length);
  assert.equal(scrambled.options[scrambled.items[0].answer], "No, I don't.");
  assert.deepEqual(step('pairs-5', 'F1').items.map((i) => i.answer), [1, 1, 0, 0]);
  assert.deepEqual(step('pairs-3', 'B1').lines.map((m) => linkTokens(m).links), [{ 2: 'y' }, { 0: 'w' }, { 3: 'y' }, { 2: 'y' }, { 0: 'w' }, { 2: 'y' }, { 0: 'y' }]);
  assert.ok(isScored(step('pairs-8', 'E3')) && !isScored(step('pairs-8', 'E2')));
});

test('dictation checking accepts reduced spellings and contractions', () => {
  assert.ok(diffWords('What do you want to do tonight?', 'what do you wanna do tonight').correct);
  assert.ok(diffWords("I'm going to ask her about it.", 'I am gonna ask her about it').correct);
  assert.ok(!diffWords('Did you eat yet?', 'Did you eat').correct);
  assert.deepEqual(normalizeWords("Tell 'em"), ['tell', 'them']);
});

test('audio keys are stable and unique', () => {
  const items = collectAudioItems();
  assert.equal(new Set(items.map((i) => i.key)).size, items.length);
  assert.equal(audioKey('stay up', 'natural', 'A'), audioKey('stay up', 'natural', 'A'));
  assert.notEqual(audioKey('stay up', 'natural', 'A'), audioKey('stay up', 'slow', 'A'));
  assert.equal(ttsTextFor('stay up', 'natural'), 'stay up');
  assert.match(ttsTextFor('stay up', 'words'), /stay <break time="[\d.]+s"\/> up/);
});

test('manifest only points at files that exist', () => {
  const manifest = JSON.parse(readFileSync(new URL('../audio/manifest.json', import.meta.url)));
  for (const path of Object.values(manifest.items)) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `missing ${path}`);
  }
});

test('a set names its book recordings until they are connected', async () => {
  const { bookAudio } = await import('../js/ui.js');
  const { BOOK_TRACKS } = await import('../js/book-audio.js');
  assert.equal(bookAudio(), '');
  const saved = BOOK_TRACKS['pp-04'].drive;
  BOOK_TRACKS['pp-04'].drive = '';
  assert.match(bookAudio(['pp-04']), /Book recording: Pronunciation Plus · Track 04/);
  BOOK_TRACKS['pp-04'].drive = 'abc_123-XYZ';
  assert.match(bookAudio(['pp-04']), /<iframe src="https:\/\/drive\.google\.com\/file\/d\/abc_123-XYZ\/preview"/);
  BOOK_TRACKS['pp-04'].drive = saved;
});

test('book recordings: every Session VI line with a track has a clip, and every clip has its line', async () => {
  const { BOOK_TRACKS, BOOK_CLIPS, bookClip } = await import('../js/book-audio.js');
  const { exampleText } = await import('../js/audio-items.js');
  const { spokenText } = await import('../js/markup.js');
  const used = new Set();
  for (const set of exerciseSets.filter((s) => s.steps)) {
    for (const t of set.tracks) assert.ok(BOOK_TRACKS[t], `${set.id}: no track ${t}`);
    for (const step of set.steps) {
      const lines = [];
      const add = (t) => lines.push(t);
      const addEx = (it) => add(exampleText(typeof it === 'string' ? { m: it } : it));
      if (step.type === 'repeat') step.items.forEach(addEx);
      for (const d of step.dialogues || []) d.lines.forEach(addEx);
      for (const conv of step.conversations || []) for (const [, t] of conv) add(hLineText(t));
      if (step.type === 'link') step.lines.forEach((m) => add(spokenText(m)));
      for (const item of step.items || []) {
        if (step.type === 'write') add(spokenText(item.from));
        else if (item.dialogue) item.dialogue.forEach(addEx);
        else if (!['repeat', 'interview'].includes(step.type)) {
          if (step.type === 'gap' && item.a) add(item.a);
          if (itemSay(step, item)) add(itemSay(step, item));
        }
      }
      lines.forEach((t) => used.add(t));
      if (!step.track) continue;
      assert.ok(set.tracks.includes(step.track), `${set.id} ${step.key}: ${step.track} is not one of the set's tracks`);
      for (const t of lines) {
        assert.ok(BOOK_CLIPS[t], `${set.id} ${step.key}: no clip for "${t}"`);
        assert.ok(set.tracks.includes(BOOK_CLIPS[t][0]), `${set.id} ${step.key}: "${t}" is in the wrong track`);
      }
    }
  }
  const last = {};
  for (const [text, [track, start, end]] of Object.entries(BOOK_CLIPS)) {
    assert.ok(used.has(text), `clip without a line: "${text}"`);
    assert.ok(BOOK_TRACKS[track] && end - start > 0.4 && start >= (last[track] ?? 0), `bad times for "${text}"`);
    last[track] = end;
  }
  // Not played until the track has its Drive file.
  const saved = BOOK_TRACKS['pp-06'].drive;
  BOOK_TRACKS['pp-06'].drive = '';
  assert.equal(bookClip('Go ahead.'), null);
  BOOK_TRACKS['pp-06'].drive = 'abc-123';
  assert.deepEqual(bookClip('Go ahead.'), {
    track: 'pp-06',
    drive: 'abc-123',
    url: 'https://drive.google.com/uc?export=download&id=abc-123',
    start: BOOK_CLIPS['Go ahead.'][1],
    end: BOOK_CLIPS['Go ahead.'][2],
    label: BOOK_TRACKS['pp-06'].label,
  });
  BOOK_TRACKS['pp-06'].drive = saved;
  // Drive IDs look like Drive IDs.
  for (const [id, t] of Object.entries(BOOK_TRACKS)) assert.match(t.drive, /^([\w-]{25,})?$/, id);
});
