// Every clip the app can play, so scripts/generate-audio.mjs can pre-generate
// them once with ElevenLabs and the site can serve them as static files.

import { topics } from './content.js';
import { exerciseSets, stepsOf, itemSay, hLineText, pickText } from './exercises-data.js';
import { SPEAKER_VOICE } from './exercises-pp.js';
import { spokenText } from './markup.js';
import { DEFAULT_VOICES, audioKey, wordsModeAllowed } from './audio-core.js';

export function exampleText(example) {
  return example.say || spokenText(example.m);
}

// voices maps the two speaker slots (A = main voice, B = second speaker in
// dialogues) to ElevenLabs voice IDs.
export function collectAudioItems(voices = DEFAULT_VOICES) {
  const items = new Map();
  const add = (text, mode, voice = 'A', where = '') => {
    if (!text) return;
    const voiceId = voices[voice] || voices.A;
    const key = audioKey(text, mode, voiceId);
    if (!items.has(key)) items.set(key, { key, text, mode, voice, voiceId, where });
  };

  for (const topic of topics) {
    for (const section of topic.sections) {
      for (const example of section.examples || []) {
        const text = exampleText(example);
        add(text, 'natural', 'A', topic.id);
        add(text, 'slow', 'A', topic.id);
        if (wordsModeAllowed(text)) add(text, 'words', 'A', topic.id);
      }
      for (const dialogue of section.dialogues || []) {
        for (const line of dialogue.lines) add(exampleText(line), 'natural', line.voice || 'A', topic.id);
      }
    }
  }

  const addExample = (example, where) => {
    const text = exampleText(example);
    const voice = example.voice || 'A';
    add(text, 'natural', voice, where);
    add(text, 'slow', voice, where);
    if (wordsModeAllowed(text)) add(text, 'words', voice, where);
  };
  const addLines = (lines, where) => {
    for (const line of lines) add(exampleText(line), 'natural', line.voice || 'A', where);
  };

  // Every line a practice step can play (a worksheet step, or a whole set).
  const addStep = (step, where) => {
    if (step.type === 'pick') add(pickText(step), 'natural', 'A', where);
    if (step.dialogue) addLines(step.dialogue.lines, where);
    for (const d of step.dialogues || []) addLines(d.lines, where);
    for (const section of step.sections || []) {
      for (const it of section.items) addExample(typeof it === 'string' ? { m: it } : it, where);
    }
    for (const e of [...(step.compare || []).flat(), ...(step.examples || []), ...(step.reveal || [])]) {
      addExample(typeof e === 'string' ? { m: e } : e, where);
    }
    if (step.type === 'repeat' && step.items) {
      for (const it of step.items) addExample(typeof it === 'string' ? { m: it } : it, where);
    }
    for (const lines of step.conversations || []) {
      for (const [who, text] of lines) add(hLineText(text), 'natural', SPEAKER_VOICE[who] || 'A', where);
    }
    if (step.type === 'link') for (const m of step.lines) add(spokenText(m), 'natural', 'A', where);
    if (step.type === 'select' && step.play) for (const o of step.options) add(o, 'natural', 'A', where);
    if (step.type === 'speak') for (const m of step.prompts || []) addExample({ m }, where);
    if (step.type === 'interview') for (const [a, b] of step.items) add(`Would you rather ${a} or ${b}?`, 'natural', 'A', where);
    if (step.type === 'repeat' || step.type === 'interview' || step.type === 'build' || !step.items) return;
    for (const item of step.items) {
      if (step.type === 'write') {
        if (item.from) add(spokenText(item.from), 'natural', 'A', where);
        continue;
      }
      const text = itemSay(step, item);
      if (step.type === 'gap') {
        add(item.a, 'natural', 'A', where);
        add(text, 'natural', 'B', where);
        add(text, 'slow', 'B', where);
        continue;
      }
      if (item.dialogue) {
        addLines(item.dialogue, where);
        continue;
      }
      add(text, 'natural', 'A', where);
      if (step.type === 'dictation') add(text, 'slow', 'A', where);
    }
  };

  for (const set of exerciseSets) {
    const where = `practice/${set.id}`;
    for (const step of stepsOf(set)) addStep(step, where);
  }

  return [...items.values()];
}
