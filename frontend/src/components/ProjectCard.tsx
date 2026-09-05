'use client';

import Link from 'next/link';
import type { ProjectCard as Card } from '@/lib/types';
import { formatMMK } from '@/lib/format';
import { t } from '@/lib/i18n';
import { LevelBadge } from './ui';

export function ProjectCard({ p }: { p: Card }) {
  return (
    <Link
      href={`/projects/${p.id}`}
      className="card card-interactive group flex flex-col gap-3 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug text-slate-100 group-hover:text-brand-300">
          {p.title}
        </h3>
        <LevelBadge level={p.level} />
      </div>
      <p className="line-clamp-2 text-sm text-slate-400">{p.abstract}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
        <span className="font-medium text-slate-200">{p.university.shortName}</span>
        <span>·</span>
        <span>{p.department.code}</span>
        <span>·</span>
        <span>{p.year}</span>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-sm">
          {p.priceMmk > 0 ? (
            <span className="font-semibold text-brand-300">{formatMMK(p.priceMmk)}</span>
          ) : (
            <span className="font-semibold text-mint-300">{t.free.my}</span>
          )}
        </span>
        {p.hasFile ? (
          <span className="badge bg-white/10 text-slate-300">{t.fullFileAvailable.my}</span>
        ) : (
          <span className="badge bg-white/10 text-slate-400">{t.summaryOnly.my}</span>
        )}
      </div>
    </Link>
  );
}
