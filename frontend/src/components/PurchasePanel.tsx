'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PaymentOrder } from '@/lib/types';
import { Alert } from './ui';
import { formatMMK } from '@/lib/format';
import { tr, t } from '@/lib/i18n';

/**
 * Manual MMK purchase flow:
 * 1. Read payment instructions.
 * 2. Create an order (method + txn ref).
 * 3. Upload proof screenshot.
 * 4. Wait for admin approval → access is granted.
 */
export function PurchasePanel({ projectId, amountMmk }: { projectId: string; amountMmk: number }) {
  const [instructions, setInstructions] = useState('');
  const [method, setMethod] = useState('KBZPay');
  const [txnRef, setTxnRef] = useState('');
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [msg, setMsg] = useState<{ kind: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ instructions: string }>('/payments/instructions')
      .then((d) => setInstructions(d.instructions))
      .catch(() => {});
    // Load any existing pending order for this project.
    api
      .get<PaymentOrder[]>('/payments/orders/mine')
      .then((list) => {
        const existing = list.find((o) => o.project.id === projectId && o.status !== 'REJECTED');
        if (existing) setOrder(existing);
      })
      .catch(() => {});
  }, [projectId]);

  async function createOrder() {
    if (!txnRef.trim()) {
      setMsg({ kind: 'error', text: tr(t.txnRefRequired) });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const o = await api.post<PaymentOrder>('/payments/orders', { projectId, method, txnRef });
      setOrder(o);
      setMsg({ kind: 'success', text: tr(t.orderCreated) });
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : tr(t.orderFailed) });
    } finally {
      setBusy(false);
    }
  }

  async function uploadProof() {
    if (!order || !proof) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append('proof', proof);
      await api.postForm(`/payments/orders/${order.id}/proof`, fd);
      setMsg({ kind: 'success', text: tr(t.proofUploaded) });
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : tr(t.uploadFailed) });
    } finally {
      setBusy(false);
    }
  }

  if (order?.status === 'PENDING') {
    return (
      <div className="space-y-3">
        <Alert kind="warning">{tr(t.pendingVerify)}</Alert>
        {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
        <div className="space-y-2">
          <label className="label">{tr(t.uploadProofLabel)}</label>
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            className="input"
          />
          <button onClick={uploadProof} disabled={!proof || busy} className="btn-primary w-full">
            {busy ? tr(t.uploading) : tr(t.uploadProofBtn)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {instructions && (
        <Alert kind="info">
          <span className="font-semibold">{tr(t.howToPay)} ({formatMMK(amountMmk)}):</span>
          <p className="mt-1">{instructions}</p>
        </Alert>
      )}
      <div>
        <label className="label">{tr(t.paymentMethod)}</label>
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
          {/* value = the exact enum the API accepts; label = human-friendly */}
          <option value="KBZPay">KBZPay</option>
          <option value="WavePay">WavePay</option>
          <option value="AYAPay">AYA Pay</option>
          <option value="CBPay">CB Pay</option>
          <option value="BankTransfer">Bank transfer</option>
        </select>
      </div>
      <div>
        <label className="label">{tr(t.txnRef)}</label>
        <input
          className="input"
          value={txnRef}
          onChange={(e) => setTxnRef(e.target.value)}
          placeholder={tr(t.txnRefPlaceholder)}
        />
      </div>
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
      <button onClick={createOrder} disabled={busy} className="btn-primary w-full">
        {busy ? tr(t.submitting) : tr(t.submitOrder)}
      </button>
    </div>
  );
}
