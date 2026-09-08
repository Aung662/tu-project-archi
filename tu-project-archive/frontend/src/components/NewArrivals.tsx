'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ProjectCard as Card } from '@/lib/types';
import { ProjectCard } from '@/components/ProjectCard';
import { StaggerGrid, StaggerItem, Reveal } from '@/components/motion';
import { tr, t } from '@/lib/i18n';

/**
 * "New arrivals" — the most recently added published projects. A retention
 * surface that gives students a reason to come back and see what's fresh.
 * Renders nothing on error or when empty so it never leaves a broken hole.
 */
export function NewArrivals({ limit = 3 }: { limit?: number }) {
  const [items, setItems] = useState<Card[] | null>(null);

  useEffect(() => {
    api
      .get<Card[]>(`/projects/latest?limit=${limit}`)
      .then(setItems)
      .catch(() => setItems([]));
  }, [limit]);

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <Reveal>
        <div className="flex items-end justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
            <span aria-hidden>✨</span> {tr(t.newArrivalsTitle)}
          </h2>
          <Link
            href="/new"
            className="shrink-0 text-sm font-medium text-brand-300 transition hover:text-brand-200"
          >
            {tr(t.newArrivalsViewAll)} →
          </Link>
        </div>
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
