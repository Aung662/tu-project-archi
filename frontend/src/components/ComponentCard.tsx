'use client';

import { useState } from 'react';
import type { ComponentItem, Category } from '@/data/components';
import { ComponentIcon } from './ComponentIcon';
import { photoFor } from '@/data/componentPhotos';
import { downloadSvg, downloadPng } from '@/lib/iconDownload';
import { tr, t } from '@/lib/i18n';

/**
 * A single component tile. Shows a REAL product photo when one is registered for
 * the component (see componentPhotos.ts); otherwise — or if that image fails to
 * load — it falls back to the brand-neutral tinted SVG glyph, so the grid stays
 * complete and on-brand. Hover reveals SVG/PNG icon downloads (client-side).
 *
 * The detail view is owned by the parent page (ToolkitPage) so a single modal
 * can page forward/backward through the whole filtered list; clicking a card
 * just reports itself upward via `onOpen`.
 */
export function ComponentCard({
  item,
  category,
  onOpen,
}: {
  item: ComponentItem;
  category: Category;
  onOpen: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const photo = photoFor(item.id);
  const showPhoto = Boolean(photo) && imgOk;

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
    <>
      <button
        type="button"
        onClick={onOpen}
        title={tr(t.toolkitViewDetails)}
        className="card group relative flex w-full flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-0.5 hover:ring-1 hover:ring-white/20"
      >
        <div
          className={`grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 transition group-hover:ring-white/20 ${category.color}`}
        >
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo!}
              alt={item.name}
              loading="lazy"
              onError={() => setImgOk(false)}
              className="h-full w-full rounded-2xl bg-white object-contain"
            />
          ) : (
            <ComponentIcon glyph={item.glyph} title={item.name} className="h-9 w-9" />
          )}
        </div>
        <h3 className="text-sm font-semibold leading-tight text-slate-100">{item.name}</h3>
        <p className="line-clamp-2 text-xs text-slate-400">{item.blurb}</p>

        {/* Download controls — always tappable on mobile, emphasised on hover.
            Downloads are the generated vector icon (works for every component).
            stopPropagation keeps a download from also opening the detail view. */}
        <div className="mt-1 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              svg();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                svg();
              }
            }}
            title={tr(t.toolkitDownloadSvg)}
            className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            SVG
          </span>
          <span
            role="button"
            tabIndex={0}
            aria-disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              if (!busy) png();
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !busy) {
                e.stopPropagation();
                png();
              }
            }}
            title={tr(t.toolkitDownloadPng)}
            className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white aria-disabled:opacity-50"
          >
            {busy ? '…' : 'PNG'}
          </span>
        </div>
      </button>
    </>
  );
}
