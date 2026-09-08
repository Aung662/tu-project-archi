/**
 * Download history — a private, on-device log of the project files a student has
 * downloaded, stored in localStorage (no backend, no login). It complements the
 * "recently viewed" list (which tracks pages opened) by recording actual file
 * downloads, so a student can quickly get back to a paper they already fetched.
 * Capped and de-duplicated by project id (latest download wins / bumps to top).
 */
export interface DownloadRecord {
  id: string;
  title: string;
  year?: number;
  deptCode?: string;
  uniShort?: string;
  at: number; // last downloaded
  count: number; // times downloaded
}

const KEY = 'tu-download-history';
const MAX = 50;
export const DOWNLOAD_HISTORY_EVENT = 'tu-download-history-updated';

export function getDownloadHistory(): DownloadRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as DownloadRecord[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Record a successful download. If the project was downloaded before, its entry
 * is bumped to the top and its count incremented; otherwise a new entry is
 * prepended. Call this ONLY after a download actually succeeds.
 */
export function recordDownload(item: Omit<DownloadRecord, 'at' | 'count'>): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDownloadHistory();
    const prev = list.find((x) => x.id === item.id);
    const rest = list.filter((x) => x.id !== item.id);
    const next: DownloadRecord = {
      ...item,
      at: Date.now(),
      count: (prev?.count ?? 0) + 1,
    };
    localStorage.setItem(KEY, JSON.stringify([next, ...rest].slice(0, MAX)));
    window.dispatchEvent(new Event(DOWNLOAD_HISTORY_EVENT));
  } catch {
    /* storage full/disabled — non-critical */
  }
}

export function clearDownloadHistory(): void {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(DOWNLOAD_HISTORY_EVENT));
  } catch {
    /* non-critical */
  }
}

export function removeDownloadRecord(id: string): void {
  try {
    const next = getDownloadHistory().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(DOWNLOAD_HISTORY_EVENT));
  } catch {
    /* non-critical */
  }
}
