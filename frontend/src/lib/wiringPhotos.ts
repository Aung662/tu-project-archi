/**
 * wiringPhotos.ts — runtime loader for the REAL Flow-generated wiring photos.
 *
 * The photos live in `frontend/public/wiring/<board>__<component>.jpg` and are
 * indexed by `frontend/public/wiring/manifest.json`, which the PC helper script
 * `scripts/organize-wiring-images.mjs` writes after renaming + compressing the
 * Google Flow downloads. Shape:
 *
 *   { "<boardId>": { "<componentId>": "<boardId>__<componentId>.jpg" }, ... }
 *
 * The manifest is fetched once (client-side) and cached. Until any photos are
 * added it is simply `{}`, so every lookup returns null and the UI falls back
 * to the auto-generated Fritzing-style SVG — nothing breaks with a partial set.
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

/** Public URL of the real wiring photo for a board×component pair, or null. */
export function wiringPhotoUrl(
  manifest: WiringManifest | null,
  boardId: string,
  componentId: string,
): string | null {
  const file = manifest?.[boardId]?.[componentId];
  return file ? `/wiring/${file}` : null;
}

/** How many real photos exist for a given board (0 when none). */
export function wiringPhotoCount(manifest: WiringManifest | null, boardId: string): number {
  return manifest?.[boardId] ? Object.keys(manifest[boardId]).length : 0;
}
