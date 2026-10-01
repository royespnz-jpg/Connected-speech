// Session VI practice, from the teacher's Drive folder "Session VI Connected Speech":
//   Practices 2 — Hewings & Goldstein, Pronunciation Plus, Units 36–37 (tracks 04–10)
//   Practices 3 — Baker & Goldstein, Pronunciation Pairs (practices 1, 5, 10, 11, 12)
// Only exercises that come with a recording are included, in the book's order.
// Answers and wording were checked against the recordings (speech recognition,
// plus /h/-or-no-/h/ alignment for Unit 37 Ex. 4). The app's own voices read
// every line; `tracks` names the book recording that goes with each set.
//
// Extra fields used by these sets:
//   group, book   – heading on the practice page; unit and exercise in the book
//   tracks        – [{ label, drive? }] the book recording; with a Drive file ID it is embedded
//   examples      – listen-and-repeat lines shown above the exercise
//   listenAfter   – (choice) the audio is offered after answering, not before
//   item.m / item.after – (choice) the sentence in markup, before and after answering
//   item.dialogue – (choice) a short conversation shown after answering
//   lines, reveal – (pick) one sentence per line; linked versions shown after checking
//   sections      – (repeat) listen-and-repeat lists, no score
//   compare       – (gap) word pairs to listen to before the gap fill
//   conversations – (hdrop) lines with {h-words}; {^word} marks a lost /h/

import { renderMarkup } from './markup.js';

const W = 0;
const Y = 1;

// "/w/ or /y/?": the answer version shows the glide in the link.
const wy = (m, glide, explain) => ({
  m,
  after: m.replace('_', `_[${glide === W ? 'w' : 'y'}]`),
  answer: glide,
  explain,
});

// Unit 37, exercise 4 (track 10). A/B/C are the speakers; C uses the first voice again.
// {^word}: the /h/ is lost in the recording.
const H_CONVERSATIONS = [
  [
    ['A', '{Have} they found {^him}?'],
    ['B', '{Who}?'],
    ['A', 'The man {^who} robbed your {house}.'],
  ],
  [
    ['A', 'Did {^he} tell {^her} what {happened}?'],
    ['B', "{He} did, but she didn't believe {^him}."],
  ],
  [
    ['A', "{How's} {Henry} these days?"],
    ['B', "Didn't you {hear} about {^his} {heart} attack?"],
  ],
  [
    ['A', 'Did you call {^him}?'],
    ['B', "{He} wasn't {home}. {He} must {^have} left already."],
  ],
  [
    ['A', "It says {here} that the President's coming."],
    ['B', "Where's {^he} going to be?"],
    ['A', '{Here}.'],
    ['B', "Oh, I {hope} we'll be able to see {^him}."],
  ],
  [
    ['A', 'What are you children fighting about?'],
    ['B', "It's MY book."],
    ['C', "{HIS} book's over THERE."],
    ['B', "{HER} book's over there. This one's mine!"],
  ],
];

export const SPEAKER_VOICE = { A: 'A', B: 'B', C: 'A' };

// Pronunciation Pairs, practice 1, section F: A's lines and B's replies.
const SCRAMBLED = [
  ['Do you know_[w]everyone here?', "No,_[w]I don't."],
  ['Hello. Can I speak to Joe?', "Sorry, Joe_[w]isn't home now."],
  ['Is it OK if I take one?', 'Sure, go_[w]ahead.'],
  ['Is the window_[w]open?', 'No,_[w]are you cold?'],
  ['Did you call Joan?', 'Yes, but there was no_[w]answer.'],
  ['Is there snow_[w]on the ground?', "No,_[w]it's only snowing a little."],
  ['We can\'t go_[w]in yet.', "I know. It's so_[w]annoying."],
];
// B's column in the book's order.
const SCRAMBLED_B = [2, 4, 0, 5, 3, 6, 1].map((i) => SCRAMBLED[i][1]);
const plain = (m) => m.replace(/_\[[wy]\]/g, ' ').replace(/_/g, ' ');

export const ppSets = [
  // ─── Practices 2 · Pronunciation Plus ────────────────────────────────────
  {
    id: 'pp36-repeat',
    group: 'pplus',
    book: 'Unit 36 · Ex. 4–5',
    tracks: [{ label: 'Track 04 · Ex. 4 (/w/)' }, { label: 'Track 05 · Ex. 5 (/y/)' }],
    title: 'Repeat: /w/ and /y/ links',
    source: 'PP',
    type: 'repeat',
    intro:
      'When one word ends in a vowel sound and the next one starts with a vowel, English slips a short /w/ or /y/ between them. Listen, repeat, and record yourself to compare.',
    sections: [
      {
        h: 'Linked by /w/',
        note: 'After /uw/, /ow/ and /aw/: the lips are already rounded, so a /w/ comes out.',
        items: [
          "You know_[w]it's Brian's birthday.",
          'Oh,_[w]I forgot all about it.',
          'What about a new_[w]umbrella?',
          'He should just throw_[w]it away.',
          "It won't be too_[w]expensive.",
          'How_[w]about Thursday?',
          'He has an interview_[w]on Friday.',
          "Yeah, let's do_[w]it Saturday.",
          'You_[w]arrange the party.',
        ],
      },
      {
        h: 'Linked by /y/',
        note: 'After /iy/, /ey/, /ay/ and /ɔy/: the tongue is already high at the front, so a /y/ comes out.',
        items: [
          "It's Brian's birthday_[y]on Thursday.",
          'We should buy_[y](h)im a present.',
          'We really_[y]ought to have a party_[y]or something for him.',
          'Do you have any_[y]ideas?',
          'If we pay_[y]about twenty dollars, we could get him something nice.',
          "Why don't we_[y]invite a few friends?",
          'What about Thursday_[y]evening?',
          'More people will be free_[y]on Saturday.',
        ],
      },
    ],
  },
  {
    id: 'pp36-wy',
    group: 'pplus',
    book: 'Unit 36 · Ex. 6–7',
    tracks: [{ label: 'Track 06 · Ex. 7' }],
    title: '/w/ or /y/?',
    source: 'PP',
    type: 'choice',
    listenAfter: true,
    intro: 'Will the marked words be linked by /w/ or /y/? Decide first, then listen to check.',
    options: ['/w/', '/y/'],
    items: [
      wy("No,_I didn't.", W, 'No ends in /ow/: rounded lips → /w/.'),
      wy('Hi,_Ann!', Y, 'Hi ends in /ay/ → /y/.'),
      wy("There's no_answer.", W, 'no ends in /ow/ → /w/.'),
      wy('Sunday_afternoon.', Y, 'Sunday ends in /ey/ (or /iy/) → /y/.'),
      wy('Can I try_it?', Y, 'try ends in /ay/ → /y/.'),
      wy('He must be_at the office.', Y, 'be ends in /iy/ → /y/.'),
      wy('Go_ahead.', W, 'Go ends in /ow/ → /w/.'),
      wy('Did you see_it?', Y, 'see ends in /iy/ → /y/.'),
      wy('When can you do_it?', W, 'do ends in /uw/ → /w/.'),
      wy('Hi, how_are you?', W, 'how ends in /aw/ → /w/.'),
    ],
  },
  {
    id: 'pp37-short',
    group: 'pplus',
    book: 'Unit 37 · Ex. 1–2',
    tracks: [{ label: 'Track 07 · Ex. 1' }, { label: 'Track 08 · Ex. 2' }],
    title: 'Short first syllables',
    source: 'PP',
    type: 'gap',
    intro:
      'Words like along, away and ago start with a very short, unstressed /ə/ that is easy to miss. Compare first, then listen to each conversation and write the missing words.',
    compare: [
      ['long', "It's long."],
      ['*a*long', "It's *a*long here."],
      ['way', "I'm going this way."],
      ['*a*way', "I'm going *a*way."],
    ],
    items: [
      { a: 'Where does she live?', b: 'Just ___ the street.', answer: ['across'], ipa: '/əkrɔs/' },
      { a: "Do you think I'm right?", b: 'Yes, I ___ completely.', answer: ['agree'], ipa: '/əgriy/' },
      { a: "Can't you sleep?", b: "No, I've been ___ for hours.", answer: ['awake'], ipa: '/əweyk/' },
      { a: 'When did you move here?', b: 'Two years ___.', answer: ['ago'], ipa: '/əgow/' },
      { a: "Don't you get lonely in that big house?", b: 'No, I like living ___.', answer: ['alone'], ipa: '/əlown/' },
      { a: 'Is the bank near here?', b: "Yes. It's ___ five minutes ___.", answer: ['about', 'away'], ipa: '/əbawt/ … /əwey/' },
      { a: 'Can I speak to David?', b: "Sorry, he's ___ right now.", answer: ['asleep'], ipa: '/əsliyp/' },
      { a: 'Have you seen my keys?', b: "Yes, they're ___ here somewhere.", answer: ['around'], ipa: '/ərawnd/' },
    ],
  },
  {
    id: 'pp37-h',
    group: 'pplus',
    book: 'Unit 37 · Ex. 3–5',
    tracks: [{ label: 'Track 10 · Ex. 4' }],
    title: 'Disappearing /h/',
    source: 'PP',
    type: 'hdrop',
    intro:
      'The /h/ at the start of some words is very short or not pronounced at all. Listen to each conversation and tap every underlined word where the /h/ disappears.',
    examples: ['Does_(h)e like it?', "What's_(h)er name?"],
    conversations: H_CONVERSATIONS,
    explain: `The words that change are <b>he, him, his, her, have</b> and the <b>who</b> that joins two ideas (<i>the man who robbed…</i>). When they are unstressed in the middle of a sentence, the /h/ disappears and the word links to the one before it: <i>${renderMarkup('found_(h)im')}, ${renderMarkup('tell_(h)er')}</i>. The /h/ stays at the start of a sentence (<i>He did…</i>), in a question word on its own (<i>Who?</i>) and when the word is stressed (<i>HIS book’s over there</i>). Content words like <i>house, Henry, heart, home, here</i> and <i>hope</i> always keep it.`,
  },

  // ─── Practices 3 · Pronunciation Pairs ───────────────────────────────────
  {
    id: 'pairs-linking',
    group: 'pairs',
    book: 'Practice 1 · Unit 12 E',
    title: 'Linking vowel sounds: /ow/',
    source: 'PA',
    type: 'pick',
    intro:
      'When /ow/ comes before another vowel sound, a /w/ links the two words: go‿out, throw‿it. Tap the word in each sentence whose /ow/ links to the next word, then check and listen.',
    examples: ['go_[w]out', 'throw_[w]it'],
    lines: [
      'There was no answer.',
      "No I don't.",
      'Do you know everyone?',
      'Sure, go ahead.',
      'Is the window open?',
      "It's so annoying.",
      "We can't go in.",
      'Is there snow on the ground?',
      "Joe isn't home.",
      'No, are you cold?',
    ],
    answers: ['no', 'know', 'go', 'window', 'so', 'snow', 'joe'],
    reveal: [
      'There was no_[w]answer.',
      "No_[w]I don't.",
      'Do you know_[w]everyone?',
      'Sure, go_[w]ahead.',
      'Is the window_[w]open?',
      "It's so_[w]annoying.",
      "We can't go_[w]in.",
      'Is there snow_[w]on the ground?',
      "Joe_[w]isn't home.",
      'No,_[w]are you cold?',
    ],
    explain:
      'Every sentence has one link: the word that ends in /ow/ (spelled o, ow, oe) joins the vowel that follows with a /w/. In <i>Joe isn’t home</i>, <i>home</i> doesn’t link: it ends in /m/.',
  },
  {
    id: 'pairs-scrambled',
    group: 'pairs',
    book: 'Practice 1 · Unit 12 F',
    title: 'Scrambled conversations',
    source: 'PA',
    type: 'choice',
    listenAfter: true,
    intro: 'Student A says a line; which is B’s answer? Then play the conversation and say it with a partner, linking /ow/ with /w/.',
    options: SCRAMBLED_B.map(plain),
    items: SCRAMBLED.map(([m, reply]) => ({
      m,
      answer: SCRAMBLED_B.indexOf(reply),
      dialogue: [
        { who: 'A', voice: 'A', m },
        { who: 'B', voice: 'B', m: reply },
      ],
    })),
  },
  {
    id: 'pairs-gonna',
    group: 'pairs',
    book: 'Practice 5 · Gonna, sections E–F',
    title: 'Gonna (going to)',
    source: 'PA',
    type: 'choice',
    intro:
      'In informal speech, going to is often said “gonna” when another verb follows it to show the future. When going is the main verb (going to a place), there is no “gonna”. Listen: which lines use “gonna”?',
    examples: [
      { m: 'When are they *going to* be in Chicago?', note: '“gonna”', say: 'When are they gonna be in Chicago?' },
      { m: "They're *going to* go camping.", note: '“gonna”', say: "They're gonna go camping." },
      { m: "They're going to Canada.", note: 'no “gonna”: going is the main verb' },
    ],
    options: ['“gonna”', 'No “gonna”'],
    items: [
      { q: 'A: Where are you <b>going</b> for vacation?', say: 'Where are you going for vacation?', answer: 1, explain: 'going is the main verb, and no verb follows.' },
      { q: "B: I'm <b>going to</b> England.", say: "I'm going to England.", answer: 1, explain: 'going to a place: going is the main verb.' },
      { q: 'A: What are you <b>going to</b> do in England?', say: 'What are you gonna do in England?', answer: 0, explain: 'going to + do: future → “gonna”.' },
      { q: "B: I'm <b>going to</b> go to art galleries.", say: "I'm gonna go to art galleries.", answer: 0, explain: 'going to + go: future → “gonna” (the second to stays: go to art galleries).' },
    ],
  },
  {
    id: 'pairs-useta',
    group: 'pairs',
    book: 'Practice 10 · Unit 36 E',
    tracks: [{ label: '10 Useta (used to) · Unit 36 E' }],
    title: 'Useta (used to)',
    source: 'PA',
    type: 'repeat',
    intro: 'Used to (a past habit) is usually said “useta”: the d disappears and to becomes a weak /tə/. Listen and repeat.',
    sections: [
      {
        h: 'Listen and repeat',
        items: [
          { m: 'used to', note: '“useta”', ipa: '/yuwstə/' },
          { m: 'He *used to* play the piano.', note: '“useta”' },
          { m: 'Did you *use to* live in New York?', note: '“useta”' },
        ],
      },
    ],
  },
  {
    id: 'pairs-dropped-h',
    group: 'pairs',
    book: 'Practice 11 · Unit 40 E',
    title: 'Dropped /h/',
    source: 'PA',
    type: 'repeat',
    intro:
      'He, his, him and her are usually unstressed. In the middle or at the end of a sentence their /h/ is often dropped, and the rest of the word links to the word before it. At the start of a sentence or after a pause, the /h/ is pronounced.',
    sections: [
      {
        h: 'The /h/ is dropped',
        items: [
          { m: 'was_(h)e', note: 'sounds like “wuzzy”' },
          'Was_(h)e hurt?',
          'hit_(h)im',
          'A vehicle hit_(h)im from behind.',
        ],
      },
      {
        h: 'The /h/ is pronounced',
        items: ['He was in a car accident.', 'No, he was completely unharmed.'],
      },
    ],
  },
  {
    id: 'pairs-weak-the',
    group: 'pairs',
    book: 'Practice 12 · Unit 42 F',
    tracks: [{ label: '12 Weak pronunciations for the and than · Unit 42 F' }],
    title: 'Weak the and than',
    source: 'PA',
    type: 'repeat',
    intro: 'The and than are almost never stressed: the is /ðə/ and than is /ðən/, short and quick. Listen and repeat.',
    sections: [
      {
        h: 'Listen and repeat',
        items: [
          { m: 'the one with the zipper', ipa: '/ðə wʌn wɪð ðə zɪpər/' },
          'the others',
          { m: 'better than the others', note: 'than = /ðən/' },
          'Which jacket do you think is better than the others?',
          'I think the one with the belt is better than the others.',
        ],
      },
    ],
  },
];
