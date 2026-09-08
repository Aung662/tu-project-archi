'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentlyViewed, clearRecentlyViewed, type RecentItem } from '@/lib/recentlyViewed';
import { tr, t } from '@/lib/i18n';

/**
 * A compact strip of the visitor's recently viewed projects. Reads from
 * localStorage, so it works with no login and no backend call. Renders nothing
 * until it has at least one item (keeps the home page clean for first-timers).
 */
export function RecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(getRecentlyViewed());
    sync();
    window.addEventListener('tu-recent-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('tu-recent-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <span aria-hidden>🕘</span> {tr(t.recentlyViewed)}
        </h2>
        <button
          type="button"
          onClick={() => clearRecentlyViewed()}
          className="text-xs font-medium text-slate-500 transition hover:text-slate-300"
        >
          {tr(t.recentlyViewedClear)}
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/projects/${it.id}`}
            className="group w-56 shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-brand-400/40 hover:bg-white/10"
          >
            <span className="line-clamp-2 block text-sm font-medium text-slate-100 group-hover:text-brand-200">
              {it.title}
            </span>
            <span className="mt-1.5 block font-latin text-xs text-slate-400">
              {it.uniShort} · {it.deptCode} · {it.year}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
