'use client';

import Link from 'next/link';
import type { ProjectCard as Card } from '@/lib/types';
import { formatMMK } from '@/lib/format';
import { tr, t } from '@/lib/i18n';
import { LevelBadge } from './ui';
import { BookmarkButton } from './BookmarkButton';
import { CompareButton } from './CompareButton';
import { ProjectThumb } from './ProjectThumb';

/** A project counts as "new" if it was added within the last 14 days. */
const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
export function isNewProject(createdAt?: string): boolean {
  if (!createdAt) return false;
  const added = new Date(createdAt).getTime();
  if (Number.isNaN(added)) return false;
  return Date.now() - added <= NEW_WINDOW_MS;
}

export function ProjectCard({ p }: { p: Card }) {
  const isNew = isNewProject(p.createdAt);
  return (
    <Link
      href={`/projects/${p.id}`}
      className="card card-interactive group flex flex-col gap-3 overflow-hidden p-0"
    >
      {/* Cover thumbnail (falls back to a branded placeholder when absent) */}
      <div className="relative aspect-video w-full overflow-hidden bg-ink-800/60">
        {p.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.coverImageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProjectThumb p={p} />
        )}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          {isNew && (
            <span className="rounded-full bg-gradient-to-r from-mint-500 to-mint-400 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-900 shadow-glow">
              {tr(t.newBadge)}
            </span>
          )}
          {(p.spin?.length ?? 0) >= 2 && (
            <span className="rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
              360°
            </span>
          )}
        </div>
        {(p.imageCount ?? 0) > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            🖼 {p.imageCount}
          </span>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <CompareButton
            projectId={p.id}
            title={p.title}
            className="grid h-8 w-8 place-items-center rounded-full bg-black/45 backdrop-blur"
          />
          <BookmarkButton
            projectId={p.id}
            className="grid h-8 w-8 place-items-center rounded-full bg-black/45 backdrop-blur"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-1">
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
              <span className="font-semibold text-mint-300">{tr(t.free)}</span>
            )}
          </span>
          {p.hasFile ? (
            <span className="badge bg-white/10 text-slate-300">{tr(t.fullFileAvailable)}</span>
          ) : (
            <span className="badge bg-white/10 text-slate-400">{tr(t.summaryOnly)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
