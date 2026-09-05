import { t } from '@/lib/i18n';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} {t.footerRights.my}</p>
        <p className="text-xs">{t.footerNote.my}</p>
      </div>
    </footer>
  );
}
