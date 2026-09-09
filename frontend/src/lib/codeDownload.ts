/**
 * Save a component's authored test/example code to a real file the student can
 * drop straight into their editor — an Arduino `.ino` opens in the Arduino IDE,
 * a Python snippet as `.py`, and so on. Purely client-side (Blob + anchor), so
 * it works offline exactly like the icon downloads.
 *
 * The catalogue stores a human-friendly language LABEL (e.g. "Arduino C++",
 * "MicroPython", "Node-RED / config"); this module maps that label to a sensible
 * file extension so the saved file lands with the extension the relevant tool
 * expects. Anything unrecognised falls back to `.txt`, which is always safe.
 */

/** Map a catalogue `code.lang` label to a file extension (no leading dot). */
export function extForLang(lang: string): string {
  const key = lang.trim().toLowerCase();
  // Ordered so more specific labels win before generic substring checks.
  if (key.includes('arduino')) return 'ino';
  if (key.includes('micropython')) return 'py';
  if (key.includes('python')) return 'py';
  if (key.includes('typescript')) return 'ts';
  if (key.includes('javascript')) return 'js';
  if (key === 'jsx') return 'jsx';
  if (key.includes('kotlin')) return 'kt';
  if (key.includes('dart')) return 'dart';
  if (key.includes('java')) return 'java';
  if (key === 'c#' || key.includes('csharp')) return 'cs';
  if (key === 'c++' || key.includes('cpp')) return 'cpp';
  if (key === 'c') return 'c';
  if (key.includes('php')) return 'php';
  if (key === 'vue') return 'vue';
  if (key === 'html') return 'html';
  if (key.includes('matlab')) return 'm';
  if (key.includes('sql')) return 'sql';
  if (key.includes('bash') || key.includes('shell')) return 'sh';
  if (key.includes('dockerfile')) return 'dockerfile';
  if (key.includes('ini') || key.includes('config') || key.includes('.env')) return 'ini';
  if (key.includes('json') || key.includes('node-red') || key.includes('workflow')) return 'json';
  if (key.includes('http')) return 'http';
  return 'txt';
}

/** Human-readable slug from a component name, safe for filenames. */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'component'
  );
}

/**
 * Build the filename for a component's code. Arduino sketches are additionally
 * placed in a matching folder-style base name (`blink_test.ino`) — the Arduino
 * IDE wants the sketch file to match its parent folder, and a clear
 * `_test` suffix signals this is a bring-up / hardware-check sketch.
 */
export function codeFilename(name: string, lang: string): string {
  const ext = extForLang(lang);
  const base = slugify(name).replace(/-/g, '_');
  const suffix = ext === 'ino' ? '_test' : '';
  return `${base}${suffix}.${ext}`;
}

/** Trigger a client-side download of the given source code as a file. */
export function downloadCode(name: string, lang: string, code: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = codeFilename(name, lang);
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
