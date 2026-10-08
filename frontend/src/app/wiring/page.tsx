'use client';

import { useEffect, useMemo, useState } from 'react';
import { COMPONENTS, CATEGORIES, type CategoryKey } from '@/data/components';
import { guideFor, type PinRow } from '@/data/componentGuide';
import type { GlyphKey } from '@/data/glyphs';
import { buildWiring, isWireable } from '@/lib/wiring';
import { downloadWiringSvg } from '@/lib/wiringSvg';
import { WiringDiagram } from '@/components/WiringDiagram';
import { FritzingDiagram } from '@/components/FritzingDiagram';
import { VerifiedWiringDiagram } from '@/components/VerifiedWiringDiagram';
import { verifiedWiringFor } from '@/lib/verifiedWiring';
import { downloadFritzingSvg } from '@/lib/fritzing';
import { ComponentDetail } from '@/components/ComponentDetail';
import { WiringImageLibrary } from '@/components/WiringImageLibrary';
import { WIRE_KIND_LABEL } from '@/lib/wiring';
import { BOARD_ORDER, getBoardProfile } from '@/lib/boardProfiles';
import { EmptyState } from '@/components/ui';
import { Reveal } from '@/components/motion';
import { tr, t, getLang, type Lang } from '@/lib/i18n';
import {
  loadWiringManifest,
  wiringPhotoUrl,
  wiringPhotoCount,
  type WiringManifest,
} from '@/lib/wiringPhotos';

/**
 * Concise Wiring hub with two user paths: generated/verified connection guides
 * and a database-backed, searchable reference-image library. The library never
 * labels user-uploaded images as pin-verified; guide recipes keep their own
 * source/safety checks and illustrative fallbacks.
 *
 * Boards are intentionally excluded from the component guide cards: a board
 * IS the controller, so an "Arduino ↔ board" wiring diagram is meaningless.
 */

// Precompute the wireable set once (module scope) — the catalogue is static.
interface WireItem {
  id: string;
  name: string;
  blurb: string;
  category: CategoryKey;
  glyph: GlyphKey;
  pinout: PinRow[] | undefined;
  connCount: number;
}

const WIRE_ITEMS: WireItem[] = COMPONENTS.filter(
  (c) => c.category !== 'boards' && isWireable(c.id),
)
  .map((c) => {
    const g = guideFor(c.id);
    const conns = buildWiring(g?.pinout);
    return conns.length > 0
      ? {
          id: c.id,
          name: c.name,
          blurb: c.blurb,
          category: c.category,
          glyph: c.glyph,
          pinout: g?.pinout,
          connCount: conns.length,
        }
      : null;
  })
  .filter((x): x is WireItem => x !== null);

export default function WiringPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'' | CategoryKey>('');
  const [view, setView] = useState<'photo' | 'realistic' | 'diagram' | 'list'>('realistic');
  const [lang, setLangState] = useState<Lang>('en');
  const [boardId, setBoardId] = useState<string>('arduino-uno');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manifest, setManifest] = useState<WiringManifest | null>(null);
  const [section, setSection] = useState<'guides' | 'images'>('guides');

  const board = getBoardProfile(boardId);
  const photoCount = wiringPhotoCount(manifest, boardId);

  // Boards to show in the picker. Once reviewed image assets are approved, show
  // only boards that have one; with an empty verified manifest, keep all boards
  // available and use the illustrative/verified SVG fallback.
  const boardsWithPhotos = useMemo(
    () => BOARD_ORDER.filter((id) => wiringPhotoCount(manifest, id) > 0),
    [manifest],
  );
  const boardsToShow = boardsWithPhotos.length > 0 ? boardsWithPhotos : BOARD_ORDER;
  const photoMode = boardsWithPhotos.length > 0;

  useEffect(() => {
    setLangState(getLang());
    loadWiringManifest().then(setManifest);
  }, []);

  // Keep the selected board valid when the reviewed-image set is non-empty.
  useEffect(() => {
    if (photoMode && !boardsWithPhotos.includes(boardId)) {
      setBoardId(boardsWithPhotos[0]);
    }
  }, [photoMode, boardsWithPhotos, boardId]);

  // When the selected board has reviewed image assets, default to their view.
  useEffect(() => {
    if (wiringPhotoCount(manifest, boardId) > 0) setView('photo');
  }, [manifest, boardId]);

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

      <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1" role="tablist" aria-label={tr(t.wiringTitle)}>
        <button
          type="button"
          role="tab"
          aria-selected={section === 'guides'}
          onClick={() => setSection('guides')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${section === 'guides' ? 'bg-brand-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
        >
          {tr(t.wiringGuidesTab)}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === 'images'}
          onClick={() => setSection('images')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${section === 'images' ? 'bg-brand-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
        >
          {tr(t.wiringImagesTab)}
        </button>
      </div>

      {section === 'images' ? <WiringImageLibrary lang={lang} /> : (
        <>
      <p className="rounded-xl border border-amber-400/25 bg-amber-400/[0.05] px-4 py-3 text-xs leading-relaxed text-amber-100/85">
        <span className="mr-1.5" aria-hidden="true">⚠</span>
        {lang === 'my'
          ? 'အစိမ်းရောင် ✓ ပါသောပုံများသာ ရင်းမြစ်နှင့် pin နေရာ တိုက်စစ်ထားသည်။ အခြားပုံများသည် pinout အချက်အလက်မှ ထုတ်ထားသော နမူနာဖြစ်၍ ဘုတ်/မော်ဂျူး၏ အတိအကျ model နှင့် voltage ကို datasheet ဖြင့် အရင်စစ်ပါ။'
          : 'Only diagrams marked with a green ✓ have a source-checked pin map. Other views are illustrative pinout examples; verify the exact board/module model and voltage against its datasheet before wiring.'}
      </p>

      {/* Board selector — choose a supported board; verified recipes are
          displayed only for exact board/component combinations. */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-200">
            🧠 {tr(t.wiringPickBoard)}
          </span>
          <span className="rounded-full border border-brand-400/30 bg-brand-400/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-200">
            {board.name} · {board.logic} logic
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {boardsToShow.map((id) => {
            const b = getBoardProfile(id);
            const n = wiringPhotoCount(manifest, id);
            return (
              <button
                key={id}
                onClick={() => setBoardId(id)}
                aria-pressed={boardId === id}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  boardId === id
                    ? 'border-transparent bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-glow'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {b.name}
                <span className="font-latin text-[10px] opacity-60">{b.logic}</span>
                {photoMode && n > 0 && (
                  <span className="rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-semibold text-emerald-300">
                    📷{n}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {photoMode && (
          <p className="mt-2.5 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[11px] leading-relaxed text-emerald-200/80">
            📷 {lang === 'my'
              ? 'ရင်းမြစ်နှင့် ချိတ်ဆက်မှုကို စစ်ဆေးပြီးသော ပုံရှိသည့် board များကိုသာ ဖော်ပြထားသည်။'
              : 'Showing only boards with reviewed wiring images.'}
          </p>
        )}
        {board.note && (
          <p className="mt-2.5 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[11px] leading-relaxed text-amber-200/80">
            ⚡ {lang === 'my' ? board.note.my : board.note.en}
          </p>
        )}
      </div>

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
            {photoCount > 0 && (
              <button
                onClick={() => setView('photo')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${view === 'photo' ? 'bg-brand-500 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                📷 {lang === 'my' ? 'စစ်ဆေးပြီးသောပုံ' : 'Reviewed image'}{' '}
                <span className="font-latin opacity-70">{photoCount}</span>
              </button>
            )}
            <button
              onClick={() => setView('realistic')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${view === 'realistic' ? 'bg-brand-500 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              🔧 {tr(t.wiringViewRealistic)}
            </button>
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
          <div className={`grid grid-cols-1 gap-4 ${view === 'realistic' ? 'xl:grid-cols-2' : 'lg:grid-cols-2'}`}>
            {items.map((w) => (
              <WiringCard
                key={w.id}
                item={w}
                view={view}
                lang={lang}
                boardId={boardId}
                photoUrl={wiringPhotoUrl(manifest, boardId, w.id)}
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
        </>
      )}
    </div>
  );
}

function WiringCard({
  item,
  view,
  lang,
  boardId,
  photoUrl,
  onOpen,
}: {
  item: WireItem;
  view: 'photo' | 'realistic' | 'diagram' | 'list';
  lang: Lang;
  boardId: string;
  photoUrl: string | null;
  onOpen: () => void;
}) {
  const conns = useMemo(() => buildWiring(item.pinout, boardId), [item.pinout, boardId]);
  const my = lang === 'my';
  const verifiedRecipe = verifiedWiringFor(boardId, item.id);
  // If the reviewed-image view is requested but this pair has no approved image,
  // fall back to a source-checked recipe or a clearly labelled pinout illustration.
  const effView = view === 'photo' && !photoUrl ? 'realistic' : view;

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
        {effView === 'photo' && photoUrl ? (
          <a
            href={photoUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative block overflow-hidden rounded-xl border border-white/10 bg-white"
            title={my ? 'အပြည့်ကြည့်ရန် နှိပ်ပါ' : 'Click to view full size'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={`${getBoardProfile(boardId).name} ↔ ${item.name} wiring`}
              loading="lazy"
              className="h-auto w-full object-contain"
            />
            <span className="absolute right-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
              {my ? 'စစ်ဆေးထားသောပုံ' : 'Reviewed image'}
            </span>
          </a>
        ) : effView === 'realistic' ? (
          verifiedRecipe ? (
            <VerifiedWiringDiagram recipe={verifiedRecipe} lang={lang} />
          ) : (
            <>
              <p className="mb-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] leading-relaxed text-slate-400">
                {my
                  ? 'နမူနာပုံ — ဒီ board/module အတွဲအတွက် အတည်ပြုထားသော pin-map မရှိသေးပါ။ အောက်ပါ connection list ကို datasheet နှင့် တိုက်စစ်ပါ။'
                  : 'Illustrative example — this exact board/module pair has no reviewed pin map yet. Check the connection list against the datasheet.'}
              </p>
              <FritzingDiagram
                componentName={item.name}
                glyph={item.glyph}
                category={item.category}
                pinout={item.pinout}
                boardId={boardId}
                lang={lang}
              />
            </>
          )
        ) : effView === 'diagram' ? (
          <WiringDiagram pinout={item.pinout} componentName={item.name} lang={lang} boardId={boardId} />
        ) : (
          <ConnTable conns={conns} lang={lang} boardName={getBoardProfile(boardId).name} />
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2">
        {effView === 'realistic' && verifiedRecipe ? (
          <a
            href={`/wiring/verified/${verifiedRecipe.diagramFile}`}
            download={verifiedRecipe.diagramFile}
            className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[11px] text-emerald-100 transition hover:bg-emerald-400/10"
          >
            ⬇ {my ? 'အတည်ပြုပုံ SVG ဒေါင်းရန်' : 'Download verified SVG'}
          </a>
        ) : effView === 'photo' && photoUrl ? (
          <a
            href={photoUrl}
            download={`${boardId}__${item.id}.jpg`}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ⬇ {my ? 'စစ်ဆေးထားသော ပုံကို ဒေါင်းရန်' : 'Download reviewed image'}
          </a>
        ) : (
          <button
            onClick={() =>
              effView === 'realistic'
                ? downloadFritzingSvg(item.id, {
                    componentName: item.name,
                    glyph: item.glyph,
                    category: item.category,
                    pinout: item.pinout,
                    boardId,
                    lang,
                  })
                : downloadWiringSvg(item.id, item.name, item.pinout, lang, boardId)
            }
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ⬇ {tr(t.wiringDownloadSvg)}
          </button>
        )}
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

function ConnTable({
  conns,
  lang,
  boardName,
}: {
  conns: ReturnType<typeof buildWiring>;
  lang: Lang;
  boardName: string;
}) {
  const my = lang === 'my';
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-white/[0.03] text-slate-400">
            <th className="px-3 py-2 font-medium">{boardName}</th>
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
