// Record yourself, then compare with the model (shadowing).
import { play, stop } from './tts.js';
import { icons, toast } from './ui.js';

const MAX_MS = 12000;
let active = null; // { button, recorder, stream, timer }
const recordings = new WeakMap(); // container element → object URL

export async function toggleRecording(button) {
  if (active && active.button === button) return finish();
  if (active) finish();
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    toast('Recording is not supported in this browser.');
    return;
  }
  stop();
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    toast('Microphone permission was denied.');
    return;
  }
  const chunks = [];
  const recorder = new MediaRecorder(stream);
  recorder.addEventListener('dataavailable', (e) => e.data.size && chunks.push(e.data));
  recorder.addEventListener('stop', () => {
    stream.getTracks().forEach((t) => t.stop());
    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
    showResult(button, URL.createObjectURL(blob));
  });
  recorder.start();
  button.classList.add('is-recording');
  button.querySelector('span')?.replaceChildren('Stop');
  active = { button, recorder, stream, timer: setTimeout(finish, MAX_MS) };
}

function finish() {
  if (!active) return;
  const { button, recorder, timer } = active;
  clearTimeout(timer);
  active = null;
  button.classList.remove('is-recording');
  button.querySelector('span')?.replaceChildren('Record');
  if (recorder.state !== 'inactive') recorder.stop();
}

function showResult(button, url) {
  const host = button.closest('.ex, .rec-host');
  const out = host?.querySelector('.rec-out');
  if (!out) return;
  const old = recordings.get(host);
  if (old) URL.revokeObjectURL(old);
  recordings.set(host, url);
  out.hidden = false;
  out.innerHTML = `<span>Your recording:</span>
    <button type="button" class="pbtn" data-play-mine>${icons.play}<span>You</span></button>
    <button type="button" class="pbtn" data-compare>${icons.play}<span>Model → You</span></button>`;
}

function playMine(host) {
  const url = recordings.get(host);
  if (!url) return Promise.resolve();
  stop();
  return new Promise((resolve) => {
    const a = new Audio(url);
    a.addEventListener('ended', resolve);
    a.addEventListener('error', resolve);
    a.play().catch(resolve);
  });
}

export function handleRecorderClick(target) {
  const host = target.closest('.ex, .rec-host');
  if (target.closest('[data-play-mine]')) {
    playMine(host);
    return true;
  }
  if (target.closest('[data-compare]')) {
    const text = host.querySelector('[data-rec]')?.dataset.text;
    if (text) play(text).then(() => playMine(host));
    return true;
  }
  const rec = target.closest('[data-rec]');
  if (rec) {
    toggleRecording(rec);
    return true;
  }
  return false;
}
