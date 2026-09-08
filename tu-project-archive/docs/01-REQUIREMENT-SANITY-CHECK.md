# 01 — Requirement Sanity-Check

**Project:** Myanmar Technological Universities Project Archive and Intelligent Title Similarity Checker System
**Short name:** TU Project Archive & Title Similarity Checker
**Reviewer role:** Senior Full-Stack Architect
**Date:** 2026-09-02

This document critically reviews the brief *before* any code is written. It surfaces
contradictions, ambiguities, weak ideas, and risks, then records the decisions taken so the
build is internally consistent and thesis-defensible.

---

## 1. What the brief gets right (keep as-is)

| # | Requirement | Verdict |
|---|-------------|---------|
| R1 | Decoupled architecture (separate frontend + backend REST API) | ✅ Correct, modern, thesis-friendly |
| R2 | Browsing/searching without login; purchasing requires login | ✅ Clear, sound access model |
| R3 | Normalized titles + ranked similarity | ✅ Core value; keep |
| R4 | `pg_trgm` for trigram similarity in PostgreSQL | ✅ Right tool for the job |
| R5 | JWT in **HttpOnly** cookies, bcrypt hashing | ✅ Secure default |
| R6 | Server-side `PurchaseAccess` checks for paid files | ✅ Mandatory; the only real protection |
| R7 | `has_consent = true` required before publishing | ✅ Ethically + legally correct for student IP |
| R8 | Manual MMK payment verification workflow | ✅ Realistic for Myanmar (KBZPay / Wave / AYA bank transfers) |
| R9 | Multer + MIME + extension whitelist + size limit | ✅ Correct file-upload hardening |

---

## 2. Contradictions & weak ideas found → decisions

### C1. "3-click logo trigger" as admin access
- **Problem:** A hidden UI trigger is *security by obscurity*. The brief already acknowledges this
  ("only hidden UI, not real security").
- **Decision:** Implement it as **pure UX convenience only**. The real gate is server-side
  role checks (`role = ADMIN`) on every admin API route. The 3-click trigger and the
  `/portal-hidden-access` fallback route both simply *reveal a login form*; they grant
  **zero** privileges by themselves. Documented as an explicit non-security feature.

### C2. Paid files "must not be exposed via public static URLs" vs. simple file serving
- **Problem:** Multer stores files on disk; the naive approach serves them via a static folder,
  which leaks them.
- **Decision:** Paid files are stored **outside any static/public directory**. They are streamed
  only through an authenticated endpoint `GET /api/files/:projectId/download` that runs a
  `PurchaseAccess` check (or admin role) before streaming bytes. Free summary/preview assets may
  be public; full project files never are.

### C3. `pg_trgm` requirement vs. portability / sandbox
- **Problem:** `pg_trgm` is PostgreSQL-only. The grading/demo environment may not always have it.
- **Decision:** Two-layer similarity strategy:
  1. **Production (PostgreSQL):** `pg_trgm` GIN index + `similarity()` / `%` operator for fast,
     scalable ranked search.
  2. **Portable engine:** A deterministic application-level similarity service (title
     normalization + trigram Jaccard + token overlap + Levenshtein ratio) that produces the
     **same ranked shape** of results. This lets the app run on SQLite for local dev/demo and
     degrades gracefully if the extension is unavailable.
- **Thesis value:** This is a legitimate, defensible engineering decision (portability +
  graceful degradation) and gives a nice comparison chapter.

### C4. "PWA-ready" vs. thesis scope
- **Problem:** Full offline PWA is large scope with limited academic payoff here.
- **Decision:** Ship a valid `manifest.webmanifest` + installability + responsive design
  (PWA-*ready*), but do **not** build complex offline sync. Documented as scoped.

### C5. Payment: real gateway vs. manual verification
- **Problem:** Myanmar has limited card-gateway support; brief says manual MMK.
- **Decision:** Manual verification workflow only. Student uploads a payment proof (screenshot +
  transaction reference), status flows `PENDING → APPROVED/REJECTED`, admin approves, which
  creates a `PurchaseAccess` row. No card data ever touches the system (PCI scope = zero).

### C6. Roles: many actor types listed, unclear permission matrix
- **Problem:** Students, teachers, supervisors, department admins, university admins, main admin —
  too many to model as distinct tables for a thesis MVP.
- **Decision:** Collapse to a clean **RBAC role enum**: `STUDENT`, `STAFF` (teachers/supervisors),
  `ADMIN` (department/university/platform admin, distinguished by an optional scope field).
  Keeps the permission matrix small and auditable while covering all listed actors. Documented.

### C7. "Search project titles" + "detect exact or similar" + "browse" overlap
- **Decision:** One unified search endpoint returns: (a) exact/near-exact matches flagged
  distinctly, (b) ranked similar titles with a percentage score, plus faceted browse filters
  (year, university, level, department). No duplicate endpoints.

---

## 3. Missing-but-non-blocking items → intelligently decided

| Gap | Decision |
|-----|----------|
| Currency / price model | Prices stored in **MMK** as integer (no decimals for kyat). Per-project price, default configurable. |
| Academic levels | Enum: `YEAR_3`, `YEAR_5`, `FINAL_YEAR` (matches primary users) + `OTHER`. |
| Universities/Departments | Seeded reference tables (Y.T.U, M.T.U, T.U-Mandalay, etc.) — editable by admin. |
| Similarity threshold | Default **exact ≥ 0.85**, **similar ≥ 0.30** (tunable via env). |
| Duplicate-title policy | Not blocked; the tool *warns*, it does not prevent — that is the product's purpose. |
| Audit trail | Add `AuditLog` for admin actions (approve payment, publish, delete) — thesis + security value. |
| Initial admin | Created via **seed using env vars** (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`). Never hardcoded. |
| Rate limiting | Applied to auth + search endpoints to prevent abuse/scraping. |

---

## 4. Explicit assumptions

1. The demo/grading environment may lack PostgreSQL; the app must still run (→ SQLite dev DB +
   portable similarity engine). Production deployment uses managed PostgreSQL (Neon/Supabase).
2. Payment reconciliation is **human-in-the-loop**; the system records evidence and access, not money movement.
3. Uploaded full-project files are copyrighted student work; publication requires recorded consent.
4. English + Myanmar Unicode titles must both normalize safely (Unicode NFC, case-fold, punctuation strip).

---

## 5. Non-goals (scoped out, documented)

- Real payment gateway / card processing.
- Plagiarism detection on *file contents* (only **title** similarity is in scope).
- Full offline-first PWA sync.
- Multi-tenant billing.

---

## 6. Sanity-check verdict

The brief is **coherent and buildable** after the seven contradiction fixes above. The only
hard environmental constraint is PostgreSQL availability, resolved by the dual similarity
strategy. No blocking questions remain — proceeding to architecture and wave build.
