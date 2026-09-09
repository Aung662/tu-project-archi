'use client';

import { useMemo } from 'react';
import { buildWiring, WIRE_KIND_LABEL, type WireConn } from '@/lib/wiring';
import type { PinRow } from '@/data/componentGuide';
import { tr, t, getLang } from '@/lib/i18n';

/**
 * WiringDiagram — an auto-generated, self-contained SVG showing how a component
 * *typically* connects to an Arduino UNO, derived from the component's pinout
 * data (see lib/wiring.ts). No external assets: pure inline SVG so it renders in
 * the sandboxed preview and downloads fine.
 *
 * It is intentionally labelled a "typical example": the mapping is heuristic
 * (power→5V, gnd→GND, SDA/SCL→A4/A5, analog→A0…, digital→D2…), which is correct
 * for the overwhelming majority of student sensors/modules but should always be
 * confirmed against the datasheet and the starter sketch's own pin #defines.
 */
export function WiringDiagram({
  pinout,
  componentName,
}: {
  pinout: PinRow[] | undefined;
  componentName: string;
}) {
  const conns = useMemo(() => buildWiring(pinout), [pinout]);
  const my = getLang() === 'my';

  if (conns.length === 0) return null;

  // Layout maths. Two boxes; one wire row per connection.
  const rowH = 34;
  const topPad = 64;
  const botPad = 28;
  const height = topPad + conns.length * rowH + botPad;
  const width = 460;
  const ardX = 30;
  const ardW = 128;
  const compX = width - 30 - ardW;
  const boxTop = 48;
  const boxH = height - boxTop - 16;

  // Vertical position of each wire endpoint.
  const yFor = (i: number) => topPad + i * rowH + rowH / 2;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1020]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${componentName} wiring to Arduino`}
        className="h-auto w-full"
      >
        {/* Title */}
        <text x={width / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700" fill="#e2e8f0">
          {my ? 'Arduino UNO နှင့် ချိတ်ဆက်ပုံ (နမူနာ)' : 'Typical Arduino UNO wiring'}
        </text>

        {/* Board box (left) */}
        <rect
          x={ardX}
          y={boxTop}
          width={ardW}
          height={boxH}
          rx={10}
          fill="#0f3d3e"
          stroke="#2dd4bf"
          strokeWidth={1.5}
        />
        <text x={ardX + ardW / 2} y={boxTop + 20} textAnchor="middle" fontSize="12" fontWeight="700" fill="#5eead4">
          Arduino UNO
        </text>

        {/* Component box (right) */}
        <rect
          x={compX}
          y={boxTop}
          width={ardW}
          height={boxH}
          rx={10}
          fill="#1e1b4b"
          stroke="#818cf8"
          strokeWidth={1.5}
        />
        <text x={compX + ardW / 2} y={boxTop + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#a5b4fc">
          <tspan>{componentName.length > 18 ? componentName.slice(0, 17) + '…' : componentName}</tspan>
        </text>

        {conns.map((c, i) => (
          <WireRow
            key={i}
            conn={c}
            y={yFor(i)}
            x1={ardX + ardW}
            x2={compX}
            ardLabelX={ardX + ardW - 6}
            compLabelX={compX + 6}
          />
        ))}
      </svg>

      {/* Legend + honesty note */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 px-3 py-2">
        {uniqueKinds(conns).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ background: kindColor(conns, k) }} />
            {my ? WIRE_KIND_LABEL[k].my : WIRE_KIND_LABEL[k].en}
          </span>
        ))}
      </div>
      <p className="border-t border-white/10 px-3 py-1.5 text-[10px] leading-relaxed text-slate-500">
        {tr(t.guideWiringAuto)}
      </p>
    </div>
  );
}

function WireRow({
  conn,
  y,
  x1,
  x2,
  ardLabelX,
  compLabelX,
}: {
  conn: WireConn;
  y: number;
  x1: number;
  x2: number;
  ardLabelX: number;
  compLabelX: number;
}) {
  const midX = (x1 + x2) / 2;
  return (
    <g>
      {/* wire: small S-curve so parallel wires read clearly */}
      <path
        d={`M ${x1} ${y} C ${midX} ${y}, ${midX} ${y}, ${x2} ${y}`}
        stroke={conn.color}
        strokeWidth={2.5}
        fill="none"
      />
      <circle cx={x1} cy={y} r={3} fill={conn.color} />
      <circle cx={x2} cy={y} r={3} fill={conn.color} />
      {/* Arduino-side pin label */}
      <text x={ardLabelX} y={y - 5} textAnchor="end" fontSize="10" fontWeight="600" fill="#cbd5e1">
        {conn.ardLabel}
      </text>
      {/* Component-side pin label */}
      <text x={compLabelX} y={y - 5} textAnchor="start" fontSize="10" fontWeight="600" fill="#cbd5e1">
        {conn.compLabel}
      </text>
    </g>
  );
}

function uniqueKinds(conns: WireConn[]) {
  return Array.from(new Set(conns.map((c) => c.kind)));
}
function kindColor(conns: WireConn[], k: WireConn['kind']) {
  return conns.find((c) => c.kind === k)?.color ?? '#94a3b8';
}
