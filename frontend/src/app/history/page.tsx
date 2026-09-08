'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getDownloadHistory,
  clearDownloadHistory,
  removeDownloadRecord,
  DOWNLOAD_HISTORY_EVENT,
  type DownloadRecord,
} from '@/lib/downloadHistory';
import { EmptyState } from '@/components/ui';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/motion';
import { formatDate } from '@/lib/format';
import { tr, t } from '@/lib/i18n';

/**
 * "Download history" — a private, on-device log of the project files the student
 * has downloaded. Complements "recently viewed" (pages) with actual downloads,
 * so a student can jump back to a paper they already fetched. localStorage only.
 */
export default function HistoryPage() {
  const [items, setItems] = useState<DownloadRecord[] | null>(null);

  useEffect(() => {
    const sync = () => setItems(getDownloadHistory());
    sync();
    window.addEventListener(DOWNLOAD_HISTORY_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(DOWNLOAD_HISTORY_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">
              {tr(t.historyTitle)}
            </h1>
            <p className="mt-2 text-sm text-slate-400">{tr(t.historySubtitle)}</p>
          </div>
          {items && items.length > 0 && (
            <button
              onClick={() => {
                if (confirm(tr(t.historyClearConfirm))) clearDownloadHistory();
              }}
              className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-rose-300"
            >
              {tr(t.historyClear)}
            </button>
          )}
        </div>
      </Reveal>

      {items && items.length === 0 && (
        <EmptyState title={tr(t.historyEmpty)} hint={tr(t.historyEmptyHint)} />
      )}

      {items && items.length > 0 && (
        <StaggerGrid className="grid gap-3 sm:grid-cols-2">
          {items.map((i) => (
            <StaggerItem key={i.id}>
              <div className="card flex items-center gap-4 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-xl ring-1 ring-white/10">
                  ⬇
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/projects/${i.id}`}
                    className="block truncate font-semibold text-slate-100 hover:text-brand-300"
                  >
                    {i.title}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <span className="font-latin">{formatDate(new Date(i.at).toISOString())}</span>
                    {(i.uniShort || i.deptCode) && (
                      <span>· {[i.uniShort, i.deptCode].filter(Boolean).join(' · ')}</span>
                    )}
                    {i.count > 1 && (
                      <span className="font-latin">
                        · {i.count}
                        {tr(t.historyTimes)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  <Link href={`/projects/${i.id}`} className="text-brand-300 hover:text-brand-200">
                    {tr(t.historyView)}
                  </Link>
                  <button
                    onClick={() => removeDownloadRecord(i.id)}
                    className="text-slate-400 transition hover:text-rose-300"
                  >
                    {tr(t.historyRemove)}
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
