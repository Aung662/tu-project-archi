# 09 — Final Self-Review

A critical pass over the delivered system against the brief's rules and thesis suitability.

## Requirements coverage

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Search project titles | ✅ | `/api/search`, home page |
| Detect exact/similar titles | ✅ | blended scorer, EXACT/SIMILAR bands, `/check` |
| Browse by year/university/level/department | ✅ | `/api/projects` facets, `/browse` |
| View summaries | ✅ | project detail page |
| Purchase full files (manual MMK) | ✅ | PaymentOrder → proof → approve → PurchaseAccess |
| Admin manages records/files/payments/access | ✅ | `/admin/*` dashboard |
| Browse/search without login | ✅ | public routes, verified |
| Purchasing requires login | ✅ | `requireAuth` on payments/download |
| Admin dashboard not public | ✅ | server RBAC + client guard |
| 3-click logo = hidden UI only | ✅ | Navbar trigger; grants no privilege |
| Hidden fallback `/portal-hidden-access` | ✅ | route reveals login only |
| Seed/env initial admin | ✅ | `seed.ts` reads env; password synced |
| Server-side PurchaseAccess for paid files | ✅ | download middleware |
| `has_consent` required to publish | ✅ | service gate + UI + test |
| Normalized titles + ranked similarity | ✅ | `normalize.ts` + `similarity.ts` |
| No secrets in frontend | ✅ | same-origin `/api`, cookie auth |
| No paid files via static URLs | ✅ | private dir + streamed download |

## Working-rules compliance
- Deep output, architecture reasoning, wave summaries with risks/fixes: ✅ (see docs + turn log).
- Continuous waves without unnecessary pauses: ✅.
- Self-review for security/perf/consistency: this document + `07-TESTING-QA.md`.

## Security posture
- **0 npm vulnerabilities** (backend + frontend), achieved by pinning Prisma 6, Next 15,
  TypeScript 5, and overriding `deepmerge-ts`/`postcss`.
- AuthZ enforced server-side on every privileged path; UI hiding never trusted.
- Paid files unreachable by URL; download gated by `PurchaseAccess`/admin with traversal guard.
- Inputs validated (Zod), queries parameterized (Prisma), passwords bcrypt(12), rate-limited auth.

## Performance
- Trigram GIN index (Postgres) for scalable search; bounded scan fallback for dev.
- Faceted browse is indexed + paginated. Access checks are O(1) via unique (userId, projectId).

## Risks found & fixed during build
1. Prisma 7 pulled vulnerable Hono deps → pinned Prisma 6 + override → 0 vulns.
2. Express 5 param typing → typed `params()` helper.
3. **dotenv treated `#` as a comment**, truncating the admin password → quoted env values +
   seed now syncs the password (would have blocked admin login in a real deploy).
4. TypeScript 7 preview (via `@latest`) broke `baseUrl`/Next → pinned TS 5.
5. Next path alias needed `baseUrl` → added.
6. Integration test polluted by manual e2e data → made the paid-file test self-contained.

## Thesis suitability
- Clear problem/contribution/method framing (README thesis notes).
- Defensible design decisions documented (dual similarity strategy, RBAC collapse, manual payments).
- Reproducible: one-command local run on SQLite; documented Postgres path with `pg_trgm`.
- Automated tests + security checklist support the evaluation chapter.

## Wave 5 — security hardening (post-audit)
A dedicated hardening wave closed the highest-value gaps found in a fresh security audit.
Each item is covered by an automated test and was also verified live against the running API.

1. **Upload MIME spoofing (HIGH).** Multer's whitelist trusted the client-declared
   `mimetype`/extension, so `evil.pdf` containing HTML (or a renamed `.exe → .docx`) passed.
   Added `src/lib/fileSignature.ts` — a magic-byte validator run *after* upload; on mismatch the
   file is deleted and the request is rejected with `400`. Fails closed on unknown extensions.
2. **JWT algorithm confusion.** Signing and verification now pin `HS256` via an explicit
   `algorithms` allowlist, so forged `alg:none` (and RS/HS confusion) tokens are rejected.
3. **Stale role in JWT.** `requireRole` is now async and re-reads the caller's current role from
   the DB on every privileged request, so a demoted/deleted admin's still-valid cookie is
   immediately powerless (verified: token issued as ADMIN → DB demotion → next call `403`).
4. **No auth event logging.** Register, login, failed-login (unknown user *and* bad password),
   and logout now write `AuditLog` events for incident review.
5. **Missing rate limits.** Added dedicated `uploadLimiter` and `searchLimiter` on top of the
   existing auth limiter (`RateLimit-*` headers confirmed on `/api/search`).
6. **`COOKIE_SECURE` defaulted false.** Env now force-enables secure cookies in production
   unless explicitly overridden.
7. **Stronger password policy + strict schemas.** Registration requires ≥8 chars with a letter
   and a number; auth schemas are `.strict()` (reject smuggled fields like `role`) and normalize
   email (trim + lowercase).
8. **Robust error mapping.** Malformed JSON bodies now return `400 MALFORMED_JSON` (not a 500),
   and known Prisma errors map to `409`/`404`/`409` (`P2002`/`P2025`/`P2003`).
9. **Search analytics.** New `SearchLog` model records every SEARCH and CHECK (kind, raw +
   normalized query, result count, top score, verdict, actor, IP). Surfaced in a new admin
   **Search Analytics** tab — useful evidence for the thesis evaluation chapter.

### Root-cause bug found *during* Wave 5 (and fixed)
- **Express 5 `req.query`/`req.params` are prototype getters.** The `validate` middleware used
  `Object.assign(req.query, parsed)`, which silently failed to persist — so Zod `z.coerce.number()`
  values stayed **strings**. Harmless for arithmetic-based paginators, but it made Prisma
  `take`/`skip` throw (`Expected Int, provided String`) on the new analytics endpoint. Fixed by
  redefining `req.query`/`req.params` as own properties (`Object.defineProperty`), so every
  validated route now receives correctly typed values. This was a latent correctness bug across
  the whole API, not just the new route.

**Wave 5 result:** backend `tsc --noEmit` clean; **31/31 tests pass** (was 24, +7 hardening tests);
frontend `tsc --noEmit` clean; all nine items verified live; DB reset to pristine seed.

## Wave 6 — PWA, UX polish, deployment configs & final documentation
The finishing wave turned a working app into a shippable, defensible thesis artifact.

**PWA (installable + offline-capable):**
- Generated real PNG icons (192/512/maskable/apple-touch/favicon) from the SVG via `sharp`;
  rewrote `manifest.webmanifest` with proper icon set, `scope`, `shortcuts`, categories.
- Added a service worker (`public/sw.js`): network-first navigations with an **offline fallback
  page**, stale-while-revalidate for static assets, and **API responses never cached** (auth +
  freshness). Registered via a client `ServiceWorkerRegistrar` that is a no-op in dev.
- Added a non-intrusive `InstallPrompt` banner (captures `beforeinstallprompt`, remembers dismissal).
- Enriched `layout.tsx` metadata (icons, appleWebApp, `viewportFit: cover`).

**State coverage (empty / loading / error):**
- New reusable `Skeleton` / `SkeletonCard` / `SkeletonList` components; home search and browse
  grids now show content-shaped skeletons instead of a bare spinner (with `aria-busy`/`aria-live`).
- Added App Router boundaries: root `loading.tsx`, `error.tsx` (recoverable), `global-error.tsx`
  (self-contained inline-styled), and a Burmese-first `not-found.tsx` (404) — plus an `/offline` page.
  All previously-missing special files now exist.

**Responsive polish:** verified/kept mobile-first grids (`sm:`/`lg:` breakpoints) across home,
browse, project detail; install banner and states are mobile-safe.

**Deployment configs (ready to use):** `render.yaml` (API + managed Postgres + disk + generated
`JWT_SECRET`), `frontend/vercel.json` (Next preset + PWA/security headers), `backend/railway.json`,
multi-stage `backend/Dockerfile` + `.dockerignore`, hardened root `.gitignore` (secrets, db, uploads),
`frontend/.env.example`, and storage `.gitkeep`s.

**Documentation:** rewrote README (PWA, 31 tests, deploy configs, new docs); expanded
`08-DEPLOYMENT.md` (config table + PWA notes); added `10-ARCHITECTURE-SUMMARY.md` (final summary,
topology, request lifecycle, **known limitations**, **future work**) and
`11-THESIS-DEFENSE-NOTES.md` (pitch, decision justifications, examiner Q&A, demo script).

**Re-check of all prior waves (this session):** fresh environment — reinstalled deps (0 vulns
both apps), regenerated Prisma client, DB in sync, seed pristine (3/7/12/2). Backend `tsc` clean;
**31/31 tests pass**; frontend `tsc` clean; **production `next build` succeeds** (17 routes);
PWA assets + offline/404 verified live on `next start`; both dev servers healthy afterwards.

**Wave 6 result:** all Wave 6 goals met; no regressions; environment left running in dev with a
pristine database.

## Bug-fix, requirement-coverage & refactor wave (post-audit)
Acted on the adversarial audit (`12-ADVERSARIAL-AUDIT.md`). Baseline re-verified first (BE/FE `tsc`
clean, 31/31 tests), confirming **no syntax/import/type errors existed** — the defects were
flow/requirement gaps. Fixed in safe order (schema → config → service logic → new endpoint → UI),
typechecking after each cluster.

**Highest-impact fix — the core flow:** admins could approve manual payments **without seeing the
proof**. Added an admin proof-stream endpoint + `hasProof` exposure + a "View proof" UI link, so
verification is real. Backed by 8 new end-to-end tests.

**Also fixed:** session-TTL drift (cookie now derived from `JWT_EXPIRES_IN`); orphaned private files
on re-upload/delete; timing-based user enumeration; RFC 5987 Unicode download filenames; payment
`method` enum; production fail-fast boot guards (secure cookie / seed password / JWT length); CSP on
API + frontend; audited downloads; `robots.txt`; `createdAt` indexes.

**Refactor:** extracted `lib/download.ts` (dedup'd download logic across two pages) and
`contentDispositionAttachment()`; replaced the admin `prompt()` with a styled modal + approve
confirm + typed banners. Verified no dead code / temp files / stray logs remain.

**Coverage:** `13-REQUIREMENT-COVERAGE.md` maps every brief requirement to code; all Partial/No items
were closed (13 gaps) or documented as explicit scope decisions.

**Result:** BE `tsc` clean; FE `tsc` clean; **39/39 tests pass**; live-verified (CSP header, 6h
cookie, method enum, proof stream). DB reset to pristine seed.

## Honest remaining gaps (future work)
- Object-storage backend for horizontal scale (seam provided, not wired).
- Quantitative similarity evaluation against a labeled dataset.
- Optional email notifications on payment approval.
- Full offline PWA (currently installable/responsive only).

**Verdict:** All brief requirements met, security rules satisfied, tests green, 0 vulnerabilities,
and the project is coherent and defensible as a final-year thesis.
