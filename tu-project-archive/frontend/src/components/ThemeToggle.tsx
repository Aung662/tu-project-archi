'use client';

import { useTheme } from '@/context/ThemeContext';

/** Small sun/moon button that switches between dark and light themes. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg transition hover:bg-white/10 ${className}`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
