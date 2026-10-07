#!/usr/bin/env node
/**
 * organize-wiring-images.mjs
 * ==========================================================================
 * Run this ON YOUR OWN PC after Google Flow has downloaded the wiring images.
 * It does THREE things, all locally (no upload, no internet):
 *
 *   1. CLASSIFY  messy Flow filenames (e.g. "Arduino_Mega_and_MPU-6050_wiring_
 *              20260909220202.jpeg") into a candidate pair key such as
 *              "arduino-mega__mpu6050.jpg" using a fuzzy board+module matcher.
 *              Candidate keys do not imply publication or electrical approval.
 *   2. COMPRESS each image (resize to <=1280px wide, JPEG quality ~72) so the
 *              repo stays small. Uses `sharp` if installed; otherwise copies
 *              the file unchanged and tells you how to enable compression.
 *   3. CANDIDATE INDEX write frontend/quality/wiring-review/candidates/manifest.json.
 *              Google-Flow/AI artwork is untrusted until a human checks the
 *              board, module, labels, wire endpoints, power, and voltage. The
 *              script never publishes candidate images to frontend/public.
 *
 * USAGE (from anywhere):
 *   node organize-wiring-images.mjs "C:\\Users\\you\\Downloads\\GoogleFlowAutomator"  "C:\\path\\to\\tu-project-archive"
 *   node organize-wiring-images.mjs  ~/Downloads/GoogleFlowAutomator            ~/tu-project-archive
 *
 *   arg1 = folder that CONTAINS the Flow images (searched recursively)
 *   arg2 = path to the project repo root (where frontend/ lives)
 *
 * OPTIONAL (better compression, ~5-10x smaller):
 *   cd tu-project-archive/frontend && npm install
 * then re-run. Without sharp the script still works (just larger files).
 *
 * SAFE TO RE-RUN: original downloads and existing review candidates are never
 * modified or deleted. New pairs are merged; duplicate renders are staged in
 * the review gallery. Any changed bytes require a fresh review/hash record.
 * ==========================================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const BOARDS = [{"id": "arduino-uno", "name": "Arduino Uno", "aliases": ["arduino uno", "uno", "uno r3"]}, {"id": "arduino-nano", "name": "Arduino Nano", "aliases": ["arduino nano", "nano"]}, {"id": "arduino-mega", "name": "Arduino Mega 2560", "aliases": ["arduino mega", "arduino mega 2560", "atmega2560", "mega", "mega 2560", "2560"]}, {"id": "esp32", "name": "ESP32", "aliases": ["esp32", "esp 32"]}, {"id": "esp8266", "name": "ESP8266", "aliases": ["esp8266", "esp 8266"]}, {"id": "esp32-cam", "name": "ESP32-CAM", "aliases": ["esp32 cam", "esp32cam", "esp 32 cam"]}, {"id": "raspberry-pi", "name": "Raspberry Pi 4", "aliases": ["raspberry pi", "raspberry pi 4", "rpi4", "rpi 4", "pi 4"]}, {"id": "raspberry-pi-pico", "name": "Raspberry Pi Pico", "aliases": ["raspberry pi pico", "rp2040", "pico"]}, {"id": "stm32", "name": "STM32 (Blue Pill)", "aliases": ["stm32", "blue pill", "stm32 blue pill", "bluepill"]}, {"id": "arduino-pro-mini", "name": "Arduino Pro Mini", "aliases": ["arduino pro mini", "pro mini", "promini"]}, {"id": "nodemcu", "name": "NodeMCU", "aliases": ["nodemcu", "node mcu", "amica", "nodemcu esp8266", "nodemcu esp8266 amica"]}, {"id": "jetson-nano", "name": "NVIDIA Jetson Nano", "aliases": ["jetson nano", "nvidia jetson nano", "jetson"]}, {"id": "orange-pi", "name": "Orange Pi", "aliases": ["orange pi", "orangepi"]}, {"id": "attiny85", "name": "ATtiny85", "aliases": ["attiny85", "attiny", "tiny85"]}, {"id": "teensy", "name": "Teensy 4.0", "aliases": ["teensy", "teensy 4 0", "teensy 4"]}, {"id": "micro-bit", "name": "micro:bit", "aliases": ["micro bit", "microbit"]}];
export const COMPONENTS = [{"id": "dht11", "name": "DHT11 / DHT22", "aliases": ["dht11", "dht22", "dht11 dht22", "humidity", "temperature", "dht", "dht sensor"]}, {"id": "ds18b20", "name": "DS18B20", "aliases": ["ds18b20", "temperature", "1 wire"]}, {"id": "lm35", "name": "LM35", "aliases": ["lm35", "temperature"]}, {"id": "hc-sr04", "name": "HC-SR04", "aliases": ["hc sr04", "ultrasonic", "distance", "hcsr04"]}, {"id": "pir", "name": "PIR Motion (HC-SR501)", "aliases": ["pir", "pir motion", "hc sr501", "pir motion hc sr501", "motion", "infrared"]}, {"id": "ldr", "name": "LDR (Photoresistor)", "aliases": ["ldr", "photoresistor", "ldr photoresistor", "light", "photo resistor"]}, {"id": "bh1750", "name": "BH1750", "aliases": ["bh1750", "light", "lux"]}, {"id": "mq2", "name": "MQ-2 Gas", "aliases": ["mq2", "mq 2 gas", "gas", "smoke", "mq 2"]}, {"id": "mq135", "name": "MQ-135 Air Quality", "aliases": ["mq135", "mq 135 air quality", "air", "gas", "mq 135"]}, {"id": "mq7", "name": "MQ-7 CO", "aliases": ["mq7", "mq 7 co", "co", "gas", "mq 7"]}, {"id": "soil-moisture", "name": "Soil Moisture", "aliases": ["soil moisture", "soil", "agriculture"]}, {"id": "rain-sensor", "name": "Rain Sensor", "aliases": ["rain sensor", "rain", "water"]}, {"id": "water-level", "name": "Water Level Sensor", "aliases": ["water level", "water level sensor", "water", "level"]}, {"id": "flow-sensor", "name": "Water Flow (YF-S201)", "aliases": ["flow sensor", "water flow", "yf s201", "water flow yf s201", "flow", "water"]}, {"id": "flame-sensor", "name": "Flame Sensor", "aliases": ["flame sensor", "fire", "flame"]}, {"id": "mpu6050", "name": "MPU-6050 IMU", "aliases": ["mpu6050", "mpu 6050 imu", "imu", "gyro", "accelerometer", "mpu 6050"]}, {"id": "hmc5883l", "name": "HMC5883L", "aliases": ["hmc5883l", "magnetometer", "compass", "hmc5883"]}, {"id": "bmp280", "name": "BMP280 / BME280", "aliases": ["bmp280", "bme280", "bmp280 bme280", "pressure", "barometer"]}, {"id": "load-cell", "name": "Load Cell + HX711", "aliases": ["load cell", "load cell hx711", "weight", "hx711"]}, {"id": "ir-sensor", "name": "IR Obstacle Sensor", "aliases": ["ir sensor", "ir obstacle sensor", "infrared", "obstacle", "ir obstacle"]}, {"id": "color-sensor", "name": "TCS3200 Color", "aliases": ["color sensor", "tcs3200 color", "color", "rgb", "tcs3200", "colour sensor"]}, {"id": "heart-rate", "name": "MAX30100 Pulse", "aliases": ["heart rate", "max30100 pulse", "pulse", "health", "spo2", "max30100"]}, {"id": "ph-sensor", "name": "pH Sensor", "aliases": ["ph sensor", "ph", "water"]}, {"id": "current-sensor", "name": "ACS712 Current", "aliases": ["current sensor", "acs712 current", "current", "acs712"]}, {"id": "voltage-sensor", "name": "Voltage Sensor", "aliases": ["voltage sensor", "voltage"]}, {"id": "ir-flame-array", "name": "Vibration (SW-420)", "aliases": ["ir flame array", "vibration", "sw 420", "vibration sw 420", "vibration sensor"]}, {"id": "lidar-sensor", "name": "LiDAR (TF-Luna)", "aliases": ["lidar sensor", "lidar", "tf luna", "lidar tf luna", "laser"]}, {"id": "dc-motor", "name": "DC Motor", "aliases": ["dc motor", "motor"]}, {"id": "servo", "name": "Servo (SG90/MG996)", "aliases": ["servo", "sg90", "mg996", "servo sg90 mg996"]}, {"id": "stepper", "name": "Stepper (28BYJ-48)", "aliases": ["stepper", "28byj 48", "stepper 28byj 48", "28byj"]}, {"id": "nema17", "name": "NEMA 17 Stepper", "aliases": ["nema17", "nema 17 stepper", "stepper", "cnc", "nema 17"]}, {"id": "l298n", "name": "L298N Driver", "aliases": ["l298n", "l298n driver", "driver", "h bridge", "l298"]}, {"id": "l293d", "name": "L293D Driver", "aliases": ["l293d", "l293d driver", "driver", "l293"]}, {"id": "a4988", "name": "A4988 Driver", "aliases": ["a4988", "a4988 driver", "stepper", "driver"]}, {"id": "relay-module", "name": "Relay Module", "aliases": ["relay module", "relay", "switch"]}, {"id": "solenoid", "name": "Solenoid Valve", "aliases": ["solenoid", "solenoid valve", "valve", "water"]}, {"id": "water-pump", "name": "Water Pump", "aliases": ["water pump", "pump", "water"]}, {"id": "servo-continuous", "name": "Continuous Servo", "aliases": ["servo continuous", "continuous servo", "servo"]}, {"id": "bldc", "name": "BLDC + ESC", "aliases": ["bldc", "bldc esc", "brushless", "drone", "esc"]}, {"id": "linear-actuator", "name": "Linear Actuator", "aliases": ["linear actuator", "linear"]}, {"id": "buzzer", "name": "Buzzer", "aliases": ["buzzer", "sound", "alarm"]}, {"id": "lcd1602", "name": "LCD 16×2", "aliases": ["lcd1602", "lcd 16 2", "lcd", "character", "lcd 16x2", "16x2"]}, {"id": "lcd2004", "name": "LCD 20×4", "aliases": ["lcd2004", "lcd 20 4", "lcd", "lcd 20x4", "20x4"]}, {"id": "oled", "name": "OLED 0.96\" (SSD1306)", "aliases": ["oled", "oled 0 96", "ssd1306", "oled 0 96 ssd1306", "0 96"]}, {"id": "tft", "name": "TFT Touch Display", "aliases": ["tft", "tft touch display", "touch", "tft touch"]}, {"id": "seven-seg", "name": "7-Segment Display", "aliases": ["seven seg", "7 segment display", "seven segment", "7 segment", "7seg"]}, {"id": "led-matrix", "name": "LED Matrix (MAX7219)", "aliases": ["led matrix", "max7219", "led matrix max7219", "matrix", "8x8"]}, {"id": "neopixel", "name": "NeoPixel (WS2812)", "aliases": ["neopixel", "ws2812", "neopixel ws2812", "rgb"]}, {"id": "epaper", "name": "E-Paper Display", "aliases": ["epaper", "e paper display", "e ink", "e paper", "eink"]}, {"id": "hc05", "name": "HC-05 Bluetooth", "aliases": ["hc05", "hc 05 bluetooth", "bluetooth", "hc 05"]}, {"id": "ble", "name": "BLE Module", "aliases": ["ble", "ble module", "bluetooth"]}, {"id": "nrf24", "name": "nRF24L01", "aliases": ["nrf24", "nrf24l01", "rf", "wireless"]}, {"id": "lora", "name": "LoRa Module", "aliases": ["lora", "lora module", "wireless"]}, {"id": "sim800", "name": "SIM800L GSM", "aliases": ["sim800", "sim800l", "sim800l gsm", "gsm", "sms"]}, {"id": "sim900", "name": "SIM900 GSM", "aliases": ["sim900", "sim900 gsm", "gsm"]}, {"id": "gps-neo6", "name": "NEO-6M GPS", "aliases": ["gps neo6", "neo 6m gps", "gps", "location", "neo 6", "neo6"]}, {"id": "rfid-rc522", "name": "RFID RC522", "aliases": ["rfid rc522", "rfid", "nfc", "rc522"]}, {"id": "fingerprint-mod", "name": "Fingerprint (R307)", "aliases": ["fingerprint mod", "fingerprint", "r307", "fingerprint r307", "biometric"]}, {"id": "ethernet-mod", "name": "Ethernet (W5100)", "aliases": ["ethernet mod", "ethernet", "w5100", "ethernet w5100", "lan"]}, {"id": "esp-now", "name": "Wi-Fi Module", "aliases": ["esp now", "wi fi module", "wifi"]}, {"id": "liion", "name": "Li-ion 18650", "aliases": ["liion", "li ion", "li ion 18650", "battery", "18650"]}, {"id": "lipo", "name": "LiPo Battery", "aliases": ["lipo", "lipo battery", "battery"]}, {"id": "tp4056", "name": "TP4056 Charger", "aliases": ["tp4056", "tp4056 charger", "charger"]}, {"id": "buck", "name": "Buck Converter (LM2596)", "aliases": ["buck", "buck converter", "lm2596", "buck converter lm2596", "dc dc", "step down"]}, {"id": "boost", "name": "Boost Converter", "aliases": ["boost", "boost converter", "dc dc", "step up"]}, {"id": "ldo", "name": "Voltage Regulator (7805)", "aliases": ["ldo", "voltage regulator", "7805", "voltage regulator 7805"]}, {"id": "ams1117", "name": "AMS1117 3.3V", "aliases": ["ams1117", "ams1117 3 3v", "ldo"]}, {"id": "solar-panel", "name": "Solar Panel", "aliases": ["solar panel", "solar", "renewable"]}, {"id": "ups-module", "name": "Power Bank / UPS", "aliases": ["ups module", "power bank", "ups", "power bank ups", "power"]}, {"id": "resistor", "name": "Resistor", "aliases": ["resistor", "ohm"]}, {"id": "capacitor", "name": "Capacitor", "aliases": ["capacitor", "farad"]}, {"id": "led", "name": "LED", "aliases": ["led", "light"]}, {"id": "diode", "name": "Diode", "aliases": ["diode", "1n4007"]}, {"id": "transistor", "name": "Transistor (BJT/MOSFET)", "aliases": ["transistor", "bjt", "mosfet", "transistor bjt mosfet"]}, {"id": "potentiometer", "name": "Potentiometer", "aliases": ["potentiometer", "pot", "variable"]}, {"id": "crystal", "name": "Crystal Oscillator", "aliases": ["crystal", "crystal oscillator", "oscillator", "clock"]}, {"id": "fuse", "name": "Fuse", "aliases": ["fuse", "protection"]}, {"id": "inductor", "name": "Inductor", "aliases": ["inductor", "coil"]}, {"id": "push-button", "name": "Push Button", "aliases": ["push button", "button"]}, {"id": "toggle-switch", "name": "Toggle Switch", "aliases": ["toggle switch", "switch"]}, {"id": "keypad", "name": "Matrix Keypad 4×4", "aliases": ["keypad", "matrix keypad 4 4"]}, {"id": "joystick", "name": "Joystick Module", "aliases": ["joystick", "joystick module"]}, {"id": "rotary-encoder", "name": "Rotary Encoder", "aliases": ["rotary encoder", "encoder"]}, {"id": "breadboard", "name": "Breadboard", "aliases": ["breadboard", "prototype"]}, {"id": "jumper-wires", "name": "Jumper Wires", "aliases": ["jumper wires", "wires", "dupont"]}, {"id": "pcb", "name": "PCB / Perfboard", "aliases": ["pcb", "perfboard", "pcb perfboard"]}, {"id": "sd-module", "name": "MicroSD Module", "aliases": ["sd module", "microsd module", "sd", "storage"]}, {"id": "rtc", "name": "RTC (DS3231)", "aliases": ["rtc", "ds3231", "rtc ds3231", "clock"]}, {"id": "speaker", "name": "Speaker / DFPlayer", "aliases": ["speaker", "dfplayer", "speaker dfplayer", "audio", "sound"]}, {"id": "usb-ttl", "name": "USB-TTL (CP2102)", "aliases": ["usb ttl", "cp2102", "usb ttl cp2102", "ftdi", "serial"]}, {"id": "plc", "name": "PLC", "aliases": ["plc", "automation"]}, {"id": "hmi", "name": "HMI Panel", "aliases": ["hmi", "hmi panel", "scada"]}, {"id": "vfd", "name": "VFD / Motor Drive", "aliases": ["vfd", "motor drive", "vfd motor drive", "inverter"]}, {"id": "contactor", "name": "Contactor", "aliases": ["contactor"]}, {"id": "proximity", "name": "Proximity Switch", "aliases": ["proximity", "proximity switch"]}, {"id": "industrial-encoder", "name": "Industrial Encoder", "aliases": ["industrial encoder", "encoder"]}, {"id": "scada", "name": "SCADA Gateway", "aliases": ["scada", "scada gateway", "modbus"]}, {"id": "sensor-industrial", "name": "Industrial Sensor", "aliases": ["sensor industrial", "industrial sensor", "4 20ma"]}, {"id": "robot-arm", "name": "Robotic Arm", "aliases": ["robot arm", "robotic arm", "arm", "manipulator"]}, {"id": "gripper", "name": "Gripper", "aliases": ["gripper", "claw"]}, {"id": "robot-wheel", "name": "Robot Wheel + Motor", "aliases": ["robot wheel", "robot wheel motor", "wheel", "chassis"]}, {"id": "imu-robot", "name": "IMU / Balance", "aliases": ["imu robot", "imu", "balance", "imu balance"]}, {"id": "lidar-robot", "name": "LiDAR Scanner", "aliases": ["lidar robot", "lidar scanner", "slam", "lidar"]}, {"id": "depth-cam", "name": "Depth Camera", "aliases": ["depth cam", "depth camera", "depth", "vision"]}, {"id": "python", "name": "Python", "aliases": ["python", "language"]}, {"id": "cpp", "name": "C / C++", "aliases": ["cpp", "c", "c c", "language", "arduino"]}, {"id": "java", "name": "Java", "aliases": ["java", "language"]}, {"id": "javascript", "name": "JavaScript", "aliases": ["javascript", "language", "js"]}, {"id": "typescript", "name": "TypeScript", "aliases": ["typescript", "language", "ts"]}, {"id": "csharp", "name": "C#", "aliases": ["csharp", "c", "language", "dotnet"]}, {"id": "php", "name": "PHP", "aliases": ["php", "language"]}, {"id": "dart", "name": "Dart", "aliases": ["dart", "language", "flutter"]}, {"id": "kotlin", "name": "Kotlin", "aliases": ["kotlin", "language", "android"]}, {"id": "matlab", "name": "MATLAB", "aliases": ["matlab", "simulation", "dsp"]}, {"id": "tensorflow", "name": "TensorFlow", "aliases": ["tensorflow", "ml", "deep learning"]}, {"id": "pytorch", "name": "PyTorch", "aliases": ["pytorch", "ml", "deep learning"]}, {"id": "keras", "name": "Keras", "aliases": ["keras", "ml"]}, {"id": "scikit", "name": "scikit-learn", "aliases": ["scikit", "scikit learn", "ml"]}, {"id": "opencv", "name": "OpenCV", "aliases": ["opencv", "vision", "image"]}, {"id": "yolo", "name": "YOLO", "aliases": ["yolo", "detection", "vision"]}, {"id": "mediapipe", "name": "MediaPipe", "aliases": ["mediapipe", "vision", "hands", "pose"]}, {"id": "tflite", "name": "TensorFlow Lite", "aliases": ["tflite", "tensorflow lite", "edge", "tinyml"]}, {"id": "huggingface", "name": "Transformers / LLMs", "aliases": ["huggingface", "transformers", "llms", "transformers llms", "nlp", "llm"]}, {"id": "pandas", "name": "Pandas / NumPy", "aliases": ["pandas", "numpy", "pandas numpy", "data", "analysis"]}, {"id": "mysql", "name": "MySQL", "aliases": ["mysql", "sql", "database"]}, {"id": "postgres", "name": "PostgreSQL", "aliases": ["postgres", "postgresql", "sql", "database"]}, {"id": "sqlite", "name": "SQLite", "aliases": ["sqlite", "sql", "database"]}, {"id": "mongodb", "name": "MongoDB", "aliases": ["mongodb", "nosql", "database"]}, {"id": "firebase", "name": "Firebase", "aliases": ["firebase", "baas", "realtime"]}, {"id": "redis", "name": "Redis", "aliases": ["redis", "cache"]}, {"id": "nodejs", "name": "Node.js", "aliases": ["nodejs", "node js", "backend"]}, {"id": "express", "name": "Express", "aliases": ["express", "backend", "api"]}, {"id": "django", "name": "Django", "aliases": ["django", "backend", "python"]}, {"id": "flask", "name": "Flask", "aliases": ["flask", "backend", "python", "api"]}, {"id": "laravel", "name": "Laravel", "aliases": ["laravel", "backend", "php"]}, {"id": "spring", "name": "Spring Boot", "aliases": ["spring", "spring boot", "backend", "java"]}, {"id": "mqtt", "name": "MQTT", "aliases": ["mqtt", "iot", "broker"]}, {"id": "react", "name": "React", "aliases": ["react", "frontend", "ui"]}, {"id": "nextjs", "name": "Next.js", "aliases": ["nextjs", "next js", "frontend", "ssr"]}, {"id": "vue", "name": "Vue.js", "aliases": ["vue", "vue js", "frontend"]}, {"id": "angular", "name": "Angular", "aliases": ["angular", "frontend"]}, {"id": "tailwind", "name": "Tailwind CSS", "aliases": ["tailwind", "tailwind css", "css", "styling"]}, {"id": "flutter", "name": "Flutter", "aliases": ["flutter", "mobile", "dart"]}, {"id": "react-native", "name": "React Native", "aliases": ["react native", "mobile"]}, {"id": "android", "name": "Android SDK", "aliases": ["android", "android sdk", "mobile"]}, {"id": "bootstrap", "name": "Bootstrap", "aliases": ["bootstrap", "css"]}, {"id": "git", "name": "Git", "aliases": ["git", "vcs"]}, {"id": "github", "name": "GitHub", "aliases": ["github", "vcs", "repo"]}, {"id": "vscode", "name": "VS Code", "aliases": ["vscode", "vs code", "editor", "ide"]}, {"id": "arduino-ide", "name": "Arduino IDE", "aliases": ["arduino ide", "ide", "embedded"]}, {"id": "platformio", "name": "PlatformIO", "aliases": ["platformio", "embedded", "ide"]}, {"id": "docker", "name": "Docker", "aliases": ["docker", "container", "devops"]}, {"id": "linux", "name": "Linux", "aliases": ["linux", "os"]}, {"id": "aws", "name": "Cloud (AWS/GCP/Azure)", "aliases": ["aws", "cloud", "gcp", "azure", "cloud aws gcp azure", "hosting"]}, {"id": "postman", "name": "Postman", "aliases": ["postman", "api", "testing"]}, {"id": "nodered", "name": "Node-RED", "aliases": ["nodered", "node red", "iot", "flow"]}, {"id": "blynk", "name": "Blynk / IoT Dashboard", "aliases": ["blynk", "iot dashboard", "blynk iot dashboard", "iot", "dashboard"]}, {"id": "thingspeak", "name": "ThingSpeak", "aliases": ["thingspeak", "iot", "cloud"]}, {"id": "proteus", "name": "Proteus", "aliases": ["proteus", "simulation", "circuit"]}, {"id": "fritzing", "name": "Fritzing", "aliases": ["fritzing", "pcb", "circuit"]}, {"id": "kicad", "name": "KiCad", "aliases": ["kicad", "pcb", "eda"]}, {"id": "eagle", "name": "Eagle / Altium", "aliases": ["eagle", "altium", "eagle altium", "pcb", "eda"]}, {"id": "multisim", "name": "Multisim", "aliases": ["multisim", "simulation", "spice"]}, {"id": "solidworks", "name": "SolidWorks", "aliases": ["solidworks", "cad", "3d"]}, {"id": "fusion360", "name": "Fusion 360", "aliases": ["fusion360", "fusion 360", "cad", "3d"]}, {"id": "autocad", "name": "AutoCAD", "aliases": ["autocad", "cad", "drafting"]}, {"id": "blender", "name": "Blender", "aliases": ["blender", "3d", "modeling"]}, {"id": "simulink", "name": "Simulink", "aliases": ["simulink", "simulation", "matlab"]}, {"id": "labview", "name": "LabVIEW", "aliases": ["labview", "daq", "instrumentation"]}, {"id": "tinkercad", "name": "Tinkercad", "aliases": ["tinkercad", "simulation", "beginner"]}];

// ---------------------------------------------------------------------------
// Matching helpers
// ---------------------------------------------------------------------------
export const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

export function candidateOutputDirectory(repoRoot) {
  return path.resolve(repoRoot, 'frontend', 'quality', 'wiring-review', 'candidates');
}

/** Score how well an alias list matches a normalized filename. Longer alias
 *  hits score higher so "esp32 cam" beats "esp32", "mq135" beats generic. */
function bestMatch(nameNorm, table) {
  let best = null;
  let bestScore = 0;
  for (const entry of table) {
    for (const alias of entry.aliases) {
      if (!alias) continue;
      // word-boundary-ish containment on the spaced, normalized string
      const padded = ` ${nameNorm} `;
      const needle = ` ${alias} `;
      if (padded.includes(needle)) {
        const score = alias.length + alias.split(' ').length * 2;
        if (score > bestScore) {
          bestScore = score;
          best = entry;
        }
      }
    }
  }
  return best ? { id: best.id, score: bestScore } : null;
}

// Bare board words that Flow sometimes emits without the full model. We only
// map the ones that have an UNAMBIGUOUS canonical default — "Arduino" on its
// own overwhelmingly means the Uno (the reference board). We deliberately do
// NOT guess a board for generic words like "microcontroller"/"hardware":
// those carry no board identity, so mislabelling them would be dishonest and
// the site's auto-drawn Fritzing fallback covers them accurately anyway.
const BARE_BOARD_DEFAULTS = [
  { needle: ' arduino ', id: 'arduino-uno' },
];

export function classify(filenameNorm) {
  let board = bestMatch(filenameNorm, BOARDS);
  let bareWord = null;
  if (!board) {
    const padded = ` ${filenameNorm} `;
    const bare = BARE_BOARD_DEFAULTS.find((b) => padded.includes(b.needle));
    if (bare) {
      board = { id: bare.id, score: 1 };
      bareWord = bare.needle.trim(); // e.g. "arduino" — must also be stripped
    }
  }
  if (!board) return { ok: false, reason: 'no board matched' };
  // Remove the matched board words so the component matcher isn't fooled by
  // the board name (e.g. bare "arduino" also being an alias of the C/C++ tag).
  const boardEntry = BOARDS.find((b) => b.id === board.id);
  const removeWords = [...boardEntry.aliases];
  if (bareWord) removeWords.push(bareWord);
  let rest = ` ${filenameNorm} `;
  for (const a of removeWords.sort((x, y) => y.length - x.length)) {
    rest = rest.split(` ${a} `).join(' ');
  }
  rest = rest.trim();
  // Only match the module against the board-stripped remainder. The old
  // `|| bestMatch(filenameNorm, ...)` fallback re-scanned the FULL name and
  // let a leftover board word (e.g. bare "arduino") match the C/C++ tag,
  // mislabelling generic "Arduino_wiring_diagram_for_sensor" as a real pair.
  // A generic file with no identifiable module must stay honestly unmatched.
  const comp = bestMatch(rest, COMPONENTS);
  if (!comp) return { ok: false, reason: 'no module matched', board: board.id };
  return { ok: true, board: board.id, component: comp.id };
}

// ---------------------------------------------------------------------------
// File walking
// ---------------------------------------------------------------------------
const IMG_RE = /\.(jpe?g|png|webp)$/i;
function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (IMG_RE.test(name)) out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Optional sharp compression
// ---------------------------------------------------------------------------
let sharp = null;
async function loadSharp() {
  try {
    sharp = (await import('sharp')).default;
    return true;
  } catch {
    return false;
  }
}

async function processImage(srcPath, destPath) {
  if (sharp) {
    await sharp(srcPath)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(destPath);
  } else {
    fs.copyFileSync(srcPath, destPath); // no compression available
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const [, , inDir, repoRoot] = process.argv;
  if (!inDir || !repoRoot) {
    console.error('\nUsage: node organize-wiring-images.mjs <flow-images-folder> <repo-root>\n');
    process.exit(1);
  }
  if (!fs.existsSync(inDir)) {
    console.error('Input folder not found:', inDir);
    process.exit(1);
  }
  const projectRoot = path.resolve(repoRoot);
  const outDir = candidateOutputDirectory(projectRoot);
  fs.mkdirSync(outDir, { recursive: true });
  // Keep every candidate (including duplicates and unmatched renders) in the
  // non-public review area. Existing review material must never be deleted.
  const galleryDir = path.join(outDir, 'gallery');
  fs.mkdirSync(galleryDir, { recursive: true });
  const manifestPath = path.join(outDir, 'manifest.json');
  const galleryPath = path.join(outDir, 'gallery.json');
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
  const gallery = fs.existsSync(galleryPath) ? JSON.parse(fs.readFileSync(galleryPath, 'utf8')) : [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || !Array.isArray(gallery)) {
    throw new Error('Existing candidate indexes have an invalid format; refusing to overwrite them.');
  }

  const hasSharp = await loadSharp();
  console.log(hasSharp
    ? '✓ sharp found — images will be compressed.\n'
    : '! sharp NOT installed — copying at full size.\n  For smaller files: cd frontend && npm install, then re-run.\n');

  const files = walk(inDir);
  console.log(`Found ${files.length} image(s) in input folder.\n`);

  const unmatched = [];
  const seen = new Set(
    Object.entries(manifest).flatMap(([board, components]) => Object.keys(components ?? {}).map((component) => `${board}__${component}`)),
  );
  let done = 0;
  let dupes = 0;
  let galleryCount = 0;
  const uniqueGalleryName = (prefix, extension) => {
    let name;
    do {
      name = `${prefix}-${++galleryCount}${extension}`;
    } while (fs.existsSync(path.join(galleryDir, name)));
    return name;
  };

  // Newest files first to choose the first candidate deterministically; this is
  // not an electrical-quality judgment, and duplicates remain in the review gallery.
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  for (const f of files) {
    const base = path.basename(f).replace(IMG_RE, '');
    const res = classify(norm(base));

    if (res.ok) {
      const key = `${res.board}__${res.component}`;
      const outputExtension = sharp ? '.jpg' : path.extname(f).toLowerCase();
      const outName = `${key}${outputExtension}`;
      const outPath = path.join(outDir, outName);
      if (!seen.has(key) && !fs.existsSync(outPath)) {
        seen.add(key);
        await processImage(f, outPath);
        (manifest[res.board] ||= {})[res.component] = outName;
        done++;
        if (done % 25 === 0) console.log(`  …processed ${done}`);
        continue;
      }
      // Existing or duplicate pair: preserve this rendition as another
      // quarantined candidate instead of silently replacing the reviewed bytes.
      seen.add(key);
      dupes++;
      const gName = uniqueGalleryName(`${res.board}__extra`, outputExtension);
      await processImage(f, path.join(galleryDir, gName));
      gallery.push({ file: `gallery/${gName}`, board: res.board });
      continue;
    }

    // Couldn't identify a clean pair. Still keep the image: put it in the
    // gallery, grouped under the board when we at least recognised that much,
    // otherwise under "other".
    const board = res.board || null;
    const outputExtension = sharp ? '.jpg' : path.extname(f).toLowerCase();
    const gName = uniqueGalleryName(`${board || 'other'}__g`, outputExtension);
    await processImage(f, path.join(galleryDir, gName));
    gallery.push({ file: `gallery/${gName}`, board });
    unmatched.push({ file: path.basename(f), reason: res.reason });
  }

  // Merge stable indexes without deleting prior quarantined candidates.
  const sortedManifest = {};
  for (const board of Object.keys(manifest).sort()) {
    sortedManifest[board] = {};
    for (const component of Object.keys(manifest[board]).sort()) sortedManifest[board][component] = manifest[board][component];
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(sortedManifest, null, 2)}\n`);
  fs.writeFileSync(galleryPath, `${JSON.stringify(gallery, null, 2)}\n`);


  // Write a report of anything we couldn't place
  const reportPath = path.join(outDir, 'unmatched-report.txt');
  fs.writeFileSync(
    reportPath,
    unmatched.length
      ? unmatched.map((u) => `${u.file}\t(${u.reason})`).join('\n') + '\n'
      : 'All files matched. 🎉\n',
  );

  console.log('\n==========================================================');
  const registerScript = path.join(projectRoot, 'frontend', 'scripts', 'register-wiring-candidates.mjs');
  const registration = spawnSync(process.execPath, [registerScript, projectRoot], { cwd: path.join(projectRoot, 'frontend'), encoding: 'utf8' });
  process.stdout.write(registration.stdout ?? '');
  process.stderr.write(registration.stderr ?? '');
  if (registration.error) throw registration.error;
  if (registration.status !== 0) throw new Error('Candidate registration failed; staged images remain quarantined and must be registered before the quality gate can pass.');

  console.log(`Input files:            ${files.length}`);
  console.log(`✓ Candidate pairs indexed: ${done}  (${Object.keys(manifest).length} boards)`);
  console.log(`• Extra candidate images: ${dupes + unmatched.length}`);
  console.log(`  Output folder:  ${outDir}`);
  console.log(`  Manifest:       ${manifestPath}`);
  if (unmatched.length) {
    console.log(`! ${unmatched.length} file(s) could not be matched — see ${reportPath}`);
    console.log('  (usually a Flow title that was truncated/generic; rename by hand or tell the assistant.)');
  } else {
    console.log('✓ Every matchable file placed.');
  }
  console.log(`Sanity: ${done} kept + ${dupes} dupes + ${unmatched.length} unmatched = ${done + dupes + unmatched.length} (should equal input ${files.length}).`);
  console.log('==========================================================\n');
  console.log('Next: review each candidate against its exact hardware and source datasheet before any promotion.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
