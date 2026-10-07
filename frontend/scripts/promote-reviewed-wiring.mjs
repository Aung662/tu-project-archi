#!/usr/bin/env node
/**
 * Promote one exact, human-approved candidate image into public/wiring.
 *
 * A review row must already be APPROVED with all required checks, stable
 * HTTPS sources, rights confirmation, reviewer/date/notes, and a matching
 * SHA-256. The public manifest, review status and image copy are updated as a
 * small transaction; the quality gate is then run and changes are rolled back
 * if any publication invariant fails.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseCsv, validateApprovedReview } from './check-wiring-quality.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(frontendDir, '..');
const reviewRoot = path.join(frontendDir, 'quality', 'wiring-review');
const candidateRoot = path.join(reviewRoot, 'candidates');
const publicRoot = path.join(frontendDir, 'public', 'wiring');
const matrixPath = path.join(reviewRoot, 'review-matrix.csv');
const publicManifestPath = path.join(publicRoot, 'manifest.json');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function atomicWrite(filePath, contents) {
  const temporary = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, contents, 'utf8');
  fs.renameSync(temporary, filePath);
}

function sortedManifest(source) {
  const result = {};
  for (const board of Object.keys(source).sort()) {
    result[board] = {};
    for (const component of Object.keys(source[board]).sort()) {
      result[board][component] = source[board][component];
    }
  }
  return result;
}

function validateAsset(board, component, row, candidateIndex, integrity) {
  if (row.status !== 'APPROVED') {
    throw new Error(`${board}/${component} is ${row.status}; a human must complete every review field before promotion`);
  }
  validateApprovedReview(row, `${board}/${component}`);
  const indexedName = candidateIndex[board]?.[component];
  if (!indexedName || row.candidateFile !== `candidates/${indexedName}` || path.basename(indexedName) !== indexedName) {
    throw new Error(`${board}/${component}: review row does not point to its exact indexed candidate`);
  }
  if (!imageExtensions.has(path.extname(indexedName).toLowerCase())) {
    throw new Error(`${board}/${component}: unsupported image extension`);
  }
  const candidatePath = path.join(candidateRoot, indexedName);
  if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isFile()) {
    throw new Error(`${board}/${component}: candidate file is missing`);
  }
  const actualHash = sha256(candidatePath);
  if (actualHash !== row.sha256.toLowerCase()) {
    throw new Error(`${board}/${component}: candidate changed after review; re-review this hash`);
  }
  const ledger = integrity.assets?.find((asset) => asset.board === board && asset.component === component);
  if (!ledger || ledger.file !== indexedName || ledger.sha256 !== actualHash) {
    throw new Error(`${board}/${component}: transfer-integrity ledger does not match the reviewed asset`);
  }
  if (Number(ledger.bytes) !== fs.statSync(candidatePath).size) {
    throw new Error(`${board}/${component}: transfer-integrity byte length does not match the file`);
  }
  return { candidatePath, filename: indexedName, hash: actualHash };
}

function run() {
  const [board, component, ...flags] = process.argv.slice(2);
  const dryRun = flags.includes('--dry-run');
  if (flags.some((flag) => flag !== '--dry-run') || !board || !component) {
    console.error('Usage: node scripts/promote-reviewed-wiring.mjs <boardId> <componentId> [--dry-run]');
    process.exitCode = 2;
    return;
  }

  const candidateIndex = JSON.parse(fs.readFileSync(path.join(candidateRoot, 'manifest.json'), 'utf8'));
  const integrity = JSON.parse(fs.readFileSync(path.join(reviewRoot, 'download-integrity.json'), 'utf8'));
  const rows = parseCsv(fs.readFileSync(matrixPath, 'utf8'));
  const reviewRow = rows.find((row) => row.board === board && row.component === component);
  if (!reviewRow) throw new Error(`No review row exists for ${board}/${component}`);
  const { candidatePath, filename, hash } = validateAsset(board, component, reviewRow, candidateIndex, integrity);

  const manifestSource = fs.readFileSync(publicManifestPath, 'utf8');
  const manifest = JSON.parse(manifestSource);
  const current = manifest[board]?.[component];
  if (current && current !== filename) {
    throw new Error(`${board}/${component} already maps to ${current}; remove/resolve the existing asset explicitly before replacement`);
  }
  const destination = path.join(publicRoot, filename);
  if (path.dirname(destination) !== publicRoot) throw new Error('Unsafe public destination path');
  const destinationExists = fs.existsSync(destination);
  if (destinationExists && sha256(destination) !== hash) {
    throw new Error(`A different file already exists at ${path.relative(repoRoot, destination)}; refusing to overwrite`);
  }

  if (dryRun) {
    console.log(`✓ Dry run: ${board}/${component} passed approval and hash checks; would publish ${filename}.`);
    return;
  }
  if (current === filename) {
    const sync = spawnSync(process.execPath, [path.join(scriptDir, 'sync-wiring-review-status.mjs')], { cwd: frontendDir, encoding: 'utf8' });
    process.stdout.write(sync.stdout ?? '');
    process.stderr.write(sync.stderr ?? '');
    if (sync.error) throw sync.error;
    if (sync.status !== 0) throw new Error('Could not synchronize the wiring review summary');
    const check = spawnSync(process.execPath, [path.join(scriptDir, 'check-wiring-quality.mjs')], { cwd: frontendDir, encoding: 'utf8' });
    process.stdout.write(check.stdout ?? '');
    process.stderr.write(check.stderr ?? '');
    if (check.status !== 0) throw new Error('Already-public asset failed the wiring quality gate');
    console.log(`✓ ${board}/${component} is already promoted and passes the quality gate.`);
    return;
  }

  const nextManifest = sortedManifest({ ...manifest, [board]: { ...(manifest[board] ?? {}), [component]: filename } });

  let createdDestination = false;
  let temporaryImage = null;
  try {
    if (!destinationExists) {
      temporaryImage = `${destination}.${process.pid}.tmp`;
      fs.copyFileSync(candidatePath, temporaryImage, fs.constants.COPYFILE_EXCL);
      fs.renameSync(temporaryImage, destination);
      temporaryImage = null;
      createdDestination = true;
    }
    atomicWrite(publicManifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);
    const sync = spawnSync(process.execPath, [path.join(scriptDir, 'sync-wiring-review-status.mjs')], { cwd: frontendDir, encoding: 'utf8' });
    process.stdout.write(sync.stdout ?? '');
    process.stderr.write(sync.stderr ?? '');
    if (sync.error) throw sync.error;
    if (sync.status !== 0) throw new Error('Could not synchronize the wiring review summary');

    const check = spawnSync(process.execPath, [path.join(scriptDir, 'check-wiring-quality.mjs')], { cwd: frontendDir, encoding: 'utf8' });
    process.stdout.write(check.stdout ?? '');
    process.stderr.write(check.stderr ?? '');
    if (check.error) throw check.error;
    if (check.status !== 0) throw new Error('Post-promotion wiring quality gate failed');
  } catch (error) {
    atomicWrite(publicManifestPath, manifestSource);
    if (createdDestination) fs.rmSync(destination, { force: true });
    if (temporaryImage) fs.rmSync(temporaryImage, { force: true });
    const sync = spawnSync(process.execPath, [path.join(scriptDir, 'sync-wiring-review-status.mjs')], { cwd: frontendDir, encoding: 'utf8' });
    process.stdout.write(sync.stdout ?? '');
    process.stderr.write(sync.stderr ?? '');
    throw error;
  }

  console.log(`✓ Promoted reviewed wiring image: ${board}/${component} (${hash.slice(0, 12)}…).`);
}

try {
  run();
} catch (error) {
  console.error(`✗ Wiring image promotion refused: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
