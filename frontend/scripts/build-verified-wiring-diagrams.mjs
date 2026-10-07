#!/usr/bin/env node
/**
 * Build self-contained SVGs for source-reviewed wiring recipes.
 *
 * Board/module artwork is copied from version-pinned Fritzing parts and
 * embedded as data URIs. Each wire endpoint is resolved from the connector ID
 * in the source FZP file + the matching connector pin in its breadboard SVG.
 * Pinned source hashes prevent silent artwork or connector-map drift.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(frontendDir, '..');
const recipeFile = path.join(frontendDir, 'src/data/verifiedWiring.json');
const sourceRoot = path.join(frontendDir, 'quality/wiring-review/fritzing-source');
const sourceMetadataPath = path.join(sourceRoot, 'source-metadata.json');
const outputRoot = path.join(frontendDir, 'public/wiring/verified');
const checkOnly = process.argv.includes('--check');

const xmlAttributes = (source) => {
  const result = {};
  const pattern = /([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(["'])(.*?)\2/g;
  for (const match of source.matchAll(pattern)) result[match[1]] = match[3];
  return result;
};

function parseViewBox(svg, label) {
  const opening = svg.match(/<svg\b[^>]*>/i)?.[0];
  if (!opening) throw new Error(`${label}: missing <svg> root`);
  const viewBox = xmlAttributes(opening).viewBox;
  if (!viewBox) throw new Error(`${label}: missing viewBox`);
  const values = viewBox.trim().split(/[ ,]+/).map(Number);
  if (values.length !== 4 || values.some((n) => !Number.isFinite(n)) || values[2] <= 0 || values[3] <= 0) {
    throw new Error(`${label}: invalid viewBox ${viewBox}`);
  }
  return { minX: values[0], minY: values[1], width: values[2], height: values[3] };
}

function parseFzpConnectors(fzp, label) {
  const connectors = new Map();
  for (const match of fzp.matchAll(/<connector\b([^>]*?)(?:\/>|>)/g)) {
    const attrs = xmlAttributes(match[1]);
    if (attrs.id && attrs.name) connectors.set(attrs.id, attrs.name.trim());
  }
  if (!connectors.size) throw new Error(`${label}: no connectors found in Fritzing part definition`);
  return connectors;
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function loadPinnedSourceMetadata() {
  const metadata = JSON.parse(fs.readFileSync(sourceMetadataPath, 'utf8'));
  if (metadata.schemaVersion !== 1 || !/^[a-f0-9]{40}$/i.test(metadata.commit)) {
    throw new Error('Fritzing source metadata is missing a pinned commit or supported schema');
  }
  if (metadata.license?.spdx !== 'CC-BY-SA-3.0' || !metadata.license?.noticeFile || !metadata.license?.noticeSha256) {
    throw new Error('Fritzing source metadata must identify the upstream CC BY-SA 3.0 license notice');
  }
  const noticePath = path.resolve(sourceRoot, metadata.license.noticeFile);
  if (!noticePath.startsWith(`${sourceRoot}${path.sep}`) || !fs.existsSync(noticePath) || sha256(noticePath) !== metadata.license.noticeSha256) {
    throw new Error('Fritzing upstream license notice is missing or has changed');
  }
  return metadata;
}

function pinnedSourcePath(relativePath, expectedHash, label) {
  const absolutePath = path.resolve(sourceRoot, relativePath);
  if (!absolutePath.startsWith(`${sourceRoot}${path.sep}`)) throw new Error(`${label}: source path escapes the pinned source directory`);
  if (!fs.existsSync(absolutePath) || sha256(absolutePath) !== expectedHash) {
    throw new Error(`${label}: pinned source is missing or its SHA-256 changed (${relativePath})`);
  }
  return absolutePath;
}

function elementById(svg, targetId, label) {
  const found = [];
  const tagPattern = /<([A-Za-z][A-Za-z0-9_.:-]*)\b([^<>]*?)(?:\/>|>)/g;
  for (const match of svg.matchAll(tagPattern)) {
    const attrs = xmlAttributes(match[2]);
    if (attrs.id === targetId) found.push({ tag: match[1].toLowerCase(), attrs });
  }
  if (found.length !== 1) throw new Error(`${label}: expected one ${targetId} SVG connector marker, found ${found.length}`);
  const { tag, attrs } = found[0];
  let x; let y;
  if (['circle', 'ellipse'].includes(tag)) {
    x = Number(attrs.cx);
    y = Number(attrs.cy);
  } else if (['rect', 'image'].includes(tag)) {
    x = Number(attrs.x) + Number(attrs.width) / 2;
    y = Number(attrs.y) + Number(attrs.height) / 2;
  } else {
    throw new Error(`${label}: unsupported connector marker element <${tag}>`);
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error(`${label}: bad coordinates for ${targetId}`);
  return { x, y };
}

function number(n) {
  return Number(n.toFixed(2)).toString();
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapText(text, maxCharacters = 130) {
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > maxCharacters) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  if (!lines.length || lines.length > 3) throw new Error('Attribution must fit in three lines or fewer');
  return lines;
}

function loadPart(part, label, metadata) {
  const pinnedPart = Object.values(metadata.parts ?? {}).find((entry) =>
    entry.fzp?.path === part.sourceFzp && entry.breadboardSvg?.path === part.sourceSvg,
  );
  if (!pinnedPart) throw new Error(`${label}: part FZP/SVG pair is not recorded in source-metadata.json`);
  const svgPath = pinnedSourcePath(part.sourceSvg, pinnedPart.breadboardSvg.sha256, `${label} artwork`);
  const fzpPath = pinnedSourcePath(part.sourceFzp, pinnedPart.fzp.sha256, `${label} connector definition`);
  const svg = fs.readFileSync(svgPath, 'utf8');
  const fzp = fs.readFileSync(fzpPath, 'utf8');
  if (/<\s*(script|foreignObject|iframe)\b/i.test(svg)) throw new Error(`${label}: unsafe SVG element found`);
  const externalRefs = [...svg.matchAll(/(?:href|xlink:href)\s*=\s*(["'])(.*?)\1/gi)]
    .map((match) => match[2])
    .filter((value) => !value.startsWith('#') && !value.startsWith('data:'));
  if (externalRefs.length) throw new Error(`${label}: external SVG reference is not allowed: ${externalRefs[0]}`);

  const viewBox = parseViewBox(svg, label);
  const fzpConnectors = parseFzpConnectors(fzp, label);
  const pins = {};
  for (const [logicalName, expected] of Object.entries(part.connectorMap)) {
    const fzpName = fzpConnectors.get(expected.id);
    if (!fzpName || fzpName !== expected.name) {
      throw new Error(`${label}: ${expected.id} expected as "${expected.name}" in .fzp; found ${fzpName ?? 'missing'}`);
    }
    const marker = elementById(svg, `${expected.id}pin`, label);
    const x = marker.x + (part.pinGroupTranslation?.x ?? 0);
    const y = marker.y + (part.pinGroupTranslation?.y ?? 0);
    if (x < viewBox.minX || x > viewBox.minX + viewBox.width || y < viewBox.minY || y > viewBox.minY + viewBox.height) {
      throw new Error(`${label}: ${logicalName} connector lies outside SVG viewBox`);
    }
    pins[logicalName] = { x, y };
  }
  return {
    svg,
    viewBox,
    pins,
    box: part.box,
    height: part.box.width * viewBox.height / viewBox.width,
    credit: pinnedPart.credit,
  };
}

function toCanvas(point, part) {
  return {
    x: part.box.x + ((point.x - part.viewBox.minX) / part.viewBox.width) * part.box.width,
    y: part.box.y + ((point.y - part.viewBox.minY) / part.viewBox.height) * part.height,
  };
}

function buildRecipeSvg(recipe, sourceMetadata) {
  const board = loadPart(recipe.layout.board, `${recipe.id} board`, sourceMetadata);
  const module = loadPart(recipe.layout.module, `${recipe.id} component`, sourceMetadata);
  const { width, height } = recipe.layout.canvas;
  const credits = new Set([board.credit, module.credit]);
  for (const credit of credits) {
    if (!recipe.attribution.includes(credit)) throw new Error(`${recipe.id}: attribution omits Fritzing part credit "${credit}"`);
  }
  const ids = new Set();
  const componentPins = new Set();
  const boardPins = new Set();
  const paths = [];

  for (const connection of recipe.connections) {
    if (ids.has(connection.id)) throw new Error(`${recipe.id}: duplicate connection id ${connection.id}`);
    ids.add(connection.id);
    if (boardPins.has(connection.boardPin) || componentPins.has(connection.componentPin)) {
      throw new Error(`${recipe.id}: a physical connector is assigned more than once`);
    }
    boardPins.add(connection.boardPin);
    componentPins.add(connection.componentPin);
    if (!board.pins[connection.boardPin]) throw new Error(`${recipe.id}: missing board pin ${connection.boardPin}`);
    if (!module.pins[connection.componentPin]) throw new Error(`${recipe.id}: missing component pin ${connection.componentPin}`);
    if (!/^#[0-9a-f]{6}$/i.test(connection.color)) throw new Error(`${recipe.id}: invalid wire color ${connection.color}`);

    const start = toCanvas(board.pins[connection.boardPin], board);
    const end = toCanvas(module.pins[connection.componentPin], module);
    const points = [start, ...connection.route, end];
    for (const p of points) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        throw new Error(`${recipe.id}: route point out of canvas bounds`);
      }
    }
    const d = points.map((p, i) => `${i ? 'L' : 'M'} ${number(p.x)} ${number(p.y)}`).join(' ');
    const label = `${connection.boardPin} to ${connection.componentPin}`;
    paths.push(`
      <path d="${d}" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
      <path d="${d}" fill="none" stroke="${connection.color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><title>${escapeXml(label)}</title></path>
      <circle cx="${number(start.x)}" cy="${number(start.y)}" r="5.5" fill="${connection.color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="${number(end.x)}" cy="${number(end.y)}" r="5.5" fill="${connection.color}" stroke="#ffffff" stroke-width="2"/>`);
  }

  const boardHeight = number(board.height);
  const moduleHeight = number(module.height);
  const boardUri = `data:image/svg+xml;base64,${Buffer.from(board.svg).toString('base64')}`;
  const moduleUri = `data:image/svg+xml;base64,${Buffer.from(module.svg).toString('base64')}`;
  const title = `${recipe.displayName} — verified pin-to-pin wiring`;
  const attributionLines = wrapText(recipe.attribution);
  const attribution = attributionLines.map((line, index) => {
    const y = height - 14 - (attributionLines.length - 1 - index) * 14;
    return `<text x="${width / 2}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#475569">${escapeXml(line)}</text>`;
  }).join('\n  ');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">Authentic Fritzing board and component artwork with wires anchored at connector locations from the Fritzing part definitions. See the on-page table for each pin pair and source links.</desc>
  <rect width="${width}" height="${height}" rx="18" fill="#f8fafc"/>
  <text x="${width / 2}" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#0f172a">${escapeXml(recipe.displayName)}</text>
  <text x="${width / 2}" y="61" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#475569">Fritzing-style reference · board and module art from cited parts library</text>
  <image href="${boardUri}" x="${board.box.x}" y="${board.box.y}" width="${board.box.width}" height="${boardHeight}" preserveAspectRatio="none"/>
  <image href="${moduleUri}" x="${module.box.x}" y="${module.box.y}" width="${module.box.width}" height="${moduleHeight}" preserveAspectRatio="none"/>
  <g aria-label="Colored jumper wires">${paths.join('\n')}</g>
  ${attribution}
</svg>
`;
  return svg;
}

function main() {
  const data = JSON.parse(fs.readFileSync(recipeFile, 'utf8'));
  if (data.schemaVersion !== 1 || !Array.isArray(data.recipes) || !data.recipes.length) {
    throw new Error('verifiedWiring.json must have schemaVersion 1 and at least one recipe');
  }
  const sourceMetadata = loadPinnedSourceMetadata();
  const recipeIds = new Set();
  fs.mkdirSync(outputRoot, { recursive: true });
  let count = 0;
  for (const recipe of data.recipes) {
    if (!recipe.id || recipeIds.has(recipe.id)) throw new Error(`Missing or duplicate recipe id: ${recipe.id ?? '(none)'}`);
    recipeIds.add(recipe.id);
    if (recipe.license !== 'CC BY-SA 3.0' || !recipe.attribution?.includes('CC BY-SA 3.0')) {
      throw new Error(`${recipe.id}: diagram must preserve the pinned artwork's CC BY-SA 3.0 attribution`);
    }
    if (!Array.isArray(recipe.sources) || !recipe.sources.length || recipe.sources.some(({ url }) => !/^https:\/\//i.test(url ?? ''))) {
      throw new Error(`${recipe.id}: source-backed recipe requires HTTPS references`);
    }
    if (!recipe.diagramFile || path.basename(recipe.diagramFile) !== recipe.diagramFile || !recipe.diagramFile.endsWith('.svg')) {
      throw new Error(`${recipe.id}: unsafe or invalid generated diagram filename`);
    }
    const contents = buildRecipeSvg(recipe, sourceMetadata);
    const outputPath = path.join(outputRoot, recipe.diagramFile);
    if (checkOnly) {
      if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== contents) {
        throw new Error(`${path.relative(repoRoot, outputPath)} is missing or stale; run npm run build:wiring`);
      }
    } else {
      const tmp = `${outputPath}.tmp`;
      fs.writeFileSync(tmp, contents, 'utf8');
      fs.renameSync(tmp, outputPath);
    }
    count += 1;
  }
  if (checkOnly) console.log(`✓ ${count} source-backed wiring diagram(s) are current and connector-validated.`);
  else console.log(`✓ Built ${count} self-contained, connector-validated Fritzing-style diagram(s).`);
}

try {
  main();
} catch (error) {
  console.error(`✗ Wiring diagram build failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
