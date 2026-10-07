#!/usr/bin/env node
/**
 * Register indexed quarantine images in the review matrix.
 *
 * New/changed hashes are always reset to PENDING. Existing decisions survive
 * only while the exact same indexed file and bytes are present. The legacy
 * download-integrity ledger remains provenance evidence for the 338 recovered
 * URLs; newly imported files can be reviewed without being misrepresented as
 * network-verified downloads.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './check-wiring-quality.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRootArg = process.argv[2];
const frontendDir = repoRootArg
  ? path.join(path.resolve(repoRootArg), 'frontend')
  : path.resolve(scriptDir, '..');
const reviewRoot = path.join(frontendDir, 'quality', 'wiring-review');
const candidateRoot = path.join(reviewRoot, 'candidates');
const matrixPath = path.join(reviewRoot, 'review-matrix.csv');
const statusPath = path.join(reviewRoot, 'review-status.json');
const columns = [
  'board', 'component', 'candidateFile', 'sha256', 'status', 'boardModelVerified', 'moduleModelVerified',
  'pinLabelsVerified', 'wireEndpointsVerified', 'powerGroundVerified', 'voltageSafetyVerified',
  'imageLegibilityVerified', 'writtenInstructionsConsistent', 'rightsConfirmed', 'sourceUrls', 'reviewer',
  'reviewedAt', 'provenance', 'notes',
];
const reviewChecks = columns.slice(5, 14);
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}


function atomicWrite(filePath, content) {
  const temporary = `${filePath}.${process.pid}.restore.tmp`;
  fs.writeFileSync(temporary, content, 'utf8');
  fs.renameSync(temporary, filePath);
}

function main() {
  const indexPath = path.join(candidateRoot, 'manifest.json');
  const candidateIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const integrity = JSON.parse(fs.readFileSync(path.join(reviewRoot, 'download-integrity.json'), 'utf8'));
  const previousRows = fs.existsSync(matrixPath) ? parseCsv(fs.readFileSync(matrixPath, 'utf8')) : [];
  const previous = new Map(previousRows.map((row) => [`${row.board}\0${row.component}`, row]));
  const downloadLedger = new Map((integrity.assets ?? []).map((asset) => [`${asset.board}\0${asset.component}`, asset]));
  const rows = [];
  const seen = new Set();
  const changedPairs = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const board of Object.keys(candidateIndex).sort()) {
    const components = candidateIndex[board];
    if (!components || typeof components !== 'object' || Array.isArray(components)) {
      throw new Error(`Invalid candidate component map for ${board}`);
    }
    for (const component of Object.keys(components).sort()) {
      const key = `${board}\0${component}`;
      const filename = components[component];
      if (typeof filename !== 'string' || path.basename(filename) !== filename || !imageExtensions.has(path.extname(filename).toLowerCase())) {
        throw new Error(`Unsafe candidate filename for ${board}/${component}`);
      }
      const filePath = path.join(candidateRoot, filename);
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) throw new Error(`Candidate is missing: ${filename}`);
      const sha256 = hashFile(filePath);
      const old = previous.get(key);
      const ledger = downloadLedger.get(key);
      if (ledger && (ledger.file !== filename || ledger.sha256 !== sha256 || Number(ledger.bytes) !== fs.statSync(filePath).size)) {
        throw new Error(`${board}/${component} differs from its download-integrity record; preserve the original and record provenance for the new file instead of replacing it`);
      }

      let row;
      if (old && old.candidateFile === `candidates/${filename}` && old.sha256?.toLowerCase() === sha256) {
        row = { ...old };
        row.provenance ||= ledger
          ? 'Recovered from the previous live manifest; download integrity verified only.'
          : `Local quarantine import; file hash recorded ${today}; source not independently verified.`;
      } else {
        if (old) changedPairs.push(`${board}/${component}`);
        row = Object.fromEntries(columns.map((column) => [column, '']));
        Object.assign(row, {
          board,
          component,
          candidateFile: `candidates/${filename}`,
          sha256,
          status: 'PENDING',
          sourceUrls: '',
          reviewer: '',
          reviewedAt: '',
          provenance: ledger
            ? 'Recovered from the previous live manifest; download integrity verified only.'
            : `Local quarantine import; file hash recorded ${today}; source not independently verified.`,
          notes: old ? 'Candidate bytes or file changed; prior review invalidated and reset to PENDING.' : '',
        });
        for (const field of reviewChecks) row[field] = 'NOT_REVIEWED';
      }
      rows.push(row);
      seen.add(key);
    }
  }

  const removedRows = previousRows.filter((row) => !seen.has(`${row.board}\0${row.component}`));
  const removedApproved = removedRows.filter((row) => row.status === 'APPROVED');
  if (removedApproved.length) {
    throw new Error(`Refusing to discard approved review records absent from the index: ${removedApproved.map((row) => `${row.board}/${row.component}`).join(', ')}`);
  }
  if (removedRows.length) {
    throw new Error(`Review rows are missing from the candidate index (${removedRows.length}); restore the files/index or explicitly archive those rows before registration`);
  }

  const integrityKeys = [...downloadLedger.keys()];
  for (const key of integrityKeys) {
    if (!seen.has(key)) throw new Error(`Download-integrity record has no indexed candidate: ${key.replace('\0', '/')}`);
  }
  const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  const counts = { PENDING: 0, REJECTED: 0, APPROVED: 0 };
  for (const row of rows) {
    if (!(row.status in counts)) throw new Error(`Unknown status for ${row.board}/${row.component}: ${row.status}`);
    counts[row.status] += 1;
  }
  const publicManifest = JSON.parse(fs.readFileSync(path.join(frontendDir, 'public', 'wiring', 'manifest.json'), 'utf8'));
  const publicPairs = Object.values(publicManifest).reduce((total, mappings) => total + Object.keys(mappings).length, 0);
  const nextStatus = {
    ...status,
    candidateBoardCount: Object.keys(candidateIndex).length,
    candidatePairCount: rows.length,
    statusCounts: { pending: counts.PENDING, rejected: counts.REJECTED, approved: counts.APPROVED },
    verifiedPhotoPairs: publicPairs,
    candidateImagesAreShownToVisitors: false,
    status: counts.PENDING === 0 ? 'REVIEW-COMPLETE' : 'REVIEW-IN-PROGRESS',
    reason: counts.PENDING
      ? `${counts.PENDING} candidate pair(s) remain pending; approved images are published only through the hash-checked promotion command, and rejected candidates remain quarantined.`
      : 'All candidate pairs have a review disposition; only human-approved, hash-checked assets may be public.',
  };
  const csv = [columns.join(','), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(','))].join('\n') + '\n';
  const oldMatrix = fs.existsSync(matrixPath) ? fs.readFileSync(matrixPath, 'utf8') : null;
  const oldStatus = fs.readFileSync(statusPath, 'utf8');
  const tempMatrix = `${matrixPath}.${process.pid}.tmp`;
  const tempStatus = `${statusPath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tempMatrix, csv, 'utf8');
    fs.writeFileSync(tempStatus, `${JSON.stringify(nextStatus, null, 2)}\n`, 'utf8');
    fs.renameSync(tempMatrix, matrixPath);
    fs.renameSync(tempStatus, statusPath);
  } catch (error) {
    fs.rmSync(tempMatrix, { force: true });
    fs.rmSync(tempStatus, { force: true });
    if (oldMatrix === null) fs.rmSync(matrixPath, { force: true });
    else atomicWrite(matrixPath, oldMatrix);
    atomicWrite(statusPath, oldStatus);
    throw error;
  }

  console.log(`✓ Registered ${rows.length} exact-hash candidate pair(s): ${counts.PENDING} pending, ${counts.REJECTED} rejected, ${counts.APPROVED} approved.`);
  if (changedPairs.length) console.log(`! Prior reviews reset because file/hash changed: ${changedPairs.join(', ')}`);
}

try {
  main();
} catch (error) {
  console.error(`✗ Candidate registration failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
