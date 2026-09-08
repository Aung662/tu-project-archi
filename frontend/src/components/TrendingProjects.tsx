'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ProjectCard as Card } from '@/lib/types';
import { ProjectCard } from '@/components/ProjectCard';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/motion';
import { tr, t } from '@/lib/i18n';

/**
 * "Trending projects" — the most-viewed published projects. Renders nothing on
 * error or when empty, so it never leaves a broken hole on the home page.
 */
export function TrendingProjects({ limit = 3 }: { limit?: number }) {
  const [items, setItems] = useState<Card[] | null>(null);

  useEffect(() => {
    api
      .get<Card[]>(`/projects/trending?limit=${limit}`)
      .then(setItems)
      .catch(() => setItems([]));
  }, [limit]);

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <Reveal>
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
          <span aria-hidden>🔥</span> {tr(t.trendingTitle)}
        </h2>
      </Reveal>
      <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <StaggerItem key={p.id}>
            <ProjectCard p={p} />
          </StaggerItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
