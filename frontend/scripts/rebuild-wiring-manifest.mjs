#!/usr/bin/env node
/**
 * rebuild-wiring-manifest.mjs
 * ==========================================================================
 * Rebuild the candidate index in `frontend/quality/wiring-review/candidates/`
 * from the non-public review images already staged there.
 *
 * WHY THIS EXISTS
 * ---------------
 * This script indexes REVIEW CANDIDATES only. The candidate directory is
 * outside `frontend/public`, so none of the generated images become visible to
 * website visitors. A separate source-backed review/promotion process is
 * required before any image is added to the public verified manifest.
 *
 * WHAT IT DOES
 * ------------
 *   1. Scans quality/wiring-review/candidates for files named
 *      <boardId>__<componentId>.(jpg|jpeg|png|webp).
 *   2. Validates ids against the UI catalog and reports unknown ids.
 *   3. Writes a candidate-only manifest in the review area.
 *   4. Prints counts; no candidate is copied to public/wiring.
 *
 * USAGE (from the frontend/ folder, or anywhere):
 *   node scripts/rebuild-wiring-manifest.mjs
 *   node scripts/rebuild-wiring-manifest.mjs /path/to/tu-project-archi   (repo root)
 *
 * SAFE: only writes the review candidate index. Never renames, moves,
 * publishes, or deletes an image.
 * ==========================================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const IMG_RE = /\.(jpe?g|png|webp)$/i;

// --------------------------------------------------------------------------
// Locate the repo root + the wiring folder.
// --------------------------------------------------------------------------
const here = path.dirname(fileURLToPath(import.meta.url)); // frontend/scripts
const repoRootArg = process.argv[2];
const frontendDir = repoRootArg
  ? path.join(path.resolve(repoRootArg), 'frontend')
  : path.resolve(here, '..'); // scripts/.. = frontend
const wiringDir = path.join(frontendDir, 'quality', 'wiring-review', 'candidates');
const componentsFile = path.join(frontendDir, 'src', 'data', 'components.ts');

if (!fs.existsSync(wiringDir)) {
  console.error('✗ wiring candidate folder not found:', wiringDir);
  console.error('  Pass the repo root, e.g.: node scripts/rebuild-wiring-manifest.mjs "D:\\TU project\\KK\\tu-project-archi"');
  process.exit(1);
}

// --------------------------------------------------------------------------
// Load the set of VALID ids (boards + components) straight from the site data,
// so this script can never drift from what the UI actually knows about.
// --------------------------------------------------------------------------
function loadValidIds() {
  const ids = new Set();
  try {
    const src = fs.readFileSync(componentsFile, 'utf8');
    for (const m of src.matchAll(/id:\s*'([a-z0-9-]+)'/g)) ids.add(m[1]);
  } catch {
    console.warn('! Could not read components.ts — proceeding without id validation.');
  }
  return ids;
}
const validIds = loadValidIds();
const validate = validIds.size > 0;

// --------------------------------------------------------------------------
// Scan the folder and build the manifest.
// --------------------------------------------------------------------------
const manifestPath = path.join(wiringDir, 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
  throw new Error('Existing candidate manifest is invalid; refusing to overwrite it.');
}
const gallery = []; // { file, board }  — everything that isn't a clean pair
const skipped = []; // { file, reason }
let indexed = 0;

for (const name of fs.readdirSync(wiringDir).sort()) {
  if (!IMG_RE.test(name)) continue; // ignore README.md, manifest.json, etc.

  const bare = name.replace(IMG_RE, '');
  const parts = bare.split('__');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    skipped.push({ file: name, reason: 'name is not <board>__<component>' });
    continue;
  }
  const [board, component] = parts;

  if (validate && !validIds.has(board)) {
    skipped.push({ file: name, reason: `unknown board id "${board}"` });
    continue;
  }
  if (validate && !validIds.has(component)) {
    skipped.push({ file: name, reason: `unknown component id "${component}"` });
    continue;
  }

  const boardManifest = (manifest[board] ||= {});
  if (boardManifest[component] && boardManifest[component] !== name) {
    skipped.push({ file: name, reason: `duplicate pair; existing candidate is ${boardManifest[component]} (kept unchanged)` });
    continue;
  }
  boardManifest[component] = name;
  indexed++;
}

// Index the gallery folder too (generic / extra images) so nothing is lost.
const galleryDir = path.join(wiringDir, 'gallery');
if (fs.existsSync(galleryDir)) {
  for (const name of fs.readdirSync(galleryDir).sort()) {
    if (!IMG_RE.test(name)) continue;
    // Gallery names look like  <board>__g-3.jpg / <board>__extra-1.jpg / other__g-5.jpg
    const board = name.split('__')[0];
    const known = board && board !== 'other' && (!validate || validIds.has(board));
    gallery.push({ file: `gallery/${name}`, board: known ? board : null });
  }
}
const galleryPath = path.join(wiringDir, 'gallery.json');
fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2) + '\n');

// --------------------------------------------------------------------------
// Write manifest.json (sorted for a stable, diff-friendly file).
// --------------------------------------------------------------------------
const sorted = {};
for (const board of Object.keys(manifest).sort()) {
  sorted[board] = {};
  for (const comp of Object.keys(manifest[board]).sort()) {
    sorted[board][comp] = manifest[board][comp];
  }
}
fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + '\n');

// Register new/changed indexed files as PENDING and preserve unchanged review records.
const registerScript = path.join(here, 'register-wiring-candidates.mjs');
const registerRepoRoot = repoRootArg ? path.resolve(repoRootArg) : path.resolve(frontendDir, '..');
const registration = spawnSync(process.execPath, [registerScript, registerRepoRoot], { cwd: frontendDir, encoding: 'utf8' });
process.stdout.write(registration.stdout ?? '');
process.stderr.write(registration.stderr ?? '');
if (registration.error) throw registration.error;
if (registration.status !== 0) process.exit(registration.status ?? 1);

// --------------------------------------------------------------------------
// Report.
// --------------------------------------------------------------------------
console.log('\n==========================================================');
console.log('  Rebuilt wiring candidate index');
console.log('==========================================================');
console.log('  Folder:   ', wiringDir);
console.log('  Manifest: ', manifestPath);
console.log(`  Candidate images indexed: ${indexed}  across ${Object.keys(sorted).length} board(s)`);
console.log(`  Extra candidates indexed: ${gallery.length}  (quality/wiring-review/candidates/gallery)\n`);
for (const board of Object.keys(sorted)) {
  console.log(`   • ${board.padEnd(18)} ${Object.keys(sorted[board]).length} candidate image(s)`);
}
if (skipped.length) {
  console.log(`\n  ! Skipped ${skipped.length} file(s):`);
  for (const s of skipped.slice(0, 40)) console.log(`     - ${s.file}  (${s.reason})`);
  if (skipped.length > 40) console.log(`     …and ${skipped.length - 40} more`);
} else {
  console.log('\n  ✓ Every image file was indexed.');
}
console.log('\n  Next: review candidates against exact hardware + datasheet sources.');
console.log('  Only explicitly approved assets belong in frontend/public/wiring.');
console.log('==========================================================\n');
