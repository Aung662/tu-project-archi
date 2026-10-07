'use client';

import { useMemo } from 'react';
import { buildFritzingSvg, type FritzingOpts } from '@/lib/fritzing';
import { getBoardProfile } from '@/lib/boardProfiles';

/**
 * FritzingDiagram — renders a self-contained, pinout-derived illustration for
 * board/component pairs without a reviewed physical diagram. Its board/module
 * shapes and synthetic pin pads are visual aids, not exact part artwork or
 * physical connector locations. The UI labels it as an illustrative example.
 */
export function FritzingDiagram(props: FritzingOpts) {
  const { componentName, glyph, category, pinout, boardId, lang } = props;
  const svg = useMemo(
    () => buildFritzingSvg({ componentName, glyph, category, pinout, boardId, lang }),
    [componentName, glyph, category, pinout, boardId, lang],
  );
  const board = getBoardProfile(boardId ?? 'arduino-uno');
  const my = (lang ?? 'en') === 'my';

  if (!svg) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1020]">
      {/* eslint-disable-next-line react/no-danger */}
      <div className="w-full [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      {board.note && (
        <p className="border-t border-white/10 px-3 py-1.5 text-[10px] leading-relaxed text-amber-200/70">
          ⚡ {my ? board.note.my : board.note.en}
        </p>
      )}
    </div>
  );
}
