import { COMPONENTS, CATEGORIES } from '/home/user/tu-project-archive/frontend/src/data/components.ts';
import { guideFor } from '/home/user/tu-project-archive/frontend/src/data/componentGuide.ts';
import { buildWiring } from '/home/user/tu-project-archive/frontend/src/lib/wiring.ts';
import { BOARD_ORDER, getBoardProfile } from '/home/user/tu-project-archive/frontend/src/lib/boardProfiles.ts';
import fs from 'fs';

// Human-friendly full board names for prompts
const BOARD_FULL = {
  'arduino-uno':'Arduino Uno R3',
  'arduino-nano':'Arduino Nano (ATmega328P)',
  'arduino-mega':'Arduino Mega 2560',
  'arduino-pro-mini':'Arduino Pro Mini',
  'esp32':'ESP32 DevKit V1 (38-pin)',
  'esp32-cam':'ESP32-CAM (AI-Thinker)',
  'esp8266':'ESP8266 (ESP-12E)',
  'nodemcu':'NodeMCU ESP8266 (Amica)',
  'raspberry-pi-pico':'Raspberry Pi Pico (RP2040)',
  'raspberry-pi':'Raspberry Pi 4 Model B',
  'stm32':'STM32 Blue Pill (STM32F103C8T6)',
  'teensy':'Teensy 4.0',
  'attiny85':'ATtiny85 (8-pin DIP)',
  'micro-bit':'BBC micro:bit v2',
  'jetson-nano':'NVIDIA Jetson Nano Dev Kit',
  'orange-pi':'Orange Pi',
};

// Wire colour convention (matches our renderer + common Fritzing practice)
const WIRE_COLOR = {
  power:'RED', gnd:'BLACK', 'i2c-sda':'BLUE', 'i2c-scl':'YELLOW',
  analog:'GREEN', digital:'ORANGE', serial:'CYAN', spi:'PURPLE',
};

const wireable = COMPONENTS.filter(c=>c.category!=='boards' && buildWiring(guideFor(c.id)?.pinout,'arduino-uno').length>0);
const catName = Object.fromEntries(CATEGORIES.map(c=>[c.key,c.labelEn]));

function connLine(c){
  // e.g. "sensor VCC pin -> Arduino Uno 5V pin (RED wire)"
  return `${c.compLabel} \u2192 ${c.ardLabel} (${WIRE_COLOR[c.kind]||'WHITE'} wire)`;
}
function article(word){ return /^[aeiou]/i.test(word) ? 'an' : 'a'; }

let out = '';
// ---------- HEADER (paste once) ----------
out += `================================================================================
 GOOGLE FLOW / IMAGEN — MASTER PROMPT PACK
 Realistic hardware wiring diagrams for the TU Project Archive component library
 Generated: ${new Date().toISOString().slice(0,10)}
 Boards: ${BOARD_ORDER.length}   Components: ${wireable.length}   Total images: ${wireable.length*BOARD_ORDER.length}
================================================================================

HOW TO USE THIS FILE
--------------------------------------------------------------------------------
1) FIRST, paste the "SYSTEM / STYLE INSTRUCTION" block below ONE TIME at the very
   start of your Google Flow (Imagen) session. It sets the fixed art style, camera,
   background and labelling rules for EVERY image.
2) THEN paste the prompts. Each prompt between two "-----" lines is ONE image.
   Flow will render them one-by-one, in order. Do NOT merge prompts.
3) EVERY prompt already contains the EXACT, VERIFIED pin-to-pin connections and
   wire colours. Do not let the model invent pins — the wiring is spelled out.
4) If your Flow plan limits batch size, paste one SECTION (one board) at a time;
   sections are clearly delimited so you can copy a chunk and continue later.

CRITICAL ACCURACY RULES (these are baked into every prompt too)
--------------------------------------------------------------------------------
- Render EXACTLY the wires listed — no more, no fewer.
- Wire colour code (industry standard, keep consistent):
    RED = power (VCC/5V/3V3)      BLACK = GND
    BLUE = I2C SDA                YELLOW = I2C SCL
    GREEN = analog signal         ORANGE = digital signal
    CYAN = UART (TX/RX)           PURPLE = SPI bus
- Print each pin label legibly and correctly on BOTH the board pad and the
  component pad. Spelling of silkscreen text must be correct.
- One board (left) + one component/module (right), connected by jumper wires.
- Do NOT add extra components, breadboards (unless stated), text watermarks,
  logos, hands, or backgrounds other than the one specified.

================================================================================
 SYSTEM / STYLE INSTRUCTION  (paste ONCE at the top of the session)
================================================================================
You are generating a consistent SERIES of technical hardware wiring diagrams in a
clean "Fritzing / breadboard tutorial" illustration style. Apply ALL of the
following to EVERY image I ask for next, without me repeating them:

STYLE: flat vector-style product illustration, crisp and photoreal-adjacent,
soft studio lighting, subtle drop shadows, high detail on the PCB silkscreen and
connectors. Think high-quality electronics tutorial art (Fritzing / Adafruit /
Random Nerd Tutorials quality).
LAYOUT: single microcontroller board on the LEFT, single sensor/module on the
RIGHT, both shown top-down at a slight 15-degree angle, centered, fully in frame
with margins. Coloured jumper wires arc cleanly between the correct pins.
BACKGROUND: plain, soft light-grey studio gradient (#f2f4f7). No clutter.
LABELS: show small, correctly-spelled text labels next to each connected pin on
both the board and the module. Add a title bar at top with the exact board and
component names I give you.
WIRE COLOURS (fixed): RED=power, BLACK=GND, BLUE=I2C SDA, YELLOW=I2C SCL,
GREEN=analog, ORANGE=digital, CYAN=UART, PURPLE=SPI.
ACCURACY: render EXACTLY the connections I list, using the stated pin names and
wire colours. Never invent, add, or drop a wire. Correct component proportions.
ASPECT RATIO: 16:9, high resolution.
Confirm you will keep this style for all following prompts, then wait for prompts.

`;

// ---------- PER-BOARD SECTIONS ----------
let idx = 0;
for (const bid of BOARD_ORDER) {
  const bp = getBoardProfile(bid);
  const bfull = BOARD_FULL[bid] || bp.name;
  out += `\n\n################################################################################
# SECTION: ${bfull}   (${bp.logic} logic)
# ${wireable.length} images — one per component wired to this board
################################################################################\n`;
  for (const c of wireable) {
    idx++;
    const conns = buildWiring(guideFor(c.id)?.pinout, bid);
    const g = guideFor(c.id);
    const wlist = conns.map(connLine).join('\n  ');
    const cautions = bp.note ? ` NOTE: ${bp.note.en}` : '';
    out += `
--------------------------------------------------------------------------------
IMAGE ${idx}  |  file: ${bid}__${c.id}.png
--------------------------------------------------------------------------------
A realistic Fritzing-style wiring diagram titled "${bfull} + ${c.name}".
LEFT: ${article(bfull)} ${bfull} board (${bp.logic} logic), accurate shape and connectors.
RIGHT: ${article(c.name)} ${c.name} (${catName[c.category]} module), accurate real-world appearance.
Connect them with jumper wires EXACTLY as follows (component pin -> board pin, wire colour):
  ${wlist}
Show these pin labels clearly on both sides. Use the fixed wire-colour code.
Render ONLY these ${conns.length} wires — no extra wires or parts.${cautions}
`;
  }
}

fs.writeFileSync('/home/user/tu-project-archive/docs/FLOW-AI-WIRING-PROMPTS.txt', out);
console.log('WROTE prompts. total images:', idx, 'file size:', out.length);
