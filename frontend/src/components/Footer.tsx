'use client';

import { tr, t } from '@/lib/i18n';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-900/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-slate-400 sm:flex-row">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Technological University Taunggyi" className="h-8 w-auto" />
          <p>© {new Date().getFullYear()} {tr(t.footerRights)}</p>
        </div>
        <p className="text-xs">{tr(t.footerNote)}</p>
      </div>
    </footer>
  );
}
