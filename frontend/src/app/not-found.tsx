'use client';

import Link from 'next/link';
import { tr, t } from '@/lib/i18n';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="text-5xl font-black text-brand-300">404</div>
      <h1 className="text-xl font-bold text-slate-100">{tr(t.notFoundTitle)}</h1>
      <p className="text-sm text-slate-300">{tr(t.notFoundBody)}</p>
      <Link href="/" className="btn-primary mt-2">
        {tr(t.backHome)}
      </Link>
    </div>
  );
}
