'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { DashboardData } from '@/lib/types';
import { Spinner } from '@/components/ui';
import { tr, t } from '@/lib/i18n';
import { ActivityChart, BarList, RevenueChart } from '@/components/charts/Charts';
import Link from 'next/link';

export default function AdminOverview() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard').then(setData).catch(() => {});
  }, []);

  if (!data) return <Spinner />;

  const { totals } = data;
  const scoped = Boolean(data.scoped);
  const cards = [
    { label: tr(t.statTotalProjects), value: totals.projects, hint: `${totals.published} ${tr(t.statPublished)}` },
    { label: 'Page views', value: totals.totalPageViews, hint: 'All time' },
    { label: tr(t.statPendingPayments), value: totals.pendingPayments, hint: tr(t.statNeedReview), warn: totals.pendingPayments > 0 },
    // "Users" is a platform-wide metric — hide it for department-scoped admins.
    ...(scoped ? [] : [{ label: tr(t.statUsers), value: totals.users }]),
    { label: 'Searches', value: totals.totalSearches, hint: `${totals.totalChecks} title checks` },
    { label: tr(t.statAccessGrants), value: totals.purchases, hint: tr(t.statFilesUnlocked) },
    {
      label: 'Revenue (14d)',
      value: totals.revenueTotal ?? 0,
      hint: 'Approved sales, MMK',
      money: true,
    },
  ];

  return (
    <div className="space-y-6">
      {scoped && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-400/40 bg-brand-500/10 px-4 py-3 text-sm">
          <span className="rounded-full bg-brand-500/30 px-2.5 py-0.5 text-xs font-semibold text-brand-100">
            {tr(t.dashScopedBadge)}
          </span>
          <span className="text-slate-300">{tr(t.dashScopedNote)}</span>
        </div>
      )}
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-slate-400">{c.label}</p>
            <p className={`mt-1 text-3xl font-bold ${c.warn ? 'text-amber-400' : 'text-slate-100'}`}>
              {c.value.toLocaleString()}
              {'money' in c && c.money ? <span className="ml-1 text-base font-normal text-slate-400">MMK</span> : null}
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

      {/* Revenue trend */}
      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Revenue — last 14 days
        </h2>
        <RevenueChart data={data.revenueSeries ?? []} />
      </div>

      {/* Popularity: most-viewed projects + most-searched queries */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Most viewed projects
          </h2>
          {data.topProjects && data.topProjects.length > 0 ? (
            <div className="space-y-2">
              {data.topProjects.map((p) => {
                const max = Math.max(1, ...data.topProjects!.map((x) => x.value));
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex justify-between gap-2 text-xs text-slate-300">
                      <Link href={`/projects/${p.id}`} className="truncate hover:text-brand-300" title={p.label}>
                        {p.label}
                      </Link>
                      <span className="shrink-0 font-medium text-slate-200">{p.value} views</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-plum-500"
                        style={{ width: `${(p.value / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No views yet.</p>
          )}
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Top searches (14d)
          </h2>
          {data.topQueries && data.topQueries.length > 0 ? (
            <BarList data={data.topQueries} format={(v) => `${v}×`} />
          ) : (
            <p className="text-sm text-slate-500">No searches in this window yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
