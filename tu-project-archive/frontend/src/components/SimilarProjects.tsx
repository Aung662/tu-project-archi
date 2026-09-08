'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ProjectCard as Card } from '@/lib/types';
import { ProjectCard } from './ProjectCard';

/**
 * "You might also like" — related projects for the current detail page.
 * Powered by the backend similarity scorer (falls back to same department /
 * university), so the row is populated for every project.
 */
export function SimilarProjects({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Card[] | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<Card[]>(`/projects/${projectId}/similar`)
      .then((r) => active && setItems(r))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [projectId]);

  if (!items || items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
        <span aria-hidden>✨</span> You might also like
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
