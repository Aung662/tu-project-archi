'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Paginated, ProjectCard as Card, University } from '@/lib/types';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState, Alert, SkeletonCard } from '@/components/ui';
import { t, levelLabel } from '@/lib/i18n';

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
      setError(err instanceof Error ? err.message : t.loadFailed.en);
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
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{t.browseTitle.en}</h1>
        <p className="text-sm text-slate-400">{t.browseSubtitle.en}</p>
      </div>

      {/* Filters */}
      <div className="card grid gap-3 p-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="label">{t.fKeyword.en}</label>
          <input
            className="input"
            placeholder={t.fKeywordPlaceholder.en}
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t.fUniversity.en}</label>
          <select
            className="input"
            value={filters.universityId}
            onChange={(e) => update({ universityId: e.target.value, departmentId: '' })}
          >
            <option value="">{t.fAll.en}</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.shortName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.fDepartment.en}</label>
          <select
            className="input"
            value={filters.departmentId}
            onChange={(e) => update({ departmentId: e.target.value })}
            disabled={!selectedUni}
          >
            <option value="">{t.fAll.en}</option>
            {selectedUni?.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.fYear.en}</label>
          <select
            className="input"
            value={filters.year}
            onChange={(e) => update({ year: e.target.value })}
          >
            <option value="">{t.fAll.en}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-5">
          <div className="flex flex-wrap gap-2">
            {['', 'YEAR_3', 'YEAR_5', 'FINAL_YEAR', 'OTHER'].map((lv) => (
              <button
                key={lv || 'all'}
                onClick={() => update({ level: lv })}
                className={`badge cursor-pointer px-3 py-1 ${
                  filters.level === lv
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {lv ? levelLabel[lv].en : t.fAllLevels.en}
              </button>
            ))}
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
          <p className="text-sm text-slate-400">{data.total} {t.projectsFound.en}</p>
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
                {t.prevPage.en}
              </button>
              <span className="text-sm text-slate-300">
                {t.pageOf.en} {data.page} / {data.totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={data.page >= data.totalPages}
                onClick={() => update({ page: data.page + 1 })}
              >
                {t.nextPage.en}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState title={t.noProjectsTitle.en} hint={t.noProjectsHint.en} />
      )}
    </div>
  );
}
