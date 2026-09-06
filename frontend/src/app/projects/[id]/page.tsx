'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { ProjectCard as Card, Purchase } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Alert, Spinner, LevelBadge } from '@/components/ui';
import { formatMMK } from '@/lib/format';
import { downloadProjectFile } from '@/lib/download';
import { tr, t, levelLabel } from '@/lib/i18n';
import { PurchasePanel } from '@/components/PurchasePanel';
import { ProjectMedia } from '@/components/media/ProjectMedia';
import { BookmarkButton } from '@/components/BookmarkButton';
import { SimilarProjects } from '@/components/SimilarProjects';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Card | null>(null);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p = await api.get<Card>(`/projects/${id}`);
        if (active) setProject(p);
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : tr(t.loadProjectFailed));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user) {
      setOwned(false);
      return;
    }
    api
      .get<Purchase[]>('/payments/purchases/mine')
      .then((list) => setOwned(list.some((x) => x.project.id === id)))
      .catch(() => setOwned(false));
  }, [user, id]);

  async function download() {
    const result = await downloadProjectFile(id, project?.title || 'project');
    if (result.ok) {
      setDownloadError(null);
      return;
    }
    setDownloadError(
      result.reason === 'forbidden'
        ? tr(t.dlNotApproved)
        : result.reason === 'unauthorized'
          ? tr(t.dlSessionExpired)
          : tr(t.dlFailed),
    );
  }

  if (loading) return <Spinner label={tr(t.loadingProject)} />;
  if (error || !project) return <Alert kind="error">{error || tr(t.notFound)}</Alert>;

  return (
    <>
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <article className="space-y-5">
        <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-slate-100">
          ← {tr(t.back)}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={project.level} />
          <span className="badge bg-white/10 text-slate-300">{project.year}</span>
          <span className="badge bg-white/10 text-slate-300">
            {project.university.shortName} · {project.department.code}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold leading-tight text-slate-100">{project.title}</h1>
          <BookmarkButton projectId={project.id} showLabel className="shrink-0 pt-1" />
        </div>

        <ProjectMedia
          gallery={project.gallery}
          spin={project.spin}
          videos={project.videos}
          title={project.title}
        />

        {project.aiSummary && (
          <section className="rounded-xl border border-brand-400/25 bg-brand-500/10 p-4">
            <h2 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200">
              ✨ {tr(t.aiSummaryLabel)}
            </h2>
            <p className="text-sm text-slate-100">{project.aiSummary}</p>
          </section>
        )}

        <section className="card p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {tr(t.abstract)}
          </h2>
          <p className="whitespace-pre-line text-slate-200">{project.abstract}</p>
        </section>

        {project.keywords.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {tr(t.keywords)}
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.keywords.map((k) => (
                <span key={k} className="badge bg-brand-500/15 text-brand-200 ring-1 ring-brand-400/25">
                  {k}
                </span>
              ))}
            </div>
          </section>
        )}

        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Meta label={tr(t.metaUniversity)} value={project.university.name} />
          <Meta label={tr(t.metaDepartment)} value={project.department.name} />
          <Meta label={tr(t.metaLevel)} value={tr(levelLabel[project.level]) ?? project.level} />
          <Meta label={tr(t.metaYear)} value={String(project.year)} />
          {project.authorsText && <Meta label={tr(t.metaAuthors)} value={project.authorsText} />}
          {project.supervisorName && <Meta label={tr(t.metaSupervisor)} value={project.supervisorName} />}
        </dl>
      </article>

      {/* Purchase / access panel */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="card space-y-4 p-5">
          <div>
            <p className="text-sm text-slate-400">{tr(t.fullFile)}</p>
            <p className="text-2xl font-bold text-slate-100">
              {project.priceMmk > 0 ? formatMMK(project.priceMmk) : tr(t.free)}
            </p>
          </div>

          {!project.hasFile ? (
            <Alert kind="info">{tr(t.fileNotAvailable)}</Alert>
          ) : owned || user?.role === 'ADMIN' ? (
            <>
              <Alert kind="success">{tr(t.youHaveAccess)}</Alert>
              {downloadError && <Alert kind="error">{downloadError}</Alert>}
              <button onClick={download} className="btn-primary w-full">
                {tr(t.downloadFile)}
              </button>
            </>
          ) : !user ? (
            <>
              <Alert kind="info">{tr(t.loginToBuyInfo)}</Alert>
              <button
                onClick={() => router.push(`/login?next=/projects/${id}`)}
                className="btn-primary w-full"
              >
                {tr(t.loginToBuyBtn)}
              </button>
            </>
          ) : (
            <PurchasePanel projectId={project.id} amountMmk={project.priceMmk} />
          )}
        </div>
      </aside>
    </div>
    <SimilarProjects projectId={project.id} />
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-200">{value}</dd>
    </div>
  );
}
