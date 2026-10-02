import { COMPONENTS, CATEGORIES } from '/home/user/tu-project-archive/frontend/src/data/components.ts';
import { guideFor } from '/home/user/tu-project-archive/frontend/src/data/componentGuide.ts';
import { buildWiring } from '/home/user/tu-project-archive/frontend/src/lib/wiring.ts';
import { getBoardProfile } from '/home/user/tu-project-archive/frontend/src/lib/boardProfiles.ts';
import fs from 'fs';

const WIRE_COLOR={power:'RED',gnd:'BLACK','i2c-sda':'BLUE','i2c-scl':'YELLOW',analog:'GREEN',digital:'ORANGE',serial:'CYAN',spi:'PURPLE'};
const catName=Object.fromEntries(CATEGORIES.map(c=>[c.key,c.labelEn]));
const article=w=>/^[aeiou]/i.test(w)?'an':'a';

// Most-common beginner parts (by id)
const TOP=['dht11','hc-sr04','pir','ldr','soil-moisture','mq2','ds18b20','lm35','bmp280','mpu6050',
'oled','lcd1602','servo','dc-motor','stepper','relay-module','l298n','ir-sensor','rfid-rc522','buzzer',
'push-button','potentiometer','rain-sensor','flame-sensor','water-level','color-sensor','rtc','neopixel','sd-module','joystick'];

const wireable=COMPONENTS.filter(c=>c.category!=='boards');
function find(id){ return wireable.find(c=>c.id===id); }

let out=`================================================================================
 GOOGLE FLOW / IMAGEN — STARTER PACK (Arduino Uno, top beginner parts)
 A short, copy-paste-once list for the most common Arduino Uno projects.
 For the FULL 16-board x 94-component pack, use FLOW-AI-WIRING-PROMPTS.txt
================================================================================

STEP 1 — paste this ONCE:
--------------------------------------------------------------------------------
You are generating a consistent SERIES of realistic Fritzing-style hardware wiring
diagrams. For EVERY prompt I send next, keep this fixed style: one Arduino Uno on
the LEFT, one sensor/module on the RIGHT, slight top-down angle, soft light-grey
studio background, coloured jumper wires with correctly-spelled pin labels on both
sides. Wire colours: RED=power, BLACK=GND, BLUE=I2C SDA, YELLOW=I2C SCL,
GREEN=analog, ORANGE=digital, CYAN=UART, PURPLE=SPI. Render EXACTLY the wires I
list — never invent, add or drop a wire. 16:9, high resolution. Confirm, then wait.

STEP 2 — paste the prompts below (each block = one image):
`;

const bid='arduino-uno';
const bp=getBoardProfile(bid);
let n=0;
for(const id of TOP){
  const c=find(id); if(!c) continue;
  const conns=buildWiring(guideFor(c.id)?.pinout,bid);
  if(!conns.length) continue;
  n++;
  out+=`
--------------------------------------------------------------------------------
IMAGE ${n}  |  file: arduino-uno__${c.id}.png
--------------------------------------------------------------------------------
A realistic Fritzing-style wiring diagram titled "Arduino Uno + ${c.name}".
LEFT: an Arduino Uno R3 board (5V logic). RIGHT: ${article(c.name)} ${c.name} (${catName[c.category]}).
Wire them EXACTLY:
  ${conns.map(x=>`${x.compLabel} \u2192 ${x.ardLabel} (${WIRE_COLOR[x.kind]||'WHITE'} wire)`).join('\n  ')}
Correct pin labels on both sides. Render ONLY these ${conns.length} wires.
`;
}
out+=`\n(Assembled ${n} starter prompts. Full pack: FLOW-AI-WIRING-PROMPTS.txt)\n`;
fs.writeFileSync('/home/user/tu-project-archive/docs/FLOW-AI-WIRING-PROMPTS-STARTER.txt',out);
console.log('starter images:',n);
