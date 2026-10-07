import type { MetadataRoute } from 'next';

/**
 * Static sitemap of the public, crawlable surface. Project detail pages are
 * server-rendered on demand and vary by DB state, so they are intentionally
 * left to organic discovery via the browse index rather than enumerated here
 * at build time (avoids shipping a stale hardcoded id list).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://tu-project-archive.example';
  const now = new Date();
  const paths = [
    '',
    '/browse',
    '/check',
    '/about',
    '/contact',
    '/kits',
    '/wiring',
    '/toolkit',
    '/topics',
    '/titles',
    '/collections',
    '/compare',
    '/stats',
  ];
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === '' || p === '/browse' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));
}
