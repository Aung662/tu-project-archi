'use client';

import { useState } from 'react';
import { Gallery } from './Gallery';
import { SpinViewer } from './SpinViewer';
import type { ProjectVideo } from '@/lib/types';
import { tr, t } from '@/lib/i18n';

type Tab = 'gallery' | 'spin' | 'video';

/**
 * Media panel for a project detail page. Shows a Gallery, a 360° spin viewer,
 * and/or short demo videos — whichever the project has — with a tab switch when
 * it has more than one.
 */
export function ProjectMedia({
  gallery = [],
  spin = [],
  videos = [],
  title,
}: {
  gallery?: string[];
  spin?: string[];
  videos?: ProjectVideo[];
  title: string;
}) {
  const hasGallery = gallery.length > 0;
  const hasSpin = spin.length >= 2; // need multiple frames for a real spin
  const hasVideo = videos.length > 0;

  const firstTab: Tab = hasGallery ? 'gallery' : hasSpin ? 'spin' : 'video';
  const [tab, setTab] = useState<Tab>(firstTab);

  if (!hasGallery && !hasSpin && !hasVideo) return null;

  const tabCount = [hasGallery, hasSpin, hasVideo].filter(Boolean).length;

  return (
    <section className="card p-4">
      {tabCount > 1 && (
        <div className="mb-3 flex gap-1 rounded-full bg-white/5 p-1">
          {hasGallery && (
            <TabBtn active={tab === 'gallery'} onClick={() => setTab('gallery')}>
              📷 {tr(t.mediaPhotos)}
            </TabBtn>
          )}
          {hasSpin && (
            <TabBtn active={tab === 'spin'} onClick={() => setTab('spin')}>
              🔄 {tr(t.media360)}
            </TabBtn>
          )}
          {hasVideo && (
            <TabBtn active={tab === 'video'} onClick={() => setTab('video')}>
              🎬 {tr(t.mediaVideo)}
            </TabBtn>
          )}
        </div>
      )}

      {tab === 'gallery' && hasGallery ? (
        <Gallery images={gallery} alt={title} />
      ) : tab === 'spin' && hasSpin ? (
        <SpinViewer frames={spin} alt={title} />
      ) : tab === 'video' && hasVideo ? (
        <VideoList videos={videos} />
      ) : hasGallery ? (
        <Gallery images={gallery} alt={title} />
      ) : hasSpin ? (
        <SpinViewer frames={spin} alt={title} />
      ) : (
        <VideoList videos={videos} />
      )}
    </section>
  );
}

function VideoList({ videos }: { videos: ProjectVideo[] }) {
  return (
    <div className="space-y-4">
      {videos.map((v) => (
        <figure key={v.id} className="overflow-hidden rounded-xl bg-black/40">
          <video
            controls
            preload="metadata"
            poster={v.thumbnailUrl ?? undefined}
            className="aspect-video w-full bg-black"
          >
            <source src={v.url} />
            Your browser does not support the video tag.
          </video>
          {v.title ? (
            <figcaption className="px-3 py-2 text-sm text-slate-300">{v.title}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
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
