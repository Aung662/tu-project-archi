/**
 * Recent title searches from the home page, stored in localStorage (no backend,
 * no login). Unlike "saved searches" (a deliberate bookmark of a filtered browse
 * query), these are captured automatically every time the student runs a title
 * similarity check, so they can re-run a recent idea with one tap. Capped and
 * de-duplicated (case-insensitive), newest first.
 */
const KEY = 'tu-recent-searches';
const MAX = 8;
export const RECENT_SEARCHES_EVENT = 'tu-recent-searches-updated';

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const items = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(items) ? items.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;
  const q = query.trim();
  if (q.length < 2) return;
  try {
    const existing = getRecentSearches().filter((x) => x.toLowerCase() !== q.toLowerCase());
    const next = [q, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECENT_SEARCHES_EVENT));
  } catch {
    /* storage full / disabled — non-critical */
  }
}

export function removeRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;
  try {
    const next = getRecentSearches().filter((x) => x.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECENT_SEARCHES_EVENT));
  } catch {
    /* ignore */
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(RECENT_SEARCHES_EVENT));
  } catch {
    /* ignore */
  }
}
