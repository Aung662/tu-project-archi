# 13 — Requirement Coverage Matrix (line-by-line vs. the original brief)

Every requirement from the original brief, checked against the **actual code** after the bug-fix
wave. `Implemented?` = Yes / Partial / No. Nothing is skipped silently; every Partial/No has a gap
note and the fix taken (or an explicit, justified scope decision).

## A. Core product features

| # | Requirement | Implemented? | Where | Gap → Fix |
|---|-------------|--------------|-------|-----------|
| A1 | Search project titles | **Yes** | `search.service.ts` `searchSimilar`, `search.routes.ts` `/api/search`, `app/page.tsx` | — |
| A2 | Detect exact/similar previous titles, ranked | **Yes** | `similarity.ts` blended scorer, banded EXACT/SIMILAR, sorted desc | — |
| A3 | Duplicate-risk check before proposing a title | **Yes** | `checkDuplicate`, `/api/search/check`, `app/check/page.tsx` | — |
| A4 | Browse by year / university / level / department | **Yes** | `projects.service.ts` `browseProjects`, `app/browse/page.tsx` | — |
| A5 | View project summaries | **Yes** | `getProjectDetail`, `app/projects/[id]/page.tsx` | — |
| A6 | Purchase full-file access via manual MMK verification | **Yes** (was **Partial**) | `payments.*`, `PurchasePanel.tsx`, `admin/payments/page.tsx` | **Gap:** admins couldn't view the uploaded proof, so "verification" was blind. **Fix:** added `GET /api/admin/payments/:id/proof` + `hasProof` in list + proof link in admin UI (QA-C1). |
| A7 | Admin manages records / files / payments / access | **Yes** | `admin.routes.ts` (projects CRUD, payments approve/reject/**proof**, users, unis/depts, audit, analytics) | — |

## B. Access & product rules

| # | Requirement | Implemented? | Where | Gap → Fix |
|---|-------------|--------------|-------|-----------|
| B1 | Browsing/searching without login | **Yes** | `projects.routes.ts` & `search.routes.ts` use `optionalAuth`, never `requireAuth` | — |
| B2 | Purchasing requires login | **Yes** | `payments.routes.ts` `paymentsRouter.use(requireAuth)` | — |
| B3 | Admin dashboard not public | **Yes** | `adminRouter.use(requireAuth, requireAdmin)` + client guard in `admin/layout.tsx` | — |
| B4 | 3-click logo trigger + `/portal-hidden-access` are hidden UI only (not security) | **Yes** | `Navbar.tsx`, `app/portal-hidden-access/`; real gate is server-side | — |
| B5 | Seed/env for initial admin (never hardcoded) | **Yes** (hardened) | `seed.ts` reads `SEED_ADMIN_*`; `env.ts` now **fails boot** in prod if password is default/missing (SEC-14) | — |
| B6 | Server-side PurchaseAccess protects paid files (never static-served) | **Yes** | `files.routes.ts` `/download` + `PurchaseAccess` check; files stored outside any static dir | — |
| B7 | `has_consent = true` required before publishing | **Yes** | `projects.service.ts` publish guard; tested | — |
| B8 | Normalized titles + ranked similarity | **Yes** | `normalize.ts`, stored `normalizedTitle`, `@@index` + pg_trgm GIN | — |

## C. Technical stack

| # | Requirement | Implemented? | Where | Gap → Fix |
|---|-------------|--------------|-------|-----------|
| C1 | Next.js (React + TS) + Tailwind, responsive | **Yes** | `frontend/` Next 15 App Router, Tailwind | — |
| C2 | PWA-ready | **Yes** | `manifest.webmanifest`, `sw.js`, icons, offline page, install prompt | — |
| C3 | Node + Express REST API (TS) | **Yes** | `backend/` Express 5 ESM TS | — |
| C4 | PostgreSQL + pg_trgm + Prisma | **Yes** (prod) | `postgres-extensions.sql` GIN; dual SQLite-dev path documented (C3 sanity-check) | — |
| C5 | JWT in HttpOnly cookies + bcrypt | **Yes** | `auth.service.ts` (HS256 pinned, bcrypt 12), cookie `httpOnly`/`secure`/`sameSite` | — |
| C6 | Multer uploads (MIME + ext whitelist + size limit) | **Yes** (exceeded) | `upload.ts` + `fileSignature.ts` **magic-byte** validation | — |
| C7 | Deploy: FE→Vercel, BE→Render/Railway, DB→Neon/Supabase | **Yes** | `vercel.json`, `render.yaml`, `railway.json`, `Dockerfile`, `08-DEPLOYMENT.md` | — |

## D. Required output order (11 items)

| # | Deliverable | Implemented? | Where |
|---|-------------|--------------|-------|
| D1 | Requirement sanity-check | **Yes** | `docs/01-REQUIREMENT-SANITY-CHECK.md` |
| D2 | Architecture blueprint | **Yes** | `docs/02-ARCHITECTURE-BLUEPRINT.md`, `docs/10-ARCHITECTURE-SUMMARY.md` |
| D3 | Setup commands | **Yes** | `docs/04-SETUP-AND-FOLDER-STRUCTURE.md`, `README.md` |
| D4 | Folder structure | **Yes** | `docs/04-SETUP-AND-FOLDER-STRUCTURE.md` |
| D5 | Database design | **Yes** | `docs/05-DATABASE-DESIGN.md` |
| D6 | Backend plan | **Yes** | `docs/06-BACKEND-AND-FRONTEND-PLAN.md` |
| D7 | Frontend plan | **Yes** | `docs/06-BACKEND-AND-FRONTEND-PLAN.md` |
| D8 | Testing/QA plan | **Yes** | `docs/07-TESTING-QA.md` (now 39 tests) |
| D9 | Deployment plan | **Yes** | `docs/08-DEPLOYMENT.md` |
| D10 | README / thesis notes | **Yes** | `README.md`, `docs/11-THESIS-DEFENSE-NOTES.md` |
| D11 | Self-review | **Yes** | `docs/09-SELF-REVIEW.md`, `docs/12-ADVERSARIAL-AUDIT.md` |

## E. Quality / working rules

| # | Rule | Met? | Evidence |
|---|------|------|----------|
| E1 | No shallow output; architecture reasoning present | **Yes** | 13 docs + inline comments on complex logic |
| E2 | No hardcoded secrets in frontend | **Yes** | only `BACKEND_ORIGIN` (non-secret); no secrets in bundle |
| E3 | No paid files via public static URLs | **Yes** | streamed through authorized endpoint only |
| E4 | Security/performance/consistency self-review | **Yes** | `12-ADVERSARIAL-AUDIT.md` + this wave's fixes |
| E5 | Thesis suitability | **Yes** | defense notes, coverage matrix, evaluation ideas |

---

## Gaps found this wave and CLOSED (nothing left silent)

1. **A6 / QA-C1 — blind payment approval** → proof endpoint + UI. **Closed.**
2. **Orphaned private files (QA-H2)** → cleanup on proof re-upload and project delete. **Closed.**
3. **Session TTL drift (QA-H1)** → cookie maxAge derived from `JWT_EXPIRES_IN`. **Closed.**
4. **Default admin password in prod (SEC-14)** → boot guard. **Closed.**
5. **Insecure cookie override in prod (SEC-2)** → boot guard. **Closed.**
6. **No CSP (SEC-9)** → helmet CSP (API) + `Content-Security-Policy` header (Vercel). **Closed.**
7. **Unaudited downloads (SEC-7)** → `FILE_DOWNLOADED` audit event. **Closed.**
8. **Timing user-enumeration** → real dummy bcrypt hash. **Closed.**
9. **Unicode/Burmese download filenames (QA-M1)** → RFC 5987 `Content-Disposition`. **Closed.**
10. **Free-text payment method (SEC-11)** → enum-validated method + aligned FE options. **Closed.**
11. **Native `prompt()`/no-confirm admin UX (QA-M3/M4/M5)** → styled reject modal + approve confirm + typed success/error banner. **Closed.**
12. **Admin/private routes crawlable (SEC-4)** → `robots.txt` disallow. **Closed.**
13. **Missing `createdAt` indexes (PERF-2)** → added on `PaymentOrder`/`AuditLog` (+composite). **Closed.**

## Explicitly-scoped items (documented non-goals, not gaps)
- Full offline-first PWA sync (C4 sanity-check) — installable + offline fallback only.
- Content/file plagiarism detection — title similarity only, by design.
- Real payment gateway — manual MMK verification by design.
- S3 object storage — seam exists (`lib/storage.ts`), disk used by default.
