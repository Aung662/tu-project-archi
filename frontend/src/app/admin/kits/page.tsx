'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { WebsiteKit } from '@/lib/types';
import { Spinner, Alert } from '@/components/ui';
import { formatMMK } from '@/lib/format';
import { tr, t } from '@/lib/i18n';

interface AdminKitOrder {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  amountMmk: number;
  method: string;
  txnRef: string;
  hasProof: boolean;
  createdAt: string;
  kit: { id: string; slug: string; title: string };
  user: { id: string; name: string; email: string };
}

export default function AdminKits() {
  const [kits, setKits] = useState<WebsiteKit[]>([]);
  const [orders, setOrders] = useState<AdminKitOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, o] = await Promise.all([
        api.get<WebsiteKit[]>('/kits/admin/all'),
        api.get<AdminKitOrder[]>('/kits/admin/orders'),
      ]);
      setKits(k);
      setOrders(o);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function togglePublish(kit: WebsiteKit) {
    await api.put(`/kits/admin/${kit.id}`, { published: !kit.published }).catch((e) => setMsg(String(e)));
    await load();
  }

  async function setPrice(kit: WebsiteKit) {
    const input = window.prompt('Price (MMK)', String(kit.priceMmk));
    if (input == null) return;
    const priceMmk = Number(input);
    if (!Number.isFinite(priceMmk) || priceMmk < 0) return;
    await api.put(`/kits/admin/${kit.id}`, { priceMmk }).catch((e) => setMsg(String(e)));
    await load();
  }

  async function uploadZip(kit: WebsiteKit, file: File) {
    const form = new FormData();
    form.append('file', file);
    setMsg(null);
    try {
      await api.postForm(`/kits/admin/${kit.id}/file`, form);
      setMsg(`Uploaded ${file.name} for ${kit.title}`);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Upload failed');
    }
  }

  async function review(id: string, action: 'approve' | 'reject') {
    await api.post(`/kits/admin/orders/${id}/${action}`, {}).catch((e) => setMsg(String(e)));
    await load();
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {msg && <Alert kind="info">{msg}</Alert>}

      {/* Kits catalog */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100">{tr(t.kaTitle)}</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Kit</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Zip</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Downloads</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {kits.map((kit) => (
                <tr key={kit.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{kit.title}</div>
                    <div className="text-xs text-slate-500">{kit.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setPrice(kit)} className="underline decoration-dotted hover:text-white">
                      {formatMMK(kit.priceMmk)}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {kit.hasFile ? (
                      <span className="text-emerald-300">✓ {kit.fileName}</span>
                    ) : (
                      <span className="text-amber-300">— none</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(kit)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        kit.published ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {kit.published ? 'Published' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{kit.downloadCount}</td>
                  <td className="px-4 py-3">
                    <label className="cursor-pointer rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/20">
                      {tr(t.kaUploadZip)}
                      <input
                        type="file"
                        accept=".zip,application/zip"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadZip(kit, f);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Orders review */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100">{tr(t.kaOrders)}</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Kit</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Txn</th>
                <th className="px-4 py-3">Proof</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{o.user.name}</div>
                    <div className="text-xs text-slate-500">{o.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{o.kit.title}</td>
                  <td className="px-4 py-3 text-slate-300">{formatMMK(o.amountMmk)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{o.txnRef}</td>
                  <td className="px-4 py-3">
                    {o.hasProof ? (
                      <a
                        href={`/api/kits/admin/orders/${o.id}/proof`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-200 underline"
                      >
                        {tr(t.kaViewProof)}
                      </a>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        o.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : o.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-200'
                            : 'bg-amber-500/20 text-amber-200'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => review(o.id, 'approve')}
                          className="rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30"
                        >
                          {tr(t.kaApprove)}
                        </button>
                        <button
                          onClick={() => review(o.id, 'reject')}
                          className="rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
                        >
                          {tr(t.kaReject)}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
