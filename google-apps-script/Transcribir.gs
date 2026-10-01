// ── Connected Speech Lab · transcribir los audios del libro ──
//
// Archivo aparte: en el editor de Apps Script tocá ＋ → «Secuencia de comandos»,
// llamalo Transcribir y pegá esto. Guardá, elegí la función
// transcribirAudiosDelLibro en la barra de arriba y dale ▷ Ejecutar.
//
// Recorre la carpeta de la Sesión VI (con sus subcarpetas) y anota cada archivo
// en la hoja «Audios del libro»: carpeta, nombre e ID. Los audios los transcribe
// con ElevenLabs (Speech to Text), con la misma API key del motor de voz, y
// separa lo que dice cada hablante. Así se pueden revisar las respuestas de los
// ejercicios contra la grabación original.
//
// Si son muchos audios se detiene antes del límite de 6 minutos de Google:
// ejecutala otra vez y sigue con los que faltan (los ya transcritos no se repiten).

const BOOK_FOLDER_ID = '1bFq4J8WiF2lUoS1XESYBe-KvZH9KliyW'; // «Session VI Connected Speech»
const BOOK_SHEET = 'Audios del libro';
const BOOK_HEADERS = ['Carpeta', 'Archivo', 'ID', 'Tipo', 'KB', 'Transcripción', 'Por hablante', 'Estado', 'Fecha'];
const BOOK_COL = { id: 3, text: 6, status: 8 };
const BOOK_TIME_BUDGET_MS = 4.5 * 60 * 1000;

function transcribirAudiosDelLibro() {
  const started = Date.now();
  const sheet = bookSheet_();

  // What earlier runs already transcribed, by file ID.
  const previous = {};
  if (sheet.getLastRow() > 1) {
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, BOOK_HEADERS.length)
      .getValues()
      .forEach((row) => {
        if (row[BOOK_COL.id - 1]) previous[row[BOOK_COL.id - 1]] = row;
      });
  }

  const files = [];
  listBookFolder_(DriveApp.getFolderById(BOOK_FOLDER_ID), '', files);
  files.sort((a, b) => (a.path + '/' + a.name).localeCompare(b.path + '/' + b.name, 'en', { numeric: true }));

  // First the full list, keeping earlier transcripts, so nothing is lost if Google stops the run.
  const rows = files.map((f) => {
    const old = previous[f.id];
    if (old && old[BOOK_COL.status - 1] === 'ok') return [f.path, f.name, f.id, f.type, f.kb, old[5], old[6], 'ok', old[8]];
    return [f.path, f.name, f.id, f.type, f.kb, '', '', isBookAudio_(f) ? 'pendiente' : 'no es audio', ''];
  });
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, BOOK_HEADERS.length).clearContent();
  if (rows.length) sheet.getRange(2, 1, rows.length, BOOK_HEADERS.length).setValues(rows);

  let made = 0;
  let left = 0;
  let failed = 0;
  rows.forEach((row, i) => {
    if (row[BOOK_COL.status - 1] !== 'pendiente') return;
    if (Date.now() - started > BOOK_TIME_BUDGET_MS) {
      left++;
      return;
    }
    let out;
    try {
      const res = speechToText_(DriveApp.getFileById(row[BOOK_COL.id - 1]).getBlob());
      out = [String(res.text || '').trim(), bySpeaker_(res.words || []), 'ok', new Date()];
      made++;
    } catch (err) {
      out = ['', '', 'error: ' + err.message, new Date()];
      failed++;
    }
    sheet.getRange(i + 2, BOOK_COL.text, 1, 4).setValues([out]);
  });

  const msg =
    files.length + ' archivos · ' + made + ' audios transcritos ahora' +
    (failed ? ' · ' + failed + ' con error' : '') +
    (left ? ' · faltan ' + left + ': ejecutá la función otra vez' : ' · listo');
  Logger.log(msg);
  return msg;
}

function bookSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(BOOK_SHEET);
  if (!sheet) sheet = ss.insertSheet(BOOK_SHEET);
  sheet.getRange(1, 1, 1, BOOK_HEADERS.length).setValues([BOOK_HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function listBookFolder_(folder, path, out) {
  const here = path ? path + '/' + folder.getName() : folder.getName();
  const files = folder.getFiles();
  while (files.hasNext()) {
    let file = files.next();
    // A shortcut points at the real file somewhere else.
    if (file.getMimeType() === 'application/vnd.google-apps.shortcut') {
      try {
        file = DriveApp.getFileById(file.getTargetId());
      } catch (err) {
        continue;
      }
    }
    out.push({ path: here, name: file.getName(), id: file.getId(), type: file.getMimeType(), kb: Math.round(file.getSize() / 1024) });
  }
  const folders = folder.getFolders();
  while (folders.hasNext()) listBookFolder_(folders.next(), here, out);
}

function isBookAudio_(f) {
  return /^(audio|video)\//.test(f.type) || /\.(mp3|m4a|wav|ogg|oga|aac|wma|flac|mp4)$/i.test(f.name);
}

function speechToText_(blob) {
  const res = UrlFetchApp.fetch(TTS.api + '/speech-to-text', {
    method: 'post',
    headers: { 'xi-api-key': elevenKey_() },
    payload: { model_id: 'scribe_v1', file: blob, language_code: 'en', diarize: 'true', tag_audio_events: 'false' },
    muteHttpExceptions: true,
  });
  const body = res.getContentText();
  if (res.getResponseCode() !== 200) throw new Error('ElevenLabs ' + res.getResponseCode() + ': ' + body.slice(0, 300));
  return JSON.parse(body);
}

// "S1: Hi, Ann! / S2: Hi, how are you?" — one line per change of speaker.
function bySpeaker_(words) {
  const lines = [];
  let speaker = null;
  words.forEach((w) => {
    if (w.type === 'audio_event') return;
    if (w.type === 'word' && w.speaker_id !== speaker) {
      speaker = w.speaker_id;
      lines.push({ who: 'S' + (Number(String(speaker).replace(/\D/g, '')) + 1 || 1), text: '' });
    }
    if (lines.length) lines[lines.length - 1].text += w.text;
  });
  return lines
    .map((l) => l.who + ': ' + l.text.replace(/\s+/g, ' ').trim())
    .join('\n')
    .slice(0, 45000);
}
// ── fin del archivo Transcribir ──
