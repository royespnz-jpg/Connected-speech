// ── Connected Speech Lab · audios del libro ──
//
// Archivo aparte: en el editor de Apps Script tocá ＋ → «Secuencia de comandos»,
// llamalo AudiosLibro y pegá esto. Necesita la parte 2 nueva (que lo llama) y
// una versión nueva de la implementación.
//
// La app pide aquí las grabaciones del libro: Google no deja que otras páginas
// reproduzcan los enlaces de descarga de Drive. Solo se entregan audios que
// estén en estas carpetas de la Sesión VI, nunca otros archivos de tu Drive.
const BOOK_FOLDERS = [
  '1bFq4J8WiF2lUoS1XESYBe-KvZH9KliyW', // Session VI Connected Speech
  '1MNGqRK2MlYMmxsxBdvIBPV2q91E-Nzka', // 2 PRONUNCIATION PLUS
  '1ghh6VixaK-d6eu6napGlXmKOGBwxNkBg', // 3 PRONUNCIATION PAIRS
];

function bookAudio_(data) {
  const id = String(data.id || '');
  if (!/^[\w-]{20,}$/.test(id)) throw new Error('ID de archivo inválido.');
  const file = DriveApp.getFileById(id);
  if (!inBookFolder_(file.getParents(), 0)) throw new Error('Ese archivo no es un audio de la Sesión VI.');
  const blob = file.getBlob();
  const mime = blob.getContentType();
  if (!/^audio\//.test(mime)) throw new Error('Ese archivo no es un audio.');
  return { ok: true, audio: Utilities.base64Encode(blob.getBytes()), mime: mime };
}

// En alguna de las carpetas, o en una subcarpeta suya.
function inBookFolder_(folders, depth) {
  while (folders.hasNext()) {
    const folder = folders.next();
    if (BOOK_FOLDERS.indexOf(folder.getId()) >= 0) return true;
    if (depth < 5 && inBookFolder_(folder.getParents(), depth + 1)) return true;
  }
  return false;
}
// ── fin del archivo AudiosLibro ──
