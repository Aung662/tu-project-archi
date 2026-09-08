'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Paginated, ProjectCard as Card } from '@/lib/types';
import { Spinner, EmptyState, StatusBadge, Alert } from '@/components/ui';
import { ProjectForm } from '@/components/ProjectForm';
import { tr, t, statusLabel } from '@/lib/i18n';

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
    if (!confirm(tr(t.aConfirmDelete))) return;
    await api.del(`/admin/projects/${id}`);
    setMsg(tr(t.aDeleted));
    await load();
  }

  if (editing || creating) {
    return (
      <ProjectForm
        project={editing}
        onDone={async () => {
          setEditing(null);
          setCreating(false);
          setMsg(tr(t.aSaved));
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
            placeholder={tr(t.aSearchPlaceholder)}
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
            <option value="">{tr(t.aAllStatuses)}</option>
            <option value="DRAFT">{tr(statusLabel.DRAFT)}</option>
            <option value="PUBLISHED">{tr(statusLabel.PUBLISHED)}</option>
            <option value="ARCHIVED">{tr(statusLabel.ARCHIVED)}</option>
          </select>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          {tr(t.aNewProject)}
        </button>
      </div>

      {msg && <Alert kind="success">{msg}</Alert>}

      {loading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title={tr(t.aNoProjects)} hint={tr(t.aNoProjectsHint)} />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">{tr(t.aColTitle)}</th>
                  <th className="px-4 py-3">{tr(t.aColYear)}</th>
                  <th className="px-4 py-3">{tr(t.aColUniDept)}</th>
                  <th className="px-4 py-3">{tr(t.aColStatus)}</th>
                  <th className="px-4 py-3">{tr(t.aColConsent)}</th>
                  <th className="px-4 py-3">{tr(t.aColFile)}</th>
                  <th className="px-4 py-3">{tr(t.aColActions)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.items.map((p) => (
                  <tr key={p.id}>
                    <td className="max-w-xs px-4 py-3">
                      <Link href={`/projects/${p.id}`} className="font-medium text-slate-100 hover:text-brand-300">
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
                        <span className="badge bg-emerald-100 text-emerald-700">{tr(t.aYes)}</span>
                      ) : (
                        <span className="badge bg-red-100 text-red-700">{tr(t.aNo)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{p.hasFile ? '📄' : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(p)} className="btn-secondary px-3 py-1 text-xs">
                          {tr(t.aEdit)}
                        </button>
                        <button onClick={() => remove(p.id)} className="btn-danger px-3 py-1 text-xs">
                          {tr(t.aDelete)}
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
                {tr(t.aPrev)}
              </button>
              <span className="text-sm text-slate-300">
                {page} / {data.totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                {tr(t.aNext)}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
