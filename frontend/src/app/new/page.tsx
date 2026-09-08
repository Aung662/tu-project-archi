'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { AcademicLevel, ProjectCard as Card } from '@/lib/types';
import { ProjectCard } from '@/components/ProjectCard';
import { Alert, Spinner, EmptyState } from '@/components/ui';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/motion';
import { tr, t, levelLabel } from '@/lib/i18n';

/**
 * "New arrivals" page — the most recently added published projects, newest
 * first, with an academic-level filter. A retention surface: students return to
 * see what's freshly uploaded. Backed by GET /api/projects/latest.
 */

// Level filter chips. '' = all levels (mirrors Titles/Browse for consistency).
const LEVEL_CHIPS: { lv: '' | AcademicLevel; icon: string }[] = [
  { lv: '', icon: '✨' },
  { lv: 'YEAR_3', icon: '3️⃣' },
  { lv: 'YEAR_5', icon: '5️⃣' },
  { lv: 'FINAL_YEAR', icon: '🏆' },
  { lv: 'OTHER', icon: '📌' },
];

export default function NewArrivalsPage() {
  const [items, setItems] = useState<Card[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<'' | AcademicLevel>('');

  useEffect(() => {
    api
      .get<Card[]>('/projects/latest?limit=24')
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (items ?? []).forEach((p) => {
      c[p.level] = (c[p.level] ?? 0) + 1;
    });
    return c;
  }, [items]);

  const filtered = useMemo(
    () => (items ?? []).filter((p) => (level ? p.level === level : true)),
    [items, level],
  );

  if (error) return <Alert kind="error">{error}</Alert>;
  if (!items) return <Spinner label={tr(t.newArrivalsTitle)} />;

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">
          {tr(t.newArrivalsTitle)}
        </h1>
        <p className="mt-2 text-sm text-slate-400">{tr(t.newArrivalsSubtitle)}</p>
      </Reveal>

      {/* Academic-level filter chips with live counts. */}
      <div className="flex flex-wrap gap-2">
        {LEVEL_CHIPS.map(({ lv, icon }) => {
          const active = level === lv;
          const n = lv === '' ? items.length : counts[lv] ?? 0;
          return (
            <button
              key={lv || 'all'}
              type="button"
              onClick={() => setLevel(lv)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? 'border-transparent bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-glow'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span aria-hidden>{icon}</span>
              {lv === '' ? tr(t.fAllLevels) : tr(levelLabel[lv])}
              <span className="font-latin text-xs opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={tr(t.newArrivalsEmpty)} />
      ) : (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <StaggerItem key={p.id}>
              <ProjectCard p={p} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
