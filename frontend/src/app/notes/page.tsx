'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNotes, deleteNote, NOTES_EVENT, type ProjectNote } from '@/lib/notes';
import { EmptyState } from '@/components/ui';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/motion';
import { formatDate } from '@/lib/format';
import { tr, t } from '@/lib/i18n';

/**
 * "My research notes" — collects every per-project note the student has written
 * (localStorage, private to the device). A private notebook that pulls students
 * back to continue their literature review.
 */
export default function NotesPage() {
  const [notes, setNotes] = useState<ProjectNote[] | null>(null);

  useEffect(() => {
    const sync = () => setNotes(getNotes());
    sync();
    window.addEventListener(NOTES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(NOTES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">{tr(t.notesTitle)}</h1>
        <p className="mt-2 text-sm text-slate-400">{tr(t.notesSubtitle)}</p>
      </Reveal>

      {notes && notes.length === 0 && (
        <EmptyState title={tr(t.noteEmpty)} hint={tr(t.noteEmptyHint)} />
      )}

      {notes && notes.length > 0 && (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => (
            <StaggerItem key={n.projectId}>
              <div className="card flex h-full flex-col gap-3 p-5">
                <Link
                  href={`/projects/${n.projectId}`}
                  className="font-semibold leading-tight text-slate-100 hover:text-brand-300"
                >
                  {n.title}
                </Link>
                <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                  {n.text}
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-500">
                  <span className="font-latin">{formatDate(new Date(n.updatedAt).toISOString())}</span>
                  <div className="flex items-center gap-3">
                    <Link href={`/projects/${n.projectId}`} className="text-brand-300 hover:text-brand-200">
                      {tr(t.noteView)}
                    </Link>
                    <button
                      onClick={() => deleteNote(n.projectId)}
                      className="text-slate-400 transition hover:text-rose-300"
                    >
                      {tr(t.noteDelete)}
                    </button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
