'use client';

import { useEffect, useState } from 'react';
import type { ComponentItem, Category } from '@/data/components';
import { ComponentIcon } from './ComponentIcon';
import { photoFor } from '@/data/componentPhotos';
import { specsFor } from '@/data/componentSpecs';
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
  const catLabel = getLang() === 'my' ? category.labelMy : category.labelEn;

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
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium ${category.color}`}
              >
                <span aria-hidden>●</span>
                <span className="text-slate-300">{catLabel}</span>
              </span>
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
