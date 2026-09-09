'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { KitOrder, KitPaymentInfo, WebsiteKit } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Alert, Spinner, EmptyState } from '@/components/ui';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/motion';
import { formatMMK } from '@/lib/format';
import { tr, t, getLang } from '@/lib/i18n';
import { KitCheckout } from '@/components/KitCheckout';
import { downloadKit } from '@/lib/kitDownload';

export default function KitsPage() {
  const { user } = useAuth();
  const [kits, setKits] = useState<WebsiteKit[]>([]);
  const [payInfo, setPayInfo] = useState<KitPaymentInfo | null>(null);
  const [orders, setOrders] = useState<KitOrder[]>([]);
  const [ownedKitIds, setOwnedKitIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<WebsiteKit | null>(null);

  const lang = getLang();

  const loadOwnership = useCallback(async (list: WebsiteKit[]) => {
    if (!user) {
      setOwnedKitIds(new Set());
      setOrders([]);
      return;
    }
    // My kit orders (to show pending state) + resolve which kits I already own.
    const myOrders = await api.get<KitOrder[]>('/kits/orders/mine').catch(() => []);
    setOrders(myOrders);
    const owned = new Set<string>();
    await Promise.all(
      list.map(async (k) => {
        const res = await api.get<{ hasAccess: boolean }>(`/kits/${k.id}/access`).catch(() => ({ hasAccess: false }));
        if (res.hasAccess) owned.add(k.id);
      }),
    );
    setOwnedKitIds(owned);
  }, [user]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, info] = await Promise.all([
        api.get<WebsiteKit[]>('/kits'),
        api.get<KitPaymentInfo>('/kits/payment-info').catch(() => null),
      ]);
      setKits(list);
      setPayInfo(info);
      await loadOwnership(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load kits');
    } finally {
      setLoading(false);
    }
  }, [loadOwnership]);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingKitIds = new Set(
    orders.filter((o) => o.status === 'PENDING').map((o) => o.kitId),
  );

  async function handleDownload(kit: WebsiteKit) {
    try {
      await downloadKit(kit.id, kit.fileName || `${kit.slug}.zip`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  }

  if (loading) return <Spinner label={tr(t.kitsTitle)} />;

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-2xl font-bold text-gradient-animated sm:text-3xl">{tr(t.kitsTitle)}</h1>
        <p className="text-sm text-slate-400">{tr(t.kitsSubtitle)}</p>
      </Reveal>

      {error && <Alert kind="error">{error}</Alert>}

      {kits.length === 0 ? (
        <EmptyState title={tr(t.kitsTitle)} hint={tr(t.kitsSubtitle)} />
      ) : (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kits.map((kit) => {
            const owned = ownedKitIds.has(kit.id) || user?.role === 'ADMIN';
            const pending = pendingKitIds.has(kit.id);
            const title = lang === 'my' && kit.titleMy ? kit.titleMy : kit.title;
            const summary = lang === 'my' && kit.summaryMy ? kit.summaryMy : kit.summary;
            return (
              <StaggerItem key={kit.id}>
                <div className="card glow-ring flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span aria-hidden className="text-3xl">🌐</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm font-bold text-brand-100">
                      {kit.priceMmk > 0 ? formatMMK(kit.priceMmk) : tr(t.kitFree)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100">{title}</h2>
                  <p className="text-sm text-slate-400">{summary}</p>

                  <ul className="mt-1 space-y-1 text-xs text-slate-400">
                    <li>✅ {tr(t.kitIncludesGuide)}</li>
                    <li>✅ {tr(t.kitIncludesPrompts)}</li>
                    <li>✅ {tr(t.kitIncludesStack)}</li>
                    <li>✅ {tr(t.kitIncludesChecklist)}</li>
                  </ul>

                  <div className="mt-auto pt-2">
                    {owned ? (
                      <button onClick={() => handleDownload(kit)} className="btn-primary w-full">
                        ⬇️ {tr(t.kitDownload)}
                      </button>
                    ) : pending ? (
                      <div className="space-y-2">
                        <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                          {tr(t.kitOrderPending)}
                        </div>
                        <button onClick={() => setCheckout(kit)} className="btn-secondary w-full">
                          {tr(t.kitUploadProof)}
                        </button>
                      </div>
                    ) : user ? (
                      <button onClick={() => setCheckout(kit)} className="btn-primary w-full">
                        🛒 {tr(t.kitBuyNow)}
                      </button>
                    ) : (
                      <Link href="/login" className="btn-primary block w-full text-center">
                        {tr(t.kitLoginToBuy)}
                      </Link>
                    )}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      )}

      {checkout && (
        <KitCheckout
          kit={checkout}
          payInfo={payInfo}
          existingOrder={orders.find((o) => o.kitId === checkout.id && o.status !== 'REJECTED') ?? null}
          onClose={() => setCheckout(null)}
          onDone={async () => {
            setCheckout(null);
            await load();
          }}
        />
      )}
    </div>
  );
}
