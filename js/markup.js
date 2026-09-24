// Tiny markup used by every example in the app.
//
//   _      a link between two words (shown as ‿, spoken as a space)
//   [y]    an inserted sound that is not spelled (shown, not spoken as text)
//   (t)    letters that are not pronounced (shown faded, still passed to TTS)
//   *ss*   the letters whose sound changes (highlighted)
//
// Example: "hi*d*(e)_*y*our"  →  hide‿your with d/y highlighted and a silent e.

export function parseMarkup(src) {
  const out = [];
  let buf = '';
  const flush = () => {
    if (buf) out.push({ t: 'text', v: buf });
    buf = '';
  };
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '_') {
      flush();
      out.push({ t: 'link' });
      continue;
    }
    const close = c === '[' ? ']' : c === '(' ? ')' : c === '*' ? '*' : null;
    if (close) {
      const j = src.indexOf(close, i + 1);
      if (j > i) {
        flush();
        out.push({ t: c === '[' ? 'ins' : c === '(' ? 'del' : 'hl', v: src.slice(i + 1, j) });
        i = j;
        continue;
      }
    }
    buf += c;
  }
  flush();
  return out;
}

// The plain text a TTS engine should read for a marked-up example.
export function spokenText(src) {
  return parseMarkup(src)
    .map((p) => (p.t === 'link' ? ' ' : p.t === 'ins' ? '' : p.v))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Links become drawn arcs; --k staggers their animation.
export function renderMarkup(src) {
  let k = 0;
  return parseMarkup(src)
    .map((p) => {
      switch (p.t) {
        case 'link':
          return `<span class="lk" style="--k:${k++}" aria-hidden="true"></span><span class="sr-only"> </span>`;
        case 'ins':
          return `<span class="ins" title="inserted sound">${escapeHtml(p.v)}</span>`;
        case 'del':
          return `<span class="del" title="not pronounced">${escapeHtml(p.v)}</span>`;
        case 'hl':
          return `<b class="hl">${escapeHtml(p.v)}</b>`;
        default:
          return escapeHtml(p.v);
      }
    })
    .join('');
}
