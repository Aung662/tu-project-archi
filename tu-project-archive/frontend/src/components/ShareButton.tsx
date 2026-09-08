'use client';

import { useState } from 'react';
import { tr, t } from '@/lib/i18n';

/**
 * Share a project. Uses the native Web Share sheet on mobile (so students can
 * send it via Messenger/Viber/Telegram in one tap) and falls back to copying the
 * link to the clipboard on desktop.
 */
export function ShareButton({
  title,
  className = '',
  showLabel = false,
}: {
  title: string;
  className?: string;
  showLabel?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    // Prefer the native share sheet where available (mostly mobile).
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled or share failed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 ${className}`}
      aria-label={tr(t.shareLabel)}
    >
      <span aria-hidden>{copied ? '✓' : '🔗'}</span>
      {(showLabel || copied) && <span>{copied ? tr(t.shareCopied) : tr(t.shareLabel)}</span>}
    </button>
  );
}
