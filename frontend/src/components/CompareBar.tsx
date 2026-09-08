'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCompare, removeCompare, clearCompare, COMPARE_EVENT, type CompareItem } from '@/lib/compare';
import { tr, t } from '@/lib/i18n';

/**
 * Floating bar that surfaces the current compare selection anywhere on the site
 * and links to /compare. Hidden when nothing is selected so it never intrudes on
 * the design. localStorage-backed; updates live via the COMPARE_EVENT.
 */
export function CompareBar() {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(getCompare());
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COMPARE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-ink-800/90 px-3 py-2 shadow-glow backdrop-blur">
        <span className="px-1 text-sm font-semibold text-slate-200">
          ⇄ {tr(t.compareBarLabel)} <span className="font-latin text-brand-300">{items.length}</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {items.map((it) => (
            <span
              key={it.id}
              className="inline-flex max-w-[9rem] items-center gap-1 rounded-full bg-white/[0.06] py-1 pl-2.5 pr-1 text-xs text-slate-200"
            >
              <span className="truncate">{it.title}</span>
              <button
                onClick={() => removeCompare(it.id)}
                aria-label={tr(t.compareRemove)}
                className="grid h-4 w-4 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={clearCompare}
            className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:text-white"
          >
            {tr(t.compareClear)}
          </button>
          <Link
            href="/compare"
            className="rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            {tr(t.compareBarLabel)} →
          </Link>
        </div>
      </div>
    </div>
  );
}
