'use client';

import { levelLabel, statusLabel, type Label } from '@/lib/i18n';

/**
 * Bilingual text: Burmese primary (larger), English secondary (smaller, muted).
 * Use for headings/labels where the extra English helper aids the thesis review
 * and non-Burmese examiners. Pass `inline` to keep both on one line.
 */
export function Bi({ label, inline = false, className = '' }: { label: Label; inline?: boolean; className?: string }) {
  if (inline) {
    return (
      <span className={className}>
        {label.my} <span className="font-latin text-slate-400">· {label.en}</span>
      </span>
    );
  }
  return (
    <span className={className}>
      <span className="block">{label.my}</span>
      <span className="block font-latin text-xs font-normal text-slate-400">{label.en}</span>
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    YEAR_3: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/25',
    YEAR_5: 'bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/25',
    FINAL_YEAR: 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25',
    OTHER: 'bg-white/10 text-slate-300 ring-1 ring-white/15',
  };
  return (
    <span className={`badge ${colors[level] || colors.OTHER}`}>
      {levelLabel[level]?.my || level}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PUBLISHED: 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25',
    DRAFT: 'bg-white/10 text-slate-300 ring-1 ring-white/15',
    ARCHIVED: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/25',
    PENDING: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/25',
    APPROVED: 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25',
    REJECTED: 'bg-red-400/15 text-red-300 ring-1 ring-red-400/25',
  };
  return (
    <span className={`badge ${colors[status] || 'bg-white/10 text-slate-300 ring-1 ring-white/15'}`}>
      {statusLabel[status]?.my || status}
    </span>
  );
}

/** Similarity meter with color/glow by band. */
export function SimilarityMeter({ percent, kind }: { percent: number; kind: 'EXACT' | 'SIMILAR' }) {
  const bar =
    kind === 'EXACT'
      ? 'from-red-500 to-rose-400'
      : percent >= 60
        ? 'from-amber-500 to-yellow-400'
        : 'from-brand-500 to-plum-500';
  const label = kind === 'EXACT' ? 'ထပ်တူဖြစ်နိုင်ခြေ' : 'ဆင်တူ';
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className={`font-semibold ${kind === 'EXACT' ? 'text-red-300' : 'text-slate-300'}`}>
          {label}
        </span>
        <span className="font-latin font-bold text-slate-100">{percent}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bar} transition-[width] duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function Alert({
  kind = 'info',
  children,
}: {
  kind?: 'info' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    info: 'bg-brand-500/10 text-brand-200 border-brand-400/30',
    success: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/30',
    error: 'bg-red-500/10 text-red-200 border-red-400/30',
    warning: 'bg-amber-500/10 text-amber-200 border-amber-400/30',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm backdrop-blur ${styles[kind]}`} role="alert">
      {children}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-brand-400" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

/** A single shimmering placeholder block. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className}`} />;
}

/** A card-shaped skeleton row mirroring a project result while data loads. */
export function SkeletonCard() {
  return (
    <div className="card space-y-3 p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

/** A list of skeleton cards for list/grid loading states. */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-white/5 text-2xl ring-1 ring-white/10">
        🔍
      </div>
      <p className="text-base font-semibold text-slate-100">{title}</p>
      {hint && <p className="max-w-md text-sm text-slate-400">{hint}</p>}
    </div>
  );
}
