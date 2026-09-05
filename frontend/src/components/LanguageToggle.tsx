'use client';

import { useLanguage } from '@/context/LanguageContext';

/**
 * Compact EN / မြ pill that switches the whole UI language at runtime.
 * English is the default; tapping it flips to Burmese (and back).
 */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, toggle } = useLanguage();
  const next = lang === 'en' ? 'Burmese' : 'English';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next}`}
      title={`Switch to ${next}`}
      className={`grid h-9 min-w-9 place-items-center rounded-xl border border-white/10 bg-white/5 px-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 ${className}`}
    >
      {lang === 'en' ? 'မြ' : 'EN'}
    </button>
  );
}
