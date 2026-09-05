# 02 — Architecture Blueprint

## 1. High-level topology (decoupled)

```
                        ┌───────────────────────────────────────────────┐
                        │                  BROWSER (PWA)                  │
                        │   Next.js (React + TS) + Tailwind, App Router   │
                        └───────────────┬───────────────────────────────┘
                                        │  HTTPS, JSON, HttpOnly cookie (JWT)
                                        │  same-origin /api/* proxied → backend
                        ┌───────────────▼───────────────────────────────┐
                        │        Node.js + Express REST API (TS)          │
                        │  ┌─────────────┬──────────────┬──────────────┐ │
                        │  │  Auth/RBAC  │  Similarity  │  Payments/    │ │
                        │  │  (JWT,bcrypt)│  Engine     │  PurchaseAccess│ │
                        │  ├─────────────┼──────────────┼──────────────┤ │
                        │  │  Projects   │  Uploads      │  Audit Log   │ │
                        │  │  Browse/Facet│ (Multer)     │              │ │
                        │  └─────────────┴──────────────┴──────────────┘ │
                        └───────┬─────────────────────────┬──────────────┘
                                │ Prisma ORM              │ fs stream (private dir)
                        ┌───────▼────────┐        ┌───────▼───────────────┐
                        │  PostgreSQL     │        │  Private file storage  │
                        │  + pg_trgm GIN  │        │  /storage/private/…    │
                        │  (SQLite in dev)│        │  (never static-served) │
                        └─────────────────┘        └────────────────────────┘
```

## 2. Component responsibilities

- **Frontend (Next.js):** SSR/CSR pages for public browse & search, project detail, auth,
  purchase flow, and a role-gated admin dashboard. Talks only to the backend REST API.
  Never holds secrets. Reads auth state from `/api/auth/me` (cookie-based).
- **Backend (Express):** Single source of truth for authZ, similarity ranking, file access,
  and payment lifecycle. Stateless (JWT), horizontally scalable.
- **Database (PostgreSQL/Prisma):** Relational store; `pg_trgm` for indexed fuzzy search.
- **Private storage:** Full project files on disk outside webroot; streamed only after
  `PurchaseAccess` check.

## 3. Request/trust flow for a **paid download** (the critical path)

1. Anonymous user searches → sees title + summary + price (no file).
2. To buy: must log in (JWT cookie issued).
3. User creates a `PaymentOrder` and uploads proof (txn ref + screenshot).
4. Admin reviews evidence → approves → system creates `PurchaseAccess(userId, projectId)` +
   `AuditLog`.
5. User calls `GET /api/files/:projectId/download`.
6. Middleware: `authenticate` → `hasPurchaseOrAdmin` → stream file from private dir.
   No public URL ever exists for the file.

## 4. Security architecture (defense in depth)

| Layer | Control |
|-------|---------|
| Transport | HTTPS everywhere (platform TLS) |
| Auth | JWT (short-lived) in **HttpOnly, Secure, SameSite=Lax** cookie; bcrypt(12) |
| AuthZ | Central RBAC middleware; every admin route requires `role=ADMIN` server-side |
| Files | Private dir + per-request `PurchaseAccess` gate; MIME + ext whitelist + size cap on upload |
| Input | Zod validation on every body/query/param; Prisma parameterization (no raw string SQL) |
| Abuse | `express-rate-limit` on auth & search; Helmet headers; CORS locked to frontend origin |
| Secrets | `.env` only, never in frontend bundle; admin seeded from env |
| Audit | `AuditLog` for privileged mutations |
| Consent | DB constraint enforced in service layer: cannot set `PUBLISHED` unless `hasConsent` |

## 5. Similarity engine design

**Normalization pipeline** (shared by ingest + query):
`Unicode NFC → trim → lowercase/case-fold → collapse whitespace → strip punctuation →
remove stopwords (en) → store normalizedTitle`.

**Scoring (portable engine):** blended score =
`0.55·trigramJaccard + 0.30·tokenOverlap(Jaccard) + 0.15·(1 − normalizedLevenshtein)`.

- `score ≥ EXACT_THRESHOLD (0.85)` → flagged **EXACT/NEAR-DUPLICATE**.
- `SIMILAR_THRESHOLD (0.30) ≤ score < 0.85` → **SIMILAR**, ranked desc.

**Production (PostgreSQL):** same normalization at write time; query uses
`WHERE normalized_title % :q ORDER BY similarity(normalized_title,:q) DESC` backed by a
`GIN (normalized_title gin_trgm_ops)` index for scale. The portable engine and pg_trgm are
selected by `DB_PROVIDER`.

## 6. Environment / config strategy

- `DB_PROVIDER = sqlite | postgresql` switches Prisma datasource + similarity backend.
- All thresholds, JWT secret/TTL, admin seed, CORS origin, upload limits via env.
- 12-factor: config in env, logs to stdout, stateless processes.

## 7. Deployment target

- Frontend → Vercel. Backend → Render/Railway. DB → Neon/Supabase PostgreSQL (enable `pg_trgm`).
- Private storage: for a single-node deploy, local disk; for scale, swap the `StorageService`
  implementation for S3-compatible object storage with signed, short-TTL URLs (documented seam).

## 8. Why decoupled (thesis justification)

Independent scaling, clear API contract, multiple future clients (mobile), separation of
concerns for security review, and independent CI/CD. Trade-off (CORS/auth complexity, network
hop) is accepted and mitigated by the same-origin `/api` proxy in Next.js.
