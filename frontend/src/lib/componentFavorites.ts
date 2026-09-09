/**
 * Favourite toolkit components — a student's starred parts, stored in
 * localStorage (no backend, no login). Lets them curate a personal shortlist
 * (e.g. the parts for their current build) and filter the toolkit down to it.
 */
const KEY = 'tu-component-favorites';
export const COMPONENT_FAVORITES_EVENT = 'tu-component-favorites-updated';

export function getComponentFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(ids) ? ids.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getComponentFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getComponentFavorites();
    const has = list.includes(id);
    const next = has ? list.filter((x) => x !== id) : [...list, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(COMPONENT_FAVORITES_EVENT));
    return !has;
  } catch {
    return false;
  }
}

export function clearComponentFavorites(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(COMPONENT_FAVORITES_EVENT));
  } catch {
    /* ignore */
  }
}
