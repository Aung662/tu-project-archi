'use client';

import { useMemo } from 'react';
import { buildFritzingSvg, type FritzingOpts } from '@/lib/fritzing';
import { getBoardProfile } from '@/lib/boardProfiles';

/**
 * FritzingDiagram — renders the realistic, Fritzing-style wiring illustration
 * (illustrated board + real module + colour-coded jumper wires to real pins) as
 * inline SVG. The SVG is built by lib/fritzing.ts so the on-screen image and the
 * downloadable file are byte-identical.
 */
export function FritzingDiagram(props: FritzingOpts) {
  const svg = useMemo(() => buildFritzingSvg(props), [
    props.componentName,
    props.glyph,
    props.category,
    props.pinout,
    props.boardId,
    props.lang,
  ]);
  const board = getBoardProfile(props.boardId ?? 'arduino-uno');
  const my = (props.lang ?? 'en') === 'my';

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
