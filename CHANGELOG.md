# Changelog

All notable changes to **TU Project Archive & Title Similarity Checker**. Grouped by build wave;
newest first. Dates are the project timeline (Asia/Yangon).

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
