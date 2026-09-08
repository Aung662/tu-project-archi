'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ProjectCard as Card } from '@/lib/types';
import { getCompare, removeCompare, clearCompare, COMPARE_EVENT } from '@/lib/compare';
import { EmptyState, Spinner, LevelBadge } from '@/components/ui';
import { Reveal } from '@/components/motion';
import { formatMMK } from '@/lib/format';
import { tr, t, levelLabel } from '@/lib/i18n';

/**
 * Compare page — shows 2–3 selected projects side by side across the fields that
 * matter when choosing a direction for your own thesis: level, year, school,
 * price/availability, keywords and abstract. Selection lives in localStorage.
 */
export default function ComparePage() {
  const [ids, setIds] = useState<string[]>([]);
  const [projects, setProjects] = useState<Record<string, Card | null>>({});
  const [loading, setLoading] = useState(true);

  // Track the compare selection (live).
  useEffect(() => {
    const sync = () => setIds(getCompare().map((x) => x.id));
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_EVENT, sync);
  }, []);

  // Fetch details for any ids we don't have yet.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const p = await api.get<Card>(`/projects/${id}`);
            return [id, p] as const;
          } catch {
            return [id, null] as const;
          }
        }),
      );
      if (!cancelled) {
        setProjects(Object.fromEntries(entries));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (ids.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState title={tr(t.compareEmpty)} hint={tr(t.compareEmptyHint)} />
        <Link href="/browse" className="btn-secondary inline-flex w-fit">
          {tr(t.navBrowse)} →
        </Link>
      </div>
    );
  }

  if (loading) return <Spinner label={tr(t.compareTitle)} />;

  const cols = ids.map((id) => projects[id]).filter(Boolean) as Card[];

  // The comparison rows (label + value renderer).
  const rows: { label: string; render: (p: Card) => React.ReactNode }[] = [
    { label: tr(t.metaLevel), render: (p) => <LevelBadge level={p.level} /> },
    { label: tr(t.metaYear), render: (p) => p.year },
    { label: tr(t.metaUniversity), render: (p) => p.university.name },
    { label: tr(t.metaDepartment), render: (p) => p.department.name },
    {
      label: tr(t.fullFile),
      render: (p) =>
        p.priceMmk > 0 ? (
          <span className="font-semibold text-brand-300">{formatMMK(p.priceMmk)}</span>
        ) : (
          <span className="font-semibold text-mint-300">{tr(t.free)}</span>
        ),
    },
    {
      label: tr(t.keywords),
      render: (p) =>
        p.keywords.length ? (
          <div className="flex flex-wrap gap-1">
            {p.keywords.slice(0, 6).map((k) => (
              <span key={k} className="badge bg-brand-500/15 text-brand-200">
                {k}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      label: tr(t.abstract),
      render: (p) => <p className="line-clamp-6 text-xs leading-relaxed text-slate-300">{p.abstract}</p>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <Header />
        <button onClick={clearCompare} className="btn-secondary shrink-0 text-sm">
          {tr(t.compareClear)}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-x-3">
          <thead>
            <tr>
              <th className="w-28" />
              {cols.map((p) => (
                <th key={p.id} className="align-top">
                  <div className="card space-y-2 p-4 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-sm font-semibold leading-tight text-slate-100 hover:text-brand-300"
                      >
                        {p.title}
                      </Link>
                      <button
                        onClick={() => removeCompare(p.id)}
                        aria-label={tr(t.compareRemove)}
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="py-2 align-top text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {row.label}
                </td>
                {cols.map((p) => (
                  <td key={p.id} className="py-2 align-top text-sm text-slate-200">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Header() {
  return (
    <Reveal>
      <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">{tr(t.compareTitle)}</h1>
      <p className="mt-2 text-sm text-slate-400">{tr(t.compareSubtitle)}</p>
    </Reveal>
  );
}
