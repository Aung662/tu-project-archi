'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { t } from '@/lib/i18n';

/**
 * Route-segment error boundary. Catches render/data errors in any page under the
 * root layout and offers a recovery ("try again") without a full reload.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production this is where you'd forward to an error-reporting service.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-3xl">⚠️</div>
      <h1 className="text-xl font-bold text-slate-900">{t.errorTitle.my}</h1>
      <p className="text-sm text-slate-500">{t.errorTitle.en}</p>
      <p className="text-sm text-slate-600">{t.errorBody.my}</p>
      <div className="mt-2 flex gap-3">
        <button className="btn-primary" onClick={reset}>
          {t.errorRetry.my}
        </button>
        <Link href="/" className="btn-secondary">
          {t.backHome.my}
        </Link>
      </div>
    </div>
  );
}
