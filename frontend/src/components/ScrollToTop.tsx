'use client';

import { useEffect, useState } from 'react';
import { tr, t } from '@/lib/i18n';

/**
 * Floating "back to top" button. Appears after the user scrolls down a bit and
 * smoothly returns them to the top of the page. Fixed to the bottom-right so it
 * never overlaps primary content; sits above the footer.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={tr(t.scrollTop)}
      title={tr(t.scrollTop)}
      className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-brand-600 text-xl text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
    >
      ↑
    </button>
  );
}
