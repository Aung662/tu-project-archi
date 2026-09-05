'use client';

import { useState } from 'react';
import { Gallery } from './Gallery';
import { SpinViewer } from './SpinViewer';

/**
 * Media panel for a project detail page. Shows a Gallery and/or a 360° spin
 * viewer, whichever the project has, with a tab switch when it has both.
 */
export function ProjectMedia({
  gallery = [],
  spin = [],
  title,
}: {
  gallery?: string[];
  spin?: string[];
  title: string;
}) {
  const hasGallery = gallery.length > 0;
  const hasSpin = spin.length >= 2; // need multiple frames for a real spin
  const [tab, setTab] = useState<'gallery' | 'spin'>(hasGallery ? 'gallery' : 'spin');

  if (!hasGallery && !hasSpin) return null;

  return (
    <section className="card p-4">
      {hasGallery && hasSpin && (
        <div className="mb-3 flex gap-1 rounded-full bg-white/5 p-1">
          <TabBtn active={tab === 'gallery'} onClick={() => setTab('gallery')}>
            📷 Photos
          </TabBtn>
          <TabBtn active={tab === 'spin'} onClick={() => setTab('spin')}>
            🔄 360° View
          </TabBtn>
        </div>
      )}

      {tab === 'gallery' && hasGallery ? (
        <Gallery images={gallery} alt={title} />
      ) : hasSpin ? (
        <SpinViewer frames={spin} alt={title} />
      ) : (
        <Gallery images={gallery} alt={title} />
      )}
    </section>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-300 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
