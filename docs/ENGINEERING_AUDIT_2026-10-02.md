# Engineering Audit — 2026-10-02

## Executive verdict

**Thesis/demo MVP: late-stage and usable. Real paid production: NOT READY.** The application code passes the current build, type, lint, dependency-audit, and backend test gates. As an engineering estimate (not a measured metric), about **85–90% of the thesis-MVP software scope** is implemented. The blockers are operational/content-related: private uploads on the Render Free blueprint are ephemeral, the live archive reports no published project files, and the newest local changes are not connected to a Git remote/deployment. Durable storage, complete content, and a verified release path are required before relying on it commercially.

## 1. What the project is for

**TU Project Archive & Intelligent Title Similarity Checker** is a Myanmar Technological Universities archive and student research-support site. Its main purpose is to let students:

1. Browse and search past university projects by title, university, department, year, level, and other filters.
2. Check a proposed project title against the archive before submission. The checker normalizes titles and ranks possible matches using character-trigram, token-overlap, and edit-distance similarity.
3. Read project summaries and decide whether to pursue a topic. Full project files are protected and are not exposed as public static URLs.
4. Submit a manual MMK payment and proof when a full file is paid; an admin reviews it and grants download access.

Admins manage projects, author-consent/publishing, users and scoped roles, payment reviews, protected uploads, audit records, and analytics. Related student-support features include bookmarks/library, project comparison and notes, a component toolkit, wiring diagrams, and paid website-building guide kits. The UI is **English-default with a Burmese runtime switch** and is installable as a PWA. Optional Gemini semantic search/chat is implemented in code but is disabled in the live configuration.

**Scope note:** the similarity checker compares **titles**, not full documents. It is a duplicate-risk aid, not a plagiarism detector and does not prove that two projects have different content.

## 2. Architecture found in the repository

- **Frontend:** Next.js 15 / React / TypeScript, deployed separately on **Vercel**.
- **Backend:** Node.js / Express 5 / TypeScript REST API, deployed on **Render**.
- **Database:** Prisma with PostgreSQL + `pg_trgm` for the production search path; SQLite is used for local/demo development.
- **Auth/security:** JWT in HttpOnly cookies, bcrypt, server-side RBAC, Zod validation, Helmet, CORS allowlist, rate limits, private-file authorization, and audit logging.
- **Deployment evidence:** `render.yaml` defines the Render API and managed PostgreSQL service; frontend rewrites `/api/*` to the backend. The live API health, home, wiring, browse-proxy, and title-check routes responded successfully. The live wiring gallery index is not deployed (404).

## 3. Verification performed

| Check | Result |
|---|---|
| Backend Vitest/Supertest | **82/82 passed** across 4 test files |
| Backend production build (`npm run build`) | **Pass**; TypeScript compilation succeeds |
| Frontend TypeScript (`tsc --noEmit`) | **Pass** |
| Frontend ESLint (`npm run lint`) | **Pass**, zero warnings/errors after audit fixes |
| Frontend production build (`npm run build`) | **Pass**; 34 routes generated |
| `npm audit` — backend | **0 vulnerabilities** after safe lockfile updates |
| `npm audit` — frontend | **0 vulnerabilities** after safe lockfile updates |
| Live API `GET /health` | **HTTP 200** |
| Live Vercel `/` and `/wiring` | **HTTP 200** |
| Live Vercel same-origin `/api/projects?pageSize=1` proxy | **HTTP 200** |
| Live Vercel `/api/search/check` proxy | **HTTP 200**; returned a `SIMILAR_EXISTS` result for the test title |
| Live public archive stats | **14 projects, 5 universities, 11 departments, 0 project files** (`/api/stats`) |
| Live Vercel home metrics/copy | Still serves old `3 / 7 / 12+ / AI` hardcoded text; dynamic stats and truthful wording are fixed only in the local source so far |
| Live website kits | **8 listed; 8 report `hasFile: true`** |
| Live optional integrations | Gemini AI `enabled:false`; Cloudinary video upload `enabled:true` |
| Live wiring image index | **338 board×component pairs across 10 board types**; one mapped image per board sampled and returned HTTP 200 |
| Live wiring gallery index | **404** (`/wiring/gallery.json`); extra/generic images are not shown in a gallery |
| Local wiring assets in the reviewed workspace | `manifest.json` is `{}`, `gallery.json` is `[]`, and no real wiring JPGs are present |
| Git/deployment synchronization | Workspace has **no Git remote**; current tested changes cannot be assumed deployed |
| Frontend automated tests | No frontend `*.test`/`*.spec` files or browser E2E test runner found |

**Do not deploy the current workspace as-is.** Its empty wiring manifest would replace the live 338-pair index unless the existing photos/manifest are first brought into this repo and the gallery generated from the source images.

These checks confirm local code/build health and basic live availability. They do not constitute a production login/payment test using live credentials or a data-restore test.

## 4. Defects fixed during this audit

1. **Dependency advisories:** the lockfiles originally resolved vulnerable versions of `ip-address`, `morgan`, `multer`, and `nodemailer` in the backend, plus `dompurify` in the frontend. Compatible security updates were applied; both full `npm audit` runs now report zero vulnerabilities.
2. **Frontend lint was not configured:** `npm run lint` previously opened an interactive ESLint setup prompt. Added the Next.js ESLint config and ignore rules and made the lint command non-interactive.
3. **Conditional React Hook:** lint found `useTransform` being called only when the optional glare overlay rendered in `motion.tsx`. The hook now runs unconditionally; the overlay remains optional. Also removed unused variables/imports and fixed the dependency expression warnings. Lint is now clean.
4. **Potentially destructive deploy flag:** removed `--accept-data-loss` from the Render and Docker startup `prisma db push` commands. A future destructive schema change will now stop and require review rather than silently accepting data loss.
5. **Stale test-count documentation:** current totals are 82 tests, not the older 57/31 figures; README and QA/architecture docs were corrected.
6. **Misleading/stale homepage claims:** the live stats endpoint reports 5 universities, 11 departments, 14 projects, and 0 project files, while the source homepage hardcoded 3/7/12+ and called the lexical checker an “AI” engine. The reviewed source now fetches the public stats endpoint and shows accurate, bilingual labels; the title-check copy no longer claims it is AI-powered.
7. **Language/deployment documentation drift:** updated current docs and localization comments to state English is the default and Burmese is a runtime option, and clarified Render-managed PostgreSQL as the current blueprint. Historical dated QA snapshots remain historical.

## 5. Remaining findings and recommended actions

### P1 — Private uploads are not durable on the configured Render Free plan

The `StorageService` writes private project files, kit ZIPs, and payment proof files to local disk. The current Render Free blueprint has no persistent disk. A restart/redeploy can leave the database records in place while the actual files are missing. This is the main blocker for real paid use.

**Before real sales:** attach persistent storage on an eligible plan or implement S3-compatible object storage (for example, R2/S3), migrate existing uploads, and test backup + restore. Keep all downloads behind the existing authorization endpoint.

### P1 — Local changes and wiring gallery are not released

The reviewed workspace has no Git remote and its local wiring data files are empty, while the live site has a 338-pair manifest. The live `gallery.json` returns 404, so the new “More wiring images” gallery is not live. Deploying this workspace before syncing the 338 existing images/manifest could remove the currently working wiring cards.

**Release sequence:** bring the production/source JPGs and existing manifest into the repo; run the organizer on the original image folder to generate both card and gallery indexes; verify every referenced file; commit; configure/push the intended Git remote; then deploy and smoke-test the live site.

### P1 — The live project archive has no full project files

The public stats endpoint currently reports **14 published projects but `withFile: 0`**. The paid project-download workflow is implemented and covered by tests, but visitors cannot buy a project report from the current published archive until authorized project files and consent/metadata are uploaded. The eight separate website kits do report files available.

### P2 — Production database updates are schema-pushed, not versioned Postgres migrations

The Render startup currently runs `prisma db push`; the checked-in Prisma migration SQL is SQLite-shaped. The unsafe data-loss override has been removed, which is safer, but a provider-specific, reviewed PostgreSQL migration workflow should be established before frequent schema changes or important production data accumulate. Take a backup before schema updates.

### P2 — Similarity thresholds need empirical evaluation

The checker has unit coverage and explainable scoring, but the 0.85/0.30 bands have not been evaluated against a hand-labelled Myanmar university project-title dataset. Record precision/recall/F1 and tune thresholds before treating the verdict as an academic decision rule.

### P2 — No CI build/test gate or browser-level frontend regression suite

The repository has only a keep-alive GitHub Actions workflow; it does not automatically run tests, lint, or builds on a push/PR. Backend has 82 automated tests, but the frontend has no `*.test`/`*.spec` suite or Playwright/Cypress runner. Add CI for backend tests/build, frontend lint/type/build, then browser tests for browse/search, language toggle, login, payment proof submission, admin approval, and protected downloads.

### P2 — Gemini semantic/chat features are implemented but disabled live

`/api/ai/config` currently reports `enabled:false`; lexical title search/check continues to work. If semantic search and grounded chat are intended deliverables, configure the server-only Gemini key, backfill embeddings, and test cost/rate limits. Otherwise keep them described as optional—not as the title checker itself.

### P3 — Local vs live wiring data is incomplete

The live site has 338 pair entries, but the reviewed workspace has no JPGs and empty indexes. The gallery code is implemented locally, but `gallery.json` is 404 in production. Sync the data before deploying; do not ship the empty local manifest.

### P3 — Prisma configuration deprecation notice

The backend build warns that `package.json#prisma` will be removed in Prisma 7. It does not break the current Prisma 6 build; migrate that config to `prisma.config.ts` as part of a deliberate Prisma upgrade.

## 6. Scorecard

| Area | Score | Basis |
|---|---:|---|
| Product/thesis fit | 9/10 | Clear archive + title-risk workflow with supporting student tools |
| Architecture and separation | 9/10 | Decoupled frontend/API, Prisma, private-file access boundary |
| Functional correctness | 9/10 | 82 passing backend tests; builds/type checks pass |
| Security controls | 9/10 | Strong auth/RBAC and protected downloads; dependency advisories now clear |
| Maintainability | 8/10 | Modular services and documentation; production DB migration process needs improvement |
| Operational/release readiness | 4/10 | Ephemeral private storage, no remote from this workspace, and a live/local wiring-data mismatch |
| Content/research readiness | 6/10 | Live archive has 14 records but zero project files; similarity has no labelled evaluation set |
| **Overall engineering implementation** | **8.0/10** | Strong thesis/MVP code; this is not a paid-production go-live score |

## 7. Bottom line

For a **thesis demonstration**, the core code is in late MVP stage (roughly **85–90% of the planned software scope**, an engineering estimate): the API is reachable, 82 backend tests pass, and local build/type/lint/dependency gates are green. The live site has 14 published project records, eight downloadable guide kits, and 338 indexed wiring-photo pairs, but no published project files and no wiring gallery. For **real paid use**, first sync the exact source revision and wiring assets safely, add project-file content, make private uploads durable, test backup/restore, and establish reviewed PostgreSQL migrations. Gemini semantic/chat is an optional implemented feature but currently disabled. The title checker should be described as lexical title similarity—not plagiarism detection—and evaluated on labelled data before high-stakes use.
