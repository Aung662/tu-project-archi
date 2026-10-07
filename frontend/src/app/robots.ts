import type { MetadataRoute } from 'next';

/**
 * Robots policy. The public archive (home, browse, project detail, info pages)
 * is crawlable; anything behind auth or the hidden staff portal is disallowed
 * so it never surfaces in search results.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://tu-project-archive.example';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/login', '/portal-hidden-access', '/library', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
