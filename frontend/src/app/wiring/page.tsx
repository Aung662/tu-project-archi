'use client';

import { useEffect, useMemo, useState } from 'react';
import { COMPONENTS, CATEGORIES, type CategoryKey } from '@/data/components';
import { guideFor, type PinRow } from '@/data/componentGuide';
import { buildWiring } from '@/lib/wiring';
import { downloadWiringSvg } from '@/lib/wiringSvg';
import { WiringDiagram } from '@/components/WiringDiagram';
import { ComponentDetail } from '@/components/ComponentDetail';
import { WIRE_KIND_LABEL } from '@/lib/wiring';
import { EmptyState } from '@/components/ui';
import { Reveal } from '@/components/motion';
import { tr, t, getLang, type Lang } from '@/lib/i18n';

/**
 * "Wiring & Pin Connections" hub — every Arduino ↔ component connection in ONE
 * place. For each hardware component that has pinout data we auto-derive a
 * typical Arduino-UNO wiring plan (see lib/wiring.ts) and render BOTH a diagram
 * and a pin-to-pin connection table. Searchable + category-grouped, with a
 * per-card SVG download and a jump into the full component detail modal.
 *
 * Boards are intentionally excluded here: a board IS the Arduino, so an
 * "Arduino ↔ board" wiring diagram is meaningless. Everything else with pinout
 * data (sensors, displays/LCD, actuators, comms, power, io, …) appears.
 */

// Precompute the wireable set once (module scope) — the catalogue is static.
interface WireItem {
  id: string;
  name: string;
  blurb: string;
  category: CategoryKey;
  pinout: PinRow[] | undefined;
  connCount: number;
}

const WIRE_ITEMS: WireItem[] = COMPONENTS.filter((c) => c.category !== 'boards')
  .map((c) => {
    const g = guideFor(c.id);
    const conns = buildWiring(g?.pinout);
    return conns.length > 0
      ? {
          id: c.id,
          name: c.name,
          blurb: c.blurb,
          category: c.category,
          pinout: g?.pinout,
          connCount: conns.length,
        }
      : null;
  })
  .filter((x): x is WireItem => x !== null);

export default function WiringPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'' | CategoryKey>('');
  const [view, setView] = useState<'diagram' | 'list'>('diagram');
  const [lang, setLangState] = useState<Lang>('en');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLangState(getLang());
  }, []);

  const q = query.trim().toLowerCase();

  // Categories that actually have wiring items (skip empty chips like boards).
  const activeCats = useMemo(() => {
    const present = new Set(WIRE_ITEMS.map((w) => w.category));
    return CATEGORIES.filter((c) => present.has(c.key));
  }, []);

  const filtered = useMemo(() => {
    return WIRE_ITEMS.filter((w) => {
      if (cat && w.category !== cat) return false;
      if (!q) return true;
      return `${w.name} ${w.blurb} ${w.category}`.toLowerCase().includes(q);
    });
  }, [q, cat]);

  const catById = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.key, c])), []);
  const catLabel = (c: (typeof CATEGORIES)[number]) => (lang === 'my' ? c.labelMy : c.labelEn);

  // Group filtered items by category, preserving CATEGORIES order.
  const groups = useMemo(() => {
    return activeCats
      .map((c) => ({ cat: c, items: filtered.filter((w) => w.category === c.key) }))
      .filter((g) => g.items.length > 0);
  }, [filtered, activeCats]);

  const selected = selectedId ? COMPONENTS.find((c) => c.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">🔌 {tr(t.wiringTitle)}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">{tr(t.wiringSubtitle)}</p>
      </Reveal>

      {/* Controls: search + view toggle + language */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔎</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr(t.wiringSearch)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400/50 focus:bg-white/[0.05]"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            <button
              onClick={() => setView('diagram')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${view === 'diagram' ? 'bg-brand-500 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              🖼️ {tr(t.wiringViewDiagram)}
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${view === 'list' ? 'bg-brand-500 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              📋 {tr(t.wiringViewList)}
            </button>
          </div>
          <button
            onClick={() => setLangState((l) => (l === 'my' ? 'en' : 'my'))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            title="Switch language"
          >
            🌐 {lang === 'my' ? 'ENG' : 'မြန်မာ'}
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <Chip active={cat === ''} onClick={() => setCat('')}>
          ✨ {lang === 'my' ? 'အားလုံး' : 'All'}{' '}
          <span className="font-latin text-xs opacity-70">{WIRE_ITEMS.length}</span>
        </Chip>
        {activeCats.map((c) => {
          const n = WIRE_ITEMS.filter((w) => w.category === c.key).length;
          return (
            <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
              <span className={c.color}>●</span> {catLabel(c)}{' '}
              <span className="font-latin text-xs opacity-70">{n}</span>
            </Chip>
          );
        })}
      </div>

      {filtered.length === 0 && <EmptyState title={tr(t.wiringEmpty)} />}

      {groups.map(({ cat: c, items }) => (
        <section key={c.key} className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
            <span className={c.color} aria-hidden>●</span> {catLabel(c)}
            <span className="font-latin text-sm font-normal text-slate-500">
              {items.length} {tr(t.wiringCount)}
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {items.map((w) => (
              <WiringCard
                key={w.id}
                item={w}
                view={view}
                lang={lang}
                onOpen={() => setSelectedId(w.id)}
              />
            ))}
          </div>
        </section>
      ))}

      <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs leading-relaxed text-amber-200/80">
        {tr(t.wiringNote)}
      </p>

      {selected && (
        <ComponentDetail
          item={selected}
          category={catById[selected.category]}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function WiringCard({
  item,
  view,
  lang,
  onOpen,
}: {
  item: WireItem;
  view: 'diagram' | 'list';
  lang: Lang;
  onOpen: () => void;
}) {
  const conns = useMemo(() => buildWiring(item.pinout), [item.pinout]);
  const my = lang === 'my';

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-start justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="font-semibold text-slate-100">{item.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{item.blurb}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-400">
          {conns.length} {my ? 'ကြိုး' : 'wires'}
        </span>
      </div>

      <div className="flex-1 p-3">
        {view === 'diagram' ? (
          <WiringDiagram pinout={item.pinout} componentName={item.name} lang={lang} />
        ) : (
          <ConnTable conns={conns} lang={lang} />
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2">
        <button
          onClick={() => downloadWiringSvg(item.id, item.name, item.pinout, lang)}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          ⬇ {tr(t.wiringDownloadSvg)}
        </button>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          🔍 {tr(t.wiringOpenDetail)}
        </button>
      </div>
    </div>
  );
}

function ConnTable({ conns, lang }: { conns: ReturnType<typeof buildWiring>; lang: Lang }) {
  const my = lang === 'my';
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-white/[0.03] text-slate-400">
            <th className="px-3 py-2 font-medium">{tr(t.wiringColArduino)}</th>
            <th className="px-3 py-2 font-medium">{tr(t.wiringColComp)}</th>
            <th className="px-3 py-2 font-medium">{tr(t.wiringColType)}</th>
          </tr>
        </thead>
        <tbody>
          {conns.map((c, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-slate-200">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.ardLabel}
                </span>
              </td>
              <td className="px-3 py-2 font-mono text-slate-200">{c.compLabel}</td>
              <td className="px-3 py-2 text-slate-400">
                {my ? WIRE_KIND_LABEL[c.kind].my : WIRE_KIND_LABEL[c.kind].en}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
