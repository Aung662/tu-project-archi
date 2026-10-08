# Wiring image library — bulk import and review

## Purpose

The public `/wiring` page has one concise **Wiring** heading and two areas: wiring guides and a searchable image library. Uploaded files do not need to be renamed. The public card title is always `Wiring`; the board and optional batch keywords are shown as useful filters. Source filenames and folder paths are normalized into a hidden search index and are never returned by the public API.

The image library is a **reference gallery, not a verified pinout database**. A green verification mark is reserved for the separate source-checked wiring recipes. Uploaded images remain private until a platform administrator reviews and approves them.

## Upload from Windows

1. Deploy/run the updated frontend and backend, then sign in as a **platform (super) admin**.
2. Open `/admin/wiring` (Admin → Wiring images).
3. Choose **Folder** and select the local image folder, e.g. `D:\TU project\KK\arduino-uno`. In browsers without folder selection, choose multiple images instead.
4. Select a board if it applies to the whole folder; use **Other / mixed** for a mixed or unknown folder. Add optional comma/semicolon-separated search keywords for the whole batch. Image names are not edited; their searchable words are derived automatically.
5. Click **Upload to Wiring**. The browser sends files in small sequential chunks. A selection may contain up to 1,000 images and 512 MB total; each image must be JPEG, PNG or WebP, no larger than 8 MB, and within a 50-megapixel decoding limit. Images are resized/re-encoded to WebP and stored in the database. SHA-256 deduplication makes retrying a partially completed selection safe.
6. In the review queue, inspect every selected thumbnail. Approve only images whose wiring content is not misleading and for which publishing rights are confirmed. Add a review note and check both attestations. Use the per-page select box for batches of up to 24; reject/remove anything unsuitable.
7. Approved images appear under `/wiring` → **Image library**. Users can search by board, shared keywords, and terms extracted from the original filename. If filenames are generic (for example `IMG_0001.jpg`), add useful batch keywords; the system does not infer components from pixels.

## API / lifecycle

- `POST /api/images/wiring/bulk` — super-admin only, up to 8 images per request; all new records start `PENDING`.
- `GET /api/images/wiring/admin` and `/admin/:id/file` — protected moderation list and previews.
- `POST /api/images/wiring/review-batch` — atomic approval/rejection of currently pending items. Approval requires both content and rights checks plus a note.
- `GET /api/images/wiring` and `/wiring/:id` — public listing/bytes for `APPROVED` items only.
- `DELETE /api/images/wiring/:id` — super-admin removal.

The public response intentionally omits the original filename, local directory, hidden search text, SHA-256 and pending images. Reference-gallery cards display a datasheet/safety notice and never claim the uploaded image is electrically verified. The existing curated Uno R3 ↔ HC-SR04 SVG remains separately source-attributed and checked.

## Existing candidate workflow remains separate

The static candidate importer in `docs/FLOW-AI-UPLOAD-TO-WEBSITE.md` stages AI-generated assets under `frontend/quality/wiring-review/candidates/` and requires its pin-level/source/rights review before promotion. Do not bypass that release gate by copying generated candidates directly into `public/` or treating them as verified diagrams.
