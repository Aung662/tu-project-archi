import type { SVGProps } from 'react';

export type IconName =
  | 'search'
  | 'browse'
  | 'titles'
  | 'check'
  | 'circuit'
  | 'toolkit'
  | 'globe'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'close'
  | 'sparkles'
  | 'trending'
  | 'chart'
  | 'file'
  | 'clock';

type Props = Omit<SVGProps<SVGSVGElement>, 'name'> & { name: IconName };

/** Small inline outline icons keep navigation and key actions consistent across platforms. */
export function Icon({ name, ...props }: Props) {
  let drawing;
  switch (name) {
    case 'search':
      drawing = <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>;
      break;
    case 'browse':
      drawing = <><rect x="3.5" y="3.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.2" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.2" /></>;
      break;
    case 'titles':
      drawing = <><circle cx="5" cy="6" r=".7" /><circle cx="5" cy="12" r=".7" /><circle cx="5" cy="18" r=".7" /><path d="M9 6h11M9 12h11M9 18h11" /></>;
      break;
    case 'check':
      drawing = <path d="m4.5 12.5 5 5L20 7" />;
      break;
    case 'circuit':
      drawing = <><rect x="3.5" y="3.5" width="5" height="5" rx="1" /><rect x="15.5" y="15.5" width="5" height="5" rx="1" /><circle cx="18" cy="6" r="2" /><path d="M8.5 6h4a3 3 0 0 1 3 3v6.5M6 8.5v4a3 3 0 0 0 3 3h6.5" /></>;
      break;
    case 'toolkit':
      drawing = <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18M10 12v2h4v-2" /></>;
      break;
    case 'globe':
      drawing = <><circle cx="12" cy="12" r="9" /><path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9s1.2-6.5 3.6-9ZM3.5 9h17M3.5 15h17" /></>;
      break;
    case 'sun':
      drawing = <><circle cx="12" cy="12" r="3.8" /><path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2.5 12h2m15 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>;
      break;
    case 'moon':
      drawing = <path d="M20.3 15.1A8.5 8.5 0 0 1 8.9 3.7 8.7 8.7 0 1 0 20.3 15.1Z" />;
      break;
    case 'menu':
      drawing = <path d="M4 6.5h16M4 12h16M4 17.5h16" />;
      break;
    case 'close':
      drawing = <path d="m6 6 12 12M18 6 6 18" />;
      break;
    case 'sparkles':
      drawing = <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 15l.7 1.8L7.5 17.5l-1.8.7L5 20l-.7-1.8-1.8-.7 1.8-.7L5 15Z" /></>;
      break;
    case 'trending':
      drawing = <><path d="M3.5 20.5h17M5 17v-4M10 17V9M15 17v-6M20 17V5" /><path d="m4 10 5-4 4 2 6-5M15.5 3H19v3.5" /></>;
      break;
    case 'chart':
      drawing = <><path d="M4 20V11h4v9M10 20V5h4v15M16 20v-8h4v8M2.5 20.5h19" /></>;
      break;
    case 'file':
      drawing = <><path d="M7 3.5h7l5 5v12H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" /><path d="M14 3.5v5h5M9 13h6M9 16.5h6" /></>;
      break;
    case 'clock':
      drawing = <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>;
      break;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {drawing}
    </svg>
  );
}
