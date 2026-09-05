-- PostgreSQL production tuning for TU Project Archive.
-- Run ONCE after `prisma migrate deploy` on a PostgreSQL database.
-- Requires privileges to create extensions.

-- 1) Enable trigram similarity (fuzzy title matching).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2) GIN index on the normalized title for fast `%` / similarity() queries.
--    This backs the pg_trgm codepath in search.service.ts.
CREATE INDEX IF NOT EXISTS project_normalized_title_trgm_idx
  ON "Project"
  USING GIN ("normalizedTitle" gin_trgm_ops);

-- 3) (Optional) tune the default similarity threshold used by the `%` operator.
--    The app uses explicit similarity() comparisons, so this is informational.
-- SET pg_trgm.similarity_threshold = 0.3;
