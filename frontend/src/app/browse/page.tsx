'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Paginated, ProjectCard as Card, University } from '@/lib/types';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState, Alert, SkeletonCard } from '@/components/ui';
import { tr, t, levelLabel } from '@/lib/i18n';

export default function BrowsePage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    q: '',
    universityId: '',
    departmentId: '',
    year: '',
    level: '',
    sort: 'newest',
    priceMax: '',
    freeOnly: '',
    hasFile: '',
    page: 1,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [data, setData] = useState<Paginated<Card> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<University[]>('/universities').then(setUniversities).catch(() => {});
    api
      .get<{ years: number[] }>('/universities/facets')
      .then((f) => setYears(f.years))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Paginated<Card>>(
        `/projects${api.qs({ ...filters, pageSize: 12 })}`,
      );
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr(t.loadFailed));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedUni = universities.find((u) => u.id === filters.universityId);

  const update = (patch: Partial<typeof filters>) =>
    setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{tr(t.browseTitle)}</h1>
          <p className="text-sm text-slate-400">{tr(t.browseSubtitle)}</p>
        </div>
        <Link
          href="/titles"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          <span aria-hidden>📋</span>
          {tr(t.allTitlesLink)}
        </Link>
      </div>

      {/* Filters */}
      <div className="card grid gap-4 p-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="label flex items-center gap-1.5">
            <span aria-hidden>🔎</span> {tr(t.fKeyword)}
          </label>
          <input
            className="input"
            placeholder={tr(t.fKeywordPlaceholder)}
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
          />
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <span aria-hidden>🏛️</span> {tr(t.fUniversity)}
          </label>
          <select
            className="input"
            value={filters.universityId}
            onChange={(e) => update({ universityId: e.target.value, departmentId: '' })}
          >
            <option value="">{tr(t.fAll)}</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.shortName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <span aria-hidden>🏢</span> {tr(t.fDepartment)}
          </label>
          <select
            className="input"
            value={filters.departmentId}
            onChange={(e) => update({ departmentId: e.target.value })}
            disabled={!selectedUni}
          >
            <option value="">{tr(t.fAll)}</option>
            {selectedUni?.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <span aria-hidden>📅</span> {tr(t.fYear)}
          </label>
          <select
            className="input"
            value={filters.year}
            onChange={(e) => update({ year: e.target.value })}
          >
            <option value="">{tr(t.fAll)}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Academic level — horizontal, icon chips (scrollable on mobile) */}
        <div className="md:col-span-5">
          <label className="label flex items-center gap-1.5">
            <span aria-hidden>🎓</span> {tr(t.fLevel)}
          </label>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { lv: '', icon: '✨' },
              { lv: 'YEAR_3', icon: '3️⃣' },
              { lv: 'YEAR_5', icon: '5️⃣' },
              { lv: 'FINAL_YEAR', icon: '🏆' },
              { lv: 'OTHER', icon: '📌' },
            ].map(({ lv, icon }) => {
              const active = filters.level === lv;
              return (
                <button
                  key={lv || 'all'}
                  onClick={() => update({ level: lv })}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                    active
                      ? 'border-brand-400/50 bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-900/30'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  <span aria-hidden>{icon}</span>
                  <span className="whitespace-nowrap">{lv ? tr(levelLabel[lv]) : tr(t.fAllLevels)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced filters (collapsible) */}
        <div className="md:col-span-5">
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className="text-sm font-medium text-brand-300 hover:text-brand-200"
          >
            {showAdvanced ? '▾ Hide advanced filters' : '▸ Advanced filters'}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid gap-3 rounded-lg bg-white/5 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="label">Sort by</label>
                <select className="input" value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="priceLow">Price: low to high</option>
                  <option value="priceHigh">Price: high to low</option>
                  <option value="title">Title (A–Z)</option>
                </select>
              </div>
              <div>
                <label className="label">Max price (MMK)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  className="input"
                  placeholder="Any"
                  value={filters.priceMax}
                  onChange={(e) => update({ priceMax: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/15"
                  checked={filters.freeOnly === 'true'}
                  onChange={(e) => update({ freeOnly: e.target.checked ? 'true' : '' })}
                />
                Free only
              </label>
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/15"
                  checked={filters.hasFile === 'true'}
                  onChange={(e) => update({ hasFile: e.target.checked ? 'true' : '' })}
                />
                Has downloadable file
              </label>
            </div>
          )}
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <p className="text-sm text-slate-400">{data.total} {tr(t.projectsFound)}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                className="btn-secondary"
                disabled={data.page <= 1}
                onClick={() => update({ page: data.page - 1 })}
              >
                {tr(t.prevPage)}
              </button>
              <span className="text-sm text-slate-300">
                {tr(t.pageOf)} {data.page} / {data.totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={data.page >= data.totalPages}
                onClick={() => update({ page: data.page + 1 })}
              >
                {tr(t.nextPage)}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState title={tr(t.noProjectsTitle)} hint={tr(t.noProjectsHint)} />
      )}
    </div>
  );
}
