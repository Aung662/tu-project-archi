'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { PublicStats } from '@/lib/types';
import { Alert, Spinner } from '@/components/ui';
import { BarList } from '@/components/charts/Charts';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/motion';
import { tr, t } from '@/lib/i18n';

/**
 * Public, transparent statistics for the whole archive. Aggregates PUBLISHED
 * projects only, so numbers match what a visitor can browse. Read-only; the data
 * comes from a single cached /api/stats call.
 */
export default function StatsPage() {
  const [data, setData] = useState<PublicStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PublicStats>('/stats')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load statistics'));
  }, []);

  if (error) return <Alert kind="error">{error}</Alert>;
  if (!data) return <Spinner label={tr(t.statsTitle)} />;

  const totals = [
    { label: tr(t.statsProjects), value: data.totals.projects, icon: '📦' },
    { label: tr(t.statsUniversities), value: data.totals.universities, icon: '🏛️' },
    { label: tr(t.statsDepartments), value: data.totals.departments, icon: '🏢' },
    { label: tr(t.statsWithFile), value: data.totals.withFile, icon: '📄' },
  ];

  return (
    <div className="space-y-8">
      <Reveal className="text-center">
        <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">{tr(t.statsTitle)}</h1>
        <p className="mt-2 text-sm text-slate-400">{tr(t.statsSubtitle)}</p>
      </Reveal>

      {/* Totals */}
      <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {totals.map((s) => (
          <StaggerItem key={s.label}>
            <div className="card glow-ring flex flex-col items-center gap-1 p-5 text-center">
              <span className="text-2xl" aria-hidden>
                {s.icon}
              </span>
              <span className="font-latin text-3xl font-extrabold text-gradient">{s.value}</span>
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>

      {/* Distributions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <section className="card space-y-3 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {tr(t.statsByYear)}
            </h2>
            <BarList data={data.byYear} />
          </section>
        </Reveal>
        <Reveal delay={0.05}>
          <section className="card space-y-3 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {tr(t.statsByLevel)}
            </h2>
            <BarList data={data.byLevel} />
          </section>
        </Reveal>
        <Reveal delay={0.1}>
          <section className="card space-y-3 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {tr(t.statsByDept)}
            </h2>
            <BarList data={data.byDepartment} />
          </section>
        </Reveal>
        <Reveal delay={0.15}>
          <section className="card space-y-3 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {tr(t.statsByUni)}
            </h2>
            <BarList data={data.byUniversity} />
          </section>
        </Reveal>
      </div>

      {/* Most viewed */}
      {data.topViewed.length > 0 && (
        <Reveal>
          <section className="card space-y-3 p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
              <span aria-hidden>🔥</span> {tr(t.statsTopViewed)}
            </h2>
            <ol className="divide-y divide-white/5">
              {data.topViewed.map((p, i) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-3 py-2.5 transition hover:bg-white/5"
                  >
                    <span className="w-6 text-right font-latin text-sm font-bold tabular-nums text-brand-300">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-100">
                        {p.title}
                      </span>
                      <span className="font-latin text-xs text-slate-400">
                        {p.deptCode} · {p.year}
                      </span>
                    </span>
                    <span className="shrink-0 font-latin text-xs text-slate-400">
                      {p.viewCount} {tr(t.statsViews)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>
      )}

      <p className="text-center text-xs text-slate-500">
        {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
