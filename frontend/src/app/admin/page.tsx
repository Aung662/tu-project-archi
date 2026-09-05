'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AdminStats } from '@/lib/types';
import { Spinner } from '@/components/ui';
import { t } from '@/lib/i18n';

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.get<AdminStats>('/admin/stats').then(setStats).catch(() => {});
  }, []);

  if (!stats) return <Spinner />;

  const cards = [
    { label: t.statTotalProjects.my, value: stats.projects, hint: `${stats.published} ${t.statPublished.my}` },
    { label: t.statPendingPayments.my, value: stats.pendingPayments, hint: t.statNeedReview.my, warn: stats.pendingPayments > 0 },
    { label: t.statUsers.my, value: stats.users },
    { label: t.statAccessGrants.my, value: stats.purchases, hint: t.statFilesUnlocked.my },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-5">
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className={`mt-1 text-3xl font-bold ${c.warn ? 'text-amber-600' : 'text-slate-900'}`}>
            {c.value}
          </p>
          {c.hint && <p className="text-xs text-slate-400">{c.hint}</p>}
        </div>
      ))}
    </div>
  );
}
