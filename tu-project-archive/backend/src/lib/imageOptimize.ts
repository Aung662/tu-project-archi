import sharp from 'sharp';

/**
 * Downscale + re-encode an uploaded image before we store it in the DB and serve
 * it to every visitor. This is the single biggest page-speed win: a 5 MB phone
 * photo becomes ~150–300 KB WebP with no visible quality loss, so pages that
 * show galleries / 360° turntables load an order of magnitude faster.
 *
 * - GALLERY photos: cap the long edge at 1600px (plenty for full-screen view).
 * - SPIN frames: cap at 1024px — there are many of them and they're viewed small.
 * Output is always WebP (great compression, universal browser support today).
 */
export interface OptimizedImage {
  data: Buffer;
  mimeType: string;
  sizeBytes: number;
}

const MAX_EDGE = { GALLERY: 1600, SPIN: 1024 } as const;
const QUALITY = { GALLERY: 82, SPIN: 78 } as const;

export async function optimizeImage(
  input: Buffer,
  kind: 'GALLERY' | 'SPIN',
): Promise<OptimizedImage> {
  const maxEdge = MAX_EDGE[kind];
  const quality = QUALITY[kind];

  // `rotate()` with no args auto-applies EXIF orientation, then we strip metadata.
  const data = await sharp(input)
    .rotate()
    .resize(maxEdge, maxEdge, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  return { data, mimeType: 'image/webp', sizeBytes: data.length };
}
