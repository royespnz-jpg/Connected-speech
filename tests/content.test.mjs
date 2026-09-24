import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { topics, topicGroups, orderedTopics } from '../js/content.js';
import { exerciseSets, itemSay, itemOptions, diffWords, normalizeWords } from '../js/exercises-data.js';
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
      const opts = itemOptions(set, item);
      assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < opts.length, `${set.id}: bad answer`);
      if (set.type === 'blank') {
        assert.ok(item.s.includes('___'));
        assert.ok(!itemSay(set, item).includes('___'));
      }
    }
  }
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
