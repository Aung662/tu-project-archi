# 11 — Thesis Defense / Viva Notes

Preparation for the oral defense: the elevator pitch, the decisions you must be able to justify,
and a bank of likely examiner questions with crisp, honest answers.

---

## 1. 60-second elevator pitch

> "Students at Myanmar Technological Universities repeatedly propose project titles that duplicate
> earlier work, because past archives are scattered and unsearchable. I built a centralized,
> searchable archive with an *intelligent title similarity checker*: a student pastes a proposed
> title and instantly gets a ranked list of the closest existing projects plus a duplicate-risk
> verdict. It's a production-grade, decoupled web app — a Next.js PWA frontend and a TypeScript
> REST API on PostgreSQL with `pg_trgm` — including a manual MMK payment flow to buy full project
> files, with server-enforced access control so paid content is never publicly downloadable."

## 2. Contributions to claim (and defend)

1. A **domain-specific similarity metric** for academic titles combining character-trigram, token,
   and edit-distance signals, with an interpretable duplicate-risk banding.
2. A **portable/scalable dual implementation** (pure-TS engine ↔ `pg_trgm` GIN) demonstrating a
   graceful-degradation architecture — the same behavior with or without the DB extension.
3. An **end-to-end, security-conscious engineering artifact**: RBAC, hardened uploads, protected
   paid files, an author-consent gate for IP ethics, and audited actions — not just a prototype.

## 3. Decisions you must be able to justify

| Decision | Why | Trade-off acknowledged |
|----------|-----|------------------------|
| Blend weights 0.55 / 0.30 / 0.15 | Trigrams dominate for typo/word-order robustness; tokens catch reordering; edit-distance is a tie-breaker | Weights are reasoned, not yet tuned on labeled data (future work) |
| Thresholds 0.85 / 0.30 | 0.85 ≈ near-identical wording; 0.30 surfaces "worth a look" without flooding | Chosen for demo balance; needs precision/recall tuning |
| Decoupled REST (not Next API routes) | Independent scaling/versioning; reusable API surface; matches required hosting split | More moving parts than a monolith |
| Manual MMK payments | Real constraint — no card gateway ubiquity in Myanmar; keeps a human in the loop | Slower than automated; admin workload |
| JWT in HttpOnly cookie (not localStorage) | Not readable by JS → mitigates XSS token theft | Needs CSRF care; handled via SameSite + same-origin `/api` |
| SQLite dev / Postgres prod | One-command local demo with zero infra; production keeps `pg_trgm` power | Two code paths to keep in sync (covered by tests) |
| Similarity on titles only | Matches the stated problem (title duplication); tractable and fast | Not full-text plagiarism (explicitly out of scope) |

## 4. Likely examiner questions — with answers

**Q: How is your similarity different from a simple `LIKE '%...%'` search?**
A: `LIKE` is exact-substring and misses reordering, typos, and synonyms. My engine normalizes the
title then blends three fuzzy signals to produce a graded 0–100 % score with an actionable verdict.
`pg_trgm` also lets the database do fuzzy candidate retrieval with a GIN index, so it scales.

**Q: Why not use embeddings / an LLM?**
A: Titles are short and the vocabulary is domain-constrained, so lexical similarity is fast,
deterministic, explainable, and needs no GPU or external API — important for a university deployment
and for reproducibility in a thesis. Semantic embeddings are listed as future work for
abstract-level near-duplicate detection.

**Q: How do you know it works?**
A: 12 unit tests pin the scorer's behavior (exact match ≈ 100 %, reordering, typos, unrelated
titles score low) and 19 integration tests exercise the API. I'm honest that a *quantitative*
precision/recall evaluation on a labeled set is future work — the thresholds are defensible defaults.

**Q: A student pays but can't download — walk me through the protection.**
A: Files live outside any static route. `GET /api/files/:id/download` requires auth, re-checks the
user's role from the DB, then verifies a `PurchaseAccess` row (unique per user+project) before
streaming with a path-traversal guard. Anonymous → 401, logged-in-without-purchase → 403/404,
never 200 with the bytes. There's an automated test asserting exactly this.

**Q: What stops someone uploading a virus disguised as a PDF?**
A: Uploads pass an extension + MIME whitelist *and* a magic-byte signature check — the file's real
bytes must match its claimed type, or it's deleted and rejected. Antivirus scanning (ClamAV) is the
documented next step.

**Q: The admin dashboard is "hidden" by a 3-click logo — isn't that security by obscurity?**
A: The hiding is pure UX, and I say so explicitly. The *real* protection is server-side: every
`/api/admin/*` route rejects non-admins regardless of how the URL was reached. I demonstrate this
with anon → 401 and student → 403 tests.

**Q: What about the author's intellectual property?**
A: A project cannot be published unless `hasConsent = true` is recorded (enforced in the service
layer and covered by a test), and paid files are access-controlled. This addresses the IP/ethics
dimension the archive raises.

**Q: How would this scale to all MTU campuses?**
A: The API is stateless and horizontally scalable; Postgres + GIN handles fuzzy search at scale;
files move to object storage via the existing seam; rate limiting moves to a shared store. These
are enumerated in the future-work section with the honest current single-instance caveat.

**Q: Why Burmese-first UI?**
A: The end users are Myanmar students and staff; a Burmese-first interface (with English helper
labels for examiners) maximizes real adoption. All labels flow through one i18n module.

**Q: Biggest weakness of your system?**
A: It detects *title* duplication, not content plagiarism, and the thresholds aren't yet
empirically tuned. Both are scoped deliberately and are the top items in future work.

## 5. Live demo script (safe, ~5 minutes)

1. **Search** a known title on the home page → show ranked results + normalized query.
2. **Duplicate check** (`/check`): paste a near-copy of an existing title → `DUPLICATE_RISK`;
   paste a novel title → `LIKELY_UNIQUE`.
3. **Browse** (`/browse`): filter by university → department → year → level; show pagination.
4. **Buy flow:** log in as the student, open a paid project, create an order, upload a proof.
5. **Admin:** reveal the portal (triple-click logo), approve the payment, show the student now
   has access and can download; show the **audit log** and **search analytics** tabs.
6. **Security beat:** open a paid file's download URL while logged out → 401 (no file served).
7. **PWA:** show the install prompt / offline fallback page.

## 6. Metrics to quote

- **0** npm vulnerabilities (frontend + backend).
- **31** automated tests passing (12 similarity unit + 19 API integration).
- Similarity blend **0.55 / 0.30 / 0.15**; bands **EXACT ≥ 0.85**, **SIMILAR ≥ 0.30**.
- Access check is **O(1)** via a unique `(userId, projectId)` index.

## 7. If asked "what would you do with 3 more months?"

Labeled evaluation + threshold tuning → abstract/semantic similarity → object storage + antivirus
→ payment-gateway integration → full offline-first PWA. (Same ordering as `10-ARCHITECTURE-SUMMARY.md`
§9, so your story is consistent across documents.)
