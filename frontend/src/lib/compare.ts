/**
 * Compare list — up to 3 projects a student wants to view side by side, stored
 * in localStorage (no backend). A floating bar shows the current selection and
 * links to /compare. Brings students back to weigh options for their own work.
 */
export interface CompareItem {
  id: string;
  title: string;
  at: number;
}

const KEY = 'tu-compare';
export const MAX_COMPARE = 3;
export const COMPARE_EVENT = 'tu-compare-updated';

export function getCompare(): CompareItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const items = raw ? (JSON.parse(raw) as CompareItem[]) : [];
    return Array.isArray(items) ? items.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

export function isInCompare(id: string): boolean {
  return getCompare().some((x) => x.id === id);
}

/** Add a project. Returns false if the list is already full (and item absent). */
export function addCompare(item: Omit<CompareItem, 'at'>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getCompare();
    if (list.some((x) => x.id === item.id)) return true; // already in
    if (list.length >= MAX_COMPARE) return false; // full
    const next = [...list, { ...item, at: Date.now() }];
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(COMPARE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function removeCompare(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(getCompare().filter((x) => x.id !== id)));
    window.dispatchEvent(new Event(COMPARE_EVENT));
  } catch {
    /* ignore */
  }
}

/** Toggle membership; respects the max. Returns the resulting membership. */
export function toggleCompare(item: Omit<CompareItem, 'at'>): boolean {
  if (isInCompare(item.id)) {
    removeCompare(item.id);
    return false;
  }
  return addCompare(item);
}

export function clearCompare(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(COMPARE_EVENT));
  } catch {
    /* ignore */
  }
}
