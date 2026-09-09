'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { parseCsv, toCsv, type CsvRow } from '@/lib/csv';
import { Alert, Spinner } from '@/components/ui';
import { tr, t } from '@/lib/i18n';

interface RowResult {
  row: number;
  ok: boolean;
  id?: string;
  title?: string;
  error?: string;
}
interface ImportResponse {
  dryRun: boolean;
  total: number;
  succeeded: number;
  failed: number;
  created: number;
  results: RowResult[];
}

const TEMPLATE_HEADER = [
  'title',
  'abstract',
  'keywords',
  'year',
  'level',
  'authorsText',
  'supervisorName',
  'university',
  'department',
  'priceMmk',
  'status',
  'hasConsent',
];
const TEMPLATE_SAMPLE = [
  'Smart Irrigation System',
  'An IoT system that automates watering based on soil moisture and weather data.',
  'iot;agriculture;esp32',
  '2025',
  'FINAL_YEAR',
  'Aung Aung, Su Su',
  'Dr. Khin Maung',
  'TU (Taunggyi)',
  'EC',
  '5000',
  'DRAFT',
  'true',
];

/**
 * Admin bulk-import modal. Parses a CSV in the browser, sends the rows to the
 * bulk-import endpoint, and shows a per-row report. Always offers a "validate
 * (dry-run)" pass first so an admin can fix a spreadsheet before creating
 * anything. No data is created until "Import now" is pressed.
 */
export function BulkImport({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);

  function downloadTemplate() {
    const csv = toCsv(TEMPLATE_HEADER, [TEMPLATE_SAMPLE]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'projects-import-template.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        setError('No data rows found in the file.');
        setRows([]);
      } else {
        setRows(parsed);
        setFileName(`${file.name} · ${parsed.length} ${tr(t.aBulkRows)}`);
      }
    } catch {
      setError('Could not read the file.');
    }
  }

  async function run(dryRun: boolean) {
    if (rows.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<ImportResponse>('/admin/projects/bulk-import', { rows, dryRun });
      setResult(res);
      if (!dryRun && res.created > 0) onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="card w-full max-w-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">{tr(t.aBulkTitle)}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-white hover:bg-white/15"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-slate-400">{tr(t.aBulkHint)}</p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button onClick={downloadTemplate} className="btn-secondary px-3 py-1.5 text-xs">
            ⬇ {tr(t.aBulkTemplate)}
          </button>
          <label className="btn-secondary cursor-pointer px-3 py-1.5 text-xs">
            {tr(t.aBulkChoose)}
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
          </label>
          {fileName && <span className="text-xs text-slate-400">{fileName}</span>}
        </div>

        {error && <Alert kind="error">{error}</Alert>}

        {rows.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={() => run(true)} disabled={busy} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50">
              {tr(t.aBulkValidate)}
            </button>
            <button onClick={() => run(false)} disabled={busy} className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50">
              {tr(t.aBulkImportNow)}
            </button>
          </div>
        )}

        {busy && <Spinner />}

        {result && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-slate-300">
                {result.total} {tr(t.aBulkRows)}
              </span>
              <span className="text-emerald-400">
                {result.succeeded} {tr(t.aBulkOk)}
              </span>
              {result.failed > 0 && (
                <span className="text-rose-400">
                  {result.failed} {tr(t.aBulkFail)}
                </span>
              )}
              {!result.dryRun && (
                <span className="font-semibold text-brand-300">
                  {result.created} {tr(t.aBulkCreated)}
                </span>
              )}
              {result.dryRun && (
                <span className="rounded bg-amber-400/15 px-2 text-xs font-medium text-amber-300">DRY-RUN</span>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-ink-900/90 text-slate-400">
                  <tr>
                    <th className="px-2 py-1.5">#</th>
                    <th className="px-2 py-1.5">Status</th>
                    <th className="px-2 py-1.5">Title / error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.results.map((r) => (
                    <tr key={r.row}>
                      <td className="px-2 py-1.5 font-latin text-slate-500">{r.row}</td>
                      <td className="px-2 py-1.5">
                        {r.ok ? <span className="text-emerald-400">✓</span> : <span className="text-rose-400">✗</span>}
                      </td>
                      <td className="px-2 py-1.5 text-slate-300">{r.ok ? r.title : r.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
