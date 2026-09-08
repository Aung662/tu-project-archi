'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { AcademicLevel, Paginated, ProjectCard as Card } from '@/lib/types';
import { Alert, Spinner, EmptyState, LevelBadge } from '@/components/ui';
import { tr, t, levelLabel } from '@/lib/i18n';

/**
 * A single, NUMBERED list of every project title in the archive — a quick
 * "table of contents" view. Fetches all pages (server caps pageSize at 50) and
 * offers a client-side title filter, an academic-level filter, and year grouping
 * (newest year first) so long lists stay easy to scan.
 */

// Level filter chips. '' = all levels. Icons mirror the Browse page for consistency.
const LEVEL_CHIPS: { lv: '' | AcademicLevel; icon: string }[] = [
  { lv: '', icon: '✨' },
  { lv: 'YEAR_3', icon: '3️⃣' },
  { lv: 'YEAR_5', icon: '5️⃣' },
  { lv: 'FINAL_YEAR', icon: '🏆' },
  { lv: 'OTHER', icon: '📌' },
];

export default function TitlesPage() {
  const [items, setItems] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'' | AcademicLevel>('');

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

  // Apply title + level filters.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      if (level && p.level !== level) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, level]);

  // Group filtered projects by year, newest year first (2026 → 2021 …). Titles
  // stay alphabetical inside each year (list already came sorted by title).
  const groups = useMemo(() => {
    const byYear = new Map<number, Card[]>();
    for (const p of filtered) {
      const arr = byYear.get(p.year);
      if (arr) arr.push(p);
      else byYear.set(p.year, [p]);
    }
    return Array.from(byYear.entries()).sort((a, b) => b[0] - a[0]); // year DESC
  }, [filtered]);

  // Count per level for the chip badges (respects the current title query only).
  const levelCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? items.filter((p) => p.title.toLowerCase().includes(q)) : items;
    const counts: Record<string, number> = { '': base.length };
    for (const p of base) counts[p.level] = (counts[p.level] ?? 0) + 1;
    return counts;
  }, [items, query]);

  // Running number so the whole (grouped) list reads as one numbered index.
  let counter = 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gradient-animated sm:text-3xl">
            {tr(t.allTitlesTitle)}
          </h1>
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

      {/* Academic-level filter chips (mirrors the Browse page style) */}
      <div className="flex flex-wrap gap-2">
        {LEVEL_CHIPS.map(({ lv, icon }) => {
          const active = level === lv;
          const count = levelCounts[lv] ?? 0;
          return (
            <button
              key={lv || 'all'}
              type="button"
              onClick={() => setLevel(lv)}
              className={`chip3d ${active ? 'chip3d-active' : ''}`}
            >
              <span aria-hidden>{icon}</span>
              <span className="whitespace-nowrap">
                {lv ? tr(levelLabel[lv]) : tr(t.fAllLevels)}
              </span>
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 font-latin text-[11px] font-semibold tabular-nums ${
                  active ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <Spinner label={tr(t.loadingProjects)} />
      ) : filtered.length === 0 ? (
        <EmptyState title={tr(t.noProjectsTitle)} hint={tr(t.noProjectsHint)} />
      ) : (
        <div className="space-y-5">
          {groups.map(([year, list]) => (
            <section key={year} className="space-y-2">
              {/* Year header */}
              <div className="flex items-center gap-3">
                <h2 className="font-latin text-lg font-bold tabular-nums text-brand-300">{year}</h2>
                <span className="h-px flex-1 bg-white/10" aria-hidden />
                <span className="font-latin text-xs font-medium text-slate-500">
                  {list.length}
                </span>
              </div>

              <ol className="card divide-y divide-white/5 overflow-hidden p-0">
                {list.map((p) => {
                  counter += 1;
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/projects/${p.id}`}
                        className="flex items-start gap-4 px-4 py-3 transition hover:bg-white/5"
                      >
                        <span className="w-8 shrink-0 pt-0.5 text-right font-latin text-sm font-semibold tabular-nums text-slate-500">
                          {counter}.
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
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
