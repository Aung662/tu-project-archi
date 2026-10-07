/**
 * moduleArt.ts — generic vector silhouettes for illustrative pinout views.
 * They are archetypes selected by glyph/category, not exact component artwork and
 * not physical connector layouts. Only the separate reviewed-diagram pipeline
 * uses genuine, attributed part artwork with wires attached to source connector
 * coordinates.
 *
 * The connection header (the labelled pin pads the wires attach to) is drawn by
 * fritzing.ts along this module's left edge, so this focuses on the silhouette.
 */
import type { GlyphKey } from '@/data/glyphs';

export type ModuleArchetype =
  | 'ultrasonic'
  | 'screen'
  | 'motor'
  | 'servo'
  | 'relay'
  | 'camera'
  | 'led'
  | 'pcb'; // generic breakout PCB (default)

/** Choose the module silhouette from glyph first, then category. */
export function moduleArchetype(glyph: GlyphKey | string, category: string): ModuleArchetype {
  const g = String(glyph);
  if (g === 'distance') return 'ultrasonic';
  if (g === 'lcd' || g === 'oled' || g === 'sevenseg' || g === 'ledmatrix' || g === 'epaper')
    return 'screen';
  if (g === 'servo') return 'servo';
  if (g === 'motor' || g === 'stepper' || g === 'pump') return 'motor';
  if (g === 'relay') return 'relay';
  if (g === 'camera') return 'camera';
  if (g === 'led') return 'led';
  if (category === 'display') return 'screen';
  if (category === 'actuators' || category === 'robotics') return 'motor';
  return 'pcb';
}

/** PCB tint for the module body — common breakout colours. */
function moduleColor(arch: ModuleArchetype): { body: string; edge: string } {
  switch (arch) {
    case 'ultrasonic':
      return { body: '#1e3a8a', edge: '#0f1d4a' };
    case 'screen':
      return { body: '#0b1020', edge: '#05070d' };
    case 'relay':
      return { body: '#1e5fa8', edge: '#123a68' };
    case 'motor':
    case 'servo':
      return { body: '#3b3f47', edge: '#1c1f24' };
    case 'camera':
      return { body: '#2b2f36', edge: '#15181c' };
    case 'led':
      return { body: '#0b1020', edge: '#05070d' };
    case 'pcb':
    default:
      return { body: '#0f5132', edge: '#0a3a24' };
  }
}

/**
 * Draw the module illustration into (mx, my, mw, mh). Returns SVG fragment.
 * `name` is printed on the body so the part is labelled even when its shape is a
 * generic PCB.
 */
export function drawModule(
  arch: ModuleArchetype,
  name: string,
  mx: number,
  my: number,
  mw: number,
  mh: number,
): string {
  const c = moduleColor(arch);
  const cx = mx + mw / 2;
  const cy = my + mh / 2;
  const body = `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="8" fill="${c.body}" stroke="${c.edge}" stroke-width="2"/>`;
  const short = name.length > 16 ? name.slice(0, 15) + '…' : name;

  let inner = '';
  switch (arch) {
    case 'ultrasonic':
      inner = `
        <circle cx="${cx - 22}" cy="${cy}" r="20" fill="#0b0f14" stroke="#6b7280" stroke-width="3"/>
        <circle cx="${cx - 22}" cy="${cy}" r="12" fill="#1f2937" stroke="#9ca3af"/>
        <circle cx="${cx + 22}" cy="${cy}" r="20" fill="#0b0f14" stroke="#6b7280" stroke-width="3"/>
        <circle cx="${cx + 22}" cy="${cy}" r="12" fill="#1f2937" stroke="#9ca3af"/>
        <rect x="${cx - 6}" y="${cy - 10}" width="12" height="20" rx="2" fill="#c0a34a"/>`;
      break;
    case 'screen':
      inner = `
        <rect x="${mx + 10}" y="${my + 10}" width="${mw - 20}" height="${mh - 26}" rx="3" fill="#0a1a2f" stroke="#1e40af" stroke-width="1.5"/>
        <rect x="${mx + 16}" y="${my + 16}" width="${mw - 32}" height="${mh - 40}" rx="1" fill="#0e2a52"/>
        <text x="${cx}" y="${cy}" text-anchor="middle" font-size="9" fill="#67e8f9" opacity="0.85">${short}</text>`;
      break;
    case 'motor':
      inner = `
        <circle cx="${cx}" cy="${cy - 4}" r="26" fill="#4b5563" stroke="#9ca3af" stroke-width="2"/>
        <circle cx="${cx}" cy="${cy - 4}" r="10" fill="#111418" stroke="#6b7280"/>
        <rect x="${cx - 4}" y="${cy - 34}" width="8" height="14" rx="2" fill="#9ca3af"/>`;
      break;
    case 'servo':
      inner = `
        <rect x="${cx - 26}" y="${cy - 16}" width="52" height="34" rx="3" fill="#2563eb" stroke="#1e40af"/>
        <rect x="${cx - 34}" y="${cy - 8}" width="10" height="18" rx="2" fill="#1e40af"/>
        <rect x="${cx + 24}" y="${cy - 8}" width="10" height="18" rx="2" fill="#1e40af"/>
        <rect x="${cx - 4}" y="${cy - 34}" width="8" height="18" rx="2" fill="#e5e7eb"/>`;
      break;
    case 'relay':
      inner = `
        <rect x="${cx - 20}" y="${cy - 16}" width="40" height="30" rx="2" fill="#1d4ed8" stroke="#1e3a8a"/>
        <text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="7" fill="#dbeafe">RELAY</text>
        <rect x="${mx + 6}" y="${my + 6}" width="10" height="10" rx="1" fill="#3b82f6"/>`;
      break;
    case 'camera':
      inner = `
        <circle cx="${cx}" cy="${cy - 2}" r="20" fill="#05070d" stroke="#4b5563" stroke-width="3"/>
        <circle cx="${cx}" cy="${cy - 2}" r="10" fill="#1e293b" stroke="#64748b"/>
        <circle cx="${cx + 5}" cy="${cy - 6}" r="3" fill="#93c5fd" opacity="0.7"/>`;
      break;
    case 'led':
      inner = `
        <circle cx="${cx}" cy="${cy}" r="18" fill="#f472b6" opacity="0.25"/>
        <circle cx="${cx}" cy="${cy}" r="11" fill="#f472b6" stroke="#be185d"/>`;
      break;
    case 'pcb':
    default:
      inner = `
        <rect x="${cx - 16}" y="${cy - 10}" width="32" height="20" rx="2" fill="#111418" stroke="#333"/>
        <text x="${cx}" y="${my + mh - 8}" text-anchor="middle" font-size="9" font-weight="700" fill="#8ef4de">${short}</text>`;
      break;
  }
  return body + inner;
}
