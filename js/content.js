// Course content, paraphrased from the two readings:
//   CM = Celce-Murcia et al., Teaching Pronunciation, Ch. 5 "Connected Speech, Stress, and Rhythm"
//   PR = Prator & Robinett, Manual of American English Pronunciation, Lesson 16 "The Sandhi of Spoken English"
//
// Examples use the markup in markup.js. `say` overrides the text sent to TTS.
// Transcriptions follow the books' notation: /y/ = IPA /j/, /iy/ = /iː/, /uw/ = /uː/,
// /ey ow ay aw ɔy/ = diphthongs, [ɾ] = flap ("d-like t").

export const SOURCES = {
  CM: {
    short: 'Celce-Murcia et al. · Ch. 5',
    long: 'Celce-Murcia et al., Teaching Pronunciation — Ch. 5 “Connected Speech, Stress, and Rhythm”',
  },
  PR: {
    short: 'Prator & Robinett · L16',
    long: 'Prator & Robinett, Manual of American English Pronunciation — Lesson 16 “The Sandhi of Spoken English”',
  },
};

const ex = (m, ipa, note, extra = {}) => ({ m, ipa, note, ...extra });

export const topics = [
  // ────────────────────────────────────────────────────────────── contractions
  {
    id: 'contractions',
    title: 'Contractions, blends & reductions',
    short: 'Word boundaries blur — sometimes in writing, often only in speech.',
    sources: ['CM'],
    sections: [
      {
        h: 'Contractions vs. blends',
        p: `<p><strong>Contractions</strong> have a conventional written form (<em>isn't, I'm, they'll</em>).
            <strong>Blends</strong> are spoken combinations, usually with an auxiliary verb, that have no standard spelling.
            Every written contraction is a blend, but most blends are never written as contractions.</p>`,
        table: {
          head: ['Combined with an auxiliary', 'Examples'],
          rows: [
            ['Wh-words', "why's · who'll · when'd"],
            ['Proper names', "Al's · Jane'll · Dr. White'd"],
            ['Common nouns', "my name's · the play'll · a guy'd"],
            ['Demonstratives', "this's · that'll · these'd"],
            ['Existential there', "there'll · there'd"],
          ],
        },
        examples: [
          ex("Who'll be there?", '/huwl biy ðɛr/', 'who will'),
          ex("When'd you get here?", '/wɛnd yə gɛt hɪr/', 'when did'),
          ex("Jane'll call you later.", '/dʒeynl̩ kɔl yə leyɾər/', 'Jane will'),
          ex("My name's Ann.", '/may neymz æn/', 'name is'),
          ex("The play'll start soon.", '/ðə pleyl start suwn/', 'play will'),
          ex("That'll do.", '/ðæɾl̩ duw/', 'that will'),
          ex("There'd be no problem.", '/ðɛrd biy now prɑbləm/', 'there would'),
        ],
      },
      {
        h: 'Phrase reductions',
        p: `<p>Other frequent phrases lose their word boundaries completely. They are essential for
            <em>listening</em>, and most are also normal in relaxed speech. See
            <a href="#/topic/verb-to">Verb + to reductions</a> for when they are (and are not) possible.</p>`,
        examples: [
          ex("I'm *gonna* call you.", '/aym gənə kɔl yə/', 'going to'),
          ex('I *wanna* go home.', '/ay wɑnə gow howm/', 'want to'),
          ex('We *hafta* leave.', '/wiy hæftə liyv/', 'have to', { say: 'We have to leave.' }),
          ex("It's *kinda* cold.", '/ɪts kaynə kowld/', 'kind of'),
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── linking
  {
    id: 'linking',
    title: 'Linking',
    short: 'Connecting the last sound of one word to the first sound of the next.',
    sources: ['CM'],
    intro: `<p>Learners who say every word separately sound “choppy”. <strong>Linking</strong> (liaison) joins the final
            sound of a word or syllable to the first sound of the next. How much people link depends on formality, speed and
            the individual speaker, but linking happens regularly in <strong>five environments</strong>.</p>`,
    sections: [
      {
        h: '1 · Vowel + vowel: /y/ and /w/ glides',
        rule: `After <b>/iy/ /ey/ /ay/ /ɔy/</b> a <b>/y/</b> glide is inserted; after <b>/uw/ /ow/ /aw/</b> a <b>/w/</b> glide
               is inserted — inside words and between words.`,
        table: {
          head: ['Tense vowel / diphthong', 'Glide', 'Examples'],
          rows: [
            ['/iy/ + V', '[y]', 'be able · create'],
            ['/ey/ + V', '[y]', 'say it · layette'],
            ['/ay/ + V', '[y]', 'my own · naive'],
            ['/ɔy/ + V', '[y]', 'toy airplane · boyish'],
            ['/uw/ + V', '[w]', 'blue ink · Stuart'],
            ['/ow/ + V', '[w]', 'no art · Noel'],
            ['/aw/ + V', '[w]', 'how is it · flour'],
          ],
        },
        examples: [
          ex('be_[y]able', '/biy yeybəl/'),
          ex('stay_[y]up', '/stey yʌp/'),
          ex('try_[y]out', '/tray yawt/'),
          ex('Roy_[y]Adams', '/rɔy yædəmz/'),
          ex('be[y]ing', '/biyyɪŋ/', 'inside a word'),
          ex('go_[w]away', '/gow wəwey/'),
          ex('blue_[w]ink', '/bluw wɪŋk/'),
          ex('no_[w]art', '/now wart/'),
          ex('how_[w]is it?', '/haw wɪz ɪt/'),
          ex('go[w]ing', '/gowwɪŋ/', 'inside a word'),
        ],
      },
      {
        h: 'Low vowels /ɑ/ and /ɔ/: no glide',
        p: `<p>/ɑ/ and /ɔ/ don't end in a glide, so speakers move smoothly into the next vowel (some insert a glottal stop).
            Speakers from New England, New York City and Britain often add an <em>intrusive /r/</em> instead —
            this is not typical of General American.</p>`,
        examples: [
          ex('spa owners', '/spɑ ownərz/'),
          ex('saw Ann', '/sɔ æn/'),
          ex('vanilla_[r]ice cream', '/vənɪlər ays kriym/', 'intrusive /r/ in some dialects (the audio models General American)'),
        ],
      },
      {
        h: '2 · Consonant + vowel: the consonant “straddles” both syllables',
        rule: `A word ending in <b>one consonant</b> followed by a vowel: the consonant is said as if it belonged to both
               syllables. A voiceless stop here is <b>not aspirated</b>.`,
        examples: [
          ex('keep_out', '/kiyp‿awt/'),
          ex('dream_on', '/driym‿ɑn/'),
          ex('McIntosh_apple', '/mækɪntɑʃ‿æpəl/'),
          ex('push_up', '/pʊʃ‿ʌp/'),
          ex('stop_it', '/stɑp‿ɪt/'),
          ex('come_in', '/kʌm‿ɪn/'),
          ex('take_off', '/teyk‿ɔf/'),
        ],
      },
      {
        h: '3 · Consonant cluster + vowel: resyllabification',
        rule: `A word ending in a <b>consonant cluster</b> followed by a vowel: the last consonant moves to the next syllable.
               It often happens with plural and past-tense endings.`,
        examples: [
          ex('left_arm', '/lɛf.tarm/'),
          ex('wept_over', '/wɛp.towvər/'),
          ex('find_out', '/fayn.dawt/'),
          ex('hats_off', '/hæt.sɔf/'),
          ex('pushed_up', '/pʊʃ.tʌp/'),
          ex('send_it', '/sɛn.dɪt/', 'sounds like “sen-dit”'),
          ex('camp_out', '/kæm.pawt/', 'sounds like “cam-pout”'),
          ex('lasting', '/læs.tɪŋ/', 'inside a word'),
        ],
      },
      {
        h: '4 · Identical consonants: one long consonant',
        rule: `When the same consonant ends one word and begins the next, it is pronounced <b>once, but longer</b> —
               not twice.`,
        examples: [
          ex('stop_pushing', '[pː]'),
          ex('short_time', '[tː]'),
          ex('quick_cure', '[kː]'),
          ex('classroom_management', '[mː]'),
          ex('rob_Bill', '[bː]'),
          ex('bad_dog', '[dː]'),
          ex('big_gap', '[gː]'),
          ex('less_serious', '[sː]'),
        ],
      },
      {
        h: '5 · Stop + stop or affricate: the first stop is unreleased',
        rule: `When a stop (/p b t d k g/) is followed by another stop or by /tʃ dʒ/, the first stop is
               <b>held but not released</b> or aspirated.`,
        examples: [
          ex('hot_dog', '[t̚d]'),
          ex('back_door', '[k̚d]'),
          ex('blackboard', '[k̚b]', 'inside a word'),
          ex('soup_bowl', '[p̚b]'),
          ex('red_tie', '[d̚t]'),
          ex('big_church', '[g̚tʃ]'),
          ex('bad_judgment', '[d̚dʒ]'),
          ex('sick_child', '[k̚tʃ]'),
          ex('grape_jam', '[p̚dʒ]'),
        ],
      },
      {
        h: 'Linking in context',
        p: '<p>Place names and proverbs are good controlled-practice material. Find the linking type in each one.</p>',
        examples: [
          ex('Cook_County', '[kː]', 'identical consonants'),
          ex('West_Indies', '/wɛs.tɪndiyz/', 'resyllabification'),
          ex('South_Africa', '/sawθ‿æfrɪkə/', 'consonant + vowel'),
          ex('Cape_Cod', '[p̚k]', 'unreleased stop'),
          ex('New_[w]England', '/nuw wɪŋglənd/', '/w/ glide'),
          ex('Marshall_Islands', '/marʃəl‿aylənz/', 'consonant + vowel'),
          ex('Time_is money.', '/taym‿ɪz mʌniy/'),
          ex('A penny saved_is_a penny_[y]earned.', '/ə pɛniy seyv.dɪz‿ə pɛniy yərnd/'),
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── assimilation
  {
    id: 'assimilation',
    title: 'Assimilation',
    short: 'A sound becomes more like its neighbor.',
    sources: ['CM', 'PR'],
    intro: `<p>In <strong>assimilation</strong> a sound (the <em>assimilated</em> sound) takes on features of a neighboring
            sound (the <em>conditioning</em> sound) — usually its voicing or its place of articulation. It happens in every
            language and is <strong>not</strong> a sign of careless speech. English has three types.</p>`,
    sections: [
      {
        h: '1 · Progressive: the first sound affects the next',
        rule: 'Conditioning sound → assimilated sound. Most English cases are grammatical endings.',
        examples: [
          ex('ba*g**s*', '/bægz/', 'voiced /g/ → -s is /z/'),
          ex('ba*ck**s*', '/bæks/', 'voiceless /k/ → -s is /s/'),
          ex('mo*v*(e)*d*', '/muwvd/', 'voiced /v/ → -ed is /d/'),
          ex('wi*sh*(e)*d*', '/wɪʃt/', 'voiceless /ʃ/ → -ed is /t/'),
          ex("i*t*'*s*", '/ɪts/', 'it + is: /z/ → /s/ after /t/'),
        ],
      },
      {
        h: '2 · Regressive: the second sound affects the one before it',
        rule: 'Assimilated sound ← conditioning sound. This is the most common type as a purely phonological process.',
        examples: [
          ex('gra*n*(d)pa', '/græmpə/', '/p/ turns /n/ into /m/'),
          ex('pa*n*cake', '/pæŋkeyk/', '/k/ turns /n/ into /ŋ/'),
          ex('sa*n*(d)wich', '/sæmwɪtʃ/', '/w/ turns /nd/ into /m/'),
          ex('ca*n* buy', '/kəm bay/', '/b/ turns /n/ into /m/'),
          ex('ca*n* go', '/kəŋ gow/', '/g/ turns /n/ into /ŋ/'),
        ],
      },
      {
        h: 'Devoicing before “to”',
        p: '<p>The voiceless /t/ of <em>to</em> devoices the /v/, /z/ or /d/ before it.</p>',
        table: {
          head: ['Phrase', 'Change', 'Result'],
          rows: [
            ['have to', '/v/ → /f/', '/hæftə/'],
            ['has to', '/z/ → /s/', '/hæstə/'],
            ['used to', '/zd/ → /st/', '/yuwstə/'],
          ],
        },
        examples: [
          ex('I ha*v*e to go.', '/ay hæftə gow/'),
          ex('She ha*s* to work.', '/ʃiy hæstə wərk/'),
          ex('We u*s*e*d* to live there.', '/wiy yuwstə lɪv ðɛr/'),
        ],
      },
      {
        h: 'The negative prefix in-',
        p: `<p><em>in-</em> is the default. Before a bilabial it becomes <em>im-</em>; before /l/ and /r/ it becomes
            <em>il-</em> and <em>ir-</em>. Before /k g/ it is still spelled <em>in-</em> but pronounced /ɪŋ/.</p>`,
        table: {
          head: ['in-', 'im-', 'il-', 'ir-'],
          rows: [
            ['inoperative', 'impossible', 'illogical', 'irreplaceable'],
            ['inflexible', 'imbalanced', 'illegal', 'irresponsible'],
            ['indifferent', 'immeasurable', 'illegitimate', 'irrelevant'],
            ['inexcusable', 'immobile', 'illegible', 'irrational'],
            ['intangible', 'impartial', 'illiberal', 'irregular'],
          ],
        },
        examples: [
          ex('*im*possible', '/ɪmpɑsəbəl/'),
          ex('*il*logical', '/ɪlɑdʒɪkəl/'),
          ex('*ir*rational', '/ɪræʃənəl/'),
          ex('*in*coherent', '/ɪŋkowhɪrənt/', 'spelled in-, said /ɪŋ/'),
        ],
      },
      {
        h: 'Sibilants before /ʃ/',
        examples: [
          ex('Swi*ss* chalet', '[ʃʃ]'),
          ex('hor*s*eshoe', '[ʃʃ]'),
          ex('hi*s* shirt', '[ʃʃ]'),
          ex("one'*s* shadow", '[ʃʃ]'),
        ],
      },
      {
        h: 'Final /t d n/ change their place of articulation',
        p: '<p>Voicing stays the same; only the place changes to match the next consonant.</p>',
        examples: [
          ex('goo*d* boy', '/gʊb bɔy/'),
          ex('goo*d* girl', '/gʊg gərl/'),
          ex('tha*t* place', '/ðæp pleys/'),
          ex("He's i*n* Maine.", '/hiyz ɪm meyn/'),
          ex("They're i*n* Kansas.", '/ðɛr ɪŋ kænzəs/'),
          ex('It rains i*n* May.', '/ɪt reynz ɪm mey/'),
          ex('Be o*n* guard!', '/biy ɔŋ gɑrd/'),
        ],
      },
      {
        h: 'Change of manner (informal speech)',
        examples: [
          ex('Could you gi*v*e me a call?', '/kʊdʒə gɪmiy ə kɔl/', 'gimme'),
          ex('Le*t* me do that for you.', '/lɛmiy duw ðæt fər yuw/', 'lemme'),
        ],
      },
      {
        h: '3 · Coalescent: two sounds merge into a third',
        rule: `Sound A + sound B → sound C, with features of both. The most frequent case is
               <a href="#/topic/palatalization">palatalization</a>.`,
        examples: [
          ex("He's coming thi*s*_*y*ear.", '/ðɪʃɪr/'),
          ex('plea*s*ure', '/plɛʒər/', 'inside a word'),
          ex('Doe*s*_*y*our mother know?', '/dʌʒər/'),
          ex('sta*t*ure', '/stætʃər/', 'inside a word'),
          ex('Is tha*t*_*y*our dog?', '/ðætʃər/'),
          ex('proce*d*ure', '/prəsiydʒər/', 'inside a word'),
          ex('Woul*d*_*y*ou mind moving?', '/wʊdʒə/'),
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── palatalization
  {
    id: 'palatalization',
    title: 'Palatalization',
    short: '/s z t d/ + /y/ → /ʃ ʒ tʃ dʒ/ — inside and across words.',
    sources: ['CM', 'PR'],
    intro: `<p><strong>Palatalization</strong> is raising the tongue toward the hard palate. Historically, the /ty/ in
            <em>-tion</em> was simplified to /ʃ/ — nobody today says <em>na-ty-on</em>. The same change happens across word
            boundaries, typically before <em>you, your, yet, year</em>.</p>`,
    sections: [
      {
        h: 'The rule',
        table: {
          head: ['Final sound', '+ /y/', '→ Result', 'Example'],
          rows: [
            ['/s/', '+ /y/', '/ʃ/', 'miss you /mɪʃuw/'],
            ['/z/', '+ /y/', '/ʒ/', 'loves you /lʌvʒuw/'],
            ['/t/ or /ts/', '+ /y/', '/tʃ/', 'hit you /hɪtʃuw/'],
            ['/d/ or /dz/', '+ /y/', '/dʒ/', 'did you /dɪdʒuw/'],
          ],
        },
        examples: [
          ex('mi*ss*_*y*ou', '/mɪʃuw/'),
          ex('love*s*_*y*ou', '/lʌvʒuw/'),
          ex('hi*t*_*y*ou', '/hɪtʃuw/'),
          ex('di*d*_*y*ou', '/dɪdʒuw/'),
        ],
      },
      {
        h: 'Inside words: completely standard',
        p: '<p>Even the most careful speakers palatalize inside words.</p>',
        examples: [
          ex('na*t*ion', '/neyʃən/'),
          ex('vi*s*ion', '/vɪʒən/'),
          ex('ques*t*ion', '/kwɛstʃən/'),
          ex('re*g*ion', '/riydʒən/'),
          ex('na*t*ure', '/neytʃər/'),
        ],
      },
      {
        h: 'Across words: practice sentences',
        examples: [
          ex('Pa*ss*_*y*our plate.', '/pæʃər/'),
          ex("Where'*s*_*y*our fork?", '/wɛrʒər/'),
          ex("Why didn'*t*_*y*ou ea*t*_*y*our soup?", '/dɪdn̩tʃə iytʃər/'),
          ex('Where di*d*_*y*ou hi*d*(e)_*y*our spoon?', '/dɪdʒə haydʒər/'),
          ex("We'll mi*ss*_*y*our sweet smile.", '/mɪʃər/'),
          ex("You'll free*z*(e)_*y*our toes.", '/friyʒər/'),
          ex("I'd like to mee*t*_*y*our brother.", '/miytʃər/'),
          ex('Have you rea*d*_*y*our mail yet today?', '/rɛdʒər/'),
          ex('That was la*st*_*y*ear.', '/læstʃɪr/'),
          ex("They haven't finish*ed*_*y*et.", '/fɪnɪʃtʃɛt/'),
        ],
      },
      {
        h: 'Giving advice (communicative practice)',
        p: `<p>Advice cues such as <em>Why don't you…? Would you like to…? Can't you…? Could you possibly…? Did you ever
            think of…?</em> produce palatalization naturally. Context: noisy neighbors.</p>`,
        examples: [
          ex('Coul*d*_*y*ou possibly mee*t*_*y*our friends somewhere else?', '/kʊdʒə … miytʃər/'),
          ex("Can'*t*_*y*ou amuse yourself more quietly?", '/kæntʃə/'),
          ex("Why don'*t*_*y*ou repla*c*(e)_*y*our muffler?", '/downtʃə … rɪpleyʃər/'),
        ],
        note: `<p><strong>Prator &amp; Robinett:</strong> some ultraconservative teachers call palatalization across words
               “careless”. That is bad advice — <em>ate your lunch</em> as /eytʃər/ is perfectly normal.</p>`,
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── deletion
  {
    id: 'deletion',
    title: 'Deletion (omission)',
    short: 'Sounds that disappear — often without any sign in the spelling.',
    sources: ['CM', 'PR'],
    intro: `<p>In <strong>deletion</strong> (Prator &amp; Robinett call it <em>omission</em>) sounds are dropped or not clearly
            articulated. Spelling sometimes shows it (<em>isn't</em>), but usually it doesn't, and even native speakers
            rarely notice. These are the typical environments.</p>`,
    sections: [
      {
        h: '1 · /t/ after /n/ between vowels',
        examples: [
          ex('win(t)er', '/wɪnər/', 'sounds like winner'),
          ex('Toron(t)o', '/tərɑnow/'),
          ex('twen(t)y', '/twɛniy/'),
          ex('in(t)erview', '/ɪnərvyuw/'),
        ],
        note: '<p>More on this in <a href="#/topic/t-sounds">The many t’s</a>.</p>',
      },
      {
        h: '2 · /t/ or /d/ in the middle of three consonants',
        examples: [
          ex('res(t)less', '/rɛsləs/'),
          ex('las(t)ly', '/læsliy/'),
          ex('exac(t)ly', '/ɪgzækliy/'),
          ex('win(d)mill', '/wɪnmɪl/'),
          ex('kin(d)ness', '/kaynnəs/'),
          ex('han(d)bag', '/hænbæg/'),
        ],
      },
      {
        h: '3 · Final /t d/ in a two-consonant cluster, before a consonant',
        rule: `Deleted before a consonant <b>other than /h y w r/</b>. Before a vowel there is no deletion: the consonant
               <a href="#/topic/linking">resyllabifies</a>. Clusters <b>/nt lt rt rd/</b> don't simplify.`,
        table: {
          head: ['Deletion', 'No deletion (before h, y, w, r)', 'Resyllabification (before a vowel)'],
          rows: [
            ['East side', 'East hill', 'East end → Eas.tend'],
            ['blind man', 'blind youth', 'blind eye → blin.deye'],
            ['wild boar', 'wild woman', 'wild animal → wil.danimal'],
            ['old boyfriend', 'old rags', 'old age → ol.dage'],
          ],
        },
        examples: [
          ex('Eas(t) side', '/iys sayd/'),
          ex('blin(d) man', '/blayn mæn/'),
          ex('wil(d) boar', '/wayl bɔr/'),
          ex('ol(d) boyfriend', '/owl bɔyfrɛnd/'),
          ex('nex(t) day', '/nɛks dey/'),
          ex('las(t) night', '/læs nayt/'),
          ex('plant food', '/plænt fuwd/', 'no deletion: /nt/'),
          ex('felt pen', '/fɛlt pɛn/', 'no deletion: /lt/'),
        ],
      },
      {
        h: '4 · Syncope: an unstressed vowel after the stressed syllable',
        p: `<p>The unstressed /ə/ or /ɪ/ after a strongly stressed syllable is lost. It does <strong>not</strong> happen
            when the last syllable is stressed: <em>separate</em> (verb) /ˈsɛpəˌreyt/ vs. <em>separate</em> (adjective)
            /ˈsɛprət/.</p>`,
        examples: [
          ex('choc(o)late', '/tʃɔklət/'),
          ex('ev(e)ry', '/ɛvriy/'),
          ex('ev(e)ning', '/iyvnɪŋ/'),
          ex('cam(e)ra', '/kæmrə/'),
          ex('myst(e)ry', '/mɪstriy/'),
          ex('hist(o)ry', '/hɪstriy/'),
          ex('veg(e)table', '/vɛdʒtəbəl/'),
          ex('comp(a)rable', '/kɑmprəbəl/'),
          ex('lab(o)ratory', '/læbrətɔriy/'),
          ex('int(e)resting', '/ɪntrəstɪŋ/'),
          ex('mis(e)rable', '/mɪzrəbəl/'),
          ex('gen(e)rally', '/dʒɛnrəliy/'),
          ex('asp(i)rin', '/æsprɪn/'),
          ex('diff(e)rent', '/dɪfrənt/'),
          ex('fav(o)rite', '/feyvrɪt/'),
          ex('rest(au)rant', '/rɛstrɑnt/'),
          ex('bev(e)rage', '/bɛvrɪdʒ/'),
          ex('fam(i)ly', '/fæmliy/'),
          ex('reas(o)nable', '/riyznəbəl/'),
          ex('em(e)rald', '/ɛmrəld/'),
        ],
      },
      {
        h: 'Two syllables → one (rapid, informal speech)',
        p: `<p>Celce-Murcia et al. note these in rapid speech; Prator &amp; Robinett advise learners
            <a href="#/topic/caution">not to cultivate them</a>. Recognize them, but don't aim for them.</p>`,
        examples: [
          ex('c(o)rrect', '/krɛkt/'),
          ex('p(a)rade', '/preyd/'),
          ex('p(o)lice', '/pliys/'),
          ex('s(u)ppose', '/spowz/'),
          ex('g(a)rage', '/grɑʒ/'),
        ],
      },
      {
        h: '5 · Aphaeresis: a lost initial syllable',
        examples: [
          ex("(be)cause I said so", '/kʌz ay sɛd sow/', "'cause", { say: "'Cause I said so." }),
          ex('(a)bout time', '/bawt taym/', "'bout", { say: "'Bout time." }),
          ex('(a)round the corner', '/rawnd ðə kɔrnər/', "'round", { say: "'Round the corner." }),
        ],
      },
      {
        h: '6 · The disappearing /r/',
        p: '<p>The first non-initial /r/ is lost when another /r/ follows in the next syllable.</p>',
        examples: [
          ex('Feb(r)uary', '/fɛbyuwɛriy/'),
          ex('gove(r)nor', '/gʌvənər/'),
          ex('su(r)prise', '/səprayz/'),
          ex('tempe(r)ature', '/tɛmpətʃər/'),
        ],
      },
      {
        h: '7 · “of” → /ə/ before a consonant',
        examples: [
          ex('lots o(f) money', '/lɑtsə mʌniy/'),
          ex('waste o(f) time', '/weystə taym/'),
          ex('hearts o(f) palm', '/hɑrtsə pɑm/'),
        ],
      },
      {
        h: '8 · /h/ and /ð/ in unstressed pronouns',
        examples: [
          ex('ask_(h)er', '/æskər/'),
          ex('help_(h)im', '/hɛlpɪm/'),
          ex('tell_(th)em', '/tɛləm/', "tell 'em"),
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── epenthesis
  {
    id: 'epenthesis',
    title: 'Epenthesis & dissimilation',
    short: 'Adding a sound to make a sequence easier — and making neighbors less alike.',
    sources: ['CM', 'PR'],
    intro: `<p><strong>Epenthesis</strong> (Prator &amp; Robinett: <em>insertion</em>) adds a vowel or consonant to make a
            sequence easier to pronounce. It is less frequent than deletion, but far from rare.</p>`,
    sections: [
      {
        h: '1 · /ə/ in -s and -ed endings',
        rule: 'A schwa breaks up <b>sibilant + -s</b> and <b>/t d/ + -ed</b>.',
        examples: [
          ex('classes', '/klæsəz/'),
          ex('buzzes', '/bʌzəz/'),
          ex('bridges', '/brɪdʒəz/'),
          ex('judges', '/dʒʌdʒəz/'),
          ex('needed', '/niydəd/'),
          ex('padded', '/pædəd/'),
          ex('graded', '/greydəd/'),
          ex('granted', '/græntəd/'),
        ],
      },
      {
        h: '2 · A stop inside a nasal + fricative cluster',
        p: `<p>Inserting a voiceless stop makes the move from nasal to voiceless fricative easier — so <em>prince</em> and
            <em>prints</em>, <em>sense</em> and <em>cents</em> sound virtually the same. Sometimes the extra consonant made it
            into the spelling: the <em>p</em> in <em>empty</em> and <em>Thompson</em>.</p>`,
        examples: [
          ex('prin[t]ce', '/prɪnts/', '= prints'),
          ex('sen[t]se', '/sɛnts/', '= cents'),
          ex('com[p]fort', '/kʌmpfərt/'),
          ex('ham[p]ster', '/hæmpstər/'),
        ],
      },
      {
        h: '3 · /ə/ between a front vowel and dark /l/',
        examples: [
          ex('we[ə]ll', '/wɛəl/'),
          ex('fee[ə]l', '/fiyəl/'),
        ],
      },
      {
        h: 'Learner epenthesis — something to avoid',
        p: `<p>Speakers of languages with few consonant clusters (Spanish, for example) often break clusters up with an
            extra vowel. The audio below models the <strong>target</strong> pronunciation.</p>`,
        examples: [
          ex('[e]school', '✗ /əskuwl/ → ✓ /skuwl/'),
          ex('[e]Spain', '✗ /əspeyn/ → ✓ /speyn/'),
          ex('Eng[ə]lish', '✗ /ɪŋgəlɪʃ/ → ✓ /ɪŋglɪʃ/'),
        ],
      },
      {
        h: 'Dissimilation (rare)',
        p: `<p>In <strong>dissimilation</strong> neighboring sounds become <em>less</em> alike. In English it is rare and not
            productive; the usual example is <em>fifths</em> said as [fɪfts], replacing the middle of three fricatives with a
            stop. It can be ignored for teaching purposes.</p>`,
        examples: [ex('fif*th*s', '[fɪfts]')],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── weak forms
  {
    id: 'weak-forms',
    title: 'Weak forms & syllabic consonants',
    short: 'Unstressed function words are obscured, shortened, or reduced to a single consonant.',
    sources: ['PR'],
    intro: `<p><strong>Sandhi</strong> (Sanskrit “placing together”) is any change in pronunciation that depends on the
            environment. Unstressed <em>function words</em> — particles, pronouns and auxiliary verbs — are weakened by
            <em>obscuring</em> or <em>omitting</em> sounds heard in their stressed form.</p>`,
    sections: [
      {
        h: 'Supplementary list of words subject to reduction',
        table: {
          head: ['Word', 'Stressed', 'Reduced', 'Example'],
          rows: [
            ['as', '/æz/', '/əz/', "It's as good as gold."],
            ['at', '/æt/', '/ət/', 'Look at the time.'],
            ['from', '/frʌm/', '/frəm/', 'came from there'],
            ['than', '/ðæn/', '/ðən/, /n̩/', 'better than ever · less than a mile'],
            ['he', '/hiy/', '/iy/, /ɪ/', "He's gone! · I thought he did."],
            ['her', '/hər/', '/ər/', 'made her glad'],
            ['him', '/hɪm/', '/ɪm/', 'wish him luck'],
            ['his', '/hɪz/', '/ɪz/', 'break his neck'],
            ['she', '/ʃiy/', '/ʃɪ/', 'Did she walk?'],
            ['them', '/ðɛm/', '/ðəm/, /əm/', 'I saw them. · Give them hell!'],
            ['what', '/wʌt/', '/wət/', "That's what I said."],
            ['you', '/yuw/', '/yʊ/, /yə/', 'Will you sing? · How do you do?'],
            ['am', '/æm/', '/əm/, /m/', "I am sure. · I'm sure."],
            ['do', '/duw/', '/dʊ/, /də/', 'How do I know? · What do they want?'],
            ['must', '/mʌst/', '/məs/', 'We must leave now.'],
            ['will', '/wɪl/', '/əl/, /l/', 'Jim will work it. · What will it be?'],
            ['would', '/wʊd/', '/əd/', 'People would like that.'],
          ],
        },
        examples: [
          ex("It's *as* good *as* gold.", '/ɪts əz gʊd əz gowld/'),
          ex('Look *at* the time.', '/lʊk ət ðə taym/'),
          ex('came *from* there', '/keym frəm ðɛr/'),
          ex('better *than* ever', '/bɛɾər ðən ɛvər/'),
          ex('less *than* a mile', '/lɛs n̩ ə mayl/'),
          ex('I thought *he* did.', '/ay θɔt iy dɪd/'),
          ex('made *her* glad', '/meyd ər glæd/'),
          ex('wish *him* luck', '/wɪʃ ɪm lʌk/'),
          ex('break *his* neck', '/breyk ɪz nɛk/'),
          ex('Did *she* walk?', '/dɪd ʃɪ wɔk/'),
          ex('I saw *them*.', '/ay sɔ ðəm/'),
          ex("That's *what* I said.", '/ðæts wət ay sɛd/'),
          ex('How *do you* do?', '/haw də yə duw/'),
          ex('We *must* leave now.', '/wiy məs liyv naw/'),
          ex('What *will* it be?', '/wət l̩ ɪt biy/'),
          ex('People *would* like that.', '/piypəl əd layk ðæt/'),
        ],
      },
      {
        h: 'Degrees of reduction',
        p: `<p>There isn't just one reduced form: a phonetician can hear progressively greater degrees of reduction.</p>`,
        table: {
          head: ['More formal', '', '', 'Most reduced'],
          rows: [
            ['/hiy hæz gɔn/', '/hiy həz gɔn/', '/hiy əz gɔn/', '/hiyz gɔn/'],
            ['/dʒown wɪl sayn ɪt/', '/dʒown əl sayn ɪt/', '/dʒownl̩ sayn ɪt/', '/dʒown sayn ɪt/'],
          ],
        },
        examples: [
          ex('He has gone.', '/hiy hæz gɔn/'),
          ex("He's gone.", '/hiyz gɔn/'),
          ex('Joan will sign it.', '/dʒown wɪl sayn ɪt/'),
          ex("Joan'll sign it.", '/dʒownl̩ sayn ɪt/'),
        ],
      },
      {
        h: 'What controls the amount of reduction?',
        bullets: [
          '<b>Sentence stress</b> — the less stress, the more reduction. A word with normal or contrastive stress is not reduced.',
          '<b>Frequency</b> — the more common the word, and the more predictable in context, the more reduction.',
          '<b>Speed</b> — the faster the speech, the more reduction.',
          '<b>Formality</b> — the more informal the situation, the more reduction.',
        ],
        note: `<p><strong>the</strong> as /ðiy/ before vowels and <strong>to</strong> as /tuw/ before vowels: many educated
               speakers use /ðə/ and /tə/ everywhere. Prator &amp; Robinett think insisting on the difference wastes
               everybody's time.</p>`,
      },
      {
        h: 'Syllabic consonants',
        rule: `In an unstressed syllable, <b>/n/ or /l/</b> (and sometimes /m/ or /ŋ/) can form a syllable on its own after
               /t d/ and similar consonants: <em>didn't</em> /dɪdn̩t/, <em>student</em> /stuwdn̩t/.`,
        examples: [
          ex('good and ready', '/gʊdn̩ rɛdiy/'),
          ex('hard and fast', '/hardn̩ fæst/'),
          ex('good and angry', '/gʊdn̩ æŋgriy/'),
          ex('hit and run', '/hɪtn̩ rʌn/'),
          ex('bite an apple', '/baytn̩ æpəl/'),
          ex('had enough', '/hædn̩ ʌf/'),
          ex('it will happen', '/ɪtl̩ hæpən/'),
          ex('that will be', '/ðætl̩ biy/'),
          ex("stop 'em", '/stɑpm̩/'),
          ex('back and forth', '/bækŋ̍ fɔrθ/'),
          ex('night and day', '/naytn̩ dey/'),
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── t sounds
  {
    id: 't-sounds',
    title: 'The many t’s',
    short: 'Flapped t, disappearing t — and why winter sounds like winner.',
    sources: ['PR', 'CM'],
    sections: [
      {
        h: 'The flap: a t that sounds “somewhat like a /d/”',
        rule: `Between voiced sounds (usually vowels), when the /t/ does <b>not</b> begin a stressed syllable, it becomes a
               quick flap [ɾ]. Across words it happens when /t/ <b>ends</b> the first word — not when it begins a stressed
               second word.`,
        examples: [
          ex('wa*t*er', '/wɔɾər/'),
          ex('a*t*om', '/æɾəm/'),
          ex('par*t*y', '/pɑrɾiy/'),
          ex("hi*t*_'im", '/hɪɾɪm/'),
          ex('righ*t*_or wrong', '/rayɾər rɔŋ/'),
          ex('ge*t*_up', '/gɛɾʌp/', 't ends the word → flap'),
          ex('a *t*est', '/ə tɛst/', 't begins a stressed syllable → no flap'),
          ex('at*t*est', '/ətɛst/', 'no flap'),
        ],
      },
      {
        h: 'The disappearing t',
        rule: `<b>stressed syllable ending in /n/ + t + unstressed vowel</b> → the /t/ is not pronounced. The tongue is
               already on the tooth ridge for /n/, so it just releases into the vowel.`,
        p: `<p>Much more common in American than British English, and more informal than syllabic consonants. You may or may
            not use it, but you must <strong>recognize</strong> it.</p>`,
        examples: [
          ex('twen(t)y', '/twɛniy/'),
          ex('plen(t)y', '/plɛniy/'),
          ex('Sacramen(t)o', '/sækrəmɛnow/'),
          ex('San(t)a Monica', '/sænə mɑnɪkə/'),
          ex('Atlan(t)ic', '/ətlænɪk/'),
          ex('Atlan(t)a', '/ətlænə/'),
          ex('coun(t)y', '/kawniy/'),
          ex('boun(t)iful', '/bawnɪfəl/'),
          ex('quan(t)ity', '/kwɑnəɾiy/'),
          ex('slan(t)ing', '/slænɪŋ/'),
          ex('pain(t)ed', '/peynəd/'),
          ex('fain(t)er', '/feynər/'),
        ],
      },
      {
        h: 'Homophones created by the disappearing t',
        table: {
          head: ['Spelled without t', 'Meaning', 'Spelled with t', 'Meaning'],
          rows: [
            ['banner', 'flag', 'banter', 'good-natured teasing'],
            ['feigner', 'someone who pretends', 'fainter', 'harder to hear'],
            ['planner', 'maker of plans', 'planter', 'sower of seed'],
            ['winner', 'someone who wins', 'winter', 'cold season'],
            ['paining', 'hurting', 'painting', 'using paint'],
            ['punning', 'making plays on words', 'punting', 'poling a boat'],
          ],
        },
      },
      {
        h: 'Listening sentences',
        p: '<p>Find the disappearing t’s, then listen.</p>',
        examples: [
          ex("When we say the harvest is boun(t)iful, we mean it's plen(t)iful."),
          ex('She writes with a slan(t)ing hand.'),
          ex("It's a great advan(t)age to have plen(t)y of money."),
          ex('I can feel the splin(t)er in my finger.'),
          ex('His pain(t)ings are all gigan(t)ic.'),
          ex('We used to live in Pon(t)iac, but now we live in Toron(t)o.'),
          ex('The heroine fain(t)ed when she saw the phan(t)om.'),
          ex('I became fran(t)ic as the voice grew fain(t)er and fain(t)er.'),
          ex('The Moun(t)ed Policeman wan(t)ed the boun(t)y very much.'),
          ex('Buy a large quan(t)ity of bread.'),
          ex('They were all elected to coun(t)y office.'),
        ],
      },
      {
        h: 'Twenty to ninety: three kinds of t',
        rule: `After <b>/n/</b> → disappearing t. After a <b>vowel or /r/</b> → flap. After a <b>voiceless consonant</b>
               (/f/, /ks/) → a regular [t].`,
        examples: [
          ex('twen(t)y', '/twɛniy/', 'disappearing'),
          ex('thir*t*y', '/θərɾiy/', 'flap'),
          ex('for*t*y', '/fɔrɾiy/', 'flap'),
          ex('fif*t*y', '/fɪftiy/', 'regular [t]'),
          ex('six*t*y', '/sɪkstiy/', 'regular [t]'),
          ex('seven(t)y', '/sɛvəniy/', 'disappearing'),
          ex('eigh*t*y', '/eyɾiy/', 'flap'),
          ex('nine(t)y', '/nayniy/', 'disappearing'),
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── verb + to
  {
    id: 'verb-to',
    title: 'Verb + to reductions',
    short: 'gonna, gotta, hasta, hafta, oughta, usta, wanna — and when you can’t use them.',
    sources: ['PR'],
    intro: `<p><em>to</em> is so frequent and so predictable that it is reduced constantly. With auxiliary-like verbs it
            forms well-established sandhi-forms, used at times by even the most educated speakers.</p>`,
    sections: [
      {
        h: 'The seven forms',
        table: {
          head: ['Full form', 'Spelling', 'Pronunciation', 'Meaning', 'Process'],
          rows: [
            ['going to', 'gonna', '/gənə/ (/gownə/)', 'intention', 'several accumulated changes'],
            ['got to', 'gotta', '/gɑɾə/', 'necessity', 'flapped /t/'],
            ['has to', 'hasta', '/hæstə/', 'necessity', '/z/ devoiced to /s/'],
            ['have to', 'hafta', '/hæftə/', 'necessity', '/v/ devoiced to /f/'],
            ['ought to', 'oughta', '/ɔɾə/', 'moral obligation', 'flapped /t/'],
            ['used to', 'usta', '/yuwstə/', 'former habit', '/z/ devoiced to /s/'],
            ['want to', 'wanna', '/wɑnə/', 'desire', 'disappearing /t/'],
          ],
        },
        p: `<p><strong>How gonna developed:</strong> /gowɪŋ tuw/ → /gowɪn tə/ (-ing as /ɪn/) → /gownə/ (disappearing t) →
            /gənə/ (unstressed vowel obscured). A good example of how sandhi-changes accumulate.</p>`,
      },
      {
        h: 'Same words, different meaning',
        rule: `The reduced form is <b>only</b> possible with the meaning in the table. With another meaning, you must use the
               full form — or the sentence changes meaning or becomes nonsense.`,
        examples: [
          ex("I'm *gonna* be good.", '', 'intention → gonna ✓'),
          ex("I'm going to church.", '', 'destination → no gonna'),
          ex('What have we *gotta* eat?', '', 'necessity → gotta ✓'),
          ex('What have we got to eat?', '', 'availability → full form'),
          ex('What does she *hafta* say?', '', 'necessity → hafta ✓'),
          ex('What does she have to say?', '', 'asking for her explanation → full form'),
          ex("It's what he *hasta* do.", '', 'necessity → hasta ✓', { say: "It's what he has to do." }),
          ex("It's all he has to work with.", '', 'availability → full form'),
          ex('You *usta* dance often.', '', 'former habit → usta ✓', { say: 'You used to dance often.' }),
          ex('This is what you used to scare us.', '', 'utilization → full form'),
          ex('How much do you *wanna* do it?', '', 'extent of desire → wanna ✓'),
          ex('How much does he want to do it?', '', 'asking his price → full form'),
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── caution
  {
    id: 'caution',
    title: 'A word of caution',
    short: 'Which forms to use, which to recognize, and which to avoid.',
    sources: ['PR'],
    intro: `<p>Sandhi-forms are natural and essential — there's no reason to fear them. But some are so informal that they
            reduce intelligibility or mark a speaker socially. Prator &amp; Robinett draw the line like this.</p>`,
    sections: [
      {
        h: '✓ Use: post-tonic syncope',
        rule: `<b>stressed syllable + two or more unstressed syllables</b> → the first vowel after the stress is dropped, even
               by the most literate speakers.`,
        examples: [
          ex('ev(e)ry', '/ɛvriy/'),
          ex('diff(e)rent', '/dɪfrənt/'),
          ex('fam(i)ly', '/fæmliy/'),
          ex('int(e)resting', '/ɪntrəstɪŋ/'),
          ex('nat(u)rally', '/nætʃrəliy/'),
          ex('sep(a)rate', '/sɛprət/', 'adjective'),
          ex('sev(e)ral', '/sɛvrəl/'),
        ],
      },
      {
        h: '~ Recognize, but don’t pile them up',
        p: `<p>Several reductions in quick succession are usually too informal and make you harder to understand.</p>`,
        examples: [
          ex('What did you do?', '✗ /wədʒə duw/'),
          ex("Why don't you say it?", '✗ /wayowntʃə sey ɪt/'),
          ex('Did you eat yet?', '✗ /dʒiytʃɛt/'),
        ],
      },
      {
        h: '✗ Avoid: pretonic syncope',
        rule: `<b>unstressed initial syllable + stressed syllable</b>: dropping that first vowel creates unnecessary clusters
               and doesn't make the word easier or clearer.`,
        examples: [
          ex('b(a)lloon', '✗ /bluwn/'),
          ex('b(e)lieve', '✗ /bliyv/'),
          ex('b(e)low', '✗ /blow/'),
          ex('c(o)llapse', '✗ /klæps/'),
          ex('c(o)rrect', '✗ /krɛkt/'),
          ex('g(a)rage', '✗ /grɑʒ/'),
          ex('p(a)rade', '✗ /preyd/'),
          ex('p(o)lice', '✗ /pliys/'),
          ex('p(o)lite', '✗ /playt/'),
          ex('s(u)ppose', '✗ /spowz/'),
        ],
        note: '<p>The audio models the recommended, full pronunciation.</p>',
      },
      {
        h: '✗ Avoid: other marked forms',
        bullets: [
          '<b>ain’t</b> — widely regarded as bad grammar.',
          '<b>’tis, ’twere, ’twill be</b> — old-fashioned; only for poetry or to sound amusing.',
          '<b>-in’ for -ing</b> (<em>singin’, dancin’</em>) — once used by all social classes, now widely disapproved among educated speakers. Say /ɪŋ/.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────── teaching
  {
    id: 'teaching',
    title: 'Teaching connected speech',
    short: 'Priorities, worksheets, jokes, dialogues and communicative activities.',
    sources: ['CM'],
    intro: `<p>In a pronunciation course, first give an overview, then work on one feature at a time in a meaningful
            context. When pronunciation is integrated with other skills, attach the feature to the teaching point
            (phrasal verbs, imperatives, giving advice…).</p>`,
    sections: [
      {
        h: 'What to highlight first',
        bullets: [
          '<b>Consonant-to-vowel linking</b> — <em>send it, push up</em>',
          '<b>Vowel-to-vowel linking</b> — <em>be a sport, go on</em>',
          '<b>Consonant assimilation</b> — <em>hot dog, less serious</em>',
          '<b>Palatalization</b> — <em>pass your plate, did you</em>',
        ],
        p: '<p>Sequence: <strong>description &amp; analysis → listening discrimination → controlled → guided → communicative practice.</strong></p>',
      },
      {
        h: 'Controlled practice: a dialogue',
        p: '<p>Underline the likely links, then read it with a partner. Scenario: two students see a classmate rushing to catch a bus.</p>',
        dialogues: [
          {
            title: 'Where is Ann going?',
            lines: [
              { who: 'Bob', voice: 'B', m: 'Hey, where_is_Ann going_in such_a hurry?' },
              { who: 'Marie', voice: 'A', m: "I haven't_any_[y]idea!" },
              { who: 'Bob', voice: 'B', m: "I hope_it's not_an_emergency." },
              { who: 'Marie', voice: 'A', m: 'Me too. Her grandmother_is_in the hospital. Do you think_it might be that?' },
              { who: 'Bob', voice: 'B', m: "I'm not sure. She raced_out_of here so fast, I didn't get_a chance to_ask_her." },
            ],
          },
        ],
      },
      {
        h: 'Idioms and sayings',
        examples: [
          ex('all talk_and no_[w]action'),
          ex('Talk_is cheap.'),
          ex('talk_a blue streak'),
          ex('talk shop'),
          ex('talk through your hat'),
          ex("talk someone's head_off"),
          ex('All poets_are mad.', '', 'Robert Burton'),
          ex('All men_are poets_at heart.', '', 'Ralph Waldo Emerson'),
          ex("Don't coun*t*_*y*our chickens before they're hatched.", '/kawntʃər/', 'palatalization practice'),
          ex('Pu*t*_*y*our money where your mouth_is.', '/pʊtʃər/', 'palatalization + linking'),
        ],
      },
      {
        h: 'Guided practice: picture grid',
        p: `<p>Students ask each other about squares in a grid and draw what they hear, practicing glides after
            <em>three</em> /θriy/ and <em>two</em> /tuw/.</p>`,
        examples: [
          ex('What_is_in square four?'),
          ex('Three_[y]elephants.', '/θriy yɛləfənts/'),
          ex('Two_[w]apples.', '/tuw wæpəlz/'),
          ex('Three_[y]umbrellas.', '/θriy yʌmbrɛləz/'),
        ],
      },
      {
        h: 'Knock-knock jokes',
        p: '<p>The name in line three becomes a pun in line five — through connected speech.</p>',
        dialogues: [
          {
            title: 'Scott',
            lines: [
              { who: 'A', voice: 'A', m: 'Knock, knock.' },
              { who: 'B', voice: 'B', m: "Who's there?" },
              { who: 'A', voice: 'A', m: 'Scott.' },
              { who: 'B', voice: 'B', m: 'Scott who?' },
              { who: 'A', voice: 'A', m: 'Scott nothing to do with you!', note: "= 's got" },
            ],
          },
          {
            title: 'Stu',
            lines: [
              { who: 'A', voice: 'A', m: 'Knock, knock.' },
              { who: 'B', voice: 'B', m: "Who's there?" },
              { who: 'A', voice: 'A', m: 'Stu.' },
              { who: 'B', voice: 'B', m: 'Stu who?' },
              { who: 'A', voice: 'A', m: 'Stu late for that now!', note: '= too late' },
            ],
          },
          {
            title: 'Anita',
            lines: [
              { who: 'A', voice: 'A', m: 'Knock, knock.' },
              { who: 'B', voice: 'B', m: "Who's there?" },
              { who: 'A', voice: 'A', m: 'Anita.' },
              { who: 'B', voice: 'B', m: 'Anita who?' },
              { who: 'A', voice: 'A', m: 'Anita break!', note: '= I need a' },
            ],
          },
          {
            title: 'Justin',
            lines: [
              { who: 'A', voice: 'A', m: 'Knock, knock.' },
              { who: 'B', voice: 'B', m: "Who's there?" },
              { who: 'A', voice: 'A', m: 'Justin.' },
              { who: 'B', voice: 'B', m: 'Justin who?' },
              { who: 'A', voice: 'A', m: 'Justin time for dinner!', note: '= just in' },
            ],
          },
        ],
        note: '<p>Now write your own with: Ida, Andy, Izzy, Willy, Jamaica, Adam, Lemmy.</p>',
      },
      {
        h: 'Communicative practice: giving instructions',
        p: `<p>Student A describes a picture that Student B can't see; B draws it. Commands produce a lot of linking.</p>`,
        examples: [
          ex('Put_a tree_on the right side_of your picture.'),
          ex('Add_a house to the left_of the tree.'),
          ex('Draw_a door_and two windows_on the house.'),
        ],
      },
    ],
  },
];

export const topicGroups = [
  {
    title: 'Connected speech',
    source: 'CM',
    ids: ['contractions', 'linking', 'assimilation', 'palatalization', 'deletion', 'epenthesis'],
  },
  {
    title: 'The sandhi of spoken English',
    source: 'PR',
    ids: ['weak-forms', 't-sounds', 'verb-to', 'caution'],
  },
  {
    title: 'For teachers',
    source: 'CM',
    ids: ['teaching'],
  },
];

export function topicById(id) {
  return topics.find((t) => t.id === id);
}

// Reading order: the order used by the sidebar and the prev/next links.
export const orderedTopics = topicGroups.flatMap((g) => g.ids.map(topicById));
