'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Purchase, PaymentOrder, Bookmark } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { ProjectCard } from '@/components/ProjectCard';
import { Alert, Spinner, EmptyState, StatusBadge } from '@/components/ui';
import { formatDate, formatMMK } from '@/lib/format';
import { downloadProjectFile } from '@/lib/download';
import { t } from '@/lib/i18n';

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
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
      api.get<Bookmark[]>('/bookmarks'),
    ])
      .then(([p, o, b]) => {
        setPurchases(p);
        setOrders(o);
        setBookmarks(b);
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function download(projectId: string, title: string) {
    const result = await downloadProjectFile(projectId, title);
    if (result.ok) {
      setDlError(null);
      return;
    }
    setDlError(result.reason === 'forbidden' ? t.dlNoLonger.en : t.dlFailedRetry.en);
  }

  if (authLoading || loading) return <Spinner label={t.loadingLibrary.en} />;
  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{t.libraryTitle.en}</h1>
        <p className="text-sm text-slate-400">{t.librarySubtitle.en}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">{t.purchasedProjects.en}</h2>
        {dlError && <Alert kind="error">{dlError}</Alert>}
        {purchases.length === 0 ? (
          <EmptyState title={t.noPurchasesTitle.en} hint={t.noPurchasesHint.en} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {purchases.map((p) => (
              <div key={p.id} className="card flex items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/projects/${p.project.id}`} className="font-medium text-slate-100 hover:text-brand-300">
                    {p.project.title}
                  </Link>
                  <p className="text-xs text-slate-400">{p.project.year}</p>
                </div>
                {p.project.hasFile && (
                  <button onClick={() => download(p.project.id, p.project.title)} className="btn-primary">
                    {t.download.en}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Saved projects</h2>
        {bookmarks.length === 0 ? (
          <EmptyState
            title="No saved projects yet"
            hint="Tap the ♥ on any project to save it here for later."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((b) => (
              <ProjectCard
                key={b.id}
                p={{
                  id: b.project.id,
                  title: b.project.title,
                  year: b.project.year,
                  level: b.project.level,
                  abstract: '',
                  keywords: [],
                  authorsText: '',
                  supervisorName: null,
                  priceMmk: b.project.priceMmk,
                  status: 'PUBLISHED',
                  hasFile: b.project.hasFile,
                  university: b.project.university,
                  department: b.project.department,
                  createdAt: b.createdAt,
                  coverImageUrl: b.project.coverImageUrl,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">{t.paymentHistory.en}</h2>
        {orders.length === 0 ? (
          <Alert kind="info">{t.noOrders.en}</Alert>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">{t.colProject.en}</th>
                  <th className="px-4 py-3">{t.colAmount.en}</th>
                  <th className="px-4 py-3">{t.colMethod.en}</th>
                  <th className="px-4 py-3">{t.colDate.en}</th>
                  <th className="px-4 py-3">{t.colStatus.en}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
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
