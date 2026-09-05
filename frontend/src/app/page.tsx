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
          className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm"
        >
          <Link
            href="/browse"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/15 px-5 py-2.5 font-semibold text-brand-100 shadow-glow transition hover:border-brand-300 hover:bg-brand-500/30 hover:text-white"
          >
            <span aria-hidden>🗂️</span>
            {t.browseCta.en}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/check"
            className="group inline-flex items-center gap-2 rounded-full border border-plum-400/40 bg-plum-500/15 px-5 py-2.5 font-semibold text-plum-100 shadow-glow transition hover:border-plum-300 hover:bg-plum-500/30 hover:text-white"
          >
            <span aria-hidden>🛡️</span>
            {t.checkCta.en}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
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
              details={[
                'Type any proposed title and see the closest existing projects ranked instantly.',
                'Search covers titles, keywords and abstracts across every university.',
                'Great for a quick idea check before committing to a topic.',
              ]}
              cta={{ label: 'Try a search', href: '/' }}
              onCtaScrollTop
            />
            <Feature
              title={t.featRankTitle.en}
              desc={t.featRankDesc.en}
              icon="📊"
              tint="from-plum-500/20 to-plum-500/0"
              details={[
                'Combines three signals: trigram overlap (55%), shared tokens (30%) and edit distance (15%).',
                'Scores from 0–100%. A match of 85%+ is flagged as a likely duplicate.',
                'Deterministic and explainable — no black-box guesswork.',
              ]}
              cta={{ label: 'Run a full check', href: '/check' }}
            />
            <Feature
              title={t.featBuyTitle.en}
              desc={t.featBuyDesc.en}
              icon="📄"
              tint="from-mint-500/20 to-mint-500/0"
              details={[
                'Preview every project free; the full file is paid and protected.',
                'Pay in MMK via KBZPay/Wave, upload your screenshot, and an admin verifies it.',
                'Once approved, the file streams only to you — never a public link.',
              ]}
              cta={{ label: 'Browse projects', href: '/browse' }}
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
  details,
  cta,
  onCtaScrollTop,
}: {
  title: string;
  desc: string;
  icon: string;
  tint: string;
  details: string[];
  cta: { label: string; href: string };
  onCtaScrollTop?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `feat-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <StaggerItem>
      <TiltCard className="h-full">
        <div className="card card-interactive flex h-full flex-col p-6">
          {/* The whole header is a button that toggles the detail panel. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="group/btn text-left"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-2xl ring-1 ring-white/10 transition group-hover/btn:ring-white/25`}
            >
              {icon}
            </div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
              {title}
              <span
                className={`text-sm text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                aria-hidden
              >
                ▾
              </span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
            {!open && (
              <span className="mt-3 inline-block text-xs font-medium text-brand-200/90 transition group-hover/btn:text-brand-100">
                Tap to learn more →
              </span>
            )}
          </button>

          <motion.div
            id={panelId}
            initial={false}
            animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
              {details.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 text-brand-300" aria-hidden>
                    •
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <Link
              href={cta.href}
              onClick={
                onCtaScrollTop
                  ? (e) => {
                      // "Search" lives at the top of THIS page — scroll up instead of navigating.
                      if (cta.href === '/') {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }
                  : undefined
              }
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {cta.label}
              <span aria-hidden>→</span>
            </Link>
          </motion.div>
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
