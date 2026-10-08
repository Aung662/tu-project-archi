'use client';

import { useTheme } from '@/context/ThemeContext';
import { Icon } from '@/components/Icon';

/** Small sun/moon button that switches between dark and light themes. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`theme-toggle grid h-11 w-11 place-items-center rounded-xl text-lg transition ${className}`}
    >
      <Icon name={isDark ? 'sun' : 'moon'} className="h-5 w-5" />
    </button>
  );
}
