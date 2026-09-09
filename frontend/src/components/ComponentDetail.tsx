'use client';

import { useEffect, useRef, useState } from 'react';
import type { ComponentItem, Category } from '@/data/components';
import { ComponentIcon } from './ComponentIcon';
import { photoFor } from '@/data/componentPhotos';
import { specsFor } from '@/data/componentSpecs';
import { guideFor, type Difficulty } from '@/data/componentGuide';
import { WiringDiagram } from './WiringDiagram';
import {
  isInComponentCompare,
  toggleComponentCompare,
  COMPONENT_COMPARE_EVENT,
} from '@/lib/componentCompare';
import { isFavorite, toggleFavorite, COMPONENT_FAVORITES_EVENT } from '@/lib/componentFavorites';
import { downloadSvg, downloadPng } from '@/lib/iconDownload';
import { downloadCode } from '@/lib/codeDownload';
import { t, getLang, type Label, type Lang } from '@/lib/i18n';

/**
 * Full-screen detail view for a single toolkit component. Opened by clicking a
 * ComponentCard; the parent page owns which item is shown so the same modal can
 * page through the whole filtered list. Shows a product photo (or the
 * brand-neutral glyph when no photo is registered) with a datasheet-style spec
 * table, usage guide and icon downloads.
 *
 * Navigation:
 *  • ‹ / › arrow buttons (and ←/→ keys) step one component at a time.
 *  • A back button (top-left) and a right-swipe gesture both close the view —
 *    matching the phone "back" affordance. A left-swipe jumps to the next item.
 *  • Esc or a backdrop click also closes. Body scroll is locked while open.
 *
 * The layout is mobile-first: on phones it is a single column with a
 * height-capped visual (no giant empty square), expanding to two columns on md+.
 */
export function ComponentDetail({
  item,
  category,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  position,
}: {
  item: ComponentItem;
  category: Category;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  position?: { index: number; total: number };
}) {
  const [imgOk, setImgOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const photo = photoFor(item.id);
  const showPhoto = Boolean(photo) && imgOk;
  const specs = specsFor(item.id);
  const guide = guideFor(item.id);
  const [copied, setCopied] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [fav, setFav] = useState(false);

  // In-modal language override. Defaults to the app's current language, but a
  // reader can flip မြန်မာ / ENG right here to read a component's full details in
  // the other language WITHOUT the global toggle (which would remount the app and
  // close this modal). Every guide string below is read through `tr()`, which
  // respects this local choice.
  const [viewLang, setViewLang] = useState<Lang>(getLang());
  const tr = (label: Label | undefined | null): string => {
    if (!label) return '';
    return label[viewLang] ?? label.en;
  };
  const catLabel = viewLang === 'my' ? category.labelMy : category.labelEn;

  // Keep the compare toggle in sync with the store (and across item changes).
  useEffect(() => {
    const sync = () => setInCompare(isInComponentCompare(item.id));
    sync();
    window.addEventListener(COMPONENT_COMPARE_EVENT, sync);
    return () => window.removeEventListener(COMPONENT_COMPARE_EVENT, sync);
  }, [item.id]);

  // Keep the favourite star in sync with the store (and across item changes).
  useEffect(() => {
    const sync = () => setFav(isFavorite(item.id));
    sync();
    window.addEventListener(COMPONENT_FAVORITES_EVENT, sync);
    return () => window.removeEventListener(COMPONENT_FAVORITES_EVENT, sync);
  }, [item.id]);

  const diffLabel: Record<Difficulty, string> = {
    beginner: tr(t.guideDiffBeginner),
    intermediate: tr(t.guideDiffIntermediate),
    advanced: tr(t.guideDiffAdvanced),
  };
  const diffColor: Record<Difficulty, string> = {
    beginner: 'text-mint-300 bg-mint-300/10',
    intermediate: 'text-amber-300 bg-amber-300/10',
    advanced: 'text-rose-300 bg-rose-300/10',
  };

  async function copyCode() {
    if (!guide?.code) return;
    try {
      await navigator.clipboard.writeText(guide.code.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  // New item shown → reset the "photo failed to load" flag and scroll to top.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setImgOk(true);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [item.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && hasPrev) onPrev?.();
      else if (e.key === 'ArrowRight' && hasNext) onNext?.();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  // ── Touch swipe: right-swipe = back (close), left-swipe = next component.
  const touch = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    const t0 = e.touches[0];
    touch.current = { x: t0.clientX, y: t0.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touch.current) return;
    const t0 = e.changedTouches[0];
    const dx = t0.clientX - touch.current.x;
    const dy = t0.clientY - touch.current.y;
    touch.current = null;
    // Only treat mostly-horizontal, deliberate swipes as navigation.
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx > 0) onClose(); // swipe right → go back
    else if (hasNext) onNext?.(); // swipe left → next
  }

  async function png() {
    setBusy(true);
    try {
      await downloadPng({ glyph: item.glyph, hex: category.hex, name: item.name, id: item.id });
    } finally {
      setBusy(false);
    }
  }
  function svg() {
    downloadSvg({ glyph: item.glyph, hex: category.hex, name: item.name, id: item.id });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      {/* Desktop side arrows — sit outside the card, hidden on small screens
          where the on-header arrows + swipe are used instead. */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev?.();
          }}
          aria-label={tr(t.toolkitPrev)}
          className="fixed left-3 top-1/2 z-[60] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-2xl text-white transition hover:bg-black/80 lg:grid"
        >
          ‹
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          aria-label={tr(t.toolkitNext)}
          className="fixed right-3 top-1/2 z-[60] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-2xl text-white transition hover:bg-black/80 lg:grid"
        >
          ›
        </button>
      )}

      <div
        ref={scrollRef}
        className="card relative my-0 max-h-[100dvh] w-full max-w-3xl overflow-y-auto rounded-none p-0 sm:my-auto sm:max-h-[92vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Sticky top bar: back + position counter + prev/next + close.
            Always reachable while scrolling long content. */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-white/10 bg-ink-900/85 px-3 py-2 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              aria-label={tr(t.toolkitBack)}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <span aria-hidden>←</span> {tr(t.toolkitBack)}
            </button>
            <button
              onClick={() => {
                const ok = toggleComponentCompare(item.id);
                setInCompare(ok);
                if (!ok && !inCompare) alert(tr(t.cmpFull));
              }}
              aria-pressed={inCompare}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                inCompare
                  ? 'border-brand-400/40 bg-brand-500/20 text-brand-100'
                  : 'border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10'
              }`}
            >
              <span aria-hidden>⇄</span>
              <span className="hidden sm:inline">{inCompare ? tr(t.cmpAdded) : tr(t.cmpAdd)}</span>
            </button>
            <button
              onClick={() => setFav(toggleFavorite(item.id))}
              aria-pressed={fav}
              title={fav ? tr(t.favAdded) : tr(t.favAdd)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                fav
                  ? 'border-amber-300/40 bg-amber-300/15 text-amber-200'
                  : 'border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10'
              }`}
            >
              <span aria-hidden>{fav ? '★' : '☆'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* In-modal language switch — read this component's full details in
                မြန်မာ or English without leaving the modal. */}
            <button
              onClick={() => setViewLang((l) => (l === 'my' ? 'en' : 'my'))}
              aria-label="Toggle language"
              title={viewLang === 'my' ? 'Read in English' : 'မြန်မာဖြင့် ဖတ်ရန်'}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-brand-400/30 bg-brand-500/15 px-2.5 text-xs font-bold text-brand-100 transition hover:bg-brand-500/25"
            >
              <span aria-hidden>🌐</span>
              {viewLang === 'my' ? 'ENG' : 'မြန်မာ'}
            </button>
            {position && (
              <span className="mr-1 font-latin text-[11px] tabular-nums text-slate-500">
                {position.index + 1}/{position.total}
              </span>
            )}
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label={tr(t.toolkitPrev)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-lg text-white transition hover:bg-white/15 disabled:opacity-30"
            >
              ‹
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              aria-label={tr(t.toolkitNext)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-lg text-white transition hover:bg-white/15 disabled:opacity-30"
            >
              ›
            </button>
            {/* ✕ is a desktop convenience; on phones the ← Back button and the
                right-swipe gesture are the single, clear way out (no duplicate). */}
            <button
              onClick={onClose}
              aria-label={tr(t.toolkitClose)}
              className="hidden h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-base text-white transition hover:bg-white/15 sm:grid"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[1fr_1.1fr]">
          {/* Visual — capped height on phones so it never leaves a huge blank
              square; a true square only on md+ where it sits beside the info. */}
          <div className="flex flex-col">
            <div className="relative flex h-44 items-center justify-center bg-white p-6 sm:h-56 md:aspect-square md:h-auto">
              {showPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo!}
                  alt={item.name}
                  onError={() => setImgOk(false)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className={`grid h-full w-full place-items-center ${category.color}`}>
                  <ComponentIcon glyph={item.glyph} title={item.name} className="h-24 w-24 md:h-32 md:w-32" />
                </div>
              )}
            </div>
            {showPhoto && (
              <p className="bg-white/[0.02] px-4 py-1.5 text-center text-[10px] text-slate-500">
                {tr(t.toolkitPhotoNote)}
              </p>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium ${category.color}`}
                >
                  <span aria-hidden>●</span>
                  <span className="text-slate-300">{catLabel}</span>
                </span>
                {guide?.difficulty && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${diffColor[guide.difficulty]}`}
                  >
                    {diffLabel[guide.difficulty]}
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-100">{item.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{item.blurb}</p>
            </div>

            {/* Spec table */}
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {tr(t.toolkitSpecs)}
              </h3>
              {specs.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {specs.map((row, i) => (
                        <tr
                          key={row.label}
                          className={i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}
                        >
                          <th
                            scope="row"
                            className="w-2/5 border-b border-white/5 px-3 py-2 align-top font-medium text-slate-400"
                          >
                            {row.label}
                          </th>
                          <td className="border-b border-white/5 px-3 py-2 align-top text-slate-100">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">{tr(t.toolkitNoSpecs)}</p>
              )}
            </div>

            {/* ── Usage guide (only when authored) ─────────────────────── */}
            {guide?.whatFor && (
              <section>
                <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {tr(t.guideWhatFor)}
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">{tr(guide.whatFor)}</p>
              </section>
            )}

            {guide?.useCases && guide.useCases.length > 0 && (
              <section>
                <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {tr(t.guideUseCases)}
                </h3>
                <ul className="space-y-1">
                  {guide.useCases.map((u, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className={`mt-0.5 shrink-0 ${category.color}`} aria-hidden>
                        ▹
                      </span>
                      <span>{tr(u)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {guide?.pinout && guide.pinout.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {tr(t.guidePinout)}
                </h3>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {guide.pinout.map((row, i) => (
                        <tr key={row.pin} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                          <th
                            scope="row"
                            className="w-1/3 border-b border-white/5 px-3 py-2 align-top font-mono text-xs font-medium text-slate-300"
                          >
                            {row.pin}
                          </th>
                          <td className="border-b border-white/5 px-3 py-2 align-top text-slate-400">
                            {tr(row.desc)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {guide?.wiring && (
              <section>
                <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {tr(t.guideWiring)}
                </h3>
                <p className="rounded-lg border border-amber-300/20 bg-amber-300/[0.05] px-3 py-2 text-sm leading-relaxed text-amber-100/90">
                  {tr(guide.wiring)}
                </p>
              </section>
            )}

            {/* Auto-generated wiring diagram — only for non-board hardware that
                has pinout data (boards ARE the Arduino, so no self-diagram). */}
            {category.key !== 'boards' && guide?.pinout && guide.pinout.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {tr(t.guideWiringDiagram)}
                </h3>
                <WiringDiagram pinout={guide.pinout} componentName={item.name} lang={viewLang} />
              </section>
            )}

            {guide?.code && (
              <section>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {tr(t.guideCode)}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={copyCode}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      {copied ? tr(t.guideCodeCopied) : `⧉ ${tr(t.guideCodeCopy)}`}
                    </button>
                    <button
                      onClick={() => guide.code && downloadCode(item.name, guide.code.lang, guide.code.code)}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      ⬇ {tr(t.guideCodeDownload)}
                    </button>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  <div className="border-b border-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {guide.code.lang}
                  </div>
                  <pre className="overflow-x-auto px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-200">
                    <code>{guide.code.code}</code>
                  </pre>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">{tr(t.guideCodeHint)}</p>
              </section>
            )}

            {guide?.cautions && guide.cautions.length > 0 && (
              <section>
                <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {tr(t.guideCautions)}
                </h3>
                <ul className="space-y-1">
                  {guide.cautions.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm text-rose-200/80">
                      <span className="mt-0.5 shrink-0" aria-hidden>
                        ⚠
                      </span>
                      <span>{tr(c)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(guide?.alternatives?.length || guide?.libraries?.length || guide?.price) && (
              <section className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">
                {guide.price && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {tr(t.guidePrice)}
                    </span>
                    <p className="mt-0.5 text-slate-200">{guide.price}</p>
                  </div>
                )}
                {guide.libraries && guide.libraries.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {tr(t.guideLibraries)}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {guide.libraries.map((lib) => (
                        <span
                          key={lib}
                          className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-slate-300"
                        >
                          {lib}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {guide.alternatives && guide.alternatives.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {tr(t.guideAlternatives)}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {guide.alternatives.map((alt) => (
                        <span
                          key={alt}
                          className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-slate-300"
                        >
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Downloads */}
            <div className="mt-auto flex items-center gap-2 pt-2">
              <button
                onClick={svg}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                ⬇ {tr(t.toolkitDownloadSvg)}
              </button>
              <button
                onClick={png}
                disabled={busy}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                ⬇ {busy ? '…' : tr(t.toolkitDownloadPng)}
              </button>
            </div>

            {/* Swipe / arrow hint — phones only */}
            {(hasPrev || hasNext) && (
              <p className="-mt-1 text-center text-[10px] text-slate-500 lg:hidden">
                {tr(t.toolkitSwipeHint)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
