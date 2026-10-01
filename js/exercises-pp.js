// Session VI practice, from the teacher's Drive folder "Session VI Connected Speech":
//   Practices 2 — Hewings & Goldstein, Pronunciation Plus, Units 36–37 (tracks 04–10)
//   Practices 3 — Baker & Goldstein, Pronunciation Pairs (practices 1–13)
// Only exercises that come with a recording are included, in the book's order.
// Answers and wording were checked against the recordings (speech recognition,
// plus /h/-or-no-/h/ alignment for Unit 37 Ex. 4). The app's own voices read
// every line; `tracks` names the book recording that goes with each set.
//
// Extra fields used by these sets:
//   group, book   – heading on the practice page; unit and exercise in the book
//   tracks        – ids of the set's book recordings (js/book-audio.js)
//   examples      – listen-and-repeat lines shown above the exercise
//   listenAfter   – (choice) the audio is offered after answering, not before
//   item.m / item.after – (choice) the sentence in markup, before and after answering
//   item.dialogue – (choice) a short conversation shown after answering
//   lines, reveal – (pick) one sentence per line; linked versions shown after checking
//   sections      – (repeat) listen-and-repeat lists, no score
//   compare       – (gap) word pairs to listen to before the gap fill
//   conversations – (hdrop) lines with {h-words}; {^word} marks a lost /h/

import { renderMarkup, spokenText } from './markup.js';

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

// Scrambled conversations: [A's line, B's reply] in the book's order of A's
// lines; bOrder gives B's column as the book prints it.
function scrambled(pairs, bOrder) {
  const replies = bOrder.map((i) => pairs[i][1]);
  return {
    options: replies.map(spokenText),
    items: pairs.map(([m, reply]) => ({
      m,
      answer: replies.indexOf(reply),
      dialogue: [
        { who: 'A', voice: 'A', m },
        { who: 'B', voice: 'B', m: reply },
      ],
    })),
  };
}

// "How many syllables?": the word, its count, and the letters that go silent.
const syl = (word, count, after, explain) => ({ m: word, after, answer: count - 1, explain });

export const ppSets = [
  // ─── Practices 2 · Pronunciation Plus ────────────────────────────────────
  {
    id: 'pp36-repeat',
    group: 'pplus',
    book: 'Unit 36 · Ex. 4–5',
    tracks: ['pp-04', 'pp-05'],
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
    tracks: ['pp-06'],
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
    tracks: ['pp-07', 'pp-08'],
    title: 'Short first syllables',
    source: 'PP',
    type: 'gap',
    gapNote: 'the first syllable is just a short /ə/.',
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
    book: 'Unit 37 · Ex. 4–5',
    tracks: ['pp-10'],
    title: 'Disappearing /h/',
    source: 'PP',
    type: 'hdrop',
    intro:
      'The /h/ at the start of some words is very short or not pronounced at all. Listen to each conversation and tap every underlined word where the /h/ disappears.',
    conversations: H_CONVERSATIONS,
    explain: `The words that change are <b>he, him, his, her, have</b> and the <b>who</b> that joins two ideas (<i>the man who robbed…</i>). When they are unstressed in the middle of a sentence, the /h/ disappears and the word links to the one before it: <i>${renderMarkup('found_(h)im')}, ${renderMarkup('tell_(h)er')}</i>. The /h/ stays at the start of a sentence (<i>He did…</i>), in a question word on its own (<i>Who?</i>) and when the word is stressed (<i>HIS book’s over there</i>). Content words like <i>house, Henry, heart, home, here</i> and <i>hope</i> always keep it.`,
  },

  // ─── Practices 3 · Pronunciation Pairs ───────────────────────────────────
  {
    id: 'pairs-linking',
    group: 'pairs',
    book: 'Practice 1 · Unit 12 E',
    tracks: ['pa-15'],
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
    tracks: ['pa-16'],
    title: 'Scrambled conversations: /ow/',
    source: 'PA',
    type: 'choice',
    listenAfter: true,
    intro: 'Student A says a line; which is B’s answer? Then play the conversation and say it with a partner, linking /ow/ with /w/.',
    ...scrambled(
      [
        ['Do you know_[w]everyone here?', "No,_[w]I don't."],
        ['Hello. Can I speak to Joe?', "Sorry, Joe_[w]isn't home now."],
        ['Is it OK if I take one?', 'Sure, go_[w]ahead.'],
        ['Is the window_[w]open?', 'No,_[w]are you cold?'],
        ['Did you call Joan?', 'Yes, but there was no_[w]answer.'],
        ['Is there snow_[w]on the ground?', "No,_[w]it's only snowing a little."],
        ["We can't go_[w]in yet.", "I know. It's so_[w]annoying."],
      ],
      [2, 4, 0, 5, 3, 6, 1],
    ),
  },
  {
    id: 'pairs-phrasal',
    group: 'pairs',
    book: 'Practice 2 · Unit 18 E',
    tracks: ['pa-53'],
    title: 'Stress and linking in phrasal verbs',
    source: 'PA',
    type: 'repeat',
    intro:
      'A phrasal verb (verb + preposition) has its own meaning. Both words are stressed, an object pronoun like it is not, and the words are linked without a break. Listen and repeat.',
    sections: [
      {
        h: 'Both words stressed',
        note: 'He’s SITting DOWN · He’s GOing OUT',
        items: [
          "He's sitting down.",
          "He's lying down.",
          "He's turning_around.",
          "He's going_[w]out.",
          "He's running_around.",
          "He's working_out.",
        ],
      },
      {
        h: 'With it in the middle',
        note: 'it is not stressed: THROW it OUT · PUT it DOWN',
        items: ['Throw_[w]it_out.', 'Put_it_down.', 'Figure_it_out.', 'Turn_it_down.', 'Cross_it_out.', 'Write_it_down.'],
      },
    ],
  },
  {
    id: 'pairs-linking-review',
    group: 'pairs',
    book: 'Practice 3 · Unit 19 B',
    tracks: ['pa-56'],
    title: 'Linking practice: /y/ or /w/?',
    source: 'PA',
    type: 'choice',
    intro:
      'When /ay/, /ɔy/ or /aw/ comes before another vowel sound, a /y/ or a /w/ links it to the next word. Listen to each sentence: which sound links the marked words?',
    options: ['/w/', '/y/'],
    items: [
      wy('Did you buy_it?', Y, 'buy ends in /ay/ → /y/.'),
      wy('Now_I see.', W, 'Now ends in /aw/ → /w/.'),
      wy("Why don't you try_it?", Y, 'try ends in /ay/ → /y/.'),
      wy('You might enjoy_it.', Y, 'enjoy ends in /ɔy/ → /y/.'),
      wy('How_are you doing?', W, 'How ends in /aw/ → /w/.'),
      wy('Is the boy_on the ground?', Y, 'boy ends in /ɔy/ → /y/.'),
      wy('Why_is there a cloud?', Y, 'Why ends in /ay/ → /y/.'),
    ],
  },
  {
    id: 'pairs-final-t',
    group: 'pairs',
    book: 'Practice 4 · Unit 24 C',
    tracks: ['pa-24c'],
    title: 'Linking a final consonant',
    source: 'PA',
    type: 'repeat',
    intro:
      'Words are linked without a break: a final consonant joins the sound at the start of the next word. What happens to a final /t/ depends on what comes next. Listen and repeat.',
    sections: [
      { h: 'Consonant + vowel', note: 'Say the /t/ as part of the next word.', items: ['post_office', 'First_Avenue'] },
      { h: 'Vowel + /t/ + vowel', note: 'The /t/ is flapped: a quick /d/.', items: ['a lo*t*_of', 'ge*t*_off'] },
      { h: 'Same consonant', note: 'The two /t/ sounds are one long /t/.', items: ['a great_Thai restaurant', 'What_time is it?'] },
      { h: 'Different consonant', note: 'Say the /t/ quietly and go right to the next sound.', items: ['your best bet', 'just past'] },
    ],
  },
  {
    id: 'pairs-gonna',
    group: 'pairs',
    book: 'Practice 5 · Unit 27 E–F',
    tracks: ['pa-27e', 'pa-27f'],
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
    id: 'pairs-cluster',
    group: 'pairs',
    book: 'Practice 6 · Unit 29 C–D',
    tracks: ['pa-29c', 'pa-29d'],
    title: 'Linking a final consonant cluster',
    source: 'PA',
    type: 'choice',
    listenAfter: true,
    intro:
      'Link a final -s clearly to a vowel (it’s‿expensive). Before another /s/, say one long /s/ (let’s‿sit), and don’t drop the -s. Repeat, then match each suggestion with B’s answer and play the conversation.',
    examples: [
      "It's_expensive.",
      "Let's_eat.",
      { m: "Let's_sit.", note: 'one long /s/' },
      { m: "Let's_sit on the sand.", note: 'one long /s/' },
      { m: "Let's_stay in a hotel.", note: 'one long /s/' },
      { m: "Let's_sleep outside.", note: 'one long /s/' },
    ],
    ...scrambled(
      [
        ["Let's_sit in the sun.", "Let's_sit in the shade instead."],
        ["Let's_eat steak.", "Let's_eat pizza instead."],
        ["Let's_stay in a hotel.", "Let's_sleep outside instead."],
        ["Let's_spend all the money.", "Let's_save some money instead."],
        ["Let's_swim in the ocean.", "Let's_swim in the pool instead."],
        ["Let's_see a movie on Sunday.", "Let's_study on Sunday instead."],
        ["Let's_ask Stacy.", "Let's_ask Steve instead."],
        ["Let's_speak Spanish.", "Let's_speak English instead."],
      ],
      [2, 4, 0, 6, 7, 3, 5, 1],
    ),
  },
  {
    id: 'pairs-sh',
    group: 'pairs',
    book: 'Practice 7 · Unit 31 E',
    tracks: ['pa-48'],
    title: 'Linking words with /ʃ/',
    source: 'PA',
    type: 'gap',
    listenAfter: true,
    intro:
      'When /ʃ/ ends a word and the next word starts with /ʃ/, say one long /ʃ/. /s/ or /z/ before /ʃ/ also becomes one long /ʃ/. Repeat, then write the nationality and listen to check.',
    examples: [
      { m: 'English_sheets', note: '/ʃ/ + /ʃ/' },
      { m: 'this_shirt', note: '/s/ + /ʃ/' },
      { m: 'these_shirts', note: '/z/ + /ʃ/' },
      { m: 'These_shirts always_shrink.', note: '/z/ + /ʃ/' },
    ],
    items: [
      { prompt: 'What do you call ships made in Denmark?', b: '___ ships', answer: ['Danish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/' },
      { prompt: 'What do you call shoes made in Spain?', b: '___ shoes', answer: ['Spanish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/' },
      { prompt: 'What do you call shells found in Japan?', b: '___ shells', answer: ['Japanese'], note: '/z/ + /ʃ/ → one long /ʃ/' },
      { prompt: 'What do you call shampoo from Sweden?', b: '___ shampoo', answer: ['Swedish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/' },
      { prompt: 'What do you call sugar from Turkey?', b: '___ sugar', answer: ['Turkish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/' },
      { prompt: 'What do you call shirts from China?', b: '___ shirts', answer: ['Chinese'], note: '/z/ + /ʃ/ → one long /ʃ/' },
      { prompt: 'What do you call sheep from Poland?', b: '___ sheep', answer: ['Polish'], note: '/ʃ/ + /ʃ/ → one long /ʃ/' },
      { prompt: 'What do you call shops in Switzerland?', b: '___ shops', answer: ['Swiss'], note: '/s/ + /ʃ/ → one long /ʃ/' },
    ],
  },
  {
    id: 'pairs-silent',
    group: 'pairs',
    book: 'Practice 8 · Unit 33 E',
    tracks: ['pa-61'],
    title: 'Silent syllables',
    source: 'PA',
    type: 'choice',
    intro: 'Some words have syllables that are not usually pronounced. Listen: how many syllables does each word have?',
    options: ['1', '2', '3', '4'],
    items: [
      syl('chocolate', 2, 'choc(o)late', 'choc·late'),
      syl('interesting', 3, 'int(e)resting', 'in·tres·ting'),
      syl('special', 2, 'special', 'spe·cial: -cial is one syllable, /ʃəl/'),
      syl('temperature', 3, 'temp(e)rature', 'tem·pra·ture'),
      syl('delicious', 3, 'delicious', 'de·li·cious: -cious is one syllable, /ʃəs/'),
      syl('vegetable', 3, 'veg(e)table', 'veg·ta·ble'),
      syl('favorite', 2, 'fav(o)rite', 'fav·rite'),
      syl('everyone', 3, 'ev(e)ryone', 'ev·ry·one'),
      syl('naturally', 3, 'nat(u)rally', 'natch·ra·lly'),
      syl('commercials', 3, 'commercials', 'com·mer·cials: -cials is one syllable, /ʃəlz/'),
    ],
  },
  {
    id: 'pairs-didja',
    group: 'pairs',
    book: 'Practice 9 · Unit 34 E–F',
    tracks: ['pa-34e', 'pa-34f'],
    title: 'Didja, wouldja, didncha, doncha',
    source: 'PA',
    type: 'choice',
    listenAfter: true,
    intro:
      'In relaxed speech, /d/ + /y/ blend into /dʒ/ (did you → “didja”) and /t/ + /y/ into /tʃ/ (don’t you → “doncha”). Repeat, then match each interview question with its answer and play the conversation.',
    examples: [
      { m: 'di*d*_*y*ou', note: '/dʒ/ “didja”' },
      'Di*d*_*y*ou call about the job?',
      'What di*d*_*y*ou find out?',
      { m: 'woul*d*_*y*ou', note: '/dʒ/ “wouldja”' },
      'Woul*d*_*y*ou arrange travel?',
      { m: "didn'*t*_*y*ou", note: '/tʃ/ “didncha”' },
      "Why didn'*t*_*y*ou tell me?",
      "Didn'*t*_*y*ou major in management?",
      { m: "don'*t*_*y*ou", note: '/tʃ/ “doncha”' },
      "Don'*t*_*y*ou speak Japanese?",
    ],
    ...scrambled(
      [
        ["Why don'*t*_*y*ou tell me about yourself?", 'What woul*d*_*y*ou like to know?'],
        ['Where di*d*_*y*ou go to college?', 'In Japan.'],
        ['When di*d*_*y*ou graduate?', 'In June.'],
        ['What di*d*_*y*ou major in?', 'Engineering.'],
        ['What subjects di*d*_*y*ou enjoy in school?', 'My favorite subjects were biology and gym.'],
        ['What woul*d*_*y*our dream job be?', 'Managing a travel agency.'],
        ["What didn'*t*_*y*ou like about your last job?", "It wasn't challenging enough."],
        ['Coul*d*_*y*ou start on July 8th?', 'Yes, I could.'],
      ],
      [3, 7, 0, 6, 5, 2, 1, 4],
    ),
  },
  {
    id: 'pairs-useta',
    group: 'pairs',
    book: 'Practice 10 · Unit 36 E',
    tracks: ['pa-36e'],
    title: 'Useta (used to)',
    source: 'PA',
    type: 'repeat',
    intro:
      'Used to (and use to in questions and negatives) shows something that was true in the past but isn’t now. Both are said the same way, linked together: /yuwstə/, “useta”. Listen and repeat.',
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
    tracks: ['pa-40e'],
    title: 'Dropped /h/',
    source: 'PA',
    type: 'repeat',
    intro:
      'He, his, him and her are usually unstressed. In the middle or at the end of a sentence their /h/ is often dropped, and the rest of the word links to the word before it. At the start of a sentence or after a pause, the /h/ is pronounced.',
    sections: [
      {
        h: 'The /h/ is dropped',
        items: [{ m: 'was_(h)e', note: 'sounds like “wuzzy”' }, 'Was_(h)e hurt?', 'hit_(h)im', 'A vehicle hit_(h)im from behind.'],
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
    tracks: ['pa-42f'],
    title: 'Weak the and than',
    source: 'PA',
    type: 'repeat',
    intro:
      'The and than are normally unstressed. Before a consonant, the is /ðə/; before a vowel it is often /ðiy/, linked with /y/. Than is /ðən/. (One starts with the consonant /w/.) Listen and repeat.',
    sections: [
      {
        h: 'Listen and repeat',
        items: [
          { m: 'the one with the zipper', note: 'the = /ðə/' },
          { m: 'the_[y]others', note: 'the = /ðiy/' },
          { m: 'better than the_[y]others', note: 'than = /ðən/' },
          'Which jacket do you think is better than the_[y]others?',
          'I think the one with the belt is better than the_[y]others.',
        ],
      },
    ],
  },
  {
    id: 'pairs-syllabic-n',
    group: 'pairs',
    book: 'Practice 13 · Unit 45 E',
    tracks: ['pa-45e'],
    title: 'Syllabic /n/',
    source: 'PA',
    type: 'repeat',
    intro:
      'Sometimes /n/ makes a syllable with no vowel sound: a syllabic /n/. It comes in unstressed syllables, usually after /t/, /d/, /s/ or /z/. Listen and repeat.',
    sections: [
      {
        h: 'After /d/, /z/ and /t/',
        note: 'Don’t move the tip of your tongue between the /d/, /z/ or /t/ and the /n/.',
        items: [
          'gard(e)n',
          'forbidd(e)n',
          'stud(e)nt',
          'pris(o)n',
          "isn't",
          "doesn't",
          "didn't",
          "couldn't",
          'writt(e)n',
          'gott(e)n',
          'import(a)nt',
          'cert(ai)nly',
        ],
      },
      {
        h: 'And as a syllabic /n/',
        items: [
          { m: 'seven hundred and ninety', note: '790 · “seven hundred ’n’ ninety”' },
          { m: 'eleven hundred and twenty, or one thousand one hundred and twenty', note: '1,120 · and = ’n’' },
          { m: 'Main Street and Central Avenue', note: 'and = ’n’' },
          { m: 'no noise and no television', note: 'and = ’n’' },
        ],
      },
    ],
  },
];
