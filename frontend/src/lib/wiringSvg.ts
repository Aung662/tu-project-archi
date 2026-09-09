/**
 * wiringSvg.ts — builds a standalone, self-contained SVG string for a component's
 * "typical Arduino UNO wiring" diagram, so the wiring hub can offer a one-click
 * download (the on-screen <WiringDiagram/> is React/JSX; this mirrors its layout
 * as a plain string with no external refs — fonts inlined by family name, colours
 * baked in — so the saved file opens correctly anywhere and prints cleanly).
 */
import { buildWiring, WIRE_KIND_LABEL, WIRE_COLORS, type WireConn } from './wiring';
import type { PinRow } from '@/data/componentGuide';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build the full SVG markup for a component's wiring diagram. */
export function buildWiringSvg(
  componentName: string,
  pinout: PinRow[] | undefined,
  lang: 'my' | 'en' = 'en',
): string {
  const conns = buildWiring(pinout);
  if (conns.length === 0) return '';
  const my = lang === 'my';

  const rowH = 34;
  const topPad = 64;
  const botPad = 28;
  const legendH = 46;
  const height = topPad + conns.length * rowH + botPad + legendH;
  const width = 460;
  const ardX = 30;
  const ardW = 128;
  const compX = width - 30 - ardW;
  const boxTop = 48;
  const boxH = topPad + conns.length * rowH + botPad - boxTop - 16;
  const yFor = (i: number) => topPad + i * rowH + rowH / 2;

  const title = my ? 'Arduino UNO နှင့် ချိတ်ဆက်ပုံ (နမူနာ)' : 'Typical Arduino UNO wiring';
  const compName = componentName.length > 18 ? componentName.slice(0, 17) + '…' : componentName;

  const wires = conns
    .map((c: WireConn, i: number) => {
      const y = yFor(i);
      const x1 = ardX + ardW;
      const x2 = compX;
      const midX = (x1 + x2) / 2;
      return `
    <path d="M ${x1} ${y} C ${midX} ${y}, ${midX} ${y}, ${x2} ${y}" stroke="${c.color}" stroke-width="2.5" fill="none"/>
    <circle cx="${x1}" cy="${y}" r="3" fill="${c.color}"/>
    <circle cx="${x2}" cy="${y}" r="3" fill="${c.color}"/>
    <text x="${ardX + ardW - 6}" y="${y - 5}" text-anchor="end" font-size="10" font-weight="600" fill="#cbd5e1">${esc(c.ardLabel)}</text>
    <text x="${compX + 6}" y="${y - 5}" text-anchor="start" font-size="10" font-weight="600" fill="#cbd5e1">${esc(c.compLabel)}</text>`;
    })
    .join('');

  // Legend row
  const kinds = Array.from(new Set(conns.map((c) => c.kind)));
  const legendY = topPad + conns.length * rowH + botPad + 4;
  let lx = ardX;
  const legend = kinds
    .map((k) => {
      const label = my ? WIRE_KIND_LABEL[k].my : WIRE_KIND_LABEL[k].en;
      const seg = `
    <rect x="${lx}" y="${legendY}" width="14" height="8" rx="2" fill="${WIRE_COLORS[k]}"/>
    <text x="${lx + 19}" y="${legendY + 8}" font-size="9" fill="#94a3b8">${esc(label)}</text>`;
      lx += 19 + label.length * 5.4 + 14;
      return seg;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Segoe UI, Noto Sans Myanmar, Arial, sans-serif">
  <rect width="${width}" height="${height}" fill="#0b1020"/>
  <text x="${width / 2}" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#e2e8f0">${esc(title)}</text>
  <text x="${width / 2}" y="38" text-anchor="middle" font-size="10" fill="#64748b">${esc(componentName)}</text>
  <rect x="${ardX}" y="${boxTop}" width="${ardW}" height="${boxH}" rx="10" fill="#0f3d3e" stroke="#2dd4bf" stroke-width="1.5"/>
  <text x="${ardX + ardW / 2}" y="${boxTop + 20}" text-anchor="middle" font-size="12" font-weight="700" fill="#5eead4">Arduino UNO</text>
  <rect x="${compX}" y="${boxTop}" width="${ardW}" height="${boxH}" rx="10" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
  <text x="${compX + ardW / 2}" y="${boxTop + 20}" text-anchor="middle" font-size="11" font-weight="700" fill="#a5b4fc">${esc(compName)}</text>${wires}${legend}
</svg>`;
}

/** Trigger a browser download of the wiring SVG for one component. */
export function downloadWiringSvg(
  componentId: string,
  componentName: string,
  pinout: PinRow[] | undefined,
  lang: 'my' | 'en' = 'en',
): void {
  if (typeof window === 'undefined') return;
  const svg = buildWiringSvg(componentName, pinout, lang);
  if (!svg) return;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentId}-wiring.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
