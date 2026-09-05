'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AuditEntry } from '@/lib/types';
import { Spinner, EmptyState } from '@/components/ui';
import { t } from '@/lib/i18n';

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AuditEntry[]>('/admin/audit')
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (logs.length === 0) return <EmptyState title={t.auEmpty.my} />;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">{t.auColWhen.my}</th>
            <th className="px-4 py-3">{t.auColActor.my}</th>
            <th className="px-4 py-3">{t.auColAction.my}</th>
            <th className="px-4 py-3">{t.auColEntity.my}</th>
            <th className="px-4 py-3">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {new Date(l.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">{l.actor?.name ?? 'system'}</td>
              <td className="px-4 py-3">
                <span className="badge bg-slate-100 font-mono text-slate-700">{l.action}</span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {l.entityType}:{l.entityId.slice(0, 8)}
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-400">{l.metadata}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
