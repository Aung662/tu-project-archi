'use client';

import { useEffect, useState } from 'react';
import { isInCompare, toggleCompare, COMPARE_EVENT, MAX_COMPARE } from '@/lib/compare';
import { tr, t } from '@/lib/i18n';

/**
 * Toggle a project in/out of the compare list. No login needed (localStorage).
 * Shows a brief "full" hint when the max is reached. `stopPropagation` so it can
 * live inside a clickable card.
 */
export function CompareButton({
  projectId,
  title,
  className = '',
  showLabel = false,
}: {
  projectId: string;
  title: string;
  className?: string;
  showLabel?: boolean;
}) {
  const [inList, setInList] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const sync = () => setInList(isInCompare(projectId));
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_EVENT, sync);
  }, [projectId]);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ok = toggleCompare({ id: projectId, title });
    if (!ok) {
      setFull(true);
      setTimeout(() => setFull(false), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={inList}
      title={full ? `${tr(t.compareFull)}` : inList ? tr(t.compareRemove) : tr(t.compareAdd)}
      className={`inline-flex items-center gap-1.5 rounded-full transition ${
        inList ? 'text-brand-300' : 'text-slate-400 hover:text-brand-300'
      } ${className}`}
    >
      <span className="text-base leading-none" aria-hidden>
        {inList ? '⇄' : '⇆'}
      </span>
      {showLabel && (
        <span className="text-sm font-medium">
          {full ? tr(t.compareFull) : inList ? tr(t.compareAdded) : tr(t.compareBarLabel)}
        </span>
      )}
    </button>
  );
}

export { MAX_COMPARE };
