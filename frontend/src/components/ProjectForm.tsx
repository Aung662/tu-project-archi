'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ProjectCard as Card, University } from '@/lib/types';
import { Alert } from './ui';
import { ProjectImageManager } from './media/ProjectImageManager';
import { t, levelLabel, statusLabel } from '@/lib/i18n';

interface Props {
  project: Card | null;
  onDone: () => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onDone, onCancel }: Props) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState({
    title: project?.title ?? '',
    abstract: project?.abstract ?? '',
    keywords: project?.keywords.join(', ') ?? '',
    year: project?.year ?? new Date().getFullYear(),
    level: project?.level ?? 'FINAL_YEAR',
    universityId: project?.university.id ?? '',
    departmentId: project?.department.id ?? '',
    priceMmk: project?.priceMmk ?? 5000,
    status: project?.status ?? 'DRAFT',
    hasConsent: project?.hasConsent ?? false,
    // Bug fix: prefill from the existing project so editing doesn't blank these out.
    authorsText: project?.authorsText ?? '',
    supervisorName: project?.supervisorName ?? '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Inline "add new" state for university / department. Admins can register a
  // TU or department on the fly instead of being limited to the seeded list.
  const [newUni, setNewUni] = useState({ open: false, name: '', shortName: '', city: '', busy: false });
  const [newDept, setNewDept] = useState({ open: false, name: '', code: '', busy: false });

  async function loadUniversities() {
    const list = await api.get<University[]>('/universities');
    setUniversities(list);
    return list;
  }

  useEffect(() => {
    loadUniversities().catch(() => {});
  }, []);

  const selectedUni = universities.find((u) => u.id === form.universityId);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const ADD_NEW = '__add_new__';

  async function addUniversity() {
    setError(null);
    if (newUni.name.trim().length < 2 || newUni.shortName.trim().length < 1) {
      setError('Enter a university name and short name.');
      return;
    }
    setNewUni((s) => ({ ...s, busy: true }));
    try {
      const created = await api.post<University>('/admin/universities', {
        name: newUni.name.trim(),
        shortName: newUni.shortName.trim(),
        city: newUni.city.trim() || undefined,
      });
      await loadUniversities();
      // Select the newly created university; clear any stale department.
      set({ universityId: created.id, departmentId: '' });
      setNewUni({ open: false, name: '', shortName: '', city: '', busy: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add university.');
      setNewUni((s) => ({ ...s, busy: false }));
    }
  }

  async function addDepartment() {
    setError(null);
    if (!form.universityId) {
      setError('Select a university first, then add a department.');
      return;
    }
    if (newDept.name.trim().length < 2 || newDept.code.trim().length < 1) {
      setError('Enter a department name and code.');
      return;
    }
    setNewDept((s) => ({ ...s, busy: true }));
    try {
      const created = await api.post<{ id: string }>('/admin/departments', {
        universityId: form.universityId,
        name: newDept.name.trim(),
        code: newDept.code.trim(),
      });
      await loadUniversities();
      set({ departmentId: created.id });
      setNewDept({ open: false, name: '', code: '', busy: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add department.');
      setNewDept((s) => ({ ...s, busy: false }));
    }
  }

  // Guard shown in UI; the server enforces the same rule authoritatively.
  const consentBlocked = form.status === 'PUBLISHED' && !form.hasConsent;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (consentBlocked) {
      setError(t.fConsentError.en);
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        abstract: form.abstract,
        keywords: form.keywords,
        year: Number(form.year),
        level: form.level,
        universityId: form.universityId,
        departmentId: form.departmentId,
        priceMmk: Number(form.priceMmk),
        status: form.status,
        hasConsent: form.hasConsent,
        authorsText: form.authorsText || undefined,
        supervisorName: form.supervisorName || undefined,
      };

      let projectId = project?.id;
      if (project) {
        await api.put(`/admin/projects/${project.id}`, payload);
      } else {
        const created = await api.post<Card>('/admin/projects', payload);
        projectId = created.id;
      }

      if (file && projectId) {
        const fd = new FormData();
        fd.append('file', file);
        await api.postForm(`/files/${projectId}/upload`, fd);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.fSaveFailed.en);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">
          {project ? t.fEditProject.en : t.fNewProject.en}
        </h2>
        <button type="button" onClick={onCancel} className="text-sm text-slate-400 hover:text-slate-100">
          ← {t.fCancel.en}
        </button>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <div>
        <label className="label">{t.fTitle.en} *</label>
        <input className="input" value={form.title} onChange={(e) => set({ title: e.target.value })} required />
      </div>
      <div>
        <label className="label">{t.fAbstract.en} *</label>
        <textarea
          className="input min-h-[120px]"
          value={form.abstract}
          onChange={(e) => set({ abstract: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t.fKeywordsComma.en}</label>
          <input className="input" value={form.keywords} onChange={(e) => set({ keywords: e.target.value })} />
        </div>
        <div>
          <label className="label">{t.metaYear.en} *</label>
          <input
            type="number"
            className="input"
            value={form.year}
            onChange={(e) => set({ year: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="label">{t.metaUniversity.en} *</label>
          <select
            className="input"
            value={form.universityId}
            onChange={(e) => {
              const v = e.target.value;
              if (v === ADD_NEW) {
                setNewUni((s) => ({ ...s, open: true }));
                return;
              }
              set({ universityId: v, departmentId: '' });
            }}
            required={!newUni.open}
          >
            <option value="">{t.fSelect.en}</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.shortName}
              </option>
            ))}
            <option value={ADD_NEW}>➕ Add new university…</option>
          </select>

          {newUni.open && (
            <div className="mt-2 space-y-2 rounded-lg border border-white/15 bg-white/5 p-3">
              <input
                className="input"
                placeholder="Full name (e.g. Technological University (Mandalay))"
                value={newUni.name}
                onChange={(e) => setNewUni((s) => ({ ...s, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  placeholder="Short name (e.g. TU-MDY)"
                  value={newUni.shortName}
                  onChange={(e) => setNewUni((s) => ({ ...s, shortName: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="City (optional)"
                  value={newUni.city}
                  onChange={(e) => setNewUni((s) => ({ ...s, city: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={addUniversity} disabled={newUni.busy} className="btn-primary text-sm">
                  {newUni.busy ? 'Adding…' : 'Add university'}
                </button>
                <button
                  type="button"
                  onClick={() => setNewUni({ open: false, name: '', shortName: '', city: '', busy: false })}
                  className="btn-secondary text-sm"
                >
                  {t.fCancel.en}
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="label">{t.metaDepartment.en} *</label>
          <select
            className="input"
            value={form.departmentId}
            onChange={(e) => {
              const v = e.target.value;
              if (v === ADD_NEW) {
                setNewDept((s) => ({ ...s, open: true }));
                return;
              }
              set({ departmentId: v });
            }}
            required={!newDept.open}
            disabled={!selectedUni}
          >
            <option value="">{t.fSelect.en}</option>
            {selectedUni?.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
            {selectedUni && <option value={ADD_NEW}>➕ Add new department…</option>}
          </select>

          {newDept.open && (
            <div className="mt-2 space-y-2 rounded-lg border border-white/15 bg-white/5 p-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  placeholder="Name (e.g. Civil Engineering)"
                  value={newDept.name}
                  onChange={(e) => setNewDept((s) => ({ ...s, name: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Code (e.g. CE)"
                  value={newDept.code}
                  onChange={(e) => setNewDept((s) => ({ ...s, code: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={addDepartment} disabled={newDept.busy} className="btn-primary text-sm">
                  {newDept.busy ? 'Adding…' : 'Add department'}
                </button>
                <button
                  type="button"
                  onClick={() => setNewDept({ open: false, name: '', code: '', busy: false })}
                  className="btn-secondary text-sm"
                >
                  {t.fCancel.en}
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="label">{t.fLevel.en} *</label>
          <select className="input" value={form.level} onChange={(e) => set({ level: e.target.value as Card['level'] })}>
            <option value="YEAR_3">{levelLabel.YEAR_3.en}</option>
            <option value="YEAR_5">{levelLabel.YEAR_5.en}</option>
            <option value="FINAL_YEAR">{levelLabel.FINAL_YEAR.en}</option>
            <option value="OTHER">{levelLabel.OTHER.en}</option>
          </select>
        </div>
        <div>
          <label className="label">{t.fPrice.en}</label>
          <input
            type="number"
            className="input"
            value={form.priceMmk}
            onChange={(e) => set({ priceMmk: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">{t.fAuthors.en}</label>
          <input className="input" value={form.authorsText} onChange={(e) => set({ authorsText: e.target.value })} />
        </div>
        <div>
          <label className="label">{t.fSupervisor.en}</label>
          <input
            className="input"
            value={form.supervisorName}
            onChange={(e) => set({ supervisorName: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="label">{t.fProjectFile.en}</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="input"
        />
        <p className="mt-1 text-xs text-slate-400">
          Allowed: PDF, Word (.doc/.docx), ZIP, or image (.jpg/.png). For gallery photos and the 360°
          viewer, save the project first, then use the image manager below.
        </p>
        {project?.hasFile && !file && (
          <p className="mt-1 text-xs text-slate-400">{t.fFileAttached.en}</p>
        )}
      </div>

      {/* Public images (gallery + 360°). Only available once the project exists,
          since images attach to a saved project id. */}
      {project ? (
        <ProjectImageManager projectId={project.id} />
      ) : (
        <p className="rounded-lg border border-dashed border-white/15 px-3 py-3 text-xs text-slate-400">
          💡 Save the project first, then re-open it to add gallery photos and 360° images.
        </p>
      )}

      <div className="grid gap-4 rounded-lg bg-white/5 p-4 sm:grid-cols-2">
        <div>
          <label className="label">{t.fStatus.en}</label>
          <select className="input" value={form.status} onChange={(e) => set({ status: e.target.value as Card['status'] })}>
            <option value="DRAFT">{statusLabel.DRAFT.en}</option>
            <option value="PUBLISHED">{statusLabel.PUBLISHED.en}</option>
            <option value="ARCHIVED">{statusLabel.ARCHIVED.en}</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={form.hasConsent}
            onChange={(e) => set({ hasConsent: e.target.checked })}
            className="h-4 w-4 rounded border-white/15"
          />
          {t.fConsentLabel.en}
        </label>
        {consentBlocked && (
          <div className="sm:col-span-2">
            <Alert kind="warning">{t.fConsentBlocked.en}</Alert>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={busy || consentBlocked} className="btn-primary">
          {busy ? t.fSaving.en : t.fSaveProject.en}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t.fCancel.en}
        </button>
      </div>
    </form>
  );
}
