'use client';

import { useEffect, useState } from 'react';
import type { ComponentItem, Category } from '@/data/components';
import { ComponentIcon } from './ComponentIcon';
import { photoFor } from '@/data/componentPhotos';
import { specsFor } from '@/data/componentSpecs';
import { guideFor, type Difficulty } from '@/data/componentGuide';
import { downloadSvg, downloadPng } from '@/lib/iconDownload';
import { tr, t, getLang } from '@/lib/i18n';

/**
 * Full-screen detail view for a single toolkit component. Opened by clicking a
 * ComponentCard. Shows a large product photo (or the brand-neutral glyph when no
 * photo is registered) alongside a datasheet-style specification table, plus the
 * SVG/PNG icon downloads. Esc or a backdrop click closes it; body scroll is
 * locked while open for a focused reading experience.
 */
export function ComponentDetail({
  item,
  category,
  onClose,
}: {
  item: ComponentItem;
  category: Category;
  onClose: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const photo = photoFor(item.id);
  const showPhoto = Boolean(photo) && imgOk;
  const specs = specsFor(item.id);
  const guide = guideFor(item.id);
  const [copied, setCopied] = useState(false);
  const catLabel = getLang() === 'my' ? category.labelMy : category.labelEn;

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div
        className="card relative my-auto w-full max-w-3xl overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label={tr(t.toolkitClose)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-lg text-white transition hover:bg-black/70"
        >
          ✕
        </button>

        <div className="grid gap-0 md:grid-cols-[1fr_1.1fr]">
          {/* Visual */}
          <div className="flex flex-col">
            <div className="relative flex aspect-square items-center justify-center bg-white p-6">
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
                  <ComponentIcon glyph={item.glyph} title={item.name} className="h-32 w-32" />
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
          <div className="flex flex-col gap-4 p-6">
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

            {guide?.code && (
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {tr(t.guideCode)}
                  </h3>
                  <button
                    onClick={copyCode}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {copied ? tr(t.guideCodeCopied) : `⧉ ${tr(t.guideCodeCopy)}`}
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  <div className="border-b border-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {guide.code.lang}
                  </div>
                  <pre className="overflow-x-auto px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-200">
                    <code>{guide.code.code}</code>
                  </pre>
                </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
