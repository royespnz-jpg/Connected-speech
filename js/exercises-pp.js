// Session VI practice: Hewings & Goldstein, Pronunciation Plus, Units 36–37,
// in the book's order. The audio is made with the app's voices; the Unit 36
// conversation is rebuilt from the sentences the book takes from it.
//
// Extra fields used by these sets:
//   group     – which heading the set is listed under (see exerciseGroups)
//   book      – unit and exercise numbers in the book
//   dialogue  – (choice) a conversation to listen to before answering
//   listenAfter – (choice) the audio is offered after answering, not before
//   item.m / item.after – (choice) the sentence in markup, before and after answering
//   item.dialogue – (choice) a short conversation shown after answering
//   sections  – (repeat) listen-and-repeat lists, no score
//   compare   – (gap) word pairs to listen to before the gap fill
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

// Exercise 8: five two-line conversations made from the sentences in 6.
const PAIRS = [
  ['Hi,_[y]Ann!', 'Hi, how_[w]are you?'],
  ['Did you see_[y]it?', "No,_[w]I didn't."],
  ["There's no_[w]answer.", 'He must be_[y]at the office.'],
  ['Can I try_[y]it?', 'Go_[w]ahead.'],
  ['When can you do_[w]it?', 'Sunday_[y]afternoon.'],
];
const REPLY_ORDER = [3, 0, 4, 1, 2]; // replies listed in a fixed, mixed order
const REPLIES = REPLY_ORDER.map((i) => PAIRS[i][1]);

// Unit 37, exercise 4. A/B/C are the speakers; C uses the first voice again.
const H_CONVERSATIONS = [
  [
    ['A', '{Have} they found {^him}?'],
    ['B', '{Who}?'],
    ['A', 'The man who robbed your {house}.'],
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

// "found {^him}" → "found_(h)im": the lost /h/ shown faded, linked to the word before.
export function hLinked(line) {
  return line.replace(/ \{\^h([a-z']+)\}/g, '_(h)$1').replace(/\{\^?([^}]+)\}/g, '$1');
}

export const ppSets = [
  {
    id: 'pp36-birthday',
    group: 'pp36',
    book: 'Unit 36 · Ex. 1–3',
    title: "Brian's birthday",
    source: 'PP',
    type: 'choice',
    intro:
      'Listen to Joe and Mary Ann planning a birthday and answer the questions. The text appears when you finish: look for the little /w/ and /y/ sounds that join the words.',
    dialogue: {
      title: 'Joe and Mary Ann',
      lines: [
        { who: 'Mary Ann', voice: 'A', m: "You know_[w]it's Brian's birthday_[y]on Thursday?" },
        { who: 'Joe', voice: 'B', m: 'Oh,_[w]I forgot all about it! We should buy_[y](h)im a present.' },
        { who: 'Mary Ann', voice: 'A', m: 'Do you have any_[y]ideas?' },
        { who: 'Joe', voice: 'B', m: "What about a new_[w]umbrella? His old one's broken. He should just throw_[w]it away." },
        {
          who: 'Mary Ann',
          voice: 'A',
          m: "Good idea. It won't be too_[w]expensive. If we pay_[y]about twenty dollars, we could get him something nice.",
        },
        {
          who: 'Joe',
          voice: 'B',
          m: "We really_[y]ought to have a party_[y]or something for him, too. Why don't we_[y]invite a few friends?",
        },
        { who: 'Mary Ann', voice: 'A', m: 'Great. What about Thursday_[y]evening?' },
        { who: 'Joe', voice: 'B', m: 'He has an interview_[w]on Friday. More people will be free_[y]on Saturday.' },
        { who: 'Mary Ann', voice: 'A', m: "Yeah, let's do_[w]it Saturday. You_[w]arrange the party, and I'll get the umbrella." },
      ],
    },
    items: [
      {
        q: "When is Brian's birthday?",
        options: ['On Thursday', 'On Friday', 'On Saturday'],
        answer: 0,
        explain: '“It’s Brian’s birthday on Thursday.”',
      },
      {
        q: 'What present do they decide to get him?',
        options: ['A book', 'A new umbrella', 'Tickets for a party'],
        answer: 1,
        explain: '“What about a new umbrella? His old one’s broken.”',
      },
      {
        q: 'When are they going to have the party?',
        options: ['Thursday evening', 'Friday', 'Saturday'],
        answer: 2,
        explain: 'Brian has an interview on Friday, and more people will be free on Saturday.',
      },
    ],
  },
  {
    id: 'pp36-repeat',
    group: 'pp36',
    book: 'Unit 36 · Ex. 4–5',
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
    group: 'pp36',
    book: 'Unit 36 · Ex. 6–7',
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
    id: 'pp36-pairs',
    group: 'pp36',
    book: 'Unit 36 · Ex. 8',
    title: 'Five short conversations',
    source: 'PP',
    type: 'choice',
    listenAfter: true,
    intro: 'Match each line with the best reply. Then play the conversation and say it with a partner, linking the words.',
    options: REPLIES.map((r) => r.replace(/_\[[wy]\]/g, ' ')),
    items: PAIRS.map(([m, reply]) => ({
      m,
      answer: REPLIES.indexOf(reply),
      dialogue: [
        { who: 'A', voice: 'A', m },
        { who: 'B', voice: 'B', m: reply },
      ],
    })),
  },
  {
    id: 'pp37-short',
    group: 'pp37',
    book: 'Unit 37 · Ex. 1–2',
    title: 'Short first syllables',
    source: 'PP',
    type: 'gap',
    intro:
      'Words like along, away and ago start with a very short, unstressed /ə/ that is easy to miss. Compare first, then listen to each conversation and write the missing word.',
    compare: [
      ['long', "It's long."],
      ['*a*long', "It's *a*long here."],
      ['way', "I'm going this way."],
      ['*a*way', "I'm going *a*way."],
    ],
    items: [
      { a: 'Where does she live?', b: 'Just ___ the street.', answer: 'across', ipa: '/əkrɔs/' },
      { a: "Do you think I'm right?", b: 'Yes, I ___ completely.', answer: 'agree', ipa: '/əgriy/' },
      { a: "Can't you sleep?", b: "No, I've been ___ for hours.", answer: 'awake', ipa: '/əweyk/' },
      { a: 'When did you move here?', b: 'Two years ___.', answer: 'ago', ipa: '/əgow/' },
      { a: "Don't you get lonely in that big house?", b: 'No, I like living ___.', answer: 'alone', ipa: '/əlown/' },
      { a: 'Is the bank near here?', b: "Yes. It's ___ five minutes.", answer: 'about', ipa: '/əbawt/' },
      { a: 'Can I speak to David?', b: "Sorry, he's ___ right now.", answer: 'away', ipa: '/əwey/' },
      { a: 'Have you seen my keys?', b: "Yes, they're ___ here somewhere.", answer: 'around', ipa: '/ərawnd/' },
    ],
  },
  {
    id: 'pp37-h',
    group: 'pp37',
    book: 'Unit 37 · Ex. 3–5',
    title: 'Disappearing /h/',
    source: 'PP',
    type: 'hdrop',
    intro:
      'The /h/ at the start of some words is very short or not pronounced at all. Listen to each conversation and tap every h-word where the /h/ disappears.',
    examples: ['Does_(h)e like it?', "What's_(h)er name?"],
    conversations: H_CONVERSATIONS,
    explain: `The words that change are <b>he, him, his, her</b> and <b>have</b>. When they are unstressed in the middle of a sentence, the /h/ disappears and the word links to the one before it: <i>${renderMarkup('found_(h)im')}, ${renderMarkup('tell_(h)er')}</i>. The /h/ stays at the start of a sentence (<i>He did…</i>) and when the word is stressed (<i>HIS book’s over there</i>). Content words like <i>house, Henry, heart, home, here</i> and <i>hope</i> always keep it.`,
  },
  {
    id: 'pp37-say',
    group: 'pp37',
    book: 'Unit 37 · Ex. 6',
    title: 'Say the conversations',
    source: 'PP',
    type: 'repeat',
    intro:
      'Now say the conversations yourself. When the /h/ drops, link the word to the one before it, as in Have they found‿(h)im? Listen to each line, record yourself and compare.',
    sections: H_CONVERSATIONS.map((lines, n) => ({
      h: `Conversation ${n + 1}`,
      items: lines.map(([who, line]) => ({ m: hLinked(line), note: who, voice: SPEAKER_VOICE[who] })),
    })),
  },
];
