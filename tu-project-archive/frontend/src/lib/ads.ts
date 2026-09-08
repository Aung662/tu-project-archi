/**
 * Central ad / monetization configuration, driven by public env vars so no
 * secrets live in code and you can turn ads on/off per-deployment.
 *
 * Set these in Vercel → Project → Settings → Environment Variables:
 *   NEXT_PUBLIC_ADSENSE_CLIENT   e.g. "ca-pub-1234567890123456"  (from AdSense)
 *   NEXT_PUBLIC_ADS_ENABLED      "true" to show ad slots (default: off)
 *
 * When unset, ad slots render nothing in production (and a labelled placeholder
 * in development) so the layout never looks broken.
 */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
export const ADS_ENABLED =
  (process.env.NEXT_PUBLIC_ADS_ENABLED || '').toLowerCase() === 'true' || Boolean(ADSENSE_CLIENT);
