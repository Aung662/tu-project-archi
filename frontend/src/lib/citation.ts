/**
 * Build academic citations for a project in the three styles engineering &
 * science students actually use: IEEE (the default in engineering), APA 7, and
 * MLA 9. Everything is derived from data the project already has — no backend
 * change needed.
 *
 * Authors are stored as a single free-text field (`authorsText`), so we parse it
 * leniently: split on commas / "and" / "&" / semicolons / newlines and tidy each
 * name. Missing pieces degrade gracefully.
 */
import type { ProjectCard } from './types';

export type CitationStyle = 'IEEE' | 'APA' | 'MLA';

export const CITATION_STYLES: CitationStyle[] = ['IEEE', 'APA', 'MLA'];

/** Split the free-text author list into individual, trimmed names. */
export function parseAuthors(authorsText: string): string[] {
  if (!authorsText) return [];
  return authorsText
    .split(/,|;|\band\b|&|\n/gi)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "Aung Kham Oo" -> "A. K. Oo" (IEEE style: initials + last name). */
function ieeeName(full: string): string {
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map((p) => `${p[0].toUpperCase()}.`);
  return `${initials.join(' ')} ${last}`;
}

/** "Aung Kham Oo" -> "Oo, A. K." (APA style: last name, initials). */
function apaName(full: string): string {
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map((p) => `${p[0].toUpperCase()}.`);
  return `${last}, ${initials.join(' ')}`;
}

/** Join a list of names with the right separators for each style. */
function joinIEEE(names: string[]): string {
  const f = names.map(ieeeName);
  if (f.length === 0) return '';
  if (f.length === 1) return f[0];
  if (f.length === 2) return `${f[0]} and ${f[1]}`;
  return `${f.slice(0, -1).join(', ')}, and ${f[f.length - 1]}`;
}

function joinAPA(names: string[]): string {
  const f = names.map(apaName);
  if (f.length === 0) return '';
  if (f.length === 1) return f[0];
  return `${f.slice(0, -1).join(', ')}, & ${f[f.length - 1]}`;
}

function joinMLA(names: string[]): string {
  // MLA: first author "Last, First", others "First Last"; 3+ -> "First et al."
  if (names.length === 0) return '';
  const first = names[0];
  const parts = first.split(/\s+/).filter(Boolean);
  const firstFormatted =
    parts.length > 1 ? `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}` : first;
  if (names.length === 1) return firstFormatted;
  if (names.length === 2) return `${firstFormatted}, and ${names[1]}`;
  return `${firstFormatted}, et al.`;
}

/** The institution string, e.g. "Dept. of EC, Technological University (Taunggyi)". */
function institution(p: ProjectCard): string {
  const dept = p.department?.name ? `Dept. of ${p.department.code}` : '';
  const uni = p.university?.name || p.university?.shortName || '';
  return [dept, uni].filter(Boolean).join(', ');
}

/** Produce a formatted citation string for the given style. */
export function formatCitation(p: ProjectCard, style: CitationStyle): string {
  const authors = parseAuthors(p.authorsText);
  const title = p.title.trim();
  const inst = institution(p);
  const year = p.year;
  const kind = p.level === 'FINAL_YEAR' ? 'Final-year project' : 'Student project';

  switch (style) {
    case 'IEEE': {
      const a = joinIEEE(authors);
      // A. Author, "Title," Final-year project, Dept., University, Year.
      return [a ? `${a}, ` : '', `"${title},"`, ` ${kind}, ${inst}, ${year}.`]
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
    }
    case 'APA': {
      const a = joinAPA(authors);
      // Author, A. A. (Year). Title [Final-year project]. Institution.
      return [a ? `${a} ` : '', `(${year}). `, `${title} [${kind}]. `, inst ? `${inst}.` : '']
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
    }
    case 'MLA': {
      const a = joinMLA(authors);
      // Author. "Title." Year. Institution. Student project.
      // Guard against a double period when the author list ends in "et al."
      const authorPart = a ? `${a}${a.endsWith('.') ? ' ' : '. '}` : '';
      return [authorPart, `"${title}." `, `${year}. `, inst ? `${inst}. ` : '', `${kind}.`]
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }
}
