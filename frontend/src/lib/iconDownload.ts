import { GLYPHS, type GlyphKey } from '@/data/glyphs';

/**
 * Builds a standalone, self-contained SVG string for a component icon: a rounded
 * tinted badge + the glyph + the component name baked in, so a downloaded file
 * is a finished, shareable icon (works offline, no external refs).
 */
export function buildIconSvg(opts: {
  glyph: GlyphKey;
  hex: string;
  name: string;
  size?: number;
}): string {
  const { glyph, hex, name, size = 512 } = opts;
  const inner = GLYPHS[glyph] ?? '';
  // Scale the 48×48 glyph up and centre it in the upper area; label underneath.
  const glyphScale = (size * 0.42) / 48;
  const glyphX = (size - 48 * glyphScale) / 2;
  const glyphY = size * 0.16;
  const label = escapeXml(name);
  const fontSize = Math.round(size * 0.058);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f1424"/>
      <stop offset="1" stop-color="#161d33"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#bg)"/>
  <rect x="6" y="6" width="${size - 12}" height="${size - 12}" rx="${size * 0.16}" fill="none" stroke="${hex}" stroke-opacity="0.35" stroke-width="3"/>
  <g transform="translate(${glyphX}, ${glyphY}) scale(${glyphScale})" color="${hex}">
    ${inner}
  </g>
  <text x="50%" y="${size * 0.82}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#e6e9f5">${label}</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Trigger a browser download of a Blob under `filename`. */
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Download the icon as a standalone .svg file. */
export function downloadSvg(opts: { glyph: GlyphKey; hex: string; name: string; id: string }) {
  const svg = buildIconSvg(opts);
  saveBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${opts.id}.svg`);
}

/**
 * Rasterize the SVG to a PNG via an offscreen canvas, then download it. Fully
 * client-side; no network needed. Falls back to SVG download if canvas fails.
 */
export async function downloadPng(opts: {
  glyph: GlyphKey;
  hex: string;
  name: string;
  id: string;
  size?: number;
}) {
  const size = opts.size ?? 512;
  const svg = buildIconSvg({ ...opts, size });
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('img load failed'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    ctx.drawImage(img, 0, 0, size, size);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('toBlob failed');
    saveBlob(blob, `${opts.id}.png`);
  } catch {
    // Graceful fallback: hand the user the vector instead.
    saveBlob(svgBlob, `${opts.id}.svg`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
