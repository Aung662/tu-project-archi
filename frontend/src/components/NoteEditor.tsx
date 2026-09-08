'use client';

import { useEffect, useState } from 'react';
import { getNote, saveNote, NOTES_EVENT } from '@/lib/notes';
import { tr, t } from '@/lib/i18n';

/**
 * Per-project private note editor shown on the project detail page. Saves to
 * localStorage (no login, private to the device). Auto-loads any existing note
 * and shows a brief "saved" confirmation. A quiet thesis note-taking aid.
 */
export function NoteEditor({ projectId, title }: { projectId: string; title: string }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const n = getNote(projectId);
    setText(n?.text ?? '');
    setDirty(false);
  }, [projectId]);

  function onSave() {
    saveNote(projectId, title, text);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
    window.dispatchEvent(new Event(NOTES_EVENT));
  }

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <span aria-hidden>📝</span> {tr(t.noteLabel)}
        </h2>
        <span className="font-latin text-xs text-slate-500">
          {text.length} {tr(t.noteChars)}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setDirty(true);
        }}
        placeholder={tr(t.notePlaceholder)}
        rows={4}
        className="w-full resize-y rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400/50"
      />
      <div className="flex items-center gap-2">
        <button onClick={onSave} disabled={!dirty} className="btn-secondary disabled:opacity-50">
          {tr(t.noteSave)}
        </button>
        {saved && <span className="text-xs font-medium text-mint-300">✓ {tr(t.noteSaved)}</span>}
      </div>
    </section>
  );
}
