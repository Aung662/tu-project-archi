# TU Project Archive & Title Similarity Checker

**Myanmar Technological Universities Project Archive and Intelligent Title Similarity Checker System**

A production-grade, decoupled web application where students can search past project titles,
detect exact/similar previous titles before proposing their own, browse the archive by year /
university / level / department, read summaries, and purchase access to full project files via
manual MMK payment verification. Admins manage records, files, payments, and access.

> Final-year IT thesis project. Browsing & searching are free and need no login; buying full
> files requires an account; the admin dashboard is protected by server-side role checks.

---

## ✨ Features

- **Intelligent title similarity** — normalized titles + blended trigram / token / edit-distance
  scoring, ranked 0–100 %, with EXACT (duplicate-risk) vs SIMILAR banding. Runs on `pg_trgm` in
  production and a portable engine in dev.
- **Duplicate-risk checker** — paste a proposed title → `LIKELY_UNIQUE / SIMILAR_EXISTS / DUPLICATE_RISK`.
- **Faceted browse** — filter by university → department, year, academic level, keyword.
- **Manual MMK purchase flow** — create order → upload payment proof → admin verifies → access granted.
- **Protected paid files** — streamed only after a server-side `PurchaseAccess` check; never a public URL.
- **Consent gate** — a project can't be published unless author consent is recorded.
- **Admin dashboard** — stats, project CRUD + file upload, payment moderation, user roles,
  audit log, and **search analytics** (SEARCH/CHECK volume + duplicate-risk counts).
- **Security** — JWT in HttpOnly cookies (HS256 pinned + live role re-check), bcrypt(12), RBAC,
  Zod validation (strict schemas), Helmet, CORS allowlist, tiered rate limiting, and
  **magic-byte-validated uploads** (not just extension/MIME). `npm audit`: **0 vulnerabilities**.
- **Installable PWA** — web manifest, maskable icons, offline fallback page, and a service
  worker (network-first navigations, stale-while-revalidate assets; API never cached).
- **Polished UX** — responsive Burmese-first UI with skeleton loaders, empty states, and
  route-level error / 404 / offline boundaries.

## 🧱 Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router, React 18, TypeScript), Tailwind CSS, PWA-ready |
| Backend | Node.js + Express 5 (TypeScript), Zod, Multer |
| Database | PostgreSQL + `pg_trgm` (prod) / SQLite (dev) via Prisma ORM |
| Auth | JWT (HttpOnly cookies) + bcrypt |

## 🚀 Run locally (2 minutes, no database server needed)

```bash
# Backend
cd backend && cp .env.example .env && npm install
npm run prisma:generate && npm run prisma:migrate && npm run seed && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open http://localhost:3000.

**Demo accounts**
- Admin — `admin@tu-archive.mm` / `ChangeMe_Admin#2026`
- Student — `student@tu-archive.mm` / `Student#2026`

**Reach the admin login:** triple-click the **TU** logo, or visit `/portal-hidden-access`.

See [`docs/04-SETUP-AND-FOLDER-STRUCTURE.md`](docs/04-SETUP-AND-FOLDER-STRUCTURE.md) for the
PostgreSQL setup and full folder map.

## 🧪 Tests

```bash
cd backend && npm run seed && npm test    # 39/39 passing (unit + integration + hardening + payment flow)
```

## 📚 Documentation (thesis-ready)

| Doc | Contents |
|-----|----------|
| `docs/01-REQUIREMENT-SANITY-CHECK.md` | contradictions found + decisions |
| `docs/02-ARCHITECTURE-BLUEPRINT.md` | topology, security, similarity design |
| `docs/03-WAVE-PLAN.md` | build waves |
| `docs/04-SETUP-AND-FOLDER-STRUCTURE.md` | setup + structure |
| `docs/05-DATABASE-DESIGN.md` | ERD, tables, indexing, rules |
| `docs/06-BACKEND-AND-FRONTEND-PLAN.md` | API surface + pages |
| `docs/07-TESTING-QA.md` | test + security checklists |
| `docs/08-DEPLOYMENT.md` | Vercel + Render + Neon guide |
| `docs/09-SELF-REVIEW.md` | final critical self-review |
| `docs/10-ARCHITECTURE-SUMMARY.md` | final architecture summary, limitations, future work |
| `docs/11-THESIS-DEFENSE-NOTES.md` | viva/defense Q&A prep |
| `docs/12-ADVERSARIAL-AUDIT.md` | ruthless QA + security + performance audit |
| `docs/13-REQUIREMENT-COVERAGE.md` | line-by-line requirement coverage matrix |
| `docs/14-COMPLETENESS-CHECKLIST.md` | 32-item completeness checklist, live-verified against the running system |
| `docs/15-QA-CHECKLIST.md` | 16-item QA/security checklist, live-verified |
| `docs/16-API-REFERENCE.md` | full REST API reference (all routes: auth/projects/search/payments/files/admin/metadata) |
| `docs/17-THESIS-DOCUMENTATION.md` | thesis-ready English documentation (14 sections) |
| `docs/18-BURMESE-SUMMARY.md` | formal Burmese thesis summary (11 parts) |
| `docs/19-DEFENSE-COACH.md` | thesis-defense coach — examiner Q&A with justifications |
| `CHANGELOG.md` | dated summary of changes across all waves |

**Ready-to-use deploy configs:** `render.yaml` (backend + Postgres blueprint),
`frontend/vercel.json` (Next.js + PWA headers), `backend/railway.json`, and a multi-stage
`backend/Dockerfile` (+ `.dockerignore`).

---

## 🎓 Thesis notes

**Problem.** Students at Myanmar Technological Universities struggle to choose project titles
because past archives are fragmented and unsearchable, leading to accidental duplication.

**Contribution.** A centralized, searchable archive plus an *intelligent title similarity
checker* that quantifies how close a proposed title is to prior work, giving an actionable
duplicate-risk verdict before submission.

**Method.** Titles are normalized (Unicode NFC, case-folding, punctuation/stopword handling) and
compared with a blended similarity metric (character-trigram Jaccard 0.55 + token Jaccard 0.30 +
normalized edit-distance 0.15). Production uses PostgreSQL `pg_trgm` with a GIN index for
scalable candidate retrieval, reranked by the same blended scorer; a portable engine mirrors this
for environments without the extension — a deliberate portability/graceful-degradation design.

**Engineering.** Decoupled REST architecture, RBAC, human-in-the-loop MMK payments with
server-enforced access control to protect copyrighted student files, and an author-consent gate
addressing intellectual-property ethics.

**Evaluation ideas (future work).** Precision/recall of duplicate detection against a
hand-labeled title set; threshold tuning; comparing the portable scorer vs raw `pg_trgm`;
extending similarity to abstracts.

**Limitations.** Title-only similarity (not full-text plagiarism), manual payment reconciliation,
single-node file storage (S3 seam provided).
