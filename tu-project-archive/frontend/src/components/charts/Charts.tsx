'use client';

/**
 * Dependency-free inline-SVG charts. Kept intentionally small so they render
 * everywhere (including the sandboxed in-app preview, which blocks external
 * scripts/CDNs). All colors use the brand/plum/mint palette.
 */

type Series = { date: string; views: number; uniques: number; searches: number; checks: number };

/** Multi-line area chart of daily activity. */
export function ActivityChart({ data }: { data: Series[] }) {
  const W = 720;
  const H = 220;
  const P = { top: 16, right: 16, bottom: 28, left: 32 };
  const iw = W - P.left - P.right;
  const ih = H - P.top - P.bottom;

  const max = Math.max(1, ...data.flatMap((d) => [d.views, d.searches, d.checks]));
  const n = Math.max(1, data.length - 1);
  const x = (i: number) => P.left + (i / n) * iw;
  const y = (v: number) => P.top + ih - (v / max) * ih;

  const line = (key: keyof Series) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d[key] as number).toFixed(1)}`).join(' ');
  const area = (key: keyof Series) =>
    `${line(key)} L ${x(data.length - 1).toFixed(1)} ${P.top + ih} L ${x(0).toFixed(1)} ${P.top + ih} Z`;

  const gridVals = [0, 0.5, 1].map((f) => Math.round(max * f));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="Daily activity chart">
        <defs>
          <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6d8bff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6d8bff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridVals.map((gv, i) => (
          <g key={i}>
            <line
              x1={P.left}
              x2={W - P.right}
              y1={y(gv)}
              y2={y(gv)}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text x={4} y={y(gv) + 4} fill="rgba(255,255,255,0.4)" fontSize={10}>
              {gv}
            </text>
          </g>
        ))}

        <path d={area('views')} fill="url(#gViews)" />
        <path d={line('views')} fill="none" stroke="#6d8bff" strokeWidth={2.5} />
        <path d={line('searches')} fill="none" stroke="#a56bff" strokeWidth={2} />
        <path d={line('checks')} fill="none" stroke="#33e6c4" strokeWidth={2} />

        {data.map((d, i) =>
          i % Math.ceil(data.length / 7) === 0 ? (
            <text key={i} x={x(i)} y={H - 8} fill="rgba(255,255,255,0.4)" fontSize={9} textAnchor="middle">
              {d.date.slice(5)}
            </text>
          ) : null,
        )}
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
        <Legend color="#6d8bff" label="Page views" />
        <Legend color="#a56bff" label="Searches" />
        <Legend color="#33e6c4" label="Title checks" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-4 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Horizontal bar chart for categorical distributions. */
export function BarList({
  data,
  format = (v) => String(v),
}: {
  data: { label: string; value: number }[];
  format?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="text-sm text-slate-500">No data yet.</p>;
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="space-y-1">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="truncate">{d.label}</span>
            <span className="font-medium text-slate-200">{format(d.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-plum-500"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
