# 10 — Final Architecture Summary

A single, defense-ready overview of the delivered system: what it is, how the pieces fit, why
the key decisions were made, and what is deliberately left for future work.

---

## 1. One-paragraph summary

The **Myanmar Technological Universities Project Archive & Intelligent Title Similarity Checker**
is a decoupled web application. A **Next.js (App Router, TypeScript, Tailwind)** frontend — a
Burmese-first, installable PWA — talks to a stateless **Node/Express (TypeScript) REST API**,
which persists to **PostgreSQL via Prisma** using the **`pg_trgm`** extension for scalable fuzzy
title search. Students search and browse for free; buying full project files requires an account
and flows through a **human-verified manual MMK payment** process; a role-gated admin dashboard
manages records, files, payments, access, and analytics. Paid files are never publicly
addressable — every download passes a server-side `PurchaseAccess` check.

## 2. Component topology

```
                     Browser (PWA, Burmese-first)
                              │  same-origin /api/*  (HttpOnly cookie)
                              ▼
   Vercel ───────────  Next.js frontend  ── rewrites /api/* ──▶  Express API (Render/Railway)
                                                                       │
                                        ┌──────────────────────────────┼───────────────┐
                                        ▼                              ▼                ▼
                                 PostgreSQL + pg_trgm         Private file storage   Audit + SearchLog
                                 (Neon / Supabase)            (disk / S3 seam)       (analytics)
```

- **Why decoupled?** The frontend and API deploy, scale, and version independently; the API is a
  reusable product surface (a future mobile app or a bulk-import script can consume the same REST
  endpoints). It also matches the brief's explicit hosting split (Vercel + Render + Neon).
- **Why the `/api` rewrite?** The browser only ever sees one origin, so the JWT cookie stays
  first-party (`SameSite=Lax` + `Secure`) with no CORS preflight for normal use, while the API
  still enforces a strict CORS allowlist for defense in depth.

## 3. Request lifecycle (representative: a paid download)

1. Browser `GET /api/files/:projectId/download` (cookie attached automatically).
2. Express: `helmet` → CORS → rate limiter → cookie/JWT parse (**HS256 pinned**).
3. `requireAuth` verifies the token; `requireRole`/ownership logic **re-reads the DB** so a
   revoked user can't ride a still-valid token.
4. Service checks `PurchaseAccess (userId, projectId)` (unique → O(1)); admins bypass via role.
5. On success the file is **streamed from private storage** with a path-traversal guard; there is
   no static URL for paid content. On failure: `401`/`403`/`404` — never `200` with the bytes.

## 4. The similarity engine (the thesis's core contribution)

- **Normalization:** Unicode NFC, case-folding, punctuation stripping, whitespace collapse, and
  stopword handling → a stable `normalizedTitle` stored per project.
- **Blended score:** `0.55 × char-trigram Jaccard + 0.30 × token Jaccard + 0.15 × normalized
  edit-distance`, yielding 0–100 %.
- **Banding:** `≥ 0.85` → **EXACT** (duplicate risk); `≥ 0.30` → **SIMILAR**; else unique.
  The `/check` endpoint maps these to `DUPLICATE_RISK / SIMILAR_EXISTS / LIKELY_UNIQUE`.
- **Two backends, one behavior:** production retrieves candidates with a `pg_trgm` GIN index and
  reranks with the blended scorer; a portable pure-TS engine mirrors the same math for SQLite
  dev/demo — a deliberate **graceful-degradation / portability** design so the project runs with
  zero infra for a viva while remaining scalable in production.

## 5. Data model (essentials)

`University 1─* Department 1─* Project`; `Project 1─* PaymentOrder`; `User 1─* PurchaseAccess *─1
Project` (unique pair). Cross-cutting: `AuditLog` (who did what) and `SearchLog` (search/check
analytics). Full ERD, columns, and indexing rationale live in `05-DATABASE-DESIGN.md`.

## 6. Security posture (summary)

Server-side RBAC on every privileged route (UI hiding is never trusted); JWT in HttpOnly cookies
with a pinned algorithm and live role re-check; bcrypt(12); Zod `.strict()` input validation;
parameterized queries via Prisma; Helmet + CORS allowlist; tiered rate limiting (global / auth /
upload / search); magic-byte upload validation; author-consent gate before publishing; and
audited auth events. `npm audit`: **0 vulnerabilities** on both apps. Details in `09-SELF-REVIEW.md`.

## 7. Quality gates

- **Backend:** `tsc --noEmit` clean; **31 automated tests** (Vitest + Supertest) — similarity unit
  tests + API integration tests covering RBAC, consent gate, paid-file protection, and Wave 5
  hardening. Plus scripted live security probes (JWT forgery, stale role, MIME spoofing).
- **Frontend:** `tsc --noEmit` clean; responsive Burmese-first UI with skeleton/empty/error/offline
  states and route-level error + 404 boundaries.

---

## 8. Known limitations (honest)

1. **Title-level similarity, not plagiarism detection.** The system compares titles, not full
   documents; two projects with different titles but identical content won't be flagged.
2. **Manual payment reconciliation.** MMK verification is human-in-the-loop by design (no gateway
   integration), so access grants are as timely as an admin's review.
3. **Single-node file storage by default.** Uploaded files sit on a local/disk volume; the S3
   seam exists in `lib/storage.ts` but object storage is not wired.
4. **No labeled evaluation yet.** Similarity thresholds (0.85 / 0.30) are reasoned defaults, not
   tuned against a hand-labeled dataset with measured precision/recall.
5. **Burmese normalization is pragmatic.** It handles NFC + common cases but not the full space of
   Zawgyi↔Unicode font issues or every orthographic variant.
6. **PWA is installable + offline-fallback, not fully offline-first.** Dynamic data (search
   results, library) requires connectivity; only shell/navigation degrade gracefully.
7. **Single-region, single-instance assumptions.** Rate limiting is in-memory (per instance); a
   multi-instance deploy would need a shared store (e.g. Redis).

## 9. Future work

1. **Quantitative evaluation:** build a labeled duplicate/near-duplicate title set; report
   precision/recall/F1; tune thresholds; compare the portable scorer vs raw `pg_trgm`.
2. **Abstract-level & semantic similarity:** extend beyond titles using TF-IDF or multilingual
   sentence embeddings for near-duplicate detection.
3. **Object storage + CDN** for files; **antivirus scanning** (ClamAV) on upload.
4. **Payment gateway** (KBZPay/Wave) integration to automate verification, keeping the manual
   path as a fallback.
5. **Refresh-token rotation** and shared-store rate limiting for horizontal scale.
6. **Full offline-first PWA** with background sync and cached read models.
7. **Bulk import** tooling for departments to onboard historical archives at scale.
8. **Observability:** centralized logging/metrics and alerting on 401/403 spikes.
