'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Paginated, ProjectCard as Card } from '@/lib/types';
import { Spinner, EmptyState, StatusBadge, Alert } from '@/components/ui';
import { ProjectForm } from '@/components/ProjectForm';
import { t, statusLabel } from '@/lib/i18n';

export default function AdminProjects() {
  const [data, setData] = useState<Paginated<Card> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<Card | null>(null);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.get<Paginated<Card>>(`/admin/projects${api.qs({ page, q, status, pageSize: 15 })}`));
    } finally {
      setLoading(false);
    }
  }, [page, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    if (!confirm(t.aConfirmDelete.my)) return;
    await api.del(`/admin/projects/${id}`);
    setMsg(t.aDeleted.my);
    await load();
  }

  if (editing || creating) {
    return (
      <ProjectForm
        project={editing}
        onDone={async () => {
          setEditing(null);
          setCreating(false);
          setMsg(t.aSaved.my);
          await load();
        }}
        onCancel={() => {
          setEditing(null);
          setCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input max-w-xs"
            placeholder={t.aSearchPlaceholder.my}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="input w-auto"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t.aAllStatuses.my}</option>
            <option value="DRAFT">{statusLabel.DRAFT.my}</option>
            <option value="PUBLISHED">{statusLabel.PUBLISHED.my}</option>
            <option value="ARCHIVED">{statusLabel.ARCHIVED.my}</option>
          </select>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          {t.aNewProject.my}
        </button>
      </div>

      {msg && <Alert kind="success">{msg}</Alert>}

      {loading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title={t.aNoProjects.my} hint={t.aNoProjectsHint.my} />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t.aColTitle.my}</th>
                  <th className="px-4 py-3">{t.aColYear.my}</th>
                  <th className="px-4 py-3">{t.aColUniDept.my}</th>
                  <th className="px-4 py-3">{t.aColStatus.my}</th>
                  <th className="px-4 py-3">{t.aColConsent.my}</th>
                  <th className="px-4 py-3">{t.aColFile.my}</th>
                  <th className="px-4 py-3">{t.aColActions.my}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((p) => (
                  <tr key={p.id}>
                    <td className="max-w-xs px-4 py-3">
                      <Link href={`/projects/${p.id}`} className="font-medium text-slate-800 hover:text-brand-700">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{p.year}</td>
                    <td className="px-4 py-3 text-xs">
                      {p.university.shortName} / {p.department.code}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      {p.hasConsent ? (
                        <span className="badge bg-emerald-100 text-emerald-700">{t.aYes.my}</span>
                      ) : (
                        <span className="badge bg-red-100 text-red-700">{t.aNo.my}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{p.hasFile ? '📄' : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(p)} className="btn-secondary px-3 py-1 text-xs">
                          {t.aEdit.my}
                        </button>
                        <button onClick={() => remove(p.id)} className="btn-danger px-3 py-1 text-xs">
                          {t.aDelete.my}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {t.aPrev.my}
              </button>
              <span className="text-sm text-slate-600">
                {page} / {data.totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                {t.aNext.my}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
