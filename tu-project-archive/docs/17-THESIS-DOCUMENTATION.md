# 17 — Thesis Documentation (English)

**Project:** Myanmar Technological Universities Project Archive & Intelligent Title Similarity Checker
**Type:** Final-year IT thesis system
**Stack:** Node.js + Express + TypeScript (ESM) · Prisma (SQLite dev / PostgreSQL + `pg_trgm` prod) ·
Next.js 15 (App Router) · JWT (HttpOnly cookie) · bcrypt · Zod · Helmet

This document is written to be pasted, section by section, into a thesis. It describes the system as
built and verified, not as merely planned.

---

## 1. Overview

The TU Project Archive is a decoupled web application that lets students of Myanmar's Technological
Universities **search past final-year project titles**, **detect whether a proposed title duplicates
an existing one**, **browse the archive** by university, department, year and academic level, read
project **summaries**, and **purchase access** to full project files through a **manual MMK
(Myanmar Kyat) payment** workflow. Administrators manage the catalogue, upload paid files, moderate
payments, and monitor usage.

The system separates a stateless JSON API (backend) from a server-rendered UI (frontend). Browsing
and searching are free and require no login; purchasing requires an account; administration is
protected by server-side role checks and is reachable only through a non-advertised entry point. The
interface is **Burmese-first**, keeping widely understood English technical terms in place.

---

## 2. Problem Statement

Across Myanmar's Technological Universities, past student projects are recorded inconsistently — in
departmental folders, spreadsheets, and printed libraries. This creates three concrete problems:

1. **Undetected duplicate topics.** Students unknowingly re-propose titles that closely match earlier
   work, wasting supervisor time and weakening originality.
2. **Poor discoverability.** There is no unified, filterable catalogue of prior projects, so students
   cannot easily learn from earlier work or judge how crowded a topic area is.
3. **No controlled access to deliverables.** Full project files (reports, code) either circulate
   informally without author consent, or are effectively inaccessible.

The archive addresses all three: an **intelligent similarity checker** for duplicate detection, a
**faceted catalogue** for discovery, and a **consent-gated, payment-controlled** file distribution
channel.

---

## 3. Objectives

- Provide a **free, login-less** title search that ranks existing projects by textual similarity.
- Provide a **duplicate-risk checker** that classifies a proposed title as
  `LIKELY_UNIQUE`, `SIMILAR_EXISTS`, or `DUPLICATE_RISK`.
- Provide **faceted browsing** (university → department, year, academic level, keyword).
- Expose only **metadata/summaries** publicly; keep full files private.
- Implement a **manual MMK payment workflow** (order → proof upload → admin verification → access).
- Enforce **author consent** before a project can be published.
- Provide an **admin dashboard** for catalogue CRUD, file upload, payment moderation, user roles,
  audit trail, and search analytics.
- Meet **production-grade security** and be **thesis-defensible** in architecture and implementation.

---

## 4. Scope

**In scope.** Public title search + duplicate check; faceted browse and project detail; account
registration/login; manual MMK purchase flow with proof upload and admin verification; protected
file download gated by purchase; admin management of projects, files, universities, departments,
users, payments; audit logging; search analytics; bilingual (Burmese-first) UI; PWA packaging.

**Out of scope (deliberate, documented non-goals).** Automated/online payment-gateway integration
(the environment requires manual MMK verification); full-text search inside file contents (titles and
metadata only); plagiarism detection of document bodies (the checker targets **titles**);
multi-tenant per-university isolation (a single shared catalogue with a university dimension).

---

## 5. System Architecture

**Decoupled two-tier design.**

```
Browser (Next.js 15 App Router, Burmese-first UI, PWA)
   │  relative /api/* calls, credentials: 'include'
   ▼
Next.js dev/proxy  ──rewrite /api/:path*──▶  Express API (TypeScript, ESM)
                                              │
                                              ├─ middleware: helmet · cors(allowlist) · json limit ·
                                              │   trust-proxy · tiered rate limiting · auth · error
                                              ├─ modules: auth · projects · search · files · payments ·
                                              │   admin · universities
                                              ├─ lib: errors · http (envelope/params) · audit · prisma
                                              ▼
                                   Prisma ORM ──▶ SQLite (dev)  |  PostgreSQL + pg_trgm (prod)
                                              ▼
                                   Private file storage (never static-served)
```

**Why decoupled.** A clean API boundary makes the backend independently testable (Vitest hits the
same routes the UI uses), lets the two tiers deploy/scale separately, and keeps all trust decisions
(auth, RBAC, purchase checks, file streaming) on the server where they cannot be bypassed by the
client.

**Layering inside the API.** Routes handle HTTP + validation; services hold business logic;
`lib/` holds cross-cutting helpers (typed error factories, response envelope, audit writer, Prisma
client). This keeps controllers thin and logic unit-testable.

**Portability by design.** The database provider is chosen at runtime (`DB_PROVIDER`). In production
the search uses PostgreSQL's `pg_trgm` extension; in dev/demo a **portable similarity engine**
reproduces the same ranking shape on SQLite, so the app is runnable anywhere without Docker while
staying faithful to the production algorithm.

---

## 6. Database Design

Core entities (Prisma models):

- **University** — `id, name, shortName`; has many Departments and Projects.
- **Department** — `id, name, universityId`; belongs to a University.
- **Project** — `id, title, normalizedTitle, abstract, keywords, year, level (enum), authorsText,
  supervisorName, status, hasConsent, priceMmk, fileName, fileStorageKey, fileSizeBytes,
  fileMimeType, universityId, departmentId, timestamps`.
  - `normalizedTitle` is precomputed for fast, consistent matching.
  - The four `file*` fields describe the **private** paid file; `fileStorageKey` is never serialized
    to public clients.
  - `hasConsent` gates publication.
- **User** — `id, email, name, passwordHash (bcrypt), role (STUDENT|ADMIN), timestamps`.
- **PaymentOrder** — `id, userId, projectId, method (enum), txnRef, status (PENDING|APPROVED|REJECTED),
  proofKey, reviewNote, timestamps`. Indexed for the moderation queue.
- **PurchaseAccess** — `id, userId, projectId, grantedAt` (unique per user+project): the single
  source of truth for "may this user download this file".
- **AuditLog** — `id, action, actorId, targetId, meta, createdAt`; indexed. Records logins,
  registrations, file downloads, uploads, and payment decisions.
- **SearchLog** — records SEARCH/CHECK events with the verdict, powering admin analytics.

**Design decisions.** `normalizedTitle` stored (not computed per query) → cheap ranking and a stable
`pg_trgm` GIN index target. `PurchaseAccess` separated from `PaymentOrder` → access is a durable fact
independent of an order's moderation state, and approval is idempotent. Enums (`level`, payment
`method`, `status`) enforce valid domains at the DB and validation layers.

---

## 7. Title Similarity Algorithm

The goal is to rank existing titles by closeness to a query and to band matches as EXACT vs SIMILAR.

**Normalization** (`normalize.ts`, shared by ingest and query so both sides are treated identically):
Unicode `NFC` → lowercase → replace every non-alphanumeric (Unicode-aware) run with a single space →
collapse whitespace. A small, deliberately compact English stopword list (`the, of, for, using,
based, system, project, …`) is used only for token overlap; it is kept small because academic titles
are short and aggressive stopword removal hurts recall.

**Blended score** (`similarity.ts`):

```
score = 0.55 · trigramJaccard + 0.30 · tokenOverlap + 0.15 · (1 − normalizedLevenshtein)
```

- **Trigram Jaccard (0.55)** — character-trigram set overlap, mirroring exactly what PostgreSQL
  `pg_trgm` measures. This is the backbone and the reason the dev engine and the prod extension agree
  in shape.
- **Token overlap (0.30)** — word-level Jaccard on content tokens; robust to word reordering
  ("A of B" vs "B A").
- **Edit distance (0.15)** — `1 − normalizedLevenshtein`; catches small typos / near-identical titles.

Scores are 0–1 (reported to 3 decimals). `kind = EXACT` when `score ≥ SIMILARITY_EXACT_THRESHOLD`
(0.85), otherwise `SIMILAR`; results below `SIMILARITY_SIMILAR_THRESHOLD` (0.30) are dropped. Both
thresholds are configurable via env.

**Production path.** When `DB_PROVIDER=postgresql`, a tagged `$queryRaw` uses `similarity()` with a
low trigram pre-filter (`> threshold/2`) to cheaply shortlist candidates via the GIN `gin_trgm_ops`
index, then re-ranks the shortlist with the same blended score in application code. On SQLite, the
engine loads candidates and scores them directly. Either way the ranking function is identical, which
is what makes the results defensible.

**Duplicate check.** `/search/check` runs the same ranking on a proposed title and maps it to a
verdict: an EXACT hit → `DUPLICATE_RISK`; only SIMILAR hits → `SIMILAR_EXISTS`; none → `LIKELY_UNIQUE`.

---

## 8. Authentication & Authorization

- **Credentials.** Passwords hashed with **bcrypt (cost 12)**; verified live (`$2b$12$…`). Login is
  constant-time against a `DUMMY_PASSWORD_HASH` when the user is absent, removing a user-enumeration
  timing oracle.
- **Sessions.** On login/register the API issues a **JWT signed with HS256** (algorithm pinned to
  prevent `alg` confusion) and sets it in an **HttpOnly, SameSite=Lax cookie** (`tu_token`,
  `Max-Age=21600` = 6 h). The token is never exposed to JavaScript or stored in `localStorage`.
- **Authorization.** `requireAuth` validates the cookie; `requireAdmin`/`requireRole` **re-reads the
  user's role from the database** on each request, so a token minted before a demotion cannot retain
  admin power. The whole `/api/admin` router is guarded (`requireAuth, requireAdmin`).
- **Boot guards.** In production the server refuses to start (`exit(1)`) if `JWT_SECRET` is missing,
  short (< 32 chars), or left at a default — failing safe rather than running insecurely.

---

## 9. Payment Workflow (Manual MMK)

Online gateways are not available in the target environment, so payment is **manual and verifiable**:

1. **Order.** A logged-in student `POST /api/payments/orders` with `{ projectId, method, txnRef? }`.
   `method ∈ {KBZPay, WavePay, AYAPay, CBPay, BankTransfer}` (enum-validated; anything else → `400`).
   A duplicate purchase/order is rejected `409`.
2. **Proof.** The student pays out-of-band, then uploads a screenshot via
   `POST /api/payments/orders/:id/proof`. The image is **magic-byte validated** and stored privately;
   re-uploading replaces and deletes the old proof.
3. **Moderation.** An admin sees the queue (`GET /api/admin/payments`) — each row carries a boolean
   `hasProof` but **never** the proof storage key — and streams the screenshot via the admin-only
   `GET /api/admin/payments/:id/proof`.
4. **Decision.** `approve` creates a `PurchaseAccess` row (idempotent, transactional) and writes a
   `PAYMENT_APPROVED` audit entry; `reject` records a note, grants nothing, and writes
   `PAYMENT_REJECTED`.
5. **Access.** Once approved, the file is downloadable via the purchase-gated stream and appears in
   the buyer's "my library" (`GET /api/payments/purchases/mine`).

**Verified end-to-end** (through the frontend proxy): order → proof `201` → admin `hasProof=true`
without key leak → admin proof stream `200 image/png` → non-admin `403` → pre-approval download `403`
→ approve `200` → post-approval download `200`.

---

## 10. Admin Workflow

The admin dashboard (Burmese UI, hidden entry) provides:

- **Dashboard stats** (`/admin/stats`) — project/user counts, pending payments, revenue.
- **Project management** — list/create/update/delete, with the **consent gate** enforced on
  create/update; deleting a project best-effort cleans up its paid file and any related proofs.
- **File upload** (`POST /api/files/:id/upload`) — attach/replace the paid file; magic-byte validated.
- **Payment moderation** — queue, proof viewing, approve/reject with note.
- **Reference data** — CRUD for universities and departments.
- **User management** — list users, change roles.
- **Audit log** (`/admin/audit`) and **search analytics** (`/admin/search-logs`).

**Hidden entry.** There is no `/admin` link in the public navigation (verified: absent from home
HTML). Admins reach the panel via `/portal-hidden-access` or a 3-click on the site logo. This is
obscurity layered **on top of** real server-side RBAC, not instead of it — every admin API call is
independently authorized.

---

## 11. Security

| Control | Implementation | Verified |
|---------|----------------|----------|
| Transport headers | Helmet + explicit CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` | `curl -i /health` |
| Session | HS256 JWT (pinned) in HttpOnly SameSite=Lax cookie, 6 h TTL | `Set-Cookie` inspected |
| Passwords | bcrypt cost 12; constant-time login | DB `$2b$12$…` |
| RBAC | `requireAuth`/`requireAdmin` with live DB role re-read; whole admin router guarded | `403`/`401` probes |
| Input validation | Zod on every body/query; `400 VALIDATION_ERROR` | bad payloads rejected |
| Upload safety | magic-byte content sniffing (not extension/MIME); size cap; extension allowlist | disguised GIF-as-PDF → `400` |
| File confidentiality | private storage dir, **no static route** on either tier; download gated by `PurchaseAccess`; RFC 5987 filenames | anon `401`, no-purchase `403`, `/storage/*` `404` |
| Secret hygiene | no server secrets in frontend; prod boot guards on `JWT_SECRET` | grep clean; guards in `env.ts` |
| CORS | origin allowlist (`FRONTEND_ORIGIN`) + credentials, not `*` | `app.ts` |
| Abuse | tiered rate limiting (global/auth/search/upload) → `429` | limiters mounted |
| Injection | Prisma parameterization; only tagged `$queryRaw`, no `*Unsafe` variants | grep clean |
| Accountability | audit log on logins, uploads, downloads, payment decisions | rows confirmed |
| Supply chain | `npm audit` = 0 vulnerabilities; Prisma/TypeScript pinned off known-bad majors | — |

---

## 12. Testing & Quality Assurance

- **Automated tests: 39/39 passing** — `similarity.test.ts` (12, algorithm unit tests) and
  `api.test.ts` (27, integration across auth, projects, search, payments, files, admin, and the full
  payment→approval→download flow).
- **Typechecking:** backend and frontend both compile with `tsc --noEmit` errors = 0.
- **Supply chain:** `npm audit` = 0 vulnerabilities.
- **Live verification:** the completeness (32 items) and QA/security (16 items) checklists in
  [`14-COMPLETENESS-CHECKLIST.md`](14-COMPLETENESS-CHECKLIST.md) and
  [`15-QA-CHECKLIST.md`](15-QA-CHECKLIST.md) were each exercised against the running servers, not
  merely asserted. See also the adversarial audit in [`12-ADVERSARIAL-AUDIT.md`](12-ADVERSARIAL-AUDIT.md).

---

## 13. Limitations

- **Manual payment verification** introduces human latency between payment and access (by design; no
  gateway available). It also trusts an admin to read screenshots correctly.
- **Title-level similarity only** — the checker compares titles, not document bodies, so it cannot
  detect content plagiarism or paraphrased-but-differently-titled duplicates.
- **English-tuned normalization** — stopwords and trigram behavior are strongest for
  English/Romanized titles; native Myanmar-script titles are handled (Unicode-safe) but not
  linguistically stemmed.
- **Single shared catalogue** — no per-university tenant isolation or per-university admin scoping.
- **Dev/prod search parity is by design, not identity** — the portable engine mirrors `pg_trgm`'s
  shape but is not bit-for-bit identical to the extension's internal scoring.

---

## 14. Future Work

- Integrate a real **online payment gateway** (or bank API) to automate verification while keeping
  the manual path as a fallback.
- Extend similarity to **abstract/keyword** and eventually **document-body** comparison for true
  plagiarism screening.
- Add **Myanmar-script-aware** tokenization/stemming to improve native-title matching.
- **Per-university roles** and scoped admin dashboards for federated administration.
- **Email/SMS notifications** on payment approval/rejection.
- **Recommendation** ("related projects") using the same trigram/embedding signals.
- Optional **semantic search** via embeddings layered on top of the lexical `pg_trgm` ranking.
