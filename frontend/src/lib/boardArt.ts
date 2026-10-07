/**
 * boardArt.ts — generic, self-contained SVG silhouettes used only for
 * illustrative pinout views. These archetypes are intentionally not represented
 * as exact photographs or pin-position-accurate board artwork. Source-reviewed
 * physical diagrams use the versioned Fritzing parts in the wiring-review
 * pipeline instead.
 *
 * Every board maps to one of a handful of ARCHETYPES so the art stays consistent
 * and maintainable while still reading as the right kind of board. The drawing is
 * returned as a plain SVG-fragment string (no external refs) so it renders inside
 * the sandboxed preview and inside a downloaded standalone SVG identically.
 */
import { getBoardProfile } from './boardProfiles';

export type BoardArchetype =
  | 'arduino-classic' // Uno / Mega — big blue board, USB-B + barrel jack
  | 'arduino-nano' // Nano / Pro Mini — small stick, USB-mini
  | 'esp-dev' // ESP32 / ESP8266 / NodeMCU / STM32 / Teensy — dev stick + micro-USB
  | 'esp32-cam' // ESP32-CAM — board with a camera lens
  | 'pico' // Raspberry Pi Pico — small stick, micro-USB, RP2040
  | 'sbc' // Raspberry Pi / Jetson / Orange Pi — SBC with 40-pin header
  | 'microbit' // micro:bit — distinctive shape, LED grid + edge connector
  | 'dip'; // ATtiny85 — an 8-pin DIP chip

const ARCHETYPE: Record<string, BoardArchetype> = {
  'arduino-uno': 'arduino-classic',
  'arduino-mega': 'arduino-classic',
  'arduino-nano': 'arduino-nano',
  'arduino-pro-mini': 'arduino-nano',
  esp32: 'esp-dev',
  esp8266: 'esp-dev',
  nodemcu: 'esp-dev',
  stm32: 'esp-dev',
  teensy: 'esp-dev',
  'esp32-cam': 'esp32-cam',
  'raspberry-pi-pico': 'pico',
  'raspberry-pi': 'sbc',
  'jetson-nano': 'sbc',
  'orange-pi': 'sbc',
  'micro-bit': 'microbit',
  attiny85: 'dip',
};

export function boardArchetype(boardId: string): BoardArchetype {
  return ARCHETYPE[boardId] ?? 'arduino-classic';
}

/** PCB base colour per board — helps them read as different real boards. */
export function boardColor(boardId: string): { pcb: string; edge: string; accent: string } {
  const a = boardArchetype(boardId);
  switch (a) {
    case 'esp-dev':
      return boardId === 'stm32'
        ? { pcb: '#1f6f4a', edge: '#124a30', accent: '#8ef4de' } // Blue Pill is green-ish clone
        : { pcb: '#2b2f36', edge: '#15181c', accent: '#f0abfc' }; // ESP black
    case 'esp32-cam':
      return { pcb: '#3a3f47', edge: '#1c1f24', accent: '#a5b4fc' };
    case 'pico':
      return { pcb: '#0f5132', edge: '#0a3a24', accent: '#6ee7b7' };
    case 'sbc':
      return { pcb: '#1f7a4d', edge: '#124a30', accent: '#bef264' };
    case 'microbit':
      return { pcb: '#0b1020', edge: '#05070d', accent: '#67e8f9' };
    case 'dip':
      return { pcb: '#1a1a1a', edge: '#000000', accent: '#cbd5e1' };
    case 'arduino-nano':
      return { pcb: '#1e6f9f', edge: '#134a6b', accent: '#7dd3fc' };
    case 'arduino-classic':
    default:
      return { pcb: '#0a6c9c', edge: '#064a6c', accent: '#7dd3fc' };
  }
}

/**
 * Draw the board illustration into the box (bx, by, bw, bh). Returns the SVG
 * fragment. The header of connection pins is drawn separately (see fritzing.ts)
 * along the board's right edge, so this focuses purely on making the board
 * recognisable.
 */
export function drawBoard(boardId: string, bx: number, by: number, bw: number, bh: number): string {
  const a = boardArchetype(boardId);
  const c = boardColor(boardId);
  const name = getBoardProfile(boardId).name;
  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  // Common: rounded PCB with mounting holes.
  const holes = [
    [bx + 12, by + 12],
    [bx + bw - 12, by + 12],
    [bx + 12, by + bh - 12],
    [bx + bw - 12, by + bh - 12],
  ]
    .map(([hx, hy]) => `<circle cx="${hx}" cy="${hy}" r="4.5" fill="#0b1020" stroke="${c.edge}" stroke-width="1.5"/>`)
    .join('');

  const pcb = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="${c.pcb}" stroke="${c.edge}" stroke-width="2"/>`;

  let inner = '';
  switch (a) {
    case 'arduino-classic':
      inner = `
        <!-- USB-B -->
        <rect x="${bx - 10}" y="${by + 18}" width="34" height="30" rx="3" fill="#c7ccd1" stroke="#8a9199" stroke-width="1.5"/>
        <!-- Barrel jack -->
        <rect x="${bx - 8}" y="${by + bh - 46}" width="30" height="26" rx="5" fill="#0b0f14" stroke="#2b2f36" stroke-width="1.5"/>
        <!-- MCU chip -->
        <rect x="${cx - 34}" y="${cy - 6}" width="68" height="26" rx="3" fill="#111418" stroke="#333" stroke-width="1"/>
        <text x="${cx}" y="${cy + 11}" text-anchor="middle" font-size="8" fill="#8a9199">ATMEGA</text>
        <!-- logo -->
        <circle cx="${cx - 18}" cy="${by + 26}" r="9" fill="none" stroke="#e6faff" stroke-width="2"/>
        <text x="${cx - 18}" y="${by + 30}" text-anchor="middle" font-size="12" fill="#e6faff">∞</text>
        <text x="${cx + 30}" y="${by + 30}" text-anchor="middle" font-size="13" font-weight="700" fill="#e6faff">${name.includes('Mega') ? 'MEGA' : 'UNO'}</text>`;
      break;
    case 'arduino-nano':
      inner = `
        <rect x="${cx - 8}" y="${by + 6}" width="16" height="14" rx="2" fill="#c7ccd1"/>
        <rect x="${cx - 26}" y="${cy - 8}" width="52" height="22" rx="2" fill="#111418" stroke="#333"/>
        <text x="${cx}" y="${cy + 7}" text-anchor="middle" font-size="7" fill="#8a9199">MCU</text>`;
      break;
    case 'esp-dev':
      inner = `
        <!-- micro-USB -->
        <rect x="${cx - 12}" y="${by + 4}" width="24" height="12" rx="2" fill="#c7ccd1"/>
        <!-- RF shield / chip -->
        <rect x="${cx - 26}" y="${cy - 12}" width="52" height="30" rx="3" fill="#d9dde1" stroke="#8a9199"/>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="8" fill="#333">${boardId === 'stm32' ? 'STM32' : boardId === 'teensy' ? 'IMXRT' : 'ESP'}</text>
        <!-- PCB antenna (esp only) -->
        ${boardId === 'esp32' || boardId === 'esp8266' || boardId === 'nodemcu' ? `<path d="M ${cx - 14} ${by + bh - 8} h 28 v -10 h -6 v 6 h -4 v -6 h -4 v 6 h -4 v -6 h -6 z" fill="#caa63c"/>` : ''}`;
      break;
    case 'esp32-cam':
      inner = `
        <!-- camera lens -->
        <rect x="${cx - 20}" y="${by + 10}" width="40" height="40" rx="4" fill="#111418" stroke="#333"/>
        <circle cx="${cx}" cy="${by + 30}" r="13" fill="#05070d" stroke="#4b5563" stroke-width="2"/>
        <circle cx="${cx}" cy="${by + 30}" r="6" fill="#1e293b" stroke="#64748b"/>
        <circle cx="${cx + 3}" cy="${by + 27}" r="2" fill="#93c5fd" opacity="0.7"/>
        <rect x="${cx - 24}" y="${cy + 8}" width="48" height="18" rx="2" fill="#d9dde1"/>
        <text x="${cx}" y="${cy + 21}" text-anchor="middle" font-size="7" fill="#333">ESP32-S</text>`;
      break;
    case 'pico':
      inner = `
        <rect x="${cx - 10}" y="${by + 4}" width="20" height="11" rx="2" fill="#c7ccd1"/>
        <rect x="${cx - 18}" y="${cy - 8}" width="36" height="24" rx="4" fill="#0b0f14" stroke="#333"/>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="7" fill="#6ee7b7">RP2040</text>`;
      break;
    case 'sbc':
      inner = `
        <!-- USB / ethernet blocks -->
        <rect x="${bx + bw - 40}" y="${by + 14}" width="34" height="24" rx="2" fill="#9aa0a6"/>
        <rect x="${bx + bw - 40}" y="${by + 44}" width="34" height="24" rx="2" fill="#9aa0a6"/>
        <rect x="${bx + bw - 40}" y="${by + bh - 34}" width="34" height="22" rx="2" fill="#3b4048"/>
        <!-- SoC -->
        <rect x="${cx - 26}" y="${cy - 6}" width="52" height="40" rx="3" fill="#111418" stroke="#333"/>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="7" fill="#9aa0a6">SoC</text>`;
      break;
    case 'microbit':
      inner = `
        <!-- LED grid -->
        <g fill="#7f1d1d">
        ${Array.from({ length: 25 })
          .map((_, i) => {
            const r = Math.floor(i / 5);
            const col = i % 5;
            return `<rect x="${cx - 20 + col * 9}" y="${by + 12 + r * 8}" width="5" height="5" rx="1"/>`;
          })
          .join('')}
        </g>
        <circle cx="${bx + 22}" cy="${cy + 20}" r="7" fill="none" stroke="#e6faff" stroke-width="2"/>
        <circle cx="${bx + bw - 22}" cy="${cy + 20}" r="7" fill="none" stroke="#e6faff" stroke-width="2"/>`;
      break;
    case 'dip':
      inner = `
        <rect x="${cx - 22}" y="${by + 14}" width="44" height="${bh - 28}" rx="3" fill="#0b0f14" stroke="#333"/>
        <circle cx="${cx - 14}" cy="${by + 24}" r="3" fill="#333"/>
        <text x="${cx}" y="${cy + 3}" text-anchor="middle" font-size="8" fill="#cbd5e1" transform="rotate(90 ${cx} ${cy})">ATtiny85</text>`;
      break;
  }

  const label =
    a === 'arduino-classic'
      ? ''
      : `<text x="${cx}" y="${by + bh - 6}" text-anchor="middle" font-size="9" font-weight="700" fill="${c.accent}">${name}</text>`;

  return pcb + inner + holes + label;
}
