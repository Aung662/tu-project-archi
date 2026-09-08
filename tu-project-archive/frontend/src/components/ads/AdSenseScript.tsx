'use client';

import Script from 'next/script';
import { ADSENSE_CLIENT } from '@/lib/ads';

/**
 * Loads the Google AdSense library exactly once, and only when an AdSense client
 * id is configured. Rendered near the root layout. No id set → renders nothing,
 * so the site carries zero ad overhead until you turn ads on.
 */
export function AdSenseScript() {
  if (!ADSENSE_CLIENT) return null;
  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
