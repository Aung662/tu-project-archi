import type { GlyphKey } from './glyphs';

/**
 * The Components Toolkit catalogue — hardware and software building blocks that
 * modern student engineering projects are built from. Each item maps to a
 * brand-neutral inline-SVG glyph (see glyphs.ts) tinted by its category colour,
 * so the whole set renders offline and every icon can be downloaded as SVG/PNG.
 *
 * Names are generic component/technology names (not logos) so they are safe to
 * ship and genuinely useful as a reference/parts list for thesis work.
 */

export interface ComponentItem {
  /** Stable slug used for download filenames + keys. */
  id: string;
  name: string;
  glyph: GlyphKey;
  category: CategoryKey;
  /** One-line, student-facing description of what it is / used for. */
  blurb: string;
  /** Extra search terms (aliases, abbreviations). */
  tags?: string[];
}

export type CategoryKey =
  | 'boards' | 'sensors' | 'actuators' | 'display' | 'comms' | 'power'
  | 'passive' | 'io' | 'industrial' | 'robotics'
  | 'sw-lang' | 'sw-ai' | 'sw-data' | 'sw-web' | 'sw-tools' | 'sw-eda';

export interface Category {
  key: CategoryKey;
  labelEn: string;
  labelMy: string;
  /** Tailwind text colour class used to tint glyphs + accents. */
  color: string;
  /** Hex used for downloaded SVG/PNG (must match `color`). */
  hex: string;
  group: 'hardware' | 'software';
}

export const CATEGORIES: Category[] = [
  { key: 'boards', labelEn: 'Boards & MCUs', labelMy: 'ဘုတ်များ / MCU', color: 'text-brand-300', hex: '#a5b4fc', group: 'hardware' },
  { key: 'sensors', labelEn: 'Sensors', labelMy: 'အာရုံခံကိရိယာများ', color: 'text-mint-300', hex: '#8ef4de', group: 'hardware' },
  { key: 'actuators', labelEn: 'Actuators & Motors', labelMy: 'မော်တာ / အက်ချူရေတာ', color: 'text-amber-300', hex: '#fcd34d', group: 'hardware' },
  { key: 'display', labelEn: 'Displays', labelMy: 'မျက်နှာပြင်များ', color: 'text-sky-300', hex: '#7dd3fc', group: 'hardware' },
  { key: 'comms', labelEn: 'Connectivity', labelMy: 'ဆက်သွယ်ရေး', color: 'text-cyan-300', hex: '#67e8f9', group: 'hardware' },
  { key: 'power', labelEn: 'Power', labelMy: 'ပါဝါ', color: 'text-rose-300', hex: '#fda4af', group: 'hardware' },
  { key: 'passive', labelEn: 'Passive & Discrete', labelMy: 'အခြေခံ အီလက်ထရွန်နစ်', color: 'text-orange-300', hex: '#fdba74', group: 'hardware' },
  { key: 'io', labelEn: 'Input / Output', labelMy: 'အင်ပွတ် / အောက်ပွတ်', color: 'text-violet-300', hex: '#c4b5fd', group: 'hardware' },
  { key: 'industrial', labelEn: 'Industrial / Automation', labelMy: 'စက်မှု အလိုအလျောက်စနစ်', color: 'text-teal-300', hex: '#5eead4', group: 'hardware' },
  { key: 'robotics', labelEn: 'Robotics', labelMy: 'ရိုဘော့တစ်', color: 'text-lime-300', hex: '#bef264', group: 'hardware' },
  { key: 'sw-lang', labelEn: 'Languages', labelMy: 'ပရိုဂရမ်းမင်း ဘာသာစကား', color: 'text-brand-300', hex: '#a5b4fc', group: 'software' },
  { key: 'sw-ai', labelEn: 'AI / ML', labelMy: 'AI / စက်သင်ယူမှု', color: 'text-fuchsia-300', hex: '#f0abfc', group: 'software' },
  { key: 'sw-data', labelEn: 'Data & Backend', labelMy: 'ဒေတာ / Backend', color: 'text-emerald-300', hex: '#6ee7b7', group: 'software' },
  { key: 'sw-web', labelEn: 'Web & Mobile', labelMy: 'ဝဘ် / မိုဘိုင်း', color: 'text-sky-300', hex: '#7dd3fc', group: 'software' },
  { key: 'sw-tools', labelEn: 'Dev Tools & Cloud', labelMy: 'ဖန်တီးရေး ကိရိယာ / Cloud', color: 'text-amber-300', hex: '#fcd34d', group: 'software' },
  { key: 'sw-eda', labelEn: 'CAD / EDA / Sim', labelMy: 'CAD / EDA / တုပစမ်း', color: 'text-cyan-300', hex: '#67e8f9', group: 'software' },
];

export const COMPONENTS: ComponentItem[] = [
  // ── Boards & MCUs ─────────────────────────────────────────────────────────
  { id: 'arduino-uno', name: 'Arduino Uno', glyph: 'board', category: 'boards', blurb: 'ATmega328P 8-bit beginner board', tags: ['atmega', 'avr'] },
  { id: 'arduino-nano', name: 'Arduino Nano', glyph: 'board', category: 'boards', blurb: 'Compact breadboard-friendly Uno', tags: ['atmega'] },
  { id: 'arduino-mega', name: 'Arduino Mega 2560', glyph: 'board', category: 'boards', blurb: 'Many-pin board for big projects', tags: ['atmega2560'] },
  { id: 'esp32', name: 'ESP32', glyph: 'chip', category: 'boards', blurb: 'Dual-core Wi-Fi + Bluetooth MCU', tags: ['wifi', 'ble'] },
  { id: 'esp8266', name: 'ESP8266', glyph: 'chip', category: 'boards', blurb: 'Low-cost Wi-Fi microcontroller', tags: ['nodemcu', 'wifi'] },
  { id: 'esp32-cam', name: 'ESP32-CAM', glyph: 'camera', category: 'boards', blurb: 'ESP32 with an onboard camera', tags: ['camera', 'wifi'] },
  { id: 'raspberry-pi', name: 'Raspberry Pi 4', glyph: 'sbc', category: 'boards', blurb: 'Linux single-board computer', tags: ['sbc', 'linux'] },
  { id: 'raspberry-pi-pico', name: 'Raspberry Pi Pico', glyph: 'chip', category: 'boards', blurb: 'RP2040 dual-core microcontroller', tags: ['rp2040'] },
  { id: 'stm32', name: 'STM32 (Blue Pill)', glyph: 'cpu', category: 'boards', blurb: '32-bit ARM Cortex-M MCU', tags: ['arm', 'cortex'] },
  { id: 'arduino-pro-mini', name: 'Arduino Pro Mini', glyph: 'board', category: 'boards', blurb: 'Ultra-small low-power board', tags: ['atmega'] },
  { id: 'nodemcu', name: 'NodeMCU', glyph: 'chip', category: 'boards', blurb: 'ESP8266 dev board with USB', tags: ['esp8266', 'wifi'] },
  { id: 'jetson-nano', name: 'NVIDIA Jetson Nano', glyph: 'sbc', category: 'boards', blurb: 'GPU board for edge AI', tags: ['ai', 'gpu', 'edge'] },
  { id: 'orange-pi', name: 'Orange Pi', glyph: 'sbc', category: 'boards', blurb: 'Alternative Linux SBC', tags: ['sbc'] },
  { id: 'attiny85', name: 'ATtiny85', glyph: 'chip', category: 'boards', blurb: 'Tiny 8-pin microcontroller', tags: ['avr'] },
  { id: 'teensy', name: 'Teensy 4.0', glyph: 'cpu', category: 'boards', blurb: 'High-performance ARM board', tags: ['arm'] },
  { id: 'micro-bit', name: 'micro:bit', glyph: 'board', category: 'boards', blurb: 'Education MCU with LED matrix', tags: ['education'] },

  // ── Sensors ───────────────────────────────────────────────────────────────
  { id: 'dht11', name: 'DHT11 / DHT22', glyph: 'temp', category: 'sensors', blurb: 'Temperature & humidity sensor', tags: ['humidity', 'temperature'] },
  { id: 'ds18b20', name: 'DS18B20', glyph: 'temp', category: 'sensors', blurb: 'Waterproof digital temperature probe', tags: ['temperature', '1-wire'] },
  { id: 'lm35', name: 'LM35', glyph: 'temp', category: 'sensors', blurb: 'Analog temperature sensor', tags: ['temperature'] },
  { id: 'hc-sr04', name: 'HC-SR04', glyph: 'distance', category: 'sensors', blurb: 'Ultrasonic distance sensor', tags: ['ultrasonic', 'distance'] },
  { id: 'pir', name: 'PIR Motion (HC-SR501)', glyph: 'motion', category: 'sensors', blurb: 'Passive infrared motion detector', tags: ['motion', 'infrared'] },
  { id: 'ldr', name: 'LDR (Photoresistor)', glyph: 'light', category: 'sensors', blurb: 'Light-dependent resistor', tags: ['light'] },
  { id: 'bh1750', name: 'BH1750', glyph: 'light', category: 'sensors', blurb: 'Digital ambient light sensor', tags: ['light', 'lux'] },
  { id: 'mq2', name: 'MQ-2 Gas', glyph: 'gas', category: 'sensors', blurb: 'Smoke & flammable gas sensor', tags: ['gas', 'smoke'] },
  { id: 'mq135', name: 'MQ-135 Air Quality', glyph: 'gas', category: 'sensors', blurb: 'Air-quality / CO2 gas sensor', tags: ['air', 'gas'] },
  { id: 'mq7', name: 'MQ-7 CO', glyph: 'gas', category: 'sensors', blurb: 'Carbon-monoxide gas sensor', tags: ['co', 'gas'] },
  { id: 'soil-moisture', name: 'Soil Moisture', glyph: 'soil', category: 'sensors', blurb: 'Measures soil water content', tags: ['soil', 'agriculture'] },
  { id: 'rain-sensor', name: 'Rain Sensor', glyph: 'rain', category: 'sensors', blurb: 'Detects rainfall / water drops', tags: ['rain', 'water'] },
  { id: 'water-level', name: 'Water Level Sensor', glyph: 'water', category: 'sensors', blurb: 'Detects water height / presence', tags: ['water', 'level'] },
  { id: 'flow-sensor', name: 'Water Flow (YF-S201)', glyph: 'water', category: 'sensors', blurb: 'Measures liquid flow rate', tags: ['flow', 'water'] },
  { id: 'flame-sensor', name: 'Flame Sensor', glyph: 'flame', category: 'sensors', blurb: 'Detects fire / IR flame', tags: ['fire', 'flame'] },
  { id: 'mpu6050', name: 'MPU-6050 IMU', glyph: 'motion', category: 'sensors', blurb: '3-axis gyro + accelerometer', tags: ['imu', 'gyro', 'accelerometer'] },
  { id: 'hmc5883l', name: 'HMC5883L', glyph: 'compass', category: 'sensors', blurb: '3-axis digital compass', tags: ['magnetometer', 'compass'] },
  { id: 'bmp280', name: 'BMP280 / BME280', glyph: 'temp', category: 'sensors', blurb: 'Pressure, temp & humidity', tags: ['pressure', 'barometer'] },
  { id: 'load-cell', name: 'Load Cell + HX711', glyph: 'scale', category: 'sensors', blurb: 'Weight / force measurement', tags: ['weight', 'hx711'] },
  { id: 'ir-sensor', name: 'IR Obstacle Sensor', glyph: 'distance', category: 'sensors', blurb: 'Infrared proximity detection', tags: ['infrared', 'obstacle'] },
  { id: 'color-sensor', name: 'TCS3200 Color', glyph: 'sensor', category: 'sensors', blurb: 'Detects RGB colour', tags: ['color', 'rgb'] },
  { id: 'heart-rate', name: 'MAX30100 Pulse', glyph: 'heart', category: 'sensors', blurb: 'Heart-rate & SpO2 sensor', tags: ['pulse', 'health', 'spo2'] },
  { id: 'ph-sensor', name: 'pH Sensor', glyph: 'water', category: 'sensors', blurb: 'Measures liquid acidity/alkalinity', tags: ['ph', 'water'] },
  { id: 'current-sensor', name: 'ACS712 Current', glyph: 'current', category: 'sensors', blurb: 'Measures AC/DC current', tags: ['current', 'acs712'] },
  { id: 'voltage-sensor', name: 'Voltage Sensor', glyph: 'current', category: 'sensors', blurb: 'Voltage divider measurement', tags: ['voltage'] },
  { id: 'ir-flame-array', name: 'Vibration (SW-420)', glyph: 'motion', category: 'sensors', blurb: 'Detects vibration / knocks', tags: ['vibration'] },
  { id: 'lidar-sensor', name: 'LiDAR (TF-Luna)', glyph: 'lidar', category: 'sensors', blurb: 'Laser distance / mapping', tags: ['lidar', 'laser'] },

  // ── Actuators & Motors ────────────────────────────────────────────────────
  { id: 'dc-motor', name: 'DC Motor', glyph: 'motor', category: 'actuators', blurb: 'Basic geared/plain DC motor', tags: ['motor'] },
  { id: 'servo', name: 'Servo (SG90/MG996)', glyph: 'servo', category: 'actuators', blurb: 'Angle-controlled servo motor', tags: ['servo', 'sg90'] },
  { id: 'stepper', name: 'Stepper (28BYJ-48)', glyph: 'stepper', category: 'actuators', blurb: 'Precise step-by-step motor', tags: ['stepper'] },
  { id: 'nema17', name: 'NEMA 17 Stepper', glyph: 'stepper', category: 'actuators', blurb: 'CNC/3D-printer stepper motor', tags: ['stepper', 'cnc'] },
  { id: 'l298n', name: 'L298N Driver', glyph: 'relay', category: 'actuators', blurb: 'Dual H-bridge motor driver', tags: ['driver', 'h-bridge'] },
  { id: 'l293d', name: 'L293D Driver', glyph: 'relay', category: 'actuators', blurb: 'Motor driver IC', tags: ['driver'] },
  { id: 'a4988', name: 'A4988 Driver', glyph: 'chip', category: 'actuators', blurb: 'Stepper motor driver', tags: ['stepper', 'driver'] },
  { id: 'relay-module', name: 'Relay Module', glyph: 'relay', category: 'actuators', blurb: 'Switch high-voltage loads', tags: ['relay', 'switch'] },
  { id: 'solenoid', name: 'Solenoid Valve', glyph: 'pump', category: 'actuators', blurb: 'Electrically controlled valve', tags: ['valve', 'water'] },
  { id: 'water-pump', name: 'Water Pump', glyph: 'pump', category: 'actuators', blurb: 'Small DC liquid pump', tags: ['pump', 'water'] },
  { id: 'servo-continuous', name: 'Continuous Servo', glyph: 'servo', category: 'actuators', blurb: '360° rotation servo', tags: ['servo'] },
  { id: 'bldc', name: 'BLDC + ESC', glyph: 'motor', category: 'actuators', blurb: 'Brushless motor for drones', tags: ['brushless', 'drone', 'esc'] },
  { id: 'linear-actuator', name: 'Linear Actuator', glyph: 'servo', category: 'actuators', blurb: 'Push/pull linear motion', tags: ['linear'] },
  { id: 'buzzer', name: 'Buzzer', glyph: 'buzzer', category: 'actuators', blurb: 'Active/passive sound alert', tags: ['sound', 'alarm'] },

  // ── Displays ──────────────────────────────────────────────────────────────
  { id: 'lcd1602', name: 'LCD 16×2', glyph: 'lcd', category: 'display', blurb: 'Character LCD (I2C option)', tags: ['lcd', 'character'] },
  { id: 'lcd2004', name: 'LCD 20×4', glyph: 'lcd', category: 'display', blurb: 'Larger character LCD', tags: ['lcd'] },
  { id: 'oled', name: 'OLED 0.96" (SSD1306)', glyph: 'oled', category: 'display', blurb: 'Small I2C graphic display', tags: ['oled', 'ssd1306'] },
  { id: 'tft', name: 'TFT Touch Display', glyph: 'hmi', category: 'display', blurb: 'Colour graphical touchscreen', tags: ['tft', 'touch'] },
  { id: 'seven-seg', name: '7-Segment Display', glyph: 'sevenseg', category: 'display', blurb: 'Numeric LED display', tags: ['seven segment'] },
  { id: 'led-matrix', name: 'LED Matrix (MAX7219)', glyph: 'ledmatrix', category: 'display', blurb: '8×8 dot-matrix display', tags: ['matrix', 'max7219'] },
  { id: 'neopixel', name: 'NeoPixel (WS2812)', glyph: 'ledmatrix', category: 'display', blurb: 'Addressable RGB LEDs', tags: ['ws2812', 'rgb'] },
  { id: 'epaper', name: 'E-Paper Display', glyph: 'epaper', category: 'display', blurb: 'Low-power e-ink screen', tags: ['e-ink', 'epaper'] },

  // ── Connectivity ──────────────────────────────────────────────────────────
  { id: 'hc05', name: 'HC-05 Bluetooth', glyph: 'bluetooth', category: 'comms', blurb: 'Classic Bluetooth serial module', tags: ['bluetooth'] },
  { id: 'ble', name: 'BLE Module', glyph: 'bluetooth', category: 'comms', blurb: 'Bluetooth Low Energy', tags: ['ble', 'bluetooth'] },
  { id: 'nrf24', name: 'nRF24L01', glyph: 'antenna', category: 'comms', blurb: '2.4GHz RF transceiver', tags: ['rf', 'wireless'] },
  { id: 'lora', name: 'LoRa Module', glyph: 'antenna', category: 'comms', blurb: 'Long-range low-power radio', tags: ['lora', 'wireless'] },
  { id: 'sim800', name: 'SIM800L GSM', glyph: 'gsm', category: 'comms', blurb: 'GSM/GPRS cellular module', tags: ['gsm', 'sms'] },
  { id: 'sim900', name: 'SIM900 GSM', glyph: 'gsm', category: 'comms', blurb: 'GSM module for calls/SMS', tags: ['gsm'] },
  { id: 'gps-neo6', name: 'NEO-6M GPS', glyph: 'gps', category: 'comms', blurb: 'Satellite positioning module', tags: ['gps', 'location'] },
  { id: 'rfid-rc522', name: 'RFID RC522', glyph: 'rfid', category: 'comms', blurb: '13.56MHz RFID reader/writer', tags: ['rfid', 'nfc'] },
  { id: 'fingerprint-mod', name: 'Fingerprint (R307)', glyph: 'fingerprint', category: 'comms', blurb: 'Optical fingerprint scanner', tags: ['biometric', 'fingerprint'] },
  { id: 'ethernet-mod', name: 'Ethernet (W5100)', glyph: 'ethernet', category: 'comms', blurb: 'Wired network module', tags: ['ethernet', 'lan'] },
  { id: 'esp-now', name: 'Wi-Fi Module', glyph: 'wifi', category: 'comms', blurb: 'Wireless networking', tags: ['wifi'] },

  // ── Power ─────────────────────────────────────────────────────────────────
  { id: 'liion', name: 'Li-ion 18650', glyph: 'battery', category: 'power', blurb: 'Rechargeable lithium cell', tags: ['battery', '18650'] },
  { id: 'lipo', name: 'LiPo Battery', glyph: 'battery', category: 'power', blurb: 'Lightweight rechargeable pack', tags: ['battery', 'lipo'] },
  { id: 'tp4056', name: 'TP4056 Charger', glyph: 'battery', category: 'power', blurb: 'Li-ion charging module', tags: ['charger'] },
  { id: 'buck', name: 'Buck Converter (LM2596)', glyph: 'buck', category: 'power', blurb: 'Step-down DC-DC regulator', tags: ['dc-dc', 'step-down'] },
  { id: 'boost', name: 'Boost Converter', glyph: 'buck', category: 'power', blurb: 'Step-up DC-DC regulator', tags: ['dc-dc', 'step-up'] },
  { id: 'ldo', name: 'Voltage Regulator (7805)', glyph: 'regulator', category: 'power', blurb: 'Linear 5V regulator', tags: ['7805', 'ldo'] },
  { id: 'ams1117', name: 'AMS1117 3.3V', glyph: 'regulator', category: 'power', blurb: 'Low-dropout 3.3V regulator', tags: ['ldo'] },
  { id: 'solar-panel', name: 'Solar Panel', glyph: 'solar', category: 'power', blurb: 'Photovoltaic power source', tags: ['solar', 'renewable'] },
  { id: 'ups-module', name: 'Power Bank / UPS', glyph: 'battery', category: 'power', blurb: 'Backup power module', tags: ['ups', 'power'] },

  // ── Passive & Discrete ────────────────────────────────────────────────────
  { id: 'resistor', name: 'Resistor', glyph: 'resistor', category: 'passive', blurb: 'Limits current', tags: ['ohm'] },
  { id: 'capacitor', name: 'Capacitor', glyph: 'capacitor', category: 'passive', blurb: 'Stores charge / filters', tags: ['farad'] },
  { id: 'led', name: 'LED', glyph: 'led', category: 'passive', blurb: 'Light-emitting diode', tags: ['light'] },
  { id: 'diode', name: 'Diode', glyph: 'diode', category: 'passive', blurb: 'One-way current flow', tags: ['1n4007'] },
  { id: 'transistor', name: 'Transistor (BJT/MOSFET)', glyph: 'transistor', category: 'passive', blurb: 'Switch / amplify signals', tags: ['bjt', 'mosfet'] },
  { id: 'potentiometer', name: 'Potentiometer', glyph: 'pot', category: 'passive', blurb: 'Variable resistor knob', tags: ['pot', 'variable'] },
  { id: 'crystal', name: 'Crystal Oscillator', glyph: 'crystal', category: 'passive', blurb: 'Clock frequency reference', tags: ['oscillator', 'clock'] },
  { id: 'fuse', name: 'Fuse', glyph: 'fuse', category: 'passive', blurb: 'Over-current protection', tags: ['protection'] },
  { id: 'inductor', name: 'Inductor', glyph: 'crystal', category: 'passive', blurb: 'Stores energy in field', tags: ['coil'] },

  // ── Input / Output ────────────────────────────────────────────────────────
  { id: 'push-button', name: 'Push Button', glyph: 'button', category: 'io', blurb: 'Momentary tactile switch', tags: ['button'] },
  { id: 'toggle-switch', name: 'Toggle Switch', glyph: 'switch', category: 'io', blurb: 'On/off mechanical switch', tags: ['switch'] },
  { id: 'keypad', name: 'Matrix Keypad 4×4', glyph: 'keypad', category: 'io', blurb: 'Membrane input keypad', tags: ['keypad'] },
  { id: 'joystick', name: 'Joystick Module', glyph: 'joystick', category: 'io', blurb: '2-axis analog joystick', tags: ['joystick'] },
  { id: 'rotary-encoder', name: 'Rotary Encoder', glyph: 'encoder', category: 'io', blurb: 'Rotational input with clicks', tags: ['encoder'] },
  { id: 'breadboard', name: 'Breadboard', glyph: 'breadboard', category: 'io', blurb: 'Solderless prototyping board', tags: ['prototype'] },
  { id: 'jumper-wires', name: 'Jumper Wires', glyph: 'wires', category: 'io', blurb: 'Dupont connection wires', tags: ['wires', 'dupont'] },
  { id: 'pcb', name: 'PCB / Perfboard', glyph: 'pcb', category: 'io', blurb: 'Printed circuit board', tags: ['pcb'] },
  { id: 'sd-module', name: 'MicroSD Module', glyph: 'sdcard', category: 'io', blurb: 'Storage for data logging', tags: ['sd', 'storage'] },
  { id: 'rtc', name: 'RTC (DS3231)', glyph: 'clock', category: 'io', blurb: 'Real-time clock module', tags: ['clock', 'ds3231'] },
  { id: 'speaker', name: 'Speaker / DFPlayer', glyph: 'speaker', category: 'io', blurb: 'Audio output / MP3 module', tags: ['audio', 'sound'] },
  { id: 'usb-ttl', name: 'USB-TTL (CP2102)', glyph: 'usb', category: 'io', blurb: 'Serial programming adapter', tags: ['ftdi', 'serial'] },

  // ── Industrial / Automation ───────────────────────────────────────────────
  { id: 'plc', name: 'PLC', glyph: 'plc', category: 'industrial', blurb: 'Programmable logic controller', tags: ['plc', 'automation'] },
  { id: 'hmi', name: 'HMI Panel', glyph: 'hmi', category: 'industrial', blurb: 'Operator touch interface', tags: ['hmi', 'scada'] },
  { id: 'vfd', name: 'VFD / Motor Drive', glyph: 'drive', category: 'industrial', blurb: 'Variable-frequency motor drive', tags: ['vfd', 'inverter'] },
  { id: 'contactor', name: 'Contactor', glyph: 'relay', category: 'industrial', blurb: 'Heavy-duty power switch', tags: ['contactor'] },
  { id: 'proximity', name: 'Proximity Switch', glyph: 'distance', category: 'industrial', blurb: 'Inductive/capacitive detector', tags: ['proximity'] },
  { id: 'industrial-encoder', name: 'Industrial Encoder', glyph: 'encoder', category: 'industrial', blurb: 'Rotary position feedback', tags: ['encoder'] },
  { id: 'scada', name: 'SCADA Gateway', glyph: 'server', category: 'industrial', blurb: 'Supervisory control system', tags: ['scada', 'modbus'] },
  { id: 'sensor-industrial', name: 'Industrial Sensor', glyph: 'sensor', category: 'industrial', blurb: '4-20mA process sensor', tags: ['4-20ma'] },

  // ── Robotics ──────────────────────────────────────────────────────────────
  { id: 'robot-arm', name: 'Robotic Arm', glyph: 'robotarm', category: 'robotics', blurb: 'Multi-joint manipulator', tags: ['arm', 'manipulator'] },
  { id: 'gripper', name: 'Gripper', glyph: 'gripper', category: 'robotics', blurb: 'End-effector claw', tags: ['gripper', 'claw'] },
  { id: 'robot-wheel', name: 'Robot Wheel + Motor', glyph: 'wheel', category: 'robotics', blurb: 'Drive wheel for mobile robots', tags: ['wheel', 'chassis'] },
  { id: 'imu-robot', name: 'IMU / Balance', glyph: 'compass', category: 'robotics', blurb: 'Orientation for balance bots', tags: ['imu', 'balance'] },
  { id: 'lidar-robot', name: 'LiDAR Scanner', glyph: 'lidar', category: 'robotics', blurb: 'SLAM / mapping sensor', tags: ['slam', 'lidar'] },
  { id: 'depth-cam', name: 'Depth Camera', glyph: 'camera', category: 'robotics', blurb: '3D vision for robots', tags: ['depth', 'vision'] },

  // ══ SOFTWARE ══════════════════════════════════════════════════════════════
  // ── Languages ─────────────────────────────────────────────────────────────
  { id: 'python', name: 'Python', glyph: 'code', category: 'sw-lang', blurb: 'General-purpose, great for AI/data', tags: ['language'] },
  { id: 'cpp', name: 'C / C++', glyph: 'code', category: 'sw-lang', blurb: 'Embedded & performance code', tags: ['language', 'arduino'] },
  { id: 'java', name: 'Java', glyph: 'code', category: 'sw-lang', blurb: 'Android & enterprise apps', tags: ['language'] },
  { id: 'javascript', name: 'JavaScript', glyph: 'code', category: 'sw-lang', blurb: 'Web & full-stack scripting', tags: ['language', 'js'] },
  { id: 'typescript', name: 'TypeScript', glyph: 'code', category: 'sw-lang', blurb: 'Typed JavaScript for big apps', tags: ['language', 'ts'] },
  { id: 'csharp', name: 'C#', glyph: 'code', category: 'sw-lang', blurb: '.NET apps & Unity games', tags: ['language', 'dotnet'] },
  { id: 'php', name: 'PHP', glyph: 'code', category: 'sw-lang', blurb: 'Server-side web scripting', tags: ['language'] },
  { id: 'dart', name: 'Dart', glyph: 'code', category: 'sw-lang', blurb: 'Language behind Flutter', tags: ['language', 'flutter'] },
  { id: 'kotlin', name: 'Kotlin', glyph: 'code', category: 'sw-lang', blurb: 'Modern Android language', tags: ['language', 'android'] },
  { id: 'matlab', name: 'MATLAB', glyph: 'chart', category: 'sw-lang', blurb: 'Numerical computing & DSP', tags: ['simulation', 'dsp'] },

  // ── AI / ML ───────────────────────────────────────────────────────────────
  { id: 'tensorflow', name: 'TensorFlow', glyph: 'ai', category: 'sw-ai', blurb: 'Deep-learning framework', tags: ['ml', 'deep learning'] },
  { id: 'pytorch', name: 'PyTorch', glyph: 'ai', category: 'sw-ai', blurb: 'Research-friendly DL framework', tags: ['ml', 'deep learning'] },
  { id: 'keras', name: 'Keras', glyph: 'ai', category: 'sw-ai', blurb: 'High-level neural-net API', tags: ['ml'] },
  { id: 'scikit', name: 'scikit-learn', glyph: 'ai', category: 'sw-ai', blurb: 'Classic machine learning', tags: ['ml'] },
  { id: 'opencv', name: 'OpenCV', glyph: 'vision', category: 'sw-ai', blurb: 'Computer-vision library', tags: ['vision', 'image'] },
  { id: 'yolo', name: 'YOLO', glyph: 'vision', category: 'sw-ai', blurb: 'Real-time object detection', tags: ['detection', 'vision'] },
  { id: 'mediapipe', name: 'MediaPipe', glyph: 'vision', category: 'sw-ai', blurb: 'On-device ML pipelines', tags: ['vision', 'hands', 'pose'] },
  { id: 'tflite', name: 'TensorFlow Lite', glyph: 'ai', category: 'sw-ai', blurb: 'ML on microcontrollers/mobile', tags: ['edge', 'tinyml'] },
  { id: 'huggingface', name: 'Transformers / LLMs', glyph: 'ai', category: 'sw-ai', blurb: 'NLP & large language models', tags: ['nlp', 'llm'] },
  { id: 'pandas', name: 'Pandas / NumPy', glyph: 'chart', category: 'sw-ai', blurb: 'Data analysis & arrays', tags: ['data', 'analysis'] },

  // ── Data & Backend ────────────────────────────────────────────────────────
  { id: 'mysql', name: 'MySQL', glyph: 'database', category: 'sw-data', blurb: 'Popular relational database', tags: ['sql', 'database'] },
  { id: 'postgres', name: 'PostgreSQL', glyph: 'database', category: 'sw-data', blurb: 'Advanced open SQL database', tags: ['sql', 'database'] },
  { id: 'sqlite', name: 'SQLite', glyph: 'database', category: 'sw-data', blurb: 'Embedded file database', tags: ['sql', 'database'] },
  { id: 'mongodb', name: 'MongoDB', glyph: 'database', category: 'sw-data', blurb: 'NoSQL document database', tags: ['nosql', 'database'] },
  { id: 'firebase', name: 'Firebase', glyph: 'cloud', category: 'sw-data', blurb: 'Realtime DB, auth & hosting', tags: ['baas', 'realtime'] },
  { id: 'redis', name: 'Redis', glyph: 'database', category: 'sw-data', blurb: 'In-memory cache/store', tags: ['cache'] },
  { id: 'nodejs', name: 'Node.js', glyph: 'server', category: 'sw-data', blurb: 'JavaScript backend runtime', tags: ['backend'] },
  { id: 'express', name: 'Express', glyph: 'server', category: 'sw-data', blurb: 'Minimal Node web framework', tags: ['backend', 'api'] },
  { id: 'django', name: 'Django', glyph: 'server', category: 'sw-data', blurb: 'Batteries-included Python web', tags: ['backend', 'python'] },
  { id: 'flask', name: 'Flask', glyph: 'server', category: 'sw-data', blurb: 'Lightweight Python web', tags: ['backend', 'python', 'api'] },
  { id: 'laravel', name: 'Laravel', glyph: 'server', category: 'sw-data', blurb: 'Elegant PHP web framework', tags: ['backend', 'php'] },
  { id: 'spring', name: 'Spring Boot', glyph: 'server', category: 'sw-data', blurb: 'Java enterprise backend', tags: ['backend', 'java'] },
  { id: 'mqtt', name: 'MQTT', glyph: 'network', category: 'sw-data', blurb: 'Lightweight IoT messaging', tags: ['iot', 'broker'] },

  // ── Web & Mobile ──────────────────────────────────────────────────────────
  { id: 'react', name: 'React', glyph: 'web', category: 'sw-web', blurb: 'Component-based UI library', tags: ['frontend', 'ui'] },
  { id: 'nextjs', name: 'Next.js', glyph: 'web', category: 'sw-web', blurb: 'Full-stack React framework', tags: ['frontend', 'ssr'] },
  { id: 'vue', name: 'Vue.js', glyph: 'web', category: 'sw-web', blurb: 'Progressive UI framework', tags: ['frontend'] },
  { id: 'angular', name: 'Angular', glyph: 'web', category: 'sw-web', blurb: 'Full-featured web framework', tags: ['frontend'] },
  { id: 'tailwind', name: 'Tailwind CSS', glyph: 'web', category: 'sw-web', blurb: 'Utility-first CSS framework', tags: ['css', 'styling'] },
  { id: 'flutter', name: 'Flutter', glyph: 'app', category: 'sw-web', blurb: 'Cross-platform mobile UI', tags: ['mobile', 'dart'] },
  { id: 'react-native', name: 'React Native', glyph: 'app', category: 'sw-web', blurb: 'Native apps with React', tags: ['mobile'] },
  { id: 'android', name: 'Android SDK', glyph: 'app', category: 'sw-web', blurb: 'Native Android development', tags: ['mobile'] },
  { id: 'bootstrap', name: 'Bootstrap', glyph: 'web', category: 'sw-web', blurb: 'Responsive CSS toolkit', tags: ['css'] },

  // ── Dev Tools & Cloud ─────────────────────────────────────────────────────
  { id: 'git', name: 'Git', glyph: 'git', category: 'sw-tools', blurb: 'Version control system', tags: ['vcs'] },
  { id: 'github', name: 'GitHub', glyph: 'git', category: 'sw-tools', blurb: 'Code hosting & collaboration', tags: ['vcs', 'repo'] },
  { id: 'vscode', name: 'VS Code', glyph: 'terminal', category: 'sw-tools', blurb: 'Popular code editor', tags: ['editor', 'ide'] },
  { id: 'arduino-ide', name: 'Arduino IDE', glyph: 'terminal', category: 'sw-tools', blurb: 'Program Arduino boards', tags: ['ide', 'embedded'] },
  { id: 'platformio', name: 'PlatformIO', glyph: 'terminal', category: 'sw-tools', blurb: 'Pro embedded dev toolchain', tags: ['embedded', 'ide'] },
  { id: 'docker', name: 'Docker', glyph: 'container', category: 'sw-tools', blurb: 'Containerize apps', tags: ['container', 'devops'] },
  { id: 'linux', name: 'Linux', glyph: 'terminal', category: 'sw-tools', blurb: 'Open-source OS for servers/SBCs', tags: ['os'] },
  { id: 'aws', name: 'Cloud (AWS/GCP/Azure)', glyph: 'cloud', category: 'sw-tools', blurb: 'Hosting & cloud services', tags: ['cloud', 'hosting'] },
  { id: 'postman', name: 'Postman', glyph: 'network', category: 'sw-tools', blurb: 'API testing tool', tags: ['api', 'testing'] },
  { id: 'nodered', name: 'Node-RED', glyph: 'network', category: 'sw-tools', blurb: 'Flow-based IoT wiring', tags: ['iot', 'flow'] },
  { id: 'blynk', name: 'Blynk / IoT Dashboard', glyph: 'app', category: 'sw-tools', blurb: 'IoT app dashboards', tags: ['iot', 'dashboard'] },
  { id: 'thingspeak', name: 'ThingSpeak', glyph: 'chart', category: 'sw-tools', blurb: 'IoT data analytics cloud', tags: ['iot', 'cloud'] },

  // ── CAD / EDA / Simulation ────────────────────────────────────────────────
  { id: 'proteus', name: 'Proteus', glyph: 'display3d', category: 'sw-eda', blurb: 'Circuit simulation + PCB', tags: ['simulation', 'circuit'] },
  { id: 'fritzing', name: 'Fritzing', glyph: 'pcb', category: 'sw-eda', blurb: 'Beginner breadboard/PCB design', tags: ['pcb', 'circuit'] },
  { id: 'kicad', name: 'KiCad', glyph: 'pcb', category: 'sw-eda', blurb: 'Open-source PCB design', tags: ['pcb', 'eda'] },
  { id: 'eagle', name: 'Eagle / Altium', glyph: 'pcb', category: 'sw-eda', blurb: 'Professional PCB EDA', tags: ['pcb', 'eda'] },
  { id: 'multisim', name: 'Multisim', glyph: 'display3d', category: 'sw-eda', blurb: 'SPICE circuit simulation', tags: ['simulation', 'spice'] },
  { id: 'solidworks', name: 'SolidWorks', glyph: 'cad', category: 'sw-eda', blurb: '3D mechanical CAD', tags: ['cad', '3d'] },
  { id: 'fusion360', name: 'Fusion 360', glyph: 'cad', category: 'sw-eda', blurb: 'CAD/CAM design & CNC', tags: ['cad', '3d'] },
  { id: 'autocad', name: 'AutoCAD', glyph: 'cad', category: 'sw-eda', blurb: '2D/3D drafting', tags: ['cad', 'drafting'] },
  { id: 'blender', name: 'Blender', glyph: 'display3d', category: 'sw-eda', blurb: '3D modelling & animation', tags: ['3d', 'modeling'] },
  { id: 'simulink', name: 'Simulink', glyph: 'chart', category: 'sw-eda', blurb: 'Model-based system simulation', tags: ['simulation', 'matlab'] },
  { id: 'labview', name: 'LabVIEW', glyph: 'chart', category: 'sw-eda', blurb: 'Graphical instrumentation', tags: ['daq', 'instrumentation'] },
  { id: 'tinkercad', name: 'Tinkercad', glyph: 'display3d', category: 'sw-eda', blurb: 'Online circuits & 3D design', tags: ['simulation', 'beginner'] },
];
