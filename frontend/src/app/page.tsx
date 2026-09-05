'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { SearchResult } from '@/lib/types';
import { SimilarityMeter, Alert, SkeletonList, EmptyState, LevelBadge } from '@/components/ui';
import { formatMMK } from '@/lib/format';
import { t } from '@/lib/i18n';

export default function HomePage() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<SearchResult>(`/search${api.qs({ q, limit: 25 })}`);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.searchFailed.my);
    } finally {
      setLoading(false);
    }
  }

  const exactCount = result?.results.filter((r) => r.kind === 'EXACT').length ?? 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-12 text-center text-white shadow-lg sm:px-12">
        <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
          {t.heroTitle.my}
        </h1>
        <p className="mx-auto mt-1 max-w-3xl text-sm text-brand-200">{t.heroTitle.en}</p>
        <p className="mx-auto mt-3 max-w-2xl text-brand-100">{t.heroSubtitle.my}</p>
        <form onSubmit={runSearch} className="mx-auto mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder.my}
            className="flex-1 rounded-lg border-0 px-4 py-3 text-slate-800 shadow focus:outline-none focus:ring-2 focus:ring-brand-300"
            aria-label={t.navSearch.my}
          />
          <button type="submit" className="btn bg-white px-6 py-3 text-brand-700 hover:bg-brand-50">
            {t.searchBtn.my}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-brand-100">
          <Link href="/browse" className="underline-offset-2 hover:underline">
            {t.browseCta.my} →
          </Link>
          <span className="opacity-50">|</span>
          <Link href="/check" className="underline-offset-2 hover:underline">
            {t.checkCta.my} →
          </Link>
        </div>
      </section>

      {/* Results */}
      {loading && (
        <section className="space-y-4" aria-busy="true" aria-live="polite">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <SkeletonList count={4} />
        </section>
      )}
      {error && <Alert kind="error">{error}</Alert>}

      {result && !loading && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-800">
              “{result.query}” အတွက် ကိုက်ညီမှု {result.total} ခု
            </h2>
            <span className="text-xs text-slate-500">
              {t.normalized.my}: <code className="rounded bg-slate-100 px-1">{result.normalizedQuery}</code>
            </span>
          </div>

          {exactCount > 0 && (
            <Alert kind="warning">
              <strong>{t.duplicateRiskLead.my}</strong> အလွန်ဆင်တူသော ခေါင်းစဉ် {exactCount} ခု{' '}
              {t.duplicateRiskBody.my}
            </Alert>
          )}

          {result.results.length === 0 ? (
            <EmptyState title={t.noSimilarTitle.my} hint={t.noSimilarHint.my} />
          ) : (
            <ul className="space-y-3">
              {result.results.map((r) => (
                <li key={r.project.id} className="card p-5">
                  <div className="grid gap-4 sm:grid-cols-[1fr_180px] sm:items-center">
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/projects/${r.project.id}`}
                          className="font-semibold text-slate-900 hover:text-brand-700"
                        >
                          {r.project.title}
                        </Link>
                        <LevelBadge level={r.project.level} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {r.project.university.shortName} · {r.project.department.code} ·{' '}
                        {r.project.year} ·{' '}
                        {r.project.priceMmk > 0 ? formatMMK(r.project.priceMmk) : t.free.my}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {r.project.abstract}
                      </p>
                    </div>
                    <SimilarityMeter percent={r.percent} kind={r.kind} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!result && !loading && (
        <section className="grid gap-4 sm:grid-cols-3">
          <Feature title={t.featSearchTitle.my} desc={t.featSearchDesc.my} icon="🔎" />
          <Feature title={t.featRankTitle.my} desc={t.featRankDesc.my} icon="📊" />
          <Feature title={t.featBuyTitle.my} desc={t.featBuyDesc.my} icon="📄" />
        </section>
      )}
    </div>
  );
}

function Feature({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="card p-5">
      <div className="mb-2 text-2xl">{icon}</div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </div>
  );
}
