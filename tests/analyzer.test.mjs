import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, wordEnd, wordStart } from '../js/analyzer.js';

const types = (text) => analyze(text).findings.map((f) => f.type);
const find = (text, type) => analyze(text).findings.find((f) => f.type === type);

test('word endings from spelling', () => {
  assert.deepEqual(wordEnd('send'), { vowel: false, coda: ['n', 'd'] });
  assert.deepEqual(wordEnd('take'), { vowel: false, coda: ['k'] });
  assert.deepEqual(wordEnd('pushed'), { vowel: false, coda: ['ʃ', 't'] });
  assert.deepEqual(wordEnd('loves'), { vowel: false, coda: ['v', 'z'] });
  assert.deepEqual(wordEnd('wants'), { vowel: false, coda: ['n', 't', 's'] });
  assert.deepEqual(wordEnd('stay'), { vowel: true, glide: 'y' });
  assert.deepEqual(wordEnd('go'), { vowel: true, glide: 'w' });
  assert.deepEqual(wordEnd('spa'), { vowel: true, glide: null });
});

test('word beginnings from spelling', () => {
  assert.deepEqual(wordStart('your'), { vowel: false, onset: 'y' });
  assert.deepEqual(wordStart('united'), { vowel: false, onset: 'y' });
  assert.deepEqual(wordStart('hour'), { vowel: true });
  assert.deepEqual(wordStart('church'), { vowel: false, onset: 'tʃ' });
  assert.deepEqual(wordStart('county'), { vowel: false, onset: 'k' });
});

test('linking', () => {
  assert.ok(types('stop it').includes('link-cv'));
  assert.equal(find('send it', 'resyllabification').result, 'sen.dit');
  assert.equal(find('stay up', 'glide').result, '[y]');
  assert.equal(find('go away', 'glide').result, '[w]');
  assert.ok(types('less serious').includes('gemination'));
  assert.ok(types('hot dog').includes('unreleased'));
  assert.ok(types('big church').includes('unreleased'));
});

test('palatalization picks the right sound', () => {
  assert.equal(find('miss you', 'palatalization').result, '/ʃ/');
  assert.equal(find("Where's your fork?", 'palatalization').result, '/ʒ/');
  assert.equal(find('meet your brother', 'palatalization').result, '/tʃ/');
  assert.equal(find('Uncle Sam wants you.', 'palatalization').result, '/tʃ/');
  assert.equal(find('Did you see it?', 'palatalization').result, '/dʒ/');
  assert.equal(find("They haven't finished yet.", 'palatalization').result, '/tʃ/');
});

test('assimilation', () => {
  assert.equal(find('can go', 'nasal-assimilation').result, '/n/ → [ŋ]');
  assert.equal(find('in Paris', 'nasal-assimilation').result, '/n/ → [m]');
  assert.equal(find('good boy', 'place-assimilation').result, '/d/ → [b]');
  assert.ok(types('his shirt').includes('sibilant-assimilation'));
});

test('t/d deletion follows the /h y w r/ and /nt lt rt rd/ exceptions', () => {
  assert.ok(types('blind man').includes('td-deletion'));
  assert.ok(types('East side').includes('td-deletion'));
  assert.ok(!types('East hill').includes('td-deletion'));
  assert.ok(!types('old rags').includes('td-deletion'));
  assert.ok(!types('plant food').includes('td-deletion'));
  assert.ok(!types('felt pen').includes('td-deletion'));
  assert.ok(types('blind eye').includes('resyllabification'));
});

test('flaps, disappearing t and syncope', () => {
  assert.ok(types('get up').includes('flap'));
  assert.ok(types('water').includes('flap'));
  assert.ok(!types('late').includes('flap'));
  assert.ok(!types('nation').includes('flap'));
  assert.ok(types('twenty').includes('disappearing-t'));
  assert.ok(!types('until').includes('disappearing-t'));
  assert.equal(find('chocolate', 'syncope').mark, 'choc(o)late');
});

test('reductions depend on what follows', () => {
  assert.equal(find("I'm going to call you.", 'reduction').result, 'gonna');
  assert.equal(find("I'm going to church.", 'reduction'), undefined);
  assert.equal(find('I want to go.', 'reduction').result, 'wanna');
});

test('h-drop and weak forms', () => {
  assert.ok(types('ask her').includes('h-drop'));
  const at = analyze('What are you looking at?').findings.filter((f) => f.type === 'weak-form' && f.text === 'at');
  assert.equal(at[0].strong, true);
  const them = analyze('I saw them.').findings.find((f) => f.type === 'weak-form' && f.text === 'them');
  assert.equal(them.strong, false);
});

test('punctuation blocks linking across thought groups', () => {
  assert.ok(analyze('Stop. It is late.').findings.every((f) => f.text !== 'Stop It'));
  assert.equal(find('Yes, you can.', 'palatalization'), undefined);
});
