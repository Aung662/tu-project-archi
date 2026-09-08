'use client';

import { useMemo, useState } from 'react';
import type { Bookmark } from '@/lib/types';
import { CITATION_STYLES, formatCitation, type CitationStyle } from '@/lib/citation';
import { tr, t } from '@/lib/i18n';

/**
 * Turns a student's saved (bookmarked) projects into a ready-to-paste reference
 * list in IEEE / APA / MLA — the literature-review power tool. Copy the whole
 * list or download it as a .txt. Pure client-side; reuses the citation formatter.
 */
export function BibliographyExport({ bookmarks }: { bookmarks: Bookmark[] }) {
  const [style, setStyle] = useState<CitationStyle>('IEEE');
  const [copied, setCopied] = useState(false);

  const lines = useMemo(
    () =>
      bookmarks.map((b, i) => {
        const c = formatCitation(
          {
            title: b.project.title,
            year: b.project.year,
            level: b.project.level,
            authorsText: b.project.authorsText ?? '',
            university: b.project.university,
            department: b.project.department,
          },
          style,
        );
        return style === 'IEEE' ? `[${i + 1}] ${c}` : c;
      }),
    [bookmarks, style],
  );

  const text = lines.join('\n\n');

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography-${style.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (bookmarks.length === 0) return null;

  return (
    <div className="card space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <span aria-hidden>📚</span> {tr(t.bibTitle)}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{tr(t.bibHint)}</p>
        </div>
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

      <ol className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-4 font-latin text-sm leading-relaxed text-slate-200">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        <button onClick={copyAll} className="btn-secondary">
          <span aria-hidden>{copied ? '✓ ' : '⧉ '}</span>
          {copied ? tr(t.bibCopied) : tr(t.bibCopy)}
        </button>
        <button onClick={download} className="btn-secondary">
          <span aria-hidden>⬇ </span>
          {tr(t.bibDownload)}
        </button>
      </div>
    </div>
  );
}
