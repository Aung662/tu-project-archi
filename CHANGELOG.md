# Changelog

All notable changes to **TU Project Archive & Title Similarity Checker**. Grouped by build wave;
newest first. Dates are the project timeline (Asia/Yangon).

## [Unreleased] — Discovery features (2026-09-06)

### Added
- **"You might also like" related projects.** Each project detail page now shows up to 4 related
  projects via `GET /api/projects/:id/similar`, powered by the existing blended similarity scorer
  (title trigram/token/edit-distance) with a same-department → same-university fallback so the row is
  never empty. Never recommends the project itself.
- **Search autocomplete.** The home search box now suggests matching published titles as you type
  (`GET /api/projects/autocomplete`, debounced, min 2 chars), with keyboard navigation (↑/↓/Enter/Esc)
  and click-to-open; picking a suggestion jumps straight to that project.
- Backend tests grown to **52 passing** (+3): similar-projects (incl. never-self), autocomplete
  suggestions, and short-query empty guard.

## [Unreleased] — Welcome animation & universal thumbnails (2026-09-06)

### Added
- **Animated welcome overlay.** On first arrival each session, two 3D-style cartoon student
  greeters float in, wave and sparkle with a friendly message (personalised when logged in).
  framer-motion only — no heavy 3D engine or external assets, so it works in the sandboxed preview.
  Shown once per session (sessionStorage), dismissible, Esc-to-close, auto-hides. A render is picked
  at random from two character images.
- **Universal project thumbnails.** Projects without an uploaded cover now render an attractive,
  deterministic placeholder (themed gradient + department/topic emoji + title initials) via an inline
  SVG component, instead of a bare document glyph. Every project — including ones added later —
  always shows a proper tile.

## [Unreleased] — Admin usability fixes (2026-09-06)

### Added (round 2)
- **Cover image / thumbnail field** in the New/Edit Project form. Uploading here attaches a public
  GALLERY image (which becomes the tile thumbnail) immediately at create time — so admins no longer
  have to save, re-open, and use the image manager just to get a thumbnail. Clarified in the UI that
  this public cover is distinct from the paid project file.
- **Admins can view a DRAFT/ARCHIVED project's images.** `GET /api/images/project/:id` now uses
  `optionalAuth`: public callers still only see PUBLISHED projects' images, but an authenticated
  admin can list images before publishing (so the image manager works pre-publish). Anonymous access
  to unpublished images stays 404.

### Fixed
- **Project file upload rejected images.** The admin "Project file" uploader only accepted
  `pdf,doc,docx,zip`, so attaching a `.jpg`/`.png` failed with "File extension .jpg is not allowed".
  Added `jpg,jpeg,png` to `UPLOAD_ALLOWED_EXT` (code default + `.env`/`.env.example`); the
  magic-byte validator and MIME map already supported these, so the fix is safe. The form's
  `accept` list and a helper hint were updated to match.

### Added
- **Add university / department on the fly.** The New/Edit Project form's University and Department
  dropdowns now include an "➕ Add new…" option that reveals an inline form and calls the existing
  admin CRUD endpoints (`POST /api/admin/universities`, `POST /api/admin/departments`), then
  auto-selects the newly created record. Admins are no longer limited to the seeded list.

## [Unreleased] — Feature expansion: media, analytics, UX (2026-09-06)

### Added — Project media
- **`ProjectImage` model** (DB-binary storage) for public gallery photos + ordered 360° frames,
  surviving ephemeral-host redeploys without external object storage.
- **Images API** — public list (`/api/images/project/:id`) + cache-immutable single-image serve
  (`/api/images/:id`); admin upload (multi-file, magic-byte validated JPEG/PNG/WebP) & delete.
- **Frontend viewers** — `Gallery` (thumbnails + zoom lightbox), `SpinViewer` (drag / touch /
  arrow-key 360° turntable, frame preloading), `ProjectMedia` (Photos ⇄ 360° tabs). Cover
  thumbnails + `360°`/image-count badges on project cards. Admin `ProjectImageManager` in the
  project form. Flagship demo project seeded with 2 gallery photos + a 24-frame turntable.

### Added — Analytics & reporting
- **Rich admin dashboard** (`/api/admin/dashboard`): KPI totals, 14-day activity time series
  (views/searches/checks + unique estimates), projects-by-university and top-pages distributions.
  Dependency-free inline-SVG charts (render even in the sandboxed preview).
- **Privacy-light page-view tracking** — cookie-free beacon (`/api/analytics/pageview`) with
  dynamic-route normalization (`/projects/:id`); `PageViewTracker` fires on navigation.
- **CSV report exports** (UTF-8 BOM, Excel/Sheets-ready): search logs, duplicate-risk report, projects.

### Added — User experience
- **Bookmarks** — `Bookmark` model + `/api/bookmarks` CRUD, app-wide `BookmarksContext`, heart
  toggle on cards & detail, "Saved projects" section in *My Library*.
- **Password reset** — single-use SHA-256-hashed, 30-minute tokens; `/auth/forgot-password` +
  `/auth/reset-password` (no user enumeration; dev returns the token, prod would email it);
  `/forgot-password` page + "Forgot password?" link.
- **Advanced browse filters** — price range, free-only, has-file, and sort (newest/oldest/price/title).
- **Dark / light theme toggle** — persisted, pre-paint applied (no FOUC), via a `[data-theme]`
  CSS override layer; navbar sun/moon button.
- **UI language switched to English** (was Burmese-first); bilingual label store retained for future.
- **PWA manifest** refreshed for the dark theme + English shortcuts.

### Tests
- Backend suite grown to **49 passing** (+10): image set, admin-only image upload guard, pageview
  beacon, dashboard series, CSV export, bookmark lifecycle, password-reset flow (incl. single-use +
  no-enumeration), advanced filter ordering.

## [Unreleased] — Bug-fix, requirement-coverage & thesis-polish wave (2026-09-03)

### Fixed (bugs & flow gaps found by the adversarial audit)
- **CRITICAL: admins can now view payment proofs.** Added `GET /api/admin/payments/:id/proof`
  (admin-only, streams the screenshot inline), exposed `hasProof` in the payments list (without
  leaking the private storage key), and added a "View proof" link in the admin payments table.
  Manual MMK verification is now an actual verification, not blind approval.
- **Session lifetime drift.** The auth cookie `maxAge` is now derived from `JWT_EXPIRES_IN`
  (single source), eliminating the window where the cookie outlived the JWT and caused silent 401s.
  Standardized session length to `6h`.
- **Orphaned private files.** Re-uploading a payment proof now deletes the previous file, and
  deleting a project now removes its stored file **and** all cascaded payment-proof files.
- **User enumeration (timing).** The failed-login path now compares against a valid dummy bcrypt
  hash instead of a malformed one, so "no such user" takes the same time as "wrong password".
- **Unicode/Burmese download filenames.** `Content-Disposition` now uses RFC 5987
  (`filename*=UTF-8''…`) so non-ASCII project titles download with correct names.
- **Payment method free-text.** Order `method` is now an enum (`KBZPay`/`WavePay`/`AYAPay`/
  `CBPay`/`BankTransfer`); frontend `<select>` values aligned to match exactly.

### Security
- **Production boot guards (fail-fast):** the API refuses to start in production if
  `COOKIE_SECURE=false`, if `SEED_ADMIN_PASSWORD` is missing/default, or if `JWT_SECRET` < 32 chars.
- **Content-Security-Policy** added: strict CSP via Helmet on the API and via `vercel.json` headers
  on the frontend; added `Permissions-Policy`.
- **Audit paid-file downloads** (`FILE_DOWNLOADED`) — the copyright-sensitive archive now trails who
  downloaded what (previously only uploads were audited).
- `robots.txt` disallows `/admin`, `/portal-hidden-access`, `/library`, `/api/`.

### Performance
- Added `@@index([createdAt])` to `PaymentOrder` and `AuditLog`, plus a composite
  `@@index([status, createdAt])` on `PaymentOrder` for the admin queue (both schema files).

### Refactor (thesis-presentation quality)
- Extracted a reusable `lib/download.ts` (`downloadProjectFile`) — removed duplicated
  fetch/blob/anchor download logic from the project-detail and library pages.
- Added `lib/http.ts` `contentDispositionAttachment()` helper (shared by file + proof endpoints).
- Replaced the admin reject `prompt()` with a styled, localized modal; added an approve confirmation
  and typed success/error banners with auto-dismiss.

### Docs
- New `docs/12-ADVERSARIAL-AUDIT.md` (QA + security + performance), `docs/13-REQUIREMENT-COVERAGE.md`
  (line-by-line matrix), and this `CHANGELOG.md`.
- Updated README, `07-TESTING-QA.md` (39 tests), and `08-DEPLOYMENT.md` (boot guards, session TTL).

### Tests
- **39/39 passing** (was 31): +8 covering the full payment lifecycle and proof review, method-enum
  rejection, `hasProof` exposure without key leakage, admin proof streaming, and non-admin denial.

---

## Wave 6 — PWA, UX polish, deployment & final documentation (2026-09-03)
- Installable PWA: PNG/maskable icons, enriched manifest, service worker (offline fallback, SWR
  assets, API never cached), install prompt.
- App Router state boundaries: `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`,
  `/offline`; reusable skeleton loaders; responsive polish.
- Deployment configs: `render.yaml`, `frontend/vercel.json`, `backend/railway.json`,
  `backend/Dockerfile` + `.dockerignore`; hardened `.gitignore`; `frontend/.env.example`.
- Docs: `10-ARCHITECTURE-SUMMARY.md`, `11-THESIS-DEFENSE-NOTES.md`.

## Wave 5 — Security hardening
- Magic-byte upload validation; pinned JWT `HS256`; DB role re-check (stale-role defense); auth
  event auditing; upload/search rate limiters; forced secure cookies in prod; `SearchLog` analytics
  + admin analytics tab; malformed-JSON/Prisma error mapping; stricter auth schemas.

## Waves 1–4 — Core build
- Decoupled Next.js + Express + Prisma app; similarity engine (trigram/token/edit blend) with
  dual SQLite-dev / pg_trgm-prod paths; auth + RBAC; projects CRUD + consent gate; manual MMK
  payment flow + protected paid-file downloads; admin dashboard; Burmese-first i18n across the UI;
  seed data; unit + integration tests.
