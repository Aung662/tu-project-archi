/**
 * Real product photos for toolkit components.
 *
 * Maps a component `id` (see components.ts) → a photo file served from
 * `/components/<file>` (frontend/public/components). ONLY ids present here get a
 * photo; every other component gracefully falls back to its brand-neutral SVG
 * glyph. That keeps the grid complete and the design intact even while photos
 * are still being added batch by batch.
 *
 * NOTE: these are real product images sourced from the web and may carry the
 * manufacturer's copyright/trademark — fine for an educational reference, but
 * review before any commercial redistribution.
 */
export const COMPONENT_PHOTOS: Record<string, string> = {
  // Boards & MCUs
  'arduino-uno': '/components/arduino-uno.jpg',
  'arduino-nano': '/components/arduino-nano.jpg',
  esp32: '/components/esp32.jpg',
  esp8266: '/components/esp8266.jpg',
  'esp32-cam': '/components/esp32-cam.jpg',
  nodemcu: '/components/nodemcu.jpg',
  'raspberry-pi': '/components/raspberry-pi.jpg',
  'raspberry-pi-pico': '/components/raspberry-pi-pico.jpg',
  stm32: '/components/stm32.jpg',
  // Sensors
  dht11: '/components/dht11.jpg',
  'hc-sr04': '/components/hc-sr04.jpg',
  pir: '/components/pir.jpg',
  mpu6050: '/components/mpu6050.jpg',
  'soil-moisture': '/components/soil-moisture.jpg',
  mq2: '/components/mq2.jpg',
  ds18b20: '/components/ds18b20.jpg',
  // Actuators & Motors
  servo: '/components/servo.jpg',
  'relay-module': '/components/relay-module.jpg',
  l298n: '/components/l298n.jpg',
  stepper: '/components/stepper.jpg',
  'dc-motor': '/components/dc-motor.jpg',
  // Displays
  lcd1602: '/components/lcd1602.jpg',
  oled: '/components/oled.jpg',
  'seven-seg': '/components/seven-seg.jpg',
  // Connectivity
  hc05: '/components/hc05.jpg',
  'gps-neo6': '/components/gps-neo6.jpg',
  'rfid-rc522': '/components/rfid-rc522.jpg',
  sim800: '/components/sim800.jpg',
  // Power
  liion: '/components/liion.jpg',
  buck: '/components/buck.jpg',
  'solar-panel': '/components/solar-panel.jpg',
  // Passives & I/O
  'push-button': '/components/push-button.jpg',
  potentiometer: '/components/potentiometer.jpg',
  led: '/components/led.jpg',
  buzzer: '/components/buzzer.jpg',
  breadboard: '/components/breadboard.jpg',
  resistor: '/components/resistor.jpg',
  keypad: '/components/keypad.jpg',
  joystick: '/components/joystick.jpg',
  // Modules
  rtc: '/components/rtc.jpg',
  'sd-module': '/components/sd-module.jpg',
  // Boards (more)
  'arduino-mega': '/components/arduino-mega.jpg',
  // Sensors (more)
  lm35: '/components/lm35.jpg',
  ldr: '/components/ldr.jpg',
  bmp280: '/components/bmp280.jpg',
  'ir-sensor': '/components/ir-sensor.jpg',
  // Actuators (more)
  nema17: '/components/nema17.jpg',
  // Displays (more)
  tft: '/components/tft.jpg',
  neopixel: '/components/neopixel.jpg',
  // Connectivity (more)
  lora: '/components/lora.jpg',
  // Power (more)
  tp4056: '/components/tp4056.jpg',
  // Boards (batch 6)
  'jetson-nano': '/components/jetson-nano.jpg',
  'micro-bit': '/components/micro-bit.jpg',
  // Sensors (batch 6)
  mq135: '/components/mq135.jpg',
  'rain-sensor': '/components/rain-sensor.jpg',
  'flame-sensor': '/components/flame-sensor.jpg',
  'load-cell': '/components/load-cell.jpg',
  // Actuators (batch 6)
  'water-pump': '/components/water-pump.jpg',
  a4988: '/components/a4988.jpg',
  // Connectivity (batch 6)
  nrf24: '/components/nrf24.jpg',
  'fingerprint-mod': '/components/fingerprint-mod.jpg',
  // Sensors (batch 7)
  bh1750: '/components/bh1750.jpg',
  'water-level': '/components/water-level.jpg',
  'flow-sensor': '/components/flow-sensor.jpg',
  hmc5883l: '/components/hmc5883l.jpg',
  'color-sensor': '/components/color-sensor.jpg',
  'heart-rate': '/components/heart-rate.jpg',
  'current-sensor': '/components/current-sensor.jpg',
  // Actuators (batch 7)
  l293d: '/components/l293d.jpg',
  // Displays (batch 7)
  lcd2004: '/components/lcd2004.jpg',
  'led-matrix': '/components/led-matrix.jpg',
  // Passives & basics (batch 8)
  capacitor: '/components/capacitor.jpg',
  diode: '/components/diode.jpg',
  transistor: '/components/transistor.jpg',
  crystal: '/components/crystal.jpg',
  fuse: '/components/fuse.jpg',
  inductor: '/components/inductor.jpg',
  'toggle-switch': '/components/toggle-switch.jpg',
  'rotary-encoder': '/components/rotary-encoder.jpg',
  speaker: '/components/speaker.jpg',
  'usb-ttl': '/components/usb-ttl.jpg',
  // Power (batch 9)
  lipo: '/components/lipo.jpg',
  boost: '/components/boost.jpg',
  ldo: '/components/ldo.jpg',
  ams1117: '/components/ams1117.jpg',
  'ups-module': '/components/ups-module.jpg',
  // Actuators (batch 9)
  solenoid: '/components/solenoid.jpg',
  'servo-continuous': '/components/servo-continuous.jpg',
  bldc: '/components/bldc.jpg',
  'linear-actuator': '/components/linear-actuator.jpg',
  // Industrial (batch 9)
  plc: '/components/plc.jpg',
  // Sensors (batch 10)
  mq7: '/components/mq7.jpg',
  'ph-sensor': '/components/ph-sensor.jpg',
  'voltage-sensor': '/components/voltage-sensor.jpg',
  'lidar-sensor': '/components/lidar-sensor.jpg',
  // Robotics (batch 10)
  'robot-arm': '/components/robot-arm.jpg',
  gripper: '/components/gripper.jpg',
  'robot-wheel': '/components/robot-wheel.jpg',
  'imu-robot': '/components/imu-robot.jpg',
  'lidar-robot': '/components/lidar-robot.jpg',
  'depth-cam': '/components/depth-cam.jpg',
  // Boards (batch 11)
  'arduino-pro-mini': '/components/arduino-pro-mini.jpg',
  'orange-pi': '/components/orange-pi.jpg',
  attiny85: '/components/attiny85.jpg',
  teensy: '/components/teensy.jpg',
  // Industrial (batch 11)
  hmi: '/components/hmi.jpg',
  vfd: '/components/vfd.jpg',
  contactor: '/components/contactor.jpg',
  proximity: '/components/proximity.jpg',
  'industrial-encoder': '/components/industrial-encoder.jpg',
  scada: '/components/scada.jpg',
  // Batch 12 — remaining hardware (hardware now 100% photographed)
  'ir-flame-array': '/components/ir-flame-array.jpg',
  epaper: '/components/epaper.jpg',
  ble: '/components/ble.jpg',
  sim900: '/components/sim900.jpg',
  'ethernet-mod': '/components/ethernet-mod.jpg',
  'esp-now': '/components/esp-now.jpg',
  'jumper-wires': '/components/jumper-wires.jpg',
  pcb: '/components/pcb.jpg',
  'sensor-industrial': '/components/sensor-industrial.jpg',
  // Software — Languages (batch 13)
  python: '/components/python.jpg',
  cpp: '/components/cpp.jpg',
  java: '/components/java.jpg',
  javascript: '/components/javascript.jpg',
  typescript: '/components/typescript.jpg',
  csharp: '/components/csharp.jpg',
  php: '/components/php.jpg',
  dart: '/components/dart.jpg',
  kotlin: '/components/kotlin.jpg',
  matlab: '/components/matlab.jpg',
  // Software — AI/ML (batch 14)
  tensorflow: '/components/tensorflow.jpg',
  pytorch: '/components/pytorch.jpg',
  keras: '/components/keras.jpg',
  scikit: '/components/scikit.jpg',
  opencv: '/components/opencv.jpg',
  yolo: '/components/yolo.jpg',
  mediapipe: '/components/mediapipe.jpg',
  tflite: '/components/tflite.jpg',
  huggingface: '/components/huggingface.jpg',
  pandas: '/components/pandas.jpg',
  // Software — Data & Backend (batch 15)
  mysql: '/components/mysql.jpg',
  postgres: '/components/postgres.jpg',
  sqlite: '/components/sqlite.jpg',
  mongodb: '/components/mongodb.jpg',
  firebase: '/components/firebase.jpg',
  redis: '/components/redis.jpg',
  nodejs: '/components/nodejs.jpg',
  express: '/components/express.jpg',
  django: '/components/django.jpg',
  flask: '/components/flask.jpg',
  // Software — Data/Backend (batch 16)
  laravel: '/components/laravel.jpg',
  spring: '/components/spring.jpg',
  mqtt: '/components/mqtt.jpg',
  // Software — Web & Mobile (batch 16)
  react: '/components/react.jpg',
  nextjs: '/components/nextjs.jpg',
  vue: '/components/vue.jpg',
  angular: '/components/angular.jpg',
  tailwind: '/components/tailwind.jpg',
  'react-native': '/components/react-native.jpg',
  flutter: '/components/flutter.jpg',
  android: '/components/android.jpg',
  bootstrap: '/components/bootstrap.jpg',
  // Software — Dev Tools & Cloud (batch 17)
  git: '/components/git.jpg',
  github: '/components/github.jpg',
  'arduino-ide': '/components/arduino-ide.jpg',
  platformio: '/components/platformio.jpg',
  docker: '/components/docker.jpg',
  linux: '/components/linux.jpg',
  // Software — Dev Tools & Cloud (batch 18)
  vscode: '/components/vscode.jpg',
  aws: '/components/aws.jpg',
  postman: '/components/postman.jpg',
  nodered: '/components/nodered.jpg',
  blynk: '/components/blynk.jpg',
  thingspeak: '/components/thingspeak.jpg',
  // Software — CAD / EDA / Sim (batch 18)
  proteus: '/components/proteus.jpg',
  fritzing: '/components/fritzing.jpg',
  kicad: '/components/kicad.jpg',
  eagle: '/components/eagle.jpg',
  // Software — CAD / EDA / Sim (batch 19 — catalogue now 100% covered)
  multisim: '/components/multisim.jpg',
  solidworks: '/components/solidworks.jpg',
  fusion360: '/components/fusion360.jpg',
  autocad: '/components/autocad.jpg',
  blender: '/components/blender.jpg',
  simulink: '/components/simulink.jpg',
  labview: '/components/labview.jpg',
  tinkercad: '/components/tinkercad.jpg',
};

export function photoFor(id: string): string | null {
  return COMPONENT_PHOTOS[id] ?? null;
}
