'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Paginated, ProjectCard as Card, University } from '@/lib/types';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState, Alert, SkeletonCard } from '@/components/ui';
import { AdSlot } from '@/components/ads/AdSlot';
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
      <div className="card space-y-4 p-4">
        {/* Keyword search */}
        <div>
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

        {/* Row 1 — University · Department · Year as raised 3D dropdown buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="chip3d w-full cursor-pointer !justify-start">
            <span aria-hidden>🏛️</span>
            <span className="shrink-0 text-slate-400">{tr(t.fUniversity)}:</span>
            <select
              className="w-full min-w-0 flex-1 cursor-pointer bg-transparent font-semibold text-slate-100 outline-none [&>option]:bg-ink-900 [&>option]:text-slate-100"
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
          </label>

          <label className={`chip3d w-full cursor-pointer !justify-start ${!selectedUni ? 'opacity-60' : ''}`}>
            <span aria-hidden>🏢</span>
            <span className="shrink-0 text-slate-400">{tr(t.fDepartment)}:</span>
            <select
              className="w-full min-w-0 flex-1 cursor-pointer bg-transparent font-semibold text-slate-100 outline-none disabled:cursor-not-allowed [&>option]:bg-ink-900 [&>option]:text-slate-100"
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
          </label>

          <label className="chip3d w-full cursor-pointer !justify-start">
            <span aria-hidden>📅</span>
            <span className="shrink-0 text-slate-400">{tr(t.fYear)}:</span>
            <select
              className="w-full min-w-0 flex-1 cursor-pointer bg-transparent font-semibold text-slate-100 outline-none [&>option]:bg-ink-900 [&>option]:text-slate-100"
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
          </label>
        </div>

        {/* Academic level label */}
        <label className="label flex items-center gap-1.5">
          <span aria-hidden>🎓</span> {tr(t.fLevel)}
        </label>

        {/* Row 2 — All levels · 3rd Year · 5th Year (raised 3D chips) */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { lv: '', icon: '✨' },
            { lv: 'YEAR_3', icon: '3️⃣' },
            { lv: 'YEAR_5', icon: '5️⃣' },
          ].map(({ lv, icon }) => {
            const active = filters.level === lv;
            return (
              <button
                key={lv || 'all'}
                onClick={() => update({ level: lv })}
                className={`chip3d w-full ${active ? 'chip3d-active' : ''}`}
              >
                <span aria-hidden>{icon}</span>
                <span className="whitespace-nowrap">{lv ? tr(levelLabel[lv]) : tr(t.fAllLevels)}</span>
              </button>
            );
          })}
        </div>

        {/* Row 3 — Final Year · Other · Advanced filters (raised 3D chips) */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { lv: 'FINAL_YEAR', icon: '🏆' },
            { lv: 'OTHER', icon: '📌' },
          ].map(({ lv, icon }) => {
            const active = filters.level === lv;
            return (
              <button
                key={lv}
                onClick={() => update({ level: lv })}
                className={`chip3d w-full ${active ? 'chip3d-active' : ''}`}
              >
                <span aria-hidden>{icon}</span>
                <span className="whitespace-nowrap">{tr(levelLabel[lv])}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className={`chip3d w-full ${showAdvanced ? 'chip3d-active' : ''}`}
          >
            <span aria-hidden>⚙️</span>
            <span className="whitespace-nowrap">{showAdvanced ? tr(t.fHideAdvanced) : tr(t.fAdvanced)}</span>
          </button>
        </div>

        {/* Advanced filters (collapsible — toggled by the chip in Row 3 above) */}
        <div>
          {showAdvanced && (
            <div className="grid gap-3 rounded-lg bg-white/5 p-3 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Leaderboard ad between filters and results */}
      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_BROWSE} minHeight={90} />

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
