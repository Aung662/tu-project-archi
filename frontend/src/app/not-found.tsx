import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="text-5xl font-black text-brand-300">404</div>
      <h1 className="text-xl font-bold text-slate-100">{t.notFoundTitle.en}</h1>
      <p className="text-sm text-slate-400">{t.notFoundTitle.en}</p>
      <p className="text-sm text-slate-300">{t.notFoundBody.en}</p>
      <Link href="/" className="btn-primary mt-2">
        {t.backHome.en}
      </Link>
    </div>
  );
}
