'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { DuplicateCheck } from '@/lib/types';
import { Alert, Spinner, SimilarityMeter } from '@/components/ui';
import { tr, t } from '@/lib/i18n';

export default function CheckPage() {
  const VERDICT = {
    DUPLICATE_RISK: { kind: 'error' as const, label: tr(t.verdictDuplicate), emoji: '⛔' },
    SIMILAR_EXISTS: { kind: 'warning' as const, label: tr(t.verdictSimilar), emoji: '⚠️' },
    LIKELY_UNIQUE: { kind: 'success' as const, label: tr(t.verdictUnique), emoji: '✅' },
  };

  const [title, setTitle] = useState('');
  const [res, setRes] = useState<DuplicateCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setRes(await api.get<DuplicateCheck>(`/search/check${api.qs({ title })}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : tr(t.checkFailed));
    } finally {
      setLoading(false);
    }
  }

  const all = res ? [...res.exact, ...res.similar] : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{tr(t.checkTitle)}</h1>
        <p className="text-sm text-slate-400">{tr(t.checkSubtitle)}</p>
      </div>

      <form onSubmit={run} className="card space-y-3 p-5">
        <div>
          <label className="label">{tr(t.proposedTitle)}</label>
          <textarea
            className="input min-h-[80px]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              // Submit on Enter (Shift+Enter keeps a newline for long titles).
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (title.trim() && !loading) run(e as unknown as React.FormEvent);
              }
            }}
            placeholder={tr(t.proposedPlaceholder)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading || !title.trim()}>
          {loading ? tr(t.checking) : tr(t.checkBtn)}
        </button>
      </form>

      {loading && <Spinner />}
      {error && <Alert kind="error">{error}</Alert>}

      {res && !loading && (
        <div className="space-y-4">
          <Alert kind={VERDICT[res.verdict].kind}>
            <span className="text-base font-semibold">
              {VERDICT[res.verdict].emoji} {VERDICT[res.verdict].label}
            </span>
            <p className="mt-1 text-sm">
              {res.verdict === 'DUPLICATE_RISK' && tr(t.verdictDuplicateBody)}
              {res.verdict === 'SIMILAR_EXISTS' && tr(t.verdictSimilarBody)}
              {res.verdict === 'LIKELY_UNIQUE' && tr(t.verdictUniqueBody)}
            </p>
          </Alert>

          {all.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-200">{tr(t.closestTitles)}</h2>
              {all.map((r) => (
                <div key={r.project.id} className="card p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_160px] sm:items-center">
                    <div>
                      <Link
                        href={`/projects/${r.project.id}`}
                        className="font-medium text-slate-100 hover:text-brand-300"
                      >
                        {r.project.title}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {r.project.university.shortName} · {r.project.year}
                      </p>
                    </div>
                    <SimilarityMeter percent={r.percent} kind={r.kind} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
