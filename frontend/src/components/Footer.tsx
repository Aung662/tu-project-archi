import { t } from '@/lib/i18n';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-900/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-slate-400 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-plum-500 font-latin text-xs font-extrabold text-white">
            TU
          </span>
          <p>© {new Date().getFullYear()} {t.footerRights.en}</p>
        </div>
        <p className="text-xs">{t.footerNote.en}</p>
      </div>
    </footer>
  );
}
