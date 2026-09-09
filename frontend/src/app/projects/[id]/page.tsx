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
import { AdSlot } from '@/components/ads/AdSlot';
import { ProjectMedia } from '@/components/media/ProjectMedia';
import { BookmarkButton } from '@/components/BookmarkButton';
import { CompareButton } from '@/components/CompareButton';
import { CollectionButton } from '@/components/CollectionButton';
import { ShareButton } from '@/components/ShareButton';
import { ExportButton } from '@/components/ExportButton';
import { CitationBox } from '@/components/CitationBox';
import { NoteEditor } from '@/components/NoteEditor';
import { ReviewSection } from '@/components/ReviewSection';
import { SimilarProjects } from '@/components/SimilarProjects';
import { addRecentlyViewed } from '@/lib/recentlyViewed';
import { recordDownload } from '@/lib/downloadHistory';
import Link from 'next/link';

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
        if (active) {
          setProject(p);
          // Remember this visit for the "Recently viewed" strip (local only).
          addRecentlyViewed({
            id: p.id,
            title: p.title,
            year: p.year,
            deptCode: p.department.code,
            uniShort: p.university.shortName,
          });
        }
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
      // Log the successful download for the private on-device history page.
      if (project) {
        recordDownload({
          id: project.id,
          title: project.title,
          year: project.year,
          deptCode: project.department.code,
          uniShort: project.university.shortName,
        });
      }
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
          {(project.viewCount ?? 0) > 0 && (
            <span className="badge bg-white/10 text-slate-400">
              👁 {project.viewCount}
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold leading-tight text-slate-100">{project.title}</h1>
          <div className="no-print flex shrink-0 items-center gap-2 pt-1">
            <ShareButton title={project.title} />
            <BookmarkButton projectId={project.id} showLabel />
            <CompareButton projectId={project.id} title={project.title} showLabel />
            <CollectionButton
              projectId={project.id}
              title={project.title}
              year={project.year}
              deptCode={project.department.code}
              uniShort={project.university.shortName}
              showLabel
            />
            <button
              onClick={() => window.print()}
              title={tr(t.printLabel)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <span aria-hidden>🖨</span>
              <span className="hidden sm:inline">{tr(t.printLabel)}</span>
            </button>
            <ExportButton
              project={{
                id: project.id,
                title: project.title,
                year: project.year,
                level: project.level,
                abstract: project.abstract,
                keywords: project.keywords,
                authorsText: project.authorsText,
                supervisorName: project.supervisorName,
                university: project.university,
                department: project.department,
              }}
            />
          </div>
        </div>

        <div className="no-print">
          <ProjectMedia
            gallery={project.gallery}
            spin={project.spin}
            videos={project.videos}
            title={project.title}
          />
        </div>

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
                <Link
                  key={k}
                  href={`/browse?q=${encodeURIComponent(k)}`}
                  className="badge bg-brand-500/15 text-brand-200 ring-1 ring-brand-400/25 transition hover:bg-brand-500/30 hover:text-brand-100"
                >
                  {k}
                </Link>
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

        {/* Cite this project — IEEE / APA / MLA, one-click copy */}
        <CitationBox project={project} />

        {/* Ratings & reviews */}
        {/* Private research note (localStorage) */}
        <div className="no-print">
          <NoteEditor projectId={project.id} title={project.title} />
        </div>

        <div className="no-print">
          <ReviewSection projectId={project.id} />
        </div>
      </article>

      {/* Purchase / access panel */}
      <aside className="no-print lg:sticky lg:top-20 lg:self-start">
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

        {/* Sidebar ad below the purchase panel */}
        <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR} className="mt-4" minHeight={250} />
      </aside>
    </div>
    <div className="no-print">
      <SimilarProjects projectId={project.id} />
    </div>
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
