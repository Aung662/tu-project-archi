'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { Spinner, Alert } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { tr, t } from '@/lib/i18n';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await api.get<User[]>('/admin/users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeRole(id: string, role: string) {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setMsg(tr(t.uRoleChanged));
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : tr(t.scActionFailed));
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {msg && <Alert kind="info">{msg}</Alert>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">{tr(t.uColName)}</th>
              <th className="px-4 py-3">{tr(t.uColEmail)}</th>
              <th className="px-4 py-3">{tr(t.uColJoined)}</th>
              <th className="px-4 py-3">{tr(t.uColRole)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
