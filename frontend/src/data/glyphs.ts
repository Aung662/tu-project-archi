/**
 * Reusable inline-SVG glyph library for the Components Toolkit.
 *
 * Each entry is the INNER markup of a 48×48 (`viewBox="0 0 48 48"`) icon. Shapes
 * are drawn with `stroke="currentColor"` / `fill` set to `currentColor` where a
 * solid is wanted, so a single glyph can be tinted any accent colour by the tile
 * that renders it. Kept brand-neutral and original (no copyrighted logos) so the
 * icons are safe to ship and to let students download.
 *
 * Everything here is a plain string so the very same markup can be (a) rendered
 * on the page and (b) serialized into a standalone downloadable .svg / .png.
 */

export type GlyphKey =
  | 'board' | 'chip' | 'cpu' | 'sbc' | 'sensor' | 'motion' | 'temp' | 'light'
  | 'distance' | 'gas' | 'water' | 'rfid' | 'fingerprint' | 'camera' | 'gps'
  | 'current' | 'motor' | 'servo' | 'stepper' | 'relay' | 'pump' | 'lcd'
  | 'oled' | 'sevenseg' | 'ledmatrix' | 'epaper' | 'bluetooth' | 'wifi'
  | 'antenna' | 'gsm' | 'ethernet' | 'battery' | 'solar' | 'regulator'
  | 'buck' | 'resistor' | 'capacitor' | 'led' | 'diode' | 'transistor'
  | 'pot' | 'button' | 'switch' | 'buzzer' | 'breadboard' | 'wires' | 'pcb'
  | 'fuse' | 'crystal' | 'plc' | 'hmi' | 'drive' | 'encoder' | 'lidar'
  | 'robotarm' | 'wheel' | 'gripper' | 'code' | 'database' | 'cloud' | 'ai'
  | 'vision' | 'chart' | 'git' | 'container' | 'terminal' | 'app' | 'web'
  | 'gear' | 'cad' | 'server' | 'keypad' | 'joystick' | 'speaker' | 'heart'
  | 'compass' | 'flame' | 'rain' | 'soil' | 'scale' | 'clock' | 'sdcard'
  | 'usb' | 'display3d' | 'network' | 'lock' | 'leaf';

const S = 'stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const F = 'fill="currentColor"';

/** key → inner SVG markup (rendered inside a 48×48 viewBox). */
export const GLYPHS: Record<GlyphKey, string> = {
  board: `<rect x="8" y="12" width="32" height="24" rx="2" ${S}/><rect x="20" y="20" width="8" height="8" rx="1" ${S}/><path d="M8 18h3M8 24h3M8 30h3M37 18h3M37 24h3M37 30h3" ${S}/>`,
  chip: `<rect x="14" y="14" width="20" height="20" rx="2" ${S}/><path d="M18 14v-4M24 14v-4M30 14v-4M18 34v4M24 34v4M30 34v4M14 18h-4M14 24h-4M14 30h-4M34 18h4M34 24h4M34 30h4" ${S}/>`,
  cpu: `<rect x="12" y="12" width="24" height="24" rx="2" ${S}/><rect x="19" y="19" width="10" height="10" rx="1" ${S}/><path d="M17 12v-3M24 12v-3M31 12v-3M17 36v3M24 36v3M31 36v3M12 17h-3M12 24h-3M12 31h-3M36 17h3M36 24h3M36 31h3" ${S}/>`,
  sbc: `<rect x="7" y="14" width="34" height="22" rx="2" ${S}/><rect x="11" y="19" width="9" height="7" rx="1" ${S}/><rect x="30" y="12" width="8" height="4" rx="1" ${S}/><path d="M24 30h10" ${S}/>`,
  sensor: `<rect x="10" y="14" width="28" height="20" rx="3" ${S}/><circle cx="20" cy="24" r="5" ${S}/><circle cx="32" cy="20" r="1.6" ${F}/>`,
  motion: `<circle cx="18" cy="24" r="5" ${S}/><path d="M28 16c3 3 3 13 0 16M33 12c5 6 5 18 0 24" ${S}/>`,
  temp: `<path d="M24 8a4 4 0 0 1 4 4v14a7 7 0 1 1-8 0V12a4 4 0 0 1 4-4Z" ${S}/><path d="M24 20v9" ${S}/><circle cx="24" cy="33" r="2.5" ${F}/>`,
  light: `<circle cx="24" cy="22" r="7" ${S}/><path d="M24 8v-2M24 40v-2M10 22H8M40 22h-2M14 12l-1.5-1.5M35.5 33.5 34 32M34 12l1.5-1.5M12.5 33.5 14 32" ${S}/>`,
  distance: `<rect x="8" y="18" width="10" height="12" rx="2" ${S}/><path d="M22 16c4 4 4 16 0 20M27 12c7 6 7 22 0 28M32 8c10 8 10 28 0 36" ${S}/>`,
  gas: `<circle cx="18" cy="20" r="4" ${S}/><circle cx="30" cy="18" r="3" ${S}/><circle cx="26" cy="30" r="5" ${S}/><path d="M21 22l2 4M28 21l-1 5" ${S}/>`,
  water: `<path d="M24 8s10 12 10 20a10 10 0 1 1-20 0C14 20 24 8 24 8Z" ${S}/><path d="M19 28a5 5 0 0 0 5 5" ${S}/>`,
  rfid: `<rect x="9" y="14" width="20" height="20" rx="2" ${S}/><circle cx="16" cy="24" r="2" ${F}/><path d="M33 18c3 3 3 9 0 12M37 15c5 5 5 13 0 18" ${S}/>`,
  fingerprint: `<path d="M18 30c-1-4-1-8 2-11a8 8 0 0 1 12 3" ${S}/><path d="M22 32c-1-4 0-7 2-9a4 4 0 0 1 6 2" ${S}/><path d="M26 33c0-3 0-5 1-6" ${S}/><path d="M14 24a12 12 0 0 1 20-6" ${S}/>`,
  camera: `<rect x="8" y="16" width="32" height="20" rx="3" ${S}/><path d="M18 16l3-4h6l3 4" ${S}/><circle cx="24" cy="26" r="6" ${S}/>`,
  gps: `<path d="M24 42s12-11 12-22a12 12 0 1 0-24 0c0 11 12 22 12 22Z" ${S}/><circle cx="24" cy="20" r="4.5" ${S}/>`,
  current: `<path d="M8 24h8l4-10 8 20 4-10h8" ${S}/>`,
  motor: `<circle cx="24" cy="24" r="12" ${S}/><path d="M24 17v14M18 21l12 6M30 21l-12 6" ${S}/>`,
  servo: `<rect x="12" y="18" width="16" height="18" rx="2" ${S}/><circle cx="20" cy="18" r="3" ${S}/><path d="M20 18l14-6" ${S}/><circle cx="34" cy="12" r="2" ${F}/>`,
  stepper: `<circle cx="24" cy="24" r="10" ${S}/><path d="M24 12v-4M24 40v-4M12 24H8M40 24h-4M15 15l-3-3M36 36l-3-3M33 15l3-3M12 36l3-3" ${S}/><circle cx="24" cy="24" r="3" ${F}/>`,
  relay: `<rect x="9" y="14" width="30" height="20" rx="2" ${S}/><path d="M15 28l6-10M21 18h6" ${S}/><circle cx="15" cy="28" r="1.6" ${F}/><circle cx="30" cy="20" r="1.6" ${F}/>`,
  pump: `<circle cx="22" cy="24" r="10" ${S}/><path d="M22 24l6-6M22 24l6 6M22 24l-8 0" ${S}/><path d="M32 20h6v8h-6" ${S}/>`,
  lcd: `<rect x="8" y="12" width="32" height="24" rx="2" ${S}/><path d="M13 20h22M13 26h16" ${S}/>`,
  oled: `<rect x="12" y="14" width="24" height="20" rx="2" ${S}/><path d="M16 22h9M16 27h14" ${S}/>`,
  sevenseg: `<path d="M18 12h10M18 24h10M18 36h10M17 13v9M17 26v9M29 13v9M29 26v9" ${S}/>`,
  ledmatrix: `<rect x="10" y="10" width="28" height="28" rx="2" ${S}/><g ${F}><circle cx="17" cy="17" r="1.6"/><circle cx="24" cy="17" r="1.6"/><circle cx="31" cy="17" r="1.6"/><circle cx="17" cy="24" r="1.6"/><circle cx="24" cy="24" r="1.6"/><circle cx="31" cy="24" r="1.6"/><circle cx="17" cy="31" r="1.6"/><circle cx="24" cy="31" r="1.6"/><circle cx="31" cy="31" r="1.6"/></g>`,
  epaper: `<rect x="9" y="10" width="30" height="28" rx="2" ${S}/><path d="M14 18h20M14 23h20M14 28h14" ${S}/>`,
  bluetooth: `<path d="M18 16l12 8-12 8V12l12 8-12 8" ${S}/>`,
  wifi: `<path d="M12 22a17 17 0 0 1 24 0M16 27a11 11 0 0 1 16 0M20 32a5 5 0 0 1 8 0" ${S}/><circle cx="24" cy="36" r="1.8" ${F}/>`,
  antenna: `<path d="M24 40V16" ${S}/><path d="M17 14a10 10 0 0 1 14 0M14 10a15 15 0 0 1 20 0" ${S}/><circle cx="24" cy="14" r="2.4" ${F}/>`,
  gsm: `<rect x="14" y="8" width="20" height="32" rx="3" ${S}/><path d="M20 32h3v3h-3zM26 30h3v5h-3zM32 27" ${S}/><path d="M19 14h10" ${S}/>`,
  ethernet: `<rect x="14" y="12" width="20" height="16" rx="2" ${S}/><path d="M18 28v6M30 28v6M18 12v-2h12v2" ${S}/><path d="M18 17h2M22 17h2M26 17h2M30 17h0" ${S}/>`,
  battery: `<rect x="9" y="16" width="28" height="16" rx="2" ${S}/><path d="M37 21h3v6h-3" ${S}/><path d="M15 24h4M22 21v6M22 24h4" ${S}/>`,
  solar: `<rect x="8" y="12" width="32" height="20" rx="1" ${S}/><path d="M18 12v20M28 12v20M8 19h32M8 25h32" ${S}/><path d="M24 36v4" ${S}/>`,
  regulator: `<rect x="16" y="12" width="16" height="14" rx="1" ${S}/><circle cx="24" cy="17" r="2" ${S}/><path d="M20 26v10M24 26v10M28 26v10" ${S}/>`,
  buck: `<rect x="8" y="14" width="32" height="20" rx="2" ${S}/><circle cx="16" cy="24" r="4" ${S}/><rect x="26" y="20" width="8" height="8" rx="1" ${S}/>`,
  resistor: `<path d="M6 24h8l3-8 4 16 4-16 3 8h8" ${S}/>`,
  capacitor: `<path d="M8 24h12M28 24h12M20 12v24M28 14v20" ${S}/>`,
  led: `<path d="M18 10h12l-2 14a4 4 0 0 1-8 0Z" ${S}/><path d="M20 34v6M28 34v6" ${S}/><path d="M32 14l4-3M32 20l5-1" ${S}/>`,
  diode: `<path d="M8 24h10M30 24h10" ${S}/><path d="M18 16l12 8-12 8Z" ${S}/><path d="M30 16v16" ${S}/>`,
  transistor: `<circle cx="24" cy="24" r="12" ${S}/><path d="M12 24h8M20 18v12M20 22l10-6M20 26l10 6M8 20v8" ${S}/>`,
  pot: `<circle cx="24" cy="22" r="10" ${S}/><path d="M24 22V14" ${S}/><path d="M18 36v-4M24 36v-4M30 36v-4" ${S}/>`,
  button: `<circle cx="24" cy="24" r="12" ${S}/><circle cx="24" cy="24" r="5" ${S}/>`,
  switch: `<rect x="8" y="18" width="32" height="12" rx="6" ${S}/><circle cx="16" cy="24" r="4" ${F}/>`,
  buzzer: `<path d="M10 18h8l8-6v24l-8-6h-8Z" ${S}/><path d="M30 18a6 6 0 0 1 0 12M34 14a11 11 0 0 1 0 20" ${S}/>`,
  breadboard: `<rect x="8" y="10" width="32" height="28" rx="2" ${S}/><path d="M8 18h32M8 30h32" ${S}/><g ${F}><circle cx="16" cy="23" r="1"/><circle cx="20" cy="23" r="1"/><circle cx="24" cy="23" r="1"/><circle cx="28" cy="23" r="1"/><circle cx="32" cy="23" r="1"/></g>`,
  wires: `<path d="M10 34c0-12 8-12 8-22M22 34c0-12 8-12 8-22M18 12h.01" ${S}/><path d="M14 14h8M26 14h8" ${S}/><circle cx="10" cy="35" r="2" ${F}/><circle cx="22" cy="35" r="2" ${F}/>`,
  pcb: `<rect x="8" y="8" width="32" height="32" rx="2" ${S}/><path d="M14 14h8v8M34 18h-8v10h-8M14 30h6" ${S}/><g ${F}><circle cx="14" cy="14" r="1.8"/><circle cx="34" cy="18" r="1.8"/><circle cx="18" cy="28" r="1.8"/></g>`,
  fuse: `<rect x="10" y="18" width="28" height="12" rx="6" ${S}/><path d="M4 24h6M38 24h6M16 24s2-4 4 0 2 4 4 0 2-4 4 0" ${S}/>`,
  crystal: `<rect x="14" y="14" width="20" height="16" rx="8" ${S}/><path d="M20 30v6M28 30v6" ${S}/><path d="M20 22h8" ${S}/>`,
  plc: `<rect x="10" y="8" width="28" height="32" rx="2" ${S}/><path d="M10 16h28M15 22h6M15 27h6M15 32h6" ${S}/><g ${F}><circle cx="30" cy="23" r="1.6"/><circle cx="30" cy="28" r="1.6"/><circle cx="30" cy="33" r="1.6"/></g>`,
  hmi: `<rect x="7" y="12" width="34" height="24" rx="2" ${S}/><rect x="12" y="17" width="12" height="14" rx="1" ${S}/><path d="M28 19h8M28 24h8M28 29h5" ${S}/>`,
  drive: `<rect x="12" y="8" width="24" height="32" rx="2" ${S}/><path d="M12 18h24" ${S}/><path d="M20 26l4 6 4-6" ${S}/><path d="M18 13h12" ${S}/>`,
  encoder: `<circle cx="24" cy="24" r="12" ${S}/><circle cx="24" cy="24" r="3" ${F}/><path d="M24 12v4M24 32v4M12 24h4M32 24h4M15.5 15.5l3 3M29.5 29.5l3 3M32.5 15.5l-3 3M15.5 32.5l3-3" ${S}/>`,
  lidar: `<circle cx="24" cy="26" r="10" ${S}/><path d="M24 26l9-6" ${S}/><path d="M14 16a14 14 0 0 1 20 0" ${S}/><circle cx="24" cy="26" r="2.4" ${F}/>`,
  robotarm: `<path d="M10 40h12M16 40V28l10-8 6 6" ${S}/><rect x="12" y="24" width="8" height="6" rx="1" ${S}/><circle cx="26" cy="20" r="2.4" ${S}/><path d="M32 26l4-2 2 4" ${S}/>`,
  wheel: `<circle cx="24" cy="24" r="13" ${S}/><circle cx="24" cy="24" r="5" ${S}/><path d="M24 11v6M24 31v6M11 24h6M31 24h6" ${S}/>`,
  gripper: `<path d="M24 8v10" ${S}/><path d="M16 18l-2 14 4 2M32 18l2 14-4 2" ${S}/><rect x="20" y="14" width="8" height="6" rx="1" ${S}/>`,
  code: `<path d="M17 16l-9 8 9 8M31 16l9 8-9 8M27 12l-6 24" ${S}/>`,
  database: `<ellipse cx="24" cy="14" rx="13" ry="5" ${S}/><path d="M11 14v20c0 3 6 5 13 5s13-2 13-5V14M11 24c0 3 6 5 13 5s13-2 13-5" ${S}/>`,
  cloud: `<path d="M16 34a8 8 0 0 1 0-16 10 10 0 0 1 19 2 7 7 0 0 1-1 14Z" ${S}/>`,
  ai: `<circle cx="14" cy="16" r="3" ${S}/><circle cx="14" cy="32" r="3" ${S}/><circle cx="27" cy="24" r="3" ${S}/><circle cx="38" cy="16" r="3" ${S}/><circle cx="38" cy="32" r="3" ${S}/><path d="M17 16l7 6M17 32l7-6M30 22l6-4M30 26l6 4" ${S}/>`,
  vision: `<path d="M6 24s7-11 18-11 18 11 18 11-7 11-18 11S6 24 6 24Z" ${S}/><circle cx="24" cy="24" r="5" ${S}/>`,
  chart: `<path d="M10 38V10M10 38h28" ${S}/><rect x="16" y="24" width="5" height="10" ${S}/><rect x="24" y="18" width="5" height="16" ${S}/><rect x="32" y="28" width="5" height="6" ${S}/>`,
  git: `<circle cx="14" cy="14" r="4" ${S}/><circle cx="14" cy="34" r="4" ${S}/><circle cx="34" cy="24" r="4" ${S}/><path d="M14 18v12M14 24h4a12 12 0 0 0 12-4" ${S}/>`,
  container: `<rect x="9" y="20" width="8" height="8" ${S}/><rect x="19" y="20" width="8" height="8" ${S}/><rect x="29" y="20" width="8" height="8" ${S}/><rect x="14" y="11" width="8" height="8" ${S}/><rect x="24" y="11" width="8" height="8" ${S}/><path d="M7 32h30a5 5 0 0 1-6 5H13" ${S}/>`,
  terminal: `<rect x="7" y="10" width="34" height="28" rx="2" ${S}/><path d="M7 17h34M13 24l5 4-5 4M22 32h8" ${S}/>`,
  app: `<rect x="14" y="7" width="20" height="34" rx="3" ${S}/><path d="M14 14h20M14 34h20" ${S}/><circle cx="24" cy="37.5" r="1.4" ${F}/>`,
  web: `<rect x="7" y="10" width="34" height="26" rx="2" ${S}/><path d="M7 17h34" ${S}/><g ${F}><circle cx="12" cy="13.5" r="1.2"/><circle cx="16" cy="13.5" r="1.2"/></g><path d="M14 26h20M14 31h12" ${S}/>`,
  gear: `<circle cx="24" cy="24" r="6" ${S}/><path d="M24 8v5M24 35v5M8 24h5M35 24h5M13 13l3.5 3.5M31.5 31.5 35 35M35 13l-3.5 3.5M13 35l3.5-3.5" ${S}/>`,
  cad: `<path d="M24 8l14 8v16l-14 8-14-8V16Z" ${S}/><path d="M24 8v16m0 0 14-8m-14 8-14-8m14 8v16" ${S}/>`,
  server: `<rect x="10" y="9" width="28" height="12" rx="2" ${S}/><rect x="10" y="27" width="28" height="12" rx="2" ${S}/><path d="M15 15h.01M15 33h.01" ${S}/><circle cx="15" cy="15" r="1.4" ${F}/><circle cx="15" cy="33" r="1.4" ${F}/>`,
  keypad: `<rect x="10" y="8" width="28" height="32" rx="2" ${S}/><g ${F}><circle cx="17" cy="17" r="1.6"/><circle cx="24" cy="17" r="1.6"/><circle cx="31" cy="17" r="1.6"/><circle cx="17" cy="24" r="1.6"/><circle cx="24" cy="24" r="1.6"/><circle cx="31" cy="24" r="1.6"/><circle cx="17" cy="31" r="1.6"/><circle cx="24" cy="31" r="1.6"/><circle cx="31" cy="31" r="1.6"/></g>`,
  joystick: `<circle cx="24" cy="34" r="6" ${S}/><path d="M24 28V14" ${S}/><circle cx="24" cy="11" r="4" ${S}/>`,
  speaker: `<rect x="14" y="8" width="20" height="32" rx="3" ${S}/><circle cx="24" cy="28" r="6" ${S}/><circle cx="24" cy="15" r="2.4" ${S}/>`,
  heart: `<path d="M24 38S9 29 9 18a8 8 0 0 1 15-3 8 8 0 0 1 15 3c0 11-15 20-15 20Z" ${S}/><path d="M14 22h5l2-4 3 8 2-4h8" ${S}/>`,
  compass: `<circle cx="24" cy="24" r="14" ${S}/><path d="M29 19l-3 8-8 3 3-8Z" ${S}/><circle cx="24" cy="24" r="1.6" ${F}/>`,
  flame: `<path d="M24 8s8 8 8 16a8 8 0 1 1-16 0c0-4 2-6 2-6s0 4 3 4c2 0 3-2 1-6-1.5-3-1-6 2-8Z" ${S}/>`,
  rain: `<path d="M16 24a7 7 0 0 1 0-14 9 9 0 0 1 17 2 6 6 0 0 1 1 12" ${S}/><path d="M17 30l-2 4M24 30l-2 4M31 30l-2 4" ${S}/>`,
  soil: `<path d="M8 26h32v10H8z" ${S}/><path d="M24 26V12M24 12l-5 4M24 16l5-3" ${S}/><path d="M14 30h.01M20 33h.01M28 31h.01M34 34h.01" ${S}/>`,
  scale: `<path d="M24 8v6M12 40h24M24 14v26" ${S}/><path d="M12 14h24M12 14l-5 10h10ZM36 14l-5 10h10Z" ${S}/>`,
  clock: `<circle cx="24" cy="24" r="14" ${S}/><path d="M24 16v8l6 4" ${S}/>`,
  sdcard: `<path d="M14 8h14l6 6v26H14Z" ${S}/><path d="M18 8v6M22 8v6M26 8v6" ${S}/>`,
  usb: `<path d="M24 40V12" ${S}/><path d="M24 12l-4 5h8Z" ${F}/><path d="M24 30l-8-6v-4M24 24l8-5v-4" ${S}/><circle cx="16" cy="18" r="2.2" ${F}/><rect x="30" y="12" width="4" height="4" ${F}/>`,
  display3d: `<path d="M8 14h32v18H8z" ${S}/><path d="M18 32l-2 6h16l-2-6" ${S}/><path d="M16 21l6 4 6-8" ${S}/>`,
  network: `<circle cx="24" cy="12" r="4" ${S}/><circle cx="12" cy="34" r="4" ${S}/><circle cx="36" cy="34" r="4" ${S}/><path d="M24 16v6M24 22l-9 9M24 22l9 9" ${S}/>`,
  lock: `<rect x="12" y="22" width="24" height="16" rx="2" ${S}/><path d="M17 22v-4a7 7 0 0 1 14 0v4" ${S}/><circle cx="24" cy="30" r="2.4" ${F}/>`,
  leaf: `<path d="M12 36C12 20 24 12 38 12c0 16-10 26-26 24Z" ${S}/><path d="M18 34c6-8 12-12 18-16" ${S}/>`,
};
