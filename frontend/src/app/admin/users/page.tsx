'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { AdminUser, University } from '@/lib/types';
import { Spinner, Alert } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { tr, t } from '@/lib/i18n';

/** Sentinel used by the scope <select> for the "super admin / all departments" choice. */
const SUPER = '__super__';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, unis] = await Promise.all([
        api.get<AdminUser[]>('/admin/users'),
        api.get<University[]>('/universities'),
      ]);
      setUsers(u);
      setUniversities(unis);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Flat list of departments (with a university label) for the scope dropdown.
  const departments = useMemo(
    () =>
      universities.flatMap((u) =>
        u.departments.map((d) => ({
          id: d.id,
          label: `${u.shortName} · ${d.code} — ${d.name}`,
        })),
      ),
    [universities],
  );

  async function changeRole(id: string, role: string) {
    try {
      // Changing to a non-admin role clears any department binding server-side.
      await api.put(`/admin/users/${id}/role`, { role });
      setMsg(tr(t.uRoleChanged));
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : tr(t.scActionFailed));
    }
  }

  async function changeScope(id: string, value: string) {
    // value === SUPER → super-admin (no department); otherwise a department id.
    const adminDepartmentId = value === SUPER ? null : value;
    try {
      await api.put(`/admin/users/${id}/role`, { role: 'ADMIN', adminDepartmentId });
      setMsg(tr(t.uScopeSaved));
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : tr(t.scActionFailed));
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {msg && <Alert kind="info">{msg}</Alert>}
      <Alert kind="info">{tr(t.uScopeHint)}</Alert>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">{tr(t.uColName)}</th>
              <th className="px-4 py-3">{tr(t.uColEmail)}</th>
              <th className="px-4 py-3">{tr(t.uColJoined)}</th>
              <th className="px-4 py-3">{tr(t.uColRole)}</th>
              <th className="px-4 py-3">{tr(t.uColScope)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u) => {
              const isAdmin = u.role === 'ADMIN';
              const scopeValue = u.adminDepartmentId ?? SUPER;
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-100">{u.name}</td>
                  <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input max-w-[140px]"
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        className="input max-w-[280px]"
                        value={scopeValue}
                        onChange={(e) => changeScope(u.id, e.target.value)}
                      >
                        <option value={SUPER}>{tr(t.uScopeAllDepts)}</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
