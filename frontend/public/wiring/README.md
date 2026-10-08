# Public wiring assets

Only assets that have passed the source/pin review belong under `frontend/public/wiring/`.

## Current policy

- `manifest.json` is the **approved image** index consumed by the UI. It is currently `{}` because the available Flow-generated images have not been checked for electrical accuracy.
- `verified/` contains self-contained, source-backed Fritzing-style SVG diagrams generated from `src/data/verifiedWiring.json` and the pinned source parts. The build checks every board/module connector ID and places each wire at that connector's coordinates.
- `gallery.json` is currently `[]`; no extra *static* candidate image gallery is published. The user-facing searchable library is separate and database-backed (`WiringImage`), served by `/api/images/wiring`; newly uploaded items stay private until super-admin review.
- The UI must not label an image as “real” or “verified” simply because its URL returns 200. Database library entries are labelled reference-only.

## Candidate images are deliberately not public

The 338 images recovered from the existing live deployment are stored in:

`frontend/quality/wiring-review/candidates/`

Their HTTP status, content type, JPEG signature, byte length, and SHA-256 were checked. That is **download integrity only**, not a check of board revision, sensor artwork, wire endpoints, pin labels, supply voltage, or electrical safety. The review matrix records 337 `PENDING` images and one visibly inaccurate Uno/LDR image as `REJECTED`; zero candidate photos are approved or published.

The organizer/rebuild scripts write to this non-public candidate area. They never write into `public/wiring/`. Use `frontend/quality/wiring-review/review-matrix.csv` to record per-pair review. Promotion requires exact hardware identification, a source URL, a named reviewer, and passing each checklist field; the quality validator rejects an unreviewed public manifest.

## Rebuild the source-backed diagrams

From `frontend/`:

```bash
npm run build:wiring
npm run check:wiring
```

The generator embeds the cited Fritzing artwork, resolves connector locations from the source `.fzp` and breadboard SVG files, verifies that every recipe wire connects unique board/module pins, and writes self-contained SVG files under `public/wiring/verified/`.

The current curated recipe is **Arduino Uno R3 ↔ HC-SR04**:

- Uno `5V` → HC-SR04 `VCC`
- Uno `GND` → HC-SR04 `GND`
- Uno `D9` → HC-SR04 `TRIG`
- Uno `D10` ← HC-SR04 `ECHO`

The UI shows this recipe as source-checked, includes the exact pin table and downloadable SVG, and warns not to reuse the direct ECHO connection on 3.3V-only boards. Other board/component combinations remain illustrative until separately reviewed.

## Attribution

The verified diagrams embed Fritzing parts from the version-pinned `fritzing/fritzing-parts` repository. Those graphics are licensed **CC BY-SA 3.0**. Per-part attribution, SHA-256-pinned source paths/revision, and the license are recorded in `docs/WIRING-ASSET-ATTRIBUTION.md` and `frontend/quality/wiring-review/fritzing-source/source-metadata.json`.
