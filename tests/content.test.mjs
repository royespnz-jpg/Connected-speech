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

test('exercise answers are valid', () => {
  for (const set of exerciseSets) {
    if (set.type === 'repeat') {
      assert.ok(itemCount(set) > 0, set.id);
      continue;
    }
    if (set.type === 'hdrop') {
      const words = hWords(set);
      assert.ok(words.some((w) => w.drop) && words.some((w) => !w.drop), set.id);
      for (const w of words) assert.match(w.word, /^w?h/i, `${set.id}: ${w.word} is not an h-word`);
      continue;
    }
    if (set.type === 'pick') {
      const words = new Set(pickText(set).toLowerCase().match(/[a-z]+/g));
      for (const a of set.answers) assert.ok(words.has(a), `${set.id}: ${a} not in passage`);
      continue;
    }
    for (const item of set.items) {
      if (set.type === 'dictation') {
        assert.ok(diffWords(item.answer, item.say).correct, `${set.id}: "${item.say}" should match "${item.answer}"`);
        continue;
      }
      if (set.type === 'gap') {
        assert.equal(item.b.split('___').length - 1, item.answer.length, `${set.id}: one answer per blank`);
        for (const a of item.answer) assert.ok(itemSay(set, item).includes(a), set.id);
        continue;
      }
      if (item.m) assert.ok(!/[_[\]*]/.test(itemSay(set, item)), `${set.id}: markup left in ${itemSay(set, item)}`);
      const opts = itemOptions(set, item);
      assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < opts.length, `${set.id}: bad answer`);
      if (set.type === 'blank') {
        assert.ok(item.s.includes('___'));
        assert.ok(!itemSay(set, item).includes('___'));
      }
    }
  }
});

test('every exercise set is listed under a group', () => {
  const ids = new Set(exerciseGroups.map((g) => g.id));
  for (const set of exerciseSets) assert.ok(ids.has(set.group || 'readings'), set.id);
  assert.equal(new Set(exerciseSets.map((s) => s.id)).size, exerciseSets.length);
});

test('Session VI answers match the book recordings', () => {
  const set = (id) => exerciseSets.find((s) => s.id === id);
  const wy = set('pp36-wy');
  for (const item of wy.items) {
    const glide = item.after.match(/_\[([wy])\]/)[1];
    assert.equal(wy.options[item.answer], `/${glide}/`, item.m);
  }
  // Track 08: item 6 has two blanks, item 7 is "asleep".
  const short = set('pp37-short');
  assert.equal(itemSay(short, short.items[5]), "Yes. It's about five minutes away.");
  assert.equal(itemSay(short, short.items[6]), "Sorry, he's asleep right now.");
  assert.ok(gapCorrect('across', ' Across. ') && !gapCorrect('across', 'cross'));
  // Track 10: the /h/ is lost in exactly these words.
  const lost = hWords(set('pp37-h')).filter((w) => w.drop).map((w) => w.word);
  assert.deepEqual(lost, ['him', 'who', 'he', 'her', 'him', 'his', 'him', 'have', 'he', 'him']);
  assert.equal(hLineText('Did {^he} tell {^her}?'), 'Did he tell her?');
  // Pronunciation Pairs: every sentence in practice 1 has one /ow/ link, and the replies are a one-to-one match.
  const linking = set('pairs-linking');
  assert.equal(itemCount(linking), linking.lines.length);
  for (const m of linking.reveal) assert.equal((m.match(/_\[w\]/g) || []).length, 1, m);
  const scrambled = set('pairs-scrambled');
  assert.equal(new Set(scrambled.items.map((i) => i.answer)).size, scrambled.items.length);
  assert.equal(scrambled.options[scrambled.items[0].answer], "No, I don't.");
  assert.deepEqual(set('pairs-gonna').items.map((i) => i.answer), [1, 1, 0, 0]);
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
  const lines = new Map(); // spoken text → track ids of every set that has the line
  for (const set of exerciseSets.filter((s) => s.tracks)) {
    const add = (t) => lines.set(t, new Set([...(lines.get(t) || []), ...set.tracks]));
    const addEx = (it) => add(exampleText(typeof it === 'string' ? { m: it } : it));
    for (const sec of set.sections || []) sec.items.forEach(addEx);
    for (const m of (set.compare || []).flat()) addEx(m);
    (set.examples || []).forEach(addEx);
    (set.reveal || []).forEach(addEx);
    for (const conv of set.conversations || []) for (const [, t] of conv) add(hLineText(t));
    for (const item of set.items || []) {
      if (item.dialogue) {
        for (const l of item.dialogue) add(spokenText(l.m));
        continue;
      }
      if (set.type === 'gap' && item.a) add(item.a);
      add(itemSay(set, item));
    }
  }
  for (const [text, tracks] of lines) {
    assert.ok(BOOK_CLIPS[text], `no clip for "${text}"`);
    assert.ok(tracks.has(BOOK_CLIPS[text][0]), `"${text}" is in the wrong track`);
  }
  const last = {};
  for (const [text, [track, start, end]] of Object.entries(BOOK_CLIPS)) {
    assert.ok(lines.has(text), `clip without a line: "${text}"`);
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
