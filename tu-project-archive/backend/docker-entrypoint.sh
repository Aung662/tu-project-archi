#!/bin/sh
# ─────────────────────────────────────────────────────────────
# Container startup for platforms without a separate release phase
# (e.g. Koyeb, Fly). Idempotent, so it is safe to run on every boot.
#
# On PostgreSQL it:
#   1) creates/updates tables            (prisma db push)
#   2) enables pg_trgm + trigram index   (scripts/setup-postgres.ts)
#   3) seeds admin + reference data       (prisma/seed.ts — uses upserts)
# then starts the API. On SQLite it just starts the API.
# ─────────────────────────────────────────────────────────────
set -e

if [ "$DB_PROVIDER" = "postgresql" ]; then
  echo "→ [entrypoint] DB_PROVIDER=postgresql — bootstrapping database..."
  npx prisma db push --skip-generate --accept-data-loss
  npx tsx scripts/setup-postgres.ts
  npx tsx prisma/seed.ts
  echo "✅ [entrypoint] database ready."
else
  echo "ℹ️  [entrypoint] DB_PROVIDER=$DB_PROVIDER — skipping bootstrap."
fi

exec node dist/server.js
