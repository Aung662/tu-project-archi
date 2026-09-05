import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="text-5xl font-black text-brand-600">404</div>
      <h1 className="text-xl font-bold text-slate-900">{t.notFoundTitle.my}</h1>
      <p className="text-sm text-slate-500">{t.notFoundTitle.en}</p>
      <p className="text-sm text-slate-600">{t.notFoundBody.my}</p>
      <Link href="/" className="btn-primary mt-2">
        {t.backHome.my}
      </Link>
    </div>
  );
}
