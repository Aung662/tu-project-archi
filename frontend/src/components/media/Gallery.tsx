'use client';

import { useEffect, useState } from 'react';

/**
 * Image gallery with a zoomable lightbox.
 *
 * - Thumbnail strip with a large active preview.
 * - Click the preview (or a thumb) to open a fullscreen lightbox.
 * - In the lightbox: click/scroll toggles zoom, arrows / keys navigate, Esc closes.
 */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Large preview */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800/60"
        aria-label="Open image in fullscreen"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${alt} — image ${active + 1}`}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          🔍 Click to zoom
        </span>
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                i === active ? 'border-brand-400' : 'border-white/10 hover:border-white/30'
              }`}
              aria-label={`Show image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <Lightbox
          images={images}
          index={active}
          alt={alt}
          onIndex={setActive}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  alt,
  onIndex,
  onClose,
}: {
  images: string[];
  index: number;
  alt: string;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(false);
  const wrap = (i: number) => ((i % images.length) + images.length) % images.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndex(wrap(index - 1));
      if (e.key === 'ArrowRight') onIndex(wrap(index + 1));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onIndex(wrap(index - 1));
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onIndex(wrap(index + 1));
            }}
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt={`${alt} — image ${index + 1}`}
        onClick={(e) => {
          e.stopPropagation();
          setZoom((z) => !z);
        }}
        className={`max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-300 ${
          zoom ? 'scale-[1.8] cursor-zoom-out' : 'cursor-zoom-in'
        }`}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
