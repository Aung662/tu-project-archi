/**
 * Component comparison — up to 3 toolkit components a student wants to weigh
 * side by side (e.g. HC-SR04 vs VL53L0X vs Sharp IR for distance sensing).
 * Stored in localStorage, mirroring the project-compare pattern but keyed by
 * component id. A tray surfaces the current pick and opens a spec-table modal.
 */
const KEY = 'tu-component-compare';
export const MAX_COMPONENT_COMPARE = 3;
export const COMPONENT_COMPARE_EVENT = 'tu-component-compare-updated';

export function getComponentCompare(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(ids) ? ids.filter((x) => typeof x === 'string').slice(0, MAX_COMPONENT_COMPARE) : [];
  } catch {
    return [];
  }
}

export function isInComponentCompare(id: string): boolean {
  return getComponentCompare().includes(id);
}

/** Add an id. Returns false if the tray is already full (and id absent). */
export function addComponentCompare(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getComponentCompare();
    if (list.includes(id)) return true;
    if (list.length >= MAX_COMPONENT_COMPARE) return false;
    const next = [...list, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(COMPONENT_COMPARE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function removeComponentCompare(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(getComponentCompare().filter((x) => x !== id)));
    window.dispatchEvent(new Event(COMPONENT_COMPARE_EVENT));
  } catch {
    /* ignore */
  }
}

/** Toggle membership; respects the max. Returns resulting membership. */
export function toggleComponentCompare(id: string): boolean {
  if (isInComponentCompare(id)) {
    removeComponentCompare(id);
    return false;
  }
  return addComponentCompare(id);
}

export function clearComponentCompare(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(COMPONENT_COMPARE_EVENT));
  } catch {
    /* ignore */
  }
}
