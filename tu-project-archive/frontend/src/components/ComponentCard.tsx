'use client';

import { useState } from 'react';
import type { ComponentItem, Category } from '@/data/components';
import { ComponentIcon } from './ComponentIcon';
import { downloadSvg, downloadPng } from '@/lib/iconDownload';
import { tr, t } from '@/lib/i18n';

/**
 * A single component tile: tinted glyph, name, one-line blurb, and hover
 * download controls (SVG + PNG). Icons are generated fully client-side so they
 * work offline and never hit the network.
 */
export function ComponentCard({ item, category }: { item: ComponentItem; category: Category }) {
  const [busy, setBusy] = useState(false);

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
    <div className="card group relative flex flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-0.5">
      <div
        className={`grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10 transition group-hover:ring-white/20 ${category.color}`}
      >
        <ComponentIcon glyph={item.glyph} title={item.name} className="h-9 w-9" />
      </div>
      <h3 className="text-sm font-semibold leading-tight text-slate-100">{item.name}</h3>
      <p className="line-clamp-2 text-xs text-slate-400">{item.blurb}</p>

      {/* Download controls — always tappable on mobile, emphasised on hover. */}
      <div className="mt-1 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
        <button
          onClick={svg}
          title={tr(t.toolkitDownloadSvg)}
          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          SVG
        </button>
        <button
          onClick={png}
          disabled={busy}
          title={tr(t.toolkitDownloadPng)}
          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          {busy ? '…' : 'PNG'}
        </button>
      </div>
    </div>
  );
}
