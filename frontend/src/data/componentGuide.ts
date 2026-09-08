/**
 * Practical usage guide for every toolkit component (complements components.ts
 * which holds identity/spec, and componentSpecs.ts which holds the datasheet
 * table). This file answers the student-facing questions: "What is it for?",
 * "Where is it used?", "How do I wire it?", "Show me starter code", "What does
 * it cost?", "What can I use instead?", and "What should I watch out for?".
 *
 * Localization policy — descriptive prose (whatFor / useCases / cautions) is
 * bilingual via Label {my,en} so the Burmese-first UI reads naturally, while
 * technical tokens (pin names, code, library names, prices) stay language-neutral
 * (standard engineering terminology) to avoid mistranslation.
 */
import type { Label } from '@/lib/i18n';

const L = (my: string, en: string): Label => ({ my, en });

export interface PinRow {
  /** Physical pin / terminal name as printed on the part (e.g. "VCC", "TRIG"). */
  pin: string;
  /** What the pin does and where it connects — bilingual. */
  desc: Label;
}

export interface CodeSample {
  /** Language label shown on the snippet header (e.g. "Arduino C++", "Python"). */
  lang: string;
  /** The starter snippet itself (kept short — setup + read + output). */
  code: string;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ComponentGuide {
  /** One-paragraph plain-language answer to "what is this and why use it". */
  whatFor?: Label;
  /** Bullet list of typical real projects it appears in. */
  useCases?: Label[];
  /** Pin / terminal connection table. */
  pinout?: PinRow[];
  /** Free-form wiring note (power, pull-ups, level shifting…). */
  wiring?: Label;
  /** Copy-pasteable starter snippet. */
  code?: CodeSample;
  /** Rough street price in Myanmar (MMK), language-neutral. */
  price?: string;
  /** Names of interchangeable / similar parts a student could swap in. */
  alternatives?: string[];
  /** Gotchas that commonly damage the part or waste a student's time. */
  cautions?: Label[];
  /** Drivers, libraries or frameworks usually paired with it. */
  libraries?: string[];
  /** Relative difficulty to get working. */
  difficulty?: Difficulty;
}

/**
 * id → guide. Only ids present here render the extra sections; every other
 * component still shows its photo + spec table + tags unchanged (graceful
 * fallback), so the toolkit is never broken while guides are filled wave by wave.
 */
export const COMPONENT_GUIDES: Record<string, ComponentGuide> = {
  // ─── Boards & MCUs ────────────────────────────────────────────────────────
  'arduino-uno': {
    difficulty: 'beginner',
    whatFor: L(
      'အီလက်ထရွန်နစ် စတင်လေ့လာသူတိုင်းအတွက် အခြေခံအကျဆုံး ဘုတ်ဖြစ်ပြီး sensor ဖတ်ခြင်း၊ မော်တာ/LED ထိန်းချုပ်ခြင်းတို့ကို လွယ်ကူစွာ လုပ်နိုင်သည်။ USB နဲ့ တိုက်ရိုက် program ရေးလို့ရပြီး 5V pin တွေက ကြံ့ခိုင်လို့ လက်တွေ့စမ်းသပ်ရာမှာ အသင့်တော်ဆုံး။',
      'The most beginner-friendly board for learning electronics — read sensors, drive motors/LEDs, and prototype logic. Programmed straight over USB with robust 5V pins that tolerate wiring mistakes.',
    ),
    useCases: [
      L('sensor ဖတ်၍ LCD ပေါ်ပြသော ရာသီဥတု station', 'Weather station reading sensors onto an LCD'),
      L('အလိုအလျောက် အပင်ရေလောင်းစနစ်', 'Automatic plant-watering system'),
      L('line-following / obstacle-avoiding robot', 'Line-following / obstacle-avoiding robot'),
    ],
    pinout: [
      { pin: 'D0–D13', desc: L('ဒစ်ဂျစ်တယ် I/O (D3,5,6,9,10,11 = PWM)', 'Digital I/O (D3,5,6,9,10,11 are PWM)') },
      { pin: 'A0–A5', desc: L('analog input (10-bit ADC)', 'Analog input (10-bit ADC)') },
      { pin: '5V / 3.3V', desc: L('sensor ပါဝါ ထုတ်ပေးရန်', 'Power output for sensors') },
      { pin: 'GND', desc: L('မြေ (ground) — အတူတူ ဆက်ရန်', 'Ground — must be common with peripherals') },
      { pin: 'VIN', desc: L('ပြင်ပ 7–12V ထည့်ရန်', 'External 7–12V input') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup() {\n  pinMode(13, OUTPUT);      // onboard LED\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  Serial.println("LED on");\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}`,
    },
    price: '~15,000–25,000 MMK (clone), ~45,000+ (genuine)',
    alternatives: ['Arduino Nano', 'Arduino Pro Mini', 'ESP32'],
    cautions: [
      L('pin တစ်ခုစီ 40mA သာ ခံနိုင် — မော်တာ တိုက်ရိုက်မတပ်ရ၊ driver သုံးပါ', 'Each pin sources only 40mA — never drive motors directly; use a driver'),
      L('5V logic — 3.3V sensor အချို့နဲ့ level shifter လိုနိုင်', '5V logic — may need a level shifter with some 3.3V sensors'),
    ],
    libraries: ['Servo', 'Wire (I2C)', 'LiquidCrystal', 'SoftwareSerial'],
  },

  'arduino-nano': {
    difficulty: 'beginner',
    whatFor: L(
      'Arduino Uno နဲ့ chip တူသော်လည်း အရွယ်အစား သေးငယ်၍ breadboard ပေါ် တိုက်ရိုက်စိုက်၍ရသည်။ နေရာကျဉ်းသော wearable သို့မဟုတ် ပြီးပြည့်စုံသော prototype များအတွက် သင့်တော်။',
      'Same chip as the Uno but tiny enough to plug straight into a breadboard — ideal for compact wearables and finished prototypes where space matters.',
    ),
    useCases: [
      L('breadboard ပေါ်က permanent ငယ် project', 'Permanent small breadboard builds'),
      L('wearable / လက်ပတ်စက်ပစ္စည်း', 'Wearable / wrist-worn gadgets'),
      L('sensor node အသေးစား', 'Compact sensor nodes'),
    ],
    pinout: [
      { pin: 'D0–D13', desc: L('ဒစ်ဂျစ်တယ် I/O (6 PWM)', 'Digital I/O (6 PWM)') },
      { pin: 'A0–A7', desc: L('analog input ၈ ခု', '8 analog inputs') },
      { pin: '5V / GND', desc: L('ပါဝါ + မြေ', 'Power + ground') },
      { pin: 'VIN', desc: L('7–12V ပြင်ပ ပါဝါ', '7–12V external power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(300);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(300);\n}`,
    },
    price: '~8,000–15,000 MMK',
    alternatives: ['Arduino Uno', 'Arduino Pro Mini', 'Raspberry Pi Pico'],
    cautions: [
      L('clone အများစုက CH340 driver ကို PC မှာ ထည့်ရန်လို', 'Most clones need the CH340 USB driver installed on the PC'),
      L('mini-USB port ကွဲလွယ် — သတိထား', 'The mini-USB port is fragile — handle with care'),
    ],
    libraries: ['Servo', 'Wire (I2C)', 'Adafruit_Sensor'],
  },

  'arduino-mega': {
    difficulty: 'beginner',
    whatFor: L(
      'pin အများကြီး (54 digital + 16 analog) လိုသော ကြီးမားသည့် project များအတွက် Arduino ဗားရှင်း။ display၊ sensor အများ၊ motor အများကို တစ်ပြိုင်နက် ချိတ်ဆက်နိုင်သည်။',
      'The big-pin Arduino (54 digital + 16 analog) for projects that outgrow the Uno — many displays, sensors and motors wired at once.',
    ),
    useCases: [
      L('3D printer controller', '3D printer controllers'),
      L('LED အများ / matrix ကြီး', 'Large LED arrays / matrices'),
      L('sensor အများပါသော automation panel', 'Automation panels with many sensors'),
    ],
    pinout: [
      { pin: 'D0–D53', desc: L('ဒစ်ဂျစ်တယ် I/O ၅၄ ခု (15 PWM)', '54 digital I/O (15 PWM)') },
      { pin: 'A0–A15', desc: L('analog input ၁၆ ခု', '16 analog inputs') },
      { pin: 'Serial1–3', desc: L('hardware UART ၄ ခု (RX/TX)', '4 hardware UARTs (RX/TX)') },
      { pin: '5V / GND / VIN', desc: L('ပါဝါ pin များ', 'Power pins') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup() {\n  Serial.begin(9600);\n  Serial1.begin(9600);   // second UART, only on Mega\n}\n\nvoid loop() {\n  Serial.println("Mega has 4 serial ports");\n  delay(1000);\n}`,
    },
    price: '~30,000–45,000 MMK',
    alternatives: ['Arduino Uno', 'ESP32', 'Teensy 4.0'],
    cautions: [
      L('Uno shield အများစု တပ်လို့ရသော်လည်း pin အားလုံး မကိုက်နိုင်', 'Most Uno shields fit but not every pin lines up'),
      L('Uno ထက် ဈေးကြီး — pin မလိုရင် အလဟဿ', 'Pricier than a Uno — overkill if you don\u2019t need the pins'),
    ],
    libraries: ['Servo', 'Wire', 'LiquidCrystal', 'Marlin (3D print)'],
  },

  esp32: {
    difficulty: 'intermediate',
    whatFor: L(
      'Wi-Fi နဲ့ Bluetooth နှစ်မျိုးလုံး built-in ပါသော dual-core MCU ဖြစ်၍ IoT project တိုင်းအတွက် အကောင်းဆုံး ရွေးချယ်စရာ။ cloud သို့ data ပို့ခြင်း၊ web server run ခြင်းတို့ လုပ်နိုင်သည်။',
      'A dual-core MCU with built-in Wi-Fi and Bluetooth — the go-to choice for IoT. It can push data to the cloud and even run its own web server.',
    ),
    useCases: [
      L('cloud သို့ တင်သော IoT sensor dashboard', 'Cloud-connected IoT sensor dashboards'),
      L('smart home ထိန်းချုပ်မှု', 'Smart-home control'),
      L('ESP-NOW / BLE mesh network', 'ESP-NOW / BLE mesh networks'),
    ],
    pinout: [
      { pin: '3V3', desc: L('3.3V ပါဝါ ထုတ် (5V မဟုတ်!)', '3.3V power out (NOT 5V!)') },
      { pin: 'GPIOxx', desc: L('multi-function I/O (ADC, touch, PWM)', 'Multi-function I/O (ADC, touch, PWM)') },
      { pin: 'EN', desc: L('reset/enable', 'Reset/enable') },
      { pin: 'VIN/5V', desc: L('USB မှ 5V ဝင်', '5V in from USB') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <WiFi.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin("SSID", "PASSWORD");\n  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }\n  Serial.println(WiFi.localIP());\n}\n\nvoid loop() {}`,
    },
    price: '~12,000–20,000 MMK',
    alternatives: ['ESP8266', 'Raspberry Pi Pico W', 'Arduino Nano ESP32'],
    cautions: [
      L('GPIO တွေ 3.3V သာ — 5V sensor တိုက်ရိုက် ဖတ်ရင် ပျက်နိုင်', 'GPIO is 3.3V only — reading 5V directly can damage it'),
      L('ADC2 pin တွေ Wi-Fi ဖွင့်ထားစဉ် အသုံးမပြုနိုင်', 'ADC2 pins are unusable while Wi-Fi is on'),
      L('boot pin (GPIO0,2,15) တွေကို boot အချိန် သတိထား', 'Watch the strapping pins (GPIO0,2,15) at boot'),
    ],
    libraries: ['WiFi', 'PubSubClient (MQTT)', 'ESPAsyncWebServer', 'BluetoothSerial'],
  },

  esp8266: {
    difficulty: 'intermediate',
    whatFor: L(
      'ဈေးအသက်သာဆုံး Wi-Fi microcontroller ဖြစ်၍ ရိုးရှင်းသော IoT project (sensor တစ်ခု cloud တင်) အတွက် လုံလောက်သည်။ ESP32 ၏ ရှေးဦး မျိုးဆက်။',
      'The cheapest Wi-Fi microcontroller — plenty for simple IoT (push one sensor to the cloud). The predecessor of the ESP32.',
    ),
    useCases: [
      L('single-sensor cloud logger', 'Single-sensor cloud loggers'),
      L('Wi-Fi ခလုတ် / smart plug', 'Wi-Fi buttons / smart plugs'),
      L('MQTT node အသေးစား', 'Small MQTT nodes'),
    ],
    pinout: [
      { pin: '3V3', desc: L('3.3V ပါဝါ', '3.3V power') },
      { pin: 'GPIO0/2/15', desc: L('boot mode pin — သတိထား', 'Boot-mode strapping pins — handle carefully') },
      { pin: 'A0', desc: L('analog input (0–1V သာ)', 'Analog input (0–1V only)') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <ESP8266WiFi.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin("SSID", "PASSWORD");\n  while (WiFi.status() != WL_CONNECTED) delay(500);\n  Serial.println(WiFi.localIP());\n}\n\nvoid loop() {}`,
    },
    price: '~7,000–12,000 MMK',
    alternatives: ['ESP32', 'NodeMCU', 'Raspberry Pi Pico W'],
    cautions: [
      L('GPIO နည်း (usable ~9) — pin အများလိုရင် ESP32 သုံး', 'Few usable GPIO (~9) — use ESP32 if you need more'),
      L('A0 က 0–1V သာ — voltage divider လို', 'A0 reads only 0–1V — needs a voltage divider'),
    ],
    libraries: ['ESP8266WiFi', 'PubSubClient', 'ESPAsyncWebServer'],
  },

  'esp32-cam': {
    difficulty: 'advanced',
    whatFor: L(
      'ESP32 ပေါ်မှာ camera တပ်ထားသည့် module ဖြစ်၍ ဓာတ်ပုံ/video ကို Wi-Fi ဖြင့် streaming လုပ်နိုင်သည်။ ဈေးသက်သာသော CCTV၊ face detection project များအတွက်။',
      'An ESP32 with an onboard camera — stream photos/video over Wi-Fi. Great for low-cost CCTV and face-detection projects.',
    ),
    useCases: [
      L('Wi-Fi CCTV / door camera', 'Wi-Fi CCTV / doorbell cameras'),
      L('face / motion detection', 'Face / motion detection'),
      L('wildlife / trap camera', 'Wildlife / trap cameras'),
    ],
    pinout: [
      { pin: '5V / GND', desc: L('ပါဝါ (5V ပေးမှ တည်ငြိမ်)', 'Power (5V for stability)') },
      { pin: 'U0R / U0T', desc: L('program ရေးရန် UART (RX/TX)', 'UART for flashing (RX/TX)') },
      { pin: 'GPIO0', desc: L('flash mode — GND နဲ့ ဆက်၍ program', 'Tie to GND to enter flash mode') },
    ],
    wiring: L(
      'program ရေးရန် USB-TTL adapter သီးသန့်လို — GPIO0 ကို GND နဲ့ ဆက်ပြီး flash, ပြီးမှ ဖြုတ်ပါ။',
      'Needs a separate USB-TTL adapter to flash — jumper GPIO0 to GND, upload, then remove the jumper.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `// Use the built-in example:\n// File > Examples > ESP32 > Camera > CameraWebServer\n// Set board = "AI Thinker ESP32-CAM",\n// fill in WiFi SSID/PASSWORD, upload with GPIO0->GND,\n// then open the printed IP in a browser.`,
    },
    price: '~15,000–22,000 MMK (with adapter)',
    alternatives: ['ESP32 + OV2640', 'Raspberry Pi + Camera'],
    cautions: [
      L('USB port မပါ — flashing အတွက် USB-TTL မဖြစ်မနေလို', 'No USB port — a USB-TTL adapter is mandatory for flashing'),
      L('ပါဝါ မလုံလောက်ရင် brownout error — 5V/2A သုံး', 'Under-power causes brownout errors — use a solid 5V/2A supply'),
    ],
    libraries: ['esp_camera', 'WiFi', 'ESPAsyncWebServer'],
  },

  'raspberry-pi': {
    difficulty: 'intermediate',
    whatFor: L(
      'Linux run နိုင်သော single-board computer အပြည့်အစုံ ဖြစ်၍ camera, AI, database, web server စသည့် ကြီးမားသော အလုပ်များ လုပ်နိုင်သည်။ microcontroller မဟုတ်ဘဲ ကွန်ပျူတာ တစ်လုံးလုံး။',
      'A full Linux single-board computer — heavy tasks like camera vision, AI, databases and web servers. Not a microcontroller but a whole computer.',
    ),
    useCases: [
      L('AI / computer vision project', 'AI / computer-vision projects'),
      L('home server / NAS / web host', 'Home server / NAS / web host'),
      L('retro game / media center', 'Retro-game / media centers'),
    ],
    pinout: [
      { pin: '40-pin GPIO', desc: L('3.3V logic ဒစ်ဂျစ်တယ် pin များ', '3.3V-logic digital pins') },
      { pin: '5V / 3.3V', desc: L('ပါဝါ ထုတ် pin', 'Power output pins') },
      { pin: 'I2C/SPI/UART', desc: L('GPIO ပေါ်တွင် ရရှိ', 'Available on the header') },
      { pin: 'USB-C', desc: L('5V/3A ပါဝါ ဝင်', '5V/3A power input') },
    ],
    code: {
      lang: 'Python',
      code: `from gpiozero import LED\nfrom time import sleep\n\nled = LED(17)          # BCM GPIO17\nwhile True:\n    led.on();  sleep(0.5)\n    led.off(); sleep(0.5)`,
    },
    price: '~120,000–250,000 MMK (by RAM)',
    alternatives: ['Orange Pi', 'NVIDIA Jetson Nano', 'Raspberry Pi Zero 2 W'],
    cautions: [
      L('GPIO 3.3V သာ — 5V ထည့်ရင် board ပျက်', 'GPIO is 3.3V only — 5V will fry the board'),
      L('ပါဝါ မလုံလောက်ရင် SD card ပျက်လွယ် — official 5V/3A သုံး', 'Weak power corrupts the SD card — use an official 5V/3A supply'),
      L('shutdown မလုပ်ဘဲ ပါဝါဖြုတ်ရင် SD ပျက်နိုင်', 'Pulling power without shutdown can corrupt the SD card'),
    ],
    libraries: ['gpiozero', 'RPi.GPIO', 'picamera2', 'OpenCV'],
  },

  'raspberry-pi-pico': {
    difficulty: 'beginner',
    whatFor: L(
      'RP2040 dual-core chip သုံးထားသော ဈေးသက်သာသည့် microcontroller ဖြစ်၍ MicroPython နဲ့ လွယ်ကူစွာ program ရေးနိုင်သည်။ PIO ဆိုသည့် ထူးခြားချက်ဖြင့် precise timing signal များ ထုတ်နိုင်သည်။',
      'A cheap microcontroller on the RP2040 dual-core chip — easy to program in MicroPython. Its unique PIO blocks generate precise timed signals.',
    ),
    useCases: [
      L('MicroPython သင်ကြားရေး', 'Teaching MicroPython'),
      L('custom signal / protocol (PIO) generation', 'Custom signal / protocol generation via PIO'),
      L('data logger / sensor node', 'Data loggers / sensor nodes'),
    ],
    pinout: [
      { pin: 'GP0–GP28', desc: L('GPIO (3 × 12-bit ADC)', 'GPIO (3 × 12-bit ADC)') },
      { pin: '3V3(OUT)', desc: L('3.3V ပါဝါ ထုတ်', '3.3V power out') },
      { pin: 'VSYS', desc: L('1.8–5.5V ပါဝါ ဝင်', '1.8–5.5V power in') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'MicroPython',
      code: `from machine import Pin\nfrom time import sleep\n\nled = Pin(25, Pin.OUT)   # onboard LED\nwhile True:\n    led.toggle()\n    sleep(0.5)`,
    },
    price: '~6,000–10,000 MMK (W: ~12,000)',
    alternatives: ['Arduino Nano', 'ESP32', 'STM32 Blue Pill'],
    cautions: [
      L('GPIO 3.3V သာ — 5V tolerant မဟုတ်', 'GPIO is 3.3V only — not 5V tolerant'),
      L('Wi-Fi လိုရင် "Pico W" version ဝယ်ပါ', 'For Wi-Fi buy the "Pico W" version'),
    ],
    libraries: ['machine (MicroPython)', 'Pico SDK (C)', 'CircuitPython'],
  },

  stm32: {
    difficulty: 'advanced',
    whatFor: L(
      '32-bit ARM Cortex-M chip သုံးထားသော စွမ်းအားမြင့် microcontroller ဖြစ်၍ Arduino ထက် မြန်ပြီး peripheral များ ပိုကြွယ်ဝသည်။ industrial / motor control project များအတွက် သင့်တော်။',
      'A high-performance 32-bit ARM Cortex-M microcontroller — faster than Arduino with richer peripherals. Suited to industrial and motor-control work.',
    ),
    useCases: [
      L('motor / drone flight control', 'Motor / drone flight control'),
      L('real-time signal processing', 'Real-time signal processing'),
      L('industrial ထိန်းချုပ်မှု', 'Industrial control'),
    ],
    pinout: [
      { pin: 'PA0–PC15', desc: L('GPIO (5V tolerant အများစု)', 'GPIO (mostly 5V-tolerant)') },
      { pin: '3.3V / GND', desc: L('ပါဝါ + မြေ', 'Power + ground') },
      { pin: 'SWDIO/SWCLK', desc: L('ST-Link debug port', 'ST-Link debug port') },
      { pin: 'BOOT0', desc: L('boot mode ရွေးရန်', 'Selects boot mode') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `// STM32duino core\nvoid setup() { pinMode(PC13, OUTPUT); }\n\nvoid loop() {\n  digitalWrite(PC13, LOW);  delay(300);  // LED on\n  digitalWrite(PC13, HIGH); delay(300);  // LED off\n}`,
    },
    price: '~8,000–15,000 MMK (+ ST-Link ~6,000)',
    alternatives: ['Teensy 4.0', 'ESP32', 'Raspberry Pi Pico'],
    cautions: [
      L('program ရေးရန် ST-Link သို့ USB-TTL လို', 'Needs an ST-Link or USB-TTL to program'),
      L('clone board အချို့ 3.3V regulator ညံ့ — သတိထား', 'Some clones have a weak 3.3V regulator — check before use'),
    ],
    libraries: ['STM32duino', 'STM32Cube HAL', 'libopencm3'],
  },

  'arduino-pro-mini': {
    difficulty: 'intermediate',
    whatFor: L(
      'Arduino ထဲ အသေးဆုံးနဲ့ ပါဝါ အသုံးအနည်းဆုံး ဗားရှင်း ဖြစ်၍ battery ဖြင့် ကြာရှည် run ရမည့် project များအတွက် သင့်တော်။ USB port မပါ။',
      'The smallest, lowest-power Arduino — ideal for battery projects that must run for a long time. It has no USB port.',
    ),
    useCases: [
      L('battery-powered sensor node', 'Battery-powered sensor nodes'),
      L('wearable', 'Wearables'),
      L('ကြာရှည် remote logger', 'Long-running remote loggers'),
    ],
    pinout: [
      { pin: 'D0–D13 / A0–A7', desc: L('I/O pin များ', 'I/O pins') },
      { pin: 'VCC', desc: L('regulated ပါဝါ ဝင် (3.3/5V)', 'Regulated power in (3.3/5V)') },
      { pin: 'RAW', desc: L('unregulated ပါဝါ ဝင်', 'Unregulated power in') },
      { pin: 'DTR/TX/RX', desc: L('FTDI program header', 'FTDI programming header') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <avr/sleep.h>\n\nvoid setup() { pinMode(13, OUTPUT); }\n\nvoid loop() {\n  digitalWrite(13, HIGH); delay(100);\n  digitalWrite(13, LOW);  delay(2000);   // low-duty blink saves power\n}`,
    },
    price: '~5,000–9,000 MMK (+ FTDI ~6,000)',
    alternatives: ['Arduino Nano', 'ATtiny85', 'Raspberry Pi Pico'],
    cautions: [
      L('program ရေးရန် FTDI/USB-TTL adapter မဖြစ်မနေလို', 'A FTDI/USB-TTL adapter is required to program'),
      L('3.3V နဲ့ 5V version ရှိ — voltage မှားရင် sensor ပျက်နိုင်', 'Comes in 3.3V and 5V — wrong voltage can damage peripherals'),
    ],
    libraries: ['LowPower', 'Servo', 'Wire'],
  },

  nodemcu: {
    difficulty: 'beginner',
    whatFor: L(
      'ESP8266 chip ကို USB port နဲ့ breadboard-friendly board အဖြစ် ထုတ်ထားသည်။ Wi-Fi IoT စတင်လေ့လာသူများအတွက် အလွယ်ကူဆုံး ဝင်ပေါက်။',
      'An ESP8266 packaged as a USB-equipped, breadboard-friendly board — the easiest entry point for learning Wi-Fi IoT.',
    ),
    useCases: [
      L('Blynk / MQTT IoT စမ်းသပ်ရေး', 'Blynk / MQTT IoT experiments'),
      L('smart plug / relay ထိန်းချုပ်', 'Smart plug / relay control'),
      L('sensor cloud logger', 'Sensor cloud loggers'),
    ],
    pinout: [
      { pin: 'D0–D8', desc: L('ဒစ်ဂျစ်တယ် I/O (GPIO နဲ့ map)', 'Digital I/O (mapped to GPIO)') },
      { pin: 'A0', desc: L('analog input (0–3.3V on board)', 'Analog input (0–3.3V on-board)') },
      { pin: '3V3 / VIN / GND', desc: L('ပါဝါ pin များ', 'Power pins') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <ESP8266WiFi.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin("SSID", "PASSWORD");\n  while (WiFi.status() != WL_CONNECTED) delay(500);\n  Serial.println(WiFi.localIP());\n}\n\nvoid loop() {}`,
    },
    price: '~9,000–14,000 MMK',
    alternatives: ['ESP8266 (bare)', 'ESP32', 'Wemos D1 Mini'],
    cautions: [
      L('D-pin နံပါတ်နဲ့ GPIO နံပါတ် မတူ — mapping ကြည့်ပါ', 'D-pin numbers differ from GPIO numbers — check the mapping'),
      L('CH340 driver ကို PC မှာ ထည့်ရန်လိုနိုင်', 'May need the CH340 USB driver on the PC'),
    ],
    libraries: ['ESP8266WiFi', 'Blynk', 'PubSubClient'],
  },

  'jetson-nano': {
    difficulty: 'advanced',
    whatFor: L(
      'GPU ပါဝင်သော single-board computer ဖြစ်၍ AI / deep-learning inference ကို edge device ပေါ်တွင် real-time run နိုင်သည်။ camera-based AI project များအတွက် အထူးသင့်တော်။',
      'A GPU-equipped single-board computer that runs AI / deep-learning inference in real time at the edge — ideal for camera-based AI projects.',
    ),
    useCases: [
      L('real-time object detection (YOLO)', 'Real-time object detection (YOLO)'),
      L('face recognition system', 'Face-recognition systems'),
      L('autonomous robot vision', 'Autonomous-robot vision'),
    ],
    pinout: [
      { pin: '40-pin GPIO', desc: L('Raspberry Pi နဲ့ compatible header', 'Raspberry-Pi-compatible header') },
      { pin: 'CSI', desc: L('camera ချိတ်ရန်', 'Camera connector') },
      { pin: 'DC jack / USB-C', desc: L('5V/4A ပါဝါ', '5V/4A power') },
    ],
    code: {
      lang: 'Python',
      code: `import torch\nprint("CUDA available:", torch.cuda.is_available())\n# Run YOLO/TensorRT models with GPU acceleration here`,
    },
    price: '~350,000–600,000 MMK',
    alternatives: ['Raspberry Pi 4 + Coral TPU', 'Jetson Orin Nano'],
    cautions: [
      L('ပါဝါ မလုံလောက်ရင် reboot — 5V/4A barrel jack သုံး', 'Under-power causes reboots — use a 5V/4A barrel jack'),
      L('JetPack version နဲ့ library compatibility သတိထား', 'Mind JetPack-version library compatibility'),
    ],
    libraries: ['PyTorch', 'TensorRT', 'OpenCV', 'DeepStream'],
  },

  'orange-pi': {
    difficulty: 'intermediate',
    whatFor: L(
      'Raspberry Pi ၏ ဈေးသက်သာသော အစားထိုး single-board computer ဖြစ်၍ Linux / Android run နိုင်သည်။ spec အလိုက် ဗားရှင်း အမျိုးမျိုး ရှိသည်။',
      'A cheaper Raspberry-Pi alternative single-board computer running Linux/Android, available in many spec variants.',
    ),
    useCases: [
      L('home server / NAS ဈေးသက်သာ', 'Budget home server / NAS'),
      L('media center', 'Media centers'),
      L('IoT gateway', 'IoT gateways'),
    ],
    pinout: [
      { pin: '40-pin GPIO', desc: L('Pi-style header (mapping ကွဲနိုင်)', 'Pi-style header (mapping may differ)') },
      { pin: '5V / GND', desc: L('ပါဝါ pin', 'Power pins') },
      { pin: 'USB / HDMI', desc: L('peripheral ports', 'Peripheral ports') },
    ],
    code: {
      lang: 'Python',
      code: `# Uses OPi.GPIO (Orange Pi GPIO library)\nimport OPi.GPIO as GPIO\nGPIO.setmode(GPIO.BOARD)\nGPIO.setup(7, GPIO.OUT)\nGPIO.output(7, GPIO.HIGH)`,
    },
    price: '~60,000–180,000 MMK',
    alternatives: ['Raspberry Pi 4', 'Banana Pi', 'Rock Pi'],
    cautions: [
      L('community / OS support က Raspberry Pi ထက် နည်း', 'Community / OS support is thinner than Raspberry Pi'),
      L('board model အလိုက် GPIO library ကွဲ', 'GPIO library differs by board model'),
    ],
    libraries: ['OPi.GPIO', 'wiringOP', 'Armbian'],
  },

  attiny85: {
    difficulty: 'intermediate',
    whatFor: L(
      '8-pin သာပါသော အသေးဆုံး microcontroller ဖြစ်၍ ရိုးရှင်းပြီး ဈေးသက်သာသည့် single-task project များအတွက် သင့်တော်။ Arduino IDE နဲ့ program ရေးနိုင်သည်။',
      'A tiny 8-pin microcontroller — perfect for simple, cheap single-task projects. Programmable from the Arduino IDE.',
    ),
    useCases: [
      L('LED effect / blink controller', 'LED-effect / blink controllers'),
      L('ရိုးရှင်းသော timer / switch', 'Simple timers / switches'),
      L('tiny wearable', 'Tiny wearables'),
    ],
    pinout: [
      { pin: 'PB0–PB5', desc: L('I/O pin ၅ ခု (PB5 = reset)', '5 I/O pins (PB5 is reset)') },
      { pin: 'VCC / GND', desc: L('ပါဝါ + မြေ', 'Power + ground') },
    ],
    wiring: L(
      'program ရေးရန် Arduino Uno ကို ISP programmer အဖြစ် သုံးရ (ArduinoISP sketch)။',
      'Program it using an Arduino Uno as an ISP programmer (the ArduinoISP sketch).',
    ),
    code: {
      lang: 'Arduino C++',
      code: `void setup() { pinMode(0, OUTPUT); }  // PB0\n\nvoid loop() {\n  digitalWrite(0, HIGH); delay(200);\n  digitalWrite(0, LOW);  delay(200);\n}`,
    },
    price: '~2,000–4,000 MMK',
    alternatives: ['ATtiny13', 'Arduino Pro Mini', 'Raspberry Pi Pico'],
    cautions: [
      L('pin နည်း (5) — task ကြီးရင် မလုံလောက်', 'Only 5 I/O pins — insufficient for big tasks'),
      L('USB မပါ — ISP programmer မဖြစ်မနေလို', 'No USB — an ISP programmer is mandatory'),
    ],
    libraries: ['ATTinyCore', 'TinyWireM (I2C)'],
  },

  teensy: {
    difficulty: 'advanced',
    whatFor: L(
      'အလွန်မြန်သော ARM Cortex-M7 chip သုံးထားသည့် စွမ်းအားမြင့် board ဖြစ်၍ audio processing, USB device emulation စသည့် ကြီးမားသော အလုပ်များ လုပ်နိုင်သည်။',
      'A high-performance board on the very fast ARM Cortex-M7 — capable of heavy tasks like audio processing and USB-device emulation.',
    ),
    useCases: [
      L('real-time audio / synth', 'Real-time audio / synths'),
      L('USB MIDI / keyboard emulation', 'USB MIDI / keyboard emulation'),
      L('high-speed data acquisition', 'High-speed data acquisition'),
    ],
    pinout: [
      { pin: 'D0–D39', desc: L('ဒစ်ဂျစ်တယ် I/O ၄၀ ခု', '40 digital I/O') },
      { pin: 'A0–A13', desc: L('analog input', 'Analog inputs') },
      { pin: 'VIN / GND / 3.3V', desc: L('ပါဝါ pin များ', 'Power pins') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup() { pinMode(13, OUTPUT); }\n\nvoid loop() {\n  digitalWrite(13, HIGH); delay(100);\n  digitalWrite(13, LOW);  delay(100);\n}`,
    },
    price: '~45,000–70,000 MMK',
    alternatives: ['STM32', 'Raspberry Pi Pico', 'ESP32'],
    cautions: [
      L('Teensyduino add-on ကို Arduino IDE မှာ ထည့်ရန်လို', 'Requires the Teensyduino add-on in the Arduino IDE'),
      L('3.3V logic — pin အများစု 5V tolerant မဟုတ်', '3.3V logic — most pins are not 5V tolerant'),
    ],
    libraries: ['Teensyduino', 'Audio Library', 'USBHost_t36'],
  },

  'micro-bit': {
    difficulty: 'beginner',
    whatFor: L(
      'ကျောင်းသင်ခန်းစာအတွက် ဒီဇိုင်းဆွဲထားသော board ဖြစ်၍ LED matrix, button, sensor များ built-in ပါသည်။ block-based (MakeCode) သို့မဟုတ် Python ဖြင့် program ရေးနိုင်၍ ကလေးများ စတင်ရန် အလွယ်ကူဆုံး။',
      'A board designed for the classroom with a built-in LED matrix, buttons and sensors. Programmed with blocks (MakeCode) or Python — the easiest start for kids.',
    ),
    useCases: [
      L('STEM သင်ကြားရေး', 'STEM education'),
      L('ရိုးရှင်းသော game / step counter', 'Simple games / step counters'),
      L('radio-linked sensor project', 'Radio-linked sensor projects'),
    ],
    pinout: [
      { pin: '0,1,2', desc: L('ကြီးမားသော I/O ring (crocodile clip)', 'Large I/O rings for crocodile clips') },
      { pin: '3V / GND', desc: L('ပါဝါ ring', 'Power rings') },
      { pin: 'edge connector', desc: L('pin ၂၅ ခု (breakout လို)', '25-pin edge (needs a breakout)') },
    ],
    code: {
      lang: 'MicroPython',
      code: `from microbit import *\n\nwhile True:\n    display.show(Image.HEART)\n    sleep(500)\n    display.clear()\n    sleep(500)`,
    },
    price: '~35,000–50,000 MMK',
    alternatives: ['Raspberry Pi Pico', 'Arduino Uno', 'Calliope Mini'],
    cautions: [
      L('GPIO နည်း — project ကြီးရင် breakout board လို', 'Few GPIO — a breakout board is needed for bigger projects'),
      L('edge connector pin သေး — direct wiring ခက်', 'Edge pins are small — direct wiring is awkward'),
    ],
    libraries: ['microbit (MicroPython)', 'MakeCode blocks'],
  },

  // ─── Sensors ──────────────────────────────────────────────────────────────
  dht11: {
    difficulty: 'beginner',
    whatFor: L(
      'အပူချိန်နဲ့ စိုထိုင်းဆကို တစ်ပြိုင်နက် တိုင်းတာပေးသော ဈေးသက်သာသည့် sensor။ DHT22 က DHT11 ထက် တိကျမှု ပိုကောင်းသည်။',
      'A cheap sensor that measures temperature and humidity together. The DHT22 is the more accurate sibling of the DHT11.',
    ),
    useCases: [
      L('ရာသီဥတု station', 'Weather stations'),
      L('ဖန်လုံအိမ် / greenhouse စောင့်ကြည့်မှု', 'Greenhouse monitoring'),
      L('အခန်းတွင်း သက်တောင့်သက်သာ တိုင်းစနစ်', 'Indoor comfort monitors'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('3–5.5V ပါဝါ', '3–5.5V power') },
      { pin: 'DATA', desc: L('single-wire ဒေတာ (10k pull-up လို)', 'Single-wire data (needs a 10k pull-up)') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <DHT.h>\nDHT dht(2, DHT11);   // data on D2\n\nvoid setup() { Serial.begin(9600); dht.begin(); }\nvoid loop() {\n  Serial.print(dht.readTemperature()); Serial.print(" C  ");\n  Serial.println(dht.readHumidity());\n  delay(2000);\n}`,
    },
    price: '~3,000–6,000 MMK',
    alternatives: ['DHT22 / AM2302', 'BME280', 'SHT31'],
    cautions: [
      L('DATA line မှာ 10k pull-up resistor မထည့်ရင် ဖတ်မရ', 'Without a 10k pull-up on DATA it won\u2019t read'),
      L('sampling rate နှေး — 1–2 စက္ကန့်တစ်ခါသာ ဖတ်ပါ', 'Slow sampling — read only once every 1–2 seconds'),
    ],
    libraries: ['DHT sensor library (Adafruit)', 'Adafruit_Sensor'],
  },

  ds18b20: {
    difficulty: 'beginner',
    whatFor: L(
      'ရေစိုခံ probe ပုံစံ ရနိုင်သော digital အပူချိန် sensor ဖြစ်၍ 1-Wire bus တစ်ခုတည်းပေါ်တွင် အများအပြား ချိတ်နိုင်သည်။',
      'A digital temperature sensor available as a waterproof probe — many can share one 1-Wire bus.',
    ),
    useCases: [
      L('ရေ / အရည် အပူချိန် တိုင်းခြင်း', 'Water / liquid temperature'),
      L('ဖန်လုံအိမ် အပူချိန် logger', 'Greenhouse temperature loggers'),
      L('brewing / cooking temp', 'Brewing / cooking temperature'),
    ],
    pinout: [
      { pin: 'VDD (red)', desc: L('3–5.5V ပါဝါ', '3–5.5V power') },
      { pin: 'DQ (yellow)', desc: L('1-Wire ဒေတာ (4.7k pull-up)', '1-Wire data (4.7k pull-up)') },
      { pin: 'GND (black)', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <OneWire.h>\n#include <DallasTemperature.h>\nOneWire ow(2);\nDallasTemperature s(&ow);\n\nvoid setup(){ Serial.begin(9600); s.begin(); }\nvoid loop(){\n  s.requestTemperatures();\n  Serial.println(s.getTempCByIndex(0));\n  delay(1000);\n}`,
    },
    price: '~4,000–8,000 MMK (probe)',
    alternatives: ['LM35', 'DHT22', 'PT100 (industrial)'],
    cautions: [
      L('DQ line မှာ 4.7k pull-up မဖြစ်မနေလို', 'A 4.7k pull-up on DQ is mandatory'),
      L('probe wire ရှည်ရင် parasitic power မသုံးဘဲ VDD ပေးပါ', 'For long probe leads power VDD directly, not parasitic'),
    ],
    libraries: ['OneWire', 'DallasTemperature'],
  },

  lm35: {
    difficulty: 'beginner',
    whatFor: L(
      'analog voltage အဖြစ် အပူချိန်ကို တိုက်ရိုက် ထုတ်ပေးသော sensor (10mV = 1°C)။ library မလို၊ ADC pin တစ်ခုနဲ့ ဖတ်နိုင်။',
      'Outputs temperature directly as an analog voltage (10mV per °C). No library needed — read it on one ADC pin.',
    ),
    useCases: [
      L('ရိုးရှင်းသော အပူချိန် display', 'Simple temperature displays'),
      L('fan/heater ထိန်းချုပ်မှု', 'Fan / heater control'),
      L('analog ADC သင်ကြားရေး', 'Teaching analog ADC'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('4–30V ပါဝါ', '4–30V power') },
      { pin: 'OUT', desc: L('analog output (10mV/°C)', 'Analog output (10mV/°C)') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  float v = analogRead(A0) * 5.0 / 1024.0;\n  Serial.println(v * 100);   // °C\n  delay(500);\n}`,
    },
    price: '~1,500–3,000 MMK',
    alternatives: ['DS18B20', 'DHT11', 'TMP36'],
    cautions: [
      L('pin ပြောင်းပြန်တပ်ရင် ချက်ချင်း ပူပြီး ပျက်တတ်', 'Reversing the pins overheats and destroys it'),
      L('long wire ဆိုရင် noise ဝင်လွယ် — filter cap ထည့်ပါ', 'Long wires pick up noise — add a filter cap'),
    ],
    libraries: [],
  },

  'hc-sr04': {
    difficulty: 'beginner',
    whatFor: L(
      'အသံလှိုင်း (ultrasonic) သုံး၍ အကွာအဝေးကို 2–400cm အထိ တိုင်းပေးသော sensor။ robot နဲ့ level တိုင်း project တွေမှာ အသုံးအများဆုံး။',
      'Measures distance from 2–400cm using ultrasonic pulses. A staple in robots and level-measuring projects.',
    ),
    useCases: [
      L('obstacle-avoiding robot', 'Obstacle-avoiding robots'),
      L('ရေတိုင်ကီ level တိုင်း', 'Water-tank level measurement'),
      L('parking / distance alarm', 'Parking / distance alarms'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('5V ပါဝါ', '5V power') },
      { pin: 'TRIG', desc: L('trigger pulse ထုတ်ရန်', 'Send the trigger pulse') },
      { pin: 'ECHO', desc: L('echo ပြန်လာချိန် ဖတ်ရန် (5V!)', 'Reads echo return time (5V!)') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#define TRIG 9\n#define ECHO 10\nvoid setup(){ Serial.begin(9600); pinMode(TRIG,OUTPUT); pinMode(ECHO,INPUT); }\nvoid loop(){\n  digitalWrite(TRIG,HIGH); delayMicroseconds(10); digitalWrite(TRIG,LOW);\n  long cm = pulseIn(ECHO,HIGH) / 58.0;\n  Serial.println(cm);\n  delay(200);\n}`,
    },
    price: '~2,500–4,500 MMK',
    alternatives: ['JSN-SR04T (waterproof)', 'VL53L0X (laser)', 'HC-SR04+'],
    cautions: [
      L('ECHO က 5V ထုတ် — ESP32 (3.3V) မှာ voltage divider လို', 'ECHO outputs 5V — needs a divider on ESP32 (3.3V)'),
      L('အနူးအညံ့ / ထောင့်စောက် မျက်နှာပြင်တွေ မိန်းမမှန်', 'Soft or angled surfaces reflect poorly'),
    ],
    libraries: ['NewPing (optional)'],
  },

  pir: {
    difficulty: 'beginner',
    whatFor: L(
      'လူ/တိရစ္ဆာန်၏ ကိုယ်ပူ (infrared) ရွေ့လျားမှုကို ရှာဖွေပေးသော sensor။ ရွေ့လျားမှုတွေ့ရင် digital HIGH ထုတ်သည်။',
      'Detects the infrared body-heat movement of people/animals, outputting a digital HIGH when motion is sensed.',
    ),
    useCases: [
      L('ခိုးဝင်သူ သတိပေးစနစ်', 'Intruder alarms'),
      L('အလိုအလျောက် မီးဖွင့်ခြင်း', 'Automatic lighting'),
      L('လူရောက်ရင် နှုတ်ဆက်သည့် စနစ်', 'Presence-triggered greeters'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('4.5–20V ပါဝါ', '4.5–20V power') },
      { pin: 'OUT', desc: L('digital HIGH/LOW', 'Digital HIGH/LOW') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); pinMode(2,INPUT); }\nvoid loop(){\n  if (digitalRead(2) == HIGH) Serial.println("Motion!");\n  delay(200);\n}`,
    },
    price: '~2,000–3,500 MMK',
    alternatives: ['RCWL-0516 (microwave)', 'Ultrasonic + logic'],
    cautions: [
      L('ပါဝါဖွင့်ပြီး ~30s warm-up လိုသည်', 'Needs ~30s warm-up after power-on'),
      L('delay နဲ့ sensitivity pot ၂ ခုကို ချိန်ပါ', 'Tune the two pots — delay and sensitivity'),
    ],
    libraries: [],
  },

  ldr: {
    difficulty: 'beginner',
    whatFor: L(
      'အလင်းရောင် အနည်းအများအလိုက် resistance ပြောင်းသော ရိုးရှင်းသည့် sensor။ voltage divider နဲ့ ADC ဖတ်ရသည်။',
      'A simple sensor whose resistance changes with light level — read via a voltage divider on an ADC pin.',
    ),
    useCases: [
      L('အလိုအလျောက် လမ်းမီး / night light', 'Automatic street / night lights'),
      L('အလင်းရောင် တိုင်းစနစ်', 'Light-level measurement'),
      L('solar tracker', 'Solar trackers'),
    ],
    pinout: [
      { pin: 'A', desc: L('တစ်ဖက် — VCC သို့', 'One leg — to VCC') },
      { pin: 'B', desc: L('တစ်ဖက် — 10k နဲ့ GND + ADC pin', 'Other leg — 10k to GND + ADC pin') },
    ],
    wiring: L(
      'LDR + 10k resistor ဖြင့် voltage divider ဆောက်ပြီး အလယ်ချက်ကို analog pin နဲ့ ဖတ်ပါ။',
      'Form a voltage divider with the LDR and a 10k resistor; read the midpoint on an analog pin.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  Serial.println(analogRead(A0));  // brighter = higher\n  delay(300);\n}`,
    },
    price: '~300–800 MMK',
    alternatives: ['BH1750 (digital lux)', 'TEMT6000', 'Photodiode'],
    cautions: [
      L('divider resistor မပါဘဲ တိုက်ရိုက် ဖတ်၍မရ', 'Cannot read directly without a divider resistor'),
      L('lux အတိအကျ မတိုင်းနိုင် — relative သာ', 'Not calibrated in lux — relative readings only'),
    ],
    libraries: [],
  },

  bh1750: {
    difficulty: 'beginner',
    whatFor: L(
      'အလင်းရောင်ကို lux အတိအကျ digital (I2C) ဖြင့် တိုင်းပေးသော sensor။ LDR ထက် တိကျပြီး calibration မလို။',
      'Measures light in accurate digital lux over I2C — more precise than an LDR and needs no calibration.',
    ),
    useCases: [
      L('lux အတိအကျ တိုင်းစနစ်', 'Accurate lux metering'),
      L('smart lighting auto-dim', 'Smart-lighting auto-dim'),
      L('camera / photography aid', 'Camera / photography aids'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('2.4–3.6V ပါဝါ', '2.4–3.6V power') },
      { pin: 'SDA / SCL', desc: L('I2C bus', 'I2C bus') },
      { pin: 'ADDR', desc: L('I2C address ရွေးရန်', 'Selects I2C address') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <BH1750.h>\nBH1750 meter;\nvoid setup(){ Serial.begin(9600); Wire.begin(); meter.begin(); }\nvoid loop(){\n  Serial.println(meter.readLightLevel());  // lux\n  delay(500);\n}`,
    },
    price: '~3,000–5,000 MMK',
    alternatives: ['TSL2561', 'VEML7700', 'LDR (basic)'],
    cautions: [
      L('3.3V sensor — 5V board မှာ level ကြည့်ပါ', '3.3V sensor — check levels on a 5V board'),
      L('I2C pull-up module ပေါ်မှာ ရှိမရှိ စစ်ပါ', 'Check the module already has I2C pull-ups'),
    ],
    libraries: ['BH1750', 'Wire'],
  },

  mq2: {
    difficulty: 'intermediate',
    whatFor: L(
      'LPG, propane, မီးခိုးနဲ့ hydrogen စသည့် ဓာတ်ငွေ့များကို ရှာဖွေပေးသော sensor။ analog နဲ့ digital output နှစ်မျိုးလုံး ရှိသည်။',
      'Detects gases like LPG, propane, smoke and hydrogen. Provides both analog and digital outputs.',
    ),
    useCases: [
      L('မီးခိုး / ဓာတ်ငွေ့ ယိုစိမ့် သတိပေးစနစ်', 'Smoke / gas-leak alarms'),
      L('မီးဘေး ကြိုတင်သတိပေးမှု', 'Early fire warning'),
      L('lab safety monitor', 'Lab safety monitors'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('5V ပါဝါ (heater)', '5V power (heater)') },
      { pin: 'AO', desc: L('analog output', 'Analog output') },
      { pin: 'DO', desc: L('digital threshold output', 'Digital threshold output') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  Serial.println(analogRead(A0));  // higher = more gas\n  delay(500);\n}`,
    },
    price: '~2,500–4,000 MMK',
    alternatives: ['MQ-5', 'MQ-9', 'MQ-135 (air quality)'],
    cautions: [
      L('~20s warm-up ပြီးမှ တိကျ', 'Accurate only after ~20s warm-up'),
      L('ppm အတိအကျ လိုရင် calibration လို', 'Needs calibration for accurate ppm'),
      L('heater ကြောင့် ပူတတ် — သတိထား', 'The heater runs warm — handle carefully'),
    ],
    libraries: ['MQUnifiedsensor (optional)'],
  },

  mq135: {
    difficulty: 'intermediate',
    whatFor: L(
      'NH3, NOx, CO2, benzene စသည့် ညစ်ညမ်းဓာတ်ငွေ့များကို ရှာ၍ လေထုအရည်အသွေး တိုင်းရာတွင် သုံးသည်။',
      'Senses pollutants like NH3, NOx, CO2 and benzene — used for air-quality monitoring.',
    ),
    useCases: [
      L('လေထုအရည်အသွေး monitor', 'Air-quality monitors'),
      L('အခန်းတွင်း CO2 စောင့်ကြည့်မှု', 'Indoor CO2 monitoring'),
      L('IoT environment station', 'IoT environment stations'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('5V ပါဝါ', '5V power') },
      { pin: 'AO', desc: L('analog output', 'Analog output') },
      { pin: 'DO', desc: L('digital output', 'Digital output') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  Serial.println(analogRead(A0));\n  delay(1000);\n}`,
    },
    price: '~3,000–5,000 MMK',
    alternatives: ['CCS811', 'SGP30', 'MH-Z19 (true CO2)'],
    cautions: [
      L('CO2 ppm အတိအကျ လိုရင် calibration မဖြစ်မနေလို', 'Calibration required for true CO2 ppm'),
      L('warm-up ကြာ (~၂၄ နာရီ burn-in ကောင်း)', 'Long warm-up (~24h burn-in is best)'),
    ],
    libraries: ['MQ135 library'],
  },

  mq7: {
    difficulty: 'intermediate',
    whatFor: L(
      'အန္တရာယ်ရှိသော ကာဗွန်မိုနောက်ဆိုက် (CO) ဓာတ်ငွေ့ကို အထူးပြု ရှာဖွေပေးသော sensor။',
      'A sensor specialised for detecting dangerous carbon-monoxide (CO) gas.',
    ),
    useCases: [
      L('CO safety alarm', 'CO safety alarms'),
      L('ကားထရန်း / garage monitor', 'Garage / exhaust monitors'),
      L('boiler room စောင့်ကြည့်မှု', 'Boiler-room monitoring'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('5V (heater cycle)', '5V (cycled heater)') },
      { pin: 'AO / DO', desc: L('analog + digital output', 'Analog + digital output') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  Serial.println(analogRead(A0));\n  delay(1000);\n}`,
    },
    price: '~3,000–5,000 MMK',
    alternatives: ['MQ-9', 'MiCS-5524', 'Dedicated CO module'],
    cautions: [
      L('heater ကို voltage ၂ ဆင့် cycle လုပ်ရ — datasheet ကြည့်', 'The heater must be voltage-cycled — see datasheet'),
      L('life-safety အတွက် certified detector သုံးသင့်', 'Use a certified detector for real life-safety'),
    ],
    libraries: ['MQUnifiedsensor (optional)'],
  },

  'soil-moisture': {
    difficulty: 'beginner',
    whatFor: L(
      'မြေဆီလွှာထဲ ရေဓာတ် အနည်းအများကို တိုင်းပေးသော sensor။ အလိုအလျောက် ရေလောင်းစနစ် project များ၏ အသည်းနှလုံး။',
      'Measures how much water is in the soil — the heart of automatic plant-watering projects.',
    ),
    useCases: [
      L('အလိုအလျောက် အပင်ရေလောင်းစနစ်', 'Automatic plant watering'),
      L('smart farming / irrigation', 'Smart farming / irrigation'),
      L('မြေဆီလွှာ စောင့်ကြည့်မှု', 'Soil monitoring'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
      { pin: 'AO', desc: L('analog moisture level', 'Analog moisture level') },
      { pin: 'DO', desc: L('digital threshold (LM393)', 'Digital threshold (LM393)') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  int v = analogRead(A0);   // drier = higher\n  Serial.println(v);\n  delay(1000);\n}`,
    },
    price: '~1,500–4,000 MMK (capacitive pricier)',
    alternatives: ['Capacitive soil sensor', 'Watermark sensor'],
    cautions: [
      L('resistive type က ခြေထောက် သံချေးတက်လွယ် — capacitive ပိုကြာခံ', 'Resistive probes corrode — capacitive lasts far longer'),
      L('probe ကို အမြဲ power ပေးထားရင် သံချေးမြန် — cycle လုပ်ပါ', 'Keeping it always powered speeds corrosion — power-cycle it'),
    ],
    libraries: [],
  },

  'rain-sensor': {
    difficulty: 'beginner',
    whatFor: L(
      'မိုးရေ / ရေစက်များ ကျရောက်မှုကို ရှာဖွေပေးသော sensor။ မိုးရွာလာလျှင် အလိုအလျောက် တုံ့ပြန်စေနိုင်သည်။',
      'Detects rain / falling water drops, so a project can react automatically when it starts raining.',
    ),
    useCases: [
      L('အလိုအလျောက် အဝတ်ခြောက်လှန်းစနစ်', 'Automatic clothes-line retractors'),
      L('smart window / sunroof', 'Smart windows / sunroofs'),
      L('ရာသီဥတု station', 'Weather stations'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
      { pin: 'AO / DO', desc: L('analog + digital output', 'Analog + digital output') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); pinMode(2,INPUT); }\nvoid loop(){\n  if (digitalRead(2) == LOW) Serial.println("Rain detected");\n  delay(500);\n}`,
    },
    price: '~1,500–3,000 MMK',
    alternatives: ['Capacitive rain sensor', 'Optical rain sensor'],
    cautions: [
      L('plate က ရေထဲ အမြဲရှိရင် သံချေးတက်', 'The plate corrodes if constantly wet'),
      L('threshold ကို pot နဲ့ ချိန်ပါ', 'Tune the threshold with the pot'),
    ],
    libraries: [],
  },

  'water-level': {
    difficulty: 'beginner',
    whatFor: L(
      'ရေ၏ အမြင့် သို့မဟုတ် ရှိ/မရှိ ကို conductive trace များဖြင့် တိုင်းပေးသော ရိုးရှင်းသည့် sensor။',
      'A simple sensor that gauges water height or presence using conductive traces.',
    ),
    useCases: [
      L('ရေတိုင်ကီ level indicator', 'Water-tank level indicators'),
      L('ရေလျှံ သတိပေးစနစ်', 'Overflow / flood alarms'),
      L('အလိုအလျောက် pump ထိန်းချုပ်', 'Automatic pump control'),
    ],
    pinout: [
      { pin: 'VCC / +', desc: L('3–5V ပါဝါ', '3–5V power') },
      { pin: 'S (signal)', desc: L('analog level output', 'Analog level output') },
      { pin: 'GND / -', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  Serial.println(analogRead(A0));  // higher = more water\n  delay(500);\n}`,
    },
    price: '~1,000–2,500 MMK',
    alternatives: ['Ultrasonic (HC-SR04)', 'Float switch', 'Pressure sensor'],
    cautions: [
      L('trace က ရေထဲ အမြဲ — သံချေးမြန်၊ cycle power ပါ', 'Traces corrode quickly if always wet — power-cycle'),
      L('အရည်ညစ်ညမ်းမှုက reading ကို လွှမ်း', 'Dirty water skews readings'),
    ],
    libraries: [],
  },

  'flow-sensor': {
    difficulty: 'intermediate',
    whatFor: L(
      'အရည်စီးဆင်းနှုန်း (L/min) ကို Hall-effect turbine ဖြင့် တိုင်းပေးသော sensor။ pulse count ကို flow အဖြစ် တွက်သည်။',
      'Measures liquid flow rate (L/min) with a Hall-effect turbine — pulse count converts to flow.',
    ),
    useCases: [
      L('ရေသုံးစွဲမှု တိုင်းစနစ်', 'Water-usage metering'),
      L('smart irrigation dosing', 'Smart-irrigation dosing'),
      L('drink dispenser', 'Drink dispensers'),
    ],
    pinout: [
      { pin: 'VCC (red)', desc: L('5–18V ပါဝါ', '5–18V power') },
      { pin: 'SIGNAL (yellow)', desc: L('pulse output (interrupt pin)', 'Pulse output (use an interrupt pin)') },
      { pin: 'GND (black)', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `volatile int pulses = 0;\nvoid tick(){ pulses++; }\nvoid setup(){ Serial.begin(9600); attachInterrupt(0, tick, RISING); }\nvoid loop(){\n  pulses = 0; delay(1000);\n  Serial.println(pulses / 7.5);  // L/min\n}`,
    },
    price: '~4,000–7,000 MMK',
    alternatives: ['YF-B1 (brass)', 'Ultrasonic flow meter'],
    cautions: [
      L('SIGNAL ကို interrupt pin မှာသာ တပ်ပါ', 'Wire SIGNAL only to an interrupt-capable pin'),
      L('K-factor (7.5) က model အလိုက် ကွဲ — datasheet ကြည့်', 'The K-factor (7.5) varies by model — check the datasheet'),
    ],
    libraries: [],
  },

  'flame-sensor': {
    difficulty: 'beginner',
    whatFor: L(
      'မီးတောက်မှ ထွက်သော infrared ရောင်ခြည်ကို ရှာဖွေ၍ မီးလောင်မှုကို ချက်ချင်း သိစေသော sensor။',
      'Detects the infrared radiation from flames to spot a fire instantly.',
    ),
    useCases: [
      L('မီးသတ် robot', 'Fire-fighting robots'),
      L('မီးဘေး သတိပေးစနစ်', 'Fire alarms'),
      L('safety shutdown system', 'Safety shutdown systems'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
      { pin: 'AO / DO', desc: L('analog + digital output', 'Analog + digital output') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); pinMode(2,INPUT); }\nvoid loop(){\n  if (digitalRead(2) == LOW) Serial.println("Flame!");\n  delay(200);\n}`,
    },
    price: '~1,500–3,000 MMK',
    alternatives: ['UV flame sensor', 'Thermopile', 'MLX90614 (IR temp)'],
    cautions: [
      L('နေရောင်ခြည် / IR remote ကြောင့် false trigger', 'Sunlight / IR remotes can cause false triggers'),
      L('detection angle ကျဉ်း (~60°)', 'Narrow detection angle (~60°)'),
    ],
    libraries: [],
  },

  mpu6050: {
    difficulty: 'intermediate',
    whatFor: L(
      '3-axis gyroscope + 3-axis accelerometer ပေါင်းစပ်ထားသော IMU sensor။ ထောင့်၊ ရွေ့လျားမှု၊ လှုပ်ရှားမှုကို တိုင်းသည်။',
      'A 6-axis IMU (gyroscope + accelerometer) that measures orientation, motion and tilt.',
    ),
    useCases: [
      L('self-balancing robot', 'Self-balancing robots'),
      L('drone flight controller', 'Drone flight controllers'),
      L('gesture / motion control', 'Gesture / motion control'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
      { pin: 'SDA / SCL', desc: L('I2C bus', 'I2C bus') },
      { pin: 'INT', desc: L('data-ready interrupt', 'Data-ready interrupt') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Wire.h>\n#include <MPU6050.h>\nMPU6050 imu;\nvoid setup(){ Serial.begin(9600); Wire.begin(); imu.initialize(); }\nvoid loop(){\n  int16_t ax,ay,az,gx,gy,gz;\n  imu.getMotion6(&ax,&ay,&az,&gx,&gy,&gz);\n  Serial.println(ax);\n  delay(200);\n}`,
    },
    price: '~3,000–5,000 MMK',
    alternatives: ['MPU-9250 (9-axis)', 'BNO055 (fused)', 'ADXL345'],
    cautions: [
      L('gyro drift ရှိ — complementary/Kalman filter လို', 'Gyro drifts — needs a complementary/Kalman filter'),
      L('I2C address 0x68/0x69 — AD0 pin နဲ့ ရွေး', 'I2C address 0x68/0x69 — set by the AD0 pin'),
    ],
    libraries: ['MPU6050 (Electronic Cats)', 'I2Cdev', 'Wire'],
  },

  hmc5883l: {
    difficulty: 'intermediate',
    whatFor: L(
      'မြေ၏ သံလိုက်စက်ကွင်းကို တိုင်း၍ ရှေ့တည့်တည့် (heading/compass) ကို ရှာပေးသော 3-axis magnetometer။',
      'A 3-axis magnetometer that reads the Earth\u2019s magnetic field to find heading (a digital compass).',
    ),
    useCases: [
      L('ဒစ်ဂျစ်တယ် compass', 'Digital compasses'),
      L('robot navigation / heading', 'Robot navigation / heading'),
      L('drone yaw reference', 'Drone yaw reference'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('3.3V ပါဝါ', '3.3V power') },
      { pin: 'SDA / SCL', desc: L('I2C bus', 'I2C bus') },
      { pin: 'DRDY', desc: L('data-ready output', 'Data-ready output') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Wire.h>\n#include <QMC5883LCompass.h>\nQMC5883LCompass c;\nvoid setup(){ Serial.begin(9600); c.init(); }\nvoid loop(){\n  c.read();\n  Serial.println(c.getAzimuth());  // heading°\n  delay(250);\n}`,
    },
    price: '~2,500–4,500 MMK',
    alternatives: ['QMC5883L', 'LIS3MDL', 'MPU-9250'],
    cautions: [
      L('သံလိုက် / မော်တာ အနီး တွင်မထားနှင့် — reading ပျက်', 'Keep away from magnets / motors — they distort readings'),
      L('တကယ့် chip အများစုက QMC5883L ဖြစ် — library မှား မတပ်ပါနှင့်', 'Many modules are actually QMC5883L — use the matching library'),
    ],
    libraries: ['QMC5883LCompass', 'Adafruit_HMC5883_Unified'],
  },

  bmp280: {
    difficulty: 'intermediate',
    whatFor: L(
      'လေဖိအား၊ အပူချိန် (BME280 မှာ စိုထိုင်းဆပါ) ကို တိကျစွာ တိုင်းပေးသော sensor။ ဖိအားမှ အမြင့်ပေ (altitude) တွက်နိုင်။',
      'Accurately measures barometric pressure and temperature (BME280 adds humidity). Pressure gives altitude.',
    ),
    useCases: [
      L('ရာသီဥတု station', 'Weather stations'),
      L('altitude / အမြင့်ပေ တိုင်းစနစ်', 'Altitude measurement'),
      L('drone barometric hold', 'Drone barometric hold'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('3.3V ပါဝါ', '3.3V power') },
      { pin: 'SDA / SCL', desc: L('I2C bus (SPI လည်းရ)', 'I2C bus (SPI also supported)') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Adafruit_BMP280.h>\nAdafruit_BMP280 bmp;\nvoid setup(){ Serial.begin(9600); bmp.begin(0x76); }\nvoid loop(){\n  Serial.print(bmp.readTemperature()); Serial.print(" C  ");\n  Serial.println(bmp.readPressure()/100.0);  // hPa\n  delay(1000);\n}`,
    },
    price: '~3,000–6,000 MMK (BME280 pricier)',
    alternatives: ['BME280 (+humidity)', 'BMP388', 'MS5611'],
    cautions: [
      L('I2C address 0x76/0x77 — module အလိုက် ကွဲ', 'I2C address 0x76/0x77 — varies by module'),
      L('BMP280 မှာ humidity မပါ — လိုရင် BME280 ဝယ်ပါ', 'BMP280 has no humidity — buy BME280 if you need it'),
    ],
    libraries: ['Adafruit_BMP280', 'Adafruit_BME280', 'Wire'],
  },

  'load-cell': {
    difficulty: 'intermediate',
    whatFor: L(
      'အလေးချိန် / အားကို တိုင်းပေးသော load cell ကို HX711 amplifier ဖြင့် ဖတ်သည်။ ဒစ်ဂျစ်တယ် ချိန်ခွင် project များ၏ အခြေခံ။',
      'A load cell measures weight/force, read through an HX711 amplifier — the basis of digital-scale projects.',
    ),
    useCases: [
      L('ဒစ်ဂျစ်တယ် ချိန်ခွင်', 'Digital scales'),
      L('force / tension တိုင်းစနစ်', 'Force / tension measurement'),
      L('smart storage / inventory', 'Smart storage / inventory'),
    ],
    pinout: [
      { pin: 'E+ / E-', desc: L('load cell excitation', 'Load-cell excitation') },
      { pin: 'A+ / A-', desc: L('load cell signal', 'Load-cell signal') },
      { pin: 'DT / SCK', desc: L('HX711 → MCU ဒေတာ', 'HX711 → MCU data') },
      { pin: 'VCC / GND', desc: L('ပါဝါ', 'Power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <HX711.h>\nHX711 scale;\nvoid setup(){ Serial.begin(9600); scale.begin(3,2); scale.set_scale(2280); scale.tare(); }\nvoid loop(){\n  Serial.println(scale.get_units(5));  // grams\n  delay(500);\n}`,
    },
    price: '~4,000–8,000 MMK (cell + HX711)',
    alternatives: ['Different load-cell ratings', 'FSR (rough force)'],
    cautions: [
      L('calibration factor ကို known weight နဲ့ ချိန်ပါ', 'Calibrate the scale factor with a known weight'),
      L('load cell ကို rated capacity ကျော် မတင်ရ', 'Never exceed the load cell\u2019s rated capacity'),
    ],
    libraries: ['HX711 (bogde)'],
  },

  'ir-sensor': {
    difficulty: 'beginner',
    whatFor: L(
      'အနီးအနား အတားအဆီး / အရာဝတ္ထုကို infrared ပြန်ဟပ်မှုဖြင့် ရှာဖွေပေးသော ဈေးသက်သာသည့် sensor။',
      'A cheap sensor that detects nearby obstacles/objects via reflected infrared light.',
    ),
    useCases: [
      L('line-following / obstacle robot', 'Line-following / obstacle robots'),
      L('object counter', 'Object counters'),
      L('အလိုအလျောက် တံခါး / ဆပ်ပြာ dispenser', 'Automatic doors / soap dispensers'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
      { pin: 'OUT', desc: L('digital HIGH/LOW', 'Digital HIGH/LOW') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); pinMode(2,INPUT); }\nvoid loop(){\n  if (digitalRead(2) == LOW) Serial.println("Obstacle");\n  delay(100);\n}`,
    },
    price: '~800–2,000 MMK',
    alternatives: ['HC-SR04 (distance)', 'VL53L0X', 'TCRT5000'],
    cautions: [
      L('range ကို pot နဲ့ ချိန်ပါ (~2–30cm)', 'Tune the range with the pot (~2–30cm)'),
      L('အနက်ရောင် / အလင်းစုပ် မျက်နှာပြင် မတွေ့တတ်', 'Struggles with black / light-absorbing surfaces'),
    ],
    libraries: [],
  },

  'color-sensor': {
    difficulty: 'intermediate',
    whatFor: L(
      'အရောင် (RGB) ကို ရှာဖွေ၍ frequency အဖြစ် ထုတ်ပေးသော sensor။ အရောင်ခွဲ project များအတွက်။',
      'Detects colour (RGB) and outputs it as a frequency — for colour-sorting projects.',
    ),
    useCases: [
      L('အရောင်ခွဲ machine (M&M sorter)', 'Colour-sorting machines'),
      L('အရောင် ဖတ် robot', 'Colour-reading robots'),
      L('quality-control detection', 'Quality-control detection'),
    ],
    pinout: [
      { pin: 'VCC / GND', desc: L('ပါဝါ', 'Power') },
      { pin: 'S0–S3', desc: L('frequency scaling + colour filter ရွေး', 'Frequency scaling + colour-filter select') },
      { pin: 'OUT', desc: L('frequency output', 'Frequency output') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `// Set S2=LOW,S3=LOW for red filter, then:\nint red = pulseIn(outPin, LOW);\nSerial.println(red);  // lower pulse = more of that colour`,
    },
    price: '~3,000–5,000 MMK',
    alternatives: ['TCS34725 (I2C, better)', 'APDS-9960'],
    cautions: [
      L('ပတ်ဝန်းကျင် အလင်းက reading ကို လွှမ်း — shroud/LED ထည့်ပါ', 'Ambient light skews readings — add a shroud/LED'),
      L('white/black calibration လုပ်ရ', 'Requires white/black calibration'),
    ],
    libraries: ['Adafruit_TCS34725 (for I2C variant)'],
  },

  'heart-rate': {
    difficulty: 'intermediate',
    whatFor: L(
      'လက်ချောင်းထိပ်မှ သွေးစီးဆင်းမှုကို အလင်းဖြင့် ဖတ်၍ နှလုံးခုန်နှုန်း (BPM) နှင့် SpO2 ကို တိုင်းပေးသည်။',
      'Reads blood flow at the fingertip with light to measure heart rate (BPM) and blood-oxygen (SpO2).',
    ),
    useCases: [
      L('ကျန်းမာရေး / fitness monitor', 'Health / fitness monitors'),
      L('pulse oximeter project', 'Pulse-oximeter projects'),
      L('IoT patient monitoring', 'IoT patient monitoring'),
    ],
    pinout: [
      { pin: 'VIN', desc: L('1.8–5V ပါဝါ', '1.8–5V power') },
      { pin: 'SDA / SCL', desc: L('I2C bus', 'I2C bus') },
      { pin: 'INT', desc: L('interrupt output', 'Interrupt output') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Wire.h>\n#include "MAX30105.h"\nMAX30105 s;\nvoid setup(){ Serial.begin(9600); s.begin(); s.setup(); }\nvoid loop(){\n  Serial.println(s.getIR());  // process for BPM\n}`,
    },
    price: '~5,000–9,000 MMK',
    alternatives: ['MAX30102', 'MAX30105', 'Pulse Sensor (analog)'],
    cautions: [
      L('medical-grade မဟုတ် — သင်ကြားရေးအတွက်သာ', 'Not medical-grade — for learning only'),
      L('လက်ချောင်း တည်ငြိမ်မှ တိကျ — motion noise များ', 'Needs a still finger — very motion-sensitive'),
    ],
    libraries: ['SparkFun MAX3010x', 'Wire'],
  },

  'ph-sensor': {
    difficulty: 'advanced',
    whatFor: L(
      'အရည်၏ အက်ဆစ်/အယ်လ်ကာလိုင်း (pH 0–14) ကို တိုင်းပေးသော sensor။ ရေအရည်အသွေး project များအတွက်။',
      'Measures the acidity/alkalinity (pH 0–14) of a liquid — for water-quality projects.',
    ),
    useCases: [
      L('ရေအရည်အသွေး စောင့်ကြည့်မှု', 'Water-quality monitoring'),
      L('hydroponics / aquaponics', 'Hydroponics / aquaponics'),
      L('ရေကူးကန် / lab စစ်ဆေးမှု', 'Pool / lab testing'),
    ],
    pinout: [
      { pin: 'VCC / GND', desc: L('ပါဝါ (5V)', 'Power (5V)') },
      { pin: 'PO', desc: L('analog pH output', 'Analog pH output') },
      { pin: 'probe BNC', desc: L('pH glass electrode', 'pH glass electrode') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  float v = analogRead(A0) * 5.0/1024;\n  Serial.println(3.5 * v);  // calibrate slope/offset\n  delay(1000);\n}`,
    },
    price: '~15,000–30,000 MMK (probe + board)',
    alternatives: ['Industrial pH transmitter', 'ORP sensor'],
    cautions: [
      L('buffer solution (pH 4/7/10) နဲ့ calibration မဖြစ်မနေလို', 'Calibration with buffer solutions (pH 4/7/10) is mandatory'),
      L('electrode ကို မခြောက်စေရ — storage solution ထဲ ထားပါ', 'Never let the electrode dry — store it in solution'),
    ],
    libraries: ['DFRobot_PH (optional)'],
  },

  'current-sensor': {
    difficulty: 'intermediate',
    whatFor: L(
      'AC/DC လျှပ်စီးကို Hall-effect ဖြင့် တိုင်း၍ analog voltage ထုတ်ပေးသော sensor (isolated)။',
      'Measures AC/DC current via the Hall effect and outputs an analog voltage (galvanically isolated).',
    ),
    useCases: [
      L('လျှပ်စစ်သုံးစွဲမှု တိုင်းစနစ်', 'Power-consumption metering'),
      L('motor / battery current monitor', 'Motor / battery current monitoring'),
      L('overload protection', 'Overload protection'),
    ],
    pinout: [
      { pin: 'VCC / GND', desc: L('5V ပါဝါ', '5V power') },
      { pin: 'OUT', desc: L('analog (2.5V = 0A)', 'Analog (2.5V = 0A)') },
      { pin: 'IP+ / IP-', desc: L('တိုင်းမည့် load ကို series ထည့်', 'Load in series through here') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  float v = analogRead(A0) * 5.0/1024;\n  float amps = (v - 2.5) / 0.185;  // 5A module\n  Serial.println(amps);\n  delay(500);\n}`,
    },
    price: '~2,500–4,500 MMK',
    alternatives: ['INA219 (I2C)', 'INA226', 'Shunt + amplifier'],
    cautions: [
      L('IP+/IP- ကို load နဲ့ series တပ်ရ — parallel မဟုတ်', 'Wire IP+/IP- in series with the load — not parallel'),
      L('mains voltage က အန္တရာယ် — သတိကြီးစွာ ကိုင်တွယ်ပါ', 'Mains voltage is dangerous — handle with great care'),
    ],
    libraries: [],
  },

  'voltage-sensor': {
    difficulty: 'beginner',
    whatFor: L(
      'မြင့်မားသော voltage ကို voltage divider ဖြင့် လျှော့ချ၍ MCU က ADC နဲ့ ဖတ်နိုင်စေသော module။',
      'A voltage-divider module that scales a higher voltage down so an MCU\u2019s ADC can read it safely.',
    ),
    useCases: [
      L('battery voltage monitor', 'Battery-voltage monitoring'),
      L('solar / power project', 'Solar / power projects'),
      L('voltage logger', 'Voltage loggers'),
    ],
    pinout: [
      { pin: 'VCC / GND (in)', desc: L('တိုင်းမည့် voltage (≤25V)', 'Voltage to measure (≤25V)') },
      { pin: 'S / -', desc: L('scaled analog output → ADC', 'Scaled analog output → ADC') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  float v = analogRead(A0) * 5.0/1024 * 5.0;  // 1:5 divider\n  Serial.println(v);\n  delay(500);\n}`,
    },
    price: '~800–2,000 MMK',
    alternatives: ['DIY resistor divider', 'INA219', 'ADS1115 + divider'],
    cautions: [
      L('module rating (25V) ကို မကျော်ရ', 'Do not exceed the module rating (25V)'),
      L('ratio ကို ADC reference အလိုက် calibrate ပါ', 'Calibrate the ratio against your ADC reference'),
    ],
    libraries: [],
  },

  'ir-flame-array': {
    difficulty: 'beginner',
    whatFor: L(
      'လှုပ်ခါမှု / ခေါက်ခတ်မှုကို ရှာဖွေပေးသော SW-420 vibration sensor။ လှုပ်ရင် digital signal ထုတ်သည်။',
      'The SW-420 vibration sensor detects shaking / knocks, emitting a digital signal when it moves.',
    ),
    useCases: [
      L('ငလျင် / vibration alarm', 'Earthquake / vibration alarms'),
      L('anti-theft knock detector', 'Anti-theft knock detectors'),
      L('machine fault monitor', 'Machine-fault monitoring'),
    ],
    pinout: [
      { pin: 'VCC / GND', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
      { pin: 'DO', desc: L('digital vibration output', 'Digital vibration output') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); pinMode(2,INPUT); }\nvoid loop(){\n  if (digitalRead(2) == HIGH) Serial.println("Vibration!");\n  delay(50);\n}`,
    },
    price: '~1,000–2,500 MMK',
    alternatives: ['SW-18010P', 'MPU6050 (accel)', 'Piezo sensor'],
    cautions: [
      L('sensitivity ကို pot နဲ့ ချိန်ပါ', 'Tune the sensitivity with the pot'),
      L('digital သာ — vibration ပမာဏ မတိုင်းနိုင်', 'Digital only — cannot quantify vibration amount'),
    ],
    libraries: [],
  },

  'lidar-sensor': {
    difficulty: 'advanced',
    whatFor: L(
      'လေဆာ (laser) သုံး၍ အကွာအဝေးကို တိကျစွာ တိုင်းပေးသော sensor။ ultrasonic ထက် အကွာအဝေး ပိုဝေး၊ ပိုတိကျ။',
      'Measures distance precisely with a laser — longer range and higher accuracy than ultrasonic.',
    ),
    useCases: [
      L('robot mapping / SLAM', 'Robot mapping / SLAM'),
      L('drone altitude hold', 'Drone altitude hold'),
      L('တိကျသော အကွာအဝေး တိုင်းစနစ်', 'Precise distance measurement'),
    ],
    pinout: [
      { pin: 'VCC', desc: L('5V ပါဝါ', '5V power') },
      { pin: 'RXD / TXD', desc: L('UART (I2C version လည်းရ)', 'UART (I2C version also exists)') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <SoftwareSerial.h>\nSoftwareSerial lidar(10,11);\nvoid setup(){ Serial.begin(9600); lidar.begin(115200); }\nvoid loop(){\n  // parse TF-Luna 9-byte frame for distance (cm)\n}`,
    },
    price: '~25,000–45,000 MMK (TF-Luna)',
    alternatives: ['VL53L0X (short range)', 'RPLIDAR (360°)', 'HC-SR04 (cheap)'],
    cautions: [
      L('frame protocol ကို datasheet အတိုင်း parse ရ', 'Parse the frame protocol exactly per the datasheet'),
      L('နေရောင်ပြင်း / မှန် မျက်နှာပြင်တွင် error များ', 'Bright sun / glossy surfaces cause errors'),
    ],
    libraries: ['TFLuna-I2C (for I2C mode)'],
  },

  // ─── Actuators & Motors ───────────────────────────────────────────────────
  'dc-motor': {
    difficulty: 'beginner',
    whatFor: L(
      'ဒစ်ဂျစ်တယ် voltage ပေးလိုက်ရင် လည်ပတ်သော အခြေခံ မော်တာ။ ဘီး၊ pump၊ fan စသည်တို့ လှည့်ရန်။ MCU နဲ့ တိုက်ရိုက် မတပ်ရ — driver လို။',
      'A basic motor that spins when given voltage — for wheels, pumps and fans. Never wire it straight to an MCU; use a driver.',
    ),
    useCases: [
      L('robot ဘီး မောင်းနှင်ခြင်း', 'Driving robot wheels'),
      L('fan / pump လည်ပတ်ခြင်း', 'Running fans / pumps'),
      L('conveyor / rotating display', 'Conveyors / rotating displays'),
    ],
    pinout: [
      { pin: 'Terminal 1/2', desc: L('polarity ပြောင်းရင် လှည့်ဘက် ပြောင်း', 'Swapping polarity reverses direction') },
    ],
    wiring: L(
      'motor driver (L298N/L293D) မှတစ်ဆင့် ချိတ်ပါ။ back-EMF ကာကွယ်ရန် flyback diode ထည့်ပါ။',
      'Connect through a motor driver (L298N/L293D) and add a flyback diode to absorb back-EMF.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `// via L298N: IN1/IN2 set direction, ENA (PWM) sets speed\nvoid setup(){ pinMode(9,OUTPUT); pinMode(8,OUTPUT); }\nvoid loop(){\n  digitalWrite(8,HIGH); analogWrite(9,180);  // forward, ~70%\n}`,
    },
    price: '~2,000–6,000 MMK',
    alternatives: ['Geared TT motor', 'Stepper (precise)', 'Servo (angle)'],
    cautions: [
      L('MCU pin နဲ့ တိုက်ရိုက် မမောင်းရ — board လောင်တတ်', 'Never drive it from an MCU pin — it will burn the board'),
      L('flyback diode မပါရင် spike ကြောင့် driver ပျက်', 'Without a flyback diode, voltage spikes kill the driver'),
    ],
    libraries: [],
  },

  servo: {
    difficulty: 'beginner',
    whatFor: L(
      'တိကျသော ထောင့် (0–180°) သို့ ရွေ့ပြီး ရပ်နေပေးသော မော်တာ။ PWM signal တစ်ခုတည်းနဲ့ ထိန်းချုပ်နိုင်။',
      'A motor that moves to and holds a precise angle (0–180°), controlled with a single PWM signal.',
    ),
    useCases: [
      L('robot arm joint', 'Robot-arm joints'),
      L('တံခါး / valve ဖွင့်ပိတ်', 'Door / valve open-close'),
      L('camera pan-tilt', 'Camera pan-tilt rigs'),
    ],
    pinout: [
      { pin: 'Signal (orange)', desc: L('PWM control', 'PWM control') },
      { pin: 'VCC (red)', desc: L('4.8–6V ပါဝါ', '4.8–6V power') },
      { pin: 'GND (brown)', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Servo.h>\nServo s;\nvoid setup(){ s.attach(9); }\nvoid loop(){\n  s.write(0);   delay(700);\n  s.write(180); delay(700);\n}`,
    },
    price: '~2,500–12,000 MMK (SG90–MG996)',
    alternatives: ['MG996R (metal gear)', 'Continuous servo', 'Stepper'],
    cautions: [
      L('MG996 လို ကြီးသည်များ current များ — ပြင်ပ 5V ပေးပါ', 'Bigger servos (MG996) draw a lot — use an external 5V supply'),
      L('MCU 5V pin တစ်ခုတည်းနဲ့ များစွာ မမောင်းရ', 'Don\u2019t power several from the MCU\u2019s 5V pin'),
    ],
    libraries: ['Servo', 'ESP32Servo'],
  },

  stepper: {
    difficulty: 'intermediate',
    whatFor: L(
      'တစ်ဆင့်ချင်း (step) တိကျစွာ လှည့်ပေးသော မော်တာ။ 28BYJ-48 က ULN2003 driver နဲ့ တွဲ၍ ဈေးသက်သာသည်။',
      'A motor that rotates in precise steps. The 28BYJ-48 pairs with a cheap ULN2003 driver.',
    ),
    useCases: [
      L('တိကျ position ထိန်းချုပ်မှု', 'Precise positioning'),
      L('camera slider / clock', 'Camera sliders / clocks'),
      L('automated blinds', 'Automated blinds'),
    ],
    pinout: [
      { pin: 'IN1–IN4', desc: L('ULN2003 driver control', 'ULN2003 driver control') },
      { pin: 'VCC / GND', desc: L('5–12V ပါဝါ', '5–12V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Stepper.h>\nStepper m(2048, 8,10,9,11);\nvoid setup(){ m.setSpeed(10); }\nvoid loop(){ m.step(2048); delay(500); }  // 1 rev`,
    },
    price: '~3,000–5,000 MMK (with ULN2003)',
    alternatives: ['NEMA 17 (stronger)', 'Servo', 'DC gear motor'],
    cautions: [
      L('coil pin အစီအစဉ် မှားရင် တုန်ရုံသာ လှည့်မည်မဟုတ်', 'Wrong coil order makes it buzz instead of turn'),
      L('torque နည်း — load ကြီးရင် NEMA 17 သုံး', 'Low torque — use NEMA 17 for bigger loads'),
    ],
    libraries: ['Stepper', 'AccelStepper'],
  },

  nema17: {
    difficulty: 'intermediate',
    whatFor: L(
      'CNC နဲ့ 3D printer တွေမှာ သုံးသော torque မြင့် stepper motor။ A4988/DRV8825 driver နဲ့ တွဲသည်။',
      'A high-torque stepper used in CNC and 3D printers, paired with an A4988/DRV8825 driver.',
    ),
    useCases: [
      L('3D printer / CNC axis', '3D printer / CNC axes'),
      L('laser engraver', 'Laser engravers'),
      L('တိကျ linear stage', 'Precision linear stages'),
    ],
    pinout: [
      { pin: '4 coil wires', desc: L('A4988 → 2A/2B, 1A/1B', 'A4988 → 2A/2B, 1A/1B') },
      { pin: 'via driver', desc: L('STEP / DIR pin ဖြင့် ထိန်း', 'Controlled via STEP / DIR pins') },
    ],
    wiring: L(
      'A4988/DRV8825 driver မှတစ်ဆင့် ချိတ်ပြီး Vref pot ကို current limit အတွက် ချိန်ပါ။',
      'Wire through an A4988/DRV8825 and set the Vref pot for the current limit.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `#define STEP 3\n#define DIR 4\nvoid setup(){ pinMode(STEP,OUTPUT); pinMode(DIR,OUTPUT); digitalWrite(DIR,HIGH); }\nvoid loop(){\n  digitalWrite(STEP,HIGH); delayMicroseconds(800);\n  digitalWrite(STEP,LOW);  delayMicroseconds(800);\n}`,
    },
    price: '~8,000–15,000 MMK',
    alternatives: ['NEMA 23 (bigger)', '28BYJ-48 (small)', 'Servo'],
    cautions: [
      L('driver Vref ကို မချိန်ရင် motor ပူ/ဆုံးရှုံး', 'Failing to set driver Vref overheats/damages the motor'),
      L('run နေစဉ် coil ဖြုတ်ရင် driver ပျက်', 'Disconnecting a coil while running destroys the driver'),
    ],
    libraries: ['AccelStepper', 'GRBL (CNC)'],
  },

  l298n: {
    difficulty: 'beginner',
    whatFor: L(
      'DC motor ၂ လုံး (သို့) stepper တစ်လုံးကို ဦးတည်ချက် + အမြန်နှုန်း ထိန်းချုပ်နိုင်သော dual H-bridge driver။',
      'A dual H-bridge driver controlling the direction and speed of two DC motors (or one stepper).',
    ),
    useCases: [
      L('၂-ဘီး / ၄-ဘီး robot car', '2-wheel / 4-wheel robot cars'),
      L('motorised project', 'Motorised projects'),
      L('conveyor ထိန်းချုပ်', 'Conveyor control'),
    ],
    pinout: [
      { pin: 'IN1–IN4', desc: L('ဦးတည်ချက် control', 'Direction control') },
      { pin: 'ENA / ENB', desc: L('PWM အမြန်နှုန်း', 'PWM speed') },
      { pin: 'OUT1–4', desc: L('motor terminals', 'Motor terminals') },
      { pin: '12V / 5V / GND', desc: L('ပါဝါ (5V regulator ပါ)', 'Power (has 5V regulator)') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(8,OUTPUT); pinMode(7,OUTPUT); }\nvoid loop(){\n  digitalWrite(8,HIGH); digitalWrite(7,LOW); analogWrite(9,200);  // fwd\n  delay(1000);\n}`,
    },
    price: '~2,500–4,000 MMK',
    alternatives: ['L293D', 'TB6612FNG (efficient)', 'DRV8833'],
    cautions: [
      L('~2V voltage drop ရှိ — motor အားနည်းစေ', 'Has a ~2V drop that weakens the motor'),
      L('12V ကျော်ရင် onboard 5V regulator ဖြုတ်ပါ', 'Above 12V, remove the onboard 5V jumper'),
    ],
    libraries: [],
  },

  l293d: {
    difficulty: 'beginner',
    whatFor: L(
      'DC motor ၂ လုံး ထိန်းချုပ်နိုင်သော motor driver IC။ L298N ထက် သေးငယ်ပြီး current နည်းသော project များအတွက်။',
      'A motor-driver IC that controls two DC motors — smaller than the L298N, for low-current projects.',
    ),
    useCases: [
      L('အသေးစား robot', 'Small robots'),
      L('toy motor ထိန်းချုပ်', 'Toy-motor control'),
      L('breadboard project', 'Breadboard projects'),
    ],
    pinout: [
      { pin: 'IN1–IN4', desc: L('ဦးတည်ချက် control', 'Direction control') },
      { pin: 'EN1/EN2', desc: L('enable / PWM', 'Enable / PWM') },
      { pin: 'OUT1–4', desc: L('motor terminals', 'Motor terminals') },
      { pin: 'Vcc1/Vcc2', desc: L('logic + motor ပါဝါ', 'Logic + motor power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(2,OUTPUT); pinMode(7,OUTPUT); }\nvoid loop(){\n  digitalWrite(2,HIGH); digitalWrite(7,LOW);\n  delay(1000);\n}`,
    },
    price: '~800–2,000 MMK',
    alternatives: ['L298N (more current)', 'TB6612FNG', 'DRV8833'],
    cautions: [
      L('current နည်း (~600mA) — motor ကြီး မမောင်းနိုင်', 'Low current (~600mA) — cannot drive big motors'),
      L('ပူလွယ် — heatsink စဉ်းစားပါ', 'Runs hot — consider a heatsink'),
    ],
    libraries: [],
  },

  a4988: {
    difficulty: 'intermediate',
    whatFor: L(
      'NEMA 17 လို stepper motor ကို STEP/DIR pin ၂ ခုတည်းနဲ့ ထိန်းချုပ်စေသော driver။ microstepping ပါသည်။',
      'A driver that controls a stepper (e.g. NEMA 17) with just STEP/DIR pins, with microstepping support.',
    ),
    useCases: [
      L('3D printer / CNC', '3D printers / CNC'),
      L('တိကျ motion control', 'Precise motion control'),
      L('camera slider', 'Camera sliders'),
    ],
    pinout: [
      { pin: 'STEP / DIR', desc: L('MCU control pin', 'MCU control pins') },
      { pin: '1A/1B/2A/2B', desc: L('motor coil', 'Motor coils') },
      { pin: 'VMOT / VDD', desc: L('motor + logic ပါဝါ', 'Motor + logic power') },
      { pin: 'MS1–MS3', desc: L('microstep ရွေးရန်', 'Microstep select') },
    ],
    wiring: L(
      'VMOT နဲ့ GND ကြား 100µF capacitor မဖြစ်မနေ ထည့်ပါ။ Vref pot ကို current limit အတွက် ချိန်ပါ။',
      'A 100µF capacitor across VMOT–GND is mandatory. Set the Vref pot for the current limit.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `#define STEP 3\n#define DIR 4\nvoid setup(){ pinMode(STEP,OUTPUT); pinMode(DIR,OUTPUT); }\nvoid loop(){\n  digitalWrite(DIR,HIGH);\n  for(int i=0;i<200;i++){ digitalWrite(STEP,HIGH); delayMicroseconds(700); digitalWrite(STEP,LOW); delayMicroseconds(700); }\n}`,
    },
    price: '~1,500–3,500 MMK',
    alternatives: ['DRV8825 (more current)', 'TMC2208 (silent)'],
    cautions: [
      L('VMOT capacitor မပါဘဲ ဖွင့်ရင် chip ပေါက်ကွဲနိုင်', 'Powering without the VMOT capacitor can blow the chip'),
      L('power ဖွင့်ထားစဉ် motor ဖြုတ်/တပ် မလုပ်ရ', 'Never plug/unplug the motor while powered'),
    ],
    libraries: ['AccelStepper'],
  },

  'relay-module': {
    difficulty: 'beginner',
    whatFor: L(
      'MCU signal အသေးနဲ့ မီးအားမြင့် (AC 220V) ပစ္စည်းများကို ဖွင့်ပိတ်ပေးသော လျှပ်စစ် switch။',
      'An electrical switch that lets a small MCU signal turn high-voltage (AC 220V) loads on and off.',
    ),
    useCases: [
      L('smart home မီး/ပန်ကာ ထိန်းချုပ်', 'Smart-home light/fan control'),
      L('အလိုအလျောက် pump / heater', 'Automatic pumps / heaters'),
      L('appliance automation', 'Appliance automation'),
    ],
    pinout: [
      { pin: 'IN', desc: L('MCU control signal', 'MCU control signal') },
      { pin: 'VCC / GND', desc: L('5V ပါဝါ', '5V power') },
      { pin: 'COM/NO/NC', desc: L('load ဘက် contact', 'Load-side contacts') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(7,OUTPUT); }\nvoid loop(){\n  digitalWrite(7,LOW);  delay(2000);  // many modules: LOW = ON\n  digitalWrite(7,HIGH); delay(2000);\n}`,
    },
    price: '~2,000–5,000 MMK (1–4 ch)',
    alternatives: ['SSR (silent)', 'MOSFET (DC only)', 'Triac'],
    cautions: [
      L('AC 220V ဘက်က အသက်အန္တရာယ် — ကျွမ်းကျင်သူ ကြီးကြပ်', 'The AC 220V side is life-threatening — get expert supervision'),
      L('module အများစုက active-LOW — logic ပြောင်းပြန်', 'Most modules are active-LOW — logic is inverted'),
    ],
    libraries: [],
  },

  solenoid: {
    difficulty: 'intermediate',
    whatFor: L(
      'လျှပ်စစ်ဖြင့် ဖွင့်/ပိတ်နိုင်သော valve။ ရေ / ဓာတ်ငွေ့ စီးဆင်းမှုကို အလိုအလျောက် ထိန်းချုပ်ရန်။',
      'An electrically operated valve to automatically control the flow of water or gas.',
    ),
    useCases: [
      L('အလိုအလျောက် ရေလောင်းစနစ်', 'Automatic watering systems'),
      L('vending / dispenser', 'Vending / dispensers'),
      L('smart plumbing', 'Smart plumbing'),
    ],
    pinout: [
      { pin: '2 terminals', desc: L('coil (polarity မရေး)', 'Coil (usually non-polarised)') },
    ],
    wiring: L(
      'MOSFET / relay မှတစ်ဆင့် ချိတ်ပြီး flyback diode မဖြစ်မနေ ထည့်ပါ — coil back-EMF ကြီးသည်။',
      'Drive via a MOSFET/relay and always add a flyback diode — the coil\u2019s back-EMF is large.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(7,OUTPUT); }\nvoid loop(){\n  digitalWrite(7,HIGH); delay(3000);  // valve open\n  digitalWrite(7,LOW);  delay(3000);  // closed\n}`,
    },
    price: '~4,000–8,000 MMK',
    alternatives: ['Motorised ball valve', 'Servo + valve'],
    cautions: [
      L('flyback diode မပါရင် driver ချက်ချင်း ပျက်', 'Without a flyback diode the driver dies instantly'),
      L('coil current များ — ပြင်ပ ပါဝါ လို', 'The coil draws a lot — needs external power'),
    ],
    libraries: [],
  },

  'water-pump': {
    difficulty: 'beginner',
    whatFor: L(
      'ရေ / အရည်ကို စုပ်တင်ပေးသော အသေးစား DC pump။ အလိုအလျောက် ရေလောင်း/ဖြည့် project များအတွက်။',
      'A small DC pump that moves water/liquid — for automatic watering and filling projects.',
    ),
    useCases: [
      L('အလိုအလျောက် အပင်ရေလောင်း', 'Automatic plant watering'),
      L('fountain / aquarium', 'Fountains / aquariums'),
      L('liquid dispenser', 'Liquid dispensers'),
    ],
    pinout: [
      { pin: '+ / -', desc: L('DC ပါဝါ (3–12V)', 'DC power (3–12V)') },
    ],
    wiring: L(
      'relay သို့ MOSFET မှတစ်ဆင့် ချိတ်ပါ။ flyback diode ထည့်ပါ။',
      'Connect through a relay or MOSFET and add a flyback diode.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(7,OUTPUT); }\nvoid loop(){\n  digitalWrite(7,HIGH); delay(5000);  // pump on 5s\n  digitalWrite(7,LOW);  delay(5000);\n}`,
    },
    price: '~2,000–5,000 MMK',
    alternatives: ['Peristaltic pump (dosing)', 'Diaphragm pump'],
    cautions: [
      L('ခြောက်သွေ့စွာ (dry-run) မမောင်းရ — pump ပျက်', 'Never run it dry — it will burn out'),
      L('MCU pin နဲ့ တိုက်ရိုက် မမောင်းရ', 'Do not drive it directly from an MCU pin'),
    ],
    libraries: [],
  },

  'servo-continuous': {
    difficulty: 'beginner',
    whatFor: L(
      'ထောင့်မဟုတ်ဘဲ အမြန်နှုန်း + ဦးတည်ချက်ကို ထိန်းချုပ်၍ ၃၆၀° ဆက်တိုက် လှည့်ပေးသော servo။',
      'A servo modified to spin continuously (360°) — you control speed and direction, not angle.',
    ),
    useCases: [
      L('robot drive wheel', 'Robot drive wheels'),
      L('rotating platform', 'Rotating platforms'),
      L('conveyor အသေးစား', 'Small conveyors'),
    ],
    pinout: [
      { pin: 'Signal / VCC / GND', desc: L('standard servo wiring', 'Standard servo wiring') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Servo.h>\nServo s;\nvoid setup(){ s.attach(9); }\nvoid loop(){\n  s.write(0);    delay(1000);  // full one way\n  s.write(90);   delay(1000);  // stop\n  s.write(180);  delay(1000);  // full other way\n}`,
    },
    price: '~4,000–9,000 MMK',
    alternatives: ['Geared DC motor + driver', 'Standard servo'],
    cautions: [
      L('write(90) မှာ ရပ် — မရပ်ရင် trim pot ချိန်', 'It stops at write(90) — adjust the trim pot if it drifts'),
      L('position feedback မရ — angle မထိန်းနိုင်', 'No position feedback — cannot hold an angle'),
    ],
    libraries: ['Servo'],
  },

  bldc: {
    difficulty: 'advanced',
    whatFor: L(
      'brush မပါသော မြန်ပြီး စွမ်းအားမြင့် motor။ ESC (Electronic Speed Controller) မှတစ်ဆင့် ထိန်းချုပ်၍ drone များတွင် သုံးသည်။',
      'A fast, powerful brushless motor controlled through an ESC (Electronic Speed Controller) — used in drones.',
    ),
    useCases: [
      L('drone / quadcopter', 'Drones / quadcopters'),
      L('RC car / boat', 'RC cars / boats'),
      L('high-speed fan / EDF', 'High-speed fans / EDF'),
    ],
    pinout: [
      { pin: '3 phase wires', desc: L('ESC သို့ ချိတ် (order = direction)', 'To the ESC (order sets direction)') },
      { pin: 'ESC signal', desc: L('servo-style PWM control', 'Servo-style PWM control') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Servo.h>\nServo esc;\nvoid setup(){ esc.attach(9); esc.writeMicroseconds(1000); delay(3000); }  // arm\nvoid loop(){\n  esc.writeMicroseconds(1300);  // throttle\n}`,
    },
    price: '~10,000–30,000 MMK (motor + ESC)',
    alternatives: ['Brushed DC + driver', 'Different KV ratings'],
    cautions: [
      L('ESC ကို arming sequence လုပ်ရ — မလုပ်ရင် မလည်', 'The ESC needs an arming sequence or it won\u2019t spin'),
      L('propeller တပ်ပြီး စမ်းရင် အန္တရာယ်ကြီး', 'Testing with a propeller fitted is very dangerous'),
    ],
    libraries: ['Servo', 'ESP32 ledc'],
  },

  'linear-actuator': {
    difficulty: 'intermediate',
    whatFor: L(
      'တွန်း/ဆွဲ (linear) ရွေ့လျားမှုကို ပေးသော actuator။ motor ကို lead-screw ဖြင့် linear motion ပြောင်းသည်။',
      'An actuator that produces push/pull linear motion by converting motor rotation with a lead-screw.',
    ),
    useCases: [
      L('အလိုအလျောက် တံခါး / hatch', 'Automatic doors / hatches'),
      L('adjustable furniture', 'Adjustable furniture'),
      L('camera / solar tracker', 'Camera / solar trackers'),
    ],
    pinout: [
      { pin: '+ / -', desc: L('DC ပါဝါ (polarity = direction)', 'DC power (polarity sets direction)') },
    ],
    wiring: L(
      'DC motor လိုပင် H-bridge (L298N) မှတစ်ဆင့် ဦးတည်ချက် ပြောင်းပါ။',
      'Like a DC motor, reverse direction through an H-bridge (L298N).',
    ),
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(8,OUTPUT); pinMode(7,OUTPUT); }\nvoid loop(){\n  digitalWrite(8,HIGH); digitalWrite(7,LOW); delay(3000);  // extend\n  digitalWrite(8,LOW);  digitalWrite(7,HIGH); delay(3000); // retract\n}`,
    },
    price: '~15,000–40,000 MMK',
    alternatives: ['Servo + linkage', 'Rack & pinion + motor'],
    cautions: [
      L('limit switch built-in ရှိမရှိ စစ်ပါ — မရှိရင် stall', 'Check for built-in limit switches — without them it stalls'),
      L('rated load ကို မကျော်ရ', 'Do not exceed the rated load'),
    ],
    libraries: [],
  },

  buzzer: {
    difficulty: 'beginner',
    whatFor: L(
      'အသံ (beep / tone) ထုတ်ပေးသော ရိုးရှင်းသည့် ပစ္စည်း။ active က DC ပေးရင် မြည်၊ passive က frequency လို။',
      'A simple sound emitter. An active buzzer beeps on DC; a passive one needs a driving frequency.',
    ),
    useCases: [
      L('alarm / notification အသံ', 'Alarm / notification sounds'),
      L('button feedback beep', 'Button-feedback beeps'),
      L('ရိုးရှင်းသော melody', 'Simple melodies'),
    ],
    pinout: [
      { pin: '+ (long)', desc: L('signal / VCC', 'Signal / VCC') },
      { pin: '- (short)', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(8,OUTPUT); }\nvoid loop(){\n  tone(8, 1000);  delay(300);   // passive buzzer, 1kHz\n  noTone(8);      delay(300);\n}`,
    },
    price: '~300–1,000 MMK',
    alternatives: ['Piezo speaker', 'DFPlayer (real audio)'],
    cautions: [
      L('active buzzer မှာ tone() မလို — DC ပေးရုံ', 'An active buzzer needs no tone() — just DC'),
      L('passive buzzer ကို DC တင်ရင် မမြည်', 'A passive buzzer stays silent on plain DC'),
    ],
    libraries: [],
  },

  // ─── Displays ─────────────────────────────────────────────────────────────
  lcd1602: {
    difficulty: 'beginner',
    whatFor: L(
      'စာလုံး ၁၆ လုံး × ၂ ကြောင်း ပြသနိုင်သော အခြေခံ LCD။ I2C backpack နဲ့ဆို pin ၂ ခုတည်းနဲ့ ချိတ်နိုင်။',
      'A basic LCD showing 16 characters × 2 lines. With an I2C backpack it needs only two pins.',
    ),
    useCases: [
      L('sensor reading display', 'Sensor-reading displays'),
      L('menu / status screen', 'Menu / status screens'),
      L('ရိုးရှင်းသော meter', 'Simple meters'),
    ],
    pinout: [
      { pin: 'SDA / SCL', desc: L('I2C (backpack ပါက)', 'I2C (with backpack)') },
      { pin: 'VCC / GND', desc: L('5V ပါဝါ', '5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27,16,2);\nvoid setup(){ lcd.init(); lcd.backlight(); lcd.print("Hello!"); }\nvoid loop(){}`,
    },
    price: '~3,000–5,000 MMK (with I2C)',
    alternatives: ['LCD 20×4', 'OLED', 'TFT'],
    cautions: [
      L('I2C address 0x27/0x3F — scanner နဲ့ ရှာပါ', 'I2C address is 0x27 or 0x3F — find it with a scanner'),
      L('contrast pot ချိန်မှ စာ ပေါ်', 'Adjust the contrast pot or text won\u2019t show'),
    ],
    libraries: ['LiquidCrystal_I2C', 'Wire'],
  },

  lcd2004: {
    difficulty: 'beginner',
    whatFor: L(
      'စာလုံး ၂၀ လုံး × ၄ ကြောင်း ပြနိုင်သော ကြီးမားသည့် character LCD။ information များ ပြရန်။',
      'A larger character LCD showing 20 characters × 4 lines — for displaying more information.',
    ),
    useCases: [
      L('multi-sensor dashboard', 'Multi-sensor dashboards'),
      L('menu system', 'Menu systems'),
      L('data logger display', 'Data-logger displays'),
    ],
    pinout: [
      { pin: 'SDA / SCL', desc: L('I2C (backpack)', 'I2C (backpack)') },
      { pin: 'VCC / GND', desc: L('5V ပါဝါ', '5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27,20,4);\nvoid setup(){ lcd.init(); lcd.backlight(); lcd.print("4 lines x 20"); }\nvoid loop(){}`,
    },
    price: '~5,000–8,000 MMK (with I2C)',
    alternatives: ['LCD 16×2', 'OLED', 'TFT'],
    cautions: [
      L('16×2 ထက် current များ — ပါဝါ လုံလောက်စေ', 'Draws more than a 16×2 — ensure adequate power'),
      L('I2C address စစ်ပါ', 'Verify the I2C address'),
    ],
    libraries: ['LiquidCrystal_I2C', 'Wire'],
  },

  oled: {
    difficulty: 'beginner',
    whatFor: L(
      'အလွန်သေးငယ်ပြီး ကြည်လင်သော I2C graphic display (128×64)။ စာသား၊ ရုပ်ပုံ၊ ဂရပ် ပြနိုင်။',
      'A tiny, crisp I2C graphic display (128×64) that can show text, images and graphs.',
    ),
    useCases: [
      L('wearable / smartwatch UI', 'Wearable / smartwatch UIs'),
      L('sensor graph display', 'Sensor-graph displays'),
      L('menu / icon UI', 'Menu / icon UIs'),
    ],
    pinout: [
      { pin: 'SDA / SCL', desc: L('I2C bus', 'I2C bus') },
      { pin: 'VCC / GND', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Adafruit_SSD1306.h>\nAdafruit_SSD1306 d(128,64,&Wire);\nvoid setup(){ d.begin(SSD1306_SWITCHCAPVCC,0x3C); d.clearDisplay(); d.setTextSize(2); d.setCursor(0,0); d.print("Hi!"); d.display(); }\nvoid loop(){}`,
    },
    price: '~4,000–7,000 MMK',
    alternatives: ['SH1106 OLED', 'LCD 16×2', 'TFT (colour)'],
    cautions: [
      L('I2C address 0x3C/0x3D — module အလိုက် ကွဲ', 'I2C address 0x3C/0x3D — varies by module'),
      L('SSD1306 နဲ့ SH1106 library မှား မတပ်ပါနှင့်', 'Don\u2019t mix up SSD1306 and SH1106 libraries'),
    ],
    libraries: ['Adafruit_SSD1306', 'Adafruit_GFX', 'U8g2'],
  },

  tft: {
    difficulty: 'intermediate',
    whatFor: L(
      'အရောင်ပြည့် graphical touchscreen။ ရုပ်ပုံ၊ chart၊ touch UI များ ပြသနိုင်၍ project ကို professional ဖြစ်စေသည်.',
      'A full-colour graphical touchscreen that can show images, charts and touch UIs — making a project look professional.',
    ),
    useCases: [
      L('touch control panel', 'Touch control panels'),
      L('graphical dashboard', 'Graphical dashboards'),
      L('game / GUI', 'Games / GUIs'),
    ],
    pinout: [
      { pin: 'SPI (SCK/MOSI/MISO/CS/DC)', desc: L('display bus', 'Display bus') },
      { pin: 'T_CS / T_IRQ', desc: L('touch controller', 'Touch controller') },
      { pin: 'VCC / GND', desc: L('3.3V ပါဝါ', '3.3V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <TFT_eSPI.h>\nTFT_eSPI tft;\nvoid setup(){ tft.init(); tft.fillScreen(TFT_BLACK); tft.setCursor(10,10); tft.setTextColor(TFT_WHITE); tft.print("Hello TFT"); }\nvoid loop(){}`,
    },
    price: '~8,000–20,000 MMK',
    alternatives: ['OLED (small)', 'Nextion (smart)', 'ILI9341 bare'],
    cautions: [
      L('SPI pin များ + ပါဝါ များ — ESP32 သင့်တော်', 'Many SPI pins and current — ESP32 suits it best'),
      L('driver chip (ILI9341/ST7789) ကို library မှာ မှန်အောင် set ပါ', 'Set the correct driver chip (ILI9341/ST7789) in the library'),
    ],
    libraries: ['TFT_eSPI', 'Adafruit_GFX', 'LVGL'],
  },

  'seven-seg': {
    difficulty: 'beginner',
    whatFor: L(
      'ဂဏန်း (0–9) ကို LED segment ဖြင့် ပြသသော display။ counter၊ clock၊ meter များအတွက်။',
      'A display that shows digits (0–9) with LED segments — for counters, clocks and meters.',
    ),
    useCases: [
      L('ဒစ်ဂျစ်တယ် နာရီ / timer', 'Digital clocks / timers'),
      L('counter / scoreboard', 'Counters / scoreboards'),
      L('ဂဏန်း meter', 'Numeric meters'),
    ],
    pinout: [
      { pin: 'a–g, dp', desc: L('segment pin (resistor လို)', 'Segment pins (need resistors)') },
      { pin: 'common', desc: L('anode သို့ cathode', 'Common anode or cathode') },
    ],
    wiring: L(
      'pin များစားလို့ TM1637 (4-digit) module သုံးရင် pin ၂ ခုတည်းနဲ့ ရသည်။',
      'It uses many pins — a TM1637 (4-digit) module needs only two pins.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `#include <TM1637Display.h>\nTM1637Display d(2,3);  // CLK, DIO\nvoid setup(){ d.setBrightness(5); }\nvoid loop(){ d.showNumberDec(1234); delay(1000); }`,
    },
    price: '~1,000–3,500 MMK (TM1637 module)',
    alternatives: ['MAX7219 7-seg', 'OLED', 'LCD'],
    cautions: [
      L('direct wiring မှာ segment တိုင်း resistor လို', 'Direct wiring needs a resistor on every segment'),
      L('anode/cathode မှားရင် logic ပြောင်းပြန်', 'Mixing up anode/cathode inverts the logic'),
    ],
    libraries: ['TM1637Display', 'SevSeg'],
  },

  'led-matrix': {
    difficulty: 'intermediate',
    whatFor: L(
      '8×8 dot ဖြင့် စာသား scroll၊ icon၊ animation ပြနိုင်သော display။ MAX7219 chip နဲ့ chain ဆက်နိုင်။',
      'An 8×8 dot display for scrolling text, icons and animations — chainable via the MAX7219 chip.',
    ),
    useCases: [
      L('scrolling text sign', 'Scrolling text signs'),
      L('icon / animation display', 'Icon / animation displays'),
      L('game (Tetris/Snake)', 'Games (Tetris/Snake)'),
    ],
    pinout: [
      { pin: 'DIN / CS / CLK', desc: L('SPI-style control', 'SPI-style control') },
      { pin: 'VCC / GND', desc: L('5V ပါဝါ', '5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <MD_Parola.h>\nMD_Parola p(MD_MAX72XX::FC16_HW,10,4);  // CS=10, 4 modules\nvoid setup(){ p.begin(); p.displayText("HELLO",PA_CENTER,50,0,PA_SCROLL_LEFT,PA_SCROLL_LEFT); }\nvoid loop(){ if(p.displayAnimate()) p.displayReset(); }`,
    },
    price: '~4,000–8,000 MMK (4-in-1)',
    alternatives: ['NeoPixel matrix', 'P10 LED panel', 'OLED'],
    cautions: [
      L('module chain ကြီးရင် current များ — ပြင်ပ 5V', 'Long chains draw a lot — use external 5V'),
      L('hardware type (FC16/GENERIC) မှန်အောင် set ပါ', 'Set the correct hardware type (FC16/GENERIC)'),
    ],
    libraries: ['MD_Parola', 'MD_MAX72XX', 'LedControl'],
  },

  neopixel: {
    difficulty: 'intermediate',
    whatFor: L(
      'LED တစ်လုံးချင်းစီကို data pin တစ်ခုတည်းနဲ့ သီးခြား အရောင် ထိန်းချုပ်နိုင်သော addressable RGB LED (WS2812)။',
      'Addressable RGB LEDs (WS2812) where each LED\u2019s colour is set individually over a single data pin.',
    ),
    useCases: [
      L('RGB light effect / strip', 'RGB light effects / strips'),
      L('ambient / mood lighting', 'Ambient / mood lighting'),
      L('status indicator', 'Status indicators'),
    ],
    pinout: [
      { pin: 'DIN', desc: L('data (330Ω series ကောင်း)', 'Data (a 330Ω series resistor helps)') },
      { pin: '5V / GND', desc: L('ပါဝါ', 'Power') },
    ],
    wiring: L(
      '5V နဲ့ GND ကြား 1000µF capacitor ထည့်ပါ။ LED အများဆို ပြင်ပ 5V ပါဝါ လို။',
      'Add a 1000µF capacitor across 5V–GND. Many LEDs need an external 5V supply.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `#include <Adafruit_NeoPixel.h>\nAdafruit_NeoPixel px(16,6,NEO_GRB+NEO_KHZ800);\nvoid setup(){ px.begin(); px.setPixelColor(0, px.Color(255,0,0)); px.show(); }\nvoid loop(){}`,
    },
    price: '~5,000–15,000 MMK (strip)',
    alternatives: ['WS2811', 'SK6812 (RGBW)', 'APA102 (fast)'],
    cautions: [
      L('LED ၁၀ လုံးက ~600mA ဆွဲနိုင် — ပါဝါ တွက်ပါ', '10 LEDs can pull ~600mA — budget your power'),
      L('3.3V board မှာ level shifter ကောင်း', 'A level shifter helps on 3.3V boards'),
    ],
    libraries: ['Adafruit_NeoPixel', 'FastLED'],
  },

  epaper: {
    difficulty: 'advanced',
    whatFor: L(
      'ပါဝါ အလွန်နည်းပြီး ပါဝါဖြုတ်ထားလည်း ရုပ်ပုံ ကျန်နေသော e-ink display။ battery project များအတွက် အထူးသင့်တော်။',
      'An ultra-low-power e-ink display that keeps its image even without power — ideal for battery projects.',
    ),
    useCases: [
      L('battery-powered label / tag', 'Battery-powered labels / tags'),
      L('weather / info dashboard', 'Weather / info dashboards'),
      L('e-reader style UI', 'E-reader-style UIs'),
    ],
    pinout: [
      { pin: 'SPI (SCK/MOSI/CS/DC)', desc: L('display bus', 'Display bus') },
      { pin: 'BUSY / RST', desc: L('status + reset', 'Status + reset') },
      { pin: 'VCC / GND', desc: L('3.3V ပါဝါ', '3.3V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <GxEPD2_BW.h>\n// init your panel model, then:\n// display.firstPage(); do { draw... } while (display.nextPage());\n// Refresh is slow (~2s) — update rarely.`,
    },
    price: '~12,000–30,000 MMK',
    alternatives: ['OLED (fast, powered)', 'LCD', 'Memory LCD'],
    cautions: [
      L('refresh အလွန်နှေး (~2s) — မကြာခဏ update မလုပ်ရ', 'Refresh is very slow (~2s) — do not update often'),
      L('panel model နဲ့ library ကိုက်ရ — မကိုက်ရင် ဘာမှမပေါ်', 'Panel model and library must match or nothing shows'),
    ],
    libraries: ['GxEPD2', 'Adafruit_GFX'],
  },

  // ─── Connectivity ─────────────────────────────────────────────────────────
  hc05: {
    difficulty: 'beginner',
    whatFor: L(
      'classic Bluetooth ဖြင့် ဖုန်း/PC နဲ့ serial data ပို့လက်ခံနိုင်သော module။ Android app နဲ့ ချိတ်ရ လွယ်ကူ။',
      'A classic-Bluetooth module for serial data with a phone/PC — easy to pair with an Android app.',
    ),
    useCases: [
      L('Bluetooth robot car control', 'Bluetooth robot-car control'),
      L('ဖုန်းနဲ့ ချိတ်သော project', 'Phone-connected projects'),
      L('wireless serial monitor', 'Wireless serial monitors'),
    ],
    pinout: [
      { pin: 'RXD / TXD', desc: L('UART (RX 3.3V — divider!)', 'UART (RX is 3.3V — use a divider!)') },
      { pin: 'VCC / GND', desc: L('3.6–6V ပါဝါ', '3.6–6V power') },
      { pin: 'EN / KEY', desc: L('AT command mode', 'AT-command mode') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <SoftwareSerial.h>\nSoftwareSerial bt(10,11);  // RX,TX\nvoid setup(){ bt.begin(9600); }\nvoid loop(){\n  if (bt.available()) Serial.write(bt.read());\n}`,
    },
    price: '~4,000–7,000 MMK',
    alternatives: ['HC-06 (slave only)', 'HM-10 (BLE)', 'ESP32 (built-in)'],
    cautions: [
      L('RXD က 3.3V — 5V TX ကို voltage divider နဲ့ ချိတ်ပါ', 'RXD is 3.3V — feed 5V TX through a divider'),
      L('classic BT — iPhone နဲ့ တိုက်ရိုက် မချိတ်နိုင်', 'Classic BT — cannot pair directly with iPhone'),
    ],
    libraries: ['SoftwareSerial'],
  },

  ble: {
    difficulty: 'intermediate',
    whatFor: L(
      'ပါဝါ အလွန်နည်းသော Bluetooth Low Energy module (HM-10)။ iPhone/Android နှစ်မျိုးလုံးနဲ့ ချိတ်နိုင်။',
      'A very low-power Bluetooth Low Energy module (HM-10) that connects to both iPhone and Android.',
    ),
    useCases: [
      L('wearable / fitness data', 'Wearable / fitness data'),
      L('BLE beacon', 'BLE beacons'),
      L('iOS-compatible project', 'iOS-compatible projects'),
    ],
    pinout: [
      { pin: 'RXD / TXD', desc: L('UART (3.3V)', 'UART (3.3V)') },
      { pin: 'VCC / GND', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <SoftwareSerial.h>\nSoftwareSerial ble(10,11);\nvoid setup(){ ble.begin(9600); }\nvoid loop(){ if(ble.available()) Serial.write(ble.read()); }`,
    },
    price: '~5,000–8,000 MMK',
    alternatives: ['HC-05 (classic)', 'ESP32 (built-in BLE)', 'nRF52'],
    cautions: [
      L('data rate နှေး — file transfer မသင့်', 'Low data rate — not for file transfer'),
      L('GATT service/characteristic နားလည်ရ', 'You must understand GATT services/characteristics'),
    ],
    libraries: ['SoftwareSerial', 'BLE (ESP32)'],
  },

  nrf24: {
    difficulty: 'intermediate',
    whatFor: L(
      '2.4GHz band သုံး၍ device ၂ ခုကြား ဈေးသက်သာစွာ wireless data ပို့နိုင်သော transceiver။',
      'A 2.4GHz transceiver for cheap two-way wireless data between two devices.',
    ),
    useCases: [
      L('wireless remote control', 'Wireless remote controls'),
      L('sensor-to-hub telemetry', 'Sensor-to-hub telemetry'),
      L('multi-node network', 'Multi-node networks'),
    ],
    pinout: [
      { pin: 'SPI (SCK/MOSI/MISO/CSN/CE)', desc: L('control bus', 'Control bus') },
      { pin: 'VCC', desc: L('3.3V သာ! (5V ဆို ပျက်)', '3.3V ONLY! (5V destroys it)') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    wiring: L(
      'VCC နဲ့ GND ကြား 10µF capacitor ထည့်ပါ — power noise ကြောင့် ချိတ်မမိတတ်။',
      'Add a 10µF cap across VCC–GND — power noise is the top cause of it not connecting.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `#include <RF24.h>\nRF24 radio(9,10);  // CE,CSN\nvoid setup(){ radio.begin(); radio.openWritingPipe(0xF0F0F0F0E1LL); }\nvoid loop(){ const char* m="hi"; radio.write(m,3); delay(1000); }`,
    },
    price: '~2,000–5,000 MMK',
    alternatives: ['LoRa (long range)', 'ESP-NOW', 'HC-12'],
    cautions: [
      L('VCC 5V ပေးရင် ချက်ချင်း ပျက် — 3.3V သာ', 'Feeding 5V to VCC destroys it instantly — 3.3V only'),
      L('decoupling capacitor မပါရင် မတည်ငြိမ်', 'Without a decoupling cap it is unstable'),
    ],
    libraries: ['RF24'],
  },

  lora: {
    difficulty: 'advanced',
    whatFor: L(
      'ပါဝါ အလွန်နည်းပြီး အလွန်ဝေးသော (km အထိ) အကွာအဝေးသို့ data ပို့နိုင်သော radio။ ကျေးလက် IoT အတွက်။',
      'A radio that sends data very long distances (kilometres) at very low power — ideal for rural IoT.',
    ),
    useCases: [
      L('ကျေးလက် sensor telemetry', 'Rural sensor telemetry'),
      L('farm / environment monitoring', 'Farm / environment monitoring'),
      L('LoRaWAN node', 'LoRaWAN nodes'),
    ],
    pinout: [
      { pin: 'SPI (SCK/MOSI/MISO/NSS)', desc: L('control bus', 'Control bus') },
      { pin: 'DIO0 / RST', desc: L('interrupt + reset', 'Interrupt + reset') },
      { pin: 'VCC (3.3V) / GND', desc: L('ပါဝါ (3.3V)', 'Power (3.3V)') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <LoRa.h>\nvoid setup(){ Serial.begin(9600); LoRa.begin(433E6); }\nvoid loop(){\n  LoRa.beginPacket(); LoRa.print("hello"); LoRa.endPacket();\n  delay(3000);\n}`,
    },
    price: '~6,000–12,000 MMK',
    alternatives: ['nRF24 (short)', 'GSM (cellular)', 'HC-12'],
    cautions: [
      L('frequency (433/868/915MHz) ကို ဒေသ ဥပဒေအတိုင်း သုံးပါ', 'Use the frequency (433/868/915MHz) legal in your region'),
      L('antenna မပါဘဲ TX လုပ်ရင် chip ပျက်', 'Transmitting without an antenna can damage the chip'),
    ],
    libraries: ['LoRa (Sandeep Mistry)', 'RadioHead'],
  },

  sim800: {
    difficulty: 'advanced',
    whatFor: L(
      'GSM/GPRS ကွန်ရက်သုံး၍ SMS ပို့ခြင်း၊ ဖုန်းခေါ်ခြင်း၊ internet data ပို့ခြင်း လုပ်နိုင်သော cellular module။',
      'A cellular module that sends SMS, makes calls and pushes internet data over the GSM/GPRS network.',
    ),
    useCases: [
      L('SMS alert system', 'SMS alert systems'),
      L('remote GSM control', 'Remote GSM control'),
      L('Wi-Fi မရသည့်နေရာ IoT', 'IoT where there is no Wi-Fi'),
    ],
    pinout: [
      { pin: 'RXD / TXD', desc: L('UART (3.3V logic)', 'UART (3.3V logic)') },
      { pin: 'VCC (3.7–4.2V!)', desc: L('ပါဝါ — 2A burst လို', 'Power — needs 2A bursts') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    wiring: L(
      'VCC က 3.7–4.2V + 2A burst လို — Arduino 5V pin မလုံလောက်။ Li-ion / dedicated supply သုံးပါ။',
      'VCC needs 3.7–4.2V and 2A bursts — an Arduino 5V pin is not enough. Use a Li-ion / dedicated supply.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `#include <SoftwareSerial.h>\nSoftwareSerial sim(10,11);\nvoid setup(){ sim.begin(9600); sim.println("AT+CMGF=1"); delay(500); sim.println("AT+CMGS=\\"+95...\\""); delay(500); sim.print("Hello"); sim.write(26); }\nvoid loop(){}`,
    },
    price: '~7,000–12,000 MMK',
    alternatives: ['SIM900', 'SIM7600 (4G)', 'A9G (GSM+GPS)'],
    cautions: [
      L('ပါဝါ မလုံလောက်ရင် register မဖြစ် / ပြန် reboot', 'Under-power stops it registering or reboots it'),
      L('2G network ဆက်ရှိမရှိ ဒေသအလိုက် စစ်ပါ', 'Check 2G network still exists in your area'),
    ],
    libraries: ['SoftwareSerial', 'TinyGSM'],
  },

  sim900: {
    difficulty: 'advanced',
    whatFor: L(
      'ဖုန်းခေါ်ခြင်း၊ SMS၊ GPRS data အတွက် GSM module (shield ပုံစံ များ)။ SIM800 ၏ အကြီးဗားရှင်း။',
      'A GSM module (often as a shield) for calls, SMS and GPRS data — a larger sibling of the SIM800.',
    ),
    useCases: [
      L('SMS gateway', 'SMS gateways'),
      L('remote alarm', 'Remote alarms'),
      L('GPRS data logger', 'GPRS data loggers'),
    ],
    pinout: [
      { pin: 'RXD / TXD', desc: L('UART', 'UART') },
      { pin: 'VCC (5V, high current)', desc: L('dedicated ပါဝါ လို', 'Needs a dedicated supply') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <SoftwareSerial.h>\nSoftwareSerial gsm(7,8);\nvoid setup(){ gsm.begin(9600); gsm.println("AT"); }\nvoid loop(){ if(gsm.available()) Serial.write(gsm.read()); }`,
    },
    price: '~10,000–16,000 MMK (shield)',
    alternatives: ['SIM800L (smaller)', 'SIM7600 (4G)'],
    cautions: [
      L('current burst များ — USB power မလုံလောက်', 'High current bursts — USB power is insufficient'),
      L('2G sunset ဒေသအလိုက် — 4G module စဉ်းစား', '2G is being retired in places — consider a 4G module'),
    ],
    libraries: ['SoftwareSerial', 'TinyGSM'],
  },

  'gps-neo6': {
    difficulty: 'intermediate',
    whatFor: L(
      'ဂြိုဟ်တု (satellite) မှ တည်နေရာ (latitude/longitude)၊ အချိန်၊ အမြန်နှုန်းကို ရယူပေးသော GPS module။',
      'A GPS module that reads position (latitude/longitude), time and speed from satellites.',
    ),
    useCases: [
      L('vehicle / asset tracker', 'Vehicle / asset trackers'),
      L('GPS data logger', 'GPS data loggers'),
      L('drone / robot navigation', 'Drone / robot navigation'),
    ],
    pinout: [
      { pin: 'RX / TX', desc: L('UART (NMEA output)', 'UART (NMEA output)') },
      { pin: 'VCC / GND', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <TinyGPS++.h>\n#include <SoftwareSerial.h>\nTinyGPSPlus gps; SoftwareSerial ss(4,3);\nvoid setup(){ Serial.begin(9600); ss.begin(9600); }\nvoid loop(){\n  while(ss.available()) gps.encode(ss.read());\n  if(gps.location.isUpdated()) Serial.println(gps.location.lat(),6);\n}`,
    },
    price: '~6,000–10,000 MMK',
    alternatives: ['NEO-7M / NEO-8M', 'BN-880 (+compass)'],
    cautions: [
      L('ပထမ fix အိမ်ပြင်မှာ ~1–2 မိနစ် ကြာ', 'First fix takes ~1–2 min, outdoors'),
      L('အိမ်ထဲ / အမိုးအောက် signal မရ', 'No signal indoors / under a roof'),
    ],
    libraries: ['TinyGPS++', 'SoftwareSerial'],
  },

  'rfid-rc522': {
    difficulty: 'beginner',
    whatFor: L(
      '13.56MHz RFID card / tag ကို ဖတ်/ရေးနိုင်သော module။ access control နဲ့ attendance project များအတွက်။',
      'A module to read/write 13.56MHz RFID cards/tags — for access-control and attendance projects.',
    ),
    useCases: [
      L('တံခါး access control', 'Door access control'),
      L('attendance system', 'Attendance systems'),
      L('cashless / token system', 'Cashless / token systems'),
    ],
    pinout: [
      { pin: 'SPI (SCK/MOSI/MISO/SDA/RST)', desc: L('control bus', 'Control bus') },
      { pin: 'VCC (3.3V!)', desc: L('3.3V သာ', '3.3V only') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <MFRC522.h>\nMFRC522 rfid(10,9);  // SDA,RST\nvoid setup(){ Serial.begin(9600); SPI.begin(); rfid.PCD_Init(); }\nvoid loop(){\n  if(rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial())\n    Serial.println(rfid.uid.uidByte[0]);\n}`,
    },
    price: '~2,500–4,500 MMK (with card)',
    alternatives: ['PN532 (NFC)', '125kHz RFID (EM18)'],
    cautions: [
      L('VCC 3.3V သာ — 5V ဆို ပျက်', 'VCC is 3.3V only — 5V will damage it'),
      L('read range တို (~3cm)', 'Short read range (~3cm)'),
    ],
    libraries: ['MFRC522', 'SPI'],
  },

  'fingerprint-mod': {
    difficulty: 'intermediate',
    whatFor: L(
      'လက်ဗွေ (fingerprint) ကို scan၍ enroll/verify လုပ်ပေးသော optical module (R307)။ biometric security အတွက်။',
      'An optical module (R307) that scans fingerprints to enroll/verify — for biometric security.',
    ),
    useCases: [
      L('biometric door lock', 'Biometric door locks'),
      L('လက်ဗွေ attendance', 'Fingerprint attendance'),
      L('secure access system', 'Secure access systems'),
    ],
    pinout: [
      { pin: 'TX / RX', desc: L('UART (3.3V)', 'UART (3.3V)') },
      { pin: 'VCC / GND', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Adafruit_Fingerprint.h>\n#include <SoftwareSerial.h>\nSoftwareSerial ss(2,3);\nAdafruit_Fingerprint f(&ss);\nvoid setup(){ Serial.begin(9600); f.begin(57600); }\nvoid loop(){ if(f.getImage()==FINGERPRINT_OK) Serial.println("captured"); }`,
    },
    price: '~12,000–20,000 MMK',
    alternatives: ['R503 (round)', 'Capacitive fingerprint'],
    cautions: [
      L('enroll ကို အရင်လုပ်မှ verify ရ', 'You must enroll before you can verify'),
      L('sensor မျက်နှာပြင် သန့်ရှင်းစေ — ညစ်ရင် fail', 'Keep the sensor surface clean — dirt causes failures'),
    ],
    libraries: ['Adafruit_Fingerprint', 'SoftwareSerial'],
  },

  'ethernet-mod': {
    difficulty: 'intermediate',
    whatFor: L(
      'Wi-Fi မဟုတ်ဘဲ ကြိုး (Ethernet) ဖြင့် ကွန်ရက်ချိတ်ဆက်ပေးသော module (W5100/W5500)။ တည်ငြိမ်မှု ပိုမြင့်။',
      'A module (W5100/W5500) that connects to a network via a wired Ethernet cable — more stable than Wi-Fi.',
    ),
    useCases: [
      L('တည်ငြိမ်သော web server', 'Stable web servers'),
      L('industrial network node', 'Industrial network nodes'),
      L('Wi-Fi မသင့်တော်သည့်နေရာ', 'Places where Wi-Fi is unsuitable'),
    ],
    pinout: [
      { pin: 'SPI (SCK/MOSI/MISO/CS)', desc: L('control bus', 'Control bus') },
      { pin: 'VCC / GND', desc: L('5V / 3.3V ပါဝါ', '5V / 3.3V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Ethernet.h>\nbyte mac[]={0xDE,0xAD,0xBE,0xEF,0xFE,0xED};\nvoid setup(){ Serial.begin(9600); Ethernet.begin(mac); Serial.println(Ethernet.localIP()); }\nvoid loop(){}`,
    },
    price: '~5,000–9,000 MMK',
    alternatives: ['ENC28J60 (cheaper)', 'ESP32 + Wi-Fi', 'PoE module'],
    cautions: [
      L('W5100 current များ — ပါဝါ လုံလောက်စေ', 'The W5100 draws a lot — ensure adequate power'),
      L('MAC address unique ဖြစ်စေ (network ပေါ်တွင်)', 'Keep the MAC address unique on the network'),
    ],
    libraries: ['Ethernet', 'SPI'],
  },

  'esp-now': {
    difficulty: 'intermediate',
    whatFor: L(
      'ESP32/ESP8266 device များအချင်းချင်း router မလိုဘဲ တိုက်ရိုက် ဆက်သွယ်နိုင်သော Wi-Fi protocol။',
      'A Wi-Fi protocol letting ESP32/ESP8266 devices talk directly to each other without a router.',
    ),
    useCases: [
      L('sensor mesh network', 'Sensor mesh networks'),
      L('remote ↔ receiver control', 'Remote ↔ receiver control'),
      L('router-less telemetry', 'Router-less telemetry'),
    ],
    pinout: [
      { pin: 'built-in', desc: L('ESP chip ၏ Wi-Fi ကို သုံး', 'Uses the ESP chip\u2019s Wi-Fi') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <esp_now.h>\n#include <WiFi.h>\nvoid setup(){\n  WiFi.mode(WIFI_STA);\n  esp_now_init();\n  // add peer, then esp_now_send(peerMac, data, len);\n}\nvoid loop(){}`,
    },
    price: '(ESP board ဖြင့် အပါ)',
    alternatives: ['nRF24', 'LoRa', 'MQTT (via router)'],
    cautions: [
      L('peer MAC address မှန်ကန်စွာ ထည့်ရ', 'Peer MAC addresses must be entered correctly'),
      L('same Wi-Fi channel ပေါ်မှာ ရှိရ', 'Devices must be on the same Wi-Fi channel'),
    ],
    libraries: ['esp_now', 'WiFi'],
  },

  // ─── Power ────────────────────────────────────────────────────────────────
  liion: {
    difficulty: 'beginner',
    whatFor: L(
      'ပြန်လည်အားသွင်းနိုင်သော 3.7V lithium cell (18650)။ portable project များအတွက် စွမ်းအင် သိုလှောင်မှု အဓိက ရင်းမြစ်။',
      'A rechargeable 3.7V lithium cell (18650) — the main energy store for portable projects.',
    ),
    useCases: [
      L('portable / battery project', 'Portable / battery projects'),
      L('power bank DIY', 'DIY power banks'),
      L('solar storage', 'Solar storage'),
    ],
    pinout: [
      { pin: '+ / -', desc: L('3.0–4.2V (nominal 3.7V)', '3.0–4.2V (nominal 3.7V)') },
    ],
    wiring: L(
      'တိုက်ရိုက် မသုံးဘဲ TP4056 (charge) + boost/regulator မှတစ်ဆင့် သုံးပါ။ protection circuit ပါသည့် cell ရွေးပါ။',
      'Don\u2019t use it raw — go through a TP4056 (charge) plus a boost/regulator. Prefer a protected cell.',
    ),
    price: '~3,000–8,000 MMK (genuine)',
    alternatives: ['LiPo pack', 'NiMH AA', '21700 cell'],
    cautions: [
      L('short / over-discharge ဆို မီးလောင် / ပေါက်ကွဲနိုင်', 'Shorting / over-discharging can cause fire or explosion'),
      L('အတု cell များ capacity လိမ် — genuine ဝယ်ပါ', 'Fake cells lie about capacity — buy genuine'),
    ],
    libraries: [],
  },

  lipo: {
    difficulty: 'intermediate',
    whatFor: L(
      'ပေါ့ပါးပြီး current မြင့်စွာ ထုတ်ပေးနိုင်သော ပြန်လည်အားသွင်း lithium-polymer pack။ drone နဲ့ RC များတွင် သုံး။',
      'A lightweight rechargeable lithium-polymer pack that delivers high current — used in drones and RC.',
    ),
    useCases: [
      L('drone / RC', 'Drones / RC'),
      L('wearable ပါးလွှာ project', 'Slim wearable projects'),
      L('high-current portable', 'High-current portable builds'),
    ],
    pinout: [
      { pin: '+ / -', desc: L('3.7V/cell (2S=7.4V…)', '3.7V per cell (2S=7.4V…)') },
      { pin: 'balance', desc: L('cell balance connector', 'Cell-balance connector') },
    ],
    wiring: L(
      'balance charger ဖြင့်သာ အားသွင်းပါ။ over-discharge ကာကွယ်ရန် low-voltage cutoff သုံးပါ။',
      'Charge only with a balance charger and use a low-voltage cutoff to prevent over-discharge.',
    ),
    price: '~8,000–25,000 MMK',
    alternatives: ['Li-ion 18650', 'LiFePO4 (safer)'],
    cautions: [
      L('ဖောင်း / ပေါက် / လောင်လွယ် — balance charge မဖြစ်မနေ', 'Can swell / puncture / ignite — balance charging is mandatory'),
      L('3.0V အောက် မချရ — cell ပျက်', 'Never discharge below ~3.0V/cell — it ruins the cell'),
    ],
    libraries: [],
  },

  tp4056: {
    difficulty: 'beginner',
    whatFor: L(
      'Li-ion / LiPo cell တစ်လုံးကို USB မှ ဘေးကင်းစွာ အားသွင်းပေးသော charger module။ protection ပါသည့် version ရှိ။',
      'A charger module that safely charges a single Li-ion/LiPo cell from USB. A protected version exists.',
    ),
    useCases: [
      L('DIY power bank', 'DIY power banks'),
      L('rechargeable project', 'Rechargeable projects'),
      L('battery management', 'Battery management'),
    ],
    pinout: [
      { pin: 'IN+ / IN-', desc: L('USB 5V ဝင်', 'USB 5V in') },
      { pin: 'B+ / B-', desc: L('battery ချိတ်', 'Battery connection') },
      { pin: 'OUT+ / OUT-', desc: L('load (protected version)', 'Load (protected version)') },
    ],
    code: {
      lang: 'Hardware',
      code: `// No code. RED LED = charging, BLUE/GREEN = full.\n// Prefer the "TP4056 + DW01" protected board for OUT+/OUT-.`,
    },
    price: '~500–1,500 MMK',
    alternatives: ['TP5100 (2S)', 'IP5306 (power-bank IC)', 'BQ24075'],
    cautions: [
      L('protection မပါသည့် version က over-discharge မကာကွယ်', 'The unprotected version does not guard against over-discharge'),
      L('load ကို B+ မဟုတ်ဘဲ OUT+ ကနေ ယူပါ (protected)', 'Draw load from OUT+, not B+ (protected board)'),
    ],
    libraries: [],
  },

  buck: {
    difficulty: 'beginner',
    whatFor: L(
      'မြင့်သော DC voltage ကို နိမ့်သော voltage သို့ ထိရောက်စွာ (heat နည်း) လျှော့ချပေးသော step-down converter (LM2596)။',
      'A step-down converter (LM2596) that efficiently (low heat) lowers a higher DC voltage to a lower one.',
    ),
    useCases: [
      L('12V → 5V ပြောင်း', 'Stepping 12V → 5V'),
      L('battery → MCU ပါဝါ', 'Battery → MCU power'),
      L('motor + logic ပါဝါ ခွဲ', 'Separate motor + logic rails'),
    ],
    pinout: [
      { pin: 'IN+ / IN-', desc: L('မြင့်သော voltage ဝင်', 'Higher voltage in') },
      { pin: 'OUT+ / OUT-', desc: L('လျှော့ချ voltage ထုတ်', 'Stepped-down voltage out') },
    ],
    wiring: L(
      'load မတပ်ခင် pot လှည့်၍ output voltage ကို multimeter နဲ့ အရင် ချိန်ပါ။',
      'Before connecting a load, turn the pot and set the output voltage with a multimeter first.',
    ),
    price: '~1,000–2,500 MMK',
    alternatives: ['MP1584 (small)', 'XL4015 (high current)', 'Buck-boost'],
    cautions: [
      L('output ကို အရင်မချိန်ဘဲ load တပ်ရင် ပျက်နိုင်', 'Connecting a load before setting the output can damage it'),
      L('input > output ဖြစ်မှ အလုပ်လုပ် (step-down သာ)', 'Only works when input > output (step-down only)'),
    ],
    libraries: [],
  },

  boost: {
    difficulty: 'beginner',
    whatFor: L(
      'နိမ့်သော DC voltage ကို မြင့်သော voltage သို့ တင်ပေးသော step-up converter။ battery တစ်လုံးမှ 5V/12V ရရန်။',
      'A step-up converter that raises a lower DC voltage to a higher one — e.g. 5V/12V from a single cell.',
    ),
    useCases: [
      L('3.7V battery → 5V', '3.7V battery → 5V'),
      L('portable USB power', 'Portable USB power'),
      L('LED strip drive', 'LED-strip drive'),
    ],
    pinout: [
      { pin: 'IN+ / IN-', desc: L('နိမ့်သော voltage ဝင်', 'Lower voltage in') },
      { pin: 'OUT+ / OUT-', desc: L('မြင့်သော voltage ထုတ်', 'Higher voltage out') },
    ],
    wiring: L(
      'output pot ကို load မတပ်ခင် ချိန်ပါ။',
      'Set the output pot before attaching a load.',
    ),
    price: '~1,000–2,500 MMK',
    alternatives: ['MT3608', 'Buck-boost (both)', 'Charge pump'],
    cautions: [
      L('input current = output ထက်များ — battery drain မြန်', 'Input current exceeds output — battery drains faster'),
      L('rated power ကို မကျော်ရ', 'Do not exceed the rated power'),
    ],
    libraries: [],
  },

  ldo: {
    difficulty: 'beginner',
    whatFor: L(
      'ရိုးရှင်းစွာ တည်ငြိမ်သော 5V ထုတ်ပေးသော linear regulator (7805)။ ဒါပေမဲ့ voltage drop ကို heat အဖြစ် ပြောင်း၍ ဆုံးရှုံးများ။',
      'A linear regulator (7805) giving a simple, stable 5V — but it wastes the voltage difference as heat.',
    ),
    useCases: [
      L('ရိုးရှင်းသော 5V ပါဝါ', 'Simple 5V supplies'),
      L('current နည်းသော circuit', 'Low-current circuits'),
      L('breadboard ပါဝါ', 'Breadboard power'),
    ],
    pinout: [
      { pin: 'IN', desc: L('7–35V ဝင်', '7–35V in') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
      { pin: 'OUT', desc: L('5V ထုတ်', '5V out') },
    ],
    wiring: L(
      'IN နဲ့ OUT မှာ 0.33µF / 0.1µF capacitor ထည့်ပါ။ current များရင် heatsink လို။',
      'Add 0.33µF / 0.1µF caps on IN and OUT. Needs a heatsink at higher currents.',
    ),
    price: '~300–800 MMK',
    alternatives: ['Buck converter (efficient)', 'AMS1117', 'LM1117'],
    cautions: [
      L('efficiency နိမ့် — 12V→5V မှာ heat များ', 'Low efficiency — lots of heat on 12V→5V'),
      L('1A ကျော်ရင် buck converter သုံးသင့်', 'Above ~1A, prefer a buck converter'),
    ],
    libraries: [],
  },

  ams1117: {
    difficulty: 'beginner',
    whatFor: L(
      '3.3V ကို တည်ငြိမ်စွာ ထုတ်ပေးသော low-dropout regulator။ 3.3V sensor / ESP module များ ပါဝါပေးရန်.',
      'A low-dropout regulator giving a stable 3.3V — to power 3.3V sensors / ESP modules.',
    ),
    useCases: [
      L('5V → 3.3V ပြောင်း', 'Stepping 5V → 3.3V'),
      L('ESP / sensor ပါဝါ', 'Powering ESP / sensors'),
      L('board ပေါ် regulator', 'On-board regulation'),
    ],
    pinout: [
      { pin: 'IN', desc: L('4.5–12V ဝင်', '4.5–12V in') },
      { pin: 'GND', desc: L('မြေ', 'Ground') },
      { pin: 'OUT', desc: L('3.3V ထုတ်', '3.3V out') },
    ],
    wiring: L(
      'IN/OUT မှာ 10µF capacitor ထည့်မှ တည်ငြိမ်။',
      'Add 10µF caps on IN/OUT for stability.',
    ),
    price: '~200–600 MMK',
    alternatives: ['LM1117-3.3', 'HT7333 (low power)', 'Buck to 3.3V'],
    cautions: [
      L('current ကန့်သတ် (~800mA) — ESP32 peak မှာ ဆွဲမနိုင်တတ်', 'Limited current (~800mA) — may sag on ESP32 peaks'),
      L('capacitor မပါရင် oscillate', 'Without caps it can oscillate'),
    ],
    libraries: [],
  },

  'solar-panel': {
    difficulty: 'intermediate',
    whatFor: L(
      'နေရောင်ခြည်မှ လျှပ်စစ်စွမ်းအင် ထုတ်ပေးသော panel။ off-grid / battery project များကို အားဖြည့်ရန်.',
      'A panel that generates electricity from sunlight — to recharge off-grid / battery projects.',
    ),
    useCases: [
      L('solar sensor station', 'Solar sensor stations'),
      L('off-grid IoT', 'Off-grid IoT'),
      L('battery trickle charge', 'Battery trickle charging'),
    ],
    pinout: [
      { pin: '+ / -', desc: L('DC output (light-dependent)', 'DC output (light-dependent)') },
    ],
    wiring: L(
      'charge controller (TP4056 / MPPT) မှတစ်ဆင့် battery သို့ ချိတ်ပါ။ blocking diode ထည့်ပါ။',
      'Connect to the battery through a charge controller (TP4056 / MPPT) and add a blocking diode.',
    ),
    price: '~3,000–20,000 MMK (by watt)',
    alternatives: ['Different wattage panels', 'MPPT + panel'],
    cautions: [
      L('battery သို့ တိုက်ရိုက် မချိတ်ရ — controller လို', 'Never wire straight to a battery — a controller is required'),
      L('output က နေရောင်အလိုက် အတက်အကျ ကြီး', 'Output swings widely with sunlight'),
    ],
    libraries: [],
  },

  'ups-module': {
    difficulty: 'intermediate',
    whatFor: L(
      'mains ပြတ်သွားရင် battery ကနေ အလိုအလျောက် ဆက်ပေးသော backup power (power-bank IC) module။',
      'A backup-power (power-bank IC) module that automatically switches to battery when mains drops.',
    ),
    useCases: [
      L('Raspberry Pi UPS', 'Raspberry Pi UPS'),
      L('ပြတ်တောက်မခံသည့် logger', 'Uninterruptible loggers'),
      L('portable 5V power', 'Portable 5V power'),
    ],
    pinout: [
      { pin: 'IN (USB)', desc: L('charge input', 'Charge input') },
      { pin: 'BAT', desc: L('18650 / LiPo', '18650 / LiPo') },
      { pin: 'OUT (5V USB)', desc: L('load output', 'Load output') },
    ],
    code: {
      lang: 'Hardware',
      code: `// No code. Some modules expose battery level over I2C\n// (e.g. MAX17048 fuel gauge) — read % in software if present.`,
    },
    price: '~3,000–10,000 MMK',
    alternatives: ['IP5306 board', 'DIY TP4056 + boost', 'Commercial UPS HAT'],
    cautions: [
      L('output current rating ကို load နဲ့ ကိုက်ညီစေ', 'Match the output current rating to your load'),
      L('pass-through charging support ရှိမရှိ စစ်ပါ', 'Check it supports pass-through charging'),
    ],
    libraries: [],
  },

  // ─── Passive & Discrete ───────────────────────────────────────────────────
  resistor: {
    difficulty: 'beginner',
    whatFor: L(
      'လျှပ်စီးကို ကန့်သတ်ပေးသော အခြေခံအကျဆုံး ပစ္စည်း။ LED ကာကွယ်ခြင်း၊ voltage divider၊ pull-up/down အတွက်။',
      'The most fundamental part — it limits current. Used to protect LEDs, form voltage dividers and pull-ups/downs.',
    ),
    useCases: [
      L('LED current ကန့်သတ်', 'Limiting LED current'),
      L('voltage divider', 'Voltage dividers'),
      L('pull-up / pull-down', 'Pull-up / pull-down'),
    ],
    pinout: [
      { pin: '2 legs', desc: L('polarity မရှိ (ဘယ်ဘက်မဆို)', 'No polarity (either way)') },
    ],
    wiring: L(
      'တန်ဖိုးကို colour band သို့ multimeter ဖြင့် စစ်ပါ။ LED အတွက် ~220–330Ω အသုံးများ။',
      'Read the value from colour bands or a multimeter. ~220–330Ω is common for LEDs.',
    ),
    code: {
      lang: 'Ohm\u2019s Law',
      code: `R = (Vsupply - Vled) / Iled\n// e.g. (5 - 2.0) / 0.015 = 200 ohm  -> use 220 ohm`,
    },
    price: '~10–50 MMK each (pack cheap)',
    alternatives: ['Different values', 'Potentiometer (variable)'],
    cautions: [
      L('power rating (¼W) ကို မကျော်ရ — ပူ/မီးလောင်', 'Do not exceed the power rating (¼W) — it overheats'),
      L('band ဖတ်ရာ direction သတိ', 'Mind the direction when reading colour bands'),
    ],
    libraries: [],
  },

  capacitor: {
    difficulty: 'beginner',
    whatFor: L(
      'လျှပ်စစ်ဓာတ် သိုလှောင်ပြီး voltage ကို ချောမွေ့စေ (filter) သော ပစ္စည်း။ power line noise ရှင်းရန် အသုံးများ။',
      'Stores charge and smooths (filters) voltage — commonly used to clean up power-line noise.',
    ),
    useCases: [
      L('power supply filtering', 'Power-supply filtering'),
      L('decoupling (IC အနီး)', 'Decoupling near ICs'),
      L('timing / coupling', 'Timing / coupling'),
    ],
    pinout: [
      { pin: 'electrolytic', desc: L('polarised (+ / - သတိ)', 'Polarised (mind + / -)') },
      { pin: 'ceramic', desc: L('polarity မရှိ', 'Non-polarised') },
    ],
    wiring: L(
      'electrolytic ကို polarity မှန်အောင် တပ်ပါ — ပြောင်းပြန်ဆို ပေါက်ကွဲ။ IC power pin အနီး 0.1µF ထည့်ပါ။',
      'Fit electrolytics the right way round — reversed they burst. Place 0.1µF near each IC power pin.',
    ),
    price: '~20–200 MMK each',
    alternatives: ['Different values/types', 'Supercapacitor'],
    cautions: [
      L('electrolytic polarity ပြောင်းပြန်ဆို ပေါက်ကွဲ', 'Reversed electrolytic polarity causes it to burst'),
      L('voltage rating ကို supply ထက် မြင့်အောင် ရွေး', 'Pick a voltage rating above your supply'),
    ],
    libraries: [],
  },

  led: {
    difficulty: 'beginner',
    whatFor: L(
      'လျှပ်စီး စီးဆင်းရင် အလင်းထုတ်ပေးသော diode။ indicator အဖြစ် အသုံးအများဆုံး — series resistor မဖြစ်မနေလို။',
      'A diode that emits light when current flows — the most common indicator. Always needs a series resistor.',
    ),
    useCases: [
      L('status / power indicator', 'Status / power indicators'),
      L('ရိုးရှင်းသော display', 'Simple displays'),
      L('light project', 'Light projects'),
    ],
    pinout: [
      { pin: 'Anode (long)', desc: L('+ ဘက်', 'Positive side') },
      { pin: 'Cathode (short)', desc: L('- ဘက် (flat edge)', 'Negative side (flat edge)') },
    ],
    wiring: L(
      'series resistor (~220Ω) မဖြစ်မနေ ထည့်ပါ။ long leg = +။',
      'A series resistor (~220Ω) is mandatory. The long leg is +.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(13,OUTPUT); }\nvoid loop(){\n  digitalWrite(13,HIGH); delay(500);\n  digitalWrite(13,LOW);  delay(500);\n}`,
    },
    price: '~20–100 MMK each',
    alternatives: ['RGB LED', 'NeoPixel', 'High-power LED'],
    cautions: [
      L('resistor မပါဘဲ တပ်ရင် ချက်ချင်း ပျက်', 'Without a resistor it burns out instantly'),
      L('polarity ပြောင်းပြန်ဆို မလင်း', 'Reversed polarity means no light'),
    ],
    libraries: [],
  },

  diode: {
    difficulty: 'beginner',
    whatFor: L(
      'လျှပ်စီးကို တစ်ဖက်တည်း (one-way) သာ စီးစေသော ပစ္စည်း။ reverse-polarity ကာကွယ်ခြင်း၊ flyback အတွက်။',
      'A part that lets current flow only one way — for reverse-polarity protection and flyback duty.',
    ),
    useCases: [
      L('reverse-polarity protection', 'Reverse-polarity protection'),
      L('flyback (relay/motor coil)', 'Flyback across relay/motor coils'),
      L('rectification', 'Rectification'),
    ],
    pinout: [
      { pin: 'Anode', desc: L('+ ဘက်', 'Positive side') },
      { pin: 'Cathode (stripe)', desc: L('- ဘက် (band ရှိသည့်ဘက်)', 'Negative side (banded end)') },
    ],
    wiring: L(
      'coil အတွက် cathode (band) ကို + ဘက်သို့ လှည့်၍ parallel တပ်ပါ (1N4007)။',
      'For coils, fit it in parallel with the cathode (band) toward + (a 1N4007 works).',
    ),
    price: '~20–100 MMK each',
    alternatives: ['Schottky (low drop)', 'Zener (voltage ref)', 'Bridge rectifier'],
    cautions: [
      L('band direction မှားရင် အလုပ်မလုပ် / ပျက်', 'Wrong band direction means it fails to work / dies'),
      L('current rating ကို load နဲ့ ကိုက်ညီစေ', 'Match the current rating to the load'),
    ],
    libraries: [],
  },

  transistor: {
    difficulty: 'intermediate',
    whatFor: L(
      'signal အသေးဖြင့် current ကြီးကို switch / amplify လုပ်ပေးသော ပစ္စည်း (BJT / MOSFET)။ motor, LED strip drive အတွက်.',
      'Switches / amplifies a large current with a small signal (BJT / MOSFET) — to drive motors, LED strips, etc.',
    ),
    useCases: [
      L('MCU pin နဲ့ load ကြီး switch', 'Switching big loads from an MCU pin'),
      L('LED strip / motor drive', 'LED-strip / motor drive'),
      L('signal amplification', 'Signal amplification'),
    ],
    pinout: [
      { pin: 'BJT: B/C/E', desc: L('Base / Collector / Emitter', 'Base / Collector / Emitter') },
      { pin: 'MOSFET: G/D/S', desc: L('Gate / Drain / Source', 'Gate / Drain / Source') },
    ],
    wiring: L(
      'BJT base မှာ ~1kΩ resistor ထည့်ပါ။ logic-level MOSFET ကို 3.3/5V gate drive အတွက် ရွေးပါ။',
      'Add a ~1kΩ resistor at a BJT base. Choose a logic-level MOSFET for 3.3/5V gate drive.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(9,OUTPUT); }\nvoid loop(){\n  analogWrite(9,180);  // PWM the gate/base -> dims LED strip / motor\n}`,
    },
    price: '~50–500 MMK each',
    alternatives: ['Logic-level MOSFET', 'Darlington (ULN2003)', 'Relay'],
    cautions: [
      L('pinout (BJT vs MOSFET) မှားရင် အလုပ်မလုပ်', 'Wrong pinout (BJT vs MOSFET) means it won\u2019t work'),
      L('standard MOSFET က 5V gate မှာ အပြည့်မဖွင့်', 'A standard MOSFET won\u2019t fully turn on at a 5V gate'),
    ],
    libraries: [],
  },

  potentiometer: {
    difficulty: 'beginner',
    whatFor: L(
      'လက်ဖြင့် လှည့်၍ resistance ပြောင်းနိုင်သော variable resistor။ analog input (volume, brightness) အတွက်.',
      'A variable resistor you turn by hand — for analog input like volume or brightness.',
    ),
    useCases: [
      L('analog knob input', 'Analog knob input'),
      L('brightness / speed control', 'Brightness / speed control'),
      L('menu / value select', 'Menu / value selection'),
    ],
    pinout: [
      { pin: 'Outer 1 / 2', desc: L('VCC နဲ့ GND', 'VCC and GND') },
      { pin: 'Wiper (middle)', desc: L('analog output → ADC', 'Analog output → ADC') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); }\nvoid loop(){\n  Serial.println(analogRead(A0));  // 0-1023\n  delay(100);\n}`,
    },
    price: '~200–800 MMK',
    alternatives: ['Rotary encoder (digital)', 'Slide pot', 'Trimmer pot'],
    cautions: [
      L('wiper ကို middle pin ကနေ ယူပါ', 'Take the wiper from the middle pin'),
      L('log vs linear taper ရှိ — application အလိုက်', 'Log vs linear taper exists — pick per application'),
    ],
    libraries: [],
  },

  crystal: {
    difficulty: 'intermediate',
    whatFor: L(
      'တိကျသော clock frequency (ဥပမာ 16MHz) ကို ထုတ်ပေးသော ပစ္စည်း။ MCU နဲ့ RTC တို့၏ အချိန်မှန်ကန်မှုအတွက်.',
      'Provides a precise clock frequency (e.g. 16MHz) — for accurate timing in MCUs and RTCs.',
    ),
    useCases: [
      L('MCU clock source', 'MCU clock source'),
      L('RTC accuracy (32.768kHz)', 'RTC accuracy (32.768kHz)'),
      L('serial baud timing', 'Serial baud timing'),
    ],
    pinout: [
      { pin: '2 legs', desc: L('MCU XTAL1/XTAL2 သို့', 'To MCU XTAL1/XTAL2') },
    ],
    wiring: L(
      'crystal ခြေထောက် နှစ်ဖက်စလုံးမှ GND သို့ 18–22pF capacitor ထည့်ရ (load cap)။',
      'Add an 18–22pF capacitor from each crystal leg to GND (load caps).',
    ),
    price: '~100–400 MMK',
    alternatives: ['Ceramic resonator', 'Internal RC oscillator', 'TCXO'],
    cautions: [
      L('load capacitor မပါ / မှားရင် oscillate မဖြစ်', 'Wrong / missing load caps stop it oscillating'),
      L('trace ကို တိုအောင်ထား — stray capacitance', 'Keep traces short — stray capacitance matters'),
    ],
    libraries: [],
  },

  fuse: {
    difficulty: 'beginner',
    whatFor: L(
      'သတ်မှတ်ထားသည့် current ကျော်ရင် ဖြတ်တောက်၍ circuit ကို ကာကွယ်ပေးသော ပစ္စည်း။',
      'A part that breaks the circuit when current exceeds a rated value — protecting it from damage.',
    ),
    useCases: [
      L('power input protection', 'Power-input protection'),
      L('battery / motor circuit', 'Battery / motor circuits'),
      L('appliance safety', 'Appliance safety'),
    ],
    pinout: [
      { pin: '2 legs', desc: L('power line series ထဲ', 'In series with the power line') },
    ],
    wiring: L(
      'load ၏ + line ပေါ်တွင် series တပ်ပါ။ rating = normal current × ~1.5။',
      'Fit it in series on the load\u2019s + line. Rating = normal current × ~1.5.',
    ),
    price: '~100–500 MMK (+ holder)',
    alternatives: ['PTC resettable fuse', 'Circuit breaker', 'eFuse IC'],
    cautions: [
      L('rating နည်းလွန်းရင် မကြာခဏ ဖြတ်; များလွန်းရင် မကာကွယ်', 'Too low nuisance-trips; too high fails to protect'),
      L('ကွဲပြီး fuse ကို wire နဲ့ မ bypass ရ', 'Never bypass a blown fuse with wire'),
    ],
    libraries: [],
  },

  inductor: {
    difficulty: 'intermediate',
    whatFor: L(
      'သံလိုက်စက်ကွင်းအဖြစ် စွမ်းအင် သိုလှောင်ပေးသော ပစ္စည်း။ DC-DC converter နဲ့ filter များ၏ အဓိကအစိတ်အပိုင်း.',
      'Stores energy in a magnetic field — a core part of DC-DC converters and filters.',
    ),
    useCases: [
      L('buck / boost converter', 'Buck / boost converters'),
      L('EMI / noise filter', 'EMI / noise filters'),
      L('RF tuning', 'RF tuning'),
    ],
    pinout: [
      { pin: '2 legs', desc: L('polarity မရှိ', 'No polarity') },
    ],
    code: {
      lang: 'Reactance',
      code: `XL = 2 * pi * f * L\n// Higher frequency -> higher impedance (blocks AC, passes DC)`,
    },
    price: '~100–600 MMK',
    alternatives: ['Ferrite bead', 'Common-mode choke', 'Transformer'],
    cautions: [
      L('saturation current ကို မကျော်ရ — inductance ကျ', 'Do not exceed the saturation current — inductance drops'),
      L('switching circuit မှာ EMI ထုတ်နိုင်', 'Can radiate EMI in switching circuits'),
    ],
    libraries: [],
  },

  // ─── Input / Output ───────────────────────────────────────────────────────
  'push-button': {
    difficulty: 'beginner',
    whatFor: L(
      'နှိပ်နေချိန်သာ ဆက်သွယ်ပေးသော momentary switch။ user input ၏ အခြေခံ — debounce လိုသည်။',
      'A momentary switch that connects only while pressed — the basis of user input; needs debouncing.',
    ),
    useCases: [
      L('user input / trigger', 'User input / triggers'),
      L('menu navigation', 'Menu navigation'),
      L('reset / mode ခလုတ်', 'Reset / mode buttons'),
    ],
    pinout: [
      { pin: '4 legs (2 pair)', desc: L('တစ်ဘက် MCU pin, တစ်ဘက် GND', 'One side to an MCU pin, the other to GND') },
    ],
    wiring: L(
      'INPUT_PULLUP သုံးရင် ပြင်ပ resistor မလို — pressed = LOW။',
      'Using INPUT_PULLUP needs no external resistor — pressed reads LOW.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); pinMode(2,INPUT_PULLUP); }\nvoid loop(){\n  if (digitalRead(2) == LOW) Serial.println("Pressed");\n  delay(50);  // crude debounce\n}`,
    },
    price: '~50–200 MMK',
    alternatives: ['Toggle switch', 'Capacitive touch', 'Rotary encoder click'],
    cautions: [
      L('debounce မလုပ်ရင် နှိပ်တစ်ခါ = နှစ်ခါ ဖတ်', 'Without debouncing one press reads as several'),
      L('4-leg မှာ ဘယ်နှစ်ခု ချိတ်ရသည် သတိ', 'Mind which of the 4 legs are the pair'),
    ],
    libraries: ['Bounce2 (optional)'],
  },

  'toggle-switch': {
    difficulty: 'beginner',
    whatFor: L(
      'on/off အခြေအနေကို လက်ဖြင့် ထိန်းထားပေးသော mechanical switch။ power ဖွင့်ပိတ် အတွက် အသုံးများ.',
      'A mechanical switch that latches an on/off state by hand — common for power on/off.',
    ),
    useCases: [
      L('power on/off', 'Power on/off'),
      L('mode select', 'Mode selection'),
      L('manual override', 'Manual override'),
    ],
    pinout: [
      { pin: '2–3 legs', desc: L('SPST / SPDT အလိုက်', 'SPST / SPDT depending on type') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); pinMode(2,INPUT_PULLUP); }\nvoid loop(){\n  Serial.println(digitalRead(2) == LOW ? "ON" : "OFF");\n  delay(200);\n}`,
    },
    price: '~100–500 MMK',
    alternatives: ['Push button (momentary)', 'Slide switch', 'Relay'],
    cautions: [
      L('current rating ကို load နဲ့ ကိုက်ညီစေ', 'Match the current rating to the load'),
      L('logic use မှာ debounce စဉ်းစား', 'Consider debouncing for logic use'),
    ],
    libraries: [],
  },

  keypad: {
    difficulty: 'beginner',
    whatFor: L(
      'ဂဏန်း / စာလုံး ရိုက်ထည့်နိုင်သော 4×4 matrix keypad။ PIN entry နဲ့ menu input အတွက်.',
      'A 4×4 matrix keypad for entering numbers/letters — for PIN entry and menu input.',
    ),
    useCases: [
      L('PIN / password entry', 'PIN / password entry'),
      L('door lock keypad', 'Door-lock keypads'),
      L('calculator / menu', 'Calculators / menus'),
    ],
    pinout: [
      { pin: '8 pins (4 row + 4 col)', desc: L('MCU digital pin ၈ ခု', '8 MCU digital pins') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Keypad.h>\nchar keys[4][4]={{'1','2','3','A'},{'4','5','6','B'},{'7','8','9','C'},{'*','0','#','D'}};\nbyte r[4]={9,8,7,6}, c[4]={5,4,3,2};\nKeypad kp(makeKeymap(keys),r,c,4,4);\nvoid setup(){ Serial.begin(9600); }\nvoid loop(){ char k=kp.getKey(); if(k) Serial.println(k); }`,
    },
    price: '~1,000–2,500 MMK',
    alternatives: ['Touch keypad', 'Rotary encoder', 'I2C keypad'],
    cautions: [
      L('pin ၈ ခု စား — I2C version က pin ချွေ', 'Uses 8 pins — an I2C version saves pins'),
      L('row/col pin mapping မှားရင် key မှား', 'Wrong row/col mapping gives wrong keys'),
    ],
    libraries: ['Keypad'],
  },

  joystick: {
    difficulty: 'beginner',
    whatFor: L(
      '၂ ဦးတည်ချက် (X, Y) analog + နှိပ်ခလုတ်ပါသော joystick module။ direction control အတွက်.',
      'A joystick module with 2-axis (X, Y) analog output plus a press button — for direction control.',
    ),
    useCases: [
      L('robot / RC control', 'Robot / RC control'),
      L('game controller', 'Game controllers'),
      L('menu navigation', 'Menu navigation'),
    ],
    pinout: [
      { pin: 'VRx / VRy', desc: L('X, Y analog output', 'X, Y analog output') },
      { pin: 'SW', desc: L('press button (digital)', 'Press button (digital)') },
      { pin: 'VCC / GND', desc: L('5V ပါဝါ', '5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ Serial.begin(9600); pinMode(2,INPUT_PULLUP); }\nvoid loop(){\n  Serial.print(analogRead(A0)); Serial.print(",");\n  Serial.println(analogRead(A1));\n  delay(100);\n}`,
    },
    price: '~1,000–2,500 MMK',
    alternatives: ['Two potentiometers', 'Analog thumbstick', 'Accelerometer'],
    cautions: [
      L('center မှာ ~512 — drift ရှိတတ် (deadzone ထည့်)', 'Centre reads ~512 — add a deadzone for drift'),
      L('SW pin မှာ pull-up လို', 'The SW pin needs a pull-up'),
    ],
    libraries: [],
  },

  'rotary-encoder': {
    difficulty: 'intermediate',
    whatFor: L(
      'အဆုံးမရှိ လှည့်နိုင်ပြီး လှည့်ဘက်/အရေအတွက်ကို ဖတ်ပေးသော digital input။ menu နဲ့ value ချိန်ရန်.',
      'A digital input that turns endlessly and reports direction/steps — for menus and adjusting values.',
    ),
    useCases: [
      L('menu / value adjust', 'Menu / value adjustment'),
      L('volume / setting knob', 'Volume / setting knobs'),
      L('motor position (with quadrature)', 'Motor position (quadrature)'),
    ],
    pinout: [
      { pin: 'CLK / DT', desc: L('quadrature output', 'Quadrature output') },
      { pin: 'SW', desc: L('press button', 'Press button') },
      { pin: 'VCC / GND', desc: L('ပါဝါ', 'Power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `int last;\nvoid setup(){ Serial.begin(9600); pinMode(2,INPUT); pinMode(3,INPUT); last=digitalRead(2); }\nvoid loop(){\n  int c=digitalRead(2);\n  if(c!=last) Serial.println(digitalRead(3)!=c ? "CW":"CCW");\n  last=c;\n}`,
    },
    price: '~1,000–2,000 MMK',
    alternatives: ['Potentiometer (absolute)', 'Optical encoder'],
    cautions: [
      L('debounce / interrupt မလုပ်ရင် step ကျော်/မှား', 'Without debounce/interrupts it skips or miscounts steps'),
      L('CLK/DT pin မှားရင် direction ပြောင်းပြန်', 'Swapped CLK/DT reverses the direction'),
    ],
    libraries: ['Encoder (PJRC)', 'RotaryEncoder'],
  },

  breadboard: {
    difficulty: 'beginner',
    whatFor: L(
      'ဂဟေဆော် (solder) မလိုဘဲ circuit ကို ယာယီ တည်ဆောက်စမ်းသပ်နိုင်သော board။ prototyping ၏ အခြေခံ.',
      'A board for building and testing circuits temporarily without soldering — the basis of prototyping.',
    ),
    useCases: [
      L('circuit prototype စမ်းသပ်', 'Circuit prototyping'),
      L('component စမ်းသပ်', 'Component testing'),
      L('သင်ကြားရေး', 'Teaching'),
    ],
    pinout: [
      { pin: 'power rails', desc: L('ဘေးတန်း + / - lines', 'Side + / - rails') },
      { pin: 'terminal strips', desc: L('column ၅ ခု ဆက်ထား', 'Columns of 5 tied together') },
    ],
    wiring: L(
      'အလယ် channel ကို IC ကျော်စိုက်ရန်။ ဘေး rail များကို power/ground အတွက်။',
      'Straddle ICs across the centre channel; use the side rails for power/ground.',
    ),
    price: '~1,500–4,000 MMK',
    alternatives: ['Perfboard (permanent)', 'PCB', 'Wire-wrap'],
    cautions: [
      L('current များ / voltage မြင့် project မသင့်', 'Not for high-current / high-voltage projects'),
      L('contact ချောင်ရင် intermittent fault', 'Loose contacts cause intermittent faults'),
    ],
    libraries: [],
  },

  'jumper-wires': {
    difficulty: 'beginner',
    whatFor: L(
      'breadboard နဲ့ module များကို ဆက်သွယ်ရန် သုံးသော Dupont wire များ (M-M, M-F, F-F)။',
      'Dupont wires (M-M, M-F, F-F) used to connect breadboards and modules together.',
    ),
    useCases: [
      L('breadboard ချိတ်ဆက်', 'Breadboard connections'),
      L('module ↔ MCU', 'Module ↔ MCU'),
      L('prototype wiring', 'Prototype wiring'),
    ],
    pinout: [
      { pin: 'M / F ends', desc: L('male pin / female socket', 'Male pin / female socket') },
    ],
    price: '~1,000–3,000 MMK (pack)',
    alternatives: ['Solid-core wire', 'Ribbon cable', 'Soldered wires'],
    cautions: [
      L('ဈေးပေါ wire များ ခြေထောက် ပြတ်လွယ်', 'Cheap wires break internally at the ends'),
      L('current များ project မသင့်', 'Not for high-current projects'),
    ],
    libraries: [],
  },

  pcb: {
    difficulty: 'intermediate',
    whatFor: L(
      'component များကို ဂဟေဆော်၍ အမြဲတမ်း (permanent) circuit တည်ဆောက်ရန် board။ perfboard သို့ custom PCB။',
      'A board for soldering components into a permanent circuit — perfboard or a custom PCB.',
    ),
    useCases: [
      L('final / permanent build', 'Final / permanent builds'),
      L('custom circuit', 'Custom circuits'),
      L('production prototype', 'Production prototypes'),
    ],
    pinout: [
      { pin: 'perfboard', desc: L('ဟို့တိုင်း grid — free wiring', 'Grid of holes — free wiring') },
      { pin: 'custom PCB', desc: L('etched copper traces', 'Etched copper traces') },
    ],
    wiring: L(
      'custom PCB ကို KiCad / EasyEDA နဲ့ ဒီဇိုင်းဆွဲ၍ JLCPCB စသည်တွင် မှာယူနိုင်သည်။',
      'Design a custom PCB in KiCad / EasyEDA and order from a fab like JLCPCB.',
    ),
    price: '~1,000 MMK (perf) – varies (custom)',
    alternatives: ['Breadboard (temp)', 'Perfboard', 'Custom fab PCB'],
    cautions: [
      L('ဂဟေဆော် အပူ များရင် pad ခွာ / component ပျက်', 'Too much soldering heat lifts pads / kills parts'),
      L('custom PCB က mistake ပြင်ရ ခက်', 'Mistakes on a custom PCB are hard to fix'),
    ],
    libraries: ['KiCad', 'EasyEDA'],
  },

  'sd-module': {
    difficulty: 'beginner',
    whatFor: L(
      'microSD card ပေါ်တွင် data (CSV, log, ရုပ်ပုံ) ကို ဖတ်/ရေးနိုင်စေသော module။ data logging အတွက်.',
      'A module to read/write data (CSV, logs, images) on a microSD card — for data logging.',
    ),
    useCases: [
      L('sensor data logger', 'Sensor data loggers'),
      L('config / setting သိမ်း', 'Config / setting storage'),
      L('image / audio storage', 'Image / audio storage'),
    ],
    pinout: [
      { pin: 'SPI (SCK/MOSI/MISO/CS)', desc: L('control bus', 'Control bus') },
      { pin: 'VCC / GND', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <SD.h>\nvoid setup(){\n  Serial.begin(9600); SD.begin(10);\n  File f=SD.open("log.txt",FILE_WRITE);\n  f.println("hello"); f.close();\n}\nvoid loop(){}`,
    },
    price: '~1,500–3,000 MMK',
    alternatives: ['Built-in SD (ESP32)', 'EEPROM', 'SPI flash'],
    cautions: [
      L('card ကို FAT32 format လုပ်ထားရ', 'The card must be FAT32-formatted'),
      L('3.3V logic — 5V board မှာ level shifter ရှိသည့် module ရွေး', 'Uses 3.3V logic — pick a module with a level shifter on 5V boards'),
    ],
    libraries: ['SD', 'SPI'],
  },

  rtc: {
    difficulty: 'beginner',
    whatFor: L(
      'ပါဝါဖြုတ်ထားလည်း အချိန်/ရက်စွဲကို battery ဖြင့် ဆက်လက်မှတ်ထားပေးသော real-time clock (DS3231)။',
      'A real-time clock (DS3231) that keeps the time/date running on a battery even when powered off.',
    ),
    useCases: [
      L('data logger timestamp', 'Data-logger timestamps'),
      L('alarm / scheduler', 'Alarms / schedulers'),
      L('ဒစ်ဂျစ်တယ် နာရီ', 'Digital clocks'),
    ],
    pinout: [
      { pin: 'SDA / SCL', desc: L('I2C bus', 'I2C bus') },
      { pin: 'VCC / GND', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <RTClib.h>\nRTC_DS3231 rtc;\nvoid setup(){ Serial.begin(9600); rtc.begin(); }\nvoid loop(){\n  DateTime n=rtc.now();\n  Serial.println(n.unixtime());\n  delay(1000);\n}`,
    },
    price: '~2,000–3,500 MMK',
    alternatives: ['DS1307 (less accurate)', 'PCF8563', 'NTP (ESP32)'],
    cautions: [
      L('DS3231 က DS1307 ထက် တိကျ (TCXO)', 'The DS3231 is far more accurate than DS1307 (TCXO)'),
      L('backup battery (CR2032) သက်တမ်း စစ်ပါ', 'Check the backup battery (CR2032)'),
    ],
    libraries: ['RTClib', 'Wire'],
  },

  speaker: {
    difficulty: 'intermediate',
    whatFor: L(
      'အသံ / MP3 ဖိုင် ဖွင့်ပေးနိုင်သော DFPlayer Mini + speaker။ voice prompt နဲ့ music project များအတွက်.',
      'A DFPlayer Mini + speaker that plays sounds / MP3 files — for voice prompts and music projects.',
    ),
    useCases: [
      L('voice / sound prompt', 'Voice / sound prompts'),
      L('music player', 'Music players'),
      L('talking device', 'Talking devices'),
    ],
    pinout: [
      { pin: 'RX / TX', desc: L('UART control (DFPlayer)', 'UART control (DFPlayer)') },
      { pin: 'SPK1 / SPK2', desc: L('speaker output', 'Speaker output') },
      { pin: 'VCC / GND', desc: L('3.2–5V ပါဝါ', '3.2–5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <DFRobotDFPlayerMini.h>\n#include <SoftwareSerial.h>\nSoftwareSerial ss(10,11);\nDFRobotDFPlayerMini mp3;\nvoid setup(){ ss.begin(9600); mp3.begin(ss); mp3.volume(20); mp3.play(1); }\nvoid loop(){}`,
    },
    price: '~3,000–6,000 MMK (with speaker)',
    alternatives: ['Buzzer (simple)', 'I2S DAC + amp', 'ISD1820'],
    cautions: [
      L('SD card မှာ 0001.mp3 ပုံစံ နာမည်ပေးရ', 'Name files on the SD card like 0001.mp3'),
      L('RX line မှာ 1kΩ resistor ထည့်ပါ (noise)', 'Add a 1kΩ resistor on the RX line (noise)'),
    ],
    libraries: ['DFRobotDFPlayerMini', 'SoftwareSerial'],
  },

  'usb-ttl': {
    difficulty: 'beginner',
    whatFor: L(
      'PC ၏ USB ကို serial (UART) အဖြစ် ပြောင်းပေးသော adapter (CP2102/CH340)။ USB မပါသည့် board များ program ရေးရန်.',
      'An adapter (CP2102/CH340) that turns a PC\u2019s USB into serial (UART) — to program boards without USB.',
    ),
    useCases: [
      L('Pro Mini / ESP program ရေး', 'Programming Pro Mini / ESP'),
      L('serial debug / monitor', 'Serial debug / monitor'),
      L('module AT command', 'Module AT commands'),
    ],
    pinout: [
      { pin: 'TX / RX', desc: L('cross ချိတ် (TX→RX)', 'Cross-connect (TX→RX)') },
      { pin: 'VCC (3.3/5V)', desc: L('voltage jumper ရွေး', 'Voltage jumper select') },
      { pin: 'GND / DTR', desc: L('မြေ + auto-reset', 'Ground + auto-reset') },
    ],
    code: {
      lang: 'Hardware',
      code: `// TX(adapter) -> RX(board), RX(adapter) -> TX(board)\n// Match VCC jumper to the board's logic (3.3V for ESP!).`,
    },
    price: '~2,000–4,000 MMK',
    alternatives: ['FTDI FT232', 'Onboard USB (Uno/Nano)'],
    cautions: [
      L('VCC jumper ကို board logic နဲ့ ကိုက်စေ (ESP = 3.3V)', 'Match the VCC jumper to the board logic (ESP = 3.3V)'),
      L('TX/RX ကို cross ချိတ်ရ — straight မဟုတ်', 'Cross TX/RX — not straight through'),
    ],
    libraries: [],
  },

  // ─── Industrial / Automation ──────────────────────────────────────────────
  plc: {
    difficulty: 'advanced',
    whatFor: L(
      'စက်ရုံ automation အတွက် ဒီဇိုင်းဆွဲထားသော ခိုင်ခံ့သည့် controller။ ladder logic ဖြင့် program ရေး၍ industrial I/O ထိန်းချုပ်.',
      'A rugged controller built for factory automation — programmed in ladder logic to control industrial I/O.',
    ),
    useCases: [
      L('စက်ရုံ production line', 'Factory production lines'),
      L('motor / conveyor automation', 'Motor / conveyor automation'),
      L('process control', 'Process control'),
    ],
    pinout: [
      { pin: 'Digital I/O', desc: L('24V industrial inputs/outputs', '24V industrial inputs/outputs') },
      { pin: 'Analog I/O', desc: L('4-20mA / 0-10V', '4-20mA / 0-10V') },
      { pin: 'Comms', desc: L('Modbus / Profinet / Ethernet', 'Modbus / Profinet / Ethernet') },
    ],
    code: {
      lang: 'Ladder / ST',
      code: `(* Structured Text example *)\nIF Start_Button AND NOT Stop_Button THEN\n  Motor := TRUE;\nEND_IF;`,
    },
    price: '~150,000 MMK+ (varies widely)',
    alternatives: ['Arduino + industrial shield', 'Raspberry Pi + PLC HAT', 'Micro-PLC'],
    cautions: [
      L('24V industrial wiring — hobby 5V မဟုတ်', 'Uses 24V industrial wiring — not hobby 5V'),
      L('vendor အလိုက် software ကွဲ (Siemens/Mitsubishi…)', 'Software differs by vendor (Siemens/Mitsubishi…)'),
    ],
    libraries: ['TIA Portal', 'GX Works', 'OpenPLC'],
  },

  hmi: {
    difficulty: 'advanced',
    whatFor: L(
      'PLC / စက်ကို လူသားက ထိန်းချုပ်/စောင့်ကြည့်ရန် touchscreen operator interface။',
      'A touchscreen operator interface for humans to control/monitor a PLC or machine.',
    ),
    useCases: [
      L('စက်ရုံ control panel', 'Factory control panels'),
      L('process monitoring', 'Process monitoring'),
      L('operator dashboard', 'Operator dashboards'),
    ],
    pinout: [
      { pin: 'Comms', desc: L('Modbus / Ethernet → PLC', 'Modbus / Ethernet → PLC') },
      { pin: 'Power', desc: L('24V DC industrial', '24V DC industrial') },
    ],
    code: {
      lang: 'Config',
      code: `// Designed in vendor HMI software (e.g. WinCC, GT Designer).\n// Screen objects are bound to PLC tags/registers, not hand-coded.`,
    },
    price: '~100,000 MMK+ (varies)',
    alternatives: ['Nextion (hobby)', 'Raspberry Pi + touchscreen', 'Web SCADA'],
    cautions: [
      L('PLC tag mapping မှန်ကန်စွာ config ရ', 'PLC tag mapping must be configured correctly'),
      L('vendor ecosystem lock-in ရှိ', 'There is vendor ecosystem lock-in'),
    ],
    libraries: ['WinCC', 'GT Designer', 'Node-RED Dashboard'],
  },

  vfd: {
    difficulty: 'advanced',
    whatFor: L(
      'AC induction motor ၏ အမြန်နှုန်းကို frequency ပြောင်း၍ ထိန်းချုပ်ပေးသော drive။ pump/fan စွမ်းအင်ချွေတာ.',
      'A drive that controls an AC induction motor\u2019s speed by varying frequency — saving energy on pumps/fans.',
    ),
    useCases: [
      L('pump / fan speed control', 'Pump / fan speed control'),
      L('conveyor drive', 'Conveyor drives'),
      L('စွမ်းအင်ချွေတာ', 'Energy saving'),
    ],
    pinout: [
      { pin: 'L1/L2/L3', desc: L('AC mains input', 'AC mains input') },
      { pin: 'U/V/W', desc: L('motor output', 'Motor output') },
      { pin: 'Control terminals', desc: L('start/stop, speed ref', 'Start/stop, speed reference') },
    ],
    code: {
      lang: 'Modbus',
      code: `// Speed/start often set via Modbus RTU registers,\n// or analog 0-10V / 4-20mA on the control terminals.`,
    },
    price: '~200,000 MMK+ (by kW)',
    alternatives: ['Soft starter', 'DOL starter', 'Servo drive'],
    cautions: [
      L('mains 3-phase — အသက်အန္တရာယ်, ကျွမ်းကျင်သူ လို', '3-phase mains — life-threatening, needs an expert'),
      L('motor parameter မမှန်ရင် ပျက်စီး', 'Wrong motor parameters cause damage'),
    ],
    libraries: [],
  },

  contactor: {
    difficulty: 'intermediate',
    whatFor: L(
      'မီးအားကြီး (motor, heater) circuit များကို control signal ဖြင့် ဖွင့်ပိတ်ပေးသော heavy-duty relay switch။',
      'A heavy-duty relay switch that turns high-power (motor, heater) circuits on/off with a control signal.',
    ),
    useCases: [
      L('motor start/stop', 'Motor start/stop'),
      L('heater / lighting control', 'Heater / lighting control'),
      L('power switching', 'Power switching'),
    ],
    pinout: [
      { pin: 'A1 / A2', desc: L('coil (control voltage)', 'Coil (control voltage)') },
      { pin: 'L1-L3 / T1-T3', desc: L('main power contacts', 'Main power contacts') },
      { pin: 'NO / NC aux', desc: L('auxiliary contacts', 'Auxiliary contacts') },
    ],
    code: {
      lang: 'Wiring',
      code: `// Coil A1/A2 energised by 24V/230V control (e.g. via a PLC output).\n// Main contacts then carry the motor/heater load.`,
    },
    price: '~15,000–50,000 MMK',
    alternatives: ['SSR (silent)', 'Relay (low power)', 'Motor starter'],
    cautions: [
      L('coil voltage (24V/230V) ကို control နဲ့ ကိုက်စေ', 'Match the coil voltage (24V/230V) to your control'),
      L('mains switching — အသက်အန္တရာယ်', 'Switches mains — life-threatening'),
    ],
    libraries: [],
  },

  proximity: {
    difficulty: 'intermediate',
    whatFor: L(
      'အနီးအနား သတ္တု (inductive) သို့ object (capacitive) ကို ထိတွေ့စရာမလိုဘဲ ရှာဖွေပေးသော industrial switch။',
      'An industrial switch that detects nearby metal (inductive) or objects (capacitive) without contact.',
    ),
    useCases: [
      L('object / part detection', 'Object / part detection'),
      L('position / end-stop', 'Position / end-stops'),
      L('counting on a line', 'Counting on a line'),
    ],
    pinout: [
      { pin: 'Brown (+)', desc: L('10–30V DC ပါဝါ', '10–30V DC power') },
      { pin: 'Blue (-)', desc: L('မြေ', 'Ground') },
      { pin: 'Black (out)', desc: L('NPN/PNP signal', 'NPN/PNP signal') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `// Use a divider/optocoupler to bring 24V output to MCU logic\nvoid setup(){ Serial.begin(9600); pinMode(2,INPUT); }\nvoid loop(){ if(digitalRead(2)) Serial.println("Detected"); }`,
    },
    price: '~5,000–15,000 MMK',
    alternatives: ['IR sensor (hobby)', 'Hall sensor', 'Photoelectric sensor'],
    cautions: [
      L('output 24V — MCU မှာ တိုက်ရိုက် မဖတ်ရ (level/opto)', 'Output is 24V — never read it directly (use level/opto)'),
      L('NPN vs PNP type ကို circuit နဲ့ ကိုက်စေ', 'Match NPN vs PNP type to your circuit'),
    ],
    libraries: [],
  },

  'industrial-encoder': {
    difficulty: 'advanced',
    whatFor: L(
      'motor / shaft ၏ လှည့်ပတ်မှု position / speed ကို တိကျစွာ feedback ပေးသော industrial rotary encoder။',
      'An industrial rotary encoder giving precise position/speed feedback from a motor/shaft.',
    ),
    useCases: [
      L('CNC / servo feedback', 'CNC / servo feedback'),
      L('conveyor speed / length', 'Conveyor speed / length'),
      L('precise positioning', 'Precise positioning'),
    ],
    pinout: [
      { pin: 'A / B', desc: L('quadrature channels', 'Quadrature channels') },
      { pin: 'Z', desc: L('index (once per rev)', 'Index (once per rev)') },
      { pin: 'VCC / GND', desc: L('5–24V ပါဝါ', '5–24V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `volatile long pos=0;\nvoid A(){ pos += digitalRead(3)?1:-1; }\nvoid setup(){ Serial.begin(9600); attachInterrupt(0,A,RISING); }\nvoid loop(){ Serial.println(pos); delay(100); }`,
    },
    price: '~20,000–60,000 MMK',
    alternatives: ['Hobby rotary encoder', 'Magnetic encoder (AS5600)', 'Resolver'],
    cautions: [
      L('high PPR ဆို interrupt / hardware counter လို', 'High PPR needs interrupts / a hardware counter'),
      L('output type (open-collector/line-driver) စစ်ပါ', 'Check the output type (open-collector/line-driver)'),
    ],
    libraries: ['Encoder', 'ESP32 PCNT'],
  },

  scada: {
    difficulty: 'advanced',
    whatFor: L(
      'PLC / RTU အများကို ဗဟိုမှ စောင့်ကြည့်၊ ထိန်းချုပ်၊ data မှတ်တမ်းတင်ပေးသော supervisory software စနစ်.',
      'Supervisory software that centrally monitors, controls and logs data from many PLCs / RTUs.',
    ),
    useCases: [
      L('စက်ရုံ / plant monitoring', 'Factory / plant monitoring'),
      L('utility (water/power) control', 'Utility (water/power) control'),
      L('remote telemetry', 'Remote telemetry'),
    ],
    pinout: [
      { pin: 'Network', desc: L('Modbus TCP / OPC-UA / MQTT', 'Modbus TCP / OPC-UA / MQTT') },
    ],
    code: {
      lang: 'Node-RED / config',
      code: `// Open-source stack example:\n// PLC --Modbus--> Node-RED --> InfluxDB --> Grafana dashboard`,
    },
    price: '(software — free to enterprise)',
    alternatives: ['Ignition', 'Node-RED + Grafana', 'ThingsBoard'],
    cautions: [
      L('OT network security အလွန်အရေးကြီး', 'OT network security is critical'),
      L('tag / register mapping မှန်ကန်စွာ ပြုစုရ', 'Tag / register mapping must be maintained carefully'),
    ],
    libraries: ['Node-RED', 'Ignition', 'ThingsBoard'],
  },

  'sensor-industrial': {
    difficulty: 'advanced',
    whatFor: L(
      'industrial standard 4-20mA loop ဖြင့် process value (ဖိအား၊ အပူ၊ level) ကို noise-immune ပို့ပေးသော sensor.',
      'A sensor that sends a process value (pressure, temp, level) over the industrial 4-20mA loop, immune to noise.',
    ),
    useCases: [
      L('process measurement', 'Process measurement'),
      L('long-distance signal', 'Long-distance signalling'),
      L('PLC / SCADA input', 'PLC / SCADA input'),
    ],
    pinout: [
      { pin: 'Loop + / -', desc: L('4-20mA current loop', '4-20mA current loop') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `// Read 4-20mA via a 250-ohm resistor -> 1-5V into ADC\nvoid loop(){\n  float v = analogRead(A0)*5.0/1024;\n  float mA = v/250.0*1000;\n  // map 4-20mA to your range\n}`,
    },
    price: '~20,000–80,000 MMK',
    alternatives: ['Hobby sensor (0-5V)', '0-10V transmitter', 'HART sensor'],
    cautions: [
      L('4-20mA ကို 250Ω နဲ့ voltage ပြောင်းမှ ADC ဖတ်ရ', 'Convert 4-20mA via 250Ω to a voltage before the ADC'),
      L('loop power (24V) မှန်ကန်စွာ ပေးရ', 'Provide correct loop power (24V)'),
    ],
    libraries: [],
  },

  // ─── Robotics ─────────────────────────────────────────────────────────────
  'robot-arm': {
    difficulty: 'advanced',
    whatFor: L(
      'servo / stepper များဖြင့် ဆက်စပ်ထားသော multi-joint manipulator။ pick-and-place နဲ့ automation project များအတွက်.',
      'A multi-joint manipulator built from servos/steppers — for pick-and-place and automation projects.',
    ),
    useCases: [
      L('pick-and-place', 'Pick-and-place'),
      L('automated assembly', 'Automated assembly'),
      L('education / demo', 'Education / demos'),
    ],
    pinout: [
      { pin: 'per-joint servo', desc: L('PWM signal (PCA9685 ကောင်း)', 'PWM signal (PCA9685 helps)') },
      { pin: 'Power', desc: L('servo bus 5-6V high current', 'Servo bus 5-6V high current') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Adafruit_PWMServoDriver.h>\nAdafruit_PWMServoDriver pwm;\nvoid setup(){ pwm.begin(); pwm.setPWMFreq(50); }\nvoid loop(){ pwm.setPWM(0, 0, 300); }  // joint 0 angle`,
    },
    price: '~30,000–100,000 MMK (kit)',
    alternatives: ['SCARA arm', 'Delta robot', '6-DOF industrial'],
    cautions: [
      L('servo အများ — dedicated 5-6V high-current supply လို', 'Many servos — needs a dedicated 5-6V high-current supply'),
      L('inverse kinematics တွက်ချက်မှု ရှုပ်ထွေး', 'Inverse kinematics maths is complex'),
    ],
    libraries: ['Adafruit_PWMServoDriver', 'ServoEasing'],
  },

  gripper: {
    difficulty: 'intermediate',
    whatFor: L(
      'robot arm ၏ အဆုံးတွင် object ကို ဖမ်းကိုင်ရန် သုံးသော servo-driven claw (end-effector)။',
      'A servo-driven claw (end-effector) at the end of a robot arm, used to grip objects.',
    ),
    useCases: [
      L('object ဖမ်းကိုင်', 'Object gripping'),
      L('pick-and-place', 'Pick-and-place'),
      L('sorting robot', 'Sorting robots'),
    ],
    pinout: [
      { pin: 'Servo signal', desc: L('PWM (open/close angle)', 'PWM (open/close angle)') },
      { pin: 'VCC / GND', desc: L('5-6V ပါဝါ', '5-6V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <Servo.h>\nServo grip;\nvoid setup(){ grip.attach(9); }\nvoid loop(){\n  grip.write(10);  delay(800);   // close\n  grip.write(80);  delay(800);   // open\n}`,
    },
    price: '~5,000–15,000 MMK',
    alternatives: ['Vacuum gripper', 'Soft gripper', 'Parallel-jaw'],
    cautions: [
      L('grip force ကြီးရင် servo stall / ပူ', 'Excess grip force stalls / overheats the servo'),
      L('object အရွယ်အစားနဲ့ jaw travel ကိုက်စေ', 'Match jaw travel to your object size'),
    ],
    libraries: ['Servo'],
  },

  'robot-wheel': {
    difficulty: 'beginner',
    whatFor: L(
      'mobile robot များ မောင်းနှင်ရန် သုံးသော gear motor + wheel။ chassis kit တွင် အများဆုံး ပါဝင်.',
      'A gear motor + wheel used to drive mobile robots — most common in chassis kits.',
    ),
    useCases: [
      L('robot car / rover', 'Robot cars / rovers'),
      L('line follower', 'Line followers'),
      L('mobile platform', 'Mobile platforms'),
    ],
    pinout: [
      { pin: 'Motor + / -', desc: L('via H-bridge driver', 'Via an H-bridge driver') },
    ],
    wiring: L(
      'L298N / TB6612 driver မှတစ်ဆင့် ချိတ်ပါ။ ဘီး ၂-၄ လုံးကို PWM နဲ့ speed ချိန်။',
      'Connect through an L298N / TB6612 driver; set 2–4 wheels\u2019 speed with PWM.',
    ),
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(8,OUTPUT); pinMode(9,OUTPUT); }\nvoid loop(){\n  digitalWrite(8,HIGH); analogWrite(9,200);  // forward\n  delay(1000);\n}`,
    },
    price: '~2,000–5,000 MMK (motor + wheel)',
    alternatives: ['Mecanum wheels', 'Continuous servo + wheel', 'Tracked drive'],
    cautions: [
      L('MCU pin နဲ့ တိုက်ရိုက် မမောင်းရ — driver လို', 'Never drive from an MCU pin — use a driver'),
      L('ဘီး ၂ ဖက် speed မညီရင် ကွေ့သွား', 'Mismatched wheel speeds make it veer'),
    ],
    libraries: [],
  },

  'imu-robot': {
    difficulty: 'advanced',
    whatFor: L(
      'robot ၏ ထောင့် / balance ကို ထိန်းရန် sensor fusion လုပ်ပေးသော IMU (accelerometer + gyro + sometimes mag)။',
      'An IMU (accelerometer + gyro + sometimes mag) with sensor fusion to keep a robot\u2019s tilt / balance.',
    ),
    useCases: [
      L('self-balancing robot', 'Self-balancing robots'),
      L('drone stabilisation', 'Drone stabilisation'),
      L('orientation tracking', 'Orientation tracking'),
    ],
    pinout: [
      { pin: 'SDA / SCL', desc: L('I2C bus', 'I2C bus') },
      { pin: 'INT', desc: L('data-ready interrupt', 'Data-ready interrupt') },
      { pin: 'VCC / GND', desc: L('3.3–5V ပါဝါ', '3.3–5V power') },
    ],
    code: {
      lang: 'Arduino C++',
      code: `#include <MPU6050_light.h>\nMPU6050 mpu(Wire);\nvoid setup(){ Serial.begin(9600); Wire.begin(); mpu.begin(); mpu.calcOffsets(); }\nvoid loop(){ mpu.update(); Serial.println(mpu.getAngleX()); }`,
    },
    price: '~3,000–12,000 MMK',
    alternatives: ['MPU6050', 'BNO055 (fused)', 'ICM-20948'],
    cautions: [
      L('gyro drift — complementary / Kalman filter လို', 'Gyro drift — needs a complementary / Kalman filter'),
      L('balance loop ကို PID tuning ရ', 'The balance loop requires PID tuning'),
    ],
    libraries: ['MPU6050_light', 'Adafruit_BNO055'],
  },

  'lidar-robot': {
    difficulty: 'advanced',
    whatFor: L(
      'ပတ်ဝန်းကျင်ကို ၃၆၀° scan လုပ်၍ mapping / SLAM အတွက် အကွာအဝေး data ပေးသော rotating LiDAR။',
      'A rotating LiDAR that scans the surroundings 360° to provide distance data for mapping / SLAM.',
    ),
    useCases: [
      L('SLAM / mapping robot', 'SLAM / mapping robots'),
      L('autonomous navigation', 'Autonomous navigation'),
      L('obstacle mapping', 'Obstacle mapping'),
    ],
    pinout: [
      { pin: 'TX / RX', desc: L('UART data (point cloud)', 'UART data (point cloud)') },
      { pin: 'Motor ctrl', desc: L('spin PWM / enable', 'Spin PWM / enable') },
      { pin: 'VCC / GND', desc: L('5V ပါဝါ', '5V power') },
    ],
    code: {
      lang: 'Python (ROS)',
      code: `# Usually run with the vendor ROS driver:\n# ros2 launch rplidar_ros rplidar.launch.py\n# Then subscribe to the /scan (LaserScan) topic.`,
    },
    price: '~80,000–250,000 MMK (RPLIDAR)',
    alternatives: ['TF-Luna (1D)', 'Depth camera', 'Ultrasonic ring'],
    cautions: [
      L('data များ — Raspberry Pi / ROS class compute လို', 'Lots of data — needs Raspberry-Pi / ROS-class compute'),
      L('motor power stable ဖြစ်စေ (spin rate)', 'Keep motor power stable (spin rate)'),
    ],
    libraries: ['RPLIDAR SDK', 'ROS / ROS2'],
  },

  'depth-cam': {
    difficulty: 'advanced',
    whatFor: L(
      'ရုပ်ပုံသာမက အကွာအဝေး (depth) ကိုပါ pixel တိုင်းအတွက် တိုင်း၍ 3D vision ပေးသော camera (RealSense/Kinect)။',
      'A camera (RealSense/Kinect) that measures distance (depth) per pixel as well as colour — giving 3D vision.',
    ),
    useCases: [
      L('3D object / obstacle detection', '3D object / obstacle detection'),
      L('gesture / body tracking', 'Gesture / body tracking'),
      L('robot manipulation vision', 'Robot-manipulation vision'),
    ],
    pinout: [
      { pin: 'USB 3.0', desc: L('host PC / Jetson သို့', 'To host PC / Jetson') },
    ],
    code: {
      lang: 'Python',
      code: `import pyrealsense2 as rs\np = rs.pipeline(); p.start()\nframes = p.wait_for_frames()\ndepth = frames.get_depth_frame()\nprint(depth.get_distance(320, 240))  # metres at centre`,
    },
    price: '~150,000–400,000 MMK',
    alternatives: ['Stereo camera pair', 'ToF sensor', 'LiDAR'],
    cautions: [
      L('USB 3.0 + strong compute (Jetson/PC) လို', 'Needs USB 3.0 + strong compute (Jetson/PC)'),
      L('နေရောင်ပြင်း အပြင် depth error များ', 'Depth errors increase in bright sunlight'),
    ],
    libraries: ['pyrealsense2', 'OpenCV', 'Open3D'],
  },

  // ─── Languages ────────────────────────────────────────────────────────────
  python: {
    difficulty: 'beginner',
    whatFor: L(
      'ဖတ်ရလွယ်ကူပြီး library ကြွယ်ဝသော general-purpose ဘာသာစကား။ AI/data science, web, automation, IoT အားလုံးအတွက် သုံးနိုင်၍ စတင်လေ့လာသူများ၏ ပထမဆုံး ရွေးချယ်မှု။',
      'A highly readable general-purpose language with a huge library ecosystem — used for AI/data science, web, automation and IoT. The top first choice for beginners.',
    ),
    useCases: [
      L('AI / machine learning', 'AI / machine learning'),
      L('data analysis / visualization', 'Data analysis / visualisation'),
      L('automation script / web backend', 'Automation scripts / web backends'),
    ],
    code: {
      lang: 'Python',
      code: `def greet(name):\n    return f"Hello, {name}!"\n\nfor i in range(3):\n    print(greet("TU"))`,
    },
    price: 'Free / open-source',
    alternatives: ['R (stats)', 'Julia (numeric)', 'JavaScript'],
    cautions: [
      L('interpreted — C/C++ ထက် run နှေး', 'Interpreted — slower at runtime than C/C++'),
      L('indentation က syntax — space/tab မရောရ', 'Indentation IS syntax — never mix spaces/tabs'),
    ],
    libraries: ['NumPy', 'Pandas', 'Flask/Django', 'PyTorch/TensorFlow'],
  },

  cpp: {
    difficulty: 'intermediate',
    whatFor: L(
      'hardware နဲ့ အနီးကပ် ထိန်းချုပ်နိုင်ပြီး အလွန်မြန်သော ဘာသာစကား။ Arduino/embedded, game engine, performance-critical software များအတွက်။',
      'A very fast language with close hardware control — for Arduino/embedded, game engines and performance-critical software.',
    ),
    useCases: [
      L('embedded / Arduino firmware', 'Embedded / Arduino firmware'),
      L('game engine / graphics', 'Game engines / graphics'),
      L('performance-critical system', 'Performance-critical systems'),
    ],
    code: {
      lang: 'C++',
      code: `#include <iostream>\nusing namespace std;\nint main() {\n  for (int i = 0; i < 3; i++)\n    cout << "Hello TU" << endl;\n  return 0;\n}`,
    },
    price: 'Free / open-source',
    alternatives: ['Rust (safe)', 'C (leaner)', 'Go'],
    cautions: [
      L('manual memory management — leak / crash လွယ်', 'Manual memory management — easy to leak / crash'),
      L('learning curve မတ်စောက်', 'Steep learning curve'),
    ],
    libraries: ['STL', 'Boost', 'Qt', 'Arduino core'],
  },

  java: {
    difficulty: 'intermediate',
    whatFor: L(
      '“write once, run anywhere” ဖြစ်သော platform-independent ဘာသာစကား။ Android app, enterprise backend, ကြီးမားသော system များအတွက်။',
      'A platform-independent "write once, run anywhere" language — for Android apps, enterprise backends and large systems.',
    ),
    useCases: [
      L('Android app (native)', 'Native Android apps'),
      L('enterprise backend', 'Enterprise backends'),
      L('large-scale system', 'Large-scale systems'),
    ],
    code: {
      lang: 'Java',
      code: `public class Main {\n  public static void main(String[] args) {\n    for (int i = 0; i < 3; i++)\n      System.out.println("Hello TU");\n  }\n}`,
    },
    price: 'Free (OpenJDK)',
    alternatives: ['Kotlin (modern)', 'C#', 'Go'],
    cautions: [
      L('verbose — code ရှည်တတ်', 'Verbose — code tends to be long'),
      L('JVM startup / memory များ', 'JVM startup / memory overhead'),
    ],
    libraries: ['Spring', 'Android SDK', 'Maven/Gradle'],
  },

  javascript: {
    difficulty: 'beginner',
    whatFor: L(
      'browser တွင် တိုက်ရိုက် run သော ဘာသာစကား — web ၏ ဘာသာစကား။ Node.js ဖြင့် backend, mobile, desktop အထိ full-stack သုံးနိုင်။',
      'The language of the web, running directly in the browser — and with Node.js it goes full-stack: backend, mobile, desktop.',
    ),
    useCases: [
      L('web frontend interactivity', 'Web frontend interactivity'),
      L('full-stack (Node.js)', 'Full-stack (Node.js)'),
      L('IoT dashboard', 'IoT dashboards'),
    ],
    code: {
      lang: 'JavaScript',
      code: `const greet = (name) => \`Hello, \${name}!\`;\nfor (let i = 0; i < 3; i++) {\n  console.log(greet("TU"));\n}`,
    },
    price: 'Free / open-source',
    alternatives: ['TypeScript (typed)', 'Python', 'Dart'],
    cautions: [
      L('type မရှိ — bug ဖြစ်လွယ် (TypeScript စဉ်းစား)', 'Untyped — bug-prone (consider TypeScript)'),
      L('async / callback ရှုပ်ထွေးနိုင်', 'Async / callbacks can get confusing'),
    ],
    libraries: ['React/Vue', 'Node.js', 'Express'],
  },

  typescript: {
    difficulty: 'intermediate',
    whatFor: L(
      'JavaScript ပေါ်တွင် type system ထည့်ထားသော ဘာသာစကား။ ကြီးမားသော project များတွင် bug ကို ကြိုတင်ဖမ်း၍ maintainability မြင့်စေသည်။',
      'JavaScript with a type system added — it catches bugs early and improves maintainability in large projects.',
    ),
    useCases: [
      L('large web app', 'Large web apps'),
      L('team / enterprise codebase', 'Team / enterprise codebases'),
      L('Node.js backend', 'Node.js backends'),
    ],
    code: {
      lang: 'TypeScript',
      code: `function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}\nconsole.log(greet("TU"));`,
    },
    price: 'Free / open-source',
    alternatives: ['JavaScript', 'Flow', 'ReScript'],
    cautions: [
      L('compile step လို (tsc/bundler)', 'Needs a compile step (tsc/bundler)'),
      L('type config ရှုပ်ထွေးနိုင် (tsconfig)', 'Type config can get complex (tsconfig)'),
    ],
    libraries: ['React', 'Next.js', 'Node types (@types)'],
  },

  csharp: {
    difficulty: 'intermediate',
    whatFor: L(
      'Microsoft ၏ .NET platform အတွက် ဘာသာစကား။ Windows app, web (ASP.NET), နှင့် Unity game engine အတွက် အဓိက။',
      'Microsoft\u2019s language for the .NET platform — central to Windows apps, web (ASP.NET) and the Unity game engine.',
    ),
    useCases: [
      L('Unity game', 'Unity games'),
      L('Windows / desktop app', 'Windows / desktop apps'),
      L('ASP.NET web backend', 'ASP.NET web backends'),
    ],
    code: {
      lang: 'C#',
      code: `using System;\nclass Program {\n  static void Main() {\n    for (int i = 0; i < 3; i++)\n      Console.WriteLine("Hello TU");\n  }\n}`,
    },
    price: 'Free (.NET open-source)',
    alternatives: ['Java', 'F#', 'C++ (Unreal)'],
    cautions: [
      L('Windows ecosystem တွင် အကောင်းဆုံး (cross ရသော်လည်း)', 'Best in the Windows ecosystem (though cross-platform now)'),
      L('Unity version compatibility သတိ', 'Mind Unity version compatibility'),
    ],
    libraries: ['.NET', 'ASP.NET Core', 'Unity engine'],
  },

  php: {
    difficulty: 'beginner',
    whatFor: L(
      'server-side web scripting အတွက် ဒီဇိုင်းဆွဲထားသော ဘာသာစကား။ website အများစု (WordPress) ၏ နောက်ကွယ်။ hosting ရလွယ်၊ deploy လွယ်။',
      'A language designed for server-side web scripting — behind most websites (WordPress). Easy to host and deploy.',
    ),
    useCases: [
      L('dynamic website / CMS', 'Dynamic websites / CMS'),
      L('web backend + MySQL', 'Web backends + MySQL'),
      L('REST API', 'REST APIs'),
    ],
    code: {
      lang: 'PHP',
      code: `<?php\nfunction greet($name) {\n  return "Hello, $name!";\n}\necho greet("TU");\n?>`,
    },
    price: 'Free / open-source',
    alternatives: ['Node.js', 'Python (Django)', 'Ruby'],
    cautions: [
      L('ဟောင်းသော code style တွေ insecure ဖြစ်လွယ်', 'Legacy code styles can be insecure'),
      L('framework (Laravel) သုံးမှ ရှင်းရှင်းလင်းလင်း', 'Use a framework (Laravel) for cleaner structure'),
    ],
    libraries: ['Laravel', 'Composer', 'WordPress'],
  },

  dart: {
    difficulty: 'intermediate',
    whatFor: L(
      'Flutter framework ၏ နောက်ကွယ် ဘာသာစကား။ mobile, web, desktop app များကို code တစ်ခုတည်းဖြင့် ဆောက်ရန်။',
      'The language behind the Flutter framework — build mobile, web and desktop apps from a single codebase.',
    ),
    useCases: [
      L('Flutter cross-platform app', 'Flutter cross-platform apps'),
      L('mobile UI', 'Mobile UIs'),
      L('web app (Flutter web)', 'Web apps (Flutter web)'),
    ],
    code: {
      lang: 'Dart',
      code: `String greet(String name) => 'Hello, \$name!';\n\nvoid main() {\n  for (var i = 0; i < 3; i++) print(greet('TU'));\n}`,
    },
    price: 'Free / open-source',
    alternatives: ['JavaScript (React Native)', 'Kotlin', 'Swift'],
    cautions: [
      L('Flutter အပြင် သုံးရာ ecosystem သေး', 'Small ecosystem outside Flutter'),
      L('null-safety syntax ကို ကျင့်သားရ', 'Get used to the null-safety syntax'),
    ],
    libraries: ['Flutter', 'pub.dev packages'],
  },

  kotlin: {
    difficulty: 'intermediate',
    whatFor: L(
      'Java နဲ့ တွဲသုံးနိုင်ပြီး ပိုတိုတောင်း၊ ပိုလုံခြုံသော modern ဘာသာစကား။ ယနေ့ခေတ် Android development ၏ တရားဝင် ဘာသာစကား။',
      'A modern, more concise and safer language that interoperates with Java — the official language of modern Android development.',
    ),
    useCases: [
      L('modern Android app', 'Modern Android apps'),
      L('Java project ခေတ်မီအောင်', 'Modernising Java projects'),
      L('backend (Ktor)', 'Backends (Ktor)'),
    ],
    code: {
      lang: 'Kotlin',
      code: `fun greet(name: String) = "Hello, \$name!"\n\nfun main() {\n  repeat(3) { println(greet("TU")) }\n}`,
    },
    price: 'Free / open-source',
    alternatives: ['Java', 'Flutter/Dart', 'Swift (iOS)'],
    cautions: [
      L('compile က Java ထက် နည်းနည်း နှေး', 'Compiles a little slower than Java'),
      L('Java interop အနုစိတ် သိထားသင့်', 'Know the Java interop nuances'),
    ],
    libraries: ['Android Jetpack', 'Ktor', 'Coroutines'],
  },

  matlab: {
    difficulty: 'intermediate',
    whatFor: L(
      'engineering နဲ့ သိပ္ပံဆိုင်ရာ numerical computing, matrix, signal/image processing အတွက် အထူးပြု platform။ တက္ကသိုလ်များတွင် အသုံးများ။',
      'A platform specialised for engineering/scientific numerical computing, matrices and signal/image processing — widely used in universities.',
    ),
    useCases: [
      L('signal / image processing', 'Signal / image processing'),
      L('control system design', 'Control-system design'),
      L('numerical simulation', 'Numerical simulation'),
    ],
    code: {
      lang: 'MATLAB',
      code: `x = 0:0.1:2*pi;\ny = sin(x);\nplot(x, y);\ntitle('Sine wave');`,
    },
    price: 'Paid (student license available)',
    alternatives: ['Python (NumPy/SciPy)', 'GNU Octave (free)', 'Julia'],
    cautions: [
      L('license ဈေးကြီး — Octave/Python က အခမဲ့ အစားထိုး', 'Expensive license — Octave/Python are free alternatives'),
      L('production deploy မသင့် — prototyping အတွက်', 'Not ideal for production deploy — best for prototyping'),
    ],
    libraries: ['Simulink', 'Signal Processing Toolbox', 'Image Toolbox'],
  },

  // ─── AI / ML ──────────────────────────────────────────────────────────────
  tensorflow: {
    difficulty: 'advanced',
    whatFor: L(
      'Google ၏ deep-learning framework။ neural network များ တည်ဆောက်၊ train, deploy လုပ်ရန်။ production scale အထိ ကောင်း။',
      'Google\u2019s deep-learning framework for building, training and deploying neural networks — scales to production.',
    ),
    useCases: [
      L('image classification / detection', 'Image classification / detection'),
      L('NLP model', 'NLP models'),
      L('production ML pipeline', 'Production ML pipelines'),
    ],
    code: {
      lang: 'Python',
      code: `import tensorflow as tf\nmodel = tf.keras.Sequential([\n  tf.keras.layers.Dense(10, activation='relu'),\n  tf.keras.layers.Dense(1)\n])\nmodel.compile(optimizer='adam', loss='mse')`,
    },
    price: 'Free / open-source',
    alternatives: ['PyTorch', 'JAX', 'Keras (high-level)'],
    cautions: [
      L('learning curve မတ်စောက် — Keras API ကနေ စ', 'Steep learning curve — start with the Keras API'),
      L('version 1 vs 2 API ကွဲ — tutorial သတိ', 'v1 vs v2 APIs differ — mind tutorial versions'),
    ],
    libraries: ['Keras', 'TF Lite', 'TensorBoard'],
  },

  pytorch: {
    difficulty: 'advanced',
    whatFor: L(
      'သုတေသနအတွက် ရေပန်းစားသော deep-learning framework။ Pythonic ဖြစ်၍ debug လွယ်၊ dynamic graph ကြောင့် ပြောင်းလွယ်ပြင်လွယ်။',
      'A research-favourite deep-learning framework — Pythonic and easy to debug, with dynamic graphs that are flexible to change.',
    ),
    useCases: [
      L('research / prototyping', 'Research / prototyping'),
      L('computer vision / NLP', 'Computer vision / NLP'),
      L('LLM fine-tuning', 'LLM fine-tuning'),
    ],
    code: {
      lang: 'Python',
      code: `import torch\nimport torch.nn as nn\nmodel = nn.Sequential(\n  nn.Linear(10, 20), nn.ReLU(), nn.Linear(20, 1)\n)\nprint(model(torch.randn(1, 10)))`,
    },
    price: 'Free / open-source',
    alternatives: ['TensorFlow', 'JAX', 'Keras'],
    cautions: [
      L('production deploy က TF ထက် extra tooling လို', 'Production deploy needs extra tooling vs TF'),
      L('GPU (CUDA) version compatibility သတိ', 'Mind GPU (CUDA) version compatibility'),
    ],
    libraries: ['torchvision', 'Hugging Face', 'Lightning'],
  },

  keras: {
    difficulty: 'intermediate',
    whatFor: L(
      'neural network များကို လိုင်းအနည်းငယ်ဖြင့် တည်ဆောက်နိုင်စေသော high-level API။ deep learning စတင်လေ့လာသူများအတွက် အကောင်းဆုံး ဝင်ပေါက်။',
      'A high-level API for building neural networks in just a few lines — the best entry point for learning deep learning.',
    ),
    useCases: [
      L('deep learning စတင်လေ့လာ', 'Learning deep learning'),
      L(' လျင်မြန်သော prototyping', 'Rapid prototyping'),
      L('image / text model', 'Image / text models'),
    ],
    code: {
      lang: 'Python',
      code: `from keras.models import Sequential\nfrom keras.layers import Dense\nm = Sequential([Dense(16, activation='relu'), Dense(1, activation='sigmoid')])\nm.compile(optimizer='adam', loss='binary_crossentropy')`,
    },
    price: 'Free / open-source',
    alternatives: ['PyTorch', 'fastai', 'raw TensorFlow'],
    cautions: [
      L('အနုစိတ် ထိန်းချုပ်မှု လိုရင် TF/PyTorch ကို ဆင်း', 'For fine control, drop to TF/PyTorch'),
      L('backend (TF) version နဲ့ ချိတ်', 'Tied to the backend (TF) version'),
    ],
    libraries: ['TensorFlow', 'KerasTuner'],
  },

  scikit: {
    difficulty: 'intermediate',
    whatFor: L(
      'deep learning မဟုတ်သော classic machine learning (regression, classification, clustering) အတွက် library။ dataset သေးလတ်များအတွက် အကောင်းဆုံး။',
      'A library for classic (non-deep) machine learning — regression, classification, clustering. Best for small/medium datasets.',
    ),
    useCases: [
      L('prediction / classification', 'Prediction / classification'),
      L('clustering / analysis', 'Clustering / analysis'),
      L('ML သင်ကြားရေး', 'Teaching ML'),
    ],
    code: {
      lang: 'Python',
      code: `from sklearn.linear_model import LinearRegression\nX = [[1],[2],[3]]; y = [2,4,6]\nm = LinearRegression().fit(X, y)\nprint(m.predict([[4]]))  # ~8`,
    },
    price: 'Free / open-source',
    alternatives: ['XGBoost', 'TensorFlow (deep)', 'statsmodels'],
    cautions: [
      L('deep learning / GPU အတွက် မသင့်', 'Not for deep learning / GPU work'),
      L('feature scaling မမေ့ရ', 'Don\u2019t forget feature scaling'),
    ],
    libraries: ['NumPy', 'Pandas', 'Matplotlib'],
  },

  opencv: {
    difficulty: 'intermediate',
    whatFor: L(
      'ရုပ်ပုံ / video processing နဲ့ computer vision အတွက် အခြေခံ library။ face detection, object tracking, image filter များ။',
      'The foundational library for image/video processing and computer vision — face detection, object tracking, image filters.',
    ),
    useCases: [
      L('face / object detection', 'Face / object detection'),
      L('image processing / filter', 'Image processing / filters'),
      L('camera-based project', 'Camera-based projects'),
    ],
    code: {
      lang: 'Python',
      code: `import cv2\nimg = cv2.imread('photo.jpg')\ngray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\ncv2.imwrite('gray.jpg', gray)`,
    },
    price: 'Free / open-source',
    alternatives: ['Pillow (basic)', 'scikit-image', 'MediaPipe'],
    cautions: [
      L('color order က BGR (RGB မဟုတ်)', 'Colour order is BGR (not RGB)'),
      L('deep-learning detection က YOLO/DNN နဲ့ တွဲ', 'Deep-learning detection pairs with YOLO/DNN'),
    ],
    libraries: ['NumPy', 'YOLO', 'dlib'],
  },

  yolo: {
    difficulty: 'advanced',
    whatFor: L(
      'ရုပ်ပုံ / video ထဲက object များကို real-time (မြန်ဆန်စွာ) ရှာဖွေ၍ box ဆွဲပေးသော detection model။',
      'A detection model that finds objects in images/video in real time and draws bounding boxes.',
    ),
    useCases: [
      L('real-time object detection', 'Real-time object detection'),
      L('security / traffic monitoring', 'Security / traffic monitoring'),
      L('robot / drone vision', 'Robot / drone vision'),
    ],
    code: {
      lang: 'Python',
      code: `from ultralytics import YOLO\nmodel = YOLO('yolov8n.pt')\nresults = model('image.jpg')\nresults[0].show()`,
    },
    price: 'Free / open-source (check license)',
    alternatives: ['SSD', 'Faster R-CNN', 'MediaPipe'],
    cautions: [
      L('real-time အတွက် GPU လို', 'Real-time needs a GPU'),
      L('custom detection အတွက် dataset label လုပ်ရ', 'Custom detection requires labelling a dataset'),
    ],
    libraries: ['Ultralytics', 'PyTorch', 'OpenCV'],
  },

  mediapipe: {
    difficulty: 'intermediate',
    whatFor: L(
      'Google ၏ on-device ML pipeline library။ hand / face / pose tracking များကို ဖုန်း/PC ပေါ် real-time run နိုင်။',
      'Google\u2019s on-device ML pipeline library — run hand / face / pose tracking in real time on a phone/PC.',
    ),
    useCases: [
      L('hand / gesture tracking', 'Hand / gesture tracking'),
      L('face mesh / pose', 'Face mesh / pose'),
      L('sign-language / fitness app', 'Sign-language / fitness apps'),
    ],
    code: {
      lang: 'Python',
      code: `import mediapipe as mp\nhands = mp.solutions.hands.Hands()\n# feed BGR->RGB frames from OpenCV to hands.process(frame)`,
    },
    price: 'Free / open-source',
    alternatives: ['OpenPose', 'YOLO-pose', 'dlib'],
    cautions: [
      L('OpenCV BGR→RGB ပြောင်းပေးရ', 'Convert OpenCV BGR→RGB before feeding'),
      L('model complexity က speed ကို လွှမ်း', 'Model complexity trades off speed'),
    ],
    libraries: ['OpenCV', 'TensorFlow Lite'],
  },

  tflite: {
    difficulty: 'advanced',
    whatFor: L(
      'trained model ကို microcontroller / mobile ပေါ် run နိုင်အောင် သေးငယ်၍ optimize လုပ်ပေးသော TensorFlow ဗားရှင်း (edge AI)။',
      'A trimmed, optimised TensorFlow that runs trained models on microcontrollers / mobile — edge AI.',
    ),
    useCases: [
      L('mobile app ML', 'Mobile-app ML'),
      L('microcontroller ML (TinyML)', 'Microcontroller ML (TinyML)'),
      L('offline / edge inference', 'Offline / edge inference'),
    ],
    code: {
      lang: 'Python',
      code: `import tensorflow as tf\nconv = tf.lite.TFLiteConverter.from_keras_model(model)\nopen('model.tflite','wb').write(conv.convert())`,
    },
    price: 'Free / open-source',
    alternatives: ['ONNX Runtime', 'Edge Impulse', 'CoreML (iOS)'],
    cautions: [
      L('quantization က accuracy အနည်းငယ် ကျစေနိုင်', 'Quantisation can slightly reduce accuracy'),
      L('MCU memory ကန့်သတ်ချက် သတိ', 'Mind the MCU memory constraints'),
    ],
    libraries: ['TensorFlow', 'Edge Impulse'],
  },

  huggingface: {
    difficulty: 'advanced',
    whatFor: L(
      'pre-trained transformer / LLM model ထောင်ပေါင်းများစွာကို လွယ်ကူစွာ download၍ သုံးနိုင်စေသော library + hub။ NLP အတွက် အဓိက။',
      'A library + hub giving easy access to thousands of pre-trained transformer / LLM models — central to modern NLP.',
    ),
    useCases: [
      L('text classification / sentiment', 'Text classification / sentiment'),
      L('chatbot / translation', 'Chatbots / translation'),
      L('LLM fine-tuning', 'LLM fine-tuning'),
    ],
    code: {
      lang: 'Python',
      code: `from transformers import pipeline\nnlp = pipeline("sentiment-analysis")\nprint(nlp("I love this project!"))`,
    },
    price: 'Free / open-source (some models gated)',
    alternatives: ['spaCy', 'OpenAI API', 'Ollama (local)'],
    cautions: [
      L('model ကြီးများ RAM/GPU များ လို', 'Big models need a lot of RAM/GPU'),
      L('model license / gating သတိ', 'Mind model licenses / gating'),
    ],
    libraries: ['PyTorch/TensorFlow', 'datasets', 'tokenizers'],
  },

  pandas: {
    difficulty: 'beginner',
    whatFor: L(
      'table (spreadsheet) ပုံစံ data ကို load, clean, analyze လုပ်ရန် library (NumPy က array/matrix အတွက်)။ data science ၏ အခြေခံ။',
      'Libraries to load, clean and analyse table (spreadsheet) data — with NumPy for arrays/matrices. The basis of data science.',
    ),
    useCases: [
      L('CSV / Excel data analysis', 'CSV / Excel data analysis'),
      L('data cleaning / prep', 'Data cleaning / prep'),
      L('numerical computation', 'Numerical computation'),
    ],
    code: {
      lang: 'Python',
      code: `import pandas as pd\ndf = pd.read_csv('data.csv')\nprint(df.describe())\nprint(df.groupby('year').mean())`,
    },
    price: 'Free / open-source',
    alternatives: ['Polars (fast)', 'R data.frame', 'SQL'],
    cautions: [
      L('dataset အလွန်ကြီးရင် memory ကုန် — Polars/Dask စဉ်းစား', 'Very large datasets exhaust memory — consider Polars/Dask'),
      L('SettingWithCopy warning ကို နားလည်ထား', 'Understand the SettingWithCopy warning'),
    ],
    libraries: ['NumPy', 'Matplotlib', 'scikit-learn'],
  },

  // ─── Data & Backend ───────────────────────────────────────────────────────
  mysql: {
    difficulty: 'beginner',
    whatFor: L(
      'ရေပန်းစားဆုံး relational (SQL) database။ structured data ကို table များဖြင့် သိမ်း၍ web app အများစုနှင့် တွဲသုံးသည်။',
      'The most popular relational (SQL) database — stores structured data in tables and pairs with most web apps.',
    ),
    useCases: [
      L('web app database', 'Web-app databases'),
      L('user / order / inventory', 'User / order / inventory data'),
      L('CMS backend', 'CMS backends'),
    ],
    code: {
      lang: 'SQL',
      code: `CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50));\nINSERT INTO students VALUES (1, 'Aung');\nSELECT * FROM students WHERE id = 1;`,
    },
    price: 'Free (Community) / paid (Enterprise)',
    alternatives: ['PostgreSQL', 'MariaDB', 'SQLite'],
    cautions: [
      L('advanced feature က PostgreSQL ထက် နည်း', 'Fewer advanced features than PostgreSQL'),
      L('SQL injection ကာကွယ်ရန် prepared statement သုံး', 'Use prepared statements to prevent SQL injection'),
    ],
    libraries: ['mysql-connector', 'Sequelize/Prisma', 'phpMyAdmin'],
  },

  postgres: {
    difficulty: 'intermediate',
    whatFor: L(
      'အဆင့်မြင့် feature (JSON, full-text search, GIS) ပါဝင်သော open-source SQL database။ ခိုင်မာမှုနှင့် standard compliance မြင့်။',
      'An advanced open-source SQL database with features like JSON, full-text search and GIS — highly robust and standards-compliant.',
    ),
    useCases: [
      L('complex / large web app', 'Complex / large web apps'),
      L('geospatial (PostGIS)', 'Geospatial (PostGIS)'),
      L('analytics / JSON data', 'Analytics / JSON data'),
    ],
    code: {
      lang: 'SQL',
      code: `CREATE TABLE logs (id SERIAL PRIMARY KEY, data JSONB);\nINSERT INTO logs (data) VALUES ('{"temp": 25}');\nSELECT data->>'temp' FROM logs;`,
    },
    price: 'Free / open-source',
    alternatives: ['MySQL', 'SQLite', 'CockroachDB'],
    cautions: [
      L('MySQL ထက် setup / tuning နည်းနည်း ရှုပ်', 'Setup / tuning is a bit more involved than MySQL'),
      L('connection pooling စဉ်းစား (many clients)', 'Consider connection pooling with many clients'),
    ],
    libraries: ['psycopg2', 'Prisma', 'PostGIS'],
  },

  sqlite: {
    difficulty: 'beginner',
    whatFor: L(
      'server မလိုဘဲ ဖိုင်တစ်ဖိုင်တည်းအဖြစ် သိမ်းသော embedded SQL database။ mobile app, IoT, prototype အတွက် အလွန်လွယ်ကူ။',
      'An embedded SQL database stored as a single file with no server — very easy for mobile apps, IoT and prototypes.',
    ),
    useCases: [
      L('mobile app local storage', 'Mobile-app local storage'),
      L('IoT / edge logging', 'IoT / edge logging'),
      L('prototype / small app', 'Prototypes / small apps'),
    ],
    code: {
      lang: 'Python',
      code: `import sqlite3\ncon = sqlite3.connect('app.db')\ncon.execute('CREATE TABLE IF NOT EXISTS t(x)')\ncon.execute('INSERT INTO t VALUES (1)')\ncon.commit()`,
    },
    price: 'Free / public domain',
    alternatives: ['MySQL/Postgres (server)', 'Realm', 'DuckDB'],
    cautions: [
      L('high-concurrency write မသင့် (single writer)', 'Not for high-concurrency writes (single writer)'),
      L('production scale ရောက်ရင် server DB ပြောင်း', 'Move to a server DB at production scale'),
    ],
    libraries: ['sqlite3 (built-in)', 'Room (Android)'],
  },

  mongodb: {
    difficulty: 'intermediate',
    whatFor: L(
      'table မဟုတ်ဘဲ JSON-like document များဖြင့် သိမ်းသော NoSQL database။ schema ပြောင်းလွယ်၍ လျင်မြန်သော development အတွက်။',
      'A NoSQL database storing JSON-like documents instead of tables — flexible schema for fast development.',
    ),
    useCases: [
      L('flexible / evolving schema', 'Flexible / evolving schemas'),
      L('real-time / content app', 'Real-time / content apps'),
      L('IoT data / logs', 'IoT data / logs'),
    ],
    code: {
      lang: 'JavaScript',
      code: `db.students.insertOne({ name: "Aung", year: 5 });\ndb.students.find({ year: 5 });`,
    },
    price: 'Free (Community) / Atlas cloud tiers',
    alternatives: ['PostgreSQL (JSONB)', 'Firebase', 'CouchDB'],
    cautions: [
      L('relation / join များ project မသင့်', 'Not ideal for heavily relational / join-heavy data'),
      L('schema-less — data validation ကို app မှာ လုပ်ရ', 'Schema-less — enforce data validation in the app'),
    ],
    libraries: ['Mongoose', 'PyMongo', 'MongoDB Atlas'],
  },

  firebase: {
    difficulty: 'beginner',
    whatFor: L(
      'Google ၏ backend-as-a-service — realtime database, authentication, hosting, storage အားလုံး server မဆောက်ဘဲ ရသည်။',
      'Google\u2019s backend-as-a-service — realtime database, authentication, hosting and storage without building a server.',
    ),
    useCases: [
      L('mobile / web app backend', 'Mobile / web app backends'),
      L('realtime chat / sync', 'Realtime chat / sync'),
      L('quick MVP / prototype', 'Quick MVPs / prototypes'),
    ],
    code: {
      lang: 'JavaScript',
      code: `import { getDatabase, ref, set } from "firebase/database";\nconst db = getDatabase();\nset(ref(db, 'sensor/temp'), 25);`,
    },
    price: 'Free (Spark) / pay-as-you-go (Blaze)',
    alternatives: ['Supabase (open)', 'AWS Amplify', 'Appwrite'],
    cautions: [
      L('vendor lock-in — migrate ခက်', 'Vendor lock-in — hard to migrate'),
      L('security rules မ set ရင် data ပေါက်', 'Unset security rules leak data'),
    ],
    libraries: ['Firebase SDK', 'FlutterFire'],
  },

  redis: {
    difficulty: 'intermediate',
    whatFor: L(
      'memory ထဲတွင် သိမ်းသဖြင့် အလွန်မြန်သော key-value store။ cache, session, real-time queue, leaderboard အတွက်။',
      'A blazing-fast in-memory key-value store — for caching, sessions, real-time queues and leaderboards.',
    ),
    useCases: [
      L('cache layer (speed up DB)', 'Cache layer (speed up a DB)'),
      L('session / token store', 'Session / token store'),
      L('real-time queue / pub-sub', 'Real-time queues / pub-sub'),
    ],
    code: {
      lang: 'Python',
      code: `import redis\nr = redis.Redis()\nr.set('temp', 25)\nprint(r.get('temp'))`,
    },
    price: 'Free / open-source',
    alternatives: ['Memcached', 'KeyDB', 'Valkey'],
    cautions: [
      L('memory-based — persistence config သတိ', 'Memory-based — mind the persistence config'),
      L('main database အဖြစ် မသုံးသင့်', 'Not meant to be your main database'),
    ],
    libraries: ['redis-py', 'ioredis', 'Bull (queue)'],
  },

  nodejs: {
    difficulty: 'intermediate',
    whatFor: L(
      'JavaScript ကို server ပေါ်တွင် run စေသော runtime။ web backend, API, real-time app များ ဆောက်ရန်။ frontend/backend ဘာသာစကား တစ်ခုတည်း။',
      'A runtime that runs JavaScript on the server — for web backends, APIs and real-time apps. One language across front and back.',
    ),
    useCases: [
      L('web API / backend', 'Web APIs / backends'),
      L('real-time app (chat)', 'Real-time apps (chat)'),
      L('CLI / automation tool', 'CLI / automation tools'),
    ],
    code: {
      lang: 'JavaScript',
      code: `const http = require('http');\nhttp.createServer((req, res) => {\n  res.end('Hello TU');\n}).listen(3000);`,
    },
    price: 'Free / open-source',
    alternatives: ['Deno', 'Bun', 'Python (FastAPI)'],
    cautions: [
      L('CPU-heavy task မသင့် (single-threaded)', 'Not for CPU-heavy tasks (single-threaded)'),
      L('callback / async error handling သတိ', 'Mind callback / async error handling'),
    ],
    libraries: ['Express', 'npm', 'Socket.io'],
  },

  express: {
    difficulty: 'intermediate',
    whatFor: L(
      'Node.js အတွက် အသေးစား၊ ပေါ့ပါးသော web framework။ REST API နဲ့ web server ကို လိုင်းအနည်းငယ်ဖြင့် ဆောက်နိုင်။',
      'A minimal, lightweight web framework for Node.js — build REST APIs and web servers in just a few lines.',
    ),
    useCases: [
      L('REST API', 'REST APIs'),
      L('web server / backend', 'Web servers / backends'),
      L('microservice', 'Microservices'),
    ],
    code: {
      lang: 'JavaScript',
      code: `const express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Hello TU'));\napp.listen(3000);`,
    },
    price: 'Free / open-source',
    alternatives: ['Fastify', 'NestJS', 'Koa'],
    cautions: [
      L('structure ကို ကိုယ်တိုင် စီစဉ်ရ (opinion နည်း)', 'You must structure it yourself (unopinionated)'),
      L('middleware order အရေးကြီး', 'Middleware order matters'),
    ],
    libraries: ['Node.js', 'Mongoose/Prisma', 'Passport'],
  },

  django: {
    difficulty: 'intermediate',
    whatFor: L(
      'Python ၏ “batteries-included” web framework။ admin panel, ORM, auth အားလုံး built-in — ကြီးမားသော web app ကို မြန်မြန်ဆောက်ရန်။',
      'Python\u2019s "batteries-included" web framework with a built-in admin panel, ORM and auth — build large web apps fast.',
    ),
    useCases: [
      L('content / management system', 'Content / management systems'),
      L('data-driven web app', 'Data-driven web apps'),
      L('REST API (DRF)', 'REST APIs (DRF)'),
    ],
    code: {
      lang: 'Python',
      code: `# urls.py\nfrom django.http import HttpResponse\nfrom django.urls import path\ndef home(request): return HttpResponse("Hello TU")\nurlpatterns = [path('', home)]`,
    },
    price: 'Free / open-source',
    alternatives: ['Flask (lighter)', 'FastAPI', 'Ruby on Rails'],
    cautions: [
      L('monolithic — API-only ဆို DRF/FastAPI ပို့ချော', 'Monolithic — for API-only, DRF/FastAPI is leaner'),
      L('ORM migration ကို သတိထား စီမံ', 'Manage ORM migrations carefully'),
    ],
    libraries: ['Django REST Framework', 'Celery', 'PostgreSQL'],
  },

  flask: {
    difficulty: 'beginner',
    whatFor: L(
      'Python ၏ ပေါ့ပါး၊ ရိုးရှင်းသော micro web framework။ လိုအပ်တာ ကိုယ်တိုင် ရွေးထည့်နိုင်၍ API နဲ့ ML model serving အတွက် လွယ်ကူ။',
      'Python\u2019s lightweight micro web framework — you add only what you need, making it easy for APIs and ML-model serving.',
    ),
    useCases: [
      L('ML model API serving', 'ML-model API serving'),
      L('ရိုးရှင်းသော web app / API', 'Simple web apps / APIs'),
      L('prototype backend', 'Prototype backends'),
    ],
    code: {
      lang: 'Python',
      code: `from flask import Flask\napp = Flask(__name__)\n@app.route('/')\ndef home(): return "Hello TU"\napp.run(port=5000)`,
    },
    price: 'Free / open-source',
    alternatives: ['FastAPI (async)', 'Django (full)', 'Bottle'],
    cautions: [
      L('ကြီးမားသော app အတွက် structure ကိုယ်တိုင် စီစဉ်ရ', 'For big apps you must design the structure yourself'),
      L('production မှာ gunicorn/uwsgi နဲ့ run', 'Run behind gunicorn/uwsgi in production'),
    ],
    libraries: ['Jinja2', 'SQLAlchemy', 'gunicorn'],
  },

  laravel: {
    difficulty: 'intermediate',
    whatFor: L(
      'PHP ၏ ခေတ်မီ၊ လှပသော web framework။ routing, ORM (Eloquent), auth, template အားလုံး ပါဝင်၍ web app မြန်မြန် ဆောက်ရန်။',
      'PHP\u2019s modern, elegant web framework with routing, an ORM (Eloquent), auth and templating built in — for building web apps fast.',
    ),
    useCases: [
      L('PHP web application', 'PHP web applications'),
      L('e-commerce / CMS', 'E-commerce / CMS'),
      L('REST API', 'REST APIs'),
    ],
    code: {
      lang: 'PHP',
      code: `// routes/web.php\nRoute::get('/', function () {\n    return 'Hello TU';\n});`,
    },
    price: 'Free / open-source',
    alternatives: ['Symfony', 'CodeIgniter', 'Node.js (Express)'],
    cautions: [
      L('learning curve ရှိ (Artisan, Eloquent)', 'Has a learning curve (Artisan, Eloquent)'),
      L('shared hosting မှာ performance tuning လို', 'Needs performance tuning on shared hosting'),
    ],
    libraries: ['Composer', 'Eloquent ORM', 'Blade'],
  },

  spring: {
    difficulty: 'advanced',
    whatFor: L(
      'Java ၏ enterprise-grade backend framework။ ကြီးမား၊ ခိုင်မာသော production system များ (banking, e-commerce) အတွက် standard။',
      'Java\u2019s enterprise-grade backend framework — the standard for large, robust production systems (banking, e-commerce).',
    ),
    useCases: [
      L('enterprise backend', 'Enterprise backends'),
      L('microservice', 'Microservices'),
      L('secure REST API', 'Secure REST APIs'),
    ],
    code: {
      lang: 'Java',
      code: `@RestController\npublic class HelloController {\n  @GetMapping("/")\n  public String home() { return "Hello TU"; }\n}`,
    },
    price: 'Free / open-source',
    alternatives: ['Quarkus', 'Micronaut', 'Node.js/NestJS'],
    cautions: [
      L('configuration ရှုပ်ထွေး — learning curve မတ်', 'Complex configuration — steep learning curve'),
      L('memory / startup များ (native image စဉ်းစား)', 'Heavy memory / startup (consider native image)'),
    ],
    libraries: ['Spring Boot', 'Hibernate', 'Maven/Gradle'],
  },

  mqtt: {
    difficulty: 'intermediate',
    whatFor: L(
      'IoT device များအတွက် ဒီဇိုင်းဆွဲထားသော ပေါ့ပါးသော publish/subscribe messaging protocol။ bandwidth နည်း၊ power နည်းသော ချိတ်ဆက်မှုအတွက်။',
      'A lightweight publish/subscribe messaging protocol designed for IoT — for low-bandwidth, low-power connectivity.',
    ),
    useCases: [
      L('IoT sensor → cloud messaging', 'IoT sensor → cloud messaging'),
      L('smart home device sync', 'Smart-home device sync'),
      L('telemetry / command', 'Telemetry / commands'),
    ],
    code: {
      lang: 'Python',
      code: `import paho.mqtt.client as mqtt\nc = mqtt.Client()\nc.connect("broker.hivemq.com", 1883)\nc.publish("tu/sensor/temp", "25")`,
    },
    price: 'Free (protocol) / broker tiers',
    alternatives: ['HTTP REST', 'CoAP', 'AMQP', 'WebSocket'],
    cautions: [
      L('broker (Mosquitto) တစ်ခု လို', 'You need a broker (e.g. Mosquitto)'),
      L('QoS level နဲ့ retained message နားလည်ထား', 'Understand QoS levels and retained messages'),
    ],
    libraries: ['Paho MQTT', 'Mosquitto', 'PubSubClient (Arduino)'],
  },

  // ─── Web & Mobile ─────────────────────────────────────────────────────────
  react: {
    difficulty: 'intermediate',
    whatFor: L(
      'UI ကို component အသေးများ ပေါင်း၍ တည်ဆောက်စေသော ရေပန်းစားဆုံး JavaScript library။ interactive web app များအတွက်။',
      'The most popular JavaScript library for building UIs by composing small components — for interactive web apps.',
    ),
    useCases: [
      L('single-page web app', 'Single-page web apps'),
      L('dashboard / admin panel', 'Dashboards / admin panels'),
      L('reusable UI component', 'Reusable UI components'),
    ],
    code: {
      lang: 'JSX',
      code: `function Hello({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\nexport default () => <Hello name="TU" />;`,
    },
    price: 'Free / open-source',
    alternatives: ['Vue.js', 'Angular', 'Svelte'],
    cautions: [
      L('library သာ — routing/state ကို ကိုယ်တိုင် ရွေးထည့်ရ', 'Just a library — you add routing/state yourself'),
      L('hooks dependency rules ကို နားလည်ထား', 'Understand the hooks dependency rules'),
    ],
    libraries: ['Next.js', 'React Router', 'Redux/Zustand'],
  },

  nextjs: {
    difficulty: 'advanced',
    whatFor: L(
      'React ပေါ်တွင် server-side rendering, routing, API route များ ပေါင်းထည့်ထားသော full-stack framework။ production web app အတွက်။',
      'A full-stack framework on top of React adding server-side rendering, routing and API routes — for production web apps.',
    ),
    useCases: [
      L('SEO-friendly web app', 'SEO-friendly web apps'),
      L('full-stack (frontend + API)', 'Full-stack (frontend + API)'),
      L('e-commerce / blog', 'E-commerce / blogs'),
    ],
    code: {
      lang: 'JSX',
      code: `// app/page.tsx\nexport default function Home() {\n  return <h1>Hello TU</h1>;\n}`,
    },
    price: 'Free / open-source (Vercel hosting tiers)',
    alternatives: ['Remix', 'Nuxt (Vue)', 'SvelteKit'],
    cautions: [
      L('server vs client component ကွဲ — နားလည်ထား', 'Server vs client components differ — understand them'),
      L('App Router / Pages Router ရောမသုံးရ', 'Don\u2019t mix App Router and Pages Router'),
    ],
    libraries: ['React', 'Vercel', 'Tailwind CSS'],
  },

  vue: {
    difficulty: 'beginner',
    whatFor: L(
      'သင်ယူရလွယ်ကူပြီး ပေါ့ပါးသော progressive UI framework။ template syntax ရှင်းလင်း၍ စတင်လေ့လာသူများအတွက် သင့်တော်။',
      'An easy-to-learn, lightweight progressive UI framework with clear template syntax — great for beginners.',
    ),
    useCases: [
      L('interactive web UI', 'Interactive web UIs'),
      L('ရှိပြီးသား page ကို ဖြည်းဖြည်း upgrade', 'Incrementally upgrading existing pages'),
      L('SPA / dashboard', 'SPAs / dashboards'),
    ],
    code: {
      lang: 'Vue',
      code: `<template>\n  <h1>Hello, {{ name }}!</h1>\n</template>\n<script setup>\nconst name = 'TU';\n</script>`,
    },
    price: 'Free / open-source',
    alternatives: ['React', 'Svelte', 'Angular'],
    cautions: [
      L('React ထက် job market သေးနိုင် (ဒေသအလိုက်)', 'Smaller job market than React (region-dependent)'),
      L('Options vs Composition API ရွေး', 'Choose Options vs Composition API'),
    ],
    libraries: ['Nuxt', 'Vue Router', 'Pinia'],
  },

  angular: {
    difficulty: 'advanced',
    whatFor: L(
      'Google ၏ full-featured web framework။ routing, forms, HTTP, testing အားလုံး built-in — ကြီးမားသော enterprise app များအတွက်။',
      'Google\u2019s full-featured web framework with routing, forms, HTTP and testing built in — for large enterprise apps.',
    ),
    useCases: [
      L('enterprise web app', 'Enterprise web apps'),
      L('large team project', 'Large team projects'),
      L('complex form / dashboard', 'Complex forms / dashboards'),
    ],
    code: {
      lang: 'TypeScript',
      code: `@Component({\n  selector: 'app-root',\n  template: '<h1>Hello {{name}}</h1>'\n})\nexport class AppComponent { name = 'TU'; }`,
    },
    price: 'Free / open-source',
    alternatives: ['React', 'Vue', 'Svelte'],
    cautions: [
      L('learning curve မတ်စောက်ဆုံး (TS, RxJS, DI)', 'Steepest learning curve (TS, RxJS, DI)'),
      L('အသေးစား project အတွက် overkill', 'Overkill for small projects'),
    ],
    libraries: ['TypeScript', 'RxJS', 'Angular Material'],
  },

  tailwind: {
    difficulty: 'beginner',
    whatFor: L(
      'HTML ထဲတွင် တိုက်ရိုက် class များဖြင့် style ချရသော utility-first CSS framework။ ဒီဇိုင်း မြန်မြန်ဆောက်နိုင်။',
      'A utility-first CSS framework where you style directly with classes in your HTML — build designs fast.',
    ),
    useCases: [
      L('မြန်ဆန်သော UI styling', 'Fast UI styling'),
      L('responsive design', 'Responsive design'),
      L('React/Vue/Next component style', 'React/Vue/Next component styling'),
    ],
    code: {
      lang: 'HTML',
      code: `<button class="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">\n  Click me\n</button>`,
    },
    price: 'Free / open-source',
    alternatives: ['Bootstrap', 'plain CSS', 'CSS Modules'],
    cautions: [
      L('HTML class ရှည်တတ် — component ခွဲ', 'HTML classes get long — extract components'),
      L('build step (PostCSS) လို', 'Needs a build step (PostCSS)'),
    ],
    libraries: ['PostCSS', 'Headless UI', 'daisyUI'],
  },

  flutter: {
    difficulty: 'intermediate',
    whatFor: L(
      'code တစ်ခုတည်းဖြင့် Android, iOS, web, desktop app များ ဆောက်နိုင်သော Google framework (Dart သုံး)။ native-like performance။',
      'A Google framework (using Dart) to build Android, iOS, web and desktop apps from one codebase — with near-native performance.',
    ),
    useCases: [
      L('cross-platform mobile app', 'Cross-platform mobile apps'),
      L('MVP / startup app', 'MVP / startup apps'),
      L('beautiful custom UI', 'Beautiful custom UIs'),
    ],
    code: {
      lang: 'Dart',
      code: `import 'package:flutter/material.dart';\nvoid main() => runApp(\n  const MaterialApp(home: Center(child: Text('Hello TU')))\n);`,
    },
    price: 'Free / open-source',
    alternatives: ['React Native', 'native (Kotlin/Swift)', 'Ionic'],
    cautions: [
      L('app size က native ထက် ကြီးတတ်', 'App size tends to be larger than native'),
      L('platform-specific feature က plugin လို', 'Platform-specific features need plugins'),
    ],
    libraries: ['Dart', 'pub.dev packages', 'FlutterFire'],
  },

  'react-native': {
    difficulty: 'intermediate',
    whatFor: L(
      'React knowledge ဖြင့် Android နဲ့ iOS native app ဆောက်နိုင်သော framework။ web dev များ mobile သို့ ကူးရ လွယ်။',
      'A framework to build native Android and iOS apps using React knowledge — an easy jump for web devs into mobile.',
    ),
    useCases: [
      L('cross-platform mobile app', 'Cross-platform mobile apps'),
      L('React team ၏ mobile app', 'Mobile apps from a React team'),
      L('MVP', 'MVPs'),
    ],
    code: {
      lang: 'JSX',
      code: `import { Text, View } from 'react-native';\nexport default () => (\n  <View><Text>Hello TU</Text></View>\n);`,
    },
    price: 'Free / open-source',
    alternatives: ['Flutter', 'native (Kotlin/Swift)', 'Expo'],
    cautions: [
      L('native module bridging က ရှုပ်နိုင်', 'Native-module bridging can get messy'),
      L('Expo vs bare workflow ရွေး', 'Choose Expo vs the bare workflow'),
    ],
    libraries: ['React', 'Expo', 'React Navigation'],
  },

  android: {
    difficulty: 'advanced',
    whatFor: L(
      'Android app များကို native ဆောက်ရန် တရားဝင် SDK (Kotlin/Java + Android Studio)။ hardware feature အပြည့် ရယူနိုင်။',
      'The official SDK for building native Android apps (Kotlin/Java + Android Studio) — full access to hardware features.',
    ),
    useCases: [
      L('native Android app', 'Native Android apps'),
      L('hardware-heavy app (sensor, BLE)', 'Hardware-heavy apps (sensors, BLE)'),
      L('Play Store publish', 'Play Store publishing'),
    ],
    code: {
      lang: 'Kotlin',
      code: `class MainActivity : AppCompatActivity() {\n  override fun onCreate(b: Bundle?) {\n    super.onCreate(b)\n    setContentView(R.layout.activity_main)\n  }\n}`,
    },
    price: 'Free SDK (Play Store: $25 one-time)',
    alternatives: ['Flutter', 'React Native', 'Kotlin Multiplatform'],
    cautions: [
      L('Android version fragmentation ကို test ရ', 'Test against Android version fragmentation'),
      L('Gradle build ရှုပ်ထွေးနိုင်', 'Gradle builds can get complex'),
    ],
    libraries: ['Jetpack Compose', 'Retrofit', 'Room'],
  },

  bootstrap: {
    difficulty: 'beginner',
    whatFor: L(
      'ready-made component (button, navbar, grid) များ ပါဝင်သော responsive CSS framework။ web page မြန်မြန် လှအောင် ဆောက်ရန်။',
      'A responsive CSS framework with ready-made components (buttons, navbars, grid) — to make web pages look good fast.',
    ),
    useCases: [
      L('မြန်ဆန်သော responsive site', 'Fast responsive sites'),
      L('admin / dashboard template', 'Admin / dashboard templates'),
      L('prototype UI', 'Prototype UIs'),
    ],
    code: {
      lang: 'HTML',
      code: `<button class="btn btn-primary">Click me</button>\n<div class="row"><div class="col-6">Half</div></div>`,
    },
    price: 'Free / open-source',
    alternatives: ['Tailwind CSS', 'Bulma', 'Material UI'],
    cautions: [
      L('site အများ ပုံစံတူ ဖြစ်တတ် (customize)', 'Sites can look samey (customise it)'),
      L('Tailwind ထက် flexibility နည်း', 'Less flexible than Tailwind'),
    ],
    libraries: ['jQuery (v4- optional)', 'Popper.js'],
  },

  // ─── Dev Tools & Cloud ────────────────────────────────────────────────────
  git: {
    difficulty: 'beginner',
    whatFor: L(
      'code ၏ ပြောင်းလဲမှုများကို မှတ်တမ်းတင်၍ version control လုပ်ပေးသော tool။ team collaboration နဲ့ backup ၏ အခြေခံ။ project တိုင်း သုံးသင့်။',
      'A tool that records code changes for version control — the basis of team collaboration and backup. Use it on every project.',
    ),
    useCases: [
      L('version history / backup', 'Version history / backup'),
      L('team collaboration', 'Team collaboration'),
      L('experiment branch', 'Experiment branches'),
    ],
    code: {
      lang: 'Bash',
      code: `git init\ngit add .\ngit commit -m "first commit"\ngit push -u origin main`,
    },
    price: 'Free / open-source',
    alternatives: ['Mercurial', 'SVN', 'Fossil'],
    cautions: [
      L('merge conflict ဖြေရှင်းနည်း သင်ထား', 'Learn how to resolve merge conflicts'),
      L('secret / large file ကို commit မလုပ်ရ (.gitignore)', 'Never commit secrets / large files (.gitignore)'),
    ],
    libraries: ['GitHub/GitLab', 'Git LFS'],
  },

  github: {
    difficulty: 'beginner',
    whatFor: L(
      'Git repository များကို online သိမ်း၊ share, collaborate လုပ်ရန် platform။ portfolio, CI/CD, issue tracking ပါ။',
      'A platform to host, share and collaborate on Git repositories online — with portfolio, CI/CD and issue tracking.',
    ),
    useCases: [
      L('code hosting / portfolio', 'Code hosting / portfolio'),
      L('team collaboration / PR', 'Team collaboration / PRs'),
      L('CI/CD (Actions)', 'CI/CD (Actions)'),
    ],
    code: {
      lang: 'Bash',
      code: `git remote add origin https://github.com/user/repo.git\ngit push -u origin main`,
    },
    price: 'Free (public + private) / paid tiers',
    alternatives: ['GitLab', 'Bitbucket', 'Gitea (self-host)'],
    cautions: [
      L('private repo မှာ secret မတင်ရ (public လွဲ)', 'Keep secrets out even of private repos'),
      L('token / SSH key security သတိ', 'Mind token / SSH-key security'),
    ],
    libraries: ['Git', 'GitHub Actions', 'GitHub Pages'],
  },

  vscode: {
    difficulty: 'beginner',
    whatFor: L(
      'ရေပန်းစားဆုံး၊ အခမဲ့ code editor။ extension ထောင်ပေါင်းများစွာ၊ debugger, Git integration ပါဝင်၍ ဘာသာစကားတိုင်း သုံးနိုင်။',
      'The most popular free code editor — thousands of extensions, a debugger and Git integration, for every language.',
    ),
    useCases: [
      L('ဘာသာစကားတိုင်း coding', 'Coding in any language'),
      L('debugging', 'Debugging'),
      L('embedded (PlatformIO)', 'Embedded (PlatformIO)'),
    ],
    code: {
      lang: 'Shortcut',
      code: `Ctrl+Shift+P  -> Command Palette\nCtrl+\`        -> Toggle terminal\nF5           -> Start debugging`,
    },
    price: 'Free / open-source',
    alternatives: ['Cursor', 'JetBrains IDEs', 'Neovim', 'Sublime'],
    cautions: [
      L('extension များလွန်းရင် နှေးတတ်', 'Too many extensions can slow it down'),
      L('untrusted extension security သတိ', 'Mind untrusted-extension security'),
    ],
    libraries: ['Prettier', 'ESLint', 'PlatformIO'],
  },

  'arduino-ide': {
    difficulty: 'beginner',
    whatFor: L(
      'Arduino နဲ့ ESP board များကို program ရေး၊ compile, upload လုပ်ရန် တရားဝင် software။ စတင်လေ့လာသူများအတွက် အလွယ်ကူဆုံး။',
      'The official software to write, compile and upload code to Arduino and ESP boards — easiest for beginners.',
    ),
    useCases: [
      L('Arduino / ESP firmware', 'Arduino / ESP firmware'),
      L('sketch upload', 'Uploading sketches'),
      L('serial monitor debug', 'Serial-monitor debugging'),
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup() { Serial.begin(9600); }\nvoid loop() { Serial.println("Hello TU"); delay(1000); }`,
    },
    price: 'Free / open-source',
    alternatives: ['PlatformIO (pro)', 'Arduino Cloud', 'Thonny (MicroPython)'],
    cautions: [
      L('board / port ကို မှန်အောင် ရွေးရ', 'Select the correct board / port'),
      L('board package (ESP32) ကို အရင် install ရ', 'Install the board package (ESP32) first'),
    ],
    libraries: ['Library Manager', 'Board Manager'],
  },

  platformio: {
    difficulty: 'intermediate',
    whatFor: L(
      'embedded development အတွက် professional toolchain (VS Code extension)။ library/dependency management, multi-board, unit test ပါ။',
      'A professional embedded-development toolchain (a VS Code extension) with library/dependency management, multi-board support and unit testing.',
    ),
    useCases: [
      L('ကြီးမားသော embedded project', 'Larger embedded projects'),
      L('multi-board build', 'Multi-board builds'),
      L('embedded unit test / CI', 'Embedded unit tests / CI'),
    ],
    code: {
      lang: 'INI',
      code: `; platformio.ini\n[env:esp32dev]\nplatform = espressif32\nboard = esp32dev\nframework = arduino`,
    },
    price: 'Free (Core) / paid (advanced)',
    alternatives: ['Arduino IDE', 'ESP-IDF', 'STM32Cube'],
    cautions: [
      L('Arduino IDE ထက် learning curve မြင့်', 'Higher learning curve than the Arduino IDE'),
      L('platformio.ini config နားလည်ထား', 'Understand the platformio.ini config'),
    ],
    libraries: ['VS Code', 'Arduino/ESP-IDF frameworks'],
  },

  docker: {
    difficulty: 'advanced',
    whatFor: L(
      'app + dependency အားလုံးကို container တစ်ခုတွင် ထုပ်ပိုး၍ ဘယ်စက်မှာမဆို တူညီစွာ run စေသော tool။ “ကျွန်တော့်စက်မှာ အလုပ်လုပ်တယ်” ပြဿနာ ဖြေရှင်း။',
      'A tool that packages an app and all its dependencies into a container so it runs identically anywhere — solving "works on my machine".',
    ),
    useCases: [
      L('consistent deployment', 'Consistent deployment'),
      L('microservice', 'Microservices'),
      L('dev environment တူညီစေ', 'Reproducible dev environments'),
    ],
    code: {
      lang: 'Dockerfile',
      code: `FROM node:20\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["node", "server.js"]`,
    },
    price: 'Free (engine) / Desktop tiers',
    alternatives: ['Podman', 'Kubernetes (orchestration)', 'LXC'],
    cautions: [
      L('image size ကို optimize ရ (multi-stage)', 'Optimise image size (multi-stage builds)'),
      L('secret ကို image ထဲ hardcode မလုပ်ရ', 'Never hardcode secrets into an image'),
    ],
    libraries: ['Docker Compose', 'Docker Hub', 'Kubernetes'],
  },

  linux: {
    difficulty: 'intermediate',
    whatFor: L(
      'server, SBC (Raspberry Pi), embedded များတွင် အသုံးများသော open-source operating system။ development နဲ့ deployment ၏ အခြေခံ။',
      'The open-source operating system used on servers, SBCs (Raspberry Pi) and embedded systems — the basis of development and deployment.',
    ),
    useCases: [
      L('server / cloud host', 'Server / cloud hosting'),
      L('Raspberry Pi / SBC', 'Raspberry Pi / SBCs'),
      L('development environment', 'Development environments'),
    ],
    code: {
      lang: 'Bash',
      code: `sudo apt update && sudo apt install python3\nls -la\nchmod +x script.sh\n./script.sh`,
    },
    price: 'Free / open-source',
    alternatives: ['Windows', 'macOS', 'BSD'],
    cautions: [
      L('command-line ကို ကျင့်သားရ', 'Get comfortable with the command line'),
      L('sudo / permission ကို ဂရုစိုက်', 'Be careful with sudo / permissions'),
    ],
    libraries: ['bash', 'systemd', 'apt/dnf'],
  },

  aws: {
    difficulty: 'advanced',
    whatFor: L(
      'app များကို host, scale, ဖြန့်ဝေရန် cloud service platform (AWS/GCP/Azure)။ server, database, storage, AI service အားလုံး ငှားသုံးနိုင်။',
      'Cloud service platforms (AWS/GCP/Azure) to host, scale and distribute apps — rent servers, databases, storage and AI services.',
    ),
    useCases: [
      L('web app / API hosting', 'Web app / API hosting'),
      L('scalable backend', 'Scalable backends'),
      L('cloud storage / AI service', 'Cloud storage / AI services'),
    ],
    code: {
      lang: 'Bash',
      code: `# AWS CLI example\naws s3 cp file.txt s3://my-bucket/\naws ec2 describe-instances`,
    },
    price: 'Free tier + pay-as-you-go',
    alternatives: ['Google Cloud', 'Azure', 'DigitalOcean', 'Vercel'],
    cautions: [
      L('cost ကို monitor ရ — bill ကြီးလွယ်', 'Monitor costs — bills can balloon'),
      L('IAM permission / security ကြီးစွာ ဂရုစိုက်', 'Take IAM permissions / security seriously'),
    ],
    libraries: ['AWS CLI', 'Terraform', 'boto3'],
  },

  postman: {
    difficulty: 'beginner',
    whatFor: L(
      'REST API များကို test, debug, document လုပ်ရန် tool။ request ပို့၍ response ကြည့်ခြင်း၊ collection သိမ်းခြင်း လွယ်ကူ။',
      'A tool to test, debug and document REST APIs — easily send requests, inspect responses and save collections.',
    ),
    useCases: [
      L('API test / debug', 'API testing / debugging'),
      L('API documentation', 'API documentation'),
      L('automated API test', 'Automated API tests'),
    ],
    code: {
      lang: 'HTTP',
      code: `POST https://api.example.com/login\nContent-Type: application/json\n\n{ "email": "a@b.com", "password": "***" }`,
    },
    price: 'Free tier / paid team tiers',
    alternatives: ['Insomnia', 'Thunder Client (VS Code)', 'curl'],
    cautions: [
      L('production secret ကို cloud sync မလုပ်ရ', 'Don\u2019t sync production secrets to the cloud'),
      L('environment variable ကို သေချာ ခွဲ', 'Separate environment variables carefully'),
    ],
    libraries: ['Newman (CLI)', 'OpenAPI'],
  },

  nodered: {
    difficulty: 'beginner',
    whatFor: L(
      'node များကို drag-and-drop ဆက်၍ IoT flow တည်ဆောက်ရသော visual programming tool။ code နည်းနည်းနဲ့ automation ဆောက်နိုင်။',
      'A visual programming tool where you wire nodes by drag-and-drop to build IoT flows — automation with little code.',
    ),
    useCases: [
      L('IoT data flow / automation', 'IoT data flow / automation'),
      L('MQTT ↔ dashboard bridge', 'MQTT ↔ dashboard bridge'),
      L('home automation', 'Home automation'),
    ],
    code: {
      lang: 'JavaScript',
      code: `// Inside a Node-RED function node:\nmsg.payload = msg.payload * 1.8 + 32;  // C -> F\nreturn msg;`,
    },
    price: 'Free / open-source',
    alternatives: ['Home Assistant', 'n8n', 'Apache NiFi'],
    cautions: [
      L('ကြီးမားသော flow က ရှုပ်ထွေး / debug ခက်', 'Large flows get tangled / hard to debug'),
      L('dashboard security (auth) ထည့်ပါ', 'Add dashboard security (auth)'),
    ],
    libraries: ['Node.js', 'MQTT nodes', 'Dashboard nodes'],
  },

  blynk: {
    difficulty: 'beginner',
    whatFor: L(
      'IoT device များအတွက် mobile app dashboard ကို code မရေးဘဲ ဆောက်ပေးသော platform။ ဖုန်းကနေ ချက်ချင်း ထိန်းချုပ်နိုင်။',
      'A platform that builds a mobile-app dashboard for IoT devices with no coding — control from your phone instantly.',
    ),
    useCases: [
      L('IoT ဖုန်း app dashboard', 'IoT phone-app dashboards'),
      L('remote control / monitor', 'Remote control / monitoring'),
      L('student IoT project', 'Student IoT projects'),
    ],
    code: {
      lang: 'Arduino C++',
      code: `#define BLYNK_TEMPLATE_ID "..."\n#include <BlynkSimpleEsp32.h>\nvoid setup(){ Blynk.begin(auth, ssid, pass); }\nvoid loop(){ Blynk.run(); }`,
    },
    price: 'Free tier / paid tiers',
    alternatives: ['ThingsBoard', 'Cayenne', 'Node-RED Dashboard'],
    cautions: [
      L('free tier မှာ device / widget ကန့်သတ်', 'Free tier limits devices / widgets'),
      L('cloud dependency — offline မရ', 'Cloud-dependent — no offline use'),
    ],
    libraries: ['Blynk library', 'ESP32/ESP8266'],
  },

  thingspeak: {
    difficulty: 'beginner',
    whatFor: L(
      'IoT sensor data ကို cloud တွင် သိမ်း၊ graph ဆွဲ, analyze (MATLAB) လုပ်ပေးသော platform။ data logging + visualization အတွက်။',
      'A platform to store, graph and analyse (with MATLAB) IoT sensor data in the cloud — for logging + visualisation.',
    ),
    useCases: [
      L('sensor data logging', 'Sensor data logging'),
      L('online data graph', 'Online data graphs'),
      L('MATLAB analytics', 'MATLAB analytics'),
    ],
    code: {
      lang: 'HTTP',
      code: `GET https://api.thingspeak.com/update?api_key=XXXX&field1=25`,
    },
    price: 'Free (limited) / paid tiers',
    alternatives: ['Blynk', 'Adafruit IO', 'InfluxDB + Grafana'],
    cautions: [
      L('free tier update rate ကန့်သတ် (~15s)', 'Free tier limits update rate (~15s)'),
      L('API key ကို လုံခြုံစွာ ထား', 'Keep the API key secure'),
    ],
    libraries: ['ThingSpeak library', 'HTTPClient'],
  },

  // ─── CAD / EDA / Sim ──────────────────────────────────────────────────────
  proteus: {
    difficulty: 'intermediate',
    whatFor: L(
      'circuit simulation နဲ့ PCB design ကို ပေါင်းစပ်ထားသော software။ Arduino/MCU code ပါ simulate နိုင်၍ hardware မဝယ်ခင် စမ်းသပ်နိုင်။',
      'Software combining circuit simulation and PCB design — it can even simulate Arduino/MCU code so you test before buying hardware.',
    ),
    useCases: [
      L('MCU circuit simulation', 'MCU circuit simulation'),
      L('hardware မဝယ်ခင် စမ်းသပ်', 'Testing before buying hardware'),
      L('PCB design', 'PCB design'),
    ],
    code: {
      lang: 'Workflow',
      code: `// 1. Place MCU + components on schematic\n// 2. Load compiled .hex into the MCU\n// 3. Run simulation and watch virtual I/O`,
    },
    price: 'Paid (student/edu licenses)',
    alternatives: ['Tinkercad (free)', 'SimulIDE (free)', 'Multisim'],
    cautions: [
      L('license ဈေးကြီး — Tinkercad က အခမဲ့ အစားထိုး', 'Expensive license — Tinkercad is a free alternative'),
      L('simulation က real hardware နဲ့ ကွာနိုင်', 'Simulation may differ from real hardware'),
    ],
    libraries: ['MCU model libraries'],
  },

  fritzing: {
    difficulty: 'beginner',
    whatFor: L(
      'breadboard layout ကို လက်တွေ့ပုံစံ ဆွဲ၍ circuit diagram နဲ့ PCB အဖြစ် ပြောင်းပေးသော software။ documentation အတွက် အလွန်ကောင်း။',
      'Software to draw a realistic breadboard layout and convert it to a schematic and PCB — excellent for documentation.',
    ),
    useCases: [
      L('breadboard wiring diagram', 'Breadboard wiring diagrams'),
      L('project documentation', 'Project documentation'),
      L('ရိုးရှင်းသော PCB', 'Simple PCBs'),
    ],
    code: {
      lang: 'Workflow',
      code: `// Drag parts onto the breadboard view,\n// wire them, then switch to Schematic / PCB view.`,
    },
    price: 'Small paid fee (or build from source)',
    alternatives: ['KiCad (free, pro)', 'EasyEDA', 'Tinkercad'],
    cautions: [
      L('professional PCB အတွက် KiCad ပို့သင့်', 'For professional PCBs, prefer KiCad'),
      L('part library အကန့်အသတ်', 'Limited part library'),
    ],
    libraries: ['Parts library'],
  },

  kicad: {
    difficulty: 'advanced',
    whatFor: L(
      'professional-grade PCB design အတွက် အခမဲ့ open-source software။ schematic, layout, 3D view, Gerber export အားလုံး ပါဝင်။',
      'Free, open-source software for professional-grade PCB design — schematic, layout, 3D view and Gerber export.',
    ),
    useCases: [
      L('custom PCB design', 'Custom PCB design'),
      L('production hardware', 'Production hardware'),
      L('open-source hardware', 'Open-source hardware'),
    ],
    code: {
      lang: 'Workflow',
      code: `// 1. Draw schematic -> assign footprints\n// 2. Route the PCB layout\n// 3. Export Gerbers -> order from a fab (JLCPCB)`,
    },
    price: 'Free / open-source',
    alternatives: ['Eagle/Altium (paid)', 'EasyEDA', 'Fritzing (basic)'],
    cautions: [
      L('learning curve မတ်စောက်', 'Steep learning curve'),
      L('footprint / clearance rule ဂရုစိုက်', 'Mind footprint / clearance rules'),
    ],
    libraries: ['Component libraries', 'JLCPCB/OSHPark'],
  },

  eagle: {
    difficulty: 'advanced',
    whatFor: L(
      'professional PCB EDA software (Eagle/Altium)။ industry standard ဖြစ်၍ ရှုပ်ထွေးသော commercial hardware design များအတွက်။',
      'Professional PCB EDA software (Eagle/Altium) — an industry standard for complex commercial hardware design.',
    ),
    useCases: [
      L('professional / commercial PCB', 'Professional / commercial PCBs'),
      L('multi-layer complex board', 'Multi-layer complex boards'),
      L('industry workflow', 'Industry workflows'),
    ],
    code: {
      lang: 'Workflow',
      code: `// Schematic -> board layout -> autoroute/manual route\n// -> DRC check -> manufacturing output (Gerber/ODB++)`,
    },
    price: 'Paid (Altium expensive; Eagle via Fusion)',
    alternatives: ['KiCad (free)', 'EasyEDA', 'OrCAD'],
    cautions: [
      L('license ဈေးအလွန်ကြီး (Altium)', 'Very expensive license (Altium)'),
      L('student အတွက် KiCad က လုံလောက်', 'For students KiCad is usually enough'),
    ],
    libraries: ['Component libraries', 'Manufacturer parts'],
  },

  multisim: {
    difficulty: 'intermediate',
    whatFor: L(
      'SPICE-based analog/digital circuit simulation software။ virtual instrument (oscilloscope, multimeter) များဖြင့် circuit ကို စမ်းသပ်နိုင်။',
      'SPICE-based analog/digital circuit simulation software — test circuits with virtual instruments (oscilloscope, multimeter).',
    ),
    useCases: [
      L('analog circuit analysis', 'Analog circuit analysis'),
      L('electronics သင်ကြားရေး', 'Electronics education'),
      L('circuit မဆောက်ခင် စမ်း', 'Testing before building'),
    ],
    code: {
      lang: 'Workflow',
      code: `// Place components, wire them,\n// attach virtual scope/multimeter, run analysis (DC/AC/transient).`,
    },
    price: 'Paid (student/edu licenses)',
    alternatives: ['LTspice (free)', 'Falstad (free web)', 'Proteus'],
    cautions: [
      L('license ဈေးကြီး — LTspice က အခမဲ့', 'Expensive license — LTspice is free'),
      L('model accuracy က real part နဲ့ ကွာနိုင်', 'Model accuracy may differ from real parts'),
    ],
    libraries: ['SPICE models'],
  },

  solidworks: {
    difficulty: 'advanced',
    whatFor: L(
      'mechanical part နဲ့ assembly များ ဒီဇိုင်းဆွဲရန် professional 3D CAD software။ engineering, manufacturing, enclosure design အတွက်။',
      'Professional 3D CAD software for designing mechanical parts and assemblies — for engineering, manufacturing and enclosures.',
    ),
    useCases: [
      L('mechanical part design', 'Mechanical part design'),
      L('enclosure / casing', 'Enclosures / casings'),
      L('assembly + simulation', 'Assemblies + simulation'),
    ],
    code: {
      lang: 'Workflow',
      code: `// Sketch -> extrude/revolve -> features\n// -> assembly + mates -> drawing/simulation`,
    },
    price: 'Paid (student license available)',
    alternatives: ['Fusion 360', 'FreeCAD (free)', 'Onshape'],
    cautions: [
      L('license ဈေးကြီး — Fusion/FreeCAD စဉ်းစား', 'Expensive license — consider Fusion/FreeCAD'),
      L('hardware (GPU) requirement မြင့်', 'High hardware (GPU) requirements'),
    ],
    libraries: ['Toolbox parts', 'Simulation add-in'],
  },

  fusion360: {
    difficulty: 'intermediate',
    whatFor: L(
      'CAD, CAM, simulation ကို cloud ပေါ်တွင် ပေါင်းစပ်ထားသော Autodesk software။ 3D design + CNC/3D-print manufacturing အတွက်။',
      'Autodesk software combining CAD, CAM and simulation in the cloud — for 3D design plus CNC/3D-print manufacturing.',
    ),
    useCases: [
      L('3D product design', '3D product design'),
      L('3D printing / CNC (CAM)', '3D printing / CNC (CAM)'),
      L('enclosure / prototype', 'Enclosures / prototypes'),
    ],
    code: {
      lang: 'Workflow',
      code: `// Sketch -> model -> (optional) CAM toolpaths\n// -> export STL (3D print) or G-code (CNC)`,
    },
    price: 'Paid (free for students/hobbyists)',
    alternatives: ['SolidWorks', 'FreeCAD (free)', 'Tinkercad (simple)'],
    cautions: [
      L('cloud-based — internet လို', 'Cloud-based — needs internet'),
      L('free license terms ကို စစ်ပါ', 'Check the free-license terms'),
    ],
    libraries: ['McMaster-Carr parts', 'CAM library'],
  },

  autocad: {
    difficulty: 'intermediate',
    whatFor: L(
      '2D drafting နဲ့ 3D design အတွက် industry-standard software။ architecture, engineering drawing, floor plan များအတွက်။',
      'Industry-standard software for 2D drafting and 3D design — for architecture, engineering drawings and floor plans.',
    ),
    useCases: [
      L('2D technical drawing', '2D technical drawings'),
      L('floor plan / architecture', 'Floor plans / architecture'),
      L('engineering blueprint', 'Engineering blueprints'),
    ],
    code: {
      lang: 'Command',
      code: `LINE   -> draw lines\nCIRCLE -> draw circles\nDIM    -> add dimensions`,
    },
    price: 'Paid (free student license)',
    alternatives: ['LibreCAD (free)', 'FreeCAD', 'DraftSight'],
    cautions: [
      L('license ဈေးကြီး — student version သုံး', 'Expensive license — use the student version'),
      L('mechanical 3D အတွက် Fusion/SolidWorks ပို့ချော', 'For mechanical 3D, Fusion/SolidWorks fit better'),
    ],
    libraries: ['Block libraries', 'AutoLISP'],
  },

  blender: {
    difficulty: 'advanced',
    whatFor: L(
      '3D modelling, animation, rendering အတွက် အခမဲ့ open-source software။ ရုပ်ပုံ၊ animation၊ game asset၊ visualization အတွက်။',
      'Free open-source software for 3D modelling, animation and rendering — for images, animation, game assets and visualisation.',
    ),
    useCases: [
      L('3D model / animation', '3D models / animation'),
      L('game asset / VFX', 'Game assets / VFX'),
      L('product visualization', 'Product visualisation'),
    ],
    code: {
      lang: 'Python',
      code: `import bpy\nbpy.ops.mesh.primitive_cube_add(size=2)\nbpy.context.object.location = (0, 0, 1)`,
    },
    price: 'Free / open-source',
    alternatives: ['Maya', '3ds Max', 'Cinema 4D'],
    cautions: [
      L('learning curve မတ်စောက်ဆုံးများထဲ', 'Among the steepest learning curves'),
      L('rendering က GPU အားကောင်း လို', 'Rendering needs a powerful GPU'),
    ],
    libraries: ['bpy (scripting)', 'add-ons'],
  },

  simulink: {
    difficulty: 'advanced',
    whatFor: L(
      'block diagram ဖြင့် dynamic system များ model, simulate လုပ်ရသော MATLAB tool။ control system, signal processing အတွက်။',
      'A MATLAB tool to model and simulate dynamic systems with block diagrams — for control systems and signal processing.',
    ),
    useCases: [
      L('control system design', 'Control-system design'),
      L('system simulation', 'System simulation'),
      L('model-based design', 'Model-based design'),
    ],
    code: {
      lang: 'Workflow',
      code: `// Drag blocks (transfer fn, sum, scope) onto the canvas,\n// wire them, set parameters, then Run to simulate.`,
    },
    price: 'Paid (with MATLAB; student license)',
    alternatives: ['Xcos (Scilab, free)', 'LabVIEW', 'OpenModelica'],
    cautions: [
      L('MATLAB license လို — ဈေးကြီး', 'Requires a MATLAB license — expensive'),
      L('solver / step size ကို မှန်အောင် ရွေး', 'Choose the right solver / step size'),
    ],
    libraries: ['MATLAB', 'Toolboxes'],
  },

  labview: {
    difficulty: 'advanced',
    whatFor: L(
      'graphical (wiring) programming ဖြင့် measurement, instrumentation, data acquisition system များ ဆောက်ရသော NI software။',
      'NI software for building measurement, instrumentation and data-acquisition systems with graphical (wiring) programming.',
    ),
    useCases: [
      L('data acquisition (DAQ)', 'Data acquisition (DAQ)'),
      L('instrument control / test', 'Instrument control / test'),
      L('automated measurement', 'Automated measurement'),
    ],
    code: {
      lang: 'Workflow',
      code: `// Build a "VI": wire function nodes on the block diagram,\n// design the front panel (knobs, graphs) for the user.`,
    },
    price: 'Paid (student/community editions)',
    alternatives: ['Python + PyVISA', 'MATLAB', 'Node-RED'],
    cautions: [
      L('graphical code က ကြီးလာရင် ရှုပ်ထွေး', 'Graphical code gets tangled as it grows'),
      L('NI hardware နဲ့ တွဲမှ အကောင်းဆုံး', 'Works best paired with NI hardware'),
    ],
    libraries: ['NI-DAQmx', 'VISA'],
  },

  tinkercad: {
    difficulty: 'beginner',
    whatFor: L(
      'browser ထဲမှာ circuit, Arduino code, 3D design ကို အခမဲ့ စမ်းသပ်နိုင်သော Autodesk online tool။ စတင်လေ့လာသူများအတွက် အကောင်းဆုံး။',
      'A free Autodesk online tool to experiment with circuits, Arduino code and 3D design right in the browser — best for beginners.',
    ),
    useCases: [
      L('circuit / Arduino simulation', 'Circuit / Arduino simulation'),
      L('hardware မရှိဘဲ လေ့လာ', 'Learning without hardware'),
      L('ရိုးရှင်းသော 3D design', 'Simple 3D design'),
    ],
    code: {
      lang: 'Arduino C++',
      code: `void setup(){ pinMode(13, OUTPUT); }\nvoid loop(){\n  digitalWrite(13, HIGH); delay(500);\n  digitalWrite(13, LOW);  delay(500);\n}`,
    },
    price: 'Free (Autodesk account)',
    alternatives: ['Wokwi (free)', 'Proteus', 'SimulIDE'],
    cautions: [
      L('component library အကန့်အသတ်', 'Limited component library'),
      L('simulation က real hardware နဲ့ ကွာနိုင်', 'Simulation may differ from real hardware'),
    ],
    libraries: ['Built-in parts', 'Codeblocks'],
  },
};

/** Return the guide for an id, or undefined if none authored yet. */
export function guideFor(id: string): ComponentGuide | undefined {
  return COMPONENT_GUIDES[id];
}

/** How many components currently have an authored guide (for progress checks). */
export function guideCount(): number {
  return Object.keys(COMPONENT_GUIDES).length;
}
