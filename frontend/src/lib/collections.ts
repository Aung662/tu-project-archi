/**
 * Collections — student-made, named folders of projects (e.g. "Thesis refs",
 * "IoT ideas"), stored in localStorage (no backend, no login, private to the
 * device). Unlike a flat bookmark list, collections let a student ORGANISE the
 * projects they save, which is a strong reason to return and keep curating.
 *
 * Data shape: a list of collections, each holding project "items" (id + title +
 * light metadata for rendering cards without a refetch). Everything is capped
 * and de-duplicated, and all writes emit COLLECTIONS_EVENT for same-tab syncing.
 */
export interface CollectionItem {
  id: string;
  title: string;
  year?: number;
  deptCode?: string;
  uniShort?: string;
  at: number; // when added
}

export interface Collection {
  id: string;
  name: string;
  createdAt: number;
  items: CollectionItem[];
}

const KEY = 'tu-collections';
const MAX_COLLECTIONS = 30;
const MAX_ITEMS = 200;
export const COLLECTIONS_EVENT = 'tu-collections-updated';

function emit(): void {
  try {
    window.dispatchEvent(new Event(COLLECTIONS_EVENT));
  } catch {
    /* non-browser */
  }
}

function readAll(): Collection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Collection[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list: Collection[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_COLLECTIONS)));
    emit();
  } catch {
    /* storage full/disabled — non-critical */
  }
}

/** All collections, most-recently-created first. */
export function getCollections(): Collection[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function getCollection(id: string): Collection | undefined {
  return readAll().find((c) => c.id === id);
}

function makeId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Create a new (named) collection and return it. */
export function createCollection(name: string): Collection {
  const clean = name.trim().slice(0, 60) || 'Untitled';
  const col: Collection = { id: makeId(), name: clean, createdAt: Date.now(), items: [] };
  const list = readAll();
  writeAll([col, ...list]);
  return col;
}

export function renameCollection(id: string, name: string): void {
  const clean = name.trim().slice(0, 60);
  if (!clean) return;
  const list = readAll().map((c) => (c.id === id ? { ...c, name: clean } : c));
  writeAll(list);
}

export function deleteCollection(id: string): void {
  writeAll(readAll().filter((c) => c.id !== id));
}

/** True when the given project is in the given collection. */
export function isInCollection(collectionId: string, projectId: string): boolean {
  const col = getCollection(collectionId);
  return Boolean(col?.items.some((i) => i.id === projectId));
}

/** Collections that already contain this project (for the "saved to" state). */
export function collectionsWithProject(projectId: string): string[] {
  return readAll()
    .filter((c) => c.items.some((i) => i.id === projectId))
    .map((c) => c.id);
}

/** Add a project to a collection (no-op if already present). */
export function addToCollection(collectionId: string, item: Omit<CollectionItem, 'at'>): void {
  const list = readAll().map((c) => {
    if (c.id !== collectionId) return c;
    if (c.items.some((i) => i.id === item.id)) return c;
    return { ...c, items: [{ ...item, at: Date.now() }, ...c.items].slice(0, MAX_ITEMS) };
  });
  writeAll(list);
}

/** Remove a project from a collection. */
export function removeFromCollection(collectionId: string, projectId: string): void {
  const list = readAll().map((c) =>
    c.id === collectionId ? { ...c, items: c.items.filter((i) => i.id !== projectId) } : c,
  );
  writeAll(list);
}

/** Toggle membership; returns the new state (true = now in the collection). */
export function toggleInCollection(collectionId: string, item: Omit<CollectionItem, 'at'>): boolean {
  if (isInCollection(collectionId, item.id)) {
    removeFromCollection(collectionId, item.id);
    return false;
  }
  addToCollection(collectionId, item);
  return true;
}

export { MAX_COLLECTIONS };
