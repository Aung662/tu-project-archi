/**
 * Title normalization pipeline. Shared by ingest (store normalizedTitle) and
 * query (normalize the search term the same way). Deterministic + Unicode-safe
 * so English and Myanmar Unicode titles both behave predictably.
 */

// A compact English stopword list. Kept small on purpose: academic titles are
// short, so over-aggressive stopword removal hurts more than it helps.
const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'for', 'to', 'and', 'or', 'in', 'on', 'with', 'by',
  'using', 'based', 'system', 'project', 'study', 'design', 'implementation',
]);

/** Full normalization used to compute the stored normalizedTitle. */
export function normalizeTitle(raw: string): string {
  return (
    raw
      .normalize('NFC')
      .toLowerCase()
      // replace any non-alphanumeric (Unicode-aware) with a space
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .replace(/\s+/g, ' ')
  );
}

/** Tokenize + drop stopwords + drop 1-char tokens for token-overlap scoring. */
export function contentTokens(normalized: string): string[] {
  return normalized
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}
