import type { ProjectCard as Card } from '@/lib/types';

/**
 * Deterministic, attractive placeholder thumbnail for projects that have no
 * uploaded cover image. Every project therefore always shows a proper tile —
 * a themed gradient + a department/topic icon + the title initials — instead of
 * a bare document glyph. Pure inline SVG/CSS so it renders in the sandboxed
 * preview and needs zero network requests.
 */

// Distinct gradient palettes; chosen deterministically from the project id.
const PALETTES: [string, string][] = [
  ['#6366f1', '#8b5cf6'], // indigo → violet
  ['#0ea5e9', '#6366f1'], // sky → indigo
  ['#10b981', '#0ea5e9'], // emerald → sky
  ['#f59e0b', '#ef4444'], // amber → red
  ['#ec4899', '#8b5cf6'], // pink → violet
  ['#14b8a6', '#22c55e'], // teal → green
  ['#f43f5e', '#f59e0b'], // rose → amber
  ['#3b82f6', '#22d3ee'], // blue → cyan
];

// Emoji icon by department code (falls back to a generic one).
const DEPT_ICON: Record<string, string> = {
  IT: '💻',
  EC: '📡',
  EP: '⚡',
  CE: '🏗️',
  ME: '⚙️',
  MC: '🤖',
  ARCH: '📐',
  CH: '⚗️',
  MN: '⛏️',
  PE: '🛢️',
  BT: '🧬',
  TC: '📶',
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function initials(title: string): string {
  const words = title.replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'TU';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function ProjectThumb({ p }: { p: Card }) {
  const seed = hashString(p.id || p.title);
  const [c1, c2] = PALETTES[seed % PALETTES.length];
  const icon = DEPT_ICON[p.department?.code ?? ''] ?? '🎓';
  const gid = `g-${(p.id || p.title).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`;

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 320 180"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label={p.title}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <rect width="320" height="180" fill={`url(#${gid})`} />
        {/* soft decorative circles */}
        <circle cx="270" cy="30" r="70" fill="#ffffff" opacity="0.08" />
        <circle cx="40" cy="160" r="55" fill="#ffffff" opacity="0.07" />
        {/* faint grid */}
        <g stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1">
          <line x1="0" y1="45" x2="320" y2="45" />
          <line x1="0" y1="90" x2="320" y2="90" />
          <line x1="0" y1="135" x2="320" y2="135" />
        </g>
        {/* big title initials */}
        <text
          x="24"
          y="120"
          fontFamily="Plus Jakarta Sans, Arial, sans-serif"
          fontSize="72"
          fontWeight="800"
          fill="#ffffff"
          fillOpacity="0.92"
        >
          {initials(p.title)}
        </text>
      </svg>
      {/* department/topic icon badge */}
      <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-black/25 text-xl backdrop-blur">
        {icon}
      </span>
    </div>
  );
}
