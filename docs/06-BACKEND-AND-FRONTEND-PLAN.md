# 06 — Backend & Frontend Implementation Plan (as built)

## Backend (Node + Express + TypeScript)

### Cross-cutting
- **Config:** `src/config/env.ts` — Zod-validated; process exits on invalid env.
- **Errors:** typed `AppError` + central `errorHandler` → uniform JSON envelope
  `{ success, data | error }`. Zod + Multer errors mapped to 400/413.
- **Security middleware:** Helmet, CORS locked to `FRONTEND_ORIGIN` with credentials,
  `express-rate-limit` (global + stricter auth limiter), `trust proxy` for correct
  client IPs and Secure cookies behind PaaS proxies.

### API surface
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/health` | – | liveness |
| GET | `/api/search?q=` | public | ranked similarity search |
| GET | `/api/search/check?title=` | public | duplicate-risk verdict |
| GET | `/api/projects` | public | faceted browse + pagination |
| GET | `/api/projects/:id` | public | project detail (published) |
| GET | `/api/universities`,`/facets` | public | reference data |
| POST | `/api/auth/register\|login\|logout` | – | sets/clears HttpOnly cookie |
| GET | `/api/auth/me` | cookie | current user |
| POST | `/api/payments/orders` | student | create MMK order |
| POST | `/api/payments/orders/:id/proof` | student | upload screenshot |
| GET | `/api/payments/orders/mine`,`/purchases/mine` | student | history + library |
| GET | `/api/files/:id/download` | **purchase/admin** | streams private file |
| POST | `/api/files/:id/upload` | **admin** | attach paid file |
| * | `/api/admin/*` | **admin** | stats, projects CRUD, payments moderation, users, audit |

### Similarity engine (`modules/search`)
- `normalize.ts` — NFC → lowercase → Unicode-aware punctuation strip → whitespace collapse;
  `contentTokens` drops stopwords + 1-char tokens.
- `similarity.ts` — trigram Jaccard + token Jaccard + normalized Levenshtein, blended
  `0.55/0.30/0.15`; classified EXACT (≥0.85) vs SIMILAR (≥0.30).
- `search.service.ts` — chooses pg_trgm pre-filter (PostgreSQL) or bounded scan (SQLite),
  then reranks with the same blended scorer. Consistent results across DBs.

### Files & payments
- Multer stores to `storage/private` with random keys; **extension + MIME whitelist + size cap**.
- Download endpoint checks `PurchaseAccess`/admin, guards against path traversal, streams bytes.
- Payment approval is a **transaction**: order→APPROVED + upsert PurchaseAccess + AuditLog.

## Frontend (Next.js App Router + Tailwind + TypeScript)

### Architecture
- Same-origin `/api/*` calls proxied to the backend (`next.config.mjs rewrites`), so the
  browser never needs the backend URL and HttpOnly cookies flow naturally.
- `AuthContext` hydrates from `/api/auth/me`; no tokens in JS-accessible storage.
- Typed API client (`lib/api.ts`) unwraps the response envelope and throws `ApiError`.

### Pages
- **/** hero + live similarity search with a color-coded similarity meter and duplicate-risk banner.
- **/browse** facet filters (university → department, year, level, keyword) + pagination.
- **/check** paste-a-title duplicate verdict (LIKELY_UNIQUE / SIMILAR_EXISTS / DUPLICATE_RISK).
- **/projects/[id]** abstract, metadata, and a purchase/access panel (login-gated buy → proof → download).
- **/login** + **/portal-hidden-access** (hidden admin entry; reveals form only).
- **/library** purchased files + payment history.
- **/admin/**\* role-guarded dashboard: overview stats, projects manager (with consent
  checkbox + file upload), payment moderation queue, user role management, audit log.

### UX / accessibility / PWA
- Responsive grid layouts, semantic roles on alerts, focus rings, keyboard-usable controls.
- `manifest.webmanifest` + SVG icon → installable (PWA-ready; offline sync intentionally out of scope).
- Preview-safe: inline styles/Tailwind compiled to CSS, embedded SVG icon (no external CDN needed).
