/**
 * projectExport.ts — client-side export of a project as a printable "thesis
 * card" PDF (with a scannable QR code linking back to the live page) and as a
 * standalone QR PNG. Everything runs in the browser via jsPDF + qrcode; no
 * backend, no external calls, so it works offline and in the sandbox preview.
 *
 * The PDF is intentionally a one-page reference card (title, authors, advisor,
 * university/department, year/level, keywords, abstract, IEEE citation, QR) —
 * the format students pin to a defense board or hand to examiners.
 */
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { formatCitation, type Citable } from './citation';

export interface ExportProject extends Citable {
  id: string;
  abstract: string;
  keywords: string[];
  supervisorName?: string | null;
}

function levelText(level: string): string {
  const map: Record<string, string> = {
    YEAR_3: 'Third Year',
    YEAR_5: 'Fifth Year',
    FINAL_YEAR: 'Final Year',
    OTHER: 'Project',
  };
  return map[level] ?? level;
}

/** Generate a QR code (as a data URL) that points at the project's public page. */
export async function projectQrDataUrl(projectId: string, size = 512): Promise<string> {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/projects/${projectId}`;
  return QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    color: { dark: '#0f172a', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
}

/** Download the QR code alone as a PNG. */
export async function downloadProjectQr(project: ExportProject): Promise<void> {
  const dataUrl = await projectQrDataUrl(project.id, 720);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${slug(project.title)}-qr.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'project'
  );
}

/** Build and download a one-page A4 "thesis card" PDF. */
export async function downloadProjectPdf(project: ExportProject): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const brand: [number, number, number] = [79, 70, 229]; // indigo-600
  const ink: [number, number, number] = [15, 23, 42];
  const grey: [number, number, number] = [100, 116, 139];

  // ── Header band ──────────────────────────────────────────
  doc.setFillColor(...brand);
  doc.rect(0, 0, pageW, 8, 'F');

  doc.setTextColor(...grey);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TU PROJECT ARCHIVE — THESIS CARD', margin, (y += 8));
  y += 6;

  // ── Title ────────────────────────────────────────────────
  doc.setTextColor(...ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(project.title, contentW);
  doc.text(titleLines, margin, (y += 18));
  y += titleLines.length * 20;

  // ── Meta line ────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...grey);
  const uni = project.university.name || project.university.shortName || '';
  const dept = project.department.name || project.department.code || '';
  const meta = [uni, dept, `${levelText(project.level)} · ${project.year}`]
    .filter(Boolean)
    .join('  |  ');
  doc.text(doc.splitTextToSize(meta, contentW), margin, (y += 6));
  y += 18;

  // ── QR (top-right) ───────────────────────────────────────
  const qrSize = 110;
  const qrX = pageW - margin - qrSize;
  const qrY = margin + 20;
  try {
    const qr = await projectQrDataUrl(project.id, 512);
    doc.addImage(qr, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFontSize(7.5);
    doc.setTextColor(...grey);
    doc.text('Scan to open online', qrX + qrSize / 2, qrY + qrSize + 10, { align: 'center' });
  } catch {
    /* QR generation failed — continue without it */
  }

  // Keep body text clear of the QR block.
  const bodyW = qrX - margin - 16;

  // ── Authors / advisor ────────────────────────────────────
  const field = (label: string, value: string) => {
    if (!value) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...brand);
    doc.text(label, margin, (y += 16));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...ink);
    const lines = doc.splitTextToSize(value, bodyW);
    doc.text(lines, margin, (y += 12));
    y += (lines.length - 1) * 12;
  };

  field('Authors', project.authorsText || '—');
  if (project.supervisorName) field('Supervisor', project.supervisorName);
  if (project.keywords?.length) field('Keywords', project.keywords.join(', '));

  // ── Abstract ─────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...brand);
  doc.text('Abstract', margin, (y += 20));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...ink);
  const absLines = doc.splitTextToSize(project.abstract || '—', contentW);
  // Cap the abstract so the card stays one page.
  const maxLines = Math.floor((pageH - y - 120) / 13);
  const shown = absLines.slice(0, Math.max(6, maxLines));
  doc.text(shown, margin, (y += 14));
  y += shown.length * 13;
  if (absLines.length > shown.length) {
    doc.setTextColor(...grey);
    doc.setFontSize(9);
    doc.text('… (full abstract available online)', margin, (y += 4));
    y += 10;
  }

  // ── Citation footer ──────────────────────────────────────
  const cite = formatCitation(project, 'IEEE');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageH - 96, pageW - margin, pageH - 96);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...brand);
  doc.text('CITE (IEEE)', margin, pageH - 82);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...ink);
  doc.text(doc.splitTextToSize(cite, contentW), margin, pageH - 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grey);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.text(`Generated ${stamp} · TU Project Archive`, margin, pageH - 28);

  doc.save(`${slug(project.title)}-thesis-card.pdf`);
}
