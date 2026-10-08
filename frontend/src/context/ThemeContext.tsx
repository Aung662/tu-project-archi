'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeState | undefined>(undefined);

const STORAGE_KEY = 'tu-theme';
const THEME_COLORS: Record<Theme, string> = {
  dark: '#081120',
  light: '#f5f7fc',
};

function syncThemeColor(theme: Theme) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);
  }
  meta.content = THEME_COLORS[theme];
}

/** Applied before hydration by an inline script (see layout) to avoid a flash. */
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  syncThemeColor(theme);
}

function getSystemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Keep the server and first client render consistent; the head script applies
  // the stored/system appearance before paint, then this effect synchronizes it.
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const syncTheme = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        // If storage is unavailable, fall back to the operating-system choice.
      }
      const next: Theme = stored === 'light' || stored === 'dark' ? stored : getSystemTheme();
      setThemeState(next);
      applyTheme(next);
    };

    syncTheme();
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    media?.addEventListener?.('change', syncTheme);
    return () => media?.removeEventListener?.('change', syncTheme);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore storage failures (private mode) */
    }
  }, []);

  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/** Inline script: apply saved/system appearance and browser chrome before paint. */
export const themeInitScript = `(function(){var t='dark';var c=${JSON.stringify(THEME_COLORS)};try{var s=localStorage.getItem('${STORAGE_KEY}');if(s==='light'||s==='dark'){t=s;}else{t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}}catch(e){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}m.content=c[t];})();`;
