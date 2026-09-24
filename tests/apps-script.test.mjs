// Runs google-apps-script/Code.gs against small fakes of the Apps Script
// services, to check the logic (sheet setup, saving, de-duplication, escaping).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

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

function makeEnv() {
  const sheets = [new FakeSheet('Hoja 1')];
  const files = [];
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
  const props = new Map();
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
      createFolder: () => ({
        getId: () => 'folder1',
        createFile: (blob) => {
          files.push(blob);
          return { getUrl: () => `https://drive.google.com/file/d/f${files.length}` };
        },
      }),
      getFolderById: () => {
        throw new Error('gone');
      },
    },
    Utilities: {
      base64Decode: (s) => Buffer.from(s, 'base64'),
      newBlob: (bytes, mime, name) => ({ bytes, mime, name }),
      formatDate: (d) => d.toISOString().slice(0, 16),
    },
    Logger: { log() {} },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const post = (obj) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(obj) } }).body);
  return { ctx, ss, sheets, files, post };
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
  assert.deepEqual(JSON.parse(ctx.doGet().body), { ok: true, app: 'Connected Speech Lab', sheet: 'Test sheet' });
});
