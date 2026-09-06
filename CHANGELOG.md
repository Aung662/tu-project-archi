# Changelog

All notable changes to **TU Project Archive & Title Similarity Checker**. Grouped by build wave;
newest first. Dates are the project timeline (Asia/Yangon).

## [Unreleased] — Contact / how-to-buy (2026-09-06)
- Added a **Contact** page (`/contact`) with all channels: Phone, Viber, Messenger, Telegram, Email + available hours and a "include the project title" note.
- Central `frontend/src/lib/contact.ts` holds all contact details in ONE place (placeholder values — edit these with the real phone/links/email); empty fields auto-hide.
- Added **Contact** link to the Navbar (desktop + mobile) and the Footer.
- Added a "Prefer to buy directly? Contact us" block inside the purchase panel on every project detail page, with a one-tap call button and link to /contact.
- New i18n keys (MY/EN) for all of the above.

## [Unreleased] — Welcome greeting copy (2026-09-06)

### Changed
- **Welcome overlay greeting** now reads **"Welcome To My Project Library"** for first-time
  visitors (the animated couple + sparkles remain). Signed-in users still get a personalised
  "Welcome back, {name}!". Greeting, body and button are now translated (EN/မြ) via the i18n system
  so they follow the language switch.

## [Unreleased] — Hero CTAs, navigation & all-titles list (2026-09-06)

### Added
- **All Project Titles page (`/titles`).** A single numbered list of every project title in the
  archive (fetches all pages, sorted A→Z), with a live title filter and a count. Each row links to
  the project detail. Reachable from the navbar (**All Titles**) and a button on the Browse page.
- **Floating "Back to top" button.** Appears after scrolling down; smooth-scrolls to the top. Global,
  bottom-right, above the footer.
- **Prominent "← Back to Dashboard" button** on every admin sub-page (hidden on the dashboard home).

### Changed
- **Redesigned hero call-to-action buttons.** The two hero buttons are now large 3D bevelled
  rounded-rectangles with deep, rich color (indigo & plum), a raised highlight/lip, and hover lift.
  Renamed: *Browse by year & university* → **Project Library**; *Run a full duplicate check* →
  **Search Same Titles**.
- Navbar gains an **All Titles** link (desktop + mobile).

## [Unreleased] — Short video uploads via Cloudinary (2026-09-06)

### Added
- **Project demo videos (Cloudinary-hosted).** Admins can now upload one or more short
  video clips (MP4/WebM/MOV, up to 50 MB) per project. Videos are uploaded straight to the
  Cloudinary CDN — the database stores only the delivery URL, an auto-generated poster
  frame, and lightweight metadata (never the video bytes, which would bloat Postgres).
  - New `ProjectVideo` model + relation on `Project`.
  - Backend: `POST/GET /api/images/project/:id/videos`, `DELETE /api/images/videos/:id`,
    and `GET /api/images/video-config` (reports whether hosting is enabled). Deleting a
    video also removes the asset from Cloudinary.
  - Project detail responses now include a `videos` array; the detail page shows a new
    🎬 **Video** tab with an HTML5 player (poster + controls).
  - Admin image manager gains a video upload/delete section.
- **Graceful degradation.** Cloudinary is fully optional. Without the `CLOUDINARY_*` env
  vars the app runs unchanged: the upload control shows a clear "not configured" note and
  the upload API returns a clean HTTP 400 (never a crash). Configure `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (+ optional `VIDEO_MAX_BYTES`) to enable it.
- Backend tests grown to **57 passing** (+5): video-config, public video list, RBAC on
  video upload, clean-400 when unconfigured, and `videos` present in project detail.

## [Unreleased] — Universal project covers + seed backfill fix (2026-09-06)

### Fixed
- **Demo/project thumbnails missing on the live site.** The seeder skipped cover
  attachment for any project that already existed (`if (exists) continue`), so after the
  first deploy every demo project showed no image. The seed now always ensures media on
  demo rows (idempotent), backfilling covers that were never attached.

### Added
- **Universal topic-cover backfill.** After seeding, every PUBLISHED project with zero
  images — including projects created by real users through the app — is given a relevant,
  keyword-matched cover (e.g. titles containing "waste/recycle" → the smart-waste-robot
  cover, "agriculture/irrigation" → the smart-agri cover, etc.), with a neutral academic
  default as a last resort. The browse grid therefore never shows a bare placeholder.
- **New topic cover asset** `smart-waste-robot.jpg` for the Smart Waste AI Guidance Robot
  projects (AI sorting robot + wet/dry/recyclable/hazardous bins).

### Notes — media uploads (video) & storage
- Uploads remain restricted to `pdf, doc, docx, zip, jpg, jpeg, png` (max 25 MB); video
  files are safely rejected (HTTP 400) rather than stored. Images are kept as bytes in the
  DB, which is fine for thumbnails but unsuitable for video. Recommended path for video:
  object storage (Cloudinary / Supabase Storage / Backblaze B2 / Cloudflare R2) with only a
  URL in the DB, or an unlisted YouTube/Vimeo embed. Personal Gmail/Drive is not recommended
  as a storage backend (ToS/OAuth-secret/rate-limit concerns).

## [Unreleased] — UX/professionalism audit + language switcher (2026-09-06)

### Added
- **Runtime language switcher (EN ⇄ မြ).** The whole UI can now be flipped between English (default)
  and Burmese from a compact toggle in the navbar (desktop and mobile). Implemented with a
  module-level current-language variable read through a new `tr()` translator, plus a
  `LanguageProvider` that remounts the app subtree on change — so every one of the ~300 label sites
  updates at once without threading a hook through each file. The preference persists
  (`localStorage`), and English is the SSR default so there is no hydration mismatch. This finally
  surfaces the full Burmese translation set that previously shipped but was never rendered.

### Fixed
- **Duplicate-title anti-pattern removed.** The home hero, the error boundary, and the 404 page each
  rendered the same heading text twice (title shown again as its own subtitle). Now each shows its
  title once with the intended descriptive subtitle.
- **Error page theming.** The error boundary's warning icon used a light `bg-red-50` circle that
  clashed with the dark UI; replaced with a dark-friendly red tint + ring.
- **Tablet navigation dead zone.** Primary nav links were hidden until `md` while the hamburger only
  appeared below `sm`, leaving tablet-width users (sm–md) with no navigation. Nav links now appear
  from `sm`, matching the action bar.
- **Already-signed-in users no longer see the login form.** Visiting `/login` while authenticated now
  redirects to the intended destination (or the admin dashboard for admins via the hidden portal).
- **Keyboard-friendly duplicate check.** The title check textarea now submits on Enter (Shift+Enter
  inserts a newline), and the button is disabled while the field is empty.

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
