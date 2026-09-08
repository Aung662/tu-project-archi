'use client';

import { GLYPHS, type GlyphKey } from '@/data/glyphs';

/**
 * Renders a component glyph inside a 48×48 SVG, tinted via `currentColor` so the
 * parent can colour it with any Tailwind text-* class. The markup is the SAME
 * source used by the downloadable icon builder, keeping screen + file identical.
 */
export function ComponentIcon({
  glyph,
  className = '',
  title,
}: {
  glyph: GlyphKey;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${escapeHtml(title)}</title>` : '') + (GLYPHS[glyph] ?? '') }}
    />
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
