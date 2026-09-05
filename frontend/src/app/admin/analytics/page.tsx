'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SearchAnalytics } from '@/lib/types';
import { Spinner, EmptyState } from '@/components/ui';
import { tr, t } from '@/lib/i18n';

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
  if (!data) return <EmptyState title={tr(t.anEmpty)} />;

  const cards = [
    { label: tr(t.anTotalSearches), value: data.stats.totalSearches, tone: 'text-brand-300' },
    { label: tr(t.anTotalChecks), value: data.stats.totalChecks, tone: 'text-brand-300' },
    { label: tr(t.anDuplicateRisks), value: data.stats.duplicateRisks, tone: 'text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Report exports (CSV opens directly in Excel / Google Sheets) */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="text-sm font-medium text-slate-200">Export reports:</span>
        <a href="/api/admin/reports/search-logs.csv" className="btn-secondary px-3 py-1.5 text-xs">
          ⬇ Search logs (CSV)
        </a>
        <a href="/api/admin/reports/duplicate-risks.csv" className="btn-secondary px-3 py-1.5 text-xs">
          ⬇ Duplicate-risk report (CSV)
        </a>
        <a href="/api/admin/reports/projects.csv" className="btn-secondary px-3 py-1.5 text-xs">
          ⬇ Projects (CSV)
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="text-sm text-slate-400">{c.label}</div>
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
                : 'bg-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            {k === 'ALL' ? tr(t.anFilterAll) : k}
          </button>
        ))}
      </div>

      {data.recent.length === 0 ? (
        <EmptyState title={tr(t.anEmpty)} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">{tr(t.anColKind)}</th>
                <th className="px-4 py-3">{tr(t.anColQuery)}</th>
                <th className="px-4 py-3">{tr(t.anColResults)}</th>
                <th className="px-4 py-3">{tr(t.anColScore)}</th>
                <th className="px-4 py-3">{tr(t.anColVerdict)}</th>
                <th className="px-4 py-3">{tr(t.anColWhen)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.recent.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <span
                      className={`badge font-mono ${
                        r.kind === 'CHECK'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-white/10 text-slate-200'
                      }`}
                    >
                      {r.kind}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-200" title={r.rawQuery}>
                    {r.rawQuery}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.resultCount}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {typeof r.topScore === 'number' ? r.topScore.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3">{verdictBadge(r.verdict)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">
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
