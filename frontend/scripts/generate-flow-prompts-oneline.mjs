import { COMPONENTS, CATEGORIES } from '/home/user/tu-project-archive/frontend/src/data/components.ts';
import { guideFor } from '/home/user/tu-project-archive/frontend/src/data/componentGuide.ts';
import { buildWiring } from '/home/user/tu-project-archive/frontend/src/lib/wiring.ts';
import { BOARD_ORDER, getBoardProfile } from '/home/user/tu-project-archive/frontend/src/lib/boardProfiles.ts';
import fs from 'fs';

const BOARD_FULL={'arduino-uno':'Arduino Uno R3','arduino-nano':'Arduino Nano (ATmega328P)','arduino-mega':'Arduino Mega 2560','arduino-pro-mini':'Arduino Pro Mini','esp32':'ESP32 DevKit V1 (38-pin)','esp32-cam':'ESP32-CAM (AI-Thinker)','esp8266':'ESP8266 (ESP-12E)','nodemcu':'NodeMCU ESP8266 (Amica)','raspberry-pi-pico':'Raspberry Pi Pico (RP2040)','raspberry-pi':'Raspberry Pi 4 Model B','stm32':'STM32 Blue Pill (STM32F103C8T6)','teensy':'Teensy 4.0','attiny85':'ATtiny85 (8-pin DIP)','micro-bit':'BBC micro:bit v2','jetson-nano':'NVIDIA Jetson Nano Dev Kit','orange-pi':'Orange Pi'};
const WIRE_COLOR={power:'RED',gnd:'BLACK','i2c-sda':'BLUE','i2c-scl':'YELLOW',analog:'GREEN',digital:'ORANGE',serial:'CYAN',spi:'PURPLE'};
const catName=Object.fromEntries(CATEGORIES.map(c=>[c.key,c.labelEn]));
const article=w=>/^[aeiou]/i.test(w)?'an':'a';
const wireable=COMPONENTS.filter(c=>c.category!=='boards'&&buildWiring(guideFor(c.id)?.pinout,'arduino-uno').length>0);

// Fixed style prefix baked into EVERY single-line prompt (so no separate paste needed)
const STYLE='Realistic Fritzing-style hardware wiring diagram, flat vector product-illustration look, soft light-grey studio background, slight top-down angle, one microcontroller board on the LEFT and one module on the RIGHT connected by coloured jumper wires with correctly-spelled pin labels on both sides; wire colours RED=power BLACK=GND BLUE=I2C-SDA YELLOW=I2C-SCL GREEN=analog ORANGE=digital CYAN=UART PURPLE=SPI; 16:9 high resolution.';

function csvCell(s){ return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; }

let lines=''; // one prompt per line
let csv='filename,prompt\n'; // csv
let idx=0;
for(const bid of BOARD_ORDER){
  const bp=getBoardProfile(bid); const bfull=BOARD_FULL[bid]||bp.name;
  for(const c of wireable){
    idx++;
    const conns=buildWiring(guideFor(c.id)?.pinout,bid);
    const wires=conns.map(x=>`${x.compLabel} to ${x.ardLabel} (${WIRE_COLOR[x.kind]||'WHITE'})`).join('; ');
    const fname=`${bid}__${c.id}.png`;
    const prompt=`${STYLE} Title "${bfull} + ${c.name}". LEFT ${article(bfull)} ${bfull} (${bp.logic} logic). RIGHT ${article(c.name)} ${c.name} (${catName[c.category]}). Connect EXACTLY these ${conns.length} wires and no others: ${wires}. Show these exact pin labels; do not invent or add any wire.`;
    lines+=prompt+'\n';
    csv+=`${csvCell(fname)},${csvCell(prompt)}\n`;
  }
}
fs.writeFileSync('/home/user/tu-project-archive/docs/FLOW-AI-PROMPTS-ONELINE.txt',lines);
fs.writeFileSync('/home/user/tu-project-archive/docs/FLOW-AI-PROMPTS.csv',csv);
console.log('one-line prompts:',idx,'| lines file bytes:',lines.length,'| csv bytes:',csv.length);
