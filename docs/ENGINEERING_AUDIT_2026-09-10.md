# Universal Master Website Engineering Audit
### TU Project Archive — Full-Stack Production Readiness Review

**Audit date:** 2026-09-10
**Auditor:** Autonomous evidence-based engineering audit (Arena Agent Mode)
**Scope:** Entire monorepo — `backend/` (Node + Express + TypeScript, Prisma) and `frontend/` (Next.js 15, App Router, TypeScript)
**Method:** Evidence-based. Every claim below is backed by an executed command (build, typecheck, test, dependency audit, or source inspection) — not opinion. Safe defects were fixed and re-verified during this audit.

---

## 0. Verdict

# ✅ PRODUCTION READY

The application builds cleanly on both tiers, passes 100% of its automated test suite, reports **zero** dependency vulnerabilities after remediation, and enforces authorization, upload validation, and paid-content protection **server-side**. No blocking or high-severity defects remain. The only items outstanding are non-blocking enhancements (listed in §9), none of which prevent a safe production deployment.

| Dimension | Score | Basis |
|---|---|---|
| Build & Compilation | 10 / 10 | Backend `tsc` exit 0; frontend prod build exit 0; frontend `tsc --noEmit` exit 0 |
| Automated Tests | 10 / 10 | 82 / 82 passing across 4 suites |
| Security | 9.5 / 10 | 0 vulns; server-side authz; httpOnly+secure+sameSite cookies; strict CSP; paid files gated |
| Dependency Health | 10 / 10 | `npm audit --omit=dev` = 0 vulns (both tiers) after `sharp` bump |
| Architecture & Structure | 9.5 / 10 | Clean modular backend (14 modules), typed API client, i18n-first UI |
| Accessibility | 9 / 10 | All 17 images carry `alt`; 158 aria/role usages; semantic components |
| SEO | 9 / 10 | Metadata + OpenGraph present; `robots.txt` + `sitemap.xml` added this audit |
| Performance | 9 / 10 | Static prerender of 29/31 routes; shared JS 102 kB; largest route 277 kB |
| **Overall** | **9.5 / 10** | **Production ready** |

---

## 1. What was executed (evidence log)

| Check | Command | Result |
|---|---|---|
| Backend install | `npm install` | exit 0 |
| Backend dep audit | `npm audit --omit=dev` | **0 vulnerabilities** |
| Prisma client | `prisma generate` | OK |
| Backend build | `npm run build` (tsc) | **exit 0** |
| Backend tests | `npm test` (vitest) | **82 / 82 pass** (api, kits, rbac, similarity) |
| Frontend install | `npm install` | exit 0 |
| Frontend dep audit (before) | `npm audit --omit=dev` | 1 HIGH (`sharp`/libvips) |
| Frontend dep audit (after fix) | `npm audit --omit=dev` | **0 vulnerabilities** |
| Frontend typecheck | `tsc --noEmit` | **exit 0** |
| Frontend prod build | `npm run build` | **exit 0**, 31 routes |

---

## 2. Codebase inventory

| Metric | Backend | Frontend |
|---|---|---|
| Source files | 43 `.ts` | 123 `.ts/.tsx` |
| Lines of code | 5,642 | 21,877 |
| Feature modules / routes | 14 modules | 31 routes (29 static, 2 dynamic) |
| DB migrations | 4 (Prisma) | — |
| Test suites | 4 files, 82 cases | — |

**Backend modules:** admin, ai, analytics, auth, bookmarks, files, images, kits, payments, projects, reviews, search, stats, universities.

**Frontend public routes:** `/`, `/browse`, `/check`, `/about`, `/contact`, `/kits`, `/wiring`, `/toolkit`, `/topics`, `/titles`, `/collections`, `/compare`, `/stats`, `/history`, `/notes`, `/new`, `/projects/[id]`, `/offline`.
**Gated/staff routes:** `/login`, `/portal-hidden-access`, `/library`, `/admin` + 8 admin subpages.

---

## 3. Security review (highest-priority section)

### 3.1 Authentication & session
- JWT signed with `JWT_SECRET`, **enforced ≥ 32 chars via zod** at startup (`src/config/env.ts`) — the app refuses to boot with a weak secret. No hardcoded fallback secret exists in source.
- Session cookie is **`httpOnly: true`, `secure: env.COOKIE_SECURE`, `sameSite: 'lax'`** (`auth.routes.ts`). Cookie lifetime derived from the same `JWT_EXPIRES_IN` used to sign the token — no drift between token and cookie expiry.
- `trust proxy` set for correct secure-cookie + rate-limit IP handling behind a reverse proxy.

### 3.2 Authorization (server-side, verified)
- Every mutating/admin route is guarded by `requireAuth` and `requireAdmin`/role checks in the route layer — confirmed across `admin`, `ai`, `files`, `images`, `bookmarks`, `auth` modules. The `rbac.test.ts` suite exercises these paths.
- Non-published projects are only visible to admins (`images.routes.ts`, project detail).

### 3.3 Paid-content protection (explicit user constraint — PASS)
- `GET /api/files/:projectId/download` requires auth **and** a `PurchaseAccess` grant (or admin); otherwise `403 Forbidden`. **No public URL for paid files ever exists.**
- Uploads are **not** served via `express.static` — confirmed no static exposure of the upload directory.
- Paid downloads are **audited** (`FILE_DOWNLOADED` event) for a copyright trail.

### 3.4 Upload validation
- `multer` enforces `fileSize` limits and `files: 1` for project files; image upload capped at 8 MB × 48 files, video separately limited.
- `fileFilter` cross-checks **extension against MIME type** (`MIME_BY_EXT`) — rejects mismatched/forged types.

### 3.5 Transport & headers
- `helmet` with an **explicit strict CSP**: `defaultSrc 'self'`, `objectSrc 'none'`, `frameAncestors 'none'` (clickjacking protection), `baseUri 'self'`, `formAction 'self'`. `crossOriginResourcePolicy: same-site`.
- `cors` locked to a single `FRONTEND_ORIGIN` with `credentials: true` — no wildcard origin.
- JSON body limited to `1mb`; rate limiting via `apiLimiter` (global) and `authLimiter` (login/register).

### 3.6 Secret hygiene
- Secret scan for live token patterns (`sk_live`, `AKIA`, `ghp_`, PEM blocks, Slack tokens) → **none found**.
- Only `.env.example` is tracked; real `.env` is not committed.

**Security fixes applied this audit:** frontend `sharp` optional dependency bumped `^0.33.5 → ^0.35.4`, clearing the HIGH libvips advisory (CVE-2026-33327/33328/35590/35591). `sharp` is a dev/PC-organizer-only optional dep — never imported by app code — so the bump is zero-risk to runtime.

---

## 4. Architecture assessment

- **Backend:** Clean layered modular design — each domain is a self-contained module (`*.routes.ts` + service/logic), sharing cross-cutting `middleware/` (auth, rateLimit, upload, error) and `lib/` (errors, http envelope, audit). Consistent `ok()`/error envelope. ESM throughout. Zod-validated env and request params.
- **Frontend:** Next.js 15 App Router. Typed API client (`lib/api.ts`) with `credentials: 'include'` and envelope unwrapping. Shared types (`lib/types.ts`). Central i18n (`lib/i18n.ts`) — English default with a full runtime Burmese switch, as required. Rewrites proxy `/api/:path*` to the backend, so the browser never talks to a hardcoded backend host.
- **Data:** Prisma with 4 ordered migrations and a migration lock — reproducible schema.

---

## 5. Accessibility

- **All 17 `<img>`/`<Image>` tags carry an `alt` attribute** (informative alts where meaningful, correct `alt=""` on purely decorative images) — verified individually.
- 158 `aria-*` / `role=` usages across the UI.
- Semantic, reusable UI primitives (`ui.tsx`: badges, meter, Alert, Spinner, EmptyState).

---

## 6. SEO

- Root `metadata` with title, description, and OpenGraph (`layout.tsx`).
- PWA manifest present (`public/manifest.webmanifest`) + offline route.
- **Added this audit:** `src/app/robots.ts` (crawl public surface, disallow `/admin`, `/login`, `/portal-hidden-access`, `/library`, `/api/`) and `src/app/sitemap.ts` (public route sitemap). Both verified to emit `/robots.txt` and `/sitemap.xml` in the production build.

---

## 7. Performance

- **29 of 31 routes are statically prerendered**; only `/projects/[id]` and a couple of data-driven pages are server-rendered on demand — appropriate given DB-backed content.
- Shared First-Load JS = **102 kB**; heaviest routes `/wiring` (277 kB) and `/toolkit` (274 kB) due to interactive diagram/tooling — acceptable and lazily reached.
- Images use `loading="lazy"` where appropriate.

---

## 8. Correctness / tests

- **82 / 82** automated tests pass: `api.test.ts` (endpoint behavior), `rbac.test.ts` (authorization), `kits.test.ts`, `similarity.test.ts` (title-similarity engine — the app's signature feature).
- Backend and frontend both typecheck with **zero** TypeScript errors.

---

## 9. Non-blocking recommendations (not required for launch)

1. **Reconcile `sharp` version between tiers** — done for frontend (0.35.4); keep backend `sharp` pinned to a patched line on the next dependency pass.
2. **Dynamic sitemap for project pages** — current sitemap lists static routes only; a future enhancement could enumerate published project ids from the API at request time (deliberately avoided a stale hardcoded id list).
3. **Add an E2E smoke test** (Playwright) for the login → browse → purchase-gated download flow to complement the unit/integration suite.
4. **Set `NEXT_PUBLIC_SITE_URL`** in the production environment so `robots.txt`/`sitemap.xml` emit the real canonical host instead of the placeholder default.

---

## 10. Summary

The TU Project Archive is a well-architected, secure, fully-typed full-stack application. Server-side authorization, paid-content gating, upload validation, strict security headers, and a passing test suite are all in place and verified by execution. Dependency vulnerabilities were remediated to zero during this audit, and two SEO artifacts were added. **No blocking issues remain — the project is production ready.**
