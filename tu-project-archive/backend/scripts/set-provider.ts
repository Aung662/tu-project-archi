/**
 * Generates prisma/schema.prisma from prisma/schema.template.prisma using the
 * DB_PROVIDER env var. Keeps a single source of truth for models while allowing
 * SQLite (dev/demo) and PostgreSQL (prod + pg_trgm) datasources.
 *
 * Run with tsx (already a dev dependency):
 *   DB_PROVIDER=postgresql tsx scripts/set-provider.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));

// Only these two providers are supported by the schema template.
type Provider = 'sqlite' | 'postgresql';
const requested = (process.env.DB_PROVIDER || 'sqlite').trim();

function isProvider(v: string): v is Provider {
  return v === 'sqlite' || v === 'postgresql';
}

if (!isProvider(requested)) {
  console.error(`Unsupported DB_PROVIDER: "${requested}" (use sqlite|postgresql)`);
  process.exit(1);
}

const templatePath = resolve(scriptDir, '../prisma/schema.template.prisma');
const outPath = resolve(scriptDir, '../prisma/schema.prisma');

// Inject the concrete provider into the template's datasource block.
const template = readFileSync(templatePath, 'utf8');
const output = template.replaceAll('__PROVIDER__', requested);
writeFileSync(outPath, output);

console.log(`✅ prisma/schema.prisma generated with provider="${requested}"`);
