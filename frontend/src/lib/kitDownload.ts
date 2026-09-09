import { filenameFromDisposition } from './format';

/**
 * Download a purchased Website Kit zip through the same-origin API proxy. The
 * HttpOnly auth cookie rides along automatically; the server enforces that the
 * buyer has an APPROVED order (or is an admin) before streaming the private zip.
 */
export async function downloadKit(kitId: string, fallbackName = 'kit.zip'): Promise<void> {
  const res = await fetch(`/api/kits/${kitId}/download`, { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 403) throw new Error('You have not purchased this kit yet.');
    if (res.status === 401) throw new Error('Please log in to download.');
    throw new Error('Download failed. Please try again.');
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
}
