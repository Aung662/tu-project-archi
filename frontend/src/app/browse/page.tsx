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
    page: 1,
  });
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
      setError(err instanceof Error ? err.message : t.loadFailed.my);
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
        <h1 className="text-2xl font-bold text-slate-100">{t.browseTitle.my}</h1>
        <p className="text-sm text-slate-400">{t.browseSubtitle.my}</p>
      </div>

      {/* Filters */}
      <div className="card grid gap-3 p-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="label">{t.fKeyword.my}</label>
          <input
            className="input"
            placeholder={t.fKeywordPlaceholder.my}
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t.fUniversity.my}</label>
          <select
            className="input"
            value={filters.universityId}
            onChange={(e) => update({ universityId: e.target.value, departmentId: '' })}
          >
            <option value="">{t.fAll.my}</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.shortName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.fDepartment.my}</label>
          <select
            className="input"
            value={filters.departmentId}
            onChange={(e) => update({ departmentId: e.target.value })}
            disabled={!selectedUni}
          >
            <option value="">{t.fAll.my}</option>
            {selectedUni?.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.fYear.my}</label>
          <select
            className="input"
            value={filters.year}
            onChange={(e) => update({ year: e.target.value })}
          >
            <option value="">{t.fAll.my}</option>
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
                {lv ? levelLabel[lv].my : t.fAllLevels.my}
              </button>
            ))}
          </div>
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
          <p className="text-sm text-slate-400">{t.projectsFound.my} {data.total} ခု</p>
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
                {t.prevPage.my}
              </button>
              <span className="text-sm text-slate-300">
                {t.pageOf.my} {data.page} / {data.totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={data.page >= data.totalPages}
                onClick={() => update({ page: data.page + 1 })}
              >
                {t.nextPage.my}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState title={t.noProjectsTitle.my} hint={t.noProjectsHint.my} />
      )}
    </div>
  );
}
