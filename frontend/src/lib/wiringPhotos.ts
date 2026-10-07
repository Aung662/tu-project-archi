/**
 * Runtime loader for individually reviewed wiring-image assets.
 *
 * Public files live under `frontend/public/wiring/` and are indexed by
 * `manifest.json`. The organizer writes only quarantined candidates; a
 * hash-locked human review and promotion command is required before an image
 * enters this public manifest. Entries may be generated illustrations, not
 * photographs or source-checked diagrams. An empty manifest safely falls back
 * to the source-checked recipe (when available) or a labelled illustration.
 */

export type WiringManifest = Record<string, Record<string, string>>;

let cache: WiringManifest | null = null;
let inflight: Promise<WiringManifest> | null = null;

/** Fetch + cache the manifest. Safe to call repeatedly; dedupes concurrent calls. */
export async function loadWiringManifest(): Promise<WiringManifest> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch('/wiring/manifest.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : {}))
    .then((json: WiringManifest) => {
      cache = json && typeof json === 'object' ? json : {};
      return cache;
    })
    .catch(() => {
      cache = {};
      return cache;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Public URL of an approved image for a board×component pair, or null. */
export function wiringPhotoUrl(
  manifest: WiringManifest | null,
  boardId: string,
  componentId: string,
): string | null {
  const file = manifest?.[boardId]?.[componentId];
  return file ? `/wiring/${file}` : null;
}

/** Number of approved image assets for a board (0 when none). */
export function wiringPhotoCount(manifest: WiringManifest | null, boardId: string): number {
  return manifest?.[boardId] ? Object.keys(manifest[boardId]).length : 0;
}

// ---------------------------------------------------------------------------
// Optional public gallery. Candidate extras/duplicates remain in the quality
// quarantine and must never be exposed merely because they exist. The current
// quality gate keeps this published index empty until each item can be reviewed
// against an exact board/module pairing and its source/pinout.
// ---------------------------------------------------------------------------
export interface WiringGalleryItem {
  /** Path relative to /wiring, e.g. "gallery/esp32__g-2.jpg". */
  file: string;
  /** Board id when it could be recognised, else null ("other"). */
  board: string | null;
}

let galleryCache: WiringGalleryItem[] | null = null;
let galleryInflight: Promise<WiringGalleryItem[]> | null = null;

/** Fetch + cache the gallery index. Returns [] when none exists yet. */
export async function loadWiringGallery(): Promise<WiringGalleryItem[]> {
  if (galleryCache) return galleryCache;
  if (galleryInflight) return galleryInflight;
  galleryInflight = fetch('/wiring/gallery.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : []))
    .then((json: WiringGalleryItem[]) => {
      galleryCache = Array.isArray(json) ? json : [];
      return galleryCache;
    })
    .catch(() => {
      galleryCache = [];
      return galleryCache;
    })
    .finally(() => {
      galleryInflight = null;
    });
  return galleryInflight;
}

/** Public URL for a gallery file. */
export function wiringGalleryUrl(item: WiringGalleryItem): string {
  return `/wiring/${item.file}`;
}
