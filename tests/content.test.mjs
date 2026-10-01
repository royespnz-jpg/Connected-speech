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
} from '../js/exercises-data.js';
import { hLinked } from '../js/exercises-pp.js';
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
      const words = new Set(set.passage.toLowerCase().match(/[a-z]+/g));
      for (const a of set.answers) assert.ok(words.has(a), `${set.id}: ${a} not in passage`);
      continue;
    }
    for (const item of set.items) {
      if (set.type === 'dictation') {
        assert.ok(diffWords(item.answer, item.say).correct, `${set.id}: "${item.say}" should match "${item.answer}"`);
        continue;
      }
      if (set.type === 'gap') {
        assert.ok(item.b.includes('___') && item.answer, set.id);
        assert.ok(itemSay(set, item).includes(item.answer), set.id);
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

test('Session VI: /w/ or /y/ answers and the lost /h/', () => {
  const wy = exerciseSets.find((s) => s.id === 'pp36-wy');
  for (const item of wy.items) {
    const glide = item.after.match(/_\[([wy])\]/)[1];
    assert.equal(wy.options[item.answer], `/${glide}/`, item.m);
  }
  const pairs = exerciseSets.find((s) => s.id === 'pp36-pairs');
  assert.equal(new Set(pairs.items.map((i) => i.answer)).size, pairs.items.length);
  assert.equal(hLinked('Have they found {^him}?'), 'Have they found_(h)im?');
  assert.equal(hLinked("{He} must {^have} left."), 'He must_(h)ave left.');
  assert.equal(hLineText('Did {^he} tell {^her}?'), 'Did he tell her?');
  assert.equal(spokenText(hLinked('Did {^he} tell {^her}?')), 'Did he tell her?');
  const short = exerciseSets.find((s) => s.id === 'pp37-short');
  assert.ok(gapCorrect(short.items[0], ' Across. '));
  assert.ok(!gapCorrect(short.items[0], 'cross'));
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

test('book recordings play from the Drive preview player', async () => {
  const { bookAudio } = await import('../js/ui.js');
  assert.equal(bookAudio(), '');
  const html = bookAudio([{ label: 'Track 70', drive: 'abc_123-XYZ' }]);
  assert.match(html, /<iframe src="https:\/\/drive\.google\.com\/file\/d\/abc_123-XYZ\/preview"/);
  assert.match(html, /Track 70/);
});
