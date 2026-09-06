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
      className={`inline-flex h-9 items-center gap-1.5 rounded-xl border border-brand-400/30 bg-brand-500/15 px-3 text-sm font-bold text-brand-100 shadow-sm transition hover:border-brand-400/50 hover:bg-brand-500/25 ${className}`}
    >
      <span aria-hidden className="text-[13px] leading-none">🌐</span>
      <span className="whitespace-nowrap">{lang === 'en' ? 'မြန်မာ' : 'ENG'}</span>
    </button>
  );
}
