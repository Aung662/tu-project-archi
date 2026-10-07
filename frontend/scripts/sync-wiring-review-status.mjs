#!/usr/bin/env node
/** Refresh the compact review-status.json summary from the review matrix/public manifest. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './check-wiring-quality.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, '..');
const reviewRoot = path.join(frontendDir, 'quality', 'wiring-review');
const publicRoot = path.join(frontendDir, 'public', 'wiring');
const matrixPath = path.join(reviewRoot, 'review-matrix.csv');
const statusPath = path.join(reviewRoot, 'review-status.json');

function main() {
  const rows = parseCsv(fs.readFileSync(matrixPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(publicRoot, 'manifest.json'), 'utf8'));
  const statusPathTmp = `${statusPath}.${process.pid}.tmp`;
  const counts = { PENDING: 0, REJECTED: 0, APPROVED: 0 };
  for (const row of rows) {
    if (!(row.status in counts)) throw new Error(`Unknown review status "${row.status}" for ${row.board}/${row.component}`);
    counts[row.status] += 1;
  }
  const publicPairCount = Object.values(manifest).reduce((total, pairs) => total + Object.keys(pairs).length, 0);
  const previous = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  const next = {
    ...previous,
    statusCounts: {
      pending: counts.PENDING,
      rejected: counts.REJECTED,
      approved: counts.APPROVED,
    },
    verifiedPhotoPairs: publicPairCount,
    status: counts.PENDING === 0 ? 'REVIEW-COMPLETE' : 'REVIEW-IN-PROGRESS',
    reason: counts.PENDING
      ? `${counts.PENDING} candidate pair(s) remain pending; approved images are published only through the hash-checked promotion command, and rejected candidates remain quarantined.`
      : 'All candidate pairs have a review disposition; only human-approved, hash-checked assets may be public.',
  };
  fs.writeFileSync(statusPathTmp, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  fs.renameSync(statusPathTmp, statusPath);
  console.log(`✓ Review status synchronized: ${counts.PENDING} pending, ${counts.REJECTED} rejected, ${counts.APPROVED} approved; ${publicPairCount} public.`);
}

try {
  main();
} catch (error) {
  console.error(`✗ Could not synchronize wiring review status: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
