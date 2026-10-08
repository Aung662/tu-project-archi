# Google Flow wiring-image candidates: safe review workflow

> For a normal owner-uploaded photo folder, use the super-admin bulk library at `/admin/wiring`; see `docs/WIRING-BULK-IMAGE-IMPORT.md`. Those uploads are database-backed and are kept pending until reviewed. The static generated-candidate workflow below remains separate and is stricter: exact board/component, pinout, safety, rights and sources must be checked before promotion.

> **Important:** the organizer does not publish images. Google Flow output can have wrong boards, invented labels, missing power/ground, and unsafe wiring. Treat every render as an unverified candidate until a human checks its exact hardware and connections. One sampled Uno/LDR candidate has already been rejected; the rest remain pending.

## Current state

- 338 recovered candidate images are kept in `frontend/quality/wiring-review/candidates/`, outside the public website directory.
- Review matrix: 337 `PENDING`, one `REJECTED`, zero `APPROVED` image assets.
- `frontend/public/wiring/manifest.json` is `{}`. Do not copy candidates into it to make images appear.
- The one source-backed published diagram is Uno R3 + HC-SR04 at `frontend/public/wiring/verified/arduino-uno__hc-sr04.svg`. Other board/module combinations remain illustrative until reviewed.

## 1. Organize a new Flow export into quarantine

Use Node.js 20+ from the project root. The organizer only adds candidates to the review area; it preserves existing files, merges the index, and registers new/changed pairs as `PENDING`. Re-running it never replaces a reviewed candidate in place; a repeated render is retained as a quarantined extra.

### Windows (PowerShell)

```powershell
node .\frontend\scripts\organize-wiring-images.mjs `
  "C:\Users\YOU\Downloads\GoogleFlowAutomator" `
  "C:\path\to\tu-project-archive"
```

### macOS / Linux

```bash
node frontend/scripts/organize-wiring-images.mjs \
  ~/Downloads/GoogleFlowAutomator \
  ~/tu-project-archive
```

The script may use the optional `sharp` package to resize/compress input files. Without it, it preserves the source format and copies the file uncompressed. Original downloads are not modified. When candidates have been copied or indexed manually, rebuild the **candidate index** (not the public manifest) and register it:

```bash
cd frontend
node scripts/rebuild-wiring-manifest.mjs "<repo-root>"
npm run register:wiring-review
```

Organizer/rebuild output is always under `frontend/quality/wiring-review/candidates/`.

## 2. Review the exact candidate bytes

Open `frontend/quality/wiring-review/review-matrix.csv`. Each row points to the staged file and its SHA-256. Review that image—not another render with the same filename. For `APPROVED`, a qualified human reviewer must set all nine checks to `YES`:

1. Exact board model/revision.
2. Exact sensor/module model.
3. Pin labels match authoritative references.
4. Every wire endpoint lands on the labelled connector.
5. Power and ground routing is correct and complete.
6. GPIO voltage, polarity, current and required level shifting/resistors are safe.
7. Image is legible and not misleading.
8. Written guidance agrees with the diagram.
9. Rights to publish the exact image are confirmed.

Also fill one or more authoritative HTTPS source URLs (separate multiple URLs with `;`), a named human reviewer, ISO date (`YYYY-MM-DD`), provenance and rationale. If any check is uncertain, leave the row `PENDING`; if wrong or unsafe, mark it `REJECTED` and explain why. Hash changes invalidate prior approval.

Refresh the summary and run the gate:

```bash
cd frontend
npm run sync:wiring-review
npm run check:wiring
```

`check:wiring` verifies candidate hashes, pair IDs, review completeness, public-manifest authorization and the absence of unindexed public images. It is a release control, not a substitute for electrical review.

## 3. Promote only an approved pair

A candidate must be `APPROVED` with every required check, source, rights, reviewer, date and notes completed. Preview the operation first:

```bash
npm run promote:wiring -- arduino-uno hc-sr04 --dry-run
```

Then promote that exact row:

```bash
npm run promote:wiring -- arduino-uno hc-sr04
```

The promotion script checks the review row and candidate SHA-256, copies only that image, updates the public manifest/status, and reruns the release gate. On failure, public changes are rolled back. Do not manually copy, rename, or add candidate images to `frontend/public/wiring/`.

Before release, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Source-backed diagrams

Verified source-backed wiring diagrams use a separate curated recipe in `frontend/src/data/verifiedWiring.json`. `npm run build:wiring` resolves connector IDs from Fritzing part definitions, verifies pinned SHA-256 source files and attribution, and regenerates the self-contained SVG. `npm run check:wiring` confirms it is current. See `docs/WIRING-ASSET-ATTRIBUTION.md`.

## What not to do

- Do not label generated candidate art as a real photo, Fritzing diagram, or verified wiring merely because it looks realistic.
- Do not publish unmatched/duplicate/gallery images; they do not have an exact board+component review path yet.
- Do not add a wiring image with missing power/ground, ambiguous terminals, wrong pin labels, or unverified voltage compatibility.
- Do not claim deployment is complete until the updated code has been committed, pushed to the confirmed frontend host, and smoke-tested against the live site.
