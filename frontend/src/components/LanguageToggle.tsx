'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Icon } from '@/components/Icon';

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
      className={`inline-flex h-11 items-center gap-1.5 rounded-xl border border-brand-400/30 bg-brand-500/15 px-3 text-sm font-bold text-brand-100 shadow-sm transition hover:border-brand-400/50 hover:bg-brand-500/25 ${className}`}
    >
      <Icon name="globe" className="h-4 w-4 shrink-0" />
      <span className={`whitespace-nowrap ${lang === 'en' ? 'font-mm' : ''}`}>
        {lang === 'en' ? 'မြန်မာ' : 'ENG'}
      </span>
    </button>
  );
}
