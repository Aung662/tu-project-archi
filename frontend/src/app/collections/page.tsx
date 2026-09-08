'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getCollections,
  getCollection,
  createCollection,
  deleteCollection,
  renameCollection,
  removeFromCollection,
  COLLECTIONS_EVENT,
  type Collection,
} from '@/lib/collections';
import { EmptyState } from '@/components/ui';
import { Reveal, StaggerGrid, StaggerItem } from '@/components/motion';
import { tr, t } from '@/lib/i18n';

/**
 * "My Collections" — named, on-device folders of projects. The list view shows
 * every collection with a project count; selecting one (?c=<id>) shows its
 * projects. All storage is localStorage (no backend, private to the device).
 */
export default function CollectionsPage() {
  return (
    <Suspense fallback={null}>
      <CollectionsInner />
    </Suspense>
  );
}

function CollectionsInner() {
  const params = useSearchParams();
  const openId = params.get('c');
  const [cols, setCols] = useState<Collection[] | null>(null);

  useEffect(() => {
    const sync = () => setCols(getCollections());
    sync();
    window.addEventListener(COLLECTIONS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COLLECTIONS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (openId) return <CollectionDetail id={openId} />;

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">
          {tr(t.collectionsTitle)}
        </h1>
        <p className="mt-2 text-sm text-slate-400">{tr(t.collectionsSubtitle)}</p>
      </Reveal>

      <CreateInline />

      {cols && cols.length === 0 && (
        <EmptyState title={tr(t.collectionsEmpty)} hint={tr(t.collectionsEmptyHint)} />
      )}

      {cols && cols.length > 0 && (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cols.map((c) => (
            <StaggerItem key={c.id}>
              <div className="card flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/collections?c=${c.id}`}
                    className="flex items-center gap-2 font-semibold leading-tight text-slate-100 hover:text-amber-300"
                  >
                    <span aria-hidden>📚</span>
                    {c.name}
                  </Link>
                  <span className="font-latin shrink-0 text-xs text-slate-500">
                    {c.items.length} {tr(t.collectionCount)}
                  </span>
                </div>
                <div className="flex-1 text-xs text-slate-500">
                  {c.items.slice(0, 3).map((i) => (
                    <p key={i.id} className="truncate">
                      • {i.title}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <Link
                    href={`/collections?c=${c.id}`}
                    className="text-amber-300 hover:text-amber-200"
                  >
                    {tr(t.collectionOpen)}
                  </Link>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const name = prompt(tr(t.collectionRename), c.name);
                        if (name) renameCollection(c.id, name);
                      }}
                      className="text-slate-400 transition hover:text-slate-200"
                    >
                      {tr(t.collectionRename)}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(tr(t.collectionDeleteConfirm))) deleteCollection(c.id);
                      }}
                      className="text-slate-400 transition hover:text-rose-300"
                    >
                      {tr(t.collectionDelete)}
                    </button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}

function CreateInline() {
  const [name, setName] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const clean = name.trim();
        if (!clean) return;
        createCollection(clean);
        setName('');
      }}
      className="flex items-center gap-2"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={tr(t.collectionCreatePlaceholder)}
        className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50 focus:bg-white/[0.05]"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 px-4 py-2.5 text-sm font-semibold text-ink-900 transition hover:opacity-90"
      >
        {tr(t.collectionCreateBtn)}
      </button>
    </form>
  );
}

function CollectionDetail({ id }: { id: string }) {
  const [col, setCol] = useState<Collection | undefined | null>(null);

  useEffect(() => {
    const sync = () => setCol(getCollection(id) ?? null);
    sync();
    window.addEventListener(COLLECTIONS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COLLECTIONS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <Reveal>
        <Link
          href="/collections"
          className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-200"
        >
          ← {tr(t.collectionBack)}
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-slate-100 sm:text-4xl">
          <span aria-hidden>📚</span>
          {col?.name ?? '…'}
        </h1>
        {col && (
          <p className="mt-1 text-sm text-slate-500">
            {col.items.length} {tr(t.collectionCount)}
          </p>
        )}
      </Reveal>

      {col && col.items.length === 0 && <EmptyState title={tr(t.collectionEmptyItems)} />}

      {col && col.items.length > 0 && (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {col.items.map((i) => (
            <StaggerItem key={i.id}>
              <div className="card flex h-full flex-col gap-3 p-5">
                <Link
                  href={`/projects/${i.id}`}
                  className="font-semibold leading-tight text-slate-100 hover:text-amber-300"
                >
                  {i.title}
                </Link>
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                  {i.year && <span className="badge bg-white/10 text-slate-400">{i.year}</span>}
                  {(i.uniShort || i.deptCode) && (
                    <span className="badge bg-white/10 text-slate-400">
                      {[i.uniShort, i.deptCode].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <Link href={`/projects/${i.id}`} className="text-amber-300 hover:text-amber-200">
                    {tr(t.collectionOpen)}
                  </Link>
                  <button
                    onClick={() => removeFromCollection(id, i.id)}
                    className="text-slate-400 transition hover:text-rose-300"
                  >
                    {tr(t.collectionRemoveItem)}
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
