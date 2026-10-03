// Session VI, from the teacher's Drive folder "Session VI Connected Speech":
//   Practices 2 — Hewings & Goldstein, Pronunciation Plus, Units 36–37
//   Practices 3 — Baker & Goldstein, Pronunciation Pairs, practices 1–13
//
// One worksheet per PDF, in the book's order: its sections (E, F…) and
// numbered steps, with the book's instructions. Where the PDF asks students to
// write, circle, draw or match, the step is interactive and checked. Steps the
// book does with a partner have a recorder. Answers were checked against the
// recordings.
//
// Every line with a book recording plays its clip (js/book-audio.js); `track`
// names the recording a step comes from. Steps without a recording in the
// teacher's folder (`appVoice`) are read by the app's voice. Parts of a page
// that continue an exercise from a page that isn't in the PDF are left out.
//
// A worksheet: { id, group, book, title, source, tracks, intro, parts }
//   part: { label, title, rule, steps }
//   step: { n, task, type, after, track, appVoice, note, …fields of its type }
// Step types:
//   repeat    – items: listen, repeat and record (no score)
//   dialogues – dialogues: conversations to play and say (no score)
//   choice    – options + items (item.example: solved by the book, not scored)
//   gap       – conversations with blanks to write
//   hdrop     – tap the h-words whose /h/ disappears
//   link      – lines in markup: draw the links (and /y/ or /w/ with glides)
//   select    – options: tap all that apply (answers; optional: either way)
//   write     – questions with a written answer (keys: words the answer needs)
//   spelling  – rows: add more words spelled that way with the sound
//   speak     – prompts and a free recorder (role-play)
//   interview – "Would you rather…" questions, 1 point for the first choice
//   build     – make A's and B's sentences from the book's table
// after: the key of the step that must be finished first (e.g. 'E2').

import { spokenText } from './markup.js';

const W = 0;
const Y = 1;

// "/w/ or /y/?": the answer version shows the glide in the link.
const wy = (m, glide, explain, extra = {}) => ({
  m,
  after: m.replace('_', `_[${glide === W ? 'w' : 'y'}]`),
  answer: glide,
  explain,
  ...extra,
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

// The same lines in markup: a lost /h/ links the word to the one before it.
const hLinked = (text) =>
  text.replace(/(\S+) \{\^(w?h)([^}]*)\}/gi, '$1_($2)$3').replace(/\{([^}]+)\}/g, '$1');

// Scrambled conversations: [A's line, B's reply] in the book's order of A's
// lines; bOrder gives B's column as the book prints it. The book draws the
// first match as an example.
function scrambled(pairs, bOrder, { example = true } = {}) {
  const replies = bOrder.map((i) => pairs[i][1]);
  return {
    options: replies.map(spokenText),
    items: pairs.map(([m, reply], i) => ({
      m,
      answer: replies.indexOf(reply),
      example: example && i === 0,
      dialogue: [
        { who: 'A', voice: 'A', m },
        { who: 'B', voice: 'B', m: reply },
      ],
    })),
  };
}

const conversations = (pairs) =>
  pairs.map(([a, b]) => ({
    lines: [
      { who: 'A', voice: 'A', m: a },
      { who: 'B', voice: 'B', m: b },
    ],
  }));

// "How many syllables?": the word, its count, and the letters that go silent.
const syl = (word, count, after, explain, extra = {}) => ({ m: word, after, answer: count - 1, explain, ...extra });

// ─── Pronunciation Plus ─────────────────────────────────────────────────────

const U36_W = [
  "You know_[w]it's Brian's birthday.",
  'Oh,_[w]I forgot all about it.',
  'What about a new_[w]umbrella?',
  'He should just throw_[w]it away.',
  "It won't be too_[w]expensive.",
  'How_[w]about Thursday?',
  'He has an interview_[w]on Friday.',
  "Yeah, let's do_[w]it Saturday.",
  'You_[w]arrange the party.',
];
const U36_Y = [
  "It's Brian's birthday_[y]on Thursday.",
  'We should buy_[y](h)im a present.',
  'We really_[y]ought to have a party_[y]or something for him.',
  'Do you have any_[y]ideas?',
  'If we pay_[y]about twenty dollars, we could get him something nice.',
  "Why don't we_[y]invite a few friends?",
  'What about Thursday_[y]evening?',
  'More people will be free_[y]on Saturday.',
];
const U36_WY = [
  wy("No,_I didn't.", W, 'No ends in /ow/: rounded lips → /w/.', { example: true }),
  wy('Hi,_Ann!', Y, 'Hi ends in /ay/ → /y/.'),
  wy("There's no_answer.", W, 'no ends in /ow/ → /w/.'),
  wy('Sunday_afternoon.', Y, 'Sunday ends in /ey/ (or /iy/) → /y/.'),
  wy('Can I try_it?', Y, 'try ends in /ay/ → /y/.'),
  wy('He must be_at the office.', Y, 'be ends in /iy/ → /y/.'),
  wy('Go_ahead.', W, 'Go ends in /ow/ → /w/.'),
  wy('Did you see_it?', Y, 'see ends in /iy/ → /y/.'),
  wy('When can you do_it?', W, 'do ends in /uw/ → /w/.'),
  wy('Hi, how_are you?', W, 'how ends in /aw/ → /w/.'),
];
const glided = (plain) => U36_WY.find((it) => it.m === plain).after;

const ppU36 = {
  id: 'pp-36',
  group: 'pplus',
  book: 'Unit 36',
  title: 'Sounds that link words: /w/ and /y/',
  source: 'PP',
  tracks: ['pp-04', 'pp-05', 'pp-06'],
  intro:
    'When one word ends in a vowel sound and the next one starts with a vowel, English slips a short /w/ or /y/ between them.',
  parts: [
    {
      label: '',
      title: '',
      steps: [
        {
          n: '1',
          type: 'write',
          task: 'You will hear a conversation between Joe and Mary Ann. Listen to the conversation and answer the questions.',
          note: 'The teacher’s folder doesn’t have the recording of the whole conversation (track 1). The sentences in exercises 4 and 5 come from it: listen to them and answer.',
          items: [
            {
              q: 'When is Brian’s birthday?',
              keys: ['thursday'],
              not: ['monday', 'tuesday', 'wednesday', 'friday', 'saturday', 'sunday'],
              answer: 'On Thursday.',
              from: "It's Brian's birthday_[y]on Thursday.",
            },
            {
              q: 'What present do Joe and Mary Ann decide to get him?',
              keys: ['umbrella'],
              answer: 'A new umbrella.',
              from: 'What about a new_[w]umbrella?',
            },
            {
              q: 'When are they going to have a party?',
              keys: ['saturday'],
              not: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'sunday'],
              answer: 'On Saturday.',
              from: "Yeah, let's do_[w]it Saturday.",
            },
          ],
        },
        {
          n: '2',
          type: 'repeat',
          task: 'Some of the words in the conversation are linked by a /w/ sound. Listen.',
          track: 'pp-04',
          items: ['What about a new_[w]umbrella?', "Yeah, let's do_[w]it Saturday."],
        },
        {
          n: '3',
          type: 'repeat',
          task: 'Some other words are linked by a /y/ sound. Listen.',
          track: 'pp-05',
          items: ['More people will be free_[y]on Saturday.', 'What about Thursday_[y]evening?'],
        },
        {
          n: '4',
          type: 'repeat',
          task: 'Repeat these sentences. The words marked are linked by a /w/ sound.',
          note: 'After /uw/, /ow/ and /aw/ the lips are already rounded, so a /w/ comes out.',
          track: 'pp-04',
          items: U36_W,
        },
        {
          n: '5',
          type: 'repeat',
          task: 'Repeat these sentences. The words marked are linked by a /y/ sound.',
          note: 'After /iy/, /ey/, /ay/ and /ɔy/ the tongue is already high at the front, so a /y/ comes out.',
          track: 'pp-05',
          items: U36_Y,
        },
        {
          n: '6',
          type: 'choice',
          task: 'Look at these sentences. Will the words marked be linked by /w/ or /y/? Write <i>w</i> or <i>y</i> under the linking mark.',
          options: ['w', 'y'],
          items: U36_WY,
        },
        {
          n: '7',
          type: 'repeat',
          after: '6',
          task: 'Repeat the sentences and check your answers.',
          track: 'pp-06',
          items: U36_WY.map((it) => it.after),
        },
        {
          n: '8',
          type: 'choice',
          after: '6',
          task: 'Work in pairs. Draw arrows to match the sentences in 6. Make five two-line conversations. Then say the conversations together.',
          listenAfter: true,
          ...scrambled(
            [
              [glided('Hi,_Ann!'), glided('Hi, how_are you?')],
              [glided('Did you see_it?'), glided("No,_I didn't.")],
              [glided('Can I try_it?'), glided('Go_ahead.')],
              [glided('When can you do_it?'), glided('Sunday_afternoon.')],
              [glided("There's no_answer."), glided('He must be_at the office.')],
            ],
            [1, 4, 0, 3, 2],
            { example: false },
          ),
        },
      ],
    },
  ],
};

const ppU37 = {
  id: 'pp-37',
  group: 'pplus',
  book: 'Unit 37',
  title: 'Short sounds and disappearing /h/',
  source: 'PP',
  tracks: ['pp-07', 'pp-08', 'pp-10'],
  intro:
    'Words like along, away and ago start with a very short /ə/ that is easy to miss, and the /h/ of words like him, her and have often disappears.',
  parts: [
    {
      label: '',
      title: '',
      steps: [
        {
          n: '1',
          type: 'repeat',
          task: 'In connected speech, the first syllable of words that begin with the unstressed sound /ə/ is often very short and may be difficult to hear. Listen and compare these examples.',
          track: 'pp-07',
          items: ['long', "It's long.", '*a*long', "It's *a*long here.", 'way', "I'm going this way.", '*a*way', "I'm going *a*way."],
        },
        {
          n: '2',
          type: 'gap',
          task: 'Listen to these conversations and write the words you hear in the spaces. Use the context to help you.',
          track: 'pp-08',
          gapNote: 'the first syllable is just a short /ə/.',
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
          n: '3',
          type: 'repeat',
          task: 'The sound /h/ at the beginning of some words is very short or may not be pronounced at all. Listen to these examples.',
          appVoice: true,
          items: ['Does_(h)e like it?', "What's_(h)er name?"],
        },
        {
          n: '4',
          type: 'hdrop',
          task: 'Listen to these short conversations. The /h/ sounds are underlined. Draw a line through them if they are very short or not pronounced.',
          note: 'Tap a word to cross out its /h/.',
          track: 'pp-10',
          conversations: H_CONVERSATIONS,
          explain:
            'The /h/ disappears in unstressed <b>he, him, his, her, have</b> and the <b>who</b> that joins two ideas (<i>the man who robbed…</i>). It stays at the start of a sentence (<i>He did…</i>), in <i>Who?</i> on its own and when the word is stressed (<i>HIS book’s over there</i>). Content words like <i>house, Henry, heart, home, here</i> and <i>hope</i> always keep it.',
        },
        {
          n: '5',
          type: 'select',
          task: 'Find the words in 4 that are sometimes pronounced with the sound /h/ and sometimes without.',
          options: ['have', 'him', 'who', 'house', 'he', 'her', 'happened', 'how’s', 'Henry', 'hear', 'his', 'heart', 'home', 'here', 'hope'],
          answers: [0, 2, 4, 5, 10],
          optional: [1],
          explain:
            'In 4 you hear <i>he, his, her, have</i> and <i>who</i> both ways: <i>He did…</i> but <i>did (h)e</i>; <i>HIS book</i> but <i>about (h)is</i>; <i>Have they…?</i> but <i>must (h)ave</i>; <i>Who?</i> but <i>the man (wh)o</i>. <i>Him</i> loses its /h/ every time in 4, but it is the same kind of word. The others are content words: they always keep their /h/.',
        },
        {
          n: '',
          key: '5b',
          type: 'select',
          task: 'When <i>is</i> /h/ pronounced in these words? Choose all that are true.',
          options: [
            'At the beginning of a sentence (<i>He did, but…</i> · <i>Have they found him?</i>)',
            'When the word is stressed (<i>HIS book’s over THERE.</i>)',
            'When the word is said on its own (<i>Who?</i>)',
            'In the middle of a sentence, when the word is not stressed (<i>Did he tell her…?</i>)',
            'Never: these words always lose their /h/.',
          ],
          html: true,
          answers: [0, 1, 2],
          explain:
            'The /h/ is pronounced at the start of a sentence or after a pause, and when the word is stressed. In the middle of a sentence, unstressed, it is usually dropped and the word links to the one before it.',
        },
        {
          n: '6',
          type: 'dialogues',
          after: '4',
          task: 'Work in pairs and say the conversations together. When the sound /h/ is dropped, make sure that you link the word to the word before it. For example: <i>Have they found‿him?</i>',
          track: 'pp-10',
          dialogues: H_CONVERSATIONS.map((lines, i) => ({
            title: `Conversation ${i + 1}`,
            lines: lines.map(([who, text]) => ({ who, voice: SPEAKER_VOICE[who], m: hLinked(text) })),
          })),
        },
      ],
    },
  ],
};

// ─── Pronunciation Pairs ────────────────────────────────────────────────────

const P1_LINES = [
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
];
const P1_PAIRS = [
  ['Do you know_[w]everyone here?', "No,_[w]I don't."],
  ['Hello. Can I speak to Joe?', "Sorry, Joe_[w]isn't home now."],
  ['Is it OK if I take one?', 'Sure, go_[w]ahead.'],
  ['Is the window_[w]open?', 'No,_[w]are you cold?'],
  ['Did you call Joan?', 'Yes, but there was no_[w]answer.'],
  ['Is there snow_[w]on the ground?', "No,_[w]it's only snowing a little."],
  ["We can't go_[w]in yet.", "I know. It's so_[w]annoying."],
];

const pairs1 = {
  id: 'pairs-1',
  group: 'pairs',
  book: 'Practice 1 · Unit 12 E–H',
  title: 'Linking vowel sounds: /ow/',
  source: 'PA',
  tracks: ['pa-15', 'pa-16'],
  intro: 'When /ow/ comes before another vowel sound, a /w/ links the two words: go‿out, throw‿it.',
  parts: [
    {
      label: 'E',
      title: 'Linking Vowel Sounds',
      rule: 'When a word ends in a vowel sound and the next word starts with a vowel sound, the two vowels are linked smoothly, with no break. After /ow/, a /w/ sound links them.',
      steps: [
        { n: '1', type: 'repeat', task: 'Listen and repeat.', track: 'pa-15', items: ['go_[w]out', 'throw_[w]it'] },
        {
          n: '2',
          type: 'link',
          task: 'Read the sentences. Draw a linking line to show where the sound /ow/ can be linked to a following vowel.',
          lines: P1_LINES,
          solved: 1,
          explain:
            'Every sentence has one link: the word ending in /ow/ (spelled o, ow, oe) joins the next vowel with a /w/. In <i>Joe isn’t home</i>, <i>home</i> doesn’t link: it ends in /m/.',
        },
        { n: '3', type: 'repeat', after: 'E2', task: 'Listen. Repeat the sentences and check your answers.', track: 'pa-15', items: P1_LINES },
      ],
    },
    {
      label: 'F',
      title: 'Scrambled Conversations',
      steps: [
        {
          n: '1',
          type: 'choice',
          task: 'Practice with a partner. Student A says a sentence on the left. Student B responds with a sentence from the right.',
          listenAfter: true,
          ...scrambled(P1_PAIRS, [2, 4, 0, 5, 3, 6, 1]),
        },
        { n: '2', type: 'dialogues', after: 'F1', task: 'Listen and check your answers.', track: 'pa-16', dialogues: conversations(P1_PAIRS) },
      ],
    },
    {
      label: 'G',
      title: 'Spelling',
      steps: [
        {
          n: '',
          type: 'spelling',
          task: 'The sound /ow/ is usually spelled with the letter <i>o</i>. Add more examples below.',
          sound: '/ow/',
          rows: [
            { label: 'o', given: ['go', 'open', 'joking', 'told', "don't"], list: 'ow-o', spell: 'o(?![aweu])' },
            { label: 'o … e', given: ['home', 'those', 'joke', 'phone'], list: 'ow-oe', spell: 'o(?:th|[bcdfgklmnprstvz])e' },
            { label: 'ow', given: ['know', 'show', 'window'], list: 'ow-ow', spell: 'ow' },
          ],
          info: [
            ['oa', 'boat, coat, road, coast'],
            ['Other spelling: oe', 'toe, Joe'],
            ['Unusual spellings', 'shoulder, though, sew, oh!'],
          ],
        },
      ],
    },
    {
      label: 'H',
      title: 'Common Expressions',
      steps: [
        {
          n: '',
          type: 'repeat',
          task: 'Listen and repeat these common expressions with the sound /ow/.',
          appVoice: true,
          items: ['No.', "I don't know.", 'I hope so.', "I'm only joking.", "How's it going? OK.", 'Could you open the window?'],
        },
      ],
    },
  ],
};

const P2_STEP1 = ["He's sitting down.", "He's lying down.", "He's turning_around.", "He's going_[w]out.", "He's running_around.", "He's working_out."];
const P2_STEP3 = ['Throw_[w]it_out.', 'Put_it_down.', 'Figure_it_out.', 'Turn_it_down.', 'Cross_it_out.', 'Write_it_down.'];
const picture = (n, what, answer, options) => ({
  q: `<b>Picture ${n}:</b> ${what}`,
  answer,
  say: spokenText(options[answer]),
});

const pairs2 = {
  id: 'pairs-2',
  group: 'pairs',
  book: 'Practice 2 · Unit 18 E–G',
  title: 'Stress and linking in phrasal verbs',
  source: 'PA',
  tracks: ['pa-53'],
  intro: 'A phrasal verb (verb + preposition) has its own meaning. Both words are stressed and linked together.',
  parts: [
    {
      label: 'E',
      title: 'Stress and Linking in Phrasal Verbs',
      rule: 'A phrasal verb, or two-word verb, is a verb + preposition with a different meaning from the verb alone. In most phrasal verbs both words are stressed; an object pronoun like <i>it</i> is not. The words are linked together without a break.',
      steps: [
        {
          n: '1',
          type: 'repeat',
          task: 'Listen and repeat.',
          track: 'pa-53',
          items: P2_STEP1.map((m, i) => ({ m, note: ['SITting DOWN', 'LYing DOWN', 'TURNing aROUND', 'GOing OUT', 'RUNning aROUND', 'WORKing OUT'][i] })),
        },
        {
          n: '2',
          type: 'choice',
          task: 'Work with a partner. Match each picture with the correct sentence in step 1.',
          note: 'The pictures are described in words.',
          listenAfter: true,
          options: P2_STEP1.map(spokenText),
          items: [
            picture(1, 'a man lying on a bed with his hands behind his head', 1, P2_STEP1),
            picture(2, 'a man turning, with an arrow going around him', 2, P2_STEP1),
            picture(3, 'a man lifting weights over his head', 5, P2_STEP1),
            picture(4, 'a man walking out through a door', 3, P2_STEP1),
            picture(5, 'a man on a chair', 0, P2_STEP1),
            picture(6, 'a man running, with his footprints going around in a circle', 4, P2_STEP1),
          ],
        },
        {
          n: '3',
          type: 'repeat',
          task: 'Listen and repeat.',
          track: 'pa-53',
          items: P2_STEP3.map((m, i) => ({ m, note: ['THROW it OUT', 'PUT it DOWN', 'FIGure it OUT', 'TURN it DOWN', 'CROSS it OUT', 'WRITE it DOWN'][i] })),
        },
        {
          n: '4',
          type: 'choice',
          task: 'Work with a partner. Match each picture with the correct sentence in step 3.',
          note: 'The pictures are described in words.',
          listenAfter: true,
          options: P2_STEP3.map(spokenText),
          items: [
            picture(1, 'a pen drawing a line through the word “mouse” in “I found a mouse”', 4, P2_STEP3),
            picture(2, 'a woman at the board, thinking about a long math problem', 2, P2_STEP3),
            picture(3, 'a hand on the volume knob of a loud radio', 3, P2_STEP3),
            picture(4, 'a woman bending down to set her bag on the floor at the airport', 1, P2_STEP3),
            picture(5, 'a crumpled piece of paper flying into a wastebasket', 0, P2_STEP3),
            picture(6, 'a hand writing a phone number on a piece of paper', 5, P2_STEP3),
          ],
        },
      ],
    },
    {
      label: 'F',
      title: 'Spelling',
      steps: [
        {
          n: '',
          type: 'spelling',
          task: 'The sound /aw/ is spelled with the letters <i>ou</i> or <i>ow</i>. Add more examples below.',
          sound: '/aw/',
          rows: [
            { label: 'ou', given: ['about', 'found', 'mouth', 'house'], list: 'aw-ou', spell: 'ou' },
            { label: 'ow', given: ['down', 'crowd', 'now', 'how'], list: 'aw-ow', spell: 'ow' },
          ],
        },
      ],
    },
    {
      label: 'G',
      title: 'Common Expressions',
      steps: [
        {
          n: '',
          type: 'repeat',
          task: 'Listen and repeat these common expressions with the sound /aw/.',
          appVoice: true,
          items: ['Wow!', 'I found it.', { m: 'How_[w]are you?', note: 'Before another vowel, the /w/ in /aw/ links the two words.' }, 'Please sit down.', 'How do you pronounce this?', 'I tried to sound it out.'],
        },
      ],
    },
  ],
};

const P3_LINES = [
  'Did you buy_[y]it?',
  'Now_[w]I see.',
  "Why don't you try_[y]it?",
  'You might enjoy_[y]it.',
  'How_[w]are you doing?',
  'Is the boy_[y]on the ground?',
  'Why_[y]is there a cloud?',
];
const vowelWord = (say, answer, extra = {}) => ({ q: 'Listen to the word.', say, answer, explain: `<b>${say}</b> — ${['/ay/', '/ɔy/', '/aw/'][answer]}`, ...extra });

const pairs3 = {
  id: 'pairs-3',
  group: 'pairs',
  book: 'Practice 3 · Unit 19 A–B',
  title: 'Linking practice: /ay/, /ɔy/ and /aw/',
  source: 'PA',
  tracks: ['pa-56'],
  intro: 'Before another vowel, /ay/ and /ɔy/ link with a /y/, and /aw/ links with a /w/.',
  parts: [
    {
      label: 'A',
      title: 'Test Yourself',
      steps: [
        {
          n: '',
          type: 'choice',
          task: 'Listen to words from the table. When you hear a word, write the number of its vowel sound.',
          appVoice: true,
          table: {
            head: ['1: /ay/', '2: /ɔy/', '3: /aw/'],
            rows: [
              ['buy', 'boy', 'bow'],
              ['aisle', 'oil', 'owl'],
              ['tile', 'toil', 'towel'],
              ['lied', 'Lloyd', 'loud'],
            ],
          },
          hideWord: true,
          options: ['1', '2', '3'],
          items: [
            vowelWord('boy', 1, { example: true }),
            vowelWord('tile', 0),
            vowelWord('owl', 2),
            vowelWord('oil', 1),
            vowelWord('lied', 0),
            vowelWord('loud', 2),
            vowelWord('Lloyd', 1),
            vowelWord('aisle', 0),
            vowelWord('towel', 2),
          ],
        },
      ],
    },
    {
      label: 'B',
      title: 'Linking Practice',
      rule: 'When /ay/, /ɔy/ or /aw/ comes before another vowel sound, a /y/ or a /w/ sound links it to the following vowel.',
      steps: [
        {
          n: '1',
          type: 'link',
          task: 'Listen to the sentences. Draw a linking line from /ay/, /ɔy/, or /aw/ to the following vowel. Write /y/ or /w/ above the linking line.',
          track: 'pa-56',
          glides: true,
          listen: true,
          lines: P3_LINES,
          solved: 2,
          explain: '/ay/ (buy, try, why) and /ɔy/ (enjoy, boy) link with /y/; /aw/ (now, how) links with /w/.',
        },
        { n: '2', type: 'repeat', after: 'B1', task: 'Listen again. Repeat the sentences and check your answers.', track: 'pa-56', items: P3_LINES },
      ],
    },
  ],
};

const pairs4 = {
  id: 'pairs-4',
  group: 'pairs',
  book: 'Practice 4 · Unit 24 C',
  title: 'Linking a final consonant',
  source: 'PA',
  tracks: ['pa-24c'],
  intro: 'A final consonant joins the next word without a break. What happens to a final /t/ depends on what comes next.',
  parts: [
    {
      label: 'C',
      title: 'Linking a Final Consonant',
      rule: 'Words are linked together without a break: a final consonant joins the sound at the start of the next word.<br>• Consonant + vowel: say the consonant as part of the next word.<br>• Vowel + /t/ + vowel: the /t/ is “flapped”, like a quick /d/.<br>• The same consonant twice: say one long consonant, not two.<br>• A different consonant: say the final consonant quietly and go right on.',
      steps: [
        { n: '1', type: 'repeat', task: 'Listen and repeat. Link the final /t/ to the following vowel.', track: 'pa-24c', items: ['post_office', 'First_Avenue'] },
        { n: '2', type: 'repeat', task: 'Listen and repeat. The /t/ sound is flapped here.', track: 'pa-24c', items: ['a lo*t*_of', 'ge*t*_off'] },
        { n: '3', type: 'repeat', task: 'Listen and repeat. Pronounce the linked /t/ sounds as one long /t/.', track: 'pa-24c', items: ['a great_Thai restaurant', 'What_time is it?'] },
        { n: '4', type: 'repeat', task: 'Listen and repeat. Make the /t/ sound quiet before the next consonant.', track: 'pa-24c', items: ['your best bet', 'just past'] },
      ],
    },
  ],
};

const pairs5 = {
  id: 'pairs-5',
  group: 'pairs',
  book: 'Practice 5 · Unit 27 E–F',
  title: 'Gonna (going to)',
  source: 'PA',
  tracks: ['pa-27e', 'pa-27f'],
  intro: 'Going to + verb is often “gonna” in informal speech; going to a place never is.',
  parts: [
    {
      label: 'E',
      title: 'Gonna (going to)',
      rule: 'In informal speech, <i>going to</i> is often pronounced “gonna” when another verb follows it to show the future. Don’t use “gonna” when <i>going</i> is the main verb.',
      steps: [
        {
          n: '',
          type: 'repeat',
          task: 'Listen and repeat.',
          track: 'pa-27e',
          items: [
            { m: 'When are they *going to* be in Chicago?', note: '“gonna”', say: 'When are they gonna be in Chicago?' },
            { m: "They're *going to* go camping.", note: '“gonna”', say: "They're gonna go camping." },
            { m: "They're going to Canada.", note: 'no “gonna”: going is the main verb' },
          ],
        },
      ],
    },
    {
      label: 'F',
      title: 'Conversation Practice',
      steps: [
        {
          n: '1',
          type: 'choice',
          task: 'Listen. Which lines use the “gonna” pronunciation?',
          track: 'pa-27f',
          options: ['“gonna”', 'No “gonna”'],
          items: [
            { q: 'A: Where are you <b>going</b> for vacation?', say: 'Where are you going for vacation?', answer: 1, explain: 'going is the main verb, and no verb follows.' },
            { q: "B: I'm <b>going to</b> England.", say: "I'm going to England.", answer: 1, explain: 'going to a place: going is the main verb.' },
            { q: 'A: What are you <b>going to</b> do in England?', say: 'What are you gonna do in England?', answer: 0, explain: 'going to + do: future → “gonna”.' },
            { q: "B: I'm <b>going to</b> go to art galleries.", say: "I'm gonna go to art galleries.", answer: 0, explain: 'going to + go: future → “gonna” (the second to stays: go to art galleries).' },
          ],
        },
      ],
    },
  ],
};

const P6_PAIRS = [
  ["Let's_sit in the sun.", "Let's_sit in the shade instead."],
  ["Let's_eat steak.", "Let's_eat pizza instead."],
  ["Let's_stay in a hotel.", "Let's_sleep outside instead."],
  ["Let's_spend all the money.", "Let's_save some money instead."],
  ["Let's_swim in the ocean.", "Let's_swim in the pool instead."],
  ["Let's_see a movie on Sunday.", "Let's_study on Sunday instead."],
  ["Let's_ask Stacy.", "Let's_ask Steve instead."],
  ["Let's_speak Spanish.", "Let's_speak English instead."],
];
const STACY = (m) => ({ who: 'Stacy', voice: 'A', m });
const STEVE = (m) => ({ who: 'Steve', voice: 'B', m });
const P6_DIALOG = {
  title: 'It’s expensive',
  lines: [
    STEVE("Let's go to the seashore on Saturday."),
    STACY('Yes! Excellent! Would you rather go sailing or waterskiing? Waterskiing is so exciting.'),
    STEVE("It's also expensive, Stacy. Let's just sit in the sun and go swimming instead."),
    STACY("Let's stay over Saturday night and spend Sunday there, too. We could stay at the Six Star Hotel."),
    STEVE("Be sensible, Sweetie. It's too expensive. Let's sleep outside instead."),
    STACY("Yes. Let's sleep on the sand. That's more exciting."),
  ],
};

const pairs6 = {
  id: 'pairs-6',
  group: 'pairs',
  book: 'Practice 6 · Unit 29 A–E',
  title: 'Linking a final consonant cluster',
  source: 'PA',
  tracks: ['pa-29c', 'pa-29d'],
  intro: 'Link a final -s clearly to a vowel (it’s‿expensive); before another /s/, say one long /s/ (let’s‿sit).',
  parts: [
    {
      label: 'A',
      title: 'Consonant Clusters',
      steps: [
        {
          n: '3',
          type: 'select',
          task: 'Listen and repeat. Circle the words that have the consonant clusters /sp/, /ts/, or /ks/.',
          appVoice: true,
          play: true,
          options: ['silly', 'exciting', 'six', 'excellent', "that's", 'serious', 'sports', 'sensible', 'expensive'],
          answers: [1, 2, 3, 4, 6, 8],
          explain:
            '<i>exciting, six, excellent</i> and <i>expensive</i> have /ks/ (spelled x); <i>that’s</i> has /ts/; <i>sports</i> has /sp/ and /ts/, and <i>expensive</i> also has /sp/. <i>Silly, serious</i> and <i>sensible</i> have a single /s/.',
        },
      ],
    },
    {
      label: 'B',
      title: 'Dialog: It’s expensive',
      rule: '<i>Stacy and Steve are planning a trip to the seashore.</i>',
      steps: [
        {
          n: '1',
          type: 'choice',
          task: 'Cover the dialog and listen. Circle the correct words in parentheses.',
          appVoice: true,
          dialogue: P6_DIALOG,
          items: [
            { q: 'Stacy likes (skating / waterskiing).', options: ['skating', 'waterskiing'], answer: 1, explain: '“Waterskiing is so exciting.”' },
            { q: 'Steve wants to (save / spend) money.', options: ['save', 'spend'], answer: 0, explain: '“It’s also expensive… Let’s just sit in the sun.”' },
            { q: 'Stacy wants to stay over (Saturday / Sunday) night.', options: ['Saturday', 'Sunday'], answer: 0, explain: '“Let’s stay over Saturday night and spend Sunday there, too.”' },
            { q: 'Stacy thinks sleeping outside is (sensible / exciting).', options: ['sensible', 'exciting'], answer: 1, explain: '“Let’s sleep on the sand. That’s more exciting.”' },
          ],
        },
        { n: '2', type: 'dialogues', after: 'B1', task: 'Listen again and read the dialog. Check your answers to step 1.', appVoice: true, dialogues: [P6_DIALOG] },
      ],
    },
    {
      label: 'C',
      title: 'Linking a Final Consonant Cluster',
      rule: 'Adding -s to a word often makes a consonant cluster: <i>likes</i> /ks/, <i>wants</i> /nts/, <i>it’s</i> /ts/.<br>• /s/ + a vowel: link the final /s/ clearly to the vowel.<br>• /s/ + /s/: say one long /s/, not two.<br>• Careful: don’t drop the -s at the end of a word.',
      steps: [
        { n: '1', type: 'repeat', task: 'Listen and repeat. Link /s/ to the following vowel.', track: 'pa-29c', items: ["It's_expensive.", "Let's_eat."] },
        {
          n: '2',
          type: 'repeat',
          task: 'Listen and repeat. Pronounce the linked /s/ sounds as one long /s/.',
          track: 'pa-29c',
          items: ["Let's_sit.", "Let's_sit on the sand.", "Let's_stay in a hotel.", "Let's_sleep outside."],
        },
      ],
    },
    {
      label: 'D',
      title: 'Scrambled Conversations',
      steps: [
        {
          n: '1',
          type: 'choice',
          task: 'Practice with a partner. Student A says a sentence on the left. Student B responds with a sentence from the right.',
          listenAfter: true,
          ...scrambled(P6_PAIRS, [2, 4, 0, 6, 7, 3, 5, 1]),
        },
        { n: '2', type: 'dialogues', after: 'D1', task: 'Listen and check your answers.', track: 'pa-29d', dialogues: conversations(P6_PAIRS) },
      ],
    },
    {
      label: 'E',
      title: 'Interview: Personality test',
      rule: 'Work with a partner. Do you like to take risks or are you more cautious? Try this personality test for fun.',
      steps: [
        {
          n: '1',
          type: 'dialogues',
          task: 'Listen. Notice the intonation in the question: rising on the first choice (before <i>or</i>) and falling on the second choice (after <i>or</i>).',
          appVoice: true,
          dialogues: [
            {
              lines: [
                { who: 'A', voice: 'A', m: 'Would you rather sleep outside or stay in a hotel?', note: '↗ outSIDE … ↘ hoTEL' },
                { who: 'B', voice: 'B', m: 'Sleep outside.' },
              ],
            },
          ],
        },
        {
          n: '2',
          type: 'interview',
          task: 'Interview your partner. For each question, give 1 point if your partner chooses the first item and 0 points if your partner chooses the second item. Then change roles. Begin your questions with this phrase: <i>Would you rather …</i>',
          appVoice: true,
          items: [
            ['sleep outside', 'stay in a hotel'],
            ['spend money', 'save money'],
            ['play sports', 'watch sports'],
            ['drive fast', 'slowly'],
            ['be a movie star', 'a dentist'],
            ['go surfing', 'sit on the sand'],
            ['go swimming on Saturday morning', 'sleep late'],
            ['be silly', 'serious'],
            ['eat something spicy', 'sweet'],
            ['ask a question', 'answer a question'],
            ['do something exciting', 'relaxing'],
          ],
        },
      ],
    },
  ],
};

const pairs7 = {
  id: 'pairs-7',
  group: 'pairs',
  book: 'Practice 7 · Unit 31 E',
  title: 'Linking words with /ʃ/',
  source: 'PA',
  tracks: ['pa-48'],
  intro: '/ʃ/ + /ʃ/ is one long /ʃ/, and /s/ or /z/ before /ʃ/ becomes one long /ʃ/ too.',
  parts: [
    {
      label: 'E',
      title: 'Linking Words with /ʃ/',
      rule: 'Words in a phrase are linked together.<br>• /ʃ/ + /ʃ/: say one long /ʃ/, not two separate sounds.<br>• /s/ or /z/ + /ʃ/: link the two sounds and say them as one long /ʃ/.',
      steps: [
        {
          n: '1',
          type: 'repeat',
          task: 'Listen and repeat.',
          track: 'pa-48',
          items: [
            { m: 'English_sheets', note: '/ʃ/ + /ʃ/' },
            { m: 'this_shirt', note: '/s/ + /ʃ/' },
            { m: 'these_shirts', note: '/z/ + /ʃ/' },
            { m: 'These_shirts always_shrink.', note: '/z/ + /ʃ/' },
          ],
        },
        {
          n: '2',
          type: 'gap',
          task: 'Practice with a partner. What is another way to say the phrases below? Use an adjective to describe the nationality. Ask and answer the question.',
          track: 'pa-48',
          listenAfter: true,
          items: [
            { prompt: 'What do you call ships made in Denmark?', b: '___ ships', answer: ['Danish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/', example: true },
            { prompt: 'What do you call shoes made in Spain?', b: '___ shoes', answer: ['Spanish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/' },
            { prompt: 'What do you call shells found in Japan?', b: '___ shells', answer: ['Japanese'], note: '/z/ + /ʃ/ → one long /ʃ/' },
            { prompt: 'What do you call shampoo from Sweden?', b: '___ shampoo', answer: ['Swedish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/' },
            { prompt: 'What do you call sugar from Turkey?', b: '___ sugar', answer: ['Turkish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/' },
            { prompt: 'What do you call shirts from China?', b: '___ shirts', answer: ['Chinese'], note: '/z/ + /ʃ/ → one long /ʃ/' },
            { prompt: 'What do you call sheep from Poland?', b: '___ sheep', answer: ['Polish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/' },
            { prompt: 'What do you call shops in Switzerland?', b: '___ shops', answer: ['Swiss'], note: '/s/ + /ʃ/ → one long /ʃ/' },
          ],
        },
      ],
    },
  ],
};

const P8_WORDS = [
  syl('chocolate', 2, 'choc(o)late', 'choc·late', { example: true }),
  syl('interesting', 3, 'int(e)resting', 'in·tres·ting'),
  syl('special', 2, 'special', 'spe·cial: -cial is one syllable, /ʃəl/'),
  syl('temperature', 3, 'temp(e)rature', 'tem·pra·ture'),
  syl('delicious', 3, 'delicious', 'de·li·cious: -cious is one syllable, /ʃəs/'),
  syl('vegetable', 3, 'veg(e)table', 'veg·ta·ble'),
  syl('favorite', 2, 'fav(o)rite', 'fav·rite'),
  syl('everyone', 3, 'ev(e)ryone', 'ev·ry·one'),
  syl('naturally', 3, 'nat(u)rally', 'natch·ra·lly'),
  syl('commercials', 3, 'commercials', 'com·mer·cials: -cials is one syllable, /ʃəlz/'),
];

const pairs8 = {
  id: 'pairs-8',
  group: 'pairs',
  book: 'Practice 8 · Unit 33 E',
  title: 'Silent syllables',
  source: 'PA',
  tracks: ['pa-61'],
  intro: 'Some words have syllables that are not usually pronounced: choc(o)late, veg(e)table.',
  parts: [
    {
      label: 'E',
      title: 'Silent Syllables',
      rule: 'Some words have syllables that are not usually pronounced.',
      steps: [
        {
          n: '1',
          type: 'choice',
          task: 'Listen. How many syllables does each word have? Write the number of syllables in the space.',
          track: 'pa-61',
          options: ['1', '2', '3', '4'],
          items: P8_WORDS,
        },
        {
          n: '2',
          type: 'repeat',
          after: 'E1',
          task: 'Listen again. Repeat the words and check your answers. Be careful not to add any extra syllables when you say the words.',
          track: 'pa-61',
          items: P8_WORDS.map((w) => w.after),
        },
        {
          n: '3',
          type: 'select',
          task: 'Which words have the sound /tʃ/?',
          options: P8_WORDS.map((w) => w.m),
          answers: [0, 3, 8],
          explain:
            '<i>chocolate</i> (ch), <i>temperature</i> (/tʃər/) and <i>naturally</i> (/nætʃrəliy/) have /tʃ/. <i>Special, delicious</i> and <i>commercials</i> have /ʃ/, and <i>vegetable</i> has /dʒ/.',
        },
      ],
    },
  ],
};

const P9_PAIRS = [
  ["Why don'*t*_*y*ou tell me about yourself?", 'What woul*d*_*y*ou like to know?'],
  ['Where di*d*_*y*ou go to college?', 'In Japan.'],
  ['When di*d*_*y*ou graduate?', 'In June.'],
  ['What di*d*_*y*ou major in?', 'Engineering.'],
  ['What subjects di*d*_*y*ou enjoy in school?', 'My favorite subjects were biology and gym.'],
  ['What woul*d*_*y*our dream job be?', 'Managing a travel agency.'],
  ["What didn'*t*_*y*ou like about your last job?", "It wasn't challenging enough."],
  ['Coul*d*_*y*ou start on July 8th?', 'Yes, I could.'],
];

const pairs9 = {
  id: 'pairs-9',
  group: 'pairs',
  book: 'Practice 9 · Unit 34 E–I',
  title: 'Didja, wouldja, didncha, doncha',
  source: 'PA',
  tracks: ['pa-34e', 'pa-34f'],
  intro: 'In relaxed speech, /d/ + /y/ blend into /dʒ/ (did you → “didja”) and /t/ + /y/ into /tʃ/ (don’t you → “doncha”).',
  parts: [
    {
      label: 'E',
      title: 'Didja (did you); Wouldja (would you); Didncha (didn’t you); Doncha (don’t you)',
      rule: 'In relaxed speech, /d/ and /t/ are sometimes blended with /y/ to make a different sound.<br>• /d/ + /y/: a final /d/ blends with the /y/ at the start of the next word into /dʒ/.<br>• /t/ + /y/: a final /t/ blends with the /y/ at the start of the next word into /tʃ/.',
      steps: [
        {
          n: '1',
          type: 'repeat',
          task: 'Listen and repeat these phrases with the sound /dʒ/.',
          track: 'pa-34e',
          items: [{ m: 'di*d*_*y*ou', note: '/dʒ/' }, 'Di*d*_*y*ou call about the job?', 'What di*d*_*y*ou find out?', { m: 'woul*d*_*y*ou', note: '/dʒ/' }, 'Woul*d*_*y*ou arrange travel?'],
        },
        {
          n: '2',
          type: 'repeat',
          task: 'Listen and repeat these phrases with the sound /tʃ/.',
          track: 'pa-34e',
          items: [{ m: "didn'*t*_*y*ou", note: '/tʃ/' }, "Why didn'*t*_*y*ou tell me?", "Didn'*t*_*y*ou major in management?", { m: "don'*t*_*y*ou", note: '/tʃ/' }, "Don'*t*_*y*ou speak Japanese?"],
        },
      ],
    },
    {
      label: 'F',
      title: 'Scrambled Conversations',
      steps: [
        {
          n: '1',
          type: 'choice',
          task: 'Practice with a partner. Student A asks a question on the left. Student B responds with a sentence from the right.',
          listenAfter: true,
          ...scrambled(P9_PAIRS, [3, 7, 0, 6, 5, 2, 1, 4]),
        },
        { n: '2', type: 'dialogues', after: 'F1', task: 'Listen and check your answers.', track: 'pa-34f', dialogues: conversations(P9_PAIRS) },
      ],
    },
    {
      label: 'G',
      title: 'Role-Play',
      steps: [
        {
          n: '',
          type: 'speak',
          task: 'Practice in a group of two or three people. Imagine that you are at a job interview. One person wants the job. The other person or people ask questions. Use ideas from task F or your own ideas.',
          prompts: P9_PAIRS.map(([q]) => q),
          label: 'Role-play: a job interview',
        },
      ],
    },
    {
      label: 'H',
      title: 'Spelling',
      steps: [
        {
          n: '',
          type: 'spelling',
          task: 'The sound /dʒ/ is usually spelled with the letter <i>j</i> or <i>g</i>. Add more examples below.',
          sound: '/dʒ/',
          rows: [
            { label: 'j', given: ['job', 'joke', 'enjoy', 'subject'], list: 'dj-j', spell: 'j' },
            { label: 'g before e, i, or y', given: ['college', 'agency', 'original', 'psychology'], list: 'dj-g', spell: 'g[eiy]' },
          ],
          info: [
            ['dge', 'bridge, knowledge, judge'],
            ['Other spelling: d before u', 'graduate, individual, education'],
          ],
        },
      ],
    },
    {
      label: 'I',
      title: 'Common Expressions',
      steps: [
        {
          n: '',
          type: 'repeat',
          task: 'Listen and repeat these common expressions with the sound /dʒ/.',
          appVoice: true,
          items: [
            'I was just joking.',
            'When di*d*_*y*ou graduate from college?',
            'What di*d*_*y*ou major in?',
            'Di*d*_*y*ou get the job?',
            'Woul*d*_*y*ou like some orange juice?',
            'You need a college education.',
          ],
        },
      ],
    },
  ],
};

const pairs10 = {
  id: 'pairs-10',
  group: 'pairs',
  book: 'Practice 10 · Unit 36 E',
  title: 'Useta (used to)',
  source: 'PA',
  tracks: ['pa-36e'],
  intro: 'Used to and use to sound the same: linked together, /yuwstə/, “useta”.',
  parts: [
    {
      label: 'E',
      title: 'Useta (used to)',
      rule: '<i>Used to</i> (or <i>use to</i> in questions and negatives) shows that something was true in the past but is not true now.<br>• <i>Used to</i> and <i>use to</i> are pronounced the same.<br>• The words are linked together and pronounced /yuwstə/ (“useta”).',
      steps: [
        {
          n: '',
          type: 'repeat',
          task: 'Listen and repeat.',
          track: 'pa-36e',
          items: [
            { m: 'used to', note: '“useta”', ipa: '/yuwstə/' },
            { m: 'He *used to* play the piano.', note: '“useta”' },
            { m: 'Did you *use to* live in New York?', note: '“useta”' },
          ],
        },
      ],
    },
  ],
};

const pairs11 = {
  id: 'pairs-11',
  group: 'pairs',
  book: 'Practice 11 · Unit 40 E–F',
  title: 'Dropped /h/',
  source: 'PA',
  tracks: ['pa-40e'],
  intro: 'He, his, him and her often lose their /h/ in the middle of a sentence; the rest of the word links to the word before it.',
  parts: [
    {
      label: 'E',
      title: 'Dropped /h/',
      rule: 'Pronouns like <i>he, his, him</i> and <i>her</i> are usually unstressed and have a weak pronunciation.<br>• Their /h/ is often dropped when the pronoun is in the middle or at the end of a sentence.<br>• If you drop the /h/, link the rest of the pronoun to the word before it.<br>• The /h/ is pronounced at the beginning of a sentence or after a pause.',
      steps: [
        {
          n: '1',
          type: 'repeat',
          task: 'Listen and repeat. The sound /h/ is dropped in these examples.',
          track: 'pa-40e',
          items: [{ m: 'was_(h)e', note: 'sounds like “wuzzy”' }, 'Was_(h)e hurt?', 'hit_(h)im', 'A vehicle hit_(h)im from behind.'],
        },
        {
          n: '2',
          type: 'repeat',
          task: 'Listen and repeat. The sound /h/ is pronounced in these examples.',
          track: 'pa-40e',
          items: ['He was in a car accident.', 'No, he was completely unharmed.'],
        },
      ],
    },
    {
      label: 'F',
      title: 'Intonation in Exclamations',
      rule: 'To show strong feeling, the voice goes up very high before it falls, and the important words are extra long.',
      steps: [
        {
          n: '',
          type: 'repeat',
          task: 'Listen and repeat.',
          appVoice: true,
          items: [
            { m: 'Oh, no!', note: '↗↘ NO' },
            { m: 'How horrible!', note: '↗↘ HORrible' },
            { m: 'How exciting!', note: '↗↘ exCITing' },
            { m: 'How awful!', note: '↗↘ AWful' },
            { m: 'How wonderful!', note: '↗↘ WONderful' },
            { m: "That's horrible!", note: '↗↘ HORrible' },
          ],
        },
      ],
    },
  ],
};

const pairs12 = {
  id: 'pairs-12',
  group: 'pairs',
  book: 'Practice 12 · Unit 42 F–G',
  title: 'Weak the and than',
  source: 'PA',
  tracks: ['pa-42f'],
  intro: 'The is /ðə/ before a consonant and /ðiy/ before a vowel; than is /ðən/.',
  parts: [
    {
      label: 'F',
      title: 'Weak Pronunciations for the and than',
      rule: '<i>The</i> and <i>than</i> are normally unstressed and have weak pronunciations.<br>• Before a consonant sound, <i>the</i> is /ðə/, with the short vowel /ə/.<br>• Before a vowel sound, <i>the</i> is often /ðiy/, and its /y/ links it to the next vowel.<br>• <i>Than</i> is /ðən/.<br>The word <i>one</i> starts with a consonant sound, /w/, even though it is spelled with o.',
      steps: [
        {
          n: '',
          type: 'repeat',
          task: 'Listen and repeat.',
          track: 'pa-42f',
          items: [
            { m: 'the one with the zipper', note: 'the = /ðə/ · /ðə/' },
            { m: 'the_[y]others', note: 'the = /ðiy/' },
            { m: 'better than the_[y]others', note: 'than = /ðən/' },
            'Which jacket do you think is better than the_[y]others?',
            'I think the one with the belt is better than the_[y]others.',
          ],
        },
      ],
    },
    {
      label: 'G',
      title: 'Conversation Practice',
      steps: [
        {
          n: '',
          type: 'build',
          task: 'Work with a partner. Talk about the four jackets using words from the list below.',
          note: 'The picture shows four jackets: one with a belt, a leather jacket, one with a zipper, and one with a $130 price tag.',
          words: ['better', 'warmer', 'dressier', 'more attractive', 'more comfortable', 'more expensive', 'more stylish', 'more practical', 'more casual'],
          jackets: ['one with the belt', 'leather jacket', 'one with the zipper', 'jacket for $130'],
          verbs: ['is', 'looks'],
        },
      ],
    },
  ],
};

const pairs13 = {
  id: 'pairs-13',
  group: 'pairs',
  book: 'Practice 13 · Unit 45 E',
  title: 'Syllabic /n/',
  source: 'PA',
  tracks: ['pa-45e'],
  intro: 'Sometimes /n/ makes a syllable with no vowel sound: gard(e)n, stud(e)nt, didn’t.',
  parts: [
    {
      label: 'E',
      title: 'Syllabic /n/',
      rule: 'Sometimes the sound /n/ makes a syllable without any vowel sound: a “syllabic /n/”.<br>• It occurs only in unstressed syllables.<br>• It usually comes after another sound made with the tip of the tongue just behind the top teeth: /t/, /d/, /s/ or /z/.',
      steps: [
        {
          n: '1',
          type: 'repeat',
          task: 'Listen and repeat. Try not to move the tip of your tongue between the sound /d/, /z/, or /t/ and the following /n/.',
          track: 'pa-45e',
          items: ['gard(e)n', 'forbidd(e)n', 'stud(e)nt', 'pris(o)n', "isn't", "doesn't", "didn't", "couldn't", 'writt(e)n', 'gott(e)n', 'import(a)nt', 'cert(ai)nly'],
        },
        {
          n: '2',
          type: 'repeat',
          task: 'Listen and repeat. The word <i>and</i> is often pronounced as a syllabic /n/.',
          track: 'pa-45e',
          items: [
            { m: 'seven hundred and ninety', note: '790 · “seven hundred ’n’ ninety”' },
            { m: 'eleven hundred and twenty, or one thousand one hundred and twenty', note: '1,120 · and = ’n’' },
            { m: 'Main Street and Central Avenue', note: 'and = ’n’' },
            { m: 'no noise and no television', note: 'and = ’n’' },
          ],
        },
      ],
    },
  ],
};

export const ppSets = [ppU36, ppU37, pairs1, pairs2, pairs3, pairs4, pairs5, pairs6, pairs7, pairs8, pairs9, pairs10, pairs11, pairs12, pairs13];

// Each worksheet also gets a flat list of its steps, each with its part and a
// key like "E2" (or "6" when the book has no letters).
for (const sheet of ppSets) {
  const seen = new Set();
  sheet.steps = sheet.parts.flatMap((part) =>
    part.steps.map((step) => {
      let key = step.key || `${part.label}${step.n}` || 'step';
      for (let i = 2; seen.has(key); i++) key = `${part.label}${step.n}·${i}`;
      seen.add(key);
      return Object.assign(step, { part, key, group: sheet.group, source: sheet.source });
    }),
  );
}
