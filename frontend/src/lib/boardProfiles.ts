/**
 * boardProfiles.ts — REAL per-board pin maps so the wiring hub can draw an
 * accurate "this exact board ↔ this component" connection for EVERY board, not
 * just the Arduino UNO.
 *
 * Each profile records the pins a student would actually use on that specific
 * board for the common buses (power, ground, I²C, SPI, UART) plus a pool of
 * general-purpose analog / digital pins. `buildWiring()` (lib/wiring.ts) reads
 * the selected board's profile and assigns component pins to these real names —
 * so switching the board on `/wiring` re-labels every diagram with that board's
 * genuine pin numbers (ESP32 → GPIO21/22, Pico → GP0/GP1, Pi → GPIO2/3 …).
 *
 * The pin choices follow each board's standard/default bus pins (Arduino core
 * defaults, Espressif default I²C, RP2040 I2C0, the Raspberry-Pi 40-pin header,
 * STM32 Blue-Pill USART1/I2C1/SPI1, etc.). They are the sensible defaults a
 * student should start from — always confirmable against the datasheet, exactly
 * as the on-diagram note says.
 */

export interface BoardProfile {
  id: string;
  /** Short display name for the board box in the diagram. */
  name: string;
  /** Logic voltage of the GPIO pins. */
  logic: '5V' | '3.3V';
  /** Pin label a sensor's VCC should connect to (matches the logic level). */
  power: string;
  /** Optional secondary supply pin (e.g. a 3.3V board that also exposes 5V-in). */
  powerAlt?: string;
  /** Ground pin label. */
  gnd: string;
  /** I²C bus pins, or null if the board has no straightforward hardware I²C. */
  i2c: { sda: string; scl: string } | null;
  /** SPI bus pins, or null. */
  spi: { mosi: string; miso: string; sck: string; cs: string } | null;
  /** Hardware UART pins, or null (software-serial only). */
  serial: { rx: string; tx: string } | null;
  /** Analog-capable pins in preference order, or null if the board has NO ADC. */
  analog: string[] | null;
  /** General-purpose digital pins in preference order. */
  digital: string[];
  /** Optional classic ultrasonic TRIG/ECHO pins (kept for AVR starter sketches). */
  trigEcho?: { trig: string; echo: string };
  /** Board-specific caveat shown under the diagram (bilingual). */
  note?: { my: string; en: string };
}

const NO_ADC = {
  my: 'ဤဘုတ်တွင် analog (ADC) input မပါ — analog sensor အတွက် ADS1115 ကဲ့သို့ ပြင်ပ ADC module လိုအပ်သည်။',
  en: 'This board has no analog (ADC) input — an analog sensor needs an external ADC (e.g. ADS1115).',
};

export const BOARD_PROFILES: Record<string, BoardProfile> = {
  'arduino-uno': {
    id: 'arduino-uno',
    name: 'Arduino Uno',
    logic: '5V',
    power: '5V',
    powerAlt: '3.3V',
    gnd: 'GND',
    i2c: { sda: 'A4 (SDA)', scl: 'A5 (SCL)' },
    spi: { mosi: 'D11 (MOSI)', miso: 'D12 (MISO)', sck: 'D13 (SCK)', cs: 'D10 (SS)' },
    serial: { rx: 'D0 (RX)', tx: 'D1 (TX)' },
    analog: ['A0', 'A1', 'A2', 'A3'],
    digital: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
    trigEcho: { trig: 'D9', echo: 'D10' },
    note: { my: '5V logic — sensor အများစုနှင့် တိုက်ရိုက်တွဲသုံးနိုင်သည်။', en: '5V logic — works directly with most 5V sensors.' },
  },
  'arduino-nano': {
    id: 'arduino-nano',
    name: 'Arduino Nano',
    logic: '5V',
    power: '5V',
    powerAlt: '3V3',
    gnd: 'GND',
    i2c: { sda: 'A4 (SDA)', scl: 'A5 (SCL)' },
    spi: { mosi: 'D11 (MOSI)', miso: 'D12 (MISO)', sck: 'D13 (SCK)', cs: 'D10 (SS)' },
    serial: { rx: 'D0 (RX)', tx: 'D1 (TX)' },
    analog: ['A0', 'A1', 'A2', 'A3', 'A6', 'A7'],
    digital: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
    trigEcho: { trig: 'D9', echo: 'D10' },
    note: { my: '5V logic — UNO နှင့် pin တူသည်။', en: '5V logic — same pin map as the Uno.' },
  },
  'arduino-pro-mini': {
    id: 'arduino-pro-mini',
    name: 'Pro Mini',
    logic: '5V',
    power: 'VCC',
    gnd: 'GND',
    i2c: { sda: 'A4 (SDA)', scl: 'A5 (SCL)' },
    spi: { mosi: 'D11 (MOSI)', miso: 'D12 (MISO)', sck: 'D13 (SCK)', cs: 'D10 (SS)' },
    serial: { rx: 'RXI (D0)', tx: 'TXO (D1)' },
    analog: ['A0', 'A1', 'A2', 'A3'],
    digital: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
    trigEcho: { trig: 'D9', echo: 'D10' },
    note: { my: '5V နှင့် 3.3V မျိုးကွဲ ရှိသည် — မိမိဘုတ်၏ logic voltage ကို အရင်စစ်ပါ။', en: 'Comes in 5V and 3.3V variants — check your board’s logic voltage first.' },
  },
  'arduino-mega': {
    id: 'arduino-mega',
    name: 'Mega 2560',
    logic: '5V',
    power: '5V',
    powerAlt: '3.3V',
    gnd: 'GND',
    i2c: { sda: 'D20 (SDA)', scl: 'D21 (SCL)' },
    spi: { mosi: 'D51 (MOSI)', miso: 'D50 (MISO)', sck: 'D52 (SCK)', cs: 'D53 (SS)' },
    serial: { rx: 'D0 (RX0)', tx: 'D1 (TX0)' },
    analog: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
    digital: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'],
    trigEcho: { trig: 'D9', echo: 'D10' },
    note: { my: '5V logic — I²C သည် D20/D21 ဖြစ်သည် (UNO နှင့် မတူ)။', en: '5V logic — note I²C is on D20/D21 (different from the Uno).' },
  },
  esp32: {
    id: 'esp32',
    name: 'ESP32',
    logic: '3.3V',
    power: '3V3',
    powerAlt: 'VIN (5V)',
    gnd: 'GND',
    i2c: { sda: 'GPIO21 (SDA)', scl: 'GPIO22 (SCL)' },
    spi: { mosi: 'GPIO23', miso: 'GPIO19', sck: 'GPIO18', cs: 'GPIO5' },
    serial: { rx: 'GPIO16 (RX2)', tx: 'GPIO17 (TX2)' },
    analog: ['GPIO34', 'GPIO35', 'GPIO32', 'GPIO33'],
    digital: ['GPIO4', 'GPIO13', 'GPIO14', 'GPIO25', 'GPIO26', 'GPIO27'],
    note: { my: '3.3V logic — 5V sensor output ကို ESP32 pin သို့ တိုက်ရိုက် မထည့်ပါနှင့် (level shifter သုံးပါ)။ GPIO34-39 သည် input-only ADC။', en: '3.3V logic — do NOT feed a 5V sensor output straight into a GPIO (use a level shifter). GPIO34–39 are input-only ADC.' },
  },
  esp8266: {
    id: 'esp8266',
    name: 'ESP8266',
    logic: '3.3V',
    power: '3V3',
    gnd: 'GND',
    i2c: { sda: 'GPIO4 (D2)', scl: 'GPIO5 (D1)' },
    spi: { mosi: 'GPIO13 (D7)', miso: 'GPIO12 (D6)', sck: 'GPIO14 (D5)', cs: 'GPIO15 (D8)' },
    serial: { rx: 'GPIO3 (RX)', tx: 'GPIO1 (TX)' },
    analog: ['A0 (0–1V)'],
    digital: ['GPIO14 (D5)', 'GPIO12 (D6)', 'GPIO13 (D7)', 'GPIO0 (D3)', 'GPIO2 (D4)'],
    note: { my: '3.3V logic — A0 သည် 0–1V သာ (တစ်ခုတည်း)။ GPIO0/2/15 သည် boot strapping pin — သတိထားပါ။', en: '3.3V logic — single A0 reads only 0–1V. GPIO0/2/15 are boot-strapping pins — handle carefully.' },
  },
  nodemcu: {
    id: 'nodemcu',
    name: 'NodeMCU',
    logic: '3.3V',
    power: '3V3',
    powerAlt: 'VIN (5V)',
    gnd: 'GND',
    i2c: { sda: 'D2 (GPIO4)', scl: 'D1 (GPIO5)' },
    spi: { mosi: 'D7', miso: 'D6', sck: 'D5', cs: 'D8' },
    serial: { rx: 'RX', tx: 'TX' },
    analog: ['A0 (0–3.3V)'],
    digital: ['D5', 'D6', 'D7', 'D0', 'D3', 'D4'],
    note: { my: '3.3V logic — ESP8266 ကို D-label ဖြင့် ထုတ်ထားသည်။ A0 သည် on-board divider ကြောင့် 0–3.3V ဖတ်နိုင်သည်။', en: '3.3V logic — ESP8266 broken out with D-labels. Its A0 reads 0–3.3V thanks to the on-board divider.' },
  },
  'esp32-cam': {
    id: 'esp32-cam',
    name: 'ESP32-CAM',
    logic: '3.3V',
    power: '5V',
    powerAlt: '3V3',
    gnd: 'GND',
    i2c: { sda: 'GPIO15', scl: 'GPIO14' },
    spi: null,
    serial: { rx: 'U0R (GPIO3)', tx: 'U0T (GPIO1)' },
    analog: ['GPIO12', 'GPIO13'],
    digital: ['GPIO13', 'GPIO12', 'GPIO2', 'GPIO16'],
    note: { my: 'ကင်မရာနှင့် SD card က pin အများစုကို သုံးထားသဖြင့် အသုံးပြုနိုင်သော GPIO အနည်းငယ်သာ ကျန်သည် — GPIO0 ကို flash mode အတွက် ချန်ထားပါ။ 5V ဖြင့် ဖြည့်ပါ။', en: 'The camera + SD card use most pins, so only a few GPIOs are free — keep GPIO0 for flash mode. Power it from 5V.' },
  },
  'raspberry-pi-pico': {
    id: 'raspberry-pi-pico',
    name: 'Pi Pico',
    logic: '3.3V',
    power: '3V3 (OUT)',
    powerAlt: 'VSYS (5V)',
    gnd: 'GND',
    i2c: { sda: 'GP0 (SDA)', scl: 'GP1 (SCL)' },
    spi: { mosi: 'GP3 (TX)', miso: 'GP4 (RX)', sck: 'GP2 (SCK)', cs: 'GP5 (CSn)' },
    serial: { rx: 'GP1 (RX)', tx: 'GP0 (TX)' },
    analog: ['GP26 (ADC0)', 'GP27 (ADC1)', 'GP28 (ADC2)'],
    digital: ['GP6', 'GP7', 'GP8', 'GP9', 'GP10', 'GP11'],
    note: { my: '3.3V logic — GP26–28 သာ ADC ဖြစ်သည်။ VSYS သို့ 1.8–5.5V ထည့်နိုင်သည်။', en: '3.3V logic — only GP26–28 are ADC. VSYS accepts 1.8–5.5V in.' },
  },
  'raspberry-pi': {
    id: 'raspberry-pi',
    name: 'Raspberry Pi',
    logic: '3.3V',
    power: '3V3 (pin1)',
    powerAlt: '5V (pin2)',
    gnd: 'GND',
    i2c: { sda: 'GPIO2 (pin3)', scl: 'GPIO3 (pin5)' },
    spi: { mosi: 'GPIO10 (MOSI)', miso: 'GPIO9 (MISO)', sck: 'GPIO11 (SCLK)', cs: 'GPIO8 (CE0)' },
    serial: { rx: 'GPIO15 (RXD)', tx: 'GPIO14 (TXD)' },
    analog: null,
    digital: ['GPIO4', 'GPIO17', 'GPIO27', 'GPIO22', 'GPIO5', 'GPIO6'],
    note: NO_ADC,
  },
  'jetson-nano': {
    id: 'jetson-nano',
    name: 'Jetson Nano',
    logic: '3.3V',
    power: '3V3 (pin1)',
    powerAlt: '5V (pin2)',
    gnd: 'GND',
    i2c: { sda: 'pin3 (SDA)', scl: 'pin5 (SCL)' },
    spi: { mosi: 'pin19 (MOSI)', miso: 'pin21 (MISO)', sck: 'pin23 (SCK)', cs: 'pin24 (CS0)' },
    serial: { rx: 'pin10 (RXD)', tx: 'pin8 (TXD)' },
    analog: null,
    digital: ['pin7', 'pin11', 'pin13', 'pin15', 'pin29', 'pin31'],
    note: NO_ADC,
  },
  'orange-pi': {
    id: 'orange-pi',
    name: 'Orange Pi',
    logic: '3.3V',
    power: '3V3 (pin1)',
    powerAlt: '5V (pin2)',
    gnd: 'GND',
    i2c: { sda: 'pin3 (SDA)', scl: 'pin5 (SCL)' },
    spi: { mosi: 'pin19 (MOSI)', miso: 'pin21 (MISO)', sck: 'pin23 (SCLK)', cs: 'pin24 (CE0)' },
    serial: { rx: 'pin10 (RX)', tx: 'pin8 (TX)' },
    analog: null,
    digital: ['pin7', 'pin11', 'pin13', 'pin15', 'pin16', 'pin18'],
    note: NO_ADC,
  },
  stm32: {
    id: 'stm32',
    name: 'STM32 Blue Pill',
    logic: '3.3V',
    power: '3.3V',
    powerAlt: '5V',
    gnd: 'GND',
    i2c: { sda: 'PB7 (SDA)', scl: 'PB6 (SCL)' },
    spi: { mosi: 'PA7 (MOSI)', miso: 'PA6 (MISO)', sck: 'PA5 (SCK)', cs: 'PA4 (NSS)' },
    serial: { rx: 'PA10 (RX1)', tx: 'PA9 (TX1)' },
    analog: ['PA0', 'PA1', 'PA2', 'PA3'],
    digital: ['PB0', 'PB1', 'PB10', 'PB11', 'PA8', 'PB12'],
    note: { my: '3.3V logic (pin အများစု 5V-tolerant)။ I²C=PB6/PB7၊ USART1=PA9/PA10။', en: '3.3V logic (most pins are 5V-tolerant). I²C on PB6/PB7, USART1 on PA9/PA10.' },
  },
  teensy: {
    id: 'teensy',
    name: 'Teensy 4.0',
    logic: '3.3V',
    power: '3.3V',
    powerAlt: 'VIN (5V)',
    gnd: 'GND',
    i2c: { sda: 'pin18 (SDA)', scl: 'pin19 (SCL)' },
    spi: { mosi: 'pin11 (MOSI)', miso: 'pin12 (MISO)', sck: 'pin13 (SCK)', cs: 'pin10 (CS)' },
    serial: { rx: 'pin0 (RX1)', tx: 'pin1 (TX1)' },
    analog: ['A0', 'A1', 'A2', 'A3'],
    digital: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
    note: { my: '⚠ 3.3V only — pin များသည် 5V-tolerant မဟုတ်ပါ။ 5V signal ကို level shifter ဖြင့်သာ ချိတ်ပါ။', en: '⚠ 3.3V only — pins are NOT 5V-tolerant. Only connect 5V signals through a level shifter.' },
  },
  attiny85: {
    id: 'attiny85',
    name: 'ATtiny85',
    logic: '5V',
    power: 'VCC',
    gnd: 'GND',
    i2c: { sda: 'PB0 (SDA)', scl: 'PB2 (SCL)' },
    spi: { mosi: 'PB0 (DO)', miso: 'PB1 (DI)', sck: 'PB2 (SCK)', cs: 'PB3' },
    serial: null,
    analog: ['PB3 (A3)', 'PB4 (A2)', 'PB2 (A1)'],
    digital: ['PB0', 'PB1', 'PB3', 'PB4'],
    note: { my: 'I/O pin ၅ ခုသာ ရှိသည် (PB0–PB4၊ PB5=reset)။ I²C ကို USI ဖြင့် software အနေဖြင့် လုပ်ရသည်။', en: 'Only 5 I/O pins (PB0–PB4; PB5 is reset). I²C is done in software via USI.' },
  },
  'micro-bit': {
    id: 'micro-bit',
    name: 'micro:bit',
    logic: '3.3V',
    power: '3V',
    gnd: 'GND',
    i2c: { sda: 'P20 (SDA)', scl: 'P19 (SCL)' },
    spi: { mosi: 'P15 (MOSI)', miso: 'P14 (MISO)', sck: 'P13 (SCK)', cs: 'P16 (CS)' },
    serial: null,
    analog: ['P0', 'P1', 'P2'],
    digital: ['P0', 'P1', 'P2', 'P8', 'P16', 'P12'],
    note: { my: '3.3V logic — pin အများစုကို ရယူရန် edge-connector breakout လိုအပ်သည်။ ကြီးသော ring (0,1,2) ကို crocodile clip ဖြင့် တွဲနိုင်သည်။', en: '3.3V logic — most pins need an edge-connector breakout; the big rings (0,1,2) take crocodile clips.' },
  },
};

/** Ordered board ids for the selector (popular/beginner boards first). */
export const BOARD_ORDER = [
  'arduino-uno',
  'arduino-nano',
  'arduino-mega',
  'arduino-pro-mini',
  'esp32',
  'esp32-cam',
  'esp8266',
  'nodemcu',
  'raspberry-pi-pico',
  'raspberry-pi',
  'stm32',
  'teensy',
  'attiny85',
  'micro-bit',
  'jetson-nano',
  'orange-pi',
];

export function getBoardProfile(id: string): BoardProfile {
  return BOARD_PROFILES[id] ?? BOARD_PROFILES['arduino-uno'];
}
