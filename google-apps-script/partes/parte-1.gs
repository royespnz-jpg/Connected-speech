// ── Connected Speech Lab · parte 1 de 6 ──
/**
 * Connected Speech Lab — Resultados en Google Sheets
 * ==================================================
 * Guarda en una planilla de Google:
 *   • Resultados   → una fila por ejercicio terminado (alumno, curso, puntaje, %, duración)
 *   • Respuestas   → una fila por cada respuesta (qué contestó y cuál era la correcta)
 *   • Grabaciones  → las grabaciones que los alumnos envían (el audio queda en tu Google Drive)
 *   • Resumen y Alumno × Ejercicio → promedios y mejores notas, se actualizan solos
 * Y además es el “motor de voz”: genera el audio con ElevenLabs para la página, sin que tu
 * API key quede a la vista. Cada frase generada se guarda en tu Drive y no se vuelve a pagar.
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
 *  6. Voces de ElevenLabs: en la planilla, menú Connected Speech → “Guardar API key de ElevenLabs”
 *     (o en Apps Script: ⚙ Configuración del proyecto → Propiedades del script →
 *     ELEVENLABS_API_KEY). Por seguridad hay un límite diario de caracteres nuevos
 *     (ELEVENLABS_DAILY_LIMIT, 20000 por defecto); el audio ya generado no cuenta.
 *
 * Si más adelante cambiás este código: Implementar → Administrar implementaciones → ✏ →
 * Versión: “Nueva versión” → Implementar. La URL sigue siendo la misma.
 */

const APP_NAME = 'Connected Speech Lab';
// Si el script NO está dentro de la planilla (proyecto independiente), poné acá el ID de la
// planilla donde guardar los resultados (lo que va entre /d/ y /edit en su URL).
// Vacío = usa la planilla que contiene el script, o crea una nueva.
const SPREADSHEET_ID = '';
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
// Tiene que coincidir con js/audio-core.js (los tests lo verifican).
const TTS = {
  api: 'https://api.elevenlabs.io/v1',
  outputFormat: 'mp3_44100_64',
  defaultModel: 'eleven_multilingual_v2',
  models: ['eleven_multilingual_v2', 'eleven_flash_v2_5', 'eleven_turbo_v2_5', 'eleven_v3'],
  speeds: { natural: 1, slow: 0.8, words: 0.95 },
  maxChars: 400,
  dailyLimit: 20000,
  cacheSeconds: 21600, // 6 h (máximo de CacheService)
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
    .addSeparator()
    .addItem('Guardar API key de ElevenLabs', 'setElevenLabsKey')
    .addItem('Estado de ElevenLabs', 'showElevenLabsStatus')
    .addToUi();
}
// ── fin de la parte 1 de 6 ──
