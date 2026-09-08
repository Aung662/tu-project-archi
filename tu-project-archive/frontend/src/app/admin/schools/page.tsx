'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { University } from '@/lib/types';
import { Spinner, EmptyState, Alert } from '@/components/ui';
import { tr, t } from '@/lib/i18n';

export default function AdminSchools() {
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // university create/edit
  const [editingUni, setEditingUni] = useState<University | null>(null);
  const [creatingUni, setCreatingUni] = useState(false);
  const [uniForm, setUniForm] = useState({ name: '', shortName: '', city: '' });

  // department create/edit (keyed by universityId)
  const [deptForUni, setDeptForUni] = useState<string | null>(null);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUnis(await api.get<University[]>('/universities'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function flash(text: string) {
    setMsg(text);
    setErr(null);
  }
  function fail(e: unknown) {
    setErr(e instanceof Error ? e.message : tr(t.scActionFailed));
    setMsg(null);
  }

  // ── University handlers ──
  function startCreateUni() {
    setUniForm({ name: '', shortName: '', city: '' });
    setEditingUni(null);
    setCreatingUni(true);
  }
  function startEditUni(u: University) {
    setUniForm({ name: u.name, shortName: u.shortName, city: u.city ?? '' });
    setEditingUni(u);
    setCreatingUni(false);
  }
  async function saveUni(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { name: uniForm.name, shortName: uniForm.shortName, city: uniForm.city || undefined };
      if (editingUni) await api.put(`/admin/universities/${editingUni.id}`, payload);
      else await api.post('/admin/universities', payload);
      setCreatingUni(false);
      setEditingUni(null);
      flash(tr(t.scSaved));
      await load();
    } catch (e) {
      fail(e);
    }
  }
  async function deleteUni(id: string) {
    if (!confirm(tr(t.scConfirmDeleteUni))) return;
    try {
      await api.del(`/admin/universities/${id}`);
      flash(tr(t.scSaved));
      await load();
    } catch (e) {
      fail(e);
    }
  }

  // ── Department handlers ──
  function startCreateDept(universityId: string) {
    setDeptForm({ name: '', code: '' });
    setEditingDeptId(null);
    setDeptForUni(universityId);
  }
  function startEditDept(universityId: string, d: { id: string; name: string; code: string }) {
    setDeptForm({ name: d.name, code: d.code });
    setEditingDeptId(d.id);
    setDeptForUni(universityId);
  }
  async function saveDept(e: React.FormEvent, universityId: string) {
    e.preventDefault();
    try {
      if (editingDeptId) await api.put(`/admin/departments/${editingDeptId}`, deptForm);
      else await api.post('/admin/departments', { ...deptForm, universityId });
      setDeptForUni(null);
      setEditingDeptId(null);
      flash(tr(t.scSaved));
      await load();
    } catch (e) {
      fail(e);
    }
  }
  async function deleteDept(id: string) {
    if (!confirm(tr(t.scConfirmDeleteDept))) return;
    try {
      await api.del(`/admin/departments/${id}`);
      flash(tr(t.scSaved));
      await load();
    } catch (e) {
      fail(e);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{tr(t.scTitle)}</h2>
          <p className="text-sm text-slate-400">{tr(t.scSubtitle)}</p>
        </div>
        <button onClick={startCreateUni} className="btn-primary">
          {tr(t.scNewUni)}
        </button>
      </div>

      {msg && <Alert kind="success">{msg}</Alert>}
      {err && <Alert kind="error">{err}</Alert>}

      {/* University create/edit form */}
      {(creatingUni || editingUni) && (
        <form onSubmit={saveUni} className="card grid gap-3 p-5 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="label">{tr(t.scUniName)} *</label>
            <input className="input" value={uniForm.name} onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">{tr(t.scUniShort)} *</label>
            <input className="input" value={uniForm.shortName} onChange={(e) => setUniForm({ ...uniForm, shortName: e.target.value })} required />
          </div>
          <div>
            <label className="label">{tr(t.scUniCity)}</label>
            <input className="input" value={uniForm.city} onChange={(e) => setUniForm({ ...uniForm, city: e.target.value })} />
          </div>
          <div className="flex gap-2 sm:col-span-3">
            <button type="submit" className="btn-primary">{tr(t.scSave)}</button>
            <button type="button" onClick={() => { setCreatingUni(false); setEditingUni(null); }} className="btn-secondary">
              {tr(t.scCancel)}
            </button>
          </div>
        </form>
      )}

      {unis.length === 0 ? (
        <EmptyState title={tr(t.scNoUnis)} />
      ) : (
        <div className="space-y-4">
          {unis.map((u) => (
            <div key={u.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-100">
                    {u.name} <span className="text-sm font-normal text-slate-400">({u.shortName})</span>
                  </h3>
                  {u.city && <p className="text-xs text-slate-400">{u.city}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditUni(u)} className="btn-secondary px-3 py-1 text-xs">{tr(t.scEdit)}</button>
                  <button onClick={() => deleteUni(u.id)} className="btn-danger px-3 py-1 text-xs">{tr(t.scDelete)}</button>
                </div>
              </div>

              {/* Departments */}
              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{tr(t.scDepartments)}</span>
                  <button onClick={() => startCreateDept(u.id)} className="text-xs font-medium text-brand-300 hover:underline">
                    {tr(t.scAddDept)}
                  </button>
                </div>

                {deptForUni === u.id && (
                  <form onSubmit={(e) => saveDept(e, u.id)} className="mb-3 flex flex-wrap items-end gap-2 rounded-lg bg-white/5 p-3">
                    <div className="flex-1">
                      <label className="label">{tr(t.scDeptCode)} *</label>
                      <input className="input" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} required />
                    </div>
                    <div className="flex-[2]">
                      <label className="label">{tr(t.scDeptName)} *</label>
                      <input className="input" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn-primary">{tr(t.scSave)}</button>
                    <button type="button" onClick={() => { setDeptForUni(null); setEditingDeptId(null); }} className="btn-secondary">
                      {tr(t.scCancel)}
                    </button>
                  </form>
                )}

                {u.departments.length === 0 ? (
                  <p className="text-sm text-slate-400">{tr(t.scNoDepts)}</p>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {u.departments.map((d) => (
                      <li key={d.id} className="flex items-center justify-between py-2 text-sm">
                        <span>
                          <span className="badge bg-white/10 text-slate-300">{d.code}</span> {d.name}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => startEditDept(u.id, d)} className="btn-secondary px-3 py-1 text-xs">{tr(t.scEdit)}</button>
                          <button onClick={() => deleteDept(d.id)} className="btn-danger px-3 py-1 text-xs">{tr(t.scDelete)}</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
