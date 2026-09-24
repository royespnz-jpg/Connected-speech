#!/usr/bin/env node
// Splits google-apps-script/Code.gs into short files (google-apps-script/partes/)
// for editors where pasting 600 lines at once doesn't work. Apps Script shares
// one global scope across files, so the parts behave exactly like Code.gs.
//
//   node scripts/split-gs.mjs      (run after editing Code.gs; npm test checks it)

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'google-apps-script', 'Code.gs');
const OUT = join(ROOT, 'google-apps-script', 'partes');
const MAX_LINES = 100;

export function splitCode(code, maxLines = MAX_LINES) {
  const lines = code.split('\n');
  // A part may start where a top-level declaration or comment follows a blank line.
  const isBoundary = (i) => i > 0 && lines[i - 1] === '' && /^(function |const |\/\*\*|\/\/)/.test(lines[i]);
  const parts = [];
  let start = 0;
  for (let i = 1; i < lines.length; i++) {
    if (i - start >= maxLines && isBoundary(i)) {
      parts.push(lines.slice(start, i).join('\n'));
      start = i;
    }
  }
  parts.push(lines.slice(start).join('\n'));
  return parts;
}

// First and last lines let the teacher check that nothing was cut off when pasting.
export function withMarkers(part, n, total) {
  const body = part.replace(/\n+$/, '');
  return `// ── Connected Speech Lab · parte ${n} de ${total} ──\n${body}\n// ── fin de la parte ${n} de ${total} ──\n`;
}

export function stripMarkers(text) {
  return text.replace(/^\/\/ ── Connected Speech Lab · parte \d+ de \d+ ──\n/, '').replace(/\n\/\/ ── fin de la parte \d+ de \d+ ──\n$/, '');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const parts = splitCode(readFileSync(SRC, 'utf8'));
  mkdirSync(OUT, { recursive: true });
  for (const f of readdirSync(OUT)) if (f.endsWith('.gs')) rmSync(join(OUT, f));
  parts.forEach((p, i) => {
    const name = `parte-${i + 1}.gs`;
    writeFileSync(join(OUT, name), withMarkers(p, i + 1, parts.length));
    console.log(`${name}: ${p.split('\n').length} lines`);
  });
}
