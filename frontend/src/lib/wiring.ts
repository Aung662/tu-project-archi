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
import { getBoardProfile, type BoardProfile } from './boardProfiles';

export type WireKind =
  | 'power'
  | 'gnd'
  | 'i2c-sda'
  | 'i2c-scl'
  | 'analog'
  | 'digital'
  | 'serial'
  | 'spi';

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
  spi: '#c084fc', // purple
};

export const WIRE_KIND_LABEL: Record<WireKind, { my: string; en: string }> = {
  power: { my: 'ပါဝါ (VCC)', en: 'Power (VCC)' },
  gnd: { my: 'မြေ (GND)', en: 'Ground (GND)' },
  'i2c-sda': { my: 'I²C ဒေတာ', en: 'I²C data' },
  'i2c-scl': { my: 'I²C နာရီ', en: 'I²C clock' },
  analog: { my: 'Analog signal', en: 'Analog signal' },
  digital: { my: 'ဒစ်ဂျစ်တယ် signal', en: 'Digital signal' },
  serial: { my: 'Serial (UART)', en: 'Serial (UART)' },
  spi: { my: 'SPI bus', en: 'SPI bus' },
};

/**
 * Strip parenthetical notes and a leading bus prefix, e.g. "VDD (red)" → "VDD",
 * "SPI (SCK" → "SCK", "CS)" → "CS". Also drops any stray unbalanced parens left
 * over after a compound cell like "SPI (SCK/MOSI/MISO/CS)" is split on "/".
 */
function clean(token: string): string {
  return token
    .replace(/\([^)]*\)/g, '') // balanced "(...)" note
    .replace(/^(SPI|I2C|I²C|UART|BUS)\s+/i, '') // leading bus label
    .replace(/[()]/g, '') // any stray parens from split compounds
    .trim();
}

/** Split a compound pin cell like "AO / DO" or "SDA / SCL" into tokens. */
function tokenize(pin: string): string[] {
  return pin
    .split(/[/,]| or /i)
    .map(clean)
    .filter(Boolean);
}

function classify(tokenRaw: string, descHint = ''): WireKind | null {
  const t = tokenRaw.toUpperCase().replace(/\s+/g, '');
  const desc = descHint.toLowerCase();

  // Ranges / bus descriptors that belong to boards, not a single wire.
  if (/[–-].*\d/.test(tokenRaw) && /D\d|A\d|GP|GPIO|PA|PB|PC/i.test(tokenRaw)) return null;
  if (/EDGE|USB|HDMI|CSI|BNC|PROBE|JACK|SWD|BOOT|SERIAL1|SERIAL2|SERIAL3/i.test(tokenRaw)) return null;

  // External MOTOR-SUPPLY pins on driver boards (VMOT, 12V, Vcc2 …). These go to
  // a separate motor power source, NEVER to an MCU pin — drawing them to the
  // board's 5V would be electrically wrong, so they are dropped from the
  // board↔module wire list (the wiring note explains the external supply).
  if (/^(VMOT|VM|VS|VCC2|VDD2|VMS|12V|\+12V|24V|\+24V)$/.test(t)) return null;
  // MOTOR-OUTPUT terminals on driver boards (OUT1–4, coil 1A/1B/2A/2B, U/V/W)
  // and raw speaker terminals (SPK±): these connect to the motor/speaker, not
  // to the MCU, so they are not board wires either.
  if (/^OUT\d/.test(t) || /^OUT[–-]/.test(t) || /^OUT\d[–-]/.test(t)) return null;
  if (/^[12][AB]$/.test(t)) return null;
  if (/^(SPK1|SPK2|SPK\+|SPK-|SP\+|SP-)$/.test(t)) return null;

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
  // SPI bus pins (before the generic digital bucket so they map to real SPI pins)
  if (['MOSI', 'MISO', 'SCK', 'SCLK', 'CS', 'SS', 'NSS', 'CE', 'CE0', 'DIN', 'CLK-SPI'].includes(t))
    return 'spi';
  // Serial
  if (t === 'TX' || t === 'RX' || t === 'U0R' || t === 'U0T' || t === 'DTR') return 'serial';
  // Analog outputs (explicit tokens). WIPER = a potentiometer's middle tap,
  // which is ALWAYS an analog voltage into an ADC pin — never a digital line.
  if (['AO', 'A', 'B', 'PO', 'OUT-A', 'ANALOG', 'WIPER'].includes(t) || /^AOUT/.test(t)) return 'analog';

  // Ambiguous signal pins (OUT / S / SIG / SIGNAL): use the pin DESCRIPTION to
  // decide analog vs digital — the catalogue descriptions state which (e.g. LM35
  // "Analog output" vs PIR "Digital HIGH/LOW"). This keeps generated wiring and
  // the AI-prompt pack physically correct instead of defaulting everything to
  // digital.
  if (/^(OUT|S|SIG|SIGNAL)$/.test(t)) {
    if (/\banalog\b|analogue|adc|voltage|mv\/|10mv|0-1v|0–1v/.test(desc)) return 'analog';
    return 'digital';
  }

  // Digital-ish signal pins (default bucket for the rest)
  if (
    /^(DO|DATA|DQ|SIGNAL|OUT|SIG|TRIG|ECHO|INT|CLK|DT|RST|EN|DRDY|ADDR|S0|S1|S2|S3|IN|IP)/.test(t)
  )
    return 'digital';

  // Unknown but looks like a real single pin → treat as a digital signal example.
  if (t.length <= 6 && /[A-Z0-9+]/.test(t)) return 'digital';
  return null;
}

/**
 * Pure inline / discrete parts that DO NOT have a meaningful "connect these
 * terminals to specific board pins" diagram: they sit in-line in a circuit
 * (in series with, or across, other parts) rather than talking to an MCU pin.
 * Auto-wiring them produced electrically wrong diagrams (e.g. "Resistor → D2,
 * digital signal"), so they are excluded from the generated wiring cards and
 * fall back to their datasheet pinout/notes instead.
 */
export const NON_WIREABLE_IDS = new Set<string>([
  // Pure inline discretes — sit in-line in a circuit, not on an MCU pin.
  'resistor',
  'capacitor',
  'diode',
  'crystal',
  'transistor',
  'inductor',
  'fuse',
  // Accessories / bare hardware with no MCU signal wiring.
  'breadboard',
  'pcb',
  'jumper-wires',
  'toggle-switch',
  // Power supplies / converters / cells — wire to a POWER rail, not MCU GPIO.
  // An "IN+→D2" diagram is meaningless (and misleading), so they show their
  // datasheet pinout + notes instead of a generated board diagram.
  'buck',
  'boost',
  'tp4056',
  'ams1117',
  'ldo',
  'ups-module',
  'liion',
  'lipo',
  'solar-panel',
  // Bare motors / mechanical parts — driven THROUGH a driver board, never
  // straight off Arduino pins.
  'dc-motor',
  'nema17',
  'solenoid',
  'bldc',
  'robot-arm',
  'robot-wheel',
  'gripper',
  'linear-actuator',
  // Industrial / mains-voltage gear — 24V/3-phase/fieldbus, not MCU jumpers.
  'plc',
  'hmi',
  'vfd',
  'contactor',
  'proximity',
  'scada',
  'sensor-industrial',
  'industrial-encoder',
  // Host-interface / PC peripherals — connect to a computer, not an MCU pin.
  'depth-cam',
  'usb-ttl',
  // Built-in radio / protocol on the MCU itself — no external wiring.
  'esp-now',
]);

/** True when a component should NOT get an auto-generated board-wiring diagram. */
export function isWireable(id: string | undefined): boolean {
  return !!id && !NON_WIREABLE_IDS.has(id);
}

/**
 * Pick the matching real SPI pin on the board for a component's SPI token. If
 * the board exposes no dedicated hardware-SPI pins (e.g. ESP32-CAM), fall back
 * to distinct free GPIOs via the caller-supplied cursor so the four SPI wires
 * don't all collapse onto one pin.
 */
function spiPinFor(token: string, board: BoardProfile, nextDigital: () => string): string {
  const t = token.toUpperCase().replace(/\s+/g, '');
  const spi = board.spi;
  if (!spi) return nextDigital();
  if (/MISO|DOUT|SDO/.test(t)) return spi.miso;
  if (/MOSI|DIN|SDI|DATA/.test(t)) return spi.mosi;
  if (/SCK|SCLK|CLK/.test(t)) return spi.sck;
  if (/CS|SS|NSS|CE/.test(t)) return spi.cs;
  return spi.mosi;
}

/**
 * Build the connection plan for a SPECIFIC board (default: Arduino Uno). Power →
 * the board's logic-level supply pin, ground → GND, I²C/SPI/UART → that board's
 * real bus pins, analog → the board's ADC pins (or a note if it has none), and
 * plain digital signals cycle through the board's GPIO pool. Because the pins
 * come from the board profile, switching the board re-labels every wire with
 * that board's genuine pin names (ESP32 GPIO21/22, Pico GP0/GP1, Pi GPIO2/3 …).
 */
export function buildWiring(
  pinout: PinRow[] | undefined,
  boardId = 'arduino-uno',
): WireConn[] {
  if (!pinout || pinout.length === 0) return [];
  const board = getBoardProfile(boardId);
  const conns: WireConn[] = [];
  const digitalPool = board.digital;
  const hasAdc = Boolean(board.analog && board.analog.length);
  const analogPool = board.analog ?? [];
  let di = 0;
  let ai = 0;
  const seen = new Set<string>();
  // Track every board pin already assigned (SPI/I²C/serial/analog/dedicated),
  // so the generic digital-pin cursor never hands out a pin that's already in
  // use — which previously caused two wires to land on one GPIO on pin-limited
  // boards (ESP32-CAM, ESP8266).
  const usedPins = new Set<string>();

  /** Next free digital pin that isn't already taken by another wire. When the
   *  board has genuinely run out of free GPIOs (e.g. an SPI display on an
   *  ESP32-CAM), we DON'T fake a duplicate — we return an honest caveat so the
   *  diagram/table shows the board can't fit this module rather than lying. */
  const nextDigital = (): string => {
    for (let n = 0; n < digitalPool.length; n++) {
      const p = digitalPool[di++ % digitalPool.length];
      if (!usedPins.has(p)) return p;
    }
    return 'no free pin';
  };
  const nextAnalog = (): string => {
    for (let n = 0; n < analogPool.length; n++) {
      const p = analogPool[ai++ % analogPool.length];
      if (!usedPins.has(p)) return p;
    }
    return 'no free pin';
  };

  for (const row of pinout) {
    const descHint = `${row.desc?.en ?? ''} ${row.desc?.my ?? ''}`;
    for (const token of tokenize(row.pin)) {
      const kind = classify(token, descHint);
      if (!kind) continue;
      const key = kind + ':' + token.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);

      let ardLabel: string;
      switch (kind) {
        case 'power':
          ardLabel = board.power;
          break;
        case 'gnd':
          ardLabel = board.gnd;
          break;
        case 'i2c-sda':
          ardLabel = board.i2c ? board.i2c.sda : nextDigital();
          break;
        case 'i2c-scl':
          ardLabel = board.i2c ? board.i2c.scl : nextDigital();
          break;
        case 'spi':
          ardLabel = spiPinFor(token, board, nextDigital);
          break;
        case 'serial':
          ardLabel = board.serial
            ? /TX|U0T|SDO/i.test(token)
              ? board.serial.rx
              : board.serial.tx
            : nextDigital();
          break;
        case 'analog':
          if (hasAdc) {
            ardLabel = nextAnalog();
          } else {
            // Board has no ADC — an analog sensor needs an external ADC. Assign a
            // free GPIO so it never collides with a real digital signal, and flag
            // the caveat via a distinct label.
            ardLabel = `${nextDigital()} (needs ext. ADC)`;
          }
          break;
        case 'digital':
        default:
          if (/TRIG/i.test(token) && board.trigEcho) ardLabel = board.trigEcho.trig;
          else if (/ECHO/i.test(token) && board.trigEcho) ardLabel = board.trigEcho.echo;
          else ardLabel = nextDigital();
          break;
      }
      // Mark this pin used so later wires skip it. Strip ONLY the synthetic
      // "(needs ext. ADC)" note — real pin names like "GPIO14 (D5)" must be kept
      // intact so they match the digital-pool entries.
      usedPins.add(ardLabel.replace(/\s*\(needs ext\. ADC\)$/, ''));
      conns.push({ compLabel: token, ardLabel, kind, color: WIRE_COLORS[kind] });
    }
  }
  return conns;
}
