# Wiring candidate review quarantine

This folder contains source material and unapproved assets for the wiring-quality workstream. It is **not** under `public/`, is not imported by the frontend, and must not be exposed as a public static directory.

## What's here

- `candidates/` — 338 preserved images downloaded from the previous live wiring manifest. The assets were checked for successful HTTP download, JPEG signature, byte length and SHA-256. That is transfer integrity only, not electrical validation.
- `candidates/manifest.json` and `candidates/gallery.json` — candidate indexes; neither is loaded by the application.
- `download-integrity.json` — original live URL and download-integrity metadata for all 338 files.
- `review-matrix.csv` — one row per board/module candidate pair. Current disposition: 337 `PENDING`, one `REJECTED`, zero `APPROVED`.
- `review-status.json` — machine-readable summary; refresh it with `npm run sync:wiring-review` after matrix changes.
- `fritzing-source/` — pinned Fritzing part files/artwork, SHA-256 metadata, and upstream license notice used by the separately source-checked Uno/HC-SR04 diagram.

## Candidate review requirements

Review a specific image at its exact SHA-256. Do not approve it based only on its filename, generated title, recognizable board silhouette, or successful URL. A qualified human reviewer should verify all of these against the exact hardware revision and reliable sources:

1. Board model/revision and module/sensor model are identifiable and match the row.
2. Every wire endpoint lands on the displayed, correctly labelled physical connector.
3. Power and ground connections are present, correctly routed, and consistent with the recipe.
4. GPIO voltage, interface levels, polarity, current limits, and any required resistors/level shifters are safe for that exact pairing.
5. Pin guidance matches authoritative datasheet/manufacturer sources; record stable HTTPS source URLs.
6. The image is legible and internally consistent with the written connection guidance; no misleading generated labels/artifacts remain.
7. Rights to publish the exact image are confirmed, and reviewer, ISO date, and concise rationale are recorded.

The CSV has nine checks that must each be `YES` before a row can be `APPROVED`: exact board model, exact module model, pin labels, wire endpoints, power/ground, voltage safety, legibility, text consistency, and rights. Approval alone does not publish an image; it only makes it eligible for the promotion command. Rejected assets remain quarantined.

After editing the matrix, run:

```bash
npm run sync:wiring-review
npm run check:wiring
```

Then, and only for a row marked `APPROVED`, preview the exact promotion:

```bash
npm run promote:wiring -- <boardId> <componentId> --dry-run
```

Promote it with the same command without `--dry-run`:

```bash
npm run promote:wiring -- <boardId> <componentId>
```

The promotion command checks reviewer/source fields and the exact image hash, copies only that file, updates the public manifest/status atomically, and runs the quality gate. If validation fails, the public file/manifest changes are rolled back. Do not manually copy candidate images into `public/wiring/`.

The gate verifies candidate hashes and matrix completeness, blocks public images without matching `APPROVED` rows, requires public bytes to equal the reviewed candidate, and rejects any unindexed image in the static folder. It does not replace the human review.

## Organizing newly recovered images

From `frontend/` run:

```bash
node scripts/organize-wiring-images.mjs <flow-images-folder> <repo-root>
node scripts/rebuild-wiring-manifest.mjs <repo-root>
```

These commands write only to `quality/wiring-review/candidates/`. They never publish files. The organizer merges its candidate index and runs `register-wiring-candidates.mjs`; rebuilding an index also registers it. New pairs are automatically recorded as `PENDING` with a SHA-256/provenance entry. A changed hash resets that pair to `PENDING`, while a change to a download-ledger asset is refused so the original evidence cannot be overwritten. A hash change invalidates prior review. Never replace a reviewed candidate silently.

## Source-checked diagram workflow

The curated Uno + HC-SR04 diagram is a separate path: `src/data/verifiedWiring.json` records exact connector IDs, official reference sources and wire routes. `scripts/build-verified-wiring-diagrams.mjs` reads the pinned Fritzing FZP/SVG files, checks every connector marker, then produces an attributed self-contained SVG under `public/wiring/verified/`. Run `npm run build:wiring` to regenerate and `npm run check:wiring` to verify it is current. See `docs/WIRING-ASSET-ATTRIBUTION.md`.
