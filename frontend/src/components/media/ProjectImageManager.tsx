'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ProjectImageSet, ProjectVideo } from '@/lib/types';
import { Alert, Spinner } from '../ui';
import { tr, t } from '@/lib/i18n';

/**
 * Admin panel to manage a project's PUBLIC images:
 * - GALLERY: standalone photos shown in the gallery + used as the tile cover.
 * - SPIN: an ORDERED set of frames photographed around the object; the detail
 *   page renders them as a draggable 360° turntable. Upload frames in sequence.
 *
 * Requires an already-saved project id (images attach to an existing project).
 */
export function ProjectImageManager({ projectId }: { projectId: string }) {
  const [set, setSet] = useState<ProjectImageSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'GALLERY' | 'SPIN' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Video state (Cloudinary-hosted).
  const [videos, setVideos] = useState<ProjectVideo[]>([]);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(false);
  const [videoBusy, setVideoBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<ProjectImageSet>(`/images/project/${projectId}`)
      .then(setSet)
      .catch(() => setSet({ gallery: [], spin: [] }))
      .finally(() => setLoading(false));
  }, [projectId]);

  const loadVideos = useCallback(() => {
    api
      .get<{ videos: ProjectVideo[] }>(`/images/project/${projectId}/videos`)
      .then((r) => setVideos(r.videos))
      .catch(() => setVideos([]));
  }, [projectId]);

  useEffect(load, [load]);
  useEffect(() => {
    api
      .get<{ enabled: boolean }>(`/images/video-config`)
      .then((r) => setVideoEnabled(r.enabled))
      .catch(() => setVideoEnabled(false));
    loadVideos();
  }, [loadVideos]);

  async function uploadVideo(files: FileList | null) {
    if (!files || files.length === 0) return;
    setVideoBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('video', files[0]);
      await api.postForm(`/images/project/${projectId}/videos`, fd);
      loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video upload failed');
    } finally {
      setVideoBusy(false);
    }
  }

  async function removeVideo(id: string) {
    setError(null);
    try {
      await api.del(`/images/videos/${id}`);
      loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function upload(kind: 'GALLERY' | 'SPIN', files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(kind);
    setError(null);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      await api.postForm(`/images/project/${projectId}?kind=${kind}`, fd);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await api.del(`/images/${id}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  if (loading) return <Spinner label="Loading images…" />;

  return (
    <div className="space-y-5 rounded-lg bg-white/5 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">Project Images</h3>
        <p className="text-xs text-slate-400">
          Public images. JPEG / PNG / WebP, up to 8 MB each.
        </p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <ImageSection
        title="📷 Gallery photos"
        hint="Standalone photos. The first one becomes the card thumbnail."
        kind="GALLERY"
        images={set?.gallery ?? []}
        busy={busy === 'GALLERY'}
        onUpload={(files) => upload('GALLERY', files)}
        onRemove={remove}
      />

      <ImageSection
        title="🔄 360° frames"
        hint="Upload frames IN ORDER (photos taken around the object). Needs 2+ for a spin."
        kind="SPIN"
        images={set?.spin ?? []}
        busy={busy === 'SPIN'}
        onUpload={(files) => upload('SPIN', files)}
        onRemove={remove}
      />

      <VideoSection
        enabled={videoEnabled}
        videos={videos}
        busy={videoBusy}
        onUpload={uploadVideo}
        onRemove={removeVideo}
      />
    </div>
  );
}

function VideoSection({
  enabled,
  videos,
  busy,
  onUpload,
  onRemove,
}: {
  enabled: boolean;
  videos: ProjectVideo[];
  busy: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-2 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-200">🎬 {tr(t.videoUploadLabel)}</p>
          <p className="text-xs text-slate-400">{tr(t.videoHint)}</p>
        </div>
        {enabled ? (
          <label className="btn-secondary cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs">
            {busy ? tr(t.videoUploading) : '+ Add'}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                onUpload(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        ) : null}
      </div>

      {!enabled ? (
        <p className="rounded-lg border border-dashed border-white/15 px-3 py-4 text-center text-xs text-amber-300/80">
          {tr(t.videoDisabled)}
        </p>
      ) : videos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/15 px-3 py-4 text-center text-xs text-slate-500">
          No videos yet
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {videos.map((v) => (
            <div key={v.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.thumbnailUrl ?? undefined}
                alt={v.title || 'video'}
                className="h-16 w-28 rounded-lg border border-white/10 bg-black object-cover"
              />
              <span className="absolute inset-0 grid place-items-center text-lg text-white/90">
                ▶
              </span>
              <button
                type="button"
                onClick={() => onRemove(v.id)}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Delete video"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageSection({
  title,
  hint,
  kind,
  images,
  busy,
  onUpload,
  onRemove,
}: {
  title: string;
  hint: string;
  kind: 'GALLERY' | 'SPIN';
  images: { id: string; url: string }[];
  busy: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-200">{title}</p>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
        <label className="btn-secondary cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs">
          {busy ? 'Uploading…' : '+ Add'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              onUpload(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/15 px-3 py-4 text-center text-xs text-slate-500">
          No {kind === 'SPIN' ? '360° frames' : 'photos'} yet
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={img.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-16 w-16 rounded-lg border border-white/10 object-cover"
              />
              {kind === 'SPIN' && (
                <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 text-[10px] text-white">
                  {i + 1}
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Delete image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
