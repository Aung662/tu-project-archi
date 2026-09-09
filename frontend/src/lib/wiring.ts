/**
 * wiring.ts — derives a *typical* Arduino ↔ component wiring plan from the
 * pinout data already stored in componentGuide.ts, so every hardware component
 * gets an auto-generated connection diagram without hand-drawing 120 SVGs.
 *
 * The mapping is heuristic and deliberately conservative: it nails the common
 * 3–4-pin cases (power, ground, I²C, analog/digital signal) that cover the vast
 * majority of student sensors/modules, and falls back to a generic digital pin
 * for anything exotic. The diagram is always labelled "typical / example" and
 * students are told to confirm against the datasheet + their sketch — so it is
 * educational and honest rather than pretending to be a verified schematic.
 */
import type { PinRow } from '@/data/componentGuide';

export type WireKind =
  | 'power'
  | 'gnd'
  | 'i2c-sda'
  | 'i2c-scl'
  | 'analog'
  | 'digital'
  | 'serial';

export interface WireConn {
  /** Label as printed on the component (the token we matched). */
  compLabel: string;
  /** Arduino UNO pin this token typically connects to. */
  ardLabel: string;
  kind: WireKind;
  /** Stroke colour for the wire (works on the dark UI). */
  color: string;
}

export const WIRE_COLORS: Record<WireKind, string> = {
  power: '#f87171', // red
  gnd: '#94a3b8', // slate/grey
  'i2c-sda': '#60a5fa', // blue
  'i2c-scl': '#fbbf24', // amber
  analog: '#34d399', // green
  digital: '#f472b6', // pink
  serial: '#22d3ee', // cyan
};

export const WIRE_KIND_LABEL: Record<WireKind, { my: string; en: string }> = {
  power: { my: 'ပါဝါ (VCC)', en: 'Power (VCC)' },
  gnd: { my: 'မြေ (GND)', en: 'Ground (GND)' },
  'i2c-sda': { my: 'I²C ဒေတာ', en: 'I²C data' },
  'i2c-scl': { my: 'I²C နာရီ', en: 'I²C clock' },
  analog: { my: 'Analog signal (A0…)', en: 'Analog signal' },
  digital: { my: 'ဒစ်ဂျစ်တယ် signal', en: 'Digital signal' },
  serial: { my: 'Serial (UART)', en: 'Serial (UART)' },
};

/** Strip a parenthetical colour/note, e.g. "VDD (red)" → "VDD". */
function clean(token: string): string {
  return token.replace(/\([^)]*\)/g, '').trim();
}

/** Split a compound pin cell like "AO / DO" or "SDA / SCL" into tokens. */
function tokenize(pin: string): string[] {
  return pin
    .split(/[/,]| or /i)
    .map(clean)
    .filter(Boolean);
}

function classify(tokenRaw: string): WireKind | null {
  const t = tokenRaw.toUpperCase().replace(/\s+/g, '');

  // Ranges / bus descriptors that belong to boards, not a single wire.
  if (/[–-].*\d/.test(tokenRaw) && /D\d|A\d|GP|GPIO|PA|PB|PC/i.test(tokenRaw)) return null;
  if (/EDGE|USB|HDMI|CSI|BNC|PROBE|JACK|SWD|BOOT|SERIAL1|SERIAL2|SERIAL3/i.test(tokenRaw)) return null;

  // Ground
  if (t === 'GND' || t === '-' || t === 'GND-' || t === '−') return 'gnd';
  // Power
  if (
    ['VCC', 'VDD', 'VIN', '5V', '3V3', '3.3V', 'V+', '+', 'RAW', 'VSYS', 'VBAT', 'PWR'].includes(t) ||
    /^3V3/.test(t) ||
    /^5V/.test(t) ||
    /^VCC/.test(t)
  )
    return 'power';
  // I²C
  if (t === 'SDA') return 'i2c-sda';
  if (t === 'SCL' || t === 'SCK-I2C') return 'i2c-scl';
  // Serial
  if (t === 'TX' || t === 'RX' || t === 'U0R' || t === 'U0T' || t === 'DTR') return 'serial';
  // Analog outputs
  if (['AO', 'A', 'B', 'PO', 'OUT-A', 'ANALOG'].includes(t) || /^AOUT/.test(t)) return 'analog';
  // Digital-ish signal pins (default bucket for the rest)
  if (
    /^(DO|DATA|DQ|SIGNAL|S|OUT|SIG|TRIG|ECHO|INT|CLK|SCK|DT|CS|MOSI|MISO|RST|EN|CE|DRDY|ADDR|S0|S1|S2|S3|IN|IP)/.test(
      t,
    )
  )
    return 'digital';

  // Unknown but looks like a real single pin → treat as a digital signal example.
  if (t.length <= 6 && /[A-Z0-9+]/.test(t)) return 'digital';
  return null;
}

/**
 * Build the connection plan. Analog pins map to A0, A1…; digital signals map to
 * D2, D3… (TRIG/ECHO get the classic D9/D10 pair that the starter sketches use).
 */
export function buildWiring(pinout: PinRow[] | undefined): WireConn[] {
  if (!pinout || pinout.length === 0) return [];
  const conns: WireConn[] = [];
  const digitalPool = ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D11', 'D12', 'D13'];
  const analogPool = ['A0', 'A1', 'A2', 'A3'];
  let di = 0;
  let ai = 0;
  const seen = new Set<string>();

  for (const row of pinout) {
    for (const token of tokenize(row.pin)) {
      const kind = classify(token);
      if (!kind) continue;
      const key = kind + ':' + token.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);

      let ardLabel: string;
      switch (kind) {
        case 'power':
          ardLabel = '5V';
          break;
        case 'gnd':
          ardLabel = 'GND';
          break;
        case 'i2c-sda':
          ardLabel = 'A4 (SDA)';
          break;
        case 'i2c-scl':
          ardLabel = 'A5 (SCL)';
          break;
        case 'serial':
          ardLabel = /TX|U0T/i.test(token) ? 'RX (D0)' : 'TX (D1)';
          break;
        case 'analog':
          ardLabel = analogPool[ai % analogPool.length];
          ai++;
          break;
        case 'digital':
        default:
          if (/TRIG/i.test(token)) ardLabel = 'D9';
          else if (/ECHO/i.test(token)) ardLabel = 'D10';
          else {
            ardLabel = digitalPool[di % digitalPool.length];
            di++;
          }
          break;
      }
      conns.push({ compLabel: token, ardLabel, kind, color: WIRE_COLORS[kind] });
    }
  }
  return conns;
}
