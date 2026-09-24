// ── Connected Speech Lab · parte 2 de 6 ──
function setElevenLabsKey() {
  const ui = SpreadsheetApp.getUi(); // solo desde la planilla; si no: ⚙ Configuración del proyecto → Propiedades del script
  const answer = ui.prompt(
    'API key de ElevenLabs',
    'Pegá tu API key (empieza con sk_). Queda guardada solo en este script: los alumnos no la ven.',
    ui.ButtonSet.OK_CANCEL,
  );
  if (answer.getSelectedButton() !== ui.Button.OK) return;
  const key = answer.getResponseText().trim();
  if (!key) return;
  PropertiesService.getScriptProperties().setProperty('ELEVENLABS_API_KEY', key);
  CacheService.getScriptCache().remove('voices_v1');
  try {
    const list = voices_().voices;
    ui.alert('✓ Conectado a ElevenLabs: ' + list.length + ' voces disponibles.');
  } catch (err) {
    ui.alert('La key se guardó, pero ElevenLabs respondió: ' + err.message);
  }
}

function showElevenLabsStatus() {
  const ui = SpreadsheetApp.getUi();
  const u = usage_();
  let msg = 'Hoy se generaron ' + u.today + ' de ' + u.limit + ' caracteres nuevos (el audio repetido no cuenta).';
  try {
    const res = UrlFetchApp.fetch(TTS.api + '/user/subscription', {
      headers: { 'xi-api-key': elevenKey_() },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() === 200) {
      const sub = JSON.parse(res.getContentText());
      msg += '\n\nPlan ' + sub.tier + ': ' + sub.character_count + ' de ' + sub.character_limit + ' créditos usados este mes.';
    }
  } catch (err) {
    msg += '\n\n' + err.message;
  }
  ui.alert('ElevenLabs', msg, ui.ButtonSet.OK);
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
  return json_({ ok: true, app: APP_NAME, sheet: ss.getName(), tts: Boolean(elevenKeyOrNull_()), version: 2 });
}

/** La app envía acá los resultados, las grabaciones y los pedidos de voz. */
function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.type === 'tts') return json_(tts_(data));
    if (data.type === 'voices') return json_(voices_());
    if (data.type === 'result') return json_(withLock_(function () { return saveResult_(data); }));
    if (data.type === 'recording') return json_(withLock_(function () { return saveRecording_(data); }));
    if (data.type === 'ping') return json_({ ok: true });
    return json_({ ok: false, error: 'Tipo de dato desconocido.' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('La planilla está ocupada, probá de nuevo.');
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

// ─── Motor de voz (ElevenLabs) ──────────────────────────────────────────────

/** Texto que se envía a ElevenLabs para cada modo (igual que ttsTextFor en la app). */
function ttsText_(text, mode, model) {
  if (mode !== 'words') return text;
  const joiner = model.indexOf('eleven_v3') === 0 ? ' ... ' : ' <break time="0.35s"/> ';
  return text.split(/\s+/).filter(Boolean).join(joiner);
}

function ttsBody_(text, mode, model) {
  return {
    text: ttsText_(text, mode, model),
    model_id: model,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true,
      speed: TTS.speeds[mode],
    },
  };
}
// ── fin de la parte 2 de 6 ──
