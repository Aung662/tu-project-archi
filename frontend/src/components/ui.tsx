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
        {label.my} <span className="text-slate-400">· {label.en}</span>
      </span>
    );
  }
  return (
    <span className={className}>
      <span className="block">{label.my}</span>
      <span className="block text-xs font-normal text-slate-400">{label.en}</span>
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    YEAR_3: 'bg-amber-100 text-amber-800',
    YEAR_5: 'bg-violet-100 text-violet-800',
    FINAL_YEAR: 'bg-emerald-100 text-emerald-800',
    OTHER: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`badge ${colors[level] || colors.OTHER}`}>
      {levelLabel[level]?.my || level}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PUBLISHED: 'bg-emerald-100 text-emerald-800',
    DRAFT: 'bg-slate-100 text-slate-700',
    ARCHIVED: 'bg-amber-100 text-amber-800',
    PENDING: 'bg-amber-100 text-amber-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`badge ${colors[status] || 'bg-slate-100'}`}>
      {statusLabel[status]?.my || status}
    </span>
  );
}

/** Circular-ish similarity meter with color by band. */
export function SimilarityMeter({ percent, kind }: { percent: number; kind: 'EXACT' | 'SIMILAR' }) {
  const color =
    kind === 'EXACT' ? 'bg-red-500' : percent >= 60 ? 'bg-amber-500' : 'bg-brand-500';
  const label = kind === 'EXACT' ? 'ထပ်တူဖြစ်နိုင်ခြေ' : 'ဆင်တူ';
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className={`font-semibold ${kind === 'EXACT' ? 'text-red-600' : 'text-slate-600'}`}>
          {label}
        </span>
        <span className="font-mono font-bold text-slate-700">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
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
    info: 'bg-brand-50 text-brand-800 border-brand-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[kind]}`} role="alert">
      {children}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

/** A single shimmering placeholder block. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
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
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-2xl">🔍</div>
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {hint && <p className="max-w-md text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
