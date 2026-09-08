# 16 — API Reference

Complete reference for the TU Project Archive REST API. Extracted from the route definitions in
`backend/src/modules/**/**.routes.ts` and verified against the running server.

## Conventions

- **Base URL.** All routes are mounted under `/api`. The Next.js frontend rewrites `/api/:path*` to
  the backend, so browser code uses **relative** `/api/...` URLs (no hardcoded host).
- **Auth model.** A signed JWT (HS256) is stored in an **HttpOnly, SameSite=Lax cookie** named
  `tu_token` (6 h TTL). The browser sends it automatically with `credentials: 'include'`. There is
  no `Authorization` header flow.
- **Roles.** `STUDENT` (default) and `ADMIN`. Admin routes re-read the user's role from the DB on
  every request (a stale token cannot escalate).
- **Success envelope.** `{ "success": true, "data": <payload> }`.
- **Error envelope.** `{ "success": false, "error": { "code": "<CODE>", "message": "<human text>", "details"?: … } }`.
- **Error codes.** `BAD_REQUEST` (400), `VALIDATION_ERROR` (400, Zod), `UNAUTHORIZED` (401),
  `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), plus a generic `APP_ERROR` / `500`.
- **Validation.** Every body/query is parsed with Zod; failures return `400 VALIDATION_ERROR` with
  `details`.
- **Rate limits (per IP/window).** global `RATE_LIMIT_MAX=300`/15 min; `authLimiter` 20; `searchLimiter` 60;
  `uploadLimiter` 30. Exceeding a limit returns `429`.

---

## Auth — `/api/auth`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/register` | public (rate-limited) | Create a `STUDENT` account and set the session cookie |
| POST | `/auth/login` | public (rate-limited) | Authenticate and set the session cookie |
| POST | `/auth/logout` | optional | Clear the session cookie |
| GET | `/auth/me` | required | Return the current user profile |

**POST `/auth/register`**
- Body: `{ email: string(email), password: string(min 8), name: string }`
- 201 → `{ success, data: { user: { id, email, name, role } } }`; sets `tu_token` cookie.
- Errors: `400 VALIDATION_ERROR`; `409 CONFLICT` (email already registered).

**POST `/auth/login`**
- Body: `{ email, password }`
- 200 → `{ success, data: { user } }`; sets `tu_token` cookie.
- Errors: `400 VALIDATION_ERROR`; `401 UNAUTHORIZED` (constant-time — no user-enumeration).

**POST `/auth/logout`** → 200, clears cookie.

**GET `/auth/me`** → `{ success, data: { user } }`; `401` if not logged in.

---

## Metadata — `/api/universities`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/universities` | public | List universities (with their departments) for filters/forms |
| GET | `/universities/facets` | public | Facet metadata for the browse UI (universities → departments, academic levels) |

Both return `{ success, data: [...] }`. Used to populate filter dropdowns and the project form.

---

## Projects (browse & detail) — `/api/projects`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/projects` | public | Paginated, filterable list of **published** projects (metadata only) |
| GET | `/projects/:id` | optional | Single project's public metadata/summary |

**GET `/projects`**
- Query: `q?`, `year?`, `universityId?`, `departmentId?`, `level?` (`FIRST_YEAR…FINAL_YEAR|MASTERS|PHD` per enum), `keyword?`, `page?` (default 1), `pageSize?` (default 20).
- 200 → `{ success, data: { items: Project[], total, page, pageSize } }`.
- Each item carries `id, title, abstract, keywords, year, level, authorsText, supervisorName,
  priceMmk, status, university, department, hasFile, createdAt` — **never** `fileStorageKey`.

**GET `/projects/:id`**
- `optionalAuth`: an authenticated buyer may receive purchase-related hints, but the paid file is
  still only obtainable via the file-download endpoint.
- 200 → `{ success, data: Project }`; `404 NOT_FOUND` for unknown/unpublished ids.

---

## Search & duplicate check — `/api/search`

> The whole router is `searchLimiter` + `optionalAuth`. Anonymous use is allowed; a `SearchLog` row
> is written for analytics.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/search` | public (rate-limited) | Rank existing titles by similarity to a query |
| GET | `/search/check` | public (rate-limited) | Duplicate-risk verdict for a **proposed** title |

**GET `/search`**
- Query: `q: string`, `limit?` (default 20).
- 200 → `{ success, data: { query, results: Hit[] } }`, sorted by `breakdown.score` descending.
- `Hit = { id, title, year, level, university, department, kind: 'EXACT'|'SIMILAR',
  breakdown: { score, trigram, token, edit } }`. `kind='EXACT'` when `score ≥ SIMILARITY_EXACT_THRESHOLD` (0.85).
- Only candidates with `score ≥ SIMILARITY_SIMILAR_THRESHOLD` (0.30) are returned.

**GET `/search/check`**
- Query: `title: string`.
- 200 → `{ success, data: { verdict, results, ... } }` where
  `verdict ∈ { LIKELY_UNIQUE, SIMILAR_EXISTS, DUPLICATE_RISK }`
  (`DUPLICATE_RISK` when an EXACT match exists, `SIMILAR_EXISTS` when only SIMILAR ones do).

---

## Payments (student side) — `/api/payments`

> `/payments/instructions` is public; **all other payment routes require auth** (`paymentsRouter.use(requireAuth)`).

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/payments/instructions` | public | Human-readable MMK payment instructions (methods, accounts) |
| POST | `/payments/orders` | required | Create a payment order for a paid project |
| POST | `/payments/orders/:id/proof` | required (rate-limited) | Upload a payment screenshot for an order |
| GET | `/payments/orders/mine` | required | List the caller's own orders |
| GET | `/payments/purchases/mine` | required | List the caller's granted purchases ("my library") |

**POST `/payments/orders`**
- Body: `{ projectId: string, method: 'KBZPay'|'WavePay'|'AYAPay'|'CBPay'|'BankTransfer', txnRef?: string }`.
- 201 → `{ success, data: { id, status: 'PENDING', ... } }`.
- Errors: `400 VALIDATION_ERROR` (e.g. `method:"Bitcoin"`); `404` unknown project; `409` if the caller already owns/ordered it.

**POST `/payments/orders/:id/proof`**
- `multipart/form-data`, field `proof` (image). Magic-byte validated; size ≤ `UPLOAD_MAX_BYTES`.
- 201 on success. Re-uploading replaces (and deletes) the previous proof.
- The stored proof key is **never** returned to clients.

**GET `/payments/orders/mine`** → the caller's orders (each with `hasProof`, never `proofKey`).

**GET `/payments/purchases/mine`** → projects the caller may download.

---

## File access — `/api/files`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/files/:projectId/download` | required | Stream the paid file **iff** the caller has `PurchaseAccess` (or is admin) |
| POST | `/files/:projectId/upload` | admin (rate-limited) | Attach/replace the paid file for a project |

**GET `/files/:projectId/download`**
- 200 → binary stream with `Content-Disposition: attachment; filename*=UTF-8''<name>` (RFC 5987).
  Writes a `FILE_DOWNLOADED` audit row.
- Errors: `401` (anonymous); `403` (authenticated but no purchase); `404` (no file/project).

**POST `/files/:projectId/upload`** (admin only)
- `multipart/form-data`, field `file` (`pdf,doc,docx,zip` by default). **Magic-byte validated** — a
  disguised file (e.g. GIF renamed `.pdf`) is rejected `400 BAD_REQUEST`.
- 201 on success; writes a `PROJECT_FILE_UPLOADED` audit row.

---

## Admin — `/api/admin`

> The entire admin router is guarded: `adminRouter.use(requireAuth, requireAdmin)`.
> Non-admin → `403 FORBIDDEN`; anonymous → `401 UNAUTHORIZED`.

### Dashboard & analytics
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/stats` | Dashboard counters (projects, users, pending payments, revenue, …) |
| GET | `/admin/audit` | Paginated audit log |
| GET | `/admin/search-logs` | Search/duplicate-check analytics (volume + verdict counts) |

### Projects
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/projects` | List all projects (incl. unpublished) |
| GET | `/admin/projects/:id` | Full admin view of one project |
| POST | `/admin/projects` | Create a project (consent gate enforced) |
| PUT | `/admin/projects/:id` | Update a project |
| DELETE | `/admin/projects/:id` | Delete a project (best-effort file/proof cleanup) |

### Payment moderation
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/payments` | Payment queue — each item has `hasProof` (never `proofKey`) |
| POST | `/admin/payments/:id/approve` | Approve → creates `PurchaseAccess`, audit `PAYMENT_APPROVED` (idempotent, transactional) |
| POST | `/admin/payments/:id/reject` | Reject with a note; no access granted, audit `PAYMENT_REJECTED` |
| GET | `/admin/payments/:id/proof` | Stream the uploaded proof image (admin only; `403` for non-admin) |

### Universities & departments
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/admin/universities` | Create a university |
| PUT | `/admin/universities/:id` | Update a university |
| DELETE | `/admin/universities/:id` | Delete a university |
| POST | `/admin/departments` | Create a department |
| PUT | `/admin/departments/:id` | Update a department |
| DELETE | `/admin/departments/:id` | Delete a department |

### Users
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/users` | List users |
| PUT | `/admin/users/:id/role` | Change a user's role (`STUDENT` ⇄ `ADMIN`) |

---

## Root

`GET /api/` returns a small self-describing list of available endpoint groups.
`GET /health` (outside `/api`) returns `200` for liveness checks and carries the security headers.

---

## cURL quickstart

```bash
BASE=http://localhost:3000     # through the Next proxy (or http://localhost:4000/api directly)

# login (save the cookie jar)
curl -c cj.txt -X POST $BASE/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"student@tu-archive.mm","password":"Student#2026"}'

# search + duplicate check (no login needed)
curl "$BASE/api/search?q=smart%20agriculture"
curl "$BASE/api/search/check?title=IoT%20Smart%20Farming"

# create an order and upload proof
curl -b cj.txt -X POST $BASE/api/payments/orders -H 'Content-Type: application/json' \
  -d '{"projectId":"<id>","method":"KBZPay","txnRef":"CHK-001"}'
curl -b cj.txt -X POST $BASE/api/payments/orders/<orderId>/proof -F "proof=@screenshot.png"

# download a purchased file (200 only after approval)
curl -b cj.txt -OJ $BASE/api/files/<projectId>/download
```
