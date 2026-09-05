/**
 * Portable similarity engine.
 *
 * Mirrors the *shape* of PostgreSQL pg_trgm ranking so the app produces
 * consistent, defensible results on SQLite (dev/demo) and degrades gracefully
 * when the pg extension is unavailable.
 *
 * Blended score = 0.55·trigramJaccard + 0.30·tokenOverlap + 0.15·(1 − normLevenshtein)
 *
 * - trigramJaccard: character-trigram set overlap — the same idea pg_trgm uses.
 * - tokenOverlap:   word-level Jaccard — robust to reordering ("A of B" vs "B A").
 * - levenshtein:    edit distance — catches small typos / near-identical titles.
 */
import { contentTokens } from './normalize.js';

/** pg_trgm-style trigram set: pad with spaces, take 3-char windows. */
export function trigrams(s: string): Set<string> {
  const padded = `  ${s} `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) grams.add(padded.slice(i, i + 3));
  return grams;
}

function jaccard<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Iterative Levenshtein with O(min(m,n)) memory. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (a.length < b.length) [a, b] = [b, a];

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

function normalizedLevenshtein(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  return levenshtein(a, b) / maxLen;
}

export interface ScoreBreakdown {
  score: number; // 0..1 blended
  trigram: number;
  token: number;
  edit: number; // 1 - normalizedLevenshtein
}

const W_TRIGRAM = 0.55;
const W_TOKEN = 0.3;
const W_EDIT = 0.15;

/** Compare two already-NORMALIZED titles. */
export function scoreNormalized(qNorm: string, candNorm: string): ScoreBreakdown {
  const trigram = jaccard(trigrams(qNorm), trigrams(candNorm));
  const token = jaccard(new Set(contentTokens(qNorm)), new Set(contentTokens(candNorm)));
  const edit = 1 - normalizedLevenshtein(qNorm, candNorm);
  const score = W_TRIGRAM * trigram + W_TOKEN * token + W_EDIT * edit;
  return {
    score: Math.round(score * 1000) / 1000,
    trigram: Math.round(trigram * 1000) / 1000,
    token: Math.round(token * 1000) / 1000,
    edit: Math.round(edit * 1000) / 1000,
  };
}
