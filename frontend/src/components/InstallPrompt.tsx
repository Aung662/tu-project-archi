'use client';

import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';

/** The browser's beforeinstallprompt event (not in the standard TS lib yet). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'tu-install-dismissed';

/**
 * A lightweight, non-intrusive PWA install banner. It only appears when the
 * browser fires `beforeinstallprompt` (i.e. the app is actually installable and
 * not already installed) and the user hasn't dismissed it before. Progressive
 * enhancement: browsers without the event simply never show it.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setVisible(false));
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!visible || !deferred) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore storage errors */
    }
  };

  const install = async () => {
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl p-3 sm:p-4">
      <div className="card glass-strong flex items-center gap-3 p-3 shadow-lg">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          TU
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">{t.installApp.my}</p>
          <p className="truncate text-xs text-slate-400">{t.installApp.en}</p>
        </div>
        <button className="btn-secondary px-3 py-1.5 text-xs" onClick={dismiss}>
          {t.installDismiss.my}
        </button>
        <button className="btn-primary px-3 py-1.5 text-xs" onClick={install}>
          {t.installApp.my}
        </button>
      </div>
    </div>
  );
}
