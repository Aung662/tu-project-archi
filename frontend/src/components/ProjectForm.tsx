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
            onChange={(e) => set({ universityId: e.target.value, departmentId: '' })}
            required
          >
            <option value="">{t.fSelect.en}</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.shortName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.metaDepartment.en} *</label>
          <select
            className="input"
            value={form.departmentId}
            onChange={(e) => set({ departmentId: e.target.value })}
            required
            disabled={!selectedUni}
          >
            <option value="">{t.fSelect.en}</option>
            {selectedUni?.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
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
          accept=".pdf,.doc,.docx,.zip"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="input"
        />
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
