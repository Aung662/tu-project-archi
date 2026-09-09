/**
 * Export a student's starred toolkit components as a Bill of Materials (BOM) /
 * shopping-list CSV. This closes the loop between "browse parts" and "actually
 * buy them for the build": the student stars the parts they need, then downloads
 * a spreadsheet-ready list with category and the local price estimate.
 *
 * Fully client-side — reuses the same CSV serialiser as the admin bulk-import
 * so quoting/escaping behaves identically, and opens cleanly in Excel / Google
 * Sheets (UTF-8 BOM prefix keeps Burmese text readable in Excel).
 */
import { toCsv } from './csv';
import { COMPONENTS, CATEGORIES } from '@/data/components';
import { guideFor } from '@/data/componentGuide';

const catLabelEn = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.labelEn]));

/**
 * Build BOM CSV text for the given favourite component ids. Rows follow the
 * catalogue order (not click order) so the same set always exports identically.
 */
export function buildBomCsv(favoriteIds: string[]): string {
  const set = new Set(favoriteIds);
  const header = ['#', 'Component', 'Category', 'Qty', 'Est. price', 'Notes'];
  const rows: string[][] = [];
  let n = 0;
  for (const c of COMPONENTS) {
    if (!set.has(c.id)) continue;
    n += 1;
    const price = guideFor(c.id)?.price ?? '';
    rows.push([String(n), c.name, catLabelEn[c.category] ?? c.category, '1', price, c.blurb ?? '']);
  }
  return toCsv(header, rows);
}

/** Trigger a client-side download of the favourites BOM as a CSV file. */
export function downloadBom(favoriteIds: string[]): void {
  if (typeof window === 'undefined' || favoriteIds.length === 0) return;
  const csv = buildBomCsv(favoriteIds);
  // Prefix a UTF-8 BOM so Excel renders Burmese/price glyphs correctly.
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `parts-list-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
