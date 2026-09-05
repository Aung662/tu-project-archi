'use client';

import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-3xl">📡</div>
      <h1 className="text-xl font-bold text-slate-100">{t.offlineTitle.my}</h1>
      <p className="text-sm text-slate-400">{t.offlineTitle.en}</p>
      <p className="text-sm text-slate-300">{t.offlineBody.my}</p>
      <div className="mt-2 flex gap-3">
        <button className="btn-primary" onClick={() => location.reload()}>
          {t.offlineRetry.my}
        </button>
        <Link href="/" className="btn-secondary">
          {t.backHome.my}
        </Link>
      </div>
    </div>
  );
}
