'use client';

import { useEffect, useMemo, useState } from 'react';
import { COMPONENTS, CATEGORIES } from '@/data/components';
import { specsFor } from '@/data/componentSpecs';
import { guideFor, type Difficulty } from '@/data/componentGuide';
import { photoFor } from '@/data/componentPhotos';
import { ComponentIcon } from './ComponentIcon';
import {
  getComponentCompare,
  removeComponentCompare,
  clearComponentCompare,
  COMPONENT_COMPARE_EVENT,
  MAX_COMPONENT_COMPARE,
} from '@/lib/componentCompare';
import { tr, t, getLang } from '@/lib/i18n';

/**
 * Component comparison — a floating tray (bottom of the toolkit) that shows the
 * current selection and opens a side-by-side spec table for up to 3 components.
 * The table unions every spec label across the chosen parts so rows line up even
 * when parts expose different fields. All client-side / localStorage.
 */
export function ComponentCompare({ onOpenComponent }: { onOpenComponent?: (id: string) => void }) {
  const [ids, setIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setIds(getComponentCompare());
    sync();
    window.addEventListener(COMPONENT_COMPARE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COMPONENT_COMPARE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const items = useMemo(
    () => ids.map((id) => COMPONENTS.find((c) => c.id === id)).filter(Boolean) as typeof COMPONENTS,
    [ids],
  );

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating tray */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-ink-800/90 px-3 py-2 shadow-glow backdrop-blur">
          <span className="px-1 text-sm font-semibold text-slate-200">
            ⇄ {tr(t.cmpTitle)}{' '}
            <span className="font-latin text-brand-300">
              {items.length}/{MAX_COMPONENT_COMPARE}
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {items.map((it) => (
              <span
                key={it.id}
                className="inline-flex max-w-[9rem] items-center gap-1 rounded-full bg-white/[0.06] py-1 pl-2.5 pr-1 text-xs text-slate-200"
              >
                <span className="truncate">{it.name}</span>
                <button
                  onClick={() => removeComponentCompare(it.id)}
                  aria-label="remove"
                  className="grid h-4 w-4 place-items-center rounded-full bg-white/10 text-[10px] hover:bg-white/20"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={() => setOpen(true)}
            disabled={items.length < 2}
            className="ml-1 rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
          >
            {tr(t.cmpOpen)}
          </button>
          <button
            onClick={() => clearComponentCompare()}
            className="rounded-lg px-2 py-1.5 text-xs text-slate-400 transition hover:text-rose-300"
          >
            {tr(t.cmpClear)}
          </button>
        </div>
      </div>

      {open && <CompareModal items={items} onClose={() => setOpen(false)} onOpenComponent={onOpenComponent} />}
    </>
  );
}

function CompareModal({
  items,
  onClose,
  onOpenComponent,
}: {
  items: typeof COMPONENTS;
  onClose: () => void;
  onOpenComponent?: (id: string) => void;
}) {
  const my = getLang() === 'my';
  const catById = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.key, c])), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const diffLabel: Record<Difficulty, string> = {
    beginner: tr(t.guideDiffBeginner),
    intermediate: tr(t.guideDiffIntermediate),
    advanced: tr(t.guideDiffAdvanced),
  };

  // Union of spec labels, preserving first-seen order.
  const specMaps = items.map((it) => {
    const m = new Map<string, string>();
    for (const row of specsFor(it.id)) m.set(row.label, row.value);
    return m;
  });
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const m of specMaps)
    for (const k of m.keys())
      if (!seen.has(k)) {
        seen.add(k);
        labels.push(k);
      }

  const guides = items.map((it) => guideFor(it.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tr(t.cmpTitle)}
    >
      <div
        className="card relative my-0 max-h-[100dvh] w-full max-w-4xl overflow-y-auto rounded-none p-0 sm:my-auto sm:max-h-[92vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-ink-900/85 px-4 py-2.5 backdrop-blur-md">
          <h2 className="text-sm font-bold text-slate-100">⇄ {tr(t.cmpTitle)}</h2>
          <button
            onClick={onClose}
            aria-label={tr(t.toolkitClose)}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-base text-white transition hover:bg-white/15"
          >
            ✕
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="w-32 p-2" />
                {items.map((it) => {
                  const cat = catById[it.category];
                  const photo = photoFor(it.id);
                  return (
                    <th key={it.id} className="p-2 align-top">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/10">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo} alt={it.name} className="h-full w-full rounded-xl bg-white object-contain" />
                          ) : (
                            <ComponentIcon glyph={it.glyph} title={it.name} className="h-9 w-9" />
                          )}
                        </div>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenComponent?.(it.id);
                          }}
                          className="text-sm font-semibold text-slate-100 hover:text-brand-300"
                        >
                          {it.name}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <CompareRow label={tr(t.toolkitCategory)} values={items.map((it) => (my ? catById[it.category].labelMy : catById[it.category].labelEn))} />
              <CompareRow
                label={tr(t.guideDifficulty)}
                values={guides.map((g) => (g?.difficulty ? diffLabel[g.difficulty] : '—'))}
              />
              <CompareRow label={tr(t.guidePrice)} values={guides.map((g) => g?.price ?? '—')} />
              <CompareRow label={tr(t.guideWhatFor)} values={guides.map((g) => (g?.whatFor ? tr(g.whatFor) : '—'))} />
              {labels.map((label, i) => (
                <CompareRow
                  key={label}
                  label={label}
                  zebra={i % 2 === 0}
                  values={specMaps.map((m) => m.get(label) ?? '—')}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, values, zebra }: { label: string; values: string[]; zebra?: boolean }) {
  return (
    <tr className={zebra ? 'bg-white/[0.02]' : ''}>
      <th scope="row" className="border-b border-white/5 p-2 align-top text-xs font-medium text-slate-400">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="border-b border-white/5 p-2 align-top text-slate-100">
          {v}
        </td>
      ))}
    </tr>
  );
}
