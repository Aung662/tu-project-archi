/**
 * fritzing.ts — builds an illustrative pinout diagram for an unreviewed pair.
 * The board/module silhouettes are category archetypes; pin pads are laid out
 * synthetically and are NOT the physical locations on a Fritzing part. The wire
 * plan comes from buildWiring's heuristics and may need electrical review for a
 * specific breakout, logic voltage, or board revision. Do not mark this output as
 * verified; source-backed recipes use the separate curated SVG pipeline.
 *
 * Output is a self-contained SVG so it can be viewed and downloaded offline.
 */
import { buildWiring, type WireConn } from './wiring';
import { drawBoard } from './boardArt';
import { drawModule, moduleArchetype } from './moduleArt';
import { getBoardProfile } from './boardProfiles';
import type { PinRow } from '@/data/componentGuide';
import type { GlyphKey } from '@/data/glyphs';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface FritzingOpts {
  componentName: string;
  glyph: GlyphKey | string;
  category: string;
  pinout: PinRow[] | undefined;
  boardId?: string;
  lang?: 'my' | 'en';
}

/** Build the full Fritzing-style SVG. Returns '' when there's nothing to wire. */
export function buildFritzingSvg(opts: FritzingOpts): string {
  const { componentName, glyph, category, pinout } = opts;
  const boardId = opts.boardId ?? 'arduino-uno';
  const my = (opts.lang ?? 'en') === 'my';
  const conns = buildWiring(pinout, boardId);
  if (conns.length === 0) return '';
  const board = getBoardProfile(boardId);

  // ── Layout ───────────────────────────────────────────────────────────────
  const width = 720;
  const pad = 24;
  const titleH = 42;
  const rowH = 30;
  const headerH = Math.max(conns.length * rowH + 28, 120);

  // Board box (left) and module box (right).
  const boardW = 260;
  const boardH = Math.max(headerH + 24, 190);
  const moduleW = 150;
  const moduleH = Math.max(conns.length * rowH + 24, 120);

  const boardX = pad;
  const boardY = titleH + 20;
  const moduleX = width - pad - moduleW;
  const moduleY = boardY + Math.max(0, (boardH - moduleH) / 2);

  const height = boardY + boardH + 54;

  // Pin pads: module pads down its LEFT edge; board pads down its RIGHT edge.
  const modPadX = moduleX;
  const modPad0Y = moduleY + 24;
  const modPadY = (i: number) => modPad0Y + i * rowH;

  // Board pads: stack near the board's right edge (its header row).
  const brdPadX = boardX + boardW;
  const brd0Y = boardY + 30;
  const brdPadY = (i: number) => brd0Y + i * rowH;

  const arch = moduleArchetype(glyph, category);

  // ── Wires ────────────────────────────────────────────────────────────────
  // Each wire leaves the board pad, runs out to a routing column, then into the
  // module pad — an orthogonal "jumper" look with slight per-wire offset so
  // parallel wires stay visually separate (like real jumper leads).
  const routeGap = 26;
  const wires = conns
    .map((c: WireConn, i: number) => {
      const y1 = brdPadY(i);
      const y2 = modPadY(i);
      const x1 = brdPadX + 6;
      const x2 = modPadX - 6;
      const rx = x1 + routeGap + i * 6; // staggered routing column
      // Explicit L commands (max renderer compatibility): out, across, in.
      const d = `M ${x1} ${y1} L ${rx} ${y1} L ${rx} ${y2} L ${x2} ${y2}`;
      return `
    <path d="${d}" fill="none" stroke="${c.color}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x1}" cy="${y1}" r="3.5" fill="${c.color}"/>
    <circle cx="${x2}" cy="${y2}" r="3.5" fill="${c.color}"/>`;
    })
    .join('');

  // ── Board pin pads + labels (real pin names) ──────────────────────────────
  const boardPads = conns
    .map((c, i) => {
      const y = brdPadY(i);
      return `
    <rect x="${brdPadX - 16}" y="${y - 7}" width="16" height="14" rx="2" fill="#111418" stroke="#555"/>
    <text x="${brdPadX - 22}" y="${y + 3}" text-anchor="end" font-size="10" font-weight="700" fill="#e2e8f0">${esc(c.ardLabel)}</text>`;
    })
    .join('');

  // ── Module pin pads + labels (component pin names) ─────────────────────────
  const modulePads = conns
    .map((c, i) => {
      const y = modPadY(i);
      return `
    <rect x="${modPadX}" y="${y - 7}" width="16" height="14" rx="2" fill="#c7ccd1" stroke="#8a9199"/>
    <text x="${modPadX + 22}" y="${y + 3}" text-anchor="start" font-size="10" font-weight="700" fill="#e2e8f0">${esc(c.compLabel)}</text>`;
    })
    .join('');

  const boardArtSvg = drawBoard(boardId, boardX, boardY, boardW, boardH);
  const moduleArtSvg = drawModule(arch, componentName, moduleX, moduleY, moduleW, moduleH);

  const title = my
    ? `${board.name} နှင့် ${componentName} ချိတ်ဆက်ပုံ`
    : `${board.name} ↔ ${componentName} wiring`;

  const note = my
    ? '* pinout မှ auto — datasheet နှင့် code ထဲက pin နံပါတ်ကို တိုက်စစ်ပါ။'
    : '* Auto-generated from pinout — verify against the datasheet and your sketch.';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Segoe UI, Noto Sans Myanmar, Arial, sans-serif">
  <rect width="${width}" height="${height}" fill="#0b1020"/>
  <text x="${width / 2}" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="#e6faff">${esc(title)}</text>
  ${wires}
  ${boardArtSvg}
  ${moduleArtSvg}
  ${boardPads}
  ${modulePads}
  <text x="${boardX}" y="${height - 14}" font-size="10" fill="#64748b">${esc(note)}</text>
</svg>`;
}

/** Trigger a browser download of the Fritzing-style SVG. */
export function downloadFritzingSvg(componentId: string, opts: FritzingOpts): void {
  if (typeof window === 'undefined') return;
  const svg = buildFritzingSvg(opts);
  if (!svg) return;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${opts.boardId ?? 'arduino-uno'}--${componentId}-realistic-wiring.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
