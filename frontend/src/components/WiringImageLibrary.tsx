'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Spinner } from '@/components/ui';
import { api } from '@/lib/api';
import { BOARD_ORDER, getBoardProfile } from '@/lib/boardProfiles';
import type { Lang } from '@/lib/i18n';

interface WiringImageItem {
  id: string;
  title: 'Wiring';
  boardId: string;
  tags: string[];
  url: string;
  createdAt: string;
  referenceOnly: true;
}

interface WiringImagePage {
  items: WiringImageItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

const PAGE_SIZE = 24;

function boardLabel(id: string, lang: Lang): string {
  if (id === 'other') return lang === 'my' ? 'အခြား / ရောနှော' : 'Other / mixed';
  return BOARD_ORDER.includes(id) ? getBoardProfile(id).name : id;
}

/** Searchable, paginated gallery for approved wiring reference images. */
export function WiringImageLibrary({ lang }: { lang: Lang }) {
  const my = lang === 'my';
  const [query, setQuery] = useState('');
  const [boardId, setBoardId] = useState('');
  const [items, setItems] = useState<WiringImageItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filterKey = `${boardId}\u0000${query.trim()}`;
  const filterKeyRef = useRef(filterKey);
  filterKeyRef.current = filterKey;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    const timer = window.setTimeout(() => {
      const suffix = api.qs({ q: query.trim(), boardId, page: 1, pageSize: PAGE_SIZE });
      api
        .get<WiringImagePage>(`/images/wiring${suffix}`)
        .then((result) => {
          if (!active) return;
          setItems(result.items);
          setPage(1);
          setHasMore(result.hasMore);
          setTotal(result.total);
        })
        .catch((err) => {
          if (active) setError(err instanceof Error ? err.message : 'Could not load wiring images');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, boardId]);

  async function loadMore() {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    const requestedKey = filterKeyRef.current;
    const nextPage = page + 1;
    const suffix = api.qs({ q: query.trim(), boardId, page: nextPage, pageSize: PAGE_SIZE });
    try {
      const result = await api.get<WiringImagePage>(`/images/wiring${suffix}`);
      if (filterKeyRef.current !== requestedKey) return;
      setItems((current) => [...current, ...result.items]);
      setPage(nextPage);
      setHasMore(result.hasMore);
      setTotal(result.total);
    } catch (err) {
      if (filterKeyRef.current === requestedKey) {
        setError(err instanceof Error ? err.message : 'Could not load more wiring images');
      }
    } finally {
      if (filterKeyRef.current === requestedKey) setLoadingMore(false);
    }
  }

  return (
    <section className="space-y-4" aria-labelledby="wiring-library-title">
      <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.05] px-4 py-3 text-xs leading-relaxed text-amber-100/85">
        <span className="mr-1.5" aria-hidden="true">⚠</span>
        {my
          ? 'ဤပုံများသည် ကိုးကားရန်သာဖြစ်ပြီး pinout အတည်ပြုထားသော လမ်းညွှန်မဟုတ်ပါ။ မချိတ်ဆက်မီ ဘုတ်/မော်ဂျူး model အတိအကျနှင့် datasheet ကို စစ်ပါ။'
          : 'Reference images only — these are not verified pinout instructions. Check the exact board/module model and its datasheet before wiring.'}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">{my ? 'ပုံ ရှာရန်' : 'Search images'}</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔎</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={my ? 'ဘုတ်၊ module သို့မဟုတ် keyword ဖြင့် ရှာရန်…' : 'Search board, module or keyword…'}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400/50 focus:bg-white/[0.05]"
          />
        </label>
        <label className="sm:w-64">
          <span className="sr-only">{my ? 'ဘုတ်အလိုက် စစ်ထုတ်ရန်' : 'Filter by board'}</span>
          <select
            value={boardId}
            onChange={(event) => setBoardId(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-3 text-sm text-slate-200 outline-none focus:border-brand-400/50"
          >
            <option value="">{my ? 'ဘုတ်အားလုံး' : 'All boards'}</option>
            {BOARD_ORDER.map((id) => (
              <option key={id} value={id}>{getBoardProfile(id).name}</option>
            ))}
            <option value="other">{my ? 'အခြား / ရောနှော' : 'Other / mixed'}</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <h2 id="wiring-library-title" className="text-sm font-semibold text-slate-200">
          {my ? 'Wiring ပုံများ' : 'Wiring images'}
        </h2>
        {!loading && <span>{total.toLocaleString()} {my ? 'ပုံ' : total === 1 ? 'image' : 'images'}</span>}
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {loading ? (
        <Spinner label={my ? 'ပုံများ ဖွင့်နေသည်…' : 'Loading images…'} />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-300">{my ? 'ကိုက်ညီသော Wiring ပုံ မတွေ့ပါ' : 'No matching wiring images'}</p>
          <p className="mt-1 text-xs text-slate-500">
            {my ? 'စကားလုံးတစ်မျိုးဖြင့် ရှာပါ၊ သို့မဟုတ် စစ်ထုတ်မှုကို ပြောင်းပါ။' : 'Try another search term or clear the board filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => {
              const label = boardLabel(item.boardId, lang);
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-brand-400/40 hover:bg-white/[0.06]"
                  aria-label={`${my ? 'Wiring ကိုးကားပုံ' : 'Wiring reference image'} · ${label}${item.tags.length ? ` · ${item.tags.join(', ')}` : ''}`}
                >
                  <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={`${my ? 'Wiring ကိုးကားပုံ' : 'Wiring reference'} — ${label}`}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="space-y-1.5 p-2.5">
                    <p className="truncate text-xs font-semibold text-slate-100">{my ? 'Wiring' : item.title}</p>
                    <p className="truncate text-[11px] text-slate-400">{label}</p>
                    {item.tags.length > 0 && (
                      <div className="flex max-h-12 flex-wrap gap-1 overflow-hidden">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-secondary min-w-36 px-4 py-2 text-sm disabled:opacity-50"
              >
                {loadingMore ? (my ? 'ဖွင့်နေသည်…' : 'Loading…') : (my ? 'နောက်ထပ်ပုံများ' : 'Load more')}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
