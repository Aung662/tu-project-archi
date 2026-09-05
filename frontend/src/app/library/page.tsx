'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Purchase, PaymentOrder } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Alert, Spinner, EmptyState, StatusBadge } from '@/components/ui';
import { formatDate, formatMMK } from '@/lib/format';
import { downloadProjectFile } from '@/lib/download';
import { t } from '@/lib/i18n';

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dlError, setDlError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?next=/library');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<Purchase[]>('/payments/purchases/mine'),
      api.get<PaymentOrder[]>('/payments/orders/mine'),
    ])
      .then(([p, o]) => {
        setPurchases(p);
        setOrders(o);
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function download(projectId: string, title: string) {
    const result = await downloadProjectFile(projectId, title);
    if (result.ok) {
      setDlError(null);
      return;
    }
    setDlError(result.reason === 'forbidden' ? t.dlNoLonger.my : t.dlFailedRetry.my);
  }

  if (authLoading || loading) return <Spinner label={t.loadingLibrary.my} />;
  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.libraryTitle.my}</h1>
        <p className="text-sm text-slate-500">{t.librarySubtitle.my}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">{t.purchasedProjects.my}</h2>
        {dlError && <Alert kind="error">{dlError}</Alert>}
        {purchases.length === 0 ? (
          <EmptyState title={t.noPurchasesTitle.my} hint={t.noPurchasesHint.my} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {purchases.map((p) => (
              <div key={p.id} className="card flex items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/projects/${p.project.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                    {p.project.title}
                  </Link>
                  <p className="text-xs text-slate-500">{p.project.year}</p>
                </div>
                {p.project.hasFile && (
                  <button onClick={() => download(p.project.id, p.project.title)} className="btn-primary">
                    {t.download.my}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">{t.paymentHistory.my}</h2>
        {orders.length === 0 ? (
          <Alert kind="info">{t.noOrders.my}</Alert>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t.colProject.my}</th>
                  <th className="px-4 py-3">{t.colAmount.my}</th>
                  <th className="px-4 py-3">{t.colMethod.my}</th>
                  <th className="px-4 py-3">{t.colDate.my}</th>
                  <th className="px-4 py-3">{t.colStatus.my}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3">{o.project.title}</td>
                    <td className="px-4 py-3">{formatMMK(o.amountMmk)}</td>
                    <td className="px-4 py-3">{o.method}</td>
                    <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
