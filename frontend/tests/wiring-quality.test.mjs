import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parseCsv, validateApprovedReview } from '../scripts/check-wiring-quality.mjs';
import { candidateOutputDirectory, classify, norm } from '../scripts/organize-wiring-images.mjs';

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const validRow = {
  board: 'test-board',
  component: 'test-module',
  status: 'APPROVED',
  boardModelVerified: 'YES',
  moduleModelVerified: 'YES',
  pinLabelsVerified: 'YES',
  wireEndpointsVerified: 'YES',
  powerGroundVerified: 'YES',
  voltageSafetyVerified: 'YES',
  imageLegibilityVerified: 'YES',
  writtenInstructionsConsistent: 'YES',
  rightsConfirmed: 'YES',
  sourceUrls: 'https://example.org/datasheet.pdf; https://example.org/pinout',
  reviewer: 'Jane Reviewer',
  reviewedAt: '2026-10-03',
  notes: 'Checked the exact board revision and published pin labels.',
};

test('review matrix CSV parser handles commas, quotes, and embedded newlines', () => {
  const [row] = parseCsv('name,notes\n"Board, rev. 3","Said ""check the pin""\nthen verified."\n');
  assert.deepEqual(row, { name: 'Board, rev. 3', notes: 'Said "check the pin"\nthen verified.' });
});

test('review matrix CSV parser rejects malformed quoting', () => {
  assert.throws(() => parseCsv('name,notes\nboard,"missing close\n'), /unterminated quoted field/);
  assert.throws(() => parseCsv('name,notes\nbo"ard,ok\n'), /unexpected quote/);
});

test('a candidate can pass the approval gate only with complete human/source checks', () => {
  assert.doesNotThrow(() => validateApprovedReview(validRow));
  assert.throws(() => validateApprovedReview({ ...validRow, voltageSafetyVerified: 'NOT_REVIEWED' }), /voltageSafetyVerified/);
  assert.throws(() => validateApprovedReview({ ...validRow, sourceUrls: 'http://example.org' }), /HTTPS source URLs/);
  assert.throws(() => validateApprovedReview({ ...validRow, reviewer: 'Agent visual audit' }), /named human reviewer/);
});

test('curated Uno–HC-SR04 recipe keeps the exact reviewed pin pairs', () => {
  const recipes = JSON.parse(fs.readFileSync(path.join(frontendDir, 'src/data/verifiedWiring.json'), 'utf8')).recipes;
  const recipe = recipes.find((entry) => entry.id === 'arduino-uno__hc-sr04');
  assert.ok(recipe, 'the curated Uno + HC-SR04 recipe exists');
  assert.deepEqual(recipe.connections.map(({ boardPin, componentPin }) => [boardPin, componentPin]), [
    ['D9', 'TRIG'],
    ['D10', 'ECHO'],
    ['5V', 'VCC'],
    ['GND', 'GND'],
  ]);
  assert.equal(new Set(recipe.connections.map(({ id }) => id)).size, recipe.connections.length);
  assert.ok(recipe.sources.some(({ url }) => url.startsWith('https://')));
});

test('organizer sends candidate files to a non-public review quarantine', () => {
  const output = candidateOutputDirectory(path.resolve(frontendDir, '..'));
  assert.equal(output, path.join(frontendDir, 'quality', 'wiring-review', 'candidates'));
  assert.equal(path.relative(path.join(frontendDir, 'public'), output).startsWith('..'), true);
});

test('organizer does not guess a module from a generic board-only filename', () => {
  assert.deepEqual(classify(norm('Arduino wiring diagram')), { ok: false, reason: 'no module matched', board: 'arduino-uno' });
  assert.deepEqual(classify(norm('Arduino Uno and HC-SR04')), { ok: true, board: 'arduino-uno', component: 'hc-sr04' });
});

test('promotion refuses a pending candidate even in dry-run mode', () => {
  const result = spawnSync(process.execPath, [
    path.join(frontendDir, 'scripts/promote-reviewed-wiring.mjs'),
    'arduino-mega', 'lm35', '--dry-run',
  ], { cwd: frontendDir, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /is PENDING/);
});

test('current quarantined and public wiring assets satisfy the publication gate', () => {
  const result = spawnSync(process.execPath, [path.join(frontendDir, 'scripts/check-wiring-quality.mjs')], {
    cwd: frontendDir,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
