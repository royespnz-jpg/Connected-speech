// Every clip the app can play, so scripts/generate-audio.mjs can pre-generate
// them once with ElevenLabs and the site can serve them as static files.

import { topics } from './content.js';
import { exerciseSets, itemSay, hLineText, pickText } from './exercises-data.js';
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

  for (const set of exerciseSets) {
    const where = `practice/${set.id}`;
    if (set.type === 'pick') add(pickText(set), 'natural', 'A', where);
    if (set.dialogue) addLines(set.dialogue.lines, where);
    for (const section of set.sections || []) {
      for (const it of section.items) addExample(typeof it === 'string' ? { m: it } : it, where);
    }
    for (const e of [...(set.compare || []).flat(), ...(set.examples || []), ...(set.reveal || [])]) {
      addExample(typeof e === 'string' ? { m: e } : e, where);
    }
    for (const lines of set.conversations || []) {
      for (const [who, text] of lines) add(hLineText(text), 'natural', SPEAKER_VOICE[who] || 'A', where);
    }
    for (const item of set.items || []) {
      const text = itemSay(set, item);
      if (set.type === 'gap') {
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
      if (set.type === 'dictation') add(text, 'slow', 'A', where);
    }
  }

  return [...items.values()];
}
