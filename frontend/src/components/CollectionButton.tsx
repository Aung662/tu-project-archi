'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getCollections,
  createCollection,
  toggleInCollection,
  collectionsWithProject,
  COLLECTIONS_EVENT,
  type Collection,
} from '@/lib/collections';
import { tr, t } from '@/lib/i18n';

/**
 * "Save to collection" control. Opens a small popover listing the student's
 * collections with checkboxes, plus an inline "create new" field. No login
 * needed (localStorage). `stopPropagation` so it can live inside a clickable
 * card. The trigger reflects whether the project is in ANY collection.
 */
export function CollectionButton({
  projectId,
  title,
  year,
  deptCode,
  uniShort,
  className = '',
  showLabel = false,
}: {
  projectId: string;
  title: string;
  year?: number;
  deptCode?: string;
  uniShort?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [cols, setCols] = useState<Collection[]>([]);
  const [inIds, setInIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const sync = () => {
    setCols(getCollections());
    setInIds(collectionsWithProject(projectId));
  };

  useEffect(() => {
    sync();
    window.addEventListener(COLLECTIONS_EVENT, sync);
    return () => window.removeEventListener(COLLECTIONS_EVENT, sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item = { id: projectId, title, year, deptCode, uniShort };
  const saved = inIds.length > 0;

  function toggle(colId: string) {
    toggleInCollection(colId, item);
    sync();
  }

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const clean = name.trim();
    if (!clean) return;
    const col = createCollection(clean);
    toggleInCollection(col.id, item); // add the project to the fresh collection
    setName('');
    setCreating(false);
    sync();
  }

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={saved ? tr(t.collectionSaved) : tr(t.collectionSaveTo)}
        className={`inline-flex items-center gap-1.5 rounded-full transition ${
          saved ? 'text-amber-300' : 'text-slate-400 hover:text-amber-300'
        } ${className}`}
      >
        <span className="text-base leading-none" aria-hidden>
          {saved ? '📚' : '📁'}
        </span>
        {showLabel && (
          <span className="text-sm font-medium">
            {saved ? tr(t.collectionSaved) : tr(t.collectionSaveTo)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-white/10 bg-ink-900/95 p-2 shadow-xl backdrop-blur-xl"
        >
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {tr(t.collectionSaveTo)}
          </p>

          <div className="max-h-56 overflow-y-auto">
            {cols.length === 0 && !creating && (
              <p className="px-2 py-2 text-xs text-slate-400">{tr(t.collectionsEmpty)}</p>
            )}
            {cols.map((c) => {
              const checked = inIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${
                      checked
                        ? 'border-amber-300 bg-amber-300 text-ink-900'
                        : 'border-white/20 text-transparent'
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-latin text-xs text-slate-500">{c.items.length}</span>
                </button>
              );
            })}
          </div>

          {creating ? (
            <form onSubmit={submitCreate} className="mt-1 flex items-center gap-1.5 px-1">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tr(t.collectionCreatePlaceholder)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-300/50"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-amber-300 px-2 py-1.5 text-xs font-semibold text-ink-900"
              >
                {tr(t.collectionCreateBtn)}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium text-amber-300 transition hover:bg-white/10"
            >
              {tr(t.collectionNewInline)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
