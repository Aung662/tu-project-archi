'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SearchAnalytics } from '@/lib/types';
import { Spinner, EmptyState } from '@/components/ui';
import { t } from '@/lib/i18n';

type KindFilter = 'ALL' | 'SEARCH' | 'CHECK';

function verdictBadge(v?: string | null) {
  if (!v) return null;
  const cls =
    v === 'DUPLICATE_RISK'
      ? 'bg-rose-100 text-rose-700'
      : v === 'SIMILAR_EXISTS'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-emerald-100 text-emerald-700';
  return <span className={`badge font-mono ${cls}`}>{v}</span>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<KindFilter>('ALL');

  useEffect(() => {
    setLoading(true);
    const qs = kind === 'ALL' ? '' : `?kind=${kind}`;
    api
      .get<SearchAnalytics>(`/admin/search-logs${qs}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [kind]);

  if (loading && !data) return <Spinner />;
  if (!data) return <EmptyState title={t.anEmpty.my} />;

  const cards = [
    { label: t.anTotalSearches.my, value: data.stats.totalSearches, tone: 'text-brand-700' },
    { label: t.anTotalChecks.my, value: data.stats.totalChecks, tone: 'text-brand-700' },
    { label: t.anDuplicateRisks.my, value: data.stats.duplicateRisks, tone: 'text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className={`mt-1 text-3xl font-bold ${c.tone}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['ALL', 'SEARCH', 'CHECK'] as KindFilter[]).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              kind === k
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {k === 'ALL' ? t.anFilterAll.my : k}
          </button>
        ))}
      </div>

      {data.recent.length === 0 ? (
        <EmptyState title={t.anEmpty.my} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{t.anColKind.my}</th>
                <th className="px-4 py-3">{t.anColQuery.my}</th>
                <th className="px-4 py-3">{t.anColResults.my}</th>
                <th className="px-4 py-3">{t.anColScore.my}</th>
                <th className="px-4 py-3">{t.anColVerdict.my}</th>
                <th className="px-4 py-3">{t.anColWhen.my}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recent.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <span
                      className={`badge font-mono ${
                        r.kind === 'CHECK'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.kind}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-700" title={r.rawQuery}>
                    {r.rawQuery}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.resultCount}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {typeof r.topScore === 'number' ? r.topScore.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3">{verdictBadge(r.verdict)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
