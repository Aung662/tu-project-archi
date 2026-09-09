'use client';

import { useEffect, useRef, useState } from 'react';
import type { ExportProject } from '@/lib/projectExport';
import { tr, t } from '@/lib/i18n';

/**
 * ExportButton — a small dropdown on the project detail page that lets a student
 * download a printable one-page "thesis card" PDF (with a scannable QR that
 * links back to the live page) or just the QR code as a PNG. All client-side.
 */
export function ExportButton({ project }: { project: ExportProject }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } catch {
      /* export failed — non-critical, user can retry */
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
      >
        <span aria-hidden>⬇</span>
        <span className="hidden sm:inline">{busy ? tr(t.exportBusy) : tr(t.exportLabel)}</span>
      </button>

      {open && !busy && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-xl border border-white/10 bg-ink-900/95 py-1 shadow-xl backdrop-blur-xl"
        >
          <button
            role="menuitem"
            onClick={() =>
              run(async () => {
                // Lazy-load jsPDF/qrcode only when actually exporting, so they
                // never weigh down the initial project-page bundle.
                const { downloadProjectPdf } = await import('@/lib/projectExport');
                await downloadProjectPdf(project);
              })
            }
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
          >
            <span aria-hidden>📄</span> {tr(t.exportPdf)}
          </button>
          <button
            role="menuitem"
            onClick={() =>
              run(async () => {
                const { downloadProjectQr } = await import('@/lib/projectExport');
                await downloadProjectQr(project);
              })
            }
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
          >
            <span aria-hidden>🔳</span> {tr(t.exportQr)}
          </button>
        </div>
      )}
    </div>
  );
}
