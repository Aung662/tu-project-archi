'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ProjectCard as Card, University } from '@/lib/types';
import { Alert } from './ui';
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

  useEffect(() => {
    api.get<University[]>('/universities').then(setUniversities).catch(() => {});
  }, []);

  const selectedUni = universities.find((u) => u.id === form.universityId);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  // Guard shown in UI; the server enforces the same rule authoritatively.
  const consentBlocked = form.status === 'PUBLISHED' && !form.hasConsent;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (consentBlocked) {
      setError(t.fConsentError.my);
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
      setError(err instanceof Error ? err.message : t.fSaveFailed.my);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {project ? t.fEditProject.my : t.fNewProject.my}
        </h2>
        <button type="button" onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-800">
          ← {t.fCancel.my}
        </button>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <div>
        <label className="label">{t.fTitle.my} *</label>
        <input className="input" value={form.title} onChange={(e) => set({ title: e.target.value })} required />
      </div>
      <div>
        <label className="label">{t.fAbstract.my} *</label>
        <textarea
          className="input min-h-[120px]"
          value={form.abstract}
          onChange={(e) => set({ abstract: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t.fKeywordsComma.my}</label>
          <input className="input" value={form.keywords} onChange={(e) => set({ keywords: e.target.value })} />
        </div>
        <div>
          <label className="label">{t.metaYear.my} *</label>
          <input
            type="number"
            className="input"
            value={form.year}
            onChange={(e) => set({ year: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="label">{t.metaUniversity.my} *</label>
          <select
            className="input"
            value={form.universityId}
            onChange={(e) => set({ universityId: e.target.value, departmentId: '' })}
            required
          >
            <option value="">{t.fSelect.my}</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.shortName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.metaDepartment.my} *</label>
          <select
            className="input"
            value={form.departmentId}
            onChange={(e) => set({ departmentId: e.target.value })}
            required
            disabled={!selectedUni}
          >
            <option value="">{t.fSelect.my}</option>
            {selectedUni?.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.fLevel.my} *</label>
          <select className="input" value={form.level} onChange={(e) => set({ level: e.target.value as Card['level'] })}>
            <option value="YEAR_3">{levelLabel.YEAR_3.my}</option>
            <option value="YEAR_5">{levelLabel.YEAR_5.my}</option>
            <option value="FINAL_YEAR">{levelLabel.FINAL_YEAR.my}</option>
            <option value="OTHER">{levelLabel.OTHER.my}</option>
          </select>
        </div>
        <div>
          <label className="label">{t.fPrice.my}</label>
          <input
            type="number"
            className="input"
            value={form.priceMmk}
            onChange={(e) => set({ priceMmk: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">{t.fAuthors.my}</label>
          <input className="input" value={form.authorsText} onChange={(e) => set({ authorsText: e.target.value })} />
        </div>
        <div>
          <label className="label">{t.fSupervisor.my}</label>
          <input
            className="input"
            value={form.supervisorName}
            onChange={(e) => set({ supervisorName: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="label">{t.fProjectFile.my}</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.zip"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="input"
        />
        {project?.hasFile && !file && (
          <p className="mt-1 text-xs text-slate-500">{t.fFileAttached.my}</p>
        )}
      </div>

      <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
        <div>
          <label className="label">{t.fStatus.my}</label>
          <select className="input" value={form.status} onChange={(e) => set({ status: e.target.value as Card['status'] })}>
            <option value="DRAFT">{statusLabel.DRAFT.my}</option>
            <option value="PUBLISHED">{statusLabel.PUBLISHED.my}</option>
            <option value="ARCHIVED">{statusLabel.ARCHIVED.my}</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.hasConsent}
            onChange={(e) => set({ hasConsent: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300"
          />
          {t.fConsentLabel.my}
        </label>
        {consentBlocked && (
          <div className="sm:col-span-2">
            <Alert kind="warning">{t.fConsentBlocked.my}</Alert>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={busy || consentBlocked} className="btn-primary">
          {busy ? t.fSaving.my : t.fSaveProject.my}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t.fCancel.my}
        </button>
      </div>
    </form>
  );
}
