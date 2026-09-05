'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { DashboardData } from '@/lib/types';
import { Spinner } from '@/components/ui';
import { t } from '@/lib/i18n';
import { ActivityChart, BarList } from '@/components/charts/Charts';

export default function AdminOverview() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard').then(setData).catch(() => {});
  }, []);

  if (!data) return <Spinner />;

  const { totals } = data;
  const cards = [
    { label: t.statTotalProjects.en, value: totals.projects, hint: `${totals.published} ${t.statPublished.en}` },
    { label: 'Page views', value: totals.totalPageViews, hint: 'All time' },
    { label: t.statPendingPayments.en, value: totals.pendingPayments, hint: t.statNeedReview.en, warn: totals.pendingPayments > 0 },
    { label: t.statUsers.en, value: totals.users },
    { label: 'Searches', value: totals.totalSearches, hint: `${totals.totalChecks} title checks` },
    { label: t.statAccessGrants.en, value: totals.purchases, hint: t.statFilesUnlocked.en },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-slate-400">{c.label}</p>
            <p className={`mt-1 text-3xl font-bold ${c.warn ? 'text-amber-400' : 'text-slate-100'}`}>
              {c.value.toLocaleString()}
            </p>
            {c.hint && <p className="text-xs text-slate-400">{c.hint}</p>}
          </div>
        ))}
      </div>

      {/* Activity time series */}
      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Activity — last 14 days
        </h2>
        <ActivityChart data={data.series} />
      </div>

      {/* Distributions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Projects by university
          </h2>
          <BarList data={data.byUniversity} />
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Most visited pages
          </h2>
          <BarList
            data={data.topPaths.map((p) => ({ label: p.path, value: p.count }))}
            format={(v) => `${v} views`}
          />
        </div>
      </div>
    </div>
  );
}
