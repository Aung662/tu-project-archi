'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Paginated, ProjectCard as Card } from '@/lib/types';
import { Alert, Spinner, EmptyState, LevelBadge } from '@/components/ui';
import { tr, t } from '@/lib/i18n';

/**
 * A single, flat, NUMBERED list of every project title in the archive — a quick
 * "table of contents" view. Fetches all pages (server caps pageSize at 50) and
 * offers a client-side title filter. Each row links to the project detail page.
 */
export default function TitlesPage() {
  const [items, setItems] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const pageSize = 50;
        const first = await api.get<Paginated<Card>>(
          `/projects${api.qs({ page: 1, pageSize, sort: 'title' })}`,
        );
        let all = [...first.items];
        for (let p = 2; p <= first.totalPages; p++) {
          const next = await api.get<Paginated<Card>>(
            `/projects${api.qs({ page: p, pageSize, sort: 'title' })}`,
          );
          all = all.concat(next.items);
        }
        if (!cancelled) setItems(all);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : tr(t.loadFailed));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => p.title.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{tr(t.allTitlesTitle)}</h1>
          <p className="text-sm text-slate-400">{tr(t.allTitlesSubtitle)}</p>
        </div>
        {!loading && (
          <span className="text-sm text-slate-400">
            <span className="font-latin font-semibold text-slate-200">{filtered.length}</span>{' '}
            {tr(t.titlesCount)}
          </span>
        )}
      </div>

      <input
        className="input"
        placeholder={tr(t.titlesSearchPlaceholder)}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <Spinner label={tr(t.loadingProjects)} />
      ) : filtered.length === 0 ? (
        <EmptyState title={tr(t.noProjectsTitle)} hint={tr(t.noProjectsHint)} />
      ) : (
        <ol className="card divide-y divide-white/5 overflow-hidden p-0">
          {filtered.map((p, i) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="flex items-start gap-4 px-4 py-3 transition hover:bg-white/5"
              >
                <span className="w-8 shrink-0 pt-0.5 text-right font-latin text-sm font-semibold tabular-nums text-slate-500">
                  {i + 1}.
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-100">{p.title}</span>
                  <span className="mt-0.5 block font-latin text-xs text-slate-400">
                    {p.university.shortName} · {p.department.code} · {p.year}
                  </span>
                </span>
                <span className="shrink-0 pt-0.5">
                  <LevelBadge level={p.level} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
