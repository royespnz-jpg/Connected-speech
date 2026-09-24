// A spelling-based connected-speech annotator. It approximates each word's
// first and last sounds from its spelling and applies the rules from the
// readings at each word boundary. It is a study aid, not a phonetic parser:
// it can miss things and over-mark things, and the UI says so.

// ─── lexical helpers ────────────────────────────────────────────────────────

const VOWEL = /[aeiou]/;

// Vowel-final words and the glide they insert before a vowel (null = none).
const VOWEL_FINAL = {
  the: 'y', a: null, to: 'w', do: 'w', who: 'w', you: 'w', two: 'w', too: 'w', through: 'w', into: 'w',
  so: 'w', go: 'w', no: 'w', although: 'w', though: 'w',
  i: 'y', my: 'y', by: 'y', why: 'y', buy: 'y', be: 'y', he: 'y', she: 'y', we: 'y', me: 'y',
  see: 'y', free: 'y', three: 'y', they: 'y', hey: 'y',
  how: 'w', now: 'w', allow: 'w',
  spa: null, idea: null, saw: null, law: null, draw: null, raw: null, ma: null, pa: null,
};

// Silent-e words that still end in a vowel sound.
const E_VOWEL = new Set(['the', 'be', 'he', 'she', 'we', 'me']);

// Words that begin with a /y/ sound despite the spelling (or because of it).
const Y_INITIAL = new Set([
  'you', 'your', "you're", 'yours', 'yourself', 'yourselves', "you've", "you'll", "you'd",
  'yet', 'year', 'years', 'yesterday', 'yes', 'young', 'yellow',
  'use', 'used', 'useful', 'usual', 'usually', 'unit', 'united', 'union', 'unique', 'universe', 'university', 'uniform', 'europe', 'european',
]);
const W_INITIAL = new Set(['one', 'once']);
const SILENT_H = new Set(['hour', 'hours', 'honest', 'honestly', 'honor', 'heir']);
const H_DROP = new Set(['he', 'him', 'his', 'her', 'them']);
const HARD_G = new Set(['get', 'gets', 'getting', 'give', 'gives', 'given', 'giving', 'girl', 'girls', 'gift', 'gifts', 'gear', 'geese', 'giggle', 'gimme']);

// Final consonant sounds for common irregular spellings and contractions.
const CODA = {
  "i'm": ['m'], "you're": ['r'], "we're": ['r'], "they're": ['r'], "i've": ['v'], "you've": ['v'], "we've": ['v'], "they've": ['v'],
  "i'll": ['l'], "you'll": ['l'], "we'll": ['l'], "they'll": ['l'], "he'll": ['l'], "she'll": ['l'], "it'll": ['l'], "that'll": ['l'],
  "i'd": ['d'], "you'd": ['d'], "we'd": ['d'], "they'd": ['d'], "he'd": ['d'], "she'd": ['d'],
  "he's": ['z'], "she's": ['z'], "it's": ['t', 's'], "what's": ['t', 's'], "that's": ['t', 's'], "let's": ['t', 's'],
  "where's": ['r', 'z'], "there's": ['r', 'z'], "here's": ['r', 'z'], "when's": ['n', 'z'], "who's": ['z'], "how's": ['z'],
  "don't": ['n', 't'], "can't": ['n', 't'], "won't": ['n', 't'], "didn't": ['n', 't'], "isn't": ['n', 't'], "wasn't": ['n', 't'],
  "doesn't": ['n', 't'], "couldn't": ['n', 't'], "wouldn't": ['n', 't'], "shouldn't": ['n', 't'], "haven't": ['n', 't'], "aren't": ['n', 't'],
  is: ['z'], was: ['z'], has: ['z'], his: ['z'], as: ['z'], does: ['z'], these: ['z'], those: ['z'], please: ['z'], because: ['z'],
  this: ['s'], yes: ['s'], us: ['s'], bus: ['s'], gas: ['s'], plus: ['s'], thus: ['s'],
  of: ['v'], have: ['v'], give: ['v'], live: ['v'], love: ['v'], move: ['v'],
  house: ['s'], mouse: ['s'], case: ['s'], base: ['s'], loose: ['s'], promise: ['s'], purpose: ['s'], increase: ['s'],
  laugh: ['f'], enough: ['f'], tough: ['f'], rough: ['f'], cough: ['f'],
  used: ['z', 'd'],
};

const STOPS = new Set(['p', 'b', 't', 'd', 'k', 'g']);
const STOPS_AFFRICATES = new Set([...STOPS, 'tʃ', 'dʒ']);
const VOICELESS = new Set(['p', 't', 'k', 'f', 'θ', 's', 'ʃ', 'tʃ']);
const SIBILANT = new Set(['s', 'z', 'ʃ', 'ʒ', 'tʃ', 'dʒ']);

// Letter groups → sounds, longest first.
const GROUPS = [
  ['tch', ['tʃ']], ['dge', ['dʒ']], ['dg', ['dʒ']], ['ght', ['t']], ['ck', ['k']], ['sh', ['ʃ']], ['ch', ['tʃ']], ['th', ['θ']],
  ['ph', ['f']], ['ng', ['ŋ']], ['nk', ['ŋ', 'k']], ['mb', ['m']], ['gn', ['n']], ['mn', ['m']], ['lk', ['k']], ['lm', ['m']],
  ['x', ['k', 's']], ['c', ['k']], ['q', ['k']], ['j', ['dʒ']],
];
const DOUBLE = /(bb|dd|ff|gg|ll|mm|nn|pp|rr|ss|tt|zz)$/;

function lettersToSounds(cons) {
  // cons: the trailing consonant letters of a word, e.g. "nd", "ght", "ck".
  const out = [];
  let s = cons.replace(DOUBLE, (m) => m[0]);
  while (s.length) {
    const g = GROUPS.find(([k]) => s.endsWith(k));
    if (g) {
      out.unshift(...g[1]);
      s = s.slice(0, -g[0].length);
    } else {
      const ch = s.slice(-1);
      if (ch !== 'h' && ch !== 'w' && ch !== 'y') out.unshift(ch);
      s = s.slice(0, -1);
    }
  }
  return out;
}

function voicedEnding(coda) {
  return coda.length && !VOICELESS.has(coda[coda.length - 1]);
}

// Describe how a word ends: { vowel: true, glide } or { vowel: false, coda: [...] }.
export function wordEnd(raw) {
  const w = raw.toLowerCase().replace(/’/g, "'");
  if (w in CODA) return { vowel: false, coda: CODA[w] };
  if (w in VOWEL_FINAL) return { vowel: true, glide: VOWEL_FINAL[w] };

  // possessive / contracted 's
  if (w.endsWith("'s")) {
    const base = wordEnd(w.slice(0, -2));
    if (base.vowel) return { vowel: false, coda: ['z'] };
    const last = base.coda[base.coda.length - 1];
    if (SIBILANT.has(last)) return { vowel: false, coda: ['z'] };
    return { vowel: false, coda: [...base.coda, voicedEnding(base.coda) ? 'z' : 's'] };
  }

  // -ed past tense
  if (w.length >= 5 && w.endsWith('ed') && !w.endsWith('eed')) {
    let stem = w.slice(0, -2);
    const prev = stem.slice(-1);
    if (prev === 't' || prev === 'd') return { vowel: false, coda: ['d'] };
    if (prev === 'i') stem = stem.slice(0, -1) + 'y'; // tried → try
    else if (/[^c]c$|dg$/.test(stem)) stem += 'e'; // raced, judged
    const base = wordEnd(stem);
    if (base.vowel) return { vowel: false, coda: ['d'] };
    return { vowel: false, coda: [...base.coda, voicedEnding(base.coda) ? 'd' : 't'] };
  }

  // plural / 3rd person -s
  if (w.length > 3 && w.endsWith('s') && !/(ss|us|is)$/.test(w)) {
    if (/(ses|xes|zes|shes|ches|ges|ces)$/.test(w)) return { vowel: false, coda: ['z'] };
    const stem = w.endsWith('ies') ? w.slice(0, -3) + 'y' : w.slice(0, -1);
    const base = wordEnd(stem);
    if (base.vowel) return { vowel: false, coda: ['z'] };
    return { vowel: false, coda: [...base.coda, voicedEnding(base.coda) ? 'z' : 's'] };
  }

  // vowel-final spellings
  if (/(igh|y|ey|ay|oy|ie|ye|ee)$/.test(w) && !/[aeiou]ye$/.test(w)) return { vowel: true, glide: 'y' };
  if (/(ow|ew|oo|ue|ough|o|u)$/.test(w)) return { vowel: true, glide: 'w' };
  if (/i$/.test(w)) return { vowel: true, glide: 'y' };
  if (/(a|aw)$/.test(w)) return { vowel: true, glide: null };
  if (w.endsWith('e') && E_VOWEL.has(w)) return { vowel: true, glide: 'y' };

  // silent e
  let stem = w;
  let magic = '';
  if (w.length > 2 && w.endsWith('e') && !VOWEL.test(w[w.length - 2])) {
    stem = w.slice(0, -1);
    magic = stem.slice(-1);
  }
  const m = stem.match(/[^aeiouy]+$/);
  if (!m) return { vowel: true, glide: null };
  let coda = lettersToSounds(m[0]);
  if (magic === 'c') coda = [...coda.slice(0, -1), 's'];
  else if (magic === 'g') coda = [...coda.slice(0, -1), 'dʒ'];
  else if (magic === 's') coda = [...coda.slice(0, -1), /[aeiou]s$/.test(stem) ? 'z' : 's'];
  else if (magic === 'h' && stem.endsWith('th')) coda = [...coda.slice(0, -1), 'ð'];
  return { vowel: false, coda };
}

// How a word begins: { vowel: true } or { vowel: false, onset: 'k' }.
export function wordStart(raw) {
  const w = raw.toLowerCase().replace(/’/g, "'");
  if (Y_INITIAL.has(w)) return { vowel: false, onset: 'y' };
  if (W_INITIAL.has(w)) return { vowel: false, onset: 'w' };
  if (SILENT_H.has(w)) return { vowel: true };
  if (VOWEL.test(w[0])) return { vowel: true };
  const two = w.slice(0, 2);
  const map2 = { ch: 'tʃ', sh: 'ʃ', th: 'ð', ph: 'f', wh: 'w', kn: 'n', wr: 'r', gn: 'n', ps: 's', qu: 'k' };
  if (map2[two]) return { vowel: false, onset: map2[two] };
  const c = w[0];
  if (c === 'c') return { vowel: false, onset: /[eiy]/.test(w[1] || '') ? 's' : 'k' };
  if (c === 'g') return { vowel: false, onset: /[eiy]/.test(w[1] || '') && !HARD_G.has(w) ? 'dʒ' : 'g' };
  if (c === 'j') return { vowel: false, onset: 'dʒ' };
  if (c === 'x') return { vowel: false, onset: 'z' };
  return { vowel: false, onset: c };
}

// ─── in-word patterns ───────────────────────────────────────────────────────

const SYNCOPE = {
  chocolate: 'choc(o)late', every: 'ev(e)ry', everything: 'ev(e)rything', everyone: 'ev(e)ryone', everybody: 'ev(e)rybody',
  evening: 'ev(e)ning', camera: 'cam(e)ra', mystery: 'myst(e)ry', history: 'hist(o)ry', vegetable: 'veg(e)table',
  vegetables: 'veg(e)tables', comparable: 'comp(a)rable', laboratory: 'lab(o)ratory', interesting: 'int(e)resting',
  interested: 'int(e)rested', miserable: 'mis(e)rable', generally: 'gen(e)rally', general: 'gen(e)ral', aspirin: 'asp(i)rin',
  different: 'diff(e)rent', difference: 'diff(e)rence', favorite: 'fav(o)rite', restaurant: 'rest(au)rant',
  beverage: 'bev(e)rage', family: 'fam(i)ly', reasonable: 'reas(o)nable', emerald: 'em(e)rald', several: 'sev(e)ral',
  average: 'av(e)rage', separate: 'sep(a)rate', naturally: 'nat(u)rally', natural: 'nat(u)ral', literature: 'lit(e)rature',
  fortunately: 'fortun(a)tely', comfortable: 'comf(or)table', business: 'bus(i)ness', temperature: 'temp(e)rature',
  february: 'Feb(r)uary', governor: 'gove(r)nor', surprise: 'su(r)prise', probably: 'prob(a)bly', memory: 'mem(o)ry',
  factory: 'fact(o)ry', delivery: 'deliv(e)ry', discovery: 'discov(e)ry', opera: 'op(e)ra', wednesday: 'We(d)nesday',
};

const FLAP_EXCEPTIONS =
  /^(attack|attend|attempt|attent|attract|atomic|hotel|motel|return|retain|retire|retreat|eternal|italian|detect|detain|deter|potato|tomato|guitar|pretend|protect|potential|materi|photographer)/;
const NT_EXCEPTIONS =
  /^(until|untie|into|entire|intend|intens|intent|contain|continu|maintain|entitle|antique|entail|content|contend|contest|contrib|control|contract|contrast|centennial|pontoon|interpret|mountain|fountain)/;

// Map a mark like "lit(e)rature" or "wa*t*er" onto per-letter flags.
function markFlags(mark) {
  const flags = [];
  let mode = null;
  for (const ch of mark) {
    if (ch === '(') mode = 'del';
    else if (ch === ')') mode = null;
    else if (ch === '*') mode = mode === 'hl' ? null : 'hl';
    else flags.push(mode);
  }
  return flags;
}

function inWordFindings(word) {
  const w = word.toLowerCase().replace(/’/g, "'");
  const found = [];
  if (SYNCOPE[w]) {
    found.push({ type: 'syncope', mark: SYNCOPE[w] });
  } else if (!NT_EXCEPTIONS.test(w) && /[aeiou]nt(?=[aeiouy])/.test(w)) {
    found.push({ type: 'disappearing-t', mark: w.replace(/([aeiou]n)t(?=[aeiouy])/, '$1(t)') });
  }
  if (!FLAP_EXCEPTIONS.test(w)) {
    const m = w.match(/(?:[aeiour]|gh)(t{1,2})(?=e(?!$)|[aioy]|l(?:e|es|ed|ing|y)?$)(?!i(?:on|al|ous|ent|ence|a))/);
    if (m) {
      const at = m.index + m[0].length - m[1].length;
      found.push({ type: 'flap', mark: `${w.slice(0, at)}*${m[1]}*${w.slice(at + m[1].length)}` });
    }
  }
  return found.map((f) => ({ ...f, flags: markFlags(f.mark) }));
}

// ─── function words ─────────────────────────────────────────────────────────

const WEAK = {
  a: '/ə/', an: '/ən/', and: '/ən/, /n̩/', the: '/ðə/', of: '/əv/, /ə/', to: '/tə/', for: '/fər/', from: '/frəm/',
  at: '/ət/', as: '/əz/', than: '/ðən/', or: '/ər/', but: '/bət/', can: '/kən/', could: '/kəd/', would: '/wəd/, /əd/',
  should: '/ʃəd/', will: '/əl/, /l/', must: '/məs/', do: '/də/', does: '/dəz/', have: '/həv/, /əv/', has: '/həz/, /əz/',
  had: '/həd/, /əd/', am: '/əm/', are: '/ər/', was: '/wəz/', were: '/wər/', been: '/bɪn/', you: '/yə/', your: '/yər/',
  he: '/iy/, /ɪ/', him: '/ɪm/', his: '/ɪz/', her: '/ər/', them: '/ðəm/, /əm/', us: '/əs/', some: '/səm/', just: '/dʒəst/',
};

// Prepositions and auxiliaries keep their strong form at the end of a phrase
// ("What are you looking at?"); object pronouns stay weak ("I saw them").
const STRONG_WHEN_FINAL = new Set([
  'to', 'for', 'from', 'at', 'of', 'as', 'than', 'can', 'could', 'would', 'should', 'will', 'must', 'do', 'does',
  'have', 'has', 'had', 'am', 'are', 'was', 'were', 'been', 'some', 'but', 'and', 'or',
]);

// ─── multi-word reductions ──────────────────────────────────────────────────

const NOT_VERB = new Set([
  'the', 'a', 'an', 'my', 'your', 'his', 'her', 'our', 'their', 'its', 'this', 'that', 'these', 'those', 'school', 'church',
  'work', 'bed', 'class', 'town', 'market', 'store', 'beach', 'park', 'college', 'london', 'paris', 'new', 'me', 'him', 'them', 'us',
]);

const REDUCTIONS = [
  { words: ['going', 'to'], form: 'gonna', ipa: '/gənə/', check: (next) => next && !NOT_VERB.has(next), note: 'only for future intention — not for destination (going to church)' },
  { words: ['want', 'to'], form: 'wanna', ipa: '/wɑnə/', note: 'desire' },
  { words: ['got', 'to'], form: 'gotta', ipa: '/gɑɾə/', check: (next) => next && !NOT_VERB.has(next), note: 'only when it means necessity' },
  { words: ['have', 'to'], form: 'hafta', ipa: '/hæftə/', check: (next) => next && !NOT_VERB.has(next), note: 'only when it means necessity' },
  { words: ['has', 'to'], form: 'hasta', ipa: '/hæstə/', check: (next) => next && !NOT_VERB.has(next), note: 'only when it means necessity' },
  { words: ['used', 'to'], form: 'usta', ipa: '/yuwstə/', check: (next) => next && !NOT_VERB.has(next), note: 'only for a former habit' },
  { words: ['ought', 'to'], form: 'oughta', ipa: '/ɔɾə/', note: 'moral obligation' },
  { words: ['give', 'me'], form: 'gimme', ipa: '/gɪmiy/', note: 'informal' },
  { words: ['let', 'me'], form: 'lemme', ipa: '/lɛmiy/', note: 'informal' },
  { words: ['kind', 'of'], form: 'kinda', ipa: '/kaynə/', note: '' },
  { words: ['sort', 'of'], form: 'sorta', ipa: '/sɔrɾə/', note: '' },
  { words: ['lot', 'of'], form: 'lotta', ipa: '/lɑɾə/', note: '' },
  { words: ['out', 'of'], form: 'outta', ipa: '/awɾə/', note: '' },
];

// ─── the annotator ──────────────────────────────────────────────────────────

export const TYPES = {
  'link-cv': { label: 'Consonant → vowel linking', short: '‿', cls: 'link', topic: 'linking' },
  resyllabification: { label: 'Resyllabification (cluster + vowel)', short: '‿', cls: 'link', topic: 'linking' },
  glide: { label: 'Vowel → vowel: glide', short: '', cls: 'glide', topic: 'linking' },
  'vv-smooth': { label: 'Vowel → vowel: no glide (/ɑ/, /ɔ/, /ə/)', short: '‿', cls: 'link', topic: 'linking' },
  gemination: { label: 'Identical consonants: one long sound', short: 'ː', cls: 'gem', topic: 'linking' },
  unreleased: { label: 'Unreleased stop before a stop/affricate', short: '̚', cls: 'gem', topic: 'linking' },
  flap: { label: 'Flap t (d-like)', short: 'ɾ', cls: 'flap', topic: 't-sounds' },
  palatalization: { label: 'Palatalization (coalescent assimilation)', short: '', cls: 'pal', topic: 'palatalization' },
  'nasal-assimilation': { label: 'Regressive assimilation: /n/ changes place', short: '', cls: 'asm', topic: 'assimilation' },
  'place-assimilation': { label: 'Regressive assimilation: /t d/ change place', short: '', cls: 'asm', topic: 'assimilation' },
  'sibilant-assimilation': { label: 'Regressive assimilation: sibilant + /ʃ/', short: 'ʃ', cls: 'asm', topic: 'assimilation' },
  'td-deletion': { label: 'Deletion of final /t d/ in a cluster', short: '∅', cls: 'del', topic: 'deletion' },
  'h-drop': { label: 'Unstressed pronoun loses /h/ or /ð/', short: '', cls: 'del', topic: 'deletion' },
  syncope: { label: 'Syncope: lost unstressed vowel', short: '', cls: 'del', topic: 'deletion' },
  'disappearing-t': { label: 'Disappearing t (after /n/)', short: '', cls: 'del', topic: 't-sounds' },
  reduction: { label: 'Phrase reduction', short: '', cls: 'red', topic: 'verb-to' },
  'weak-form': { label: 'Weak form of a function word', short: '', cls: 'weak', topic: 'weak-forms' },
};

const WORD_RE = /[A-Za-z]+(?:['’][A-Za-z]+)*/g;

export function tokenize(text) {
  const tokens = [];
  let last = 0;
  for (const m of text.matchAll(WORD_RE)) {
    if (m.index > last) tokens.push({ kind: 'sep', text: text.slice(last, m.index) });
    tokens.push({ kind: 'word', text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ kind: 'sep', text: text.slice(last) });
  return tokens;
}

export function analyze(text) {
  const tokens = tokenize(text);
  const wordIdx = tokens.map((t, i) => (t.kind === 'word' ? i : -1)).filter((i) => i >= 0);
  const words = wordIdx.map((i) => tokens[i].text);
  const lower = words.map((w) => w.toLowerCase().replace(/’/g, "'"));
  const findings = [];
  const junctions = []; // junctions[k] = findings between word k and k+1

  // Is there a thought-group break (punctuation) between word k and k+1?
  const broken = (k) => {
    const between = tokens.slice(wordIdx[k] + 1, wordIdx[k + 1]).map((t) => t.text).join('');
    return /[.,;:!?()—–"]/.test(between) || /\n/.test(between);
  };
  const phraseFinal = (k) => k === words.length - 1 || broken(k);

  // multi-word reductions first
  const inReduction = new Set();
  for (let k = 0; k < words.length - 1; k++) {
    if (broken(k)) continue;
    for (const r of REDUCTIONS) {
      if (lower[k] === r.words[0] && lower[k + 1] === r.words[1]) {
        const next = lower[k + 2];
        if (r.check && !r.check(next)) continue;
        findings.push({ type: 'reduction', at: k, span: 2, text: `${words[k]} ${words[k + 1]}`, result: r.form, ipa: r.ipa, note: r.note });
        inReduction.add(k).add(k + 1);
      }
    }
  }

  for (let k = 0; k < words.length - 1; k++) {
    const j = [];
    junctions[k] = j;
    if (broken(k) || (inReduction.has(k) && inReduction.has(k + 1))) continue;

    const a = words[k];
    const b = words[k + 1];
    const end = wordEnd(a);
    let start = wordStart(b);
    const pair = `${a} ${b}`;
    let bSaid = b;

    if (H_DROP.has(lower[k + 1]) && !end.vowel) {
      bSaid = lower[k + 1] === 'them' ? 'em' : b.slice(1);
      j.push({ type: 'h-drop', text: pair, result: `${a} '${bSaid}` });
      start = { vowel: true };
    }

    if (start.vowel) {
      if (end.vowel) {
        if (end.glide) j.push({ type: 'glide', text: pair, result: `[${end.glide}]` });
        else j.push({ type: 'vv-smooth', text: pair });
      } else {
        const coda = end.coda;
        const last = coda[coda.length - 1];
        if (last === 't' && (coda.length === 1 || coda[coda.length - 2] === 'r')) {
          j.push({ type: 'flap', text: pair, result: '[ɾ]' });
        } else if (coda.length >= 2) {
          const bare = a.replace(/['’]/g, '');
          const head = /ed$/.test(bare) ? bare.slice(0, -2) : bare.slice(0, -1);
          j.push({ type: 'resyllabification', text: pair, result: `${head}.${bare.slice(-1)}${bSaid}`.toLowerCase() });
        } else {
          j.push({ type: 'link-cv', text: pair });
        }
      }
      continue;
    }

    if (end.vowel) continue;
    const coda = end.coda;
    const last = coda[coda.length - 1];
    const prev = coda[coda.length - 2];
    const on = start.onset;

    if (on === 'y' && ['s', 'z', 't', 'd'].includes(last)) {
      let sound = last;
      if (last === 's' && prev === 't') sound = 't';
      if (last === 'z' && prev === 'd') sound = 'd';
      const result = { s: '/ʃ/', z: '/ʒ/', t: '/tʃ/', d: '/dʒ/' }[sound];
      j.push({ type: 'palatalization', text: pair, result });
      continue;
    }
    if (last === on || (last === 'θ' && on === 'ð')) {
      j.push({ type: 'gemination', text: pair, result: `[${on}ː]` });
      continue;
    }
    const keepsCluster = (prev === 'n' && last === 't') || (prev === 'l' && last === 't') || (prev === 'r' && (last === 't' || last === 'd'));
    if ((last === 't' || last === 'd') && coda.length >= 2 && !keepsCluster && !['h', 'y', 'w', 'r'].includes(on)) {
      j.push({ type: 'td-deletion', text: pair, result: `${a.slice(0, -1)}(${a.slice(-1)}) ${b}` });
      continue;
    }
    if (last === 'n' && ['p', 'b', 'm'].includes(on)) {
      j.push({ type: 'nasal-assimilation', text: pair, result: '/n/ → [m]' });
      continue;
    }
    if (last === 'n' && ['k', 'g'].includes(on)) {
      j.push({ type: 'nasal-assimilation', text: pair, result: '/n/ → [ŋ]' });
      continue;
    }
    if ((last === 't' || last === 'd') && ['p', 'b', 'm', 'k', 'g'].includes(on)) {
      const labial = ['p', 'b', 'm'].includes(on);
      const to = last === 't' ? (labial ? 'p' : 'k') : labial ? 'b' : 'g';
      j.push({ type: 'place-assimilation', text: pair, result: `/${last}/ → [${to}]` });
      continue;
    }
    if (['s', 'z'].includes(last) && on === 'ʃ') {
      j.push({ type: 'sibilant-assimilation', text: pair, result: '[ʃʃ]' });
      continue;
    }
    if (STOPS.has(last) && STOPS_AFFRICATES.has(on)) {
      j.push({ type: 'unreleased', text: pair, result: `[${last}̚]` });
    }
  }

  for (const [k, j] of junctions.entries()) for (const f of j || []) findings.push({ ...f, at: k, span: 2 });

  // in-word patterns and weak forms
  const wordMarks = words.map(() => []);
  words.forEach((w, k) => {
    for (const f of inWordFindings(w)) {
      wordMarks[k].push(f);
      findings.push({ ...f, at: k, span: 1, text: w });
    }
    const weak = WEAK[lower[k]];
    if (weak && !inReduction.has(k)) {
      const strong = phraseFinal(k) && STRONG_WHEN_FINAL.has(lower[k]);
      const mark = { type: 'weak-form', text: w, result: strong ? 'strong form (phrase-final)' : weak, strong };
      wordMarks[k].push(mark);
      findings.push({ ...mark, at: k, span: 1 });
    }
  });

  return { tokens, wordIdx, words, junctions, wordMarks, findings };
}
