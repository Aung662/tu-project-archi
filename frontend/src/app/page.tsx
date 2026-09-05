'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { SearchResult } from '@/lib/types';
import { SimilarityMeter, Alert, SkeletonList, EmptyState, LevelBadge } from '@/components/ui';
import { formatMMK } from '@/lib/format';
import { t } from '@/lib/i18n';
import { Reveal, StaggerGrid, StaggerItem, TiltCard } from '@/components/motion';

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
      setError(err instanceof Error ? err.message : t.searchFailed.en);
    } finally {
      setLoading(false);
    }
  }

  const exactCount = result?.results.filter((r) => r.kind === 'EXACT').length ?? 0;

  return (
    <div className="space-y-16">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-16 text-center sm:px-12 sm:py-20">
        {/* hero inner glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(600px 300px at 50% 0%, rgba(109,139,255,0.25), transparent 60%), radial-gradient(500px 260px at 80% 100%, rgba(165,107,255,0.2), transparent 60%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow font-latin">✦ AI Title Similarity</span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            <span className="text-gradient">{t.heroTitle.en}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl font-latin text-sm text-slate-400">
            {t.heroTitle.en}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            {t.heroSubtitle.en}
          </p>
        </motion.div>

        <motion.form
          onSubmit={runSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔍
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPlaceholder.en}
              className="input py-3.5 pl-11 text-base"
              aria-label={t.navSearch.en}
            />
          </div>
          <button type="submit" className="btn-primary px-8 py-3.5 text-base animate-shine">
            {t.searchBtn.en}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300"
        >
          <Link href="/browse" className="transition hover:text-white">
            {t.browseCta.en} →
          </Link>
          <span className="opacity-30">|</span>
          <Link href="/check" className="transition hover:text-white">
            {t.checkCta.en} →
          </Link>
        </motion.div>
      </section>

      {/* ── Results ──────────────────────────────────────────── */}
      {loading && (
        <section className="space-y-4" aria-busy="true" aria-live="polite">
          <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
          <SkeletonList count={4} />
        </section>
      )}
      {error && <Alert kind="error">{error}</Alert>}

      {result && !loading && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-100">
              <span className="text-gradient font-latin">{result.total}</span> match
              {result.total === 1 ? '' : 'es'} for “{result.query}”
            </h2>
            <span className="font-latin text-xs text-slate-400">
              {t.normalized.en}:{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5">{result.normalizedQuery}</code>
            </span>
          </div>

          {exactCount > 0 && (
            <Alert kind="warning">
              <strong>{t.duplicateRiskLead.en}</strong> Found {exactCount} highly similar
              title{exactCount === 1 ? '' : 's'}. {t.duplicateRiskBody.en}
            </Alert>
          )}

          {result.results.length === 0 ? (
            <EmptyState title={t.noSimilarTitle.en} hint={t.noSimilarHint.en} />
          ) : (
            <StaggerGrid className="space-y-3">
              {result.results.map((r) => (
                <StaggerItem key={r.project.id}>
                  <div className="card card-interactive p-5">
                    <div className="grid gap-4 sm:grid-cols-[1fr_180px] sm:items-center">
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Link
                            href={`/projects/${r.project.id}`}
                            className="font-semibold text-slate-100 transition hover:text-brand-300"
                          >
                            {r.project.title}
                          </Link>
                          <LevelBadge level={r.project.level} />
                        </div>
                        <p className="font-latin text-xs text-slate-400">
                          {r.project.university.shortName} · {r.project.department.code} ·{' '}
                          {r.project.year} ·{' '}
                          {r.project.priceMmk > 0 ? formatMMK(r.project.priceMmk) : t.free.en}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                          {r.project.abstract}
                        </p>
                      </div>
                      <SimilarityMeter percent={r.percent} kind={r.kind} />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </section>
      )}

      {/* ── Feature cards (default landing state) ────────────── */}
      {!result && !loading && (
        <>
          <Reveal className="text-center">
            <span className="eyebrow font-latin">Why TU Archive</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-100">
              Why <span className="text-gradient">TU Archive</span>?
            </h2>
          </Reveal>

          <StaggerGrid className="grid gap-6 sm:grid-cols-3">
            <Feature
              title={t.featSearchTitle.en}
              desc={t.featSearchDesc.en}
              icon="🔎"
              tint="from-brand-500/20 to-brand-500/0"
            />
            <Feature
              title={t.featRankTitle.en}
              desc={t.featRankDesc.en}
              icon="📊"
              tint="from-plum-500/20 to-plum-500/0"
            />
            <Feature
              title={t.featBuyTitle.en}
              desc={t.featBuyDesc.en}
              icon="📄"
              tint="from-mint-500/20 to-mint-500/0"
            />
          </StaggerGrid>

          {/* Stats band */}
          <Reveal>
            <div className="card grid grid-cols-2 gap-6 p-8 sm:grid-cols-4">
              <Stat value="3" label="Universities" />
              <Stat value="7" label="Departments" />
              <Stat value="12+" label="Projects" />
              <Stat value="AI" label="Similarity Engine" />
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}

function Feature({
  title,
  desc,
  icon,
  tint,
}: {
  title: string;
  desc: string;
  icon: string;
  tint: string;
}) {
  return (
    <StaggerItem>
      <TiltCard className="h-full">
        <div className="card card-interactive h-full p-6">
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-2xl ring-1 ring-white/10`}
          >
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
        </div>
      </TiltCard>
    </StaggerItem>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-latin text-3xl font-extrabold text-gradient sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}
