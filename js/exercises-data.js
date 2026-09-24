// Practice sets. Types:
//   choice    – one question per item, pick one option
//   blank     – sentence with ___, pick the form that fits the meaning
//   pick      – click the words in a passage that match a rule
//   dictation – listen and type what you hear

const PROCESSES = [
  'Linking',
  'Progressive assimilation',
  'Regressive assimilation',
  'Coalescent assimilation',
  'Deletion',
  'Epenthesis',
  'Dissimilation',
];
const P = Object.fromEntries(PROCESSES.map((p, i) => [p, i]));

const PAL = ['/ʃ/', '/ʒ/', '/tʃ/', '/dʒ/'];
const T3 = ['Regular [t]', 'Flap (d-like t)', 'Disappearing t'];
const DEL = ['/t, d/ deleted', 'No deletion', 'Resyllabified onto the vowel'];
const USE = ['Use it', 'Recognize it — don’t pile it up', 'Avoid it'];

// For sentences built from a blank, TTS reads the full form of spellings it
// would mispronounce (e.g. "hasta" as Spanish).
const SPOKEN = { hasta: 'has to', usta: 'used to', hafta: 'have to', oughta: 'ought to' };

export const exerciseSets = [
  {
    id: 'processes',
    title: 'Name the process',
    source: 'CM',
    type: 'choice',
    intro: 'Which connected-speech process explains each change?',
    options: PROCESSES,
    items: [
      { q: '<b>bags</b> — the -s is /z/ because of the voiced /g/', say: 'bags', answer: P['Progressive assimilation'], explain: 'The first sound (/g/) conditions the one after it.' },
      { q: '<b>grandpa</b> → /græmpə/', say: 'grandpa', answer: P['Regressive assimilation'], explain: 'The /p/ changes the /n/ before it into /m/ (and the /d/ is lost).' },
      { q: '<b>Did you…?</b> → /dɪdʒuw/', say: 'Did you see it?', answer: P['Coalescent assimilation'], explain: '/d/ + /y/ merge into a third sound, /dʒ/: palatalization.' },
      { q: '<b>prince</b> → /prɪnts/', say: 'prince', answer: P['Epenthesis'], explain: 'A [t] is inserted between the nasal and the voiceless fricative.' },
      { q: '<b>chocolate</b> → /tʃɔklət/', say: 'chocolate', answer: P['Deletion'], explain: 'Syncope: the unstressed vowel after the stressed syllable is lost.' },
      { q: '<b>fifths</b> → [fɪfts]', say: 'fifths', answer: P['Dissimilation'], explain: 'Three fricatives in a row: the middle one becomes a stop, so neighbors are less alike.' },
      { q: '<b>stay up</b> → /stey yʌp/', say: 'stay up', answer: P['Linking'], explain: 'A /y/ glide connects /ey/ to the next vowel.' },
      { q: '<b>can go</b> → /kəŋ gow/', say: 'can go', answer: P['Regressive assimilation'], explain: 'The velar /g/ makes the /n/ before it velar: /ŋ/.' },
      { q: '<b>wished</b> → /wɪʃt/', say: 'wished', answer: P['Progressive assimilation'], explain: 'The voiceless /ʃ/ makes the -ed ending voiceless: /t/.' },
      { q: '<b>classes</b> → /klæsəz/', say: 'classes', answer: P['Epenthesis'], explain: 'A schwa breaks up the sibilant cluster.' },
      { q: '<b>February</b> → /fɛbyuwɛriy/', say: 'February', answer: P['Deletion'], explain: 'The disappearing /r/: the first /r/ is lost because another follows.' },
      { q: '<b>keep out</b> → kee‿p‿out', say: 'keep out', answer: P['Linking'], explain: 'The single consonant straddles both syllables.' },
      { q: '<b>impossible</b> (in- → im-)', say: 'impossible', answer: P['Regressive assimilation'], explain: 'The bilabial /p/ turns the prefix nasal into /m/.' },
      { q: "<b>I'd like to meet your brother</b> → /miytʃər/", say: "I'd like to meet your brother.", answer: P['Coalescent assimilation'], explain: '/t/ + /y/ → /tʃ/.' },
      { q: '<b>comfort</b> → /kʌmpfərt/', say: 'comfort', answer: P['Epenthesis'], explain: 'A [p] is inserted between /m/ and /f/.' },
      { q: '<b>East side</b> → /iys sayd/', say: 'East side', answer: P['Deletion'], explain: 'Final /t/ of a two-consonant cluster before a consonant.' },
      { q: '<b>Let me</b> → /lɛmiy/ (lemme)', say: 'Let me do that for you.', answer: P['Regressive assimilation'], explain: 'A change of manner: /t/ becomes /m/ before /m/.' },
      { q: "<b>it's</b> (it + is) → /ɪts/", say: "it's", answer: P['Progressive assimilation'], explain: 'The voiceless /t/ makes the following /z/ voiceless: /s/.' },
    ],
  },
  {
    id: 'verb-to',
    title: 'gonna or going to?',
    source: 'PR',
    type: 'blank',
    intro: 'Use the reduced form whenever the meaning allows it. If the meaning doesn’t allow it, use the full form.',
    items: [
      { s: 'How much money does he ___ do the job?', options: ['wanna', 'want to'], answer: 1, explain: 'He wants <em>money</em> in order to do the job — not a desire to do it.' },
      { s: "Aren't you ___ miss your appointment?", options: ['gonna', 'going to'], answer: 0, explain: 'Future intention/prediction → gonna.' },
      { s: 'We ___ leave as soon as possible.', options: ['wanna', 'want to'], answer: 0, explain: 'Desire → wanna.' },
      { s: 'He needs help. What have you ___ offer him?', options: ['gotta', 'got to'], answer: 1, explain: 'Availability (what do you have to offer?), not necessity.' },
      { s: "Saturday's our day for ___ swim.", options: ['gonna', 'going to'], answer: 1, explain: '“going” here is a gerund of motion, not future intention.' },
      { s: 'I think she ___ work harder.', options: ['hasta', 'has to'], answer: 0, explain: 'Necessity → hasta.' },
      { s: "I don't ___ eat lunch so late.", options: ['wanna', 'want to'], answer: 0, explain: 'Desire → wanna.' },
      { s: 'What does pity ___ do with it?', options: ['hafta', 'have to'], answer: 1, explain: '“have to do with” means “be related to” — not necessity.' },
      { s: 'This is what the burglars ___ break in.', options: ['usta', 'used to'], answer: 1, explain: 'Utilization: the tool they used in order to break in.' },
      { s: "They're all ___ church Sunday.", options: ['gonna', 'going to'], answer: 1, explain: 'Destination → full form.' },
      { s: 'Is that all she ___ eat, candy?', options: ['hasta', 'has to'], answer: 1, explain: 'Availability: all the food she has.' },
      { s: 'We always ___ take a vacation in August.', options: ['usta', 'used to'], answer: 0, explain: 'Former habit → usta.' },
      { s: "You've ___ be careful about that.", options: ['gotta', 'got to'], answer: 0, explain: 'Necessity → gotta.' },
      { s: 'In this case, you ___ tell the truth.', options: ['hafta', 'have to'], answer: 0, explain: 'Necessity → hafta.' },
      { s: "I'm never ___ agree to that.", options: ['gonna', 'going to'], answer: 0, explain: 'Intention → gonna.' },
    ],
  },
  {
    id: 'palatalization',
    title: 'Which palatalized sound?',
    source: 'PR',
    type: 'choice',
    intro: 'Which sound results between the highlighted words in relaxed speech?',
    options: PAL,
    items: [
      { q: "He's not <b>as young</b> as he looks.", say: "He's not as young as he looks.", answer: 1, explain: '/z/ + /y/ → /ʒ/' },
      { q: "I'm tempted to <b>kiss you</b>.", say: "I'm tempted to kiss you.", answer: 0, explain: '/s/ + /y/ → /ʃ/' },
      { q: '<b>Did you</b> sign the petition?', say: 'Did you sign the petition?', answer: 3, explain: '/d/ + /y/ → /dʒ/' },
      { q: 'Uncle Sam <b>wants you</b>.', say: 'Uncle Sam wants you.', answer: 2, explain: '/ts/ + /y/ → /tʃ/' },
      { q: "It's the law of <b>these United</b> States.", say: "It's the law of these United States.", answer: 1, explain: '/z/ + /y/ → /ʒ/ (United begins with /y/)' },
      { q: 'I understand <b>what you</b> said.', say: 'I understand what you said.', answer: 2, explain: '/t/ + /y/ → /tʃ/' },
      { q: 'Will they <b>bus your</b> children to school?', say: 'Will they bus your children to school?', answer: 0, explain: '/s/ + /y/ → /ʃ/' },
      { q: 'That was <b>last year</b>.', say: 'That was last year.', answer: 2, explain: '/st/ + /y/ → /stʃ/' },
      { q: '<b>Hide yourself</b> quickly.', say: 'Hide yourself quickly.', answer: 3, explain: '/d/ + /y/ → /dʒ/' },
      { q: 'I hope you <b>pass your</b> test.', say: 'I hope you pass your test.', answer: 0, explain: '/s/ + /y/ → /ʃ/' },
      { q: "<b>What's your</b> number?", say: "What's your number?", answer: 2, explain: '/ts/ + /y/ → /tʃ/' },
      { q: '<b>Did your</b> car break down?', say: 'Did your car break down?', answer: 3, explain: '/d/ + /y/ → /dʒ/' },
      { q: "They haven't <b>finished yet</b>.", say: "They haven't finished yet.", answer: 2, explain: '/t/ + /y/ → /tʃ/ (-ed is /t/ after /ʃ/)' },
      { q: "<b>When's your</b> birthday?", say: "When's your birthday?", answer: 1, explain: '/z/ + /y/ → /ʒ/' },
      { q: "They mustn't <b>read your</b> mail.", say: "They mustn't read your mail.", answer: 3, explain: '/d/ + /y/ → /dʒ/' },
    ],
  },
  {
    id: 'numbers',
    title: 'Twenty to ninety',
    source: 'PR',
    type: 'choice',
    intro: 'What kind of t do you hear in each -ty number?',
    options: T3,
    items: [
      { q: '<b>twenty</b>', say: 'twenty', answer: 2, explain: 'After /n/ → disappearing t: /twɛniy/.' },
      { q: '<b>thirty</b>', say: 'thirty', answer: 1, explain: 'After /r/ → flap: /θərɾiy/.' },
      { q: '<b>forty</b>', say: 'forty', answer: 1, explain: 'After /r/ → flap: /fɔrɾiy/.' },
      { q: '<b>fifty</b>', say: 'fifty', answer: 0, explain: 'After voiceless /f/ → regular [t].' },
      { q: '<b>sixty</b>', say: 'sixty', answer: 0, explain: 'After voiceless /ks/ → regular [t].' },
      { q: '<b>seventy</b>', say: 'seventy', answer: 2, explain: 'After /n/ → disappearing t: /sɛvəniy/.' },
      { q: '<b>eighty</b>', say: 'eighty', answer: 1, explain: 'After a vowel → flap: /eyɾiy/.' },
      { q: '<b>ninety</b>', say: 'ninety', answer: 2, explain: 'After /n/ → disappearing t: /nayniy/.' },
    ],
  },
  {
    id: 'td-deletion',
    title: 'Delete, keep, or relink?',
    source: 'CM',
    type: 'choice',
    intro: 'What happens to the final /t/ or /d/ of the first word?',
    options: DEL,
    items: [
      { q: '<b>East side</b>', say: 'East side', answer: 0, explain: 'Before a consonant (not h, y, w, r) → deleted.' },
      { q: '<b>East hill</b>', say: 'East hill', answer: 1, explain: 'Before /h/ → no deletion.' },
      { q: '<b>East end</b>', say: 'East end', answer: 2, explain: 'Before a vowel → Eas.tend.' },
      { q: '<b>blind man</b>', say: 'blind man', answer: 0, explain: 'Before /m/ → deleted.' },
      { q: '<b>blind youth</b>', say: 'blind youth', answer: 1, explain: 'Before /y/ → no deletion.' },
      { q: '<b>blind eye</b>', say: 'blind eye', answer: 2, explain: 'Before a vowel → blin.deye.' },
      { q: '<b>wild boar</b>', say: 'wild boar', answer: 0, explain: 'Before /b/ → deleted.' },
      { q: '<b>wild woman</b>', say: 'wild woman', answer: 1, explain: 'Before /w/ → no deletion.' },
      { q: '<b>old age</b>', say: 'old age', answer: 2, explain: 'Before a vowel → ol.dage.' },
      { q: '<b>old rags</b>', say: 'old rags', answer: 1, explain: 'Before /r/ → no deletion.' },
      { q: '<b>next day</b>', say: 'next day', answer: 0, explain: 'Before /d/ → deleted.' },
      { q: '<b>plant food</b>', say: 'plant food', answer: 1, explain: '/nt/ clusters don’t simplify.' },
      { q: '<b>felt pen</b>', say: 'felt pen', answer: 1, explain: '/lt/ clusters don’t simplify.' },
    ],
  },
  {
    id: 'weak-forms',
    title: 'Strong or weak form?',
    source: 'PR',
    type: 'choice',
    intro: 'How is the highlighted word most naturally pronounced? Remember: stressed or phrase-final function words keep their strong form.',
    items: [
      { q: 'Look <b>at</b> the time.', say: 'Look at the time.', options: ['/æt/', '/ət/'], answer: 1, explain: 'Unstressed preposition → /ət/.' },
      { q: 'What are you looking <b>at</b>?', say: 'What are you looking at?', options: ['/æt/', '/ət/'], answer: 0, explain: 'At the end of the phrase → strong form.' },
      { q: 'better <b>than</b> ever', say: 'better than ever', options: ['/ðæn/', '/ðən/'], answer: 1, explain: 'Unstressed → /ðən/.' },
      { q: 'made <b>her</b> glad', say: 'made her glad', options: ['/hər/', '/ər/'], answer: 1, explain: 'Unstressed pronoun → /h/ is dropped.' },
      { q: 'wish <b>him</b> luck', say: 'wish him luck', options: ['/hɪm/', '/ɪm/'], answer: 1, explain: 'Unstressed pronoun → /ɪm/.' },
      { q: "I didn't ask <b>him</b>, I asked <b>her</b>!", say: "I didn't ask him, I asked her!", options: ['strong forms', 'weak forms'], answer: 0, explain: 'Contrastive stress → strong forms.' },
      { q: 'came <b>from</b> there', say: 'came from there', options: ['/frʌm/', '/frəm/'], answer: 1, explain: 'Unstressed → /frəm/.' },
      { q: "Who's it <b>from</b>?", say: "Who's it from?", options: ['/frʌm/', '/frəm/'], answer: 0, explain: 'Phrase-final preposition → strong form.' },
      { q: 'We <b>must</b> leave now.', say: 'We must leave now.', options: ['/mʌst/', '/məs/'], answer: 1, explain: 'Unstressed auxiliary → /məs/.' },
      { q: 'People <b>would</b> like that.', say: 'People would like that.', options: ['/wʊd/', '/əd/'], answer: 1, explain: 'Unstressed → /əd/.' },
      { q: "That's <b>what</b> I said.", say: "That's what I said.", options: ['/wʌt/', '/wət/'], answer: 1, explain: 'Unstressed relative → /wət/.' },
      { q: 'Yes, I <b>am</b>.', say: 'Yes, I am.', options: ['/æm/', '/əm/'], answer: 0, explain: 'Short answer, phrase-final → strong form.' },
    ],
  },
  {
    id: 'caution',
    title: 'Use, recognize or avoid?',
    source: 'PR',
    type: 'choice',
    intro: 'Following Prator & Robinett’s advice, what should a learner do with each form?',
    options: USE,
    items: [
      { q: "<b>gonna</b> in “I'm gonna call you.”", answer: 0, explain: 'A well-established form, fine in most situations.' },
      { q: '<b>/mɪʃuw/</b> for “miss you”', answer: 0, explain: 'Palatalization across words is natural — not careless.' },
      { q: '<b>/ɛvriy/</b> for “every”', answer: 0, explain: 'Post-tonic syncope: used by the most literate speakers.' },
      { q: '<b>/dʒiytʃɛt/</b> for “Did you eat yet?”', answer: 1, explain: 'An accumulation of reductions: understand it, don’t cultivate it.' },
      { q: "<b>/wayowntʃə sey ɪt/</b> for “Why don't you say it?”", answer: 1, explain: 'Too many reductions in a row lessen intelligibility.' },
      { q: '<b>/bluwn/</b> for “balloon”', answer: 2, explain: 'Pretonic syncope creates clusters without making anything easier.' },
      { q: '<b>singin’</b> for “singing”', answer: 2, explain: 'Now widely disapproved; use /ɪŋ/.' },
      { q: '<b>ain’t</b>', answer: 2, explain: 'Widely regarded as bad grammar.' },
      { q: '<b>’twill be</b>', answer: 2, explain: 'Old-fashioned; only for poetry or humor.' },
      { q: '<b>/twɛniy/</b> for “twenty”', answer: 1, explain: 'The disappearing t: you must recognize it; using it is optional and informal.' },
      { q: '<b>wanna</b> in “I wanna go home.”', answer: 0, explain: 'A well-established reduction for desire.' },
    ],
  },
  {
    id: 'syncope',
    title: 'Find the shortened words',
    source: 'PR',
    type: 'pick',
    intro: 'At least 11 words in this passage are almost always pronounced with one syllable less than their spelling suggests (like Niagara → /nayægrə/). Click them.',
    passage:
      'David is majoring in English literature. Almost every evening he watches a play on television. Fortunately, he has his own separate television set. In an average week he sees plays by several different authors. He is naturally most interested in the opening performance of new plays. As you would expect, he generally gets to bed quite late.',
    answers: ['literature', 'every', 'evening', 'fortunately', 'separate', 'average', 'several', 'different', 'naturally', 'interested', 'generally'],
    explain:
      'Pattern: <b>stressed syllable + two or more unstressed syllables</b> → the first vowel after the stress is lost: lit(e)rature, ev(e)ry, ev(e)ning, fortun(a)tely, sep(a)rate, av(e)rage, sev(e)ral, diff(e)rent, nat(u)rally, int(e)rested, gen(e)rally.',
  },
  {
    id: 'dictation',
    title: 'Dictation: real-speed English',
    source: 'CM',
    type: 'dictation',
    intro: 'Listen and type the sentence in standard spelling. Use “Slow” if you need to. Reduced spellings like gonna are accepted too.',
    items: [
      { say: 'Did you eat yet?', answer: 'Did you eat yet?' },
      { say: 'What do you wanna do tonight?', answer: 'What do you want to do tonight?' },
      { say: "I'm gonna ask her about it.", answer: "I'm going to ask her about it." },
      { say: 'Could you give me a hand with this?', answer: 'Could you give me a hand with this?' },
      { say: 'We have to leave at eight.', answer: 'We have to leave at eight.' },
      { say: 'Where did you put your keys?', answer: 'Where did you put your keys?' },
      { say: 'Let me think about it for a minute.', answer: 'Let me think about it for a minute.' },
      { say: "It's kinda hard to explain.", answer: "It's kind of hard to explain." },
      { say: 'Will you ask her what she wants to do this evening?', answer: 'Will you ask her what she wants to do this evening?' },
      { say: "Tell 'em we can eat when we get to the stadium.", answer: 'Tell them we can eat when we get to the stadium.' },
      { say: "You've gotta be careful about that.", answer: "You've got to be careful about that." },
      { say: 'I thought he did it last year.', answer: 'I thought he did it last year.' },
    ],
  },
];

// What TTS should say for an item (after answering, or as the prompt).
export function itemSay(set, item) {
  if (set.type === 'blank') {
    const form = item.options[item.answer];
    return item.s.replace('___', SPOKEN[form] || form);
  }
  return item.say || null;
}

export function itemOptions(set, item) {
  return item.options || set.options;
}

export function setById(id) {
  return exerciseSets.find((s) => s.id === id);
}

// ─── Dictation checking ─────────────────────────────────────────────────────

const REDUCED = {
  gonna: 'going to',
  wanna: 'want to',
  gotta: 'got to',
  hafta: 'have to',
  hasta: 'has to',
  usta: 'used to',
  oughta: 'ought to',
  kinda: 'kind of',
  sorta: 'sort of',
  lotta: 'lot of',
  outta: 'out of',
  gimme: 'give me',
  lemme: 'let me',
  "'em": 'them',
  em: 'them',
  ya: 'you',
  cuz: 'because',
  "'cause": 'because',
};

const CONTRACTIONS = {
  "i'm": 'i am',
  "you're": 'you are',
  "we're": 'we are',
  "they're": 'they are',
  "it's": 'it is',
  "that's": 'that is',
  "what's": 'what is',
  "where's": 'where is',
  "there's": 'there is',
  "he's": 'he is',
  "she's": 'she is',
  "let's": 'let us',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "can't": 'can not',
  cannot: 'can not',
  "won't": 'will not',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "haven't": 'have not',
  "i've": 'i have',
  "you've": 'you have',
  "we've": 'we have',
  "they've": 'they have',
  "i'll": 'i will',
  "you'll": 'you will',
  "we'll": 'we will',
  "they'll": 'they will',
};

export function normalizeWords(s) {
  const toks = s
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^'+(?!em$|cause$)|'+$/g, ''))
    .filter(Boolean);
  const out = [];
  for (const w of toks) {
    const r = REDUCED[w] || CONTRACTIONS[w] || w;
    out.push(...r.split(' '));
  }
  return out;
}

// Word-level diff (LCS) between what was expected and what was typed.
export function diffWords(expected, typed) {
  const a = normalizeWords(expected);
  const b = normalizeWords(typed);
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ op: 'ok', w: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ op: 'missing', w: a[i++] });
    } else {
      ops.push({ op: 'extra', w: b[j++] });
    }
  }
  while (i < a.length) ops.push({ op: 'missing', w: a[i++] });
  while (j < b.length) ops.push({ op: 'extra', w: b[j++] });
  const correct = ops.every((o) => o.op === 'ok');
  const score = a.length ? dp[0][0] / Math.max(a.length, b.length) : 1;
  return { ops, correct, score };
}
