/**
 * Saved searches — the exact query + filters a student ran, stored in
 * localStorage (no backend, no login). They can re-run a search with one tap,
 * which brings them back to the site. Capped and de-duplicated by signature.
 */
export interface SearchQuery {
  q: string;
  universityId: string;
  departmentId: string;
  level: string;
  year: string;
}

export interface SavedSearch extends SearchQuery {
  id: string; // signature (see makeSignature)
  label: string;
  at: number;
}

const KEY = 'tu-saved-searches';
const MAX = 12;
export const SAVED_SEARCHES_EVENT = 'tu-saved-searches-updated';

function makeSignature(q: SearchQuery): string {
  return [q.q.trim().toLowerCase(), q.universityId, q.departmentId, q.level, q.year].join('|');
}

export function getSavedSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const items = raw ? (JSON.parse(raw) as SavedSearch[]) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/** True when this exact query is already saved. */
export function isSearchSaved(q: SearchQuery): boolean {
  const sig = makeSignature(q);
  return getSavedSearches().some((s) => s.id === sig);
}

/** A query is "meaningful" (worth saving) if it has at least one active field. */
export function isMeaningfulQuery(q: SearchQuery): boolean {
  return Boolean(q.q.trim() || q.universityId || q.departmentId || q.level || q.year);
}

export function saveSearch(q: SearchQuery, label: string): void {
  if (typeof window === 'undefined' || !isMeaningfulQuery(q)) return;
  try {
    const sig = makeSignature(q);
    const existing = getSavedSearches().filter((s) => s.id !== sig);
    const next = [{ ...q, id: sig, label, at: Date.now() }, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_SEARCHES_EVENT));
  } catch {
    /* storage full/disabled — non-critical */
  }
}

export function removeSavedSearch(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(getSavedSearches().filter((s) => s.id !== id)));
    window.dispatchEvent(new Event(SAVED_SEARCHES_EVENT));
  } catch {
    /* ignore */
  }
}

/** Build a query-string for /browse from a saved search. */
export function toQueryString(s: SearchQuery): string {
  const p = new URLSearchParams();
  if (s.q) p.set('q', s.q);
  if (s.universityId) p.set('universityId', s.universityId);
  if (s.departmentId) p.set('departmentId', s.departmentId);
  if (s.level) p.set('level', s.level);
  if (s.year) p.set('year', s.year);
  return p.toString();
}
