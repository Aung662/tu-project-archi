'use client';

import Link from 'next/link';
import { tr, t } from '@/lib/i18n';

/**
 * Polished 404 page. On-brand aurora glow behind an oversized gradient "404",
 * plus a few quick links so a lost visitor lands somewhere useful instead of a
 * dead end. Fully bilingual via the i18n layer.
 */
export default function NotFound() {
  const quickLinks = [
    { href: '/', icon: '🔎', label: t.navSearch },
    { href: '/browse', icon: '🗂️', label: t.navBrowse },
    { href: '/toolkit', icon: '🧰', label: t.navToolkit },
    { href: '/kits', icon: '🌐', label: t.navKits },
  ];

  return (
    <div className="relative mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-24 text-center">
      {/* Decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(420px 240px at 50% 20%, rgba(109,139,255,0.25), transparent 65%), radial-gradient(360px 200px at 50% 80%, rgba(165,107,255,0.18), transparent 60%)',
        }}
      />

      <div className="select-none text-7xl font-black leading-none text-gradient-animated sm:text-8xl">
        404
      </div>
      <h1 className="text-xl font-bold text-slate-100 sm:text-2xl">{tr(t.notFoundTitle)}</h1>
      <p className="max-w-sm text-sm text-slate-300">{tr(t.notFoundBody)}</p>

      <Link href="/" className="btn-primary mt-1">
        {tr(t.backHome)}
      </Link>

      <div className="mt-4 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        {quickLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs font-medium text-slate-300 transition hover:border-brand-400/40 hover:bg-white/[0.06] hover:text-white"
          >
            <span className="text-lg" aria-hidden>
              {l.icon}
            </span>
            {tr(l.label)}
          </Link>
        ))}
      </div>
    </div>
  );
}
