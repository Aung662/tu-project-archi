/**
 * Research notes — a student's private, per-project notes stored in
 * localStorage (no backend, no login, private to the device). Lets students
 * jot ideas while browsing and revisit them from a dedicated Notes page — a
 * genuine thesis literature-review aid and a strong reason to return.
 */
export interface ProjectNote {
  projectId: string;
  title: string;
  text: string;
  updatedAt: number;
}

const KEY = 'tu-notes';
export const NOTES_EVENT = 'tu-notes-updated';

type NoteMap = Record<string, ProjectNote>;

function readAll(): NoteMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    const obj = raw ? (JSON.parse(raw) as NoteMap) : {};
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function writeAll(map: NoteMap): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(NOTES_EVENT));
  } catch {
    /* storage full/disabled — non-critical */
  }
}

/** All notes, newest-updated first. */
export function getNotes(): ProjectNote[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getNote(projectId: string): ProjectNote | null {
  return readAll()[projectId] ?? null;
}

/** Create/update a note. An empty/whitespace text deletes the note. */
export function saveNote(projectId: string, title: string, text: string): void {
  if (typeof window === 'undefined') return;
  const map = readAll();
  if (!text.trim()) {
    delete map[projectId];
  } else {
    map[projectId] = { projectId, title, text: text.trim(), updatedAt: Date.now() };
  }
  writeAll(map);
}

export function deleteNote(projectId: string): void {
  if (typeof window === 'undefined') return;
  const map = readAll();
  delete map[projectId];
  writeAll(map);
}

export function notesCount(): number {
  return Object.keys(readAll()).length;
}
