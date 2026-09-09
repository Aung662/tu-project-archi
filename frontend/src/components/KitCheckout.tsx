'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { KitOrder, KitPaymentInfo, WebsiteKit } from '@/lib/types';
import { Alert } from './ui';
import { formatMMK } from '@/lib/format';
import { tr, t, getLang } from '@/lib/i18n';

/**
 * KPay checkout for a Website Kit.
 *
 * Flow: create (or reuse) a PENDING order → show KPay payee details → buyer
 * enters the transfer txn id → uploads the payment screenshot → waits for admin
 * approval. The zip itself is only ever downloadable after approval (server-side).
 */
export function KitCheckout({
  kit,
  payInfo,
  existingOrder,
  onClose,
  onDone,
}: {
  kit: WebsiteKit;
  payInfo: KitPaymentInfo | null;
  existingOrder: KitOrder | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const lang = getLang();
  const title = lang === 'my' && kit.titleMy ? kit.titleMy : kit.title;

  const [order, setOrder] = useState<KitOrder | null>(existingOrder);
  const [txnRef, setTxnRef] = useState(existingOrder?.txnRef ?? '');
  const [proof, setProof] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'info' | 'success' | 'error'; text: string } | null>(null);

  async function submitOrder() {
    if (txnRef.trim().length < 2) {
      setMsg({ kind: 'error', text: tr(t.kitTxnRef) });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      // Create (or reuse) the pending order, then upload proof if provided.
      const created =
        order ?? (await api.post<KitOrder>('/kits/orders', { kitId: kit.id, method: 'KPay', txnRef }));
      setOrder(created);

      if (proof) {
        const form = new FormData();
        form.append('proof', proof);
        await api.postForm(`/kits/orders/${created.id}/proof`, form);
        setMsg({ kind: 'success', text: tr(t.kitProofUploaded) });
      } else {
        setMsg({ kind: 'info', text: tr(t.kitOrderPending) });
      }
      // Give the user a moment to read the confirmation, then refresh the list.
      setTimeout(onDone, 1200);
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="card max-h-[90vh] w-full max-w-md overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-100">{tr(t.kitCheckoutTitle)}</h2>
          <button onClick={onClose} aria-label={tr(t.kitCancel)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-400">{title}</p>

        {/* KPay payee details */}
        <div className="mt-4 space-y-2 rounded-xl border border-brand-400/30 bg-brand-500/10 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{tr(t.kitPayTo)}</span>
            <span className="font-mono font-bold text-brand-100">{payInfo?.kpayNumber ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{tr(t.kitPayName)}</span>
            <span className="font-semibold text-slate-100">{payInfo?.kpayName ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <span className="text-slate-400">{tr(t.kitPayAmount)}</span>
            <span className="text-base font-bold text-emerald-300">{formatMMK(kit.priceMmk)}</span>
          </div>
        </div>

        {/* Steps */}
        <ol className="mt-4 space-y-1 text-xs text-slate-400">
          <li>{tr(t.kitStep1)}</li>
          <li>{tr(t.kitStep2)}</li>
          <li>{tr(t.kitStep3)}</li>
          <li>{tr(t.kitStep4)}</li>
        </ol>

        {order?.status === 'PENDING' && (
          <div className="mt-4">
            <Alert kind="info">{tr(t.kitOrderPending)}</Alert>
          </div>
        )}

        {/* Form */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="label">{tr(t.kitTxnRef)}</label>
            <input
              className="input"
              placeholder={tr(t.kitTxnRefPlaceholder)}
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
            />
          </div>
          <div>
            <label className="label">{tr(t.kitUploadProof)}</label>
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="input"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />
          </div>

          {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}

          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary flex-1">
              {tr(t.kitCancel)}
            </button>
            <button onClick={submitOrder} disabled={busy} className="btn-primary flex-1">
              {busy ? '…' : tr(t.kitSubmitOrder)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
