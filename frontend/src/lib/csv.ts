/**
 * Minimal, dependency-free CSV parser/serialiser. Handles quoted fields,
 * escaped quotes ("") and both \n and \r\n line endings — enough for the admin
 * bulk-import spreadsheet (which is what students/staff export from Excel or
 * Google Sheets as "CSV"). The first row is treated as the header.
 */
export type CsvRow = Record<string, string>;

/** Parse CSV text into an array of header-keyed row objects. */
export function parseCsv(text: string): CsvRow[] {
  const rows = tokenize(text);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  const out: CsvRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    // Skip fully-empty lines.
    if (cells.length === 1 && cells[0].trim() === '') continue;
    const obj: CsvRow = {};
    header.forEach((key, idx) => {
      obj[key] = (cells[idx] ?? '').trim();
    });
    out.push(obj);
  }
  return out;
}

/** Split raw CSV into a 2-D array of cells, respecting quotes. */
function tokenize(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      // Handle \r\n as a single break.
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  // Flush the final field/row (files without a trailing newline).
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Quote a single CSV cell when needed. */
export function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Build CSV text from header + rows. */
export function toCsv(header: string[], rows: string[][]): string {
  const lines = [header.map(csvCell).join(',')];
  for (const r of rows) lines.push(r.map(csvCell).join(','));
  return lines.join('\r\n');
}
