/**
 * Connected Speech Lab — Resultados en Google Sheets
 * ==================================================
 * Guarda en una planilla de Google:
 *   • Resultados   → una fila por ejercicio terminado (alumno, curso, puntaje, %, duración)
 *   • Respuestas   → una fila por cada respuesta (qué contestó y cuál era la correcta)
 *   • Grabaciones  → las grabaciones que los alumnos envían (el audio queda en tu Google Drive)
 *   • Resumen y Alumno × Ejercicio → promedios y mejores notas, se actualizan solos
 *
 * INSTALACIÓN (una sola vez, ~5 minutos)
 *  1. Creá una hoja de cálculo nueva en Google Sheets (sheets.new).
 *  2. Menú Extensiones → Apps Script. Borrá lo que haya, pegá TODO este archivo y guardá (💾).
 *  3. Arriba elegí la función `setup` y tocá ▶ Ejecutar. Aceptá los permisos.
 *     (Si aparece “Google no verificó esta app”: Configuración avanzada → Ir a … — es tu propio script.)
 *  4. Implementar → Nueva implementación → ⚙ Tipo: Aplicación web
 *        Ejecutar como: Yo
 *        Quién tiene acceso: Cualquier persona
 *     → Implementar → copiá la “URL de la aplicación web” (termina en /exec).
 *  5. En la app: Settings → “Results → Google Sheets” → pegá la URL → Test connection → Save.
 *     Ahí mismo aparece el “Student link”: compartilo con tus alumnos y sus resultados llegan acá.
 *
 * Si más adelante cambiás este código: Implementar → Administrar implementaciones → ✏ →
 * Versión: “Nueva versión” → Implementar. La URL sigue siendo la misma.
 */

const APP_NAME = 'Connected Speech Lab';
const HEADER_BG = '#0f766e';
const MAX_TEXT = 1000;
const MAX_ITEMS = 200;
const MAX_AUDIO_BASE64 = 10 * 1024 * 1024; // ~7 MB de audio

const SHEETS = {
  results: {
    name: 'Resultados',
    headers: ['Fecha', 'Alumno', 'Curso', 'Ejercicio', 'Título', 'Correctas', 'Total', '%', 'Duración', 'ID intento'],
    widths: [135, 180, 90, 110, 230, 80, 60, 70, 80, 110],
  },
  answers: {
    name: 'Respuestas',
    headers: ['Fecha', 'Alumno', 'Curso', 'Ejercicio', 'N°', 'Pregunta', 'Respuesta del alumno', 'Respuesta correcta', '¿Correcta?', 'ID intento'],
    widths: [135, 180, 90, 110, 45, 380, 230, 230, 85, 110],
  },
  recordings: {
    name: 'Grabaciones',
    headers: ['Fecha', 'Alumno', 'Curso', 'Frase', 'Audio', 'Duración (s)', 'ID'],
    widths: [135, 180, 90, 340, 110, 95, 110],
  },
};
const SUMMARY = 'Resumen';
const MATRIX = 'Alumno × Ejercicio';

const AUDIO_TYPES = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
};

// ─── Instalación ────────────────────────────────────────────────────────────

/** Crea (o repara) todas las hojas. Se puede ejecutar las veces que quieras: no borra datos. */
function setup() {
  const ss = getSpreadsheet_();
  ensureSheet_(ss, SHEETS.results);
  ensureSheet_(ss, SHEETS.answers);
  ensureSheet_(ss, SHEETS.recordings);
  ensureMatrix_(ss);
  ensureSummary_(ss);
  removeEmptyDefaultSheets_(ss);
  Logger.log('Planilla lista: ' + ss.getUrl());
  return ss.getUrl();
}

/** Menú “Connected Speech” dentro de la planilla. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Connected Speech')
    .addItem('Preparar / reparar hojas', 'setup')
    .addItem('Cómo conectar la app', 'showHelp')
    .addToUi();
}

function showHelp() {
  const url = ScriptApp.getService().getUrl();
  const body = url
    ? '<p>URL de la aplicación web (pegala en la app: <b>Settings → Results → Google Sheets</b>):</p>' +
      '<input style="width:100%;padding:6px" readonly onclick="this.select()" value="' + url + '">'
    : '<p>Todavía no implementaste la aplicación web.</p><p>Implementar → Nueva implementación → Aplicación web<br>' +
      'Ejecutar como: <b>Yo</b> · Quién tiene acceso: <b>Cualquier persona</b>.</p>';
  const html = HtmlService.createHtmlOutput('<div style="font:14px/1.5 sans-serif">' + body + '</div>')
    .setWidth(480)
    .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(html, APP_NAME);
}

// ─── Aplicación web ─────────────────────────────────────────────────────────

/** La app usa esto para “Test connection”. */
function doGet() {
  const ss = getSpreadsheet_();
  return json_({ ok: true, app: APP_NAME, sheet: ss.getName() });
}

/** La app envía acá los resultados y las grabaciones. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return json_({ ok: false, error: 'La planilla está ocupada, probá de nuevo.' });
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.type === 'result') return json_(saveResult_(data));
    if (data.type === 'recording') return json_(saveRecording_(data));
    if (data.type === 'ping') return json_({ ok: true });
    return json_({ ok: false, error: 'Tipo de dato desconocido.' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  } finally {
    lock.releaseLock();
  }
}

function saveResult_(d) {
  const ss = getSpreadsheet_();
  const results = sheet_(ss, SHEETS.results);
  const id = cleanId_(d.id);
  if (exists_(results, 10, id)) return { ok: true, duplicate: true };

  const when = date_(d.finishedAt);
  const student = clean_(d.student, 80) || '(sin nombre)';
  const group = clean_(d.group, 40);
  const setId = clean_(d.setId, 60);
  const total = num_(d.total);
  const correct = num_(d.correct);

  results.appendRow([
    when,
    student,
    group,
    setId,
    clean_(d.setTitle, 120),
    correct,
    total,
    total ? correct / total : 0,
    num_(d.durationSec) / 86400, // formato [m]:ss
    id,
  ]);

  const items = Array.isArray(d.items) ? d.items.slice(0, MAX_ITEMS) : [];
  if (items.length) {
    const answers = sheet_(ss, SHEETS.answers);
    const rows = items.map(function (it, i) {
      it = it || {};
      return [
        when,
        student,
        group,
        setId,
        num_(it.n) || i + 1,
        clean_(it.prompt),
        clean_(it.answer),
        clean_(it.expected),
        it.correct === true,
        id,
      ];
    });
    answers.getRange(answers.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  return { ok: true, saved: items.length };
}

function saveRecording_(d) {
  const ss = getSpreadsheet_();
  const sheet = sheet_(ss, SHEETS.recordings);
  const id = cleanId_(d.id);
  if (exists_(sheet, 7, id)) return { ok: true, duplicate: true };

  const mime = String(d.mimeType || '').split(';')[0].trim().toLowerCase();
  const ext = AUDIO_TYPES[mime];
  if (!ext) throw new Error('Formato de audio no admitido: ' + mime);
  const audio = String(d.audio || '');
  if (!audio) throw new Error('Falta el audio.');
  if (audio.length > MAX_AUDIO_BASE64) throw new Error('La grabación es demasiado larga.');

  const when = date_(d.recordedAt);
  const student = clean_(d.student, 80) || '(sin nombre)';
  const group = clean_(d.group, 40);
  const phrase = clean_(d.text, 300);
  const stamp = Utilities.formatDate(when, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH.mm');
  const fileName = stamp + ' · ' + student.replace(/^'/, '') + ' · ' + phrase.replace(/^'/, '').slice(0, 40) + '.' + ext;
  const blob = Utilities.newBlob(Utilities.base64Decode(audio), mime, fileName);
  const file = recordingsFolder_().createFile(blob);

  sheet.appendRow([
    when,
    student,
    group,
    phrase,
    '=HYPERLINK("' + file.getUrl() + '","▶ Escuchar")',
    num_(d.durationSec),
    id,
  ]);
  return { ok: true };
}

// ─── Hojas ──────────────────────────────────────────────────────────────────

function getSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  // Script independiente (no creado desde una planilla): usa/crea su propia planilla.
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create(APP_NAME + ' — Resultados');
  props.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function sheet_(ss, def) {
  return ss.getSheetByName(def.name) || ensureSheet_(ss, def);
}

function ensureSheet_(ss, def) {
  const sheet = ss.getSheetByName(def.name) || ss.insertSheet(def.name);
  sheet
    .getRange(1, 1, 1, def.headers.length)
    .setValues([def.headers])
    .setFontWeight('bold')
    .setBackground(HEADER_BG)
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  def.widths.forEach(function (w, i) {
    sheet.setColumnWidth(i + 1, w);
  });
  sheet.getRange('A2:A').setNumberFormat('dd/mm/yyyy hh:mm');

  if (def === SHEETS.results) {
    sheet.getRange('H2:H').setNumberFormat('0%');
    sheet.getRange('I2:I').setNumberFormat('[m]:ss');
    if (!sheet.getConditionalFormatRules().length) {
      sheet.setConditionalFormatRules([percentScale_(sheet.getRange('H2:H'))]);
    }
  }
  if (def === SHEETS.answers) {
    sheet.getRange('I2:I').setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
    if (!sheet.getConditionalFormatRules().length) {
      sheet.setConditionalFormatRules([
        SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied('=AND($J2<>"",$I2=FALSE)')
          .setBackground('#fde2e1')
          .setRanges([sheet.getRange('A2:J')])
          .build(),
      ]);
    }
  }
  return sheet;
}

function ensureSummary_(ss) {
  const sheet = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY, 0);
  sheet.getRange('A1').setValue('Promedio por alumno').setFontWeight('bold').setFontSize(13);
  sheet
    .getRange('A2')
    .setFormula(
      '=IFERROR(QUERY(Resultados!A:J,"select B, C, count(J), avg(H), max(H), max(A) where G is not null ' +
        "group by B, C order by B label count(J) 'Intentos', avg(H) 'Promedio', max(H) 'Mejor', max(A) 'Último' " +
        "format avg(H) '0%', max(H) '0%', max(A) 'dd/MM/yyyy'\",1),\"Todavía no hay resultados.\")",
    );
  sheet.getRange('I1').setValue('Promedio por ejercicio').setFontWeight('bold').setFontSize(13);
  sheet
    .getRange('I2')
    .setFormula(
      '=IFERROR(QUERY(Resultados!A:J,"select E, count(J), avg(H), min(H), max(H) where G is not null ' +
        "group by E order by E label count(J) 'Intentos', avg(H) 'Promedio', min(H) 'Peor', max(H) 'Mejor' " +
        "format avg(H) '0%', min(H) '0%', max(H) '0%'\",1),\"\")",
    );
  sheet.getRange('A2:N2').setFontWeight('bold');
  sheet.setFrozenRows(2);
  [180, 90, 75, 85, 75, 95, 30, 30, 230, 75, 85, 75, 75].forEach(function (w, i) {
    sheet.setColumnWidth(i + 1, w);
  });
  if (!sheet.getConditionalFormatRules().length) {
    sheet.setConditionalFormatRules([percentScale_(sheet.getRange('D3:E')), percentScale_(sheet.getRange('K3:M'))]);
  }
  return sheet;
}

function ensureMatrix_(ss) {
  const sheet = ss.getSheetByName(MATRIX) || ss.insertSheet(MATRIX);
  sheet
    .getRange('A1')
    .setFormula(
      '=IFERROR(QUERY(Resultados!A:J,"select B, max(H) where G is not null group by B pivot E",1),' +
        '"Acá aparece la mejor nota de cada alumno en cada ejercicio.")',
    );
  sheet.getRange('A1:Z1').setFontWeight('bold').setWrap(true);
  sheet.getRange('B2:Z').setNumberFormat('0%');
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  sheet.setColumnWidth(1, 180);
  if (!sheet.getConditionalFormatRules().length) {
    sheet.setConditionalFormatRules([percentScale_(sheet.getRange('B2:Z'))]);
  }
  return sheet;
}

function removeEmptyDefaultSheets_(ss) {
  ss.getSheets().forEach(function (sheet) {
    const name = sheet.getName();
    if (/^(Sheet|Hoja|Página|Folha)\s?1$/i.test(name) && sheet.getLastRow() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet);
    }
  });
}

function percentScale_(range) {
  return SpreadsheetApp.newConditionalFormatRule()
    .setGradientMinpointWithValue('#f4c7c3', SpreadsheetApp.InterpolationType.NUMBER, '0')
    .setGradientMidpointWithValue('#fce8b2', SpreadsheetApp.InterpolationType.NUMBER, '0.6')
    .setGradientMaxpointWithValue('#b7e1cd', SpreadsheetApp.InterpolationType.NUMBER, '1')
    .setRanges([range])
    .build();
}

function recordingsFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) {
    try {
      return DriveApp.getFolderById(id);
    } catch (err) {
      // la carpeta se borró: se crea otra
    }
  }
  const folder = DriveApp.createFolder(APP_NAME + ' — Grabaciones');
  props.setProperty('FOLDER_ID', folder.getId());
  return folder;
}

// ─── Utilidades ─────────────────────────────────────────────────────────────

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Texto seguro para una celda: recortado y sin fórmulas (=, +, -, @ al principio). */
function clean_(value, max) {
  const s = String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max || MAX_TEXT);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function cleanId_(value) {
  const id = String(value || '').replace(/[^\w-]/g, '').slice(0, 64);
  if (!id) throw new Error('Falta el ID.');
  return id;
}

function num_(value) {
  const n = Number(value);
  return isFinite(n) ? Math.max(0, Math.round(n * 100) / 100) : 0;
}

function date_(value) {
  const d = value ? new Date(value) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

function exists_(sheet, column, id) {
  const last = sheet.getLastRow();
  if (last < 2) return false;
  return Boolean(sheet.getRange(2, column, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext());
}
