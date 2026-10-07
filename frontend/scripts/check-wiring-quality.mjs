#!/usr/bin/env node
/**
 * Validate the wiring asset publication boundary.
 *
 * The candidate review matrix is a human-readable release gate: candidate
 * artwork is only allowed into public/wiring after a named human review,
 * source links, exact-hardware checks, electrical-safety checks, legibility,
 * instruction consistency, and rights clearance. This script verifies that
 * gate and the source-backed diagram outputs; it does not replace the review.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(frontendDir, '..');
const reviewRoot = path.join(frontendDir, 'quality', 'wiring-review');
const candidateRoot = path.join(reviewRoot, 'candidates');
const publicWiringRoot = path.join(frontendDir, 'public', 'wiring');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const requiredReviewFields = [
  'boardModelVerified',
  'moduleModelVerified',
  'pinLabelsVerified',
  'wireEndpointsVerified',
  'powerGroundVerified',
  'voltageSafetyVerified',
  'imageLegibilityVerified',
  'writtenInstructionsConsistent',
  'rightsConfirmed',
];
const validFieldValues = new Set(['YES', 'NO', 'NOT_REVIEWED']);

export function parseCsv(text) {
  const records = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const character = text[i];
    if (quoted) {
      if (character === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }
    if (character === '"') {
      if (field.length) throw new Error(`Malformed CSV: unexpected quote at character ${i + 1}`);
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some((cell) => cell !== '')) records.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error('Malformed CSV: unterminated quoted field');
  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell !== '')) records.push(row);
  }
  if (!records.length) throw new Error('Review matrix is empty');

  const [headers, ...data] = records;
  if (headers.some((header) => !header.trim()) || new Set(headers).size !== headers.length) {
    throw new Error('Review matrix has a blank or duplicate column name');
  }
  return data.map((cells, index) => {
    if (cells.length !== headers.length) {
      throw new Error(`Review matrix row ${index + 2} has ${cells.length} cells; expected ${headers.length}`);
    }
    return Object.fromEntries(headers.map((header, column) => [header, cells[column]]));
  });
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function safeRelativePath(value, label) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value)) throw new Error(`${label}: expected a relative file path`);
  const normalized = path.normalize(value);
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`) || normalized.includes(`..${path.sep}`)) {
    throw new Error(`${label}: path traversal is not allowed (${value})`);
  }
  return normalized;
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...walkFiles(fullPath));
    else if (entry.isFile()) found.push(fullPath);
  }
  return found;
}

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateApprovedReview(row, label = `${row.board}/${row.component}`) {
  for (const field of requiredReviewFields) {
    if (row[field] !== 'YES') throw new Error(`${label}: cannot approve; ${field} is ${row[field]}`);
  }
  const urls = row.sourceUrls.split(';').map((url) => url.trim()).filter(Boolean);
  if (!urls.length || urls.some((url) => !/^https:\/\//i.test(url))) {
    throw new Error(`${label}: approval requires one or more HTTPS source URLs separated by semicolons`);
  }
  if (!row.reviewer.trim() || /\b(agent|automated|bot)\b/i.test(row.reviewer)) {
    throw new Error(`${label}: approval requires a named human reviewer`);
  }
  if (!validIsoDate(row.reviewedAt)) throw new Error(`${label}: approval requires a valid ISO review date`);
  if (!row.notes.trim()) throw new Error(`${label}: approval requires review notes`);
}

function main() {
  const candidateIndex = readJson(path.join(candidateRoot, 'manifest.json'), 'Candidate index');
  const componentSource = fs.readFileSync(path.join(frontendDir, 'src', 'data', 'components.ts'), 'utf8');
  const boardSource = fs.readFileSync(path.join(frontendDir, 'src', 'lib', 'boardProfiles.ts'), 'utf8');
  const componentIds = new Set([...componentSource.matchAll(/\bid:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]));
  const boardIds = new Set([...boardSource.matchAll(/\bid:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]));
  const integrity = readJson(path.join(reviewRoot, 'download-integrity.json'), 'Candidate integrity ledger');
  const status = readJson(path.join(reviewRoot, 'review-status.json'), 'Review status');
  const approvedManifest = readJson(path.join(publicWiringRoot, 'manifest.json'), 'Public wiring manifest');
  const publicGallery = readJson(path.join(publicWiringRoot, 'gallery.json'), 'Public wiring gallery');
  const matrixPath = path.join(reviewRoot, 'review-matrix.csv');
  const matrix = parseCsv(fs.readFileSync(matrixPath, 'utf8'));
  const requiredColumns = [
    'board', 'component', 'candidateFile', 'sha256', 'status', ...requiredReviewFields,
    'sourceUrls', 'reviewer', 'reviewedAt', 'provenance', 'notes',
  ];
  const columns = new Set(Object.keys(matrix[0] ?? {}));
  for (const field of requiredColumns) {
    if (!columns.has(field)) throw new Error(`Review matrix is missing required column "${field}"`);
  }

  const indexedCandidates = new Map();
  for (const [board, components] of Object.entries(candidateIndex)) {
    if (!boardIds.has(board)) throw new Error(`Candidate index references unknown board id: ${board}`);
    if (!components || typeof components !== 'object' || Array.isArray(components)) {
      throw new Error(`Candidate index has an invalid component map for ${board}`);
    }
    for (const [component, filename] of Object.entries(components)) {
      if (!componentIds.has(component)) throw new Error(`Candidate index references unknown component id: ${component}`);
      const key = `${board}\0${component}`;
      if (indexedCandidates.has(key)) throw new Error(`Duplicate candidate pair ${board}/${component}`);
      if (typeof filename !== 'string' || path.basename(filename) !== filename || !imageExtensions.has(path.extname(filename).toLowerCase())) {
        throw new Error(`Unsafe candidate filename for ${board}/${component}: ${filename}`);
      }
      indexedCandidates.set(key, filename);
    }
  }

  const integrityByKey = new Map();
  for (const asset of integrity.assets ?? []) {
    const key = `${asset.board}\0${asset.component}`;
    if (integrityByKey.has(key)) throw new Error(`Duplicate integrity record for ${asset.board}/${asset.component}`);
    integrityByKey.set(key, asset);
  }
  if (integrity.status !== 'download-integrity-verified-only') {
    throw new Error('Integrity ledger must clearly identify itself as download-integrity-only');
  }

  const reviewByKey = new Map();
  for (const row of matrix) {
    const key = `${row.board}\0${row.component}`;
    if (!row.board || !row.component || reviewByKey.has(key)) {
      throw new Error(`Review matrix has a missing identity or duplicate pair: ${row.board}/${row.component}`);
    }
    if (!['PENDING', 'REJECTED', 'APPROVED'].includes(row.status)) {
      throw new Error(`Invalid review status for ${row.board}/${row.component}: ${row.status}`);
    }
    for (const field of requiredReviewFields) {
      if (!validFieldValues.has(row[field])) {
        throw new Error(`${row.board}/${row.component}: ${field} must be YES, NO, or NOT_REVIEWED`);
      }
    }

    const indexedFile = indexedCandidates.get(key);
    if (!indexedFile) throw new Error(`Review row has no indexed candidate: ${row.board}/${row.component}`);
    const expectedRelativeFile = path.posix.join('candidates', indexedFile);
    const rowRelativeFile = safeRelativePath(row.candidateFile, `${row.board}/${row.component}`);
    if (rowRelativeFile.split(path.sep).join('/') !== expectedRelativeFile) {
      throw new Error(`${row.board}/${row.component}: candidateFile must match the candidate index (${expectedRelativeFile})`);
    }
    if (!/^[a-f0-9]{64}$/i.test(row.sha256)) throw new Error(`${row.board}/${row.component}: invalid SHA-256 in review matrix`);

    const candidatePath = path.join(reviewRoot, rowRelativeFile);
    if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isFile()) {
      throw new Error(`${row.board}/${row.component}: candidate image is missing (${rowRelativeFile})`);
    }
    const actualHash = sha256(candidatePath);
    if (actualHash !== row.sha256.toLowerCase()) {
      throw new Error(`${row.board}/${row.component}: image changed since review; update or reset its review row`);
    }

    const sourceRecord = integrityByKey.get(key);
    if (sourceRecord && (sourceRecord.file !== indexedFile || sourceRecord.sha256 !== actualHash)) {
      throw new Error(`${row.board}/${row.component}: transfer-integrity record does not match the staged candidate`);
    }
    if (sourceRecord && Number(sourceRecord.bytes) !== fs.statSync(candidatePath).size) {
      throw new Error(`${row.board}/${row.component}: recorded byte length does not match the staged candidate`);
    }
    if (!row.provenance.trim()) throw new Error(`${row.board}/${row.component}: provenance must state where the candidate came from`);

    if (row.status === 'APPROVED') validateApprovedReview(row);
    if (row.status === 'REJECTED' && (!row.reviewer.trim() || !validIsoDate(row.reviewedAt) || !row.notes.trim())) {
      throw new Error(`${row.board}/${row.component}: rejection requires reviewer, ISO date, and rationale`);
    }
    reviewByKey.set(key, row);
  }

  if (reviewByKey.size !== indexedCandidates.size) {
    throw new Error(`Candidate/index/review counts differ (${indexedCandidates.size}/${reviewByKey.size})`);
  }
  for (const key of indexedCandidates.keys()) {
    if (!reviewByKey.has(key)) throw new Error(`Candidate has no review row: ${key.replace('\0', '/')}`);
  }
  for (const key of integrityByKey.keys()) {
    if (!indexedCandidates.has(key)) throw new Error(`Transfer-integrity record has no indexed candidate: ${key.replace('\0', '/')}`);
  }
  if (Number(integrity.pairs) !== integrityByKey.size || Number(integrity.assets?.length) !== integrityByKey.size) {
    throw new Error('Integrity ledger pair count does not match its transfer records');
  }

  const counts = { PENDING: 0, REJECTED: 0, APPROVED: 0 };
  for (const row of matrix) counts[row.status] += 1;
  if (status.candidatePairCount !== indexedCandidates.size || status.candidateBoardCount !== Object.keys(candidateIndex).length) {
    throw new Error('Review status summary does not match the candidate index');
  }
  if (status.candidateImagesAreShownToVisitors !== false || status.humanElectricalSignOffRequired !== true || status.reviewMatrix !== 'review-matrix.csv') {
    throw new Error('Review status must truthfully require human sign-off, point to the review matrix, and keep candidates non-public');
  }
  const expectedReviewStatus = counts.PENDING === 0 ? 'REVIEW-COMPLETE' : 'REVIEW-IN-PROGRESS';
  if (status.status !== expectedReviewStatus) throw new Error('Review status label does not match the pending candidate count');
  for (const [key, count] of Object.entries({ pending: counts.PENDING, rejected: counts.REJECTED, approved: counts.APPROVED })) {
    if (status.statusCounts?.[key] !== count) throw new Error(`Review status count "${key}" does not match the matrix`);
  }

  if (!publicGallery || !Array.isArray(publicGallery) || publicGallery.length !== 0) {
    throw new Error('Public wiring gallery must stay empty until a per-image gallery approval gate exists');
  }

  const publicImagePaths = new Set();
  const publicPairCount = { total: 0 };
  for (const [board, components] of Object.entries(approvedManifest)) {
    if (!components || typeof components !== 'object' || Array.isArray(components)) {
      throw new Error(`Public manifest has an invalid component map for ${board}`);
    }
    for (const [component, filename] of Object.entries(components)) {
      if (!componentIds.has(component)) throw new Error(`Candidate index references unknown component id: ${component}`);
      const key = `${board}\0${component}`;
      const review = reviewByKey.get(key);
      if (!review || review.status !== 'APPROVED') {
        throw new Error(`Public manifest exposes a candidate without APPROVED human review: ${board}/${component}`);
      }
      const indexedFile = indexedCandidates.get(key);
      if (filename !== indexedFile || path.basename(filename) !== filename) {
        throw new Error(`Public file must be the exact approved candidate for ${board}/${component}`);
      }
      const publicPath = path.join(publicWiringRoot, filename);
      if (!fs.existsSync(publicPath) || !fs.statSync(publicPath).isFile()) {
        throw new Error(`Approved public image is missing: ${path.relative(repoRoot, publicPath)}`);
      }
      if (sha256(publicPath) !== review.sha256.toLowerCase()) {
        throw new Error(`Public image hash differs from the reviewed candidate: ${board}/${component}`);
      }
      publicImagePaths.add(path.resolve(publicPath));
      publicPairCount.total += 1;
    }
  }

  for (const file of walkFiles(publicWiringRoot)) {
    if (!imageExtensions.has(path.extname(file).toLowerCase())) continue;
    if (!publicImagePaths.has(path.resolve(file))) {
      throw new Error(`Unindexed/unreviewed public wiring image: ${path.relative(repoRoot, file)}`);
    }
  }
  if (status.verifiedPhotoPairs !== publicPairCount.total) {
    throw new Error(`Review status reports ${status.verifiedPhotoPairs} public pair(s), but the public manifest contains ${publicPairCount.total}`);
  }

  const sourceDocs = [
    path.join(repoRoot, 'docs', 'WIRING-ASSET-ATTRIBUTION.md'),
    path.join(reviewRoot, 'README.md'),
  ];
  for (const sourceDoc of sourceDocs) {
    if (!fs.existsSync(sourceDoc)) throw new Error(`Required wiring review/attribution document is missing: ${sourceDoc}`);
  }

  console.log(`✓ Wiring quality gate passed: ${indexedCandidates.size} candidates hash-checked; ${counts.PENDING} pending, ${counts.REJECTED} rejected, ${counts.APPROVED} approved, ${publicPairCount.total} public.`);
  console.log('✓ Public image manifest is restricted to exact, individually approved candidate files; no unindexed image is exposed.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`✗ Wiring quality gate failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
