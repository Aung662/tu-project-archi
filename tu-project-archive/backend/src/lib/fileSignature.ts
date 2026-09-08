import { openSync, readSync, closeSync } from 'node:fs';

/**
 * Magic-byte (file signature) validation.
 *
 * Why: Multer's fileFilter only sees the CLIENT-DECLARED `Content-Type` and the
 * filename extension, both of which are trivially spoofable. An attacker can
 * rename `evil.html` to `evil.pdf` and send `Content-Type: application/pdf`.
 * After the file is on disk we re-open it and confirm the real leading bytes
 * match the claimed extension. If they don't, the caller deletes the file and
 * rejects the request.
 *
 * Notes on the container formats:
 * - .docx and .zip are BOTH ZIP containers, so both start with "PK" (0x50 0x4B).
 *   We validate the ZIP signature for either; distinguishing docx-vs-zip beyond
 *   that would require unzipping, which is out of scope for an upload gate.
 * - .doc (legacy OLE2) starts with D0 CF 11 E0 A1 B1 1A E1.
 * - .pdf starts with "%PDF-".
 * - images: png = 89 50 4E 47, jpg = FF D8 FF.
 */

type Sig = { bytes: number[]; offset?: number };

const SIGNATURES: Record<string, Sig[]> = {
  pdf: [{ bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }], // %PDF-
  // ZIP-based (docx is a zip); accept the three common ZIP markers.
  zip: [
    { bytes: [0x50, 0x4b, 0x03, 0x04] },
    { bytes: [0x50, 0x4b, 0x05, 0x06] }, // empty archive
    { bytes: [0x50, 0x4b, 0x07, 0x08] }, // spanned
  ],
  docx: [
    { bytes: [0x50, 0x4b, 0x03, 0x04] },
    { bytes: [0x50, 0x4b, 0x05, 0x06] },
    { bytes: [0x50, 0x4b, 0x07, 0x08] },
  ],
  doc: [{ bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }], // OLE2
  png: [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  jpg: [{ bytes: [0xff, 0xd8, 0xff] }],
  jpeg: [{ bytes: [0xff, 0xd8, 0xff] }],
};

function readHead(absPath: string, length: number): Buffer {
  const fd = openSync(absPath, 'r');
  try {
    const buf = Buffer.alloc(length);
    const read = readSync(fd, buf, 0, length, 0);
    return buf.subarray(0, read);
  } finally {
    closeSync(fd);
  }
}

function matches(head: Buffer, sig: Sig): boolean {
  const offset = sig.offset ?? 0;
  if (head.length < offset + sig.bytes.length) return false;
  for (let i = 0; i < sig.bytes.length; i++) {
    if (head[offset + i] !== sig.bytes[i]) return false;
  }
  return true;
}

/**
 * Buffer-based magic-byte check for uploaded IMAGES held in memory (project
 * gallery / 360° frames are stored in the DB, never written to disk first).
 * Confirms the real leading bytes match one of the accepted image MIME types.
 * WebP is a RIFF container: bytes 0-3 = "RIFF", bytes 8-11 = "WEBP".
 */
export function imageBufferMatchesMime(buf: Buffer, mime: string): boolean {
  switch (mime) {
    case 'image/png':
      return matches(buf, { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] });
    case 'image/jpeg':
      return matches(buf, { bytes: [0xff, 0xd8, 0xff] });
    case 'image/webp':
      return (
        matches(buf, { bytes: [0x52, 0x49, 0x46, 0x46] }) && // "RIFF"
        matches(buf, { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }) // "WEBP"
      );
    default:
      return false;
  }
}

/**
 * Returns true if the file at `absPath` has leading bytes consistent with `ext`.
 * Unknown extensions return false (fail closed).
 */
export function fileMatchesExtension(absPath: string, ext: string): boolean {
  const sigs = SIGNATURES[ext.toLowerCase()];
  if (!sigs) return false;
  const maxLen = Math.max(...sigs.map((s) => (s.offset ?? 0) + s.bytes.length));
  let head: Buffer;
  try {
    head = readHead(absPath, maxLen);
  } catch {
    return false;
  }
  return sigs.some((s) => matches(head, s));
}
