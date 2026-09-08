'use client';

import { useMemo, useState } from 'react';
import type { ProjectCard } from '@/lib/types';
import { CITATION_STYLES, formatCitation, type CitationStyle } from '@/lib/citation';
import { tr, t } from '@/lib/i18n';

/**
 * "Cite this project" — lets a student pick IEEE / APA / MLA and copy a ready-made
 * reference for their thesis or proposal. Pure client-side; derives everything
 * from the project the page already loaded.
 */
export function CitationBox({ project }: { project: ProjectCard }) {
  const [style, setStyle] = useState<CitationStyle>('IEEE');
  const [copied, setCopied] = useState(false);

  const citation = useMemo(() => formatCitation(project, style), [project, style]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — user can still select the text manually */
    }
  }

  return (
    <section className="card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <span aria-hidden>❝</span> {tr(t.citeTitle)}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">{tr(t.citeHint)}</p>
        </div>

        {/* Style switcher — segmented control */}
        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
          {CITATION_STYLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              aria-pressed={style === s}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                style === s
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-glow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <p className="rounded-lg border border-white/10 bg-black/20 p-4 pr-12 font-latin text-sm leading-relaxed text-slate-200">
          {citation}
        </p>
        <button
          type="button"
          onClick={copy}
          aria-label={tr(t.citeCopy)}
          className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          <span aria-hidden>{copied ? '✓' : '⧉'}</span>
          {copied ? tr(t.citeCopied) : tr(t.citeCopy)}
        </button>
      </div>
    </section>
  );
}
