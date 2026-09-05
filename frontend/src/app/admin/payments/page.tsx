'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PaymentOrder } from '@/lib/types';
import { Spinner, EmptyState, StatusBadge, Alert } from '@/components/ui';
import { formatDate, formatMMK } from '@/lib/format';
import { t, statusLabel } from '@/lib/i18n';

export default function AdminPayments() {
  const [status, setStatus] = useState('PENDING');
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  // Order currently being rejected (drives the reject modal). null = closed.
  const [rejecting, setRejecting] = useState<PaymentOrder | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await api.get<PaymentOrder[]>(`/admin/payments${api.qs({ status })}`));
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : t.pActionFailed.my });
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-dismiss the status banner so it doesn't linger across actions.
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(id);
  }, [msg]);

  async function approve(order: PaymentOrder) {
    if (!confirm(t.pConfirmApprove.my)) return;
    setBusyId(order.id);
    try {
      await api.post(`/admin/payments/${order.id}/approve`, {});
      setMsg({ kind: 'success', text: t.pApproved.my });
      await load();
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : t.pActionFailed.my });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmReject() {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await api.post(`/admin/payments/${rejecting.id}/reject`, {
        note: rejectNote.trim() || undefined,
      });
      setMsg({ kind: 'success', text: t.pRejected.my });
      setRejecting(null);
      setRejectNote('');
      await load();
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : t.pActionFailed.my });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {['PENDING', 'APPROVED', 'REJECTED', ''].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatus(s)}
            className={`badge cursor-pointer px-3 py-1 ${
              status === s ? 'bg-brand-600 text-white' : 'bg-white/10 text-slate-300'
            }`}
          >
            {s ? statusLabel[s].my : t.pAll.my}
          </button>
        ))}
      </div>

      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState title={t.pNoOrders.my} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">{t.pColUser.my}</th>
                <th className="px-4 py-3">{t.colProject.my}</th>
                <th className="px-4 py-3">{t.colAmount.my}</th>
                <th className="px-4 py-3">{t.pColMethodRef.my}</th>
                <th className="px-4 py-3">{t.pColProof.my}</th>
                <th className="px-4 py-3">{t.colDate.my}</th>
                <th className="px-4 py-3">{t.colStatus.my}</th>
                <th className="px-4 py-3">{t.aColActions.my}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{o.user?.name}</div>
                    <div className="text-xs text-slate-400">{o.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">{o.project.title}</td>
                  <td className="px-4 py-3">{formatMMK(o.amountMmk)}</td>
                  <td className="px-4 py-3">
                    <div>{o.method}</div>
                    <div className="text-xs text-slate-400">{o.txnRef}</div>
                  </td>
                  <td className="px-4 py-3">
                    {o.hasProof ? (
                      // Opens the admin-only proof stream via the same-origin proxy
                      // (cookie auth rides along); inline image/PDF preview.
                      <a
                        href={`/api/admin/payments/${o.id}/proof`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-300 underline-offset-2 hover:underline"
                      >
                        {t.pViewProof.my}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">{t.pNoProof.my}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    {o.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approve(o)}
                          disabled={busyId === o.id}
                          className="btn-primary px-3 py-1 text-xs"
                        >
                          {t.pApprove.my}
                        </button>
                        <button
                          onClick={() => {
                            setRejectNote('');
                            setRejecting(o);
                          }}
                          disabled={busyId === o.id}
                          className="btn-danger px-3 py-1 text-xs"
                        >
                          {t.pReject.my}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject modal — replaces the old native prompt() with a styled, localized dialog. */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md space-y-3 p-5">
            <h2 className="text-lg font-semibold text-slate-100">{t.pRejectTitle.my}</h2>
            <p className="text-sm text-slate-400">
              {rejecting.user?.name} · {rejecting.project.title}
            </p>
            <textarea
              className="input min-h-[90px]"
              placeholder={t.pRejectPlaceholder.my}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => setRejecting(null)}
                disabled={busyId === rejecting.id}
              >
                {t.pCancel.my}
              </button>
              <button
                className="btn-danger"
                onClick={confirmReject}
                disabled={busyId === rejecting.id}
              >
                {t.pReject.my}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
