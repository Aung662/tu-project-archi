'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Fires a lightweight, cookie-free page-view beacon on every route change.
 * Failures are silently ignored — analytics must never disrupt navigation.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    last.current = pathname;
    // Use keepalive so the beacon still sends during a navigation unload.
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      keepalive: true,
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
