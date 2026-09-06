'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import type { SearchResult } from '@/lib/types';
import { SimilarityMeter, Alert, SkeletonList, EmptyState, LevelBadge } from '@/components/ui';
import { formatMMK } from '@/lib/format';
import { tr, t } from '@/lib/i18n';
import { Reveal, StaggerGrid, StaggerItem, TiltCard } from '@/components/motion';

interface Suggestion {
  id: string;
  title: string;
  year: number;
  deptCode: string;
}

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Autocomplete ──────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const suppressRef = useRef(false); // skip fetch right after picking/searching
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    const query = q.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const rows = await api.get<Suggestion[]>(`/projects/autocomplete${api.qs({ q: query })}`);
        setSuggestions(rows);
        setShowSuggest(true);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowSuggest(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function pickSuggestion(s: Suggestion) {
    suppressRef.current = true;
    setShowSuggest(false);
    setQ(s.title);
    router.push(`/projects/${s.id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggest || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      pickSuggestion(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggest(false);
    }
  }

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    suppressRef.current = true;
    setShowSuggest(false);
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<SearchResult>(`/search${api.qs({ q, limit: 25 })}`);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr(t.searchFailed));
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
            <span className="text-gradient">{tr(t.heroTitle)}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            {tr(t.heroSubtitle)}
          </p>
        </motion.div>

        <motion.form
          onSubmit={runSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1" ref={boxRef}>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔍
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
              placeholder={tr(t.searchPlaceholder)}
              className="input py-3.5 pl-11 text-base"
              aria-label={tr(t.navSearch)}
              autoComplete="off"
              role="combobox"
              aria-expanded={showSuggest}
              aria-controls="search-suggestions"
            />
            <AnimatePresence>
              {showSuggest && suggestions.length > 0 && (
                <motion.ul
                  id="search-suggestions"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/15 bg-ink-800/95 text-left shadow-2xl backdrop-blur"
                >
                  {suggestions.map((s, i) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion(s)}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                          i === activeIdx ? 'bg-brand-500/25 text-white' : 'text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-slate-400" aria-hidden>
                          🔎
                        </span>
                        <span className="flex-1 truncate">{s.title}</span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {s.deptCode} · {s.year}
                        </span>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <button type="submit" className="btn-primary px-8 py-3.5 text-base animate-shine">
            {tr(t.searchBtn)}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
        >
          <Link href="/browse" className="cta3d cta3d-blue group">
            <span className="cta3d-icon" aria-hidden>🗂️</span>
            <span className="cta3d-label">{tr(t.projectLibraryCta)}</span>
            <span className="cta3d-arrow transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link href="/check" className="cta3d cta3d-plum group">
            <span className="cta3d-icon" aria-hidden>🛡️</span>
            <span className="cta3d-label">{tr(t.searchSameTitlesCta)}</span>
            <span className="cta3d-arrow transition-transform group-hover:translate-x-1">→</span>
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
              {tr(t.normalized)}:{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5">{result.normalizedQuery}</code>
            </span>
          </div>

          {exactCount > 0 && (
            <Alert kind="warning">
              <strong>{tr(t.duplicateRiskLead)}</strong> Found {exactCount} highly similar
              title{exactCount === 1 ? '' : 's'}. {tr(t.duplicateRiskBody)}
            </Alert>
          )}

          {result.results.length === 0 ? (
            <EmptyState title={tr(t.noSimilarTitle)} hint={tr(t.noSimilarHint)} />
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
                          {r.project.priceMmk > 0 ? formatMMK(r.project.priceMmk) : tr(t.free)}
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
              title={tr(t.featSearchTitle)}
              desc={tr(t.featSearchDesc)}
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
              title={tr(t.featRankTitle)}
              desc={tr(t.featRankDesc)}
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
              title={tr(t.featBuyTitle)}
              desc={tr(t.featBuyDesc)}
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
