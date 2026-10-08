'use client';

import { useId } from 'react';
import type { ProjectCard as Card } from '@/lib/types';

/**
 * Deterministic thumbnail for projects without an uploaded cover image. Deep,
 * high-contrast gradients keep title initials legible; an academic department
 * code replaces platform-dependent emoji. Everything is inline SVG/CSS so it
 * renders without network requests in the sandboxed preview.
 */

// Distinct, restrained jewel palettes. The checker samples each gradient with
// the decorative white overlays and verifies the white title initials at 4.5:1.
const PALETTES: [string, string][] = [
  ['#1e3a8a', '#4338ca'], // blue → indigo
  ['#0c4a6e', '#075985'], // deep cyan → blue
  ['#064e3b', '#065f46'], // emerald → green
  ['#713f12', '#78350f'], // warm amber → umber
  ['#831843', '#9d174d'], // plum → rose
  ['#134e4a', '#115e59'], // teal → deep teal
  ['#7f1d1d', '#991b1b'], // oxblood → red
  ['#4c1d95', '#5b21b6'], // violet → purple
];

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
  const deptCode = p.department?.code?.trim().replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 5) || 'TU';
  // A project can appear in multiple homepage sections; useId prevents SVG
  // gradient-fragment collisions between repeated copies of the same card.
  const gid = `project-thumb-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

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
        {/* restrained surface details sit behind, not on top of, the title */}
        <circle cx="270" cy="30" r="70" fill="#ffffff" opacity="0.08" />
        <circle cx="40" cy="160" r="55" fill="#ffffff" opacity="0.07" />
        <g stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1">
          <line x1="0" y1="45" x2="320" y2="45" />
          <line x1="0" y1="90" x2="320" y2="90" />
          <line x1="0" y1="135" x2="320" y2="135" />
        </g>
        <text
          x="24"
          y="120"
          fontFamily="Plus Jakarta Sans, Arial, sans-serif"
          fontSize="72"
          fontWeight="800"
          fill="#ffffff"
        >
          {initials(p.title)}
        </text>
      </svg>
      <span
        aria-hidden="true"
        className="absolute right-3 top-3 inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl bg-black/55 px-2 text-[10px] font-bold tracking-[0.12em] text-white shadow-sm backdrop-blur-sm"
      >
        {deptCode}
      </span>
    </div>
  );
}
