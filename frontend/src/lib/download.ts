import { filenameFromDisposition } from './format';

/**
 * Result of an authenticated file download attempt. `ok` distinguishes success
 * from a typed failure reason so callers can show the right localized message
 * without duplicating status-code logic.
 */
export type DownloadResult =
  | { ok: true }
  | { ok: false; reason: 'forbidden' | 'unauthorized' | 'failed' };

/**
 * Download a project's paid file through the same-origin API proxy (the HttpOnly
 * auth cookie rides along automatically). Streams to a Blob, then triggers a
 * browser save using the server-provided filename (preserves the correct
 * extension and Unicode/Burmese names via RFC 5987).
 *
 * Centralized here so the project-detail page and the library page share ONE
 * implementation instead of copy-pasting fetch/blob/anchor plumbing.
 */
export async function downloadProjectFile(
  projectId: string,
  fallbackName = 'project',
): Promise<DownloadResult> {
  const res = await fetch(`/api/files/${projectId}/download`, { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 403) return { ok: false, reason: 'forbidden' };
    if (res.status === 401) return { ok: false, reason: 'unauthorized' };
    return { ok: false, reason: 'failed' };
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filenameFromDisposition(res.headers.get('Content-Disposition')) || fallbackName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
  return { ok: true };
}
