// Every clip the app can play, so scripts/generate-audio.mjs can pre-generate
// them once with ElevenLabs and the site can serve them as static files.

import { topics } from './content.js';
import { exerciseSets, itemSay } from './exercises-data.js';
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

  for (const set of exerciseSets) {
    if (set.type === 'pick') add(set.passage, 'natural', 'A', `practice/${set.id}`);
    for (const item of set.items || []) {
      const text = itemSay(set, item);
      add(text, 'natural', 'A', `practice/${set.id}`);
      if (set.type === 'dictation') add(text, 'slow', 'A', `practice/${set.id}`);
    }
  }

  return [...items.values()];
}
