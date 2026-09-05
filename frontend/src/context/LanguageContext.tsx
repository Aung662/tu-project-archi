'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { tr, getLang, setLangModule, LANG_STORAGE_KEY, type Lang } from '@/lib/i18n';

interface LanguageState {
  lang: Lang;
  toggle: () => void;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageState | undefined>(undefined);

/**
 * Runtime language switcher.
 *
 * Labels are read through `tr()` in `@/lib/i18n`, which consults a module-level
 * language variable. Rather than thread a hook through every one of the ~300
 * label sites, this provider updates that module variable and then bumps a
 * `key` on its children, forcing the whole app subtree to remount and re-read
 * every label. English is the default (matching the SSR render), so the first
 * client paint never mismatches; the stored preference is applied in an effect
 * right after hydration.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: Lang = 'en';
    try {
      const raw = localStorage.getItem(LANG_STORAGE_KEY);
      if (raw === 'my' || raw === 'en') stored = raw;
    } catch {
      /* ignore storage failures (private mode) */
    }
    setLangModule(stored);
    setLangState(stored);
    document.documentElement.lang = stored;
    setReady(true);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangModule(l);
    setLangState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => setLang(getLang() === 'en' ? 'my' : 'en'), [setLang]);

  // Remount the subtree on language change so every `tr()` call re-evaluates.
  return (
    <LanguageContext.Provider value={{ lang, toggle, setLang }}>
      <div key={ready ? lang : 'ssr'} className="contents">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
