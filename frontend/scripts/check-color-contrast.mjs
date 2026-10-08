import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const [css, tailwind, projectThumb] = await Promise.all([
  readFile(path.join(here, '../src/app/globals.css'), 'utf8'),
  readFile(path.join(here, '../tailwind.config.ts'), 'utf8'),
  readFile(path.join(here, '../src/components/ProjectThumb.tsx'), 'utf8'),
]);

function blockFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`Could not find color-token block: ${selector}`);
  return match[1];
}

function parseTokens(block) {
  return Object.fromEntries(
    [...block.matchAll(/--([a-z-]+):\s*(#[\da-f]{3,8})\s*;/gi)].map(([, name, value]) => [name, value]),
  );
}

function toRgb(hex) {
  let value = hex.replace('#', '');
  if (value.length === 3) value = [...value].map((digit) => digit + digit).join('');
  if (value.length !== 6) throw new Error(`Expected an opaque hex color, received ${hex}`);
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
}

function relativeLuminanceRgb(rgb) {
  const linear = rgb.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function relativeLuminance(hex) {
  return relativeLuminanceRgb(toRgb(hex));
}

function contrastRatioRgb(first, second) {
  const [lighter, darker] = [relativeLuminanceRgb(first), relativeLuminanceRgb(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrastRatio(first, second) {
  return contrastRatioRgb(toRgb(first), toRgb(second));
}

function reportPair(label, foreground, background, minimum) {
  const ratio = contrastRatio(foreground, background);
  const passed = ratio >= minimum;
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${label.padEnd(43)} ${ratio.toFixed(2)}:1 (min ${minimum}:1)`);
  if (!passed) failures += 1;
}

const baseTokens = parseTokens(blockFor(':root'));
const lightTokens = { ...baseTokens, ...parseTokens(blockFor(":root[data-theme='light']")) };
const checks = [
  ['body text', 'text', 'bg', 4.5],
  ['secondary text', 'muted', 'bg', 4.5],
  ['link text', 'link', 'bg', 4.5],
  ['primary button label', 'action-fg', 'action-bg', 4.5],
  ['primary button hover label', 'action-fg', 'action-hover-bg', 4.5],
  ['primary control boundary', 'action-bg', 'bg', 3],
  ['hovered primary control boundary', 'action-hover-bg', 'bg', 3],
  ['primary control boundary vs card', 'action-bg', 'surface', 3],
  ['hovered control boundary vs card', 'action-hover-bg', 'surface', 3],
  ['danger button label', 'action-fg', 'danger-fill', 4.5],
  ['danger control boundary', 'danger-fill', 'bg', 3],
  ['danger hover boundary', 'danger-hover', 'bg', 3],
  ['input placeholder', 'field-placeholder', 'control-bg', 4.5],
  ['input boundary', 'control-border', 'control-bg', 3],
  ['input boundary vs page', 'control-border', 'bg', 3],
  ['focus indicator', 'focus', 'bg', 3],
  ['muted icon vs surface', 'icon-muted', 'surface', 3],
  ['success text', 'success-text', 'bg', 4.5],
  ['warning text', 'warning-text', 'bg', 4.5],
  ['error text', 'danger-text', 'bg', 4.5],
  ['accent text', 'accent-text', 'bg', 4.5],
  ['chart label text', 'chart-label', 'bg', 4.5],
  ['chart series one', 'chart-primary', 'bg', 3],
  ['chart series two', 'chart-secondary', 'bg', 3],
  ['chart series three', 'chart-tertiary', 'bg', 3],
  ['decorative headline start', 'gradient-start', 'bg', 4.5],
  ['decorative headline end', 'gradient-end', 'bg', 4.5],
];

let failures = 0;
for (const [theme, tokens] of [['dark', baseTokens], ['light', lightTokens]]) {
  console.log(`\n${theme} theme`);
  for (const [label, foregroundName, backgroundName, minimum] of checks) {
    const foreground = tokens[foregroundName];
    const background = tokens[backgroundName];
    if (!foreground || !background) {
      console.error(`  MISSING  ${label}: --${foregroundName} or --${backgroundName}`);
      failures += 1;
      continue;
    }
    reportPair(label, foreground, background, minimum);
  }
}

// Filled Tailwind brand shades are used for active tabs and action controls.
// Test each as a white-label control against both page and card surfaces.
const brandBlock = tailwind.match(/brand:\s*\{([\s\S]*?)\n\s*\},/);
if (!brandBlock) throw new Error('Could not find the Tailwind brand color scale.');
const brandScale = Object.fromEntries(
  [...brandBlock[1].matchAll(/(\d+):\s*'(#[\da-f]{6})'/gi)].map(([, shade, color]) => [shade, color]),
);
const brandSurfaces = [
  ['dark page', baseTokens.bg],
  ['dark card', baseTokens.surface],
  ['light page', lightTokens.bg],
  ['light card', lightTokens.surface],
];
console.log('\nTailwind filled brand utilities');
for (const shade of ['500', '600', '700']) {
  const fill = brandScale[shade];
  if (!fill) {
    console.error(`  MISSING  brand-${shade} fill`);
    failures += 1;
    continue;
  }
  for (const [surfaceName, surface] of brandSurfaces) {
    reportPair(`brand-${shade} boundary vs ${surfaceName}`, fill, surface, 3);
  }
  reportPair(`white label on brand-${shade}`, '#ffffff', fill, 4.5);
}

// The thumbnail's two white decorative circles and grid can combine to about
// 14.4% white over the gradient. Test a conservative 15% overlay at 101 points
// across each gradient and measure the opaque white title-initial foreground.
const paletteMatches = [...projectThumb.matchAll(/\['(#[\da-f]{6})',\s*'(#[\da-f]{6})'\]/gi)];
if (paletteMatches.length === 0) throw new Error('No ProjectThumb gradient palettes were found.');
const titleWhite = [1, 1, 1];
const overlayAlpha = 0.15;
const samples = 101;
console.log('\nProjectThumb sampled gradients (opaque white initials; max 15% white overlay)');
for (const [index, [, firstHex, secondHex]] of paletteMatches.entries()) {
  const first = toRgb(firstHex);
  const second = toRgb(secondHex);
  let minimumRatio = Number.POSITIVE_INFINITY;
  for (let sample = 0; sample < samples; sample += 1) {
    const progress = sample / (samples - 1);
    const gradient = first.map((channel, channelIndex) =>
      channel * (1 - progress) + second[channelIndex] * progress,
    );
    const background = gradient.map((channel) => channel * (1 - overlayAlpha) + overlayAlpha);
    minimumRatio = Math.min(minimumRatio, contrastRatioRgb(titleWhite, background));
  }
  const passed = minimumRatio >= 4.5;
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  palette ${String(index + 1).padStart(2, '0')} ${firstHex} → ${secondHex} ${minimumRatio.toFixed(2)}:1 (min 4.5:1)`);
  if (!passed) failures += 1;
}

if (failures) {
  console.error(`\n${failures} contrast check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll declared token, filled-brand, and sampled thumbnail checks passed. This is a regression guard—not a formal WCAG audit of every rendered element, arbitrary image, gradient, state, or assistive-technology flow.');
}
