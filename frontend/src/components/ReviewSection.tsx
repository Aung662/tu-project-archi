'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { ReviewSummary } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Spinner, Alert } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { tr, t } from '@/lib/i18n';

/** Read-only star row (filled vs empty). */
function Stars({ value, size = 'text-base' }: { value: number; size?: string }) {
  return (
    <span className={`${size} leading-none`} aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(value) ? 'text-amber-400' : 'text-slate-600'}>
          ★
        </span>
      ))}
    </span>
  );
}

/** Interactive star picker. */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={tr(t.reviewYours)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className={`text-2xl leading-none transition-transform hover:scale-110 ${
            s <= (hover || value) ? 'text-amber-400' : 'text-slate-600'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ReviewSummary | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const load = () =>
    api
      .get<ReviewSummary>(`/reviews/project/${projectId}`)
      .then((d) => {
        setData(d);
        if (d.mine) {
          setRating(d.mine.rating);
          setComment(d.mine.comment);
        }
      })
      .catch(() => setData({ average: 0, count: 0, distribution: [0, 0, 0, 0, 0], mine: null, reviews: [] }));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  async function submit() {
    if (rating < 1) return;
    setBusy(true);
    try {
      await api.post(`/reviews/project/${projectId}`, { rating, comment });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api.del(`/reviews/project/${projectId}`);
      setRating(0);
      setComment('');
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <Spinner />;

  return (
    <section className="card space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <span aria-hidden>⭐</span> {tr(t.reviewsTitle)}
        </h2>
        {data.count > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-latin text-2xl font-bold text-slate-100">{data.average}</span>
            <div>
              <Stars value={data.average} />
              <p className="font-latin text-xs text-slate-400">
                {data.count} {tr(t.reviewsCount)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Distribution bars */}
      {data.count > 0 && (
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = data.distribution[star - 1] ?? 0;
            const pct = data.count ? (n / data.count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-8 font-latin tabular-nums">{star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-amber-400/80" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right font-latin tabular-nums">{n}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Write / edit your review */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        {user ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-200">{tr(t.reviewYours)}</p>
            <StarPicker value={rating} onChange={setRating} />
            <textarea
              className="input min-h-[70px] resize-y"
              placeholder={tr(t.reviewComment)}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <button onClick={submit} disabled={busy || rating < 1} className="btn-primary">
                {data.mine ? tr(t.reviewUpdate) : tr(t.reviewSubmit)}
              </button>
              {data.mine && (
                <button onClick={remove} disabled={busy} className="btn-secondary">
                  {tr(t.reviewDelete)}
                </button>
              )}
              {justSaved && <span className="text-sm text-mint-300">✓ {tr(t.reviewThanks)}</span>}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">{tr(t.reviewLoginPrompt)}</p>
            <button
              onClick={() => router.push(`/login?next=/projects/${projectId}`)}
              className="btn-secondary"
            >
              {tr(t.reviewLoginPrompt)}
            </button>
          </div>
        )}
      </div>

      {/* Recent reviews */}
      {data.reviews.length === 0 ? (
        <p className="text-sm text-slate-500">{tr(t.reviewsNone)}</p>
      ) : (
        <ul className="space-y-3">
          {data.reviews.map((r) => (
            <li key={r.id} className="border-t border-white/5 pt-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-200">{r.authorName}</span>
                <Stars value={r.rating} size="text-sm" />
              </div>
              {r.comment && <p className="mt-1 text-sm text-slate-300">{r.comment}</p>}
              <p className="mt-1 font-latin text-xs text-slate-500">{formatDate(r.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
