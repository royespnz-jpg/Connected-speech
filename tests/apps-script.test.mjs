// Runs google-apps-script/Code.gs against small fakes of the Apps Script
// services, to check the logic (sheet setup, saving, de-duplication, escaping).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { ttsRequestBody, OUTPUT_FORMAT, MODES, MODELS } from '../js/audio-core.js';
import { readdirSync } from 'node:fs';
import { splitCode, stripMarkers } from '../scripts/split-gs.mjs';

const code = readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8');

const chain = (extra = {}) =>
  new Proxy(extra, {
    get: (target, prop) => (prop in target ? target[prop] : () => chain(target)),
  });

class FakeRange {
  constructor(sheet, row, col, rows, cols, a1) {
    Object.assign(this, { sheet, row, col, rows, cols, a1 });
  }
  setValues(values) {
    values.forEach((r, i) => r.forEach((v, j) => this.sheet.set(this.row + i, this.col + j, v)));
    return this;
  }
  setValue(v) {
    return this.setValues([[v]]);
  }
  getValues() {
    return Array.from({ length: this.rows }, (_, r) =>
      Array.from({ length: this.cols }, (_, c) => this.sheet.get(this.row + r, this.col + c) ?? ''),
    );
  }
  clearContent() {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++) if (this.sheet.get(this.row + r, this.col + c) !== undefined) this.sheet.set(this.row + r, this.col + c, undefined);
    this.sheet.trim();
    return this;
  }
  clearDataValidations() {
    return this;
  }
  setFormula(f) {
    this.sheet.formulas[this.a1 || `${this.row},${this.col}`] = f;
    return this;
  }
  createTextFinder(text) {
    const range = this;
    return {
      matchEntireCell() {
        return this;
      },
      findNext() {
        for (let r = 0; r < range.rows; r++)
          for (let c = 0; c < range.cols; c++)
            if (String(range.sheet.get(range.row + r, range.col + c)) === text) return {};
        return null;
      },
    };
  }
}
for (const m of ['setFontWeight', 'setBackground', 'setFontColor', 'setFontSize', 'setWrap', 'setNumberFormat', 'setDataValidation']) {
  FakeRange.prototype[m] = function () {
    return this;
  };
}

class FakeSheet {
  constructor(name) {
    this.name = name;
    this.data = [];
    this.formulas = {};
    this.rules = [];
  }
  set(r, c, v) {
    while (this.data.length < r) this.data.push([]);
    this.data[r - 1][c - 1] = v;
  }
  get(r, c) {
    return this.data[r - 1]?.[c - 1];
  }
  getName() {
    return this.name;
  }
  getRange(a, b, c = 1, d = 1) {
    if (typeof a === 'string') {
      const m = a.match(/^([A-Z]+)(\d+)/);
      const col = m[1].charCodeAt(0) - 64;
      return new FakeRange(this, Number(m[2]), col, 1, 1, a);
    }
    return new FakeRange(this, a, b, c, d);
  }
  appendRow(row) {
    this.data.push([...row]);
    return this;
  }
  getLastRow() {
    return this.data.length;
  }
  getMaxRows() {
    return Math.max(1000, this.data.length);
  }
  trim() {
    while (this.data.length && this.data[this.data.length - 1].every((v) => v === undefined || v === '')) this.data.pop();
  }
  getConditionalFormatRules() {
    return this.rules;
  }
  setConditionalFormatRules(r) {
    this.rules = r;
  }
  setFrozenRows() {}
  setFrozenColumns() {}
  setColumnWidth() {}
}

function makeEnv({ key = 'sk_test' } = {}) {
  const sheets = [new FakeSheet('Hoja 1')];
  const files = [];
  const fetches = [];
  const cache = new Map();
  const driveAudio = new Map();
  const ss = {
    getSheetByName: (n) => sheets.find((s) => s.name === n) || null,
    insertSheet: (n, i) => {
      const s = new FakeSheet(n);
      if (i === 0) sheets.unshift(s);
      else sheets.push(s);
      return s;
    },
    getSheets: () => [...sheets],
    deleteSheet: (s) => sheets.splice(sheets.indexOf(s), 1),
    getUrl: () => 'https://docs.google.com/spreadsheets/d/x',
    getName: () => 'Test sheet',
    getId: () => 'x',
    getSpreadsheetTimeZone: () => 'UTC',
  };
  const props = new Map(key ? [['ELEVENLABS_API_KEY', key]] : []);
  const response = (code, body, bytes) => ({
    getResponseCode: () => code,
    getContentText: () => (typeof body === 'string' ? body : JSON.stringify(body)),
    getBlob: () => {
      const blob = { bytes, name: '', setName(n) { this.name = n; return this; }, getBytes() { return this.bytes; } };
      return blob;
    },
  });
  const ctx = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ss,
      newConditionalFormatRule: () => chain({ build: () => ({ rule: true }) }),
      newDataValidation: () => chain({ build: () => ({}) }),
      InterpolationType: { NUMBER: 'NUMBER' },
    },
    ContentService: {
      createTextOutput: (s) => ({ body: s, setMimeType() {
        return this;
      } }),
      MimeType: { JSON: 'json' },
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: (k) => props.get(k) ?? null, setProperty: (k, v) => props.set(k, v) }),
    },
    DriveApp: {
      createFolder: (name) => ({
        getId: () => name,
        createFile: (blob) => {
          files.push(blob);
          if (/Audio/.test(name)) driveAudio.set(blob.name, blob);
          return { getUrl: () => `https://drive.google.com/file/d/f${files.length}` };
        },
        getFilesByName: (n) => {
          const hit = driveAudio.get(n);
          let done = !hit;
          return { hasNext: () => !done, next: () => ((done = true), { getBlob: () => hit }) };
        },
      }),
      getFolderById: () => {
        throw new Error('gone');
      },
    },
    Utilities: {
      base64Decode: (s) => Buffer.from(s, 'base64'),
      base64Encode: (b) => Buffer.from(b).toString('base64'),
      newBlob: (bytes, mime, name) => ({ bytes, mime, name }),
      formatDate: (d, tz, fmt) => (fmt === 'yyyy-MM-dd' ? d.toISOString().slice(0, 10) : d.toISOString().slice(0, 16)),
      computeDigest: (alg, str) => [...createHash('sha256').update(str).digest()].map((b) => (b > 127 ? b - 256 : b)),
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      Charset: { UTF_8: 'UTF_8' },
    },
    Session: { getScriptTimeZone: () => 'UTC' },
    CacheService: {
      getScriptCache: () => ({
        get: (k) => cache.get(k) ?? null,
        put: (k, v) => cache.set(k, v),
        remove: (k) => cache.delete(k),
      }),
    },
    UrlFetchApp: {
      fetch: (url, opts = {}) => {
        fetches.push({ url, opts });
        if (url.endsWith('/voices')) {
          return response(200, {
            voices: [
              { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', labels: { accent: 'american', gender: 'female' }, category: 'premade', preview_url: 'https://x/p.mp3' },
            ],
          });
        }
        if (url.includes('/text-to-speech/')) {
          if (url.includes('BADVOICE')) return response(404, { detail: { status: 'voice_not_found', message: 'Voice not found' } });
          return response(200, '', Buffer.from('mp3:' + JSON.parse(opts.payload).text));
        }
        return response(404, 'nope');
      },
    },
    Logger: { log() {} },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const post = (obj) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(obj) } }).body);
  return { ctx, ss, sheets, files, post, fetches, cache, props };
}

const result = (extra = {}) => ({
  type: 'result',
  id: 'attempt-1',
  student: 'Ana',
  group: '2B',
  setId: 'verb-to',
  setTitle: 'gonna or going to?',
  correct: 12,
  total: 15,
  durationSec: 90,
  finishedAt: '2026-09-24T10:00:00Z',
  items: [
    { n: 1, prompt: 'How much money does he ___ do the job?', answer: 'wanna', expected: 'want to', correct: false },
    { n: 2, prompt: "Aren't you ___ miss your appointment?", answer: 'gonna', expected: 'gonna', correct: true },
  ],
  ...extra,
});

test('setup creates every sheet and removes the empty default one', () => {
  const { ctx, sheets } = makeEnv();
  ctx.setup();
  assert.deepEqual(
    sheets.map((s) => s.name),
    ['Resumen', 'Resultados', 'Respuestas', 'Grabaciones', 'Alumno × Ejercicio'],
  );
  assert.equal(sheets[1].get(1, 1), 'Fecha');
  assert.equal(sheets[1].get(1, 10), 'ID intento');
  assert.match(sheets[0].formulas.A2, /^=IFERROR\(QUERY\(Resultados!A:J,"select B, C.*",1\),"Todavía no hay resultados\."\)$/);
  // setup can run again without duplicating anything
  ctx.setup();
  assert.equal(sheets.length, 5);
  assert.equal(sheets[1].getLastRow(), 1);
});

test('QUERY formulas have balanced quotes', () => {
  const { ctx, sheets } = makeEnv();
  ctx.setup();
  for (const s of sheets)
    for (const f of Object.values(s.formulas)) assert.equal((f.match(/"/g) || []).length % 2, 0, f);
});

test('doPost saves a result and one row per answer', () => {
  const { ctx, ss, post } = makeEnv();
  ctx.setup();
  assert.deepEqual(post(result()), { ok: true, saved: 2 });
  const row = ss.getSheetByName('Resultados').data[1];
  assert.equal(row[1], 'Ana');
  assert.equal(row[2], '2B');
  assert.equal(row[5], 12);
  assert.equal(row[6], 15);
  assert.equal(row[7], 0.8);
  assert.equal(row[8], 90 / 86400);
  assert.equal(row[9], 'attempt-1');
  assert.ok(row[0] instanceof Date || Object.prototype.toString.call(row[0]) === '[object Date]');
  const answers = ss.getSheetByName('Respuestas').data;
  assert.equal(answers.length, 3);
  assert.equal(answers[1][6], 'wanna');
  assert.equal(answers[1][8], false);
  assert.equal(answers[2][8], true);
});

test('the same attempt is saved only once', () => {
  const { ctx, ss, post } = makeEnv();
  ctx.setup();
  post(result());
  assert.deepEqual(post(result()), { ok: true, duplicate: true });
  assert.equal(ss.getSheetByName('Resultados').getLastRow(), 2);
  assert.equal(ss.getSheetByName('Respuestas').getLastRow(), 3);
});

test('text that looks like a formula is escaped', () => {
  const { ctx, ss, post } = makeEnv();
  ctx.setup();
  post(result({ id: 'x2', student: '=IMPORTXML("http://evil")', items: [{ prompt: '+1', answer: '@me', expected: '-2' }] }));
  assert.equal(ss.getSheetByName('Resultados').data[1][1], '\'=IMPORTXML("http://evil")');
  const a = ss.getSheetByName('Respuestas').data[1];
  assert.deepEqual([a[5], a[6], a[7]], ["'+1", "'@me", "'-2"]);
});

test('works without running setup first', () => {
  const { ss, post } = makeEnv();
  assert.equal(post(result()).ok, true);
  assert.equal(ss.getSheetByName('Resultados').getLastRow(), 2);
});

test('recordings are stored in Drive and linked from the sheet', () => {
  const { ctx, ss, files, post } = makeEnv();
  ctx.setup();
  const res = post({
    type: 'recording',
    id: 'rec-1',
    student: 'Ana',
    group: '2B',
    text: 'Did you eat yet?',
    mimeType: 'audio/webm;codecs=opus',
    audio: Buffer.from('fake audio').toString('base64'),
    durationSec: 2.5,
  });
  assert.deepEqual(res, { ok: true });
  assert.equal(files.length, 1);
  assert.equal(files[0].mime, 'audio/webm');
  assert.match(files[0].name, /Ana · Did you eat yet\?\.webm$/);
  const row = ss.getSheetByName('Grabaciones').data[1];
  assert.equal(row[4], '=HYPERLINK("https://drive.google.com/file/d/f1","▶ Escuchar")');
  assert.equal(row[5], 2.5);
  assert.deepEqual(post({ type: 'recording', id: 'rec-1', mimeType: 'audio/webm', audio: 'AA==' }), { ok: true, duplicate: true });
});

test('bad input is rejected with a message', () => {
  const { ctx, post } = makeEnv();
  assert.equal(post({ type: 'nope' }).ok, false);
  assert.equal(post({ type: 'result' }).ok, false); // no id
  assert.equal(post({ type: 'recording', id: 'r', mimeType: 'text/html', audio: 'AA==' }).ok, false);
  const bad = JSON.parse(ctx.doPost({ postData: { contents: '{not json' } }).body);
  assert.equal(bad.ok, false);
  assert.deepEqual(JSON.parse(ctx.doGet().body), { ok: true, app: 'Connected Speech Lab', sheet: 'Test sheet', tts: true, version: 2 });
});

// ─── voice engine ───────────────────────────────────────────────────────────

test('the script builds the same ElevenLabs request as the app', () => {
  const { ctx } = makeEnv();
  assert.match(code, new RegExp(`outputFormat: '${OUTPUT_FORMAT}'`));
  for (const model of MODELS.map((m) => m.id)) {
    for (const mode of Object.keys(MODES)) {
      const text = 'Did you eat your lunch yet?';
      assert.deepEqual(JSON.parse(JSON.stringify(ctx.ttsBody_(text, mode, model))), ttsRequestBody(text, mode, model), `${model}/${mode}`);
    }
  }
});

test('tts generates once, then serves from cache and Drive', () => {
  const { post, fetches, cache, props } = makeEnv();
  const req = { type: 'tts', text: 'stay up', mode: 'words', voiceId: 'EXAVITQu4vr4xnSDxMaL', model: 'eleven_flash_v2_5' };
  const first = post(req);
  assert.equal(first.ok, true);
  assert.equal(first.cached, false);
  assert.equal(Buffer.from(first.audio, 'base64').toString(), 'mp3:stay <break time="0.35s"/> up');
  const call = fetches.find((f) => f.url.includes('/text-to-speech/'));
  assert.equal(call.url, `https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=${OUTPUT_FORMAT}`);
  assert.equal(call.opts.headers['xi-api-key'], 'sk_test');
  assert.equal(JSON.parse(call.opts.payload).model_id, 'eleven_flash_v2_5');
  assert.equal(JSON.parse(props.get('TTS_USAGE')).chars, 7);

  assert.equal(post(req).cached, true); // CacheService
  cache.clear();
  assert.equal(post(req).cached, true); // Drive
  assert.equal(fetches.filter((f) => f.url.includes('/text-to-speech/')).length, 1);
  assert.equal(JSON.parse(props.get('TTS_USAGE')).chars, 7);
});

test('tts validates input and enforces the daily limit', () => {
  const { post, props } = makeEnv();
  assert.equal(post({ type: 'tts', text: '', voiceId: 'EXAVITQu4vr4xnSDxMaL' }).ok, false);
  assert.equal(post({ type: 'tts', text: 'x'.repeat(401), voiceId: 'EXAVITQu4vr4xnSDxMaL' }).ok, false);
  assert.equal(post({ type: 'tts', text: 'hi', voiceId: '../../etc' }).ok, false);
  const bad = post({ type: 'tts', text: 'hi', voiceId: 'BADVOICE123' });
  assert.equal(bad.ok, false);
  assert.match(bad.error, /404.*Voice not found/);
  props.set('ELEVENLABS_DAILY_LIMIT', '10');
  assert.equal(post({ type: 'tts', text: 'twelve chars', voiceId: 'EXAVITQu4vr4xnSDxMaL' }).ok, false);
  assert.equal(post({ type: 'tts', text: 'short', voiceId: 'EXAVITQu4vr4xnSDxMaL' }).ok, true);
  assert.match(post({ type: 'tts', text: 'again!', voiceId: 'EXAVITQu4vr4xnSDxMaL' }).error, /límite diario/);
});

test('voices are listed through the script and cached', () => {
  const { post, fetches } = makeEnv();
  const res = post({ type: 'voices' });
  assert.equal(res.ok, true);
  assert.deepEqual(res.voices[0], {
    id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', accent: 'american', gender: 'female', age: '', description: '', category: 'premade', preview: 'https://x/p.mp3',
  });
  assert.deepEqual(res.usage, { today: 0, limit: 20000 });
  post({ type: 'voices' });
  assert.equal(fetches.filter((f) => f.url.endsWith('/voices')).length, 1);
});

test('without a key the voice engine says how to set it up', () => {
  const { ctx, post } = makeEnv({ key: null });
  assert.equal(JSON.parse(ctx.doGet().body).tts, false);
  assert.match(post({ type: 'tts', text: 'hi', voiceId: 'EXAVITQu4vr4xnSDxMaL' }).error, /API key/);
  assert.equal(post(result()).ok, true); // results still work
});

test('the short parts in partes/ are up to date and add up to Code.gs', () => {
  const dir = new URL('../google-apps-script/partes/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.gs')).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
  const parts = files.map((f) => stripMarkers(readFileSync(new URL(f, dir), 'utf8')));
  assert.deepEqual(parts.map((p) => p.replace(/\n+$/, '')), splitCode(code).map((p) => p.replace(/\n+$/, '')), 'run: node scripts/split-gs.mjs');
  for (const f of files) assert.ok(readFileSync(new URL(f, dir), 'utf8').split('\n').length <= 125, `${f} is too long`);
  // Loading the parts one after another behaves like loading Code.gs.
  const ctx = vm.createContext({});
  for (const p of parts) vm.runInContext(p, ctx);
  assert.equal(typeof ctx.doPost, 'function');
  assert.equal(typeof ctx.getSpreadsheet_, 'function');
});

test('empty checkbox cells (FALSE) do not push answers down to row 1001', () => {
  const { ctx, ss, post } = makeEnv();
  ctx.setup();
  const answers = ss.getSheetByName('Respuestas');
  // What Google Sheets did with a whole-column checkbox: FALSE in every empty row.
  for (let r = 2; r <= 1000; r++) answers.set(r, 9, false);
  ctx.setup(); // repairs the column
  assert.equal(answers.getLastRow(), 1);
  post(result());
  assert.equal(answers.data[1][9], 'attempt-1');
  assert.equal(answers.getLastRow(), 3);
  // Still works if the FALSE cells are there when a result arrives.
  for (let r = 4; r <= 1000; r++) answers.set(r, 9, false);
  post(result({ id: 'attempt-2' }));
  assert.equal(answers.data[3][9], 'attempt-2');
});
