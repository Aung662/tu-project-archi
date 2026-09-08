'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker on the client, after load, in production-like
 * environments. Registration is best-effort and never blocks the app: if the
 * browser lacks support or registration fails, the site still works fully online.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Avoid noisy registration during local `next dev` (hot-reload churn); the
    // SW still works in `next start` / production and in the deployed PWA.
    if (process.env.NODE_ENV !== 'production') return;

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline support is progressive enhancement — ignore failures */
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
