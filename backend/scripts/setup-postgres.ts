/**
 * Production database bootstrap for PostgreSQL deployments (e.g. Render).
 *
 * Runs the SQL in prisma/postgres-extensions.sql, which:
 *   1) enables the pg_trgm extension (fuzzy title similarity), and
 *   2) creates the GIN trigram index on Project.normalizedTitle.
 *
 * It is idempotent (every statement uses IF NOT EXISTS) and safe to run on
 * every deploy. On non-PostgreSQL providers it exits quietly, so the same
 * build pipeline works for the SQLite dev/demo path too.
 *
 * Order matters: this must run AFTER `prisma db push` has created the tables.
 *
 * Usage:  DB_PROVIDER=postgresql tsx scripts/setup-postgres.ts
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

const provider = (process.env.DB_PROVIDER || 'sqlite').trim();

async function main() {
  if (provider !== 'postgresql') {
    console.log(`ℹ️  DB_PROVIDER="${provider}" — skipping PostgreSQL extension setup.`);
    return;
  }

  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const sqlPath = resolve(scriptDir, '../prisma/postgres-extensions.sql');
  const raw = readFileSync(sqlPath, 'utf8');

  // Split into individual statements, dropping comments and blank lines.
  const statements = raw
    .split(';')
    .map((s) =>
      s
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter((s) => s.length > 0);

  const prisma = new PrismaClient();
  try {
    for (const stmt of statements) {
      console.log(`→ running: ${stmt.split('\n')[0].slice(0, 70)}...`);
      await prisma.$executeRawUnsafe(stmt);
    }
    console.log('✅ PostgreSQL extensions + trigram index ensured.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌ setup-postgres failed:', err);
  process.exit(1);
});
