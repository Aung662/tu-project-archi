'use client';

import { useEffect, useState } from 'react';
import {
  getSavedSearches,
  saveSearch,
  removeSavedSearch,
  isSearchSaved,
  isMeaningfulQuery,
  toQueryString,
  SAVED_SEARCHES_EVENT,
  type SavedSearch,
  type SearchQuery,
} from '@/lib/savedSearches';
import { tr, t } from '@/lib/i18n';

/**
 * Save-this-search control + a strip of previously saved searches. Purely
 * localStorage (no login). `current` is the active filter set; `label` is a
 * human summary. `onRun` applies a saved search back into the browse filters.
 */
export function SavedSearches({
  current,
  label,
  onRun,
}: {
  current: SearchQuery;
  label: string;
  onRun: (s: SavedSearch) => void;
}) {
  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(getSavedSearches());
    sync();
    window.addEventListener(SAVED_SEARCHES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SAVED_SEARCHES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const canSave = isMeaningfulQuery(current);
  const alreadySaved = canSave && isSearchSaved(current);

  function onSave() {
    saveSearch(current, label);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);
  }

  if (!canSave && saved.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canSave && (
        <button
          onClick={onSave}
          disabled={alreadySaved}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
        >
          <span aria-hidden>{alreadySaved ? '★' : '☆'}</span>
          {justSaved ? tr(t.savedSearchSaved) : tr(t.saveSearchBtn)}
        </button>
      )}

      {saved.map((s) => (
        <span
          key={s.id}
          className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] py-1 pl-3 pr-1 text-sm text-slate-200"
        >
          <button
            onClick={() => onRun(s)}
            title={tr(t.savedSearchRun)}
            className="max-w-[12rem] truncate hover:text-brand-300"
          >
            {s.label}
          </button>
          <button
            onClick={() => removeSavedSearch(s.id)}
            aria-label={tr(t.savedSearchRemove)}
            className="grid h-4 w-4 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

/** Build a "?..." link string from a saved search, for external use. */
export { toQueryString };
