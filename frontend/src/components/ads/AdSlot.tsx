'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, ADS_ENABLED } from '@/lib/ads';

/**
 * A single reusable ad slot.
 *
 * - If a Google AdSense client id is configured, it renders a real responsive
 *   AdSense unit (you pass the slot id from your AdSense dashboard).
 * - If ads are enabled but no AdSense id is set, it shows a "sponsor" house
 *   placeholder you can sell directly (a simple styled box) — useful before
 *   AdSense approval and for direct ad sales.
 * - If ads are disabled entirely, it renders nothing (in production) so the
 *   page stays clean.
 *
 * Keeping ad logic in one component means you control placement, spacing, and
 * the "Advertisement" label (required by most ad networks) from one file.
 */
export function AdSlot({
  slot,
  className = '',
  label = true,
  minHeight = 100,
}: {
  slot?: string;
  className?: string;
  label?: boolean;
  minHeight?: number;
}) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || pushed.current) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ad blocker or script not ready — ignore silently */
    }
  }, [slot]);

  if (!ADS_ENABLED) {
    // In dev, show a subtle marker so you can see where ads will appear.
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div
          className={`grid place-items-center rounded-xl border border-dashed border-white/15 text-xs text-slate-500 ${className}`}
          style={{ minHeight }}
        >
          Ad slot (disabled)
        </div>
      );
    }
    return null;
  }

  return (
    <div className={className}>
      {label && (
        <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-slate-500">
          Advertisement
        </p>
      )}
      {ADSENSE_CLIENT && slot ? (
        <ins
          ref={ref}
          className="adsbygoogle block"
          style={{ display: 'block', minHeight }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        // House / direct-sold placeholder. Replace with your sold banner or a
        // <Link> to a sponsor. Sell this space directly to companies.
        <a
          href="/contact"
          className="grid place-items-center rounded-xl border border-brand-400/25 bg-gradient-to-br from-brand-500/15 to-brand-700/10 px-4 text-center text-sm text-slate-300 transition hover:from-brand-500/25"
          style={{ minHeight }}
        >
          <span>
            <span className="font-semibold text-brand-100">Advertise here</span>
            <br />
            <span className="text-xs text-slate-400">Reach engineering students — contact us</span>
          </span>
        </a>
      )}
    </div>
  );
}
