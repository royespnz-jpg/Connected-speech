#!/usr/bin/env node
// Pre-generates every example clip with ElevenLabs into audio/ and writes
// audio/manifest.json. Existing clips are skipped, so re-runs only pay for new
// or changed examples.
//
//   ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs [options]
//
//   --dry-run            show what would be generated and the credit estimate
//   --modes=a,b          natural, slow, words (default: all three)
//   --limit=N            generate at most N clips this run
//   --force              regenerate clips that already exist
//   --prune              delete clips that no example uses any more
//   --list-voices        print the voices on your account and exit
//
// Env (or a .env file): ELEVENLABS_API_KEY, ELEVENLABS_VOICE_A, ELEVENLABS_VOICE_B, ELEVENLABS_MODEL

import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectAudioItems } from '../js/audio-items.js';
import { API_BASE, DEFAULT_MODEL, DEFAULT_VOICES, ttsRequestBody, ttsTextFor, ttsUrl } from '../js/audio-core.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = join(ROOT, 'audio');
const MANIFEST = join(AUDIO_DIR, 'manifest.json');

// ─── config ─────────────────────────────────────────────────────────────────

function loadDotEnv() {
  const file = join(ROOT, '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
loadDotEnv();

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

const apiKey = process.env.ELEVENLABS_API_KEY;
const model = process.env.ELEVENLABS_MODEL || DEFAULT_MODEL;
const voices = {
  A: process.env.ELEVENLABS_VOICE_A || DEFAULT_VOICES.A,
  B: process.env.ELEVENLABS_VOICE_B || DEFAULT_VOICES.B,
};
const modes = String(args.modes || 'natural,slow,words')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const limit = args.limit ? Number(args.limit) : Infinity;
const CONCURRENCY = 2;
const CREDITS_PER_CHAR = /flash|turbo/.test(model) ? 0.5 : 1;

// ─── helpers ────────────────────────────────────────────────────────────────

function readManifest() {
  try {
    return JSON.parse(readFileSync(MANIFEST, 'utf8'));
  } catch {
    return { items: {} };
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function synthesize(item) {
  const voiceId = voices[item.voice] || voices.A;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(ttsUrl(voiceId), {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(ttsRequestBody(item.text, item.mode, model)),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const body = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      const wait = 2000 * 2 ** (attempt - 1);
      console.warn(`  ${res.status} — retrying in ${wait / 1000}s`);
      await sleep(wait);
      continue;
    }
    throw new Error(`ElevenLabs ${res.status}: ${body.slice(0, 300)}`);
  }
}

async function listVoices() {
  const res = await fetch(`${API_BASE}/voices`, { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const { voices: list } = await res.json();
  for (const v of list) {
    console.log(`${v.voice_id}  ${v.name.padEnd(28)} ${(v.labels?.accent || '').padEnd(14)} ${v.labels?.gender || ''}  [${v.category}]`);
  }
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  if (args['list-voices']) {
    if (!apiKey) throw new Error('Set ELEVENLABS_API_KEY first.');
    return listVoices();
  }

  const all = collectAudioItems();
  const wanted = all.filter((it) => modes.includes(it.mode));
  const manifest = readManifest();
  const sameVoice = manifest.model === model && manifest.voices?.A === voices.A && manifest.voices?.B === voices.B;
  if (manifest.model && !sameVoice && !args.force) {
    console.warn(
      `Note: existing clips were made with ${manifest.model} / ${JSON.stringify(manifest.voices)}.\n` +
        '      New clips will use the current settings. Use --force to regenerate everything.',
    );
  }

  const exists = (it) => existsSync(join(AUDIO_DIR, `${it.key}.mp3`));
  const todo = wanted.filter((it) => args.force || !exists(it)).slice(0, limit);
  const chars = todo.reduce((n, it) => n + ttsTextFor(it.text, it.mode, model).length, 0);

  const byMode = {};
  for (const it of todo) byMode[it.mode] = (byMode[it.mode] || 0) + 1;
  console.log(`Model ${model} · voices A=${voices.A} B=${voices.B}`);
  console.log(`${all.length} clips in the app · ${wanted.length} in modes [${modes.join(', ')}] · ${todo.length} to generate`);
  console.log(`By mode: ${JSON.stringify(byMode)}`);
  console.log(`≈ ${chars.toLocaleString()} characters ≈ ${Math.ceil(chars * CREDITS_PER_CHAR).toLocaleString()} credits`);

  if (args['dry-run']) return;
  if (todo.length && !apiKey) throw new Error('Set ELEVENLABS_API_KEY (environment or .env) to generate audio.');

  mkdirSync(AUDIO_DIR, { recursive: true });
  let done = 0;
  let failed = 0;
  const queue = [...todo];
  async function worker() {
    while (queue.length) {
      const it = queue.shift();
      try {
        const mp3 = await synthesize(it);
        writeFileSync(join(AUDIO_DIR, `${it.key}.mp3`), mp3);
        done++;
        console.log(`[${done + failed}/${todo.length}] ${it.mode.padEnd(7)} ${it.voice} ${it.text.slice(0, 70)}`);
      } catch (err) {
        failed++;
        console.error(`✗ ${it.text.slice(0, 60)} — ${err.message}`);
        if (/401|quota|credits/i.test(err.message)) queue.length = 0; // no point continuing
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Manifest lists every clip that exists on disk and is still used.
  const items = {};
  for (const it of all) if (exists(it)) items[it.key] = `audio/${it.key}.mp3`;
  writeFileSync(
    MANIFEST,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), model, voices, count: Object.keys(items).length, items }, null, 1)}\n`,
  );

  if (args.prune) {
    const used = new Set(all.map((it) => `${it.key}.mp3`));
    for (const f of readdirSync(AUDIO_DIR)) {
      if (f.endsWith('.mp3') && !used.has(f)) {
        unlinkSync(join(AUDIO_DIR, f));
        console.log(`pruned ${f}`);
      }
    }
  }

  console.log(`Done: ${done} generated, ${failed} failed, ${Object.keys(items).length} clips in manifest.`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
