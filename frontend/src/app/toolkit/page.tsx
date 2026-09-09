'use client';

import { useEffect, useMemo, useState } from 'react';
import { COMPONENTS, CATEGORIES, type CategoryKey } from '@/data/components';
import { ComponentCard } from '@/components/ComponentCard';
import { ComponentDetail } from '@/components/ComponentDetail';
import { ComponentCompare } from '@/components/ComponentCompare';
import { getComponentFavorites, COMPONENT_FAVORITES_EVENT } from '@/lib/componentFavorites';
import { EmptyState } from '@/components/ui';
import { Reveal } from '@/components/motion';
import { tr, t, getLang } from '@/lib/i18n';

/**
 * "Components Toolkit" — a browsable, searchable library of the hardware and
 * software building blocks modern student projects use. Every item shows a
 * brand-neutral icon that can be downloaded as SVG or PNG. Purely client-side
 * (static catalogue), so it's instant and works offline.
 */
export default function ToolkitPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'' | CategoryKey>('');
  const [favOnly, setFavOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Track the favourites set (localStorage) so the ★ filter and count stay live.
  useEffect(() => {
    const sync = () => setFavorites(getComponentFavorites());
    sync();
    window.addEventListener(COMPONENT_FAVORITES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COMPONENT_FAVORITES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const q = query.trim().toLowerCase();
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const filtered = useMemo(() => {
    return COMPONENTS.filter((c) => {
      if (favOnly && !favSet.has(c.id)) return false;
      if (cat && c.category !== cat) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.blurb} ${(c.tags ?? []).join(' ')} ${c.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [q, cat, favOnly, favSet]);

  const catById = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.key, c])), []);
  const hardwareCats = CATEGORIES.filter((c) => c.group === 'hardware');
  const softwareCats = CATEGORIES.filter((c) => c.group === 'software');

  const hardwareItems = filtered.filter((c) => catById[c.category].group === 'hardware');
  const softwareItems = filtered.filter((c) => catById[c.category].group === 'software');

  // Detail modal state. We keep the SELECTED ID and derive its position from the
  // ordered list actually shown on screen (hardware first, then software) so the
  // ‹ / › arrows page through exactly what the user sees, respecting filters.
  const ordered = useMemo(() => [...hardwareItems, ...softwareItems], [hardwareItems, softwareItems]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selIndex = selectedId ? ordered.findIndex((c) => c.id === selectedId) : -1;
  const selected = selIndex >= 0 ? ordered[selIndex] : null;

  const catLabel = (c: (typeof CATEGORIES)[number]) => (getLang() === 'my' ? c.labelMy : c.labelEn);

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">{tr(t.toolkitTitle)}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">{tr(t.toolkitSubtitle)}</p>
      </Reveal>

      {/* Search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔎</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr(t.toolkitSearch)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400/50 focus:bg-white/[0.05]"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <Chip active={cat === '' && !favOnly} onClick={() => { setCat(''); setFavOnly(false); }}>
          ✨ {tr(t.toolkitAll)}{' '}
          <span className="font-latin text-xs opacity-70">{COMPONENTS.length}</span>
        </Chip>
        {favorites.length > 0 && (
          <Chip active={favOnly} onClick={() => setFavOnly((v) => !v)}>
            ★ {tr(t.favOnly)}{' '}
            <span className="font-latin text-xs opacity-70">{favorites.length}</span>
          </Chip>
        )}
        {CATEGORIES.map((c) => {
          const n = COMPONENTS.filter((x) => x.category === c.key).length;
          return (
            <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
              <span className={c.color}>●</span> {catLabel(c)}{' '}
              <span className="font-latin text-xs opacity-70">{n}</span>
            </Chip>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState title={favOnly ? tr(t.favEmpty) : tr(t.toolkitEmpty)} />
      )}

      {/* Hardware section */}
      {hardwareItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
            <span aria-hidden>🔌</span> {tr(t.toolkitHardware)}
            <span className="font-latin text-sm font-normal text-slate-500">
              {hardwareItems.length} {tr(t.toolkitCount)}
            </span>
          </h2>
          <Grid>
            {hardwareItems.map((item) => (
              <ComponentCard key={item.id} item={item} category={catById[item.category]} onOpen={() => setSelectedId(item.id)} />
            ))}
          </Grid>
        </section>
      )}

      {/* Software section */}
      {softwareItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
            <span aria-hidden>💻</span> {tr(t.toolkitSoftware)}
            <span className="font-latin text-sm font-normal text-slate-500">
              {softwareItems.length} {tr(t.toolkitCount)}
            </span>
          </h2>
          <Grid>
            {softwareItems.map((item) => (
              <ComponentCard key={item.id} item={item} category={catById[item.category]} onOpen={() => setSelectedId(item.id)} />
            ))}
          </Grid>
        </section>
      )}

      {selected && (
        <ComponentDetail
          item={selected}
          category={catById[selected.category]}
          onClose={() => setSelectedId(null)}
          onPrev={() => selIndex > 0 && setSelectedId(ordered[selIndex - 1].id)}
          onNext={() => selIndex < ordered.length - 1 && setSelectedId(ordered[selIndex + 1].id)}
          hasPrev={selIndex > 0}
          hasNext={selIndex < ordered.length - 1}
          position={{ index: selIndex, total: ordered.length }}
        />
      )}

      {/* Floating compare tray + side-by-side spec modal. */}
      <ComponentCompare onOpenComponent={(id) => setSelectedId(id)} />
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {children}
    </div>
  );
}

function Chip({
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
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-transparent bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-glow'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
