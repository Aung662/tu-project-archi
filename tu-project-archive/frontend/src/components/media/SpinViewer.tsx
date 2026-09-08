'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 360° turntable viewer.
 *
 * Given an ordered set of frame URLs (photographed around the object), it maps
 * horizontal drag distance to a frame index, creating the illusion of spinning
 * the object. Works with mouse, touch, and — for accessibility — arrow keys.
 * All frames are preloaded so the spin is smooth once ready.
 */
export function SpinViewer({ frames, alt }: { frames: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startIndex = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = frames.length;

  // Preload every frame so dragging never stutters.
  useEffect(() => {
    let cancelled = false;
    setLoaded(0);
    frames.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (!cancelled) setLoaded((n) => n + 1);
      };
      img.src = src;
    });
    return () => {
      cancelled = true;
    };
  }, [frames]);

  const wrap = useCallback((i: number) => ((i % total) + total) % total, [total]);

  const onPointerDown = (clientX: number) => {
    setDragging(true);
    startX.current = clientX;
    startIndex.current = index;
  };

  const onPointerMove = useCallback(
    (clientX: number) => {
      if (!dragging) return;
      const width = containerRef.current?.clientWidth ?? 300;
      // One full drag across the width == one full rotation.
      const delta = ((clientX - startX.current) / width) * total;
      setIndex(wrap(Math.round(startIndex.current - delta)));
    },
    [dragging, total, wrap],
  );

  const onPointerUp = () => setDragging(false);

  // Global listeners while dragging so the spin continues off-element.
  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => onPointerMove(e.clientX);
    const touch = (e: TouchEvent) => onPointerMove(e.touches[0].clientX);
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', touch, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', touch);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, onPointerMove]);

  const ready = loaded >= total;
  const pct = Math.round((loaded / Math.max(1, total)) * 100);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        role="img"
        aria-label={`${alt} — 360 degree view, frame ${index + 1} of ${total}`}
        tabIndex={0}
        onMouseDown={(e) => {
          e.preventDefault();
          onPointerDown(e.clientX);
        }}
        onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setIndex((i) => wrap(i - 1));
          if (e.key === 'ArrowRight') setIndex((i) => wrap(i + 1));
        }}
        className={`relative aspect-square w-full select-none overflow-hidden rounded-2xl border border-white/10 bg-ink-800/60 ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Render every frame stacked; show only the active one. Keeps them warm
            in the DOM so switching is instant. */}
        {frames.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-75"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}

        {/* 360° affordance badge */}
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          360°
        </div>

        {!ready && (
          <div className="absolute inset-0 grid place-items-center bg-ink-900/70 text-sm text-slate-300">
            Loading frames… {pct}%
          </div>
        )}

        {ready && !dragging && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="animate-pulse rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
              ↔ Drag to rotate
            </span>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {frames.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-4 bg-brand-400' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
