/**
 * "Recently viewed" projects, stored in localStorage (no backend, no login
 * needed). A visitor's last-viewed titles follow them across the site so they
 * can jump back to something they were reading. Capped and de-duplicated.
 */
export interface RecentItem {
  id: string;
  title: string;
  year: number;
  deptCode: string;
  uniShort: string;
  at: number; // timestamp
}

const KEY = 'tu-recently-viewed';
const MAX = 8;

export function getRecentlyViewed(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as RecentItem[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentItem, 'at'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentlyViewed().filter((x) => x.id !== item.id);
    const next = [{ ...item, at: Date.now() }, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    // Let any mounted list know it changed (same-tab updates).
    window.dispatchEvent(new Event('tu-recent-updated'));
  } catch {
    /* storage full / disabled — non-critical */
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event('tu-recent-updated'));
  } catch {
    /* ignore */
  }
}
