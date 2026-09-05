# 19 — Thesis Defense Coach (Examiner Q&A)

A rehearsal guide for the viva. Each entry gives a likely examiner question, a crisp spoken answer,
and the deeper justification to fall back on if pressed. Answers reflect the system **as built and
verified**.

---

## A. Architecture

**Q: Why did you decouple the frontend and backend instead of one monolith?**
A clean HTTP boundary lets me put *all* trust decisions — authentication, role checks, purchase
verification, file streaming — on the server, where the client cannot bypass them. It also means my
Vitest suite exercises exactly the same routes the UI calls, and the two tiers can be deployed and
scaled independently.
*If pressed:* the frontend never talks to the DB or touches secrets; it only calls `/api/*` with a
cookie. So a compromised browser can do nothing an ordinary user couldn't.

**Q: Walk me through a request end to end.**
The browser makes a relative `/api/...` call with `credentials:'include'`. Next.js rewrites it to the
Express API. Middleware runs in order: Helmet/CSP → CORS allowlist → JSON body limit → rate limiter →
`requireAuth` (reads the `tu_token` cookie). The route validates input with Zod, calls a service that
holds the business logic and talks to Prisma, and returns a uniform `{success,data}` envelope. Errors
are thrown as typed `AppError`s and normalized by one error middleware into `{success:false,error}`.

**Q: How is the code organized?**
By feature module (`auth, projects, search, files, payments, admin, universities`), each with routes +
services. Cross-cutting concerns live in `lib/` (typed error factories, the response envelope,
Express-5-safe param parsing, the audit writer, the Prisma client). Controllers stay thin; logic is
unit-testable.

---

## B. Similarity / pg_trgm

**Q: How does your similarity checker actually work?**
I normalize both the stored titles and the query the same way (NFC, lowercase, strip punctuation,
collapse spaces), then compute a blended score:
`0.55·trigramJaccard + 0.30·tokenOverlap + 0.15·(1−normalizedLevenshtein)`. Trigram overlap is the
backbone; token overlap handles word reordering; edit distance catches typos. Score ≥ 0.85 is EXACT
(duplicate risk), otherwise SIMILAR; below 0.30 is dropped.

**Q: Why `pg_trgm`, and why those weights?**
`pg_trgm` is PostgreSQL's proven trigram extension with a GIN index, so it scales to a growing
catalogue without me reinventing indexing. I weight trigrams highest (0.55) because they best mirror
`pg_trgm` and are robust to minor edits; token overlap (0.30) adds order-independence; edit distance
(0.15) is a small tie-breaker for near-identical strings. The weights and thresholds are env-tunable,
so they're calibratable rather than magic constants.

**Q: You developed on SQLite but deploy on Postgres — do the results match?**
By design the ranking function is identical in both: on Postgres I use `similarity()` with a low
trigram pre-filter to shortlist candidates via the GIN index, then re-rank with the *same* blended
formula in code; on SQLite I score candidates directly with that formula. So the shape and ordering
agree. I'm careful to claim parity of *shape*, not bit-identical internal scoring.

**Q: Why store `normalizedTitle` instead of normalizing at query time?**
So ranking is cheap and the `pg_trgm` GIN index has a stable column to index. Ingest and query share
one normalization function, guaranteeing both sides are treated identically.

---

## C. Decoupling & security of files

**Q: How do you stop someone downloading a paid file for free?**
There is no public URL to a paid file at all — the private storage directory has no static route on
either tier (I verified `/storage/*` returns 404). Downloads go only through
`GET /api/files/:id/download`, which requires auth and checks a `PurchaseAccess` row. Anonymous gets
401, an authenticated non-buyer gets 403, a buyer gets 200 with an RFC-5987 safe filename. I verified
all four outcomes live.

**Q: Could an attacker guess the storage key?**
The key is never sent to public clients — project payloads omit `fileStorageKey` and only expose a
`hasFile` boolean; the payment queue exposes `hasProof`, never `proofKey`. Even with a key, there's no
route that serves it without the purchase check.

---

## D. Manual payment design

**Q: Why manual payment verification instead of a real gateway?**
The target environment (Myanmar university context) has no readily integrable card/online gateway, and
real transactions use KBZPay/WavePay/AYAPay/bank transfer. So I model the *actual* process: order →
proof screenshot → admin verification → access. It's honest to the domain and still fully auditable.

**Q: Isn't manual verification a weakness?**
It adds human latency and trusts the reviewing admin — I state that plainly as a limitation. But it's
mitigated: methods are enum-validated, proofs are magic-byte-validated images stored privately,
approval is idempotent and transactional, and every decision is written to the audit log. The
architecture also leaves a clean seam to drop in an automated gateway later without touching the
access model (`PurchaseAccess` stays the source of truth).

**Q: What if an admin approves the same order twice, or two admins race?**
Approval runs in a `$transaction` and is idempotent — it grants at most one `PurchaseAccess` per
user+project (unique constraint), so double-approval is a no-op rather than a double grant.

---

## E. Hidden admin

**Q: You "hid" the admin panel — isn't security-through-obscurity a fallacy?**
The obscurity is a convenience layer, not the control. Real security is server-side RBAC: the entire
`/api/admin` router is guarded by `requireAuth, requireAdmin`, and the role is re-read from the DB on
every request. I verified a student gets 403 and an anonymous user 401 on admin endpoints. Hiding the
`/admin` link (reachable via `/portal-hidden-access` or a 3-click logo) just keeps it out of casual
sight; removing the obscurity would not grant anyone access.

**Q: Why re-read the role from the DB instead of trusting the token?**
So a token minted while a user was an admin becomes powerless the moment they're demoted — no waiting
for a 6-hour token to expire. It costs one indexed lookup per admin request.

---

## F. Limitations (own them confidently)

**Q: What are the weaknesses of your system?**
Four, stated deliberately: (1) manual payment has human latency and trust; (2) the checker compares
**titles**, not document bodies, so it isn't plagiarism detection; (3) normalization is tuned for
English/Romanized titles — Myanmar-script titles are handled Unicode-safely but not stemmed; (4)
dev/prod search parity is by *shape*, not bit-identical. Each has a matching future-work item.

**Q: How do you know these aren't just claims?**
I keep two live-verified checklists — 32 completeness items and 16 QA/security items — where every row
records the exact probe against the running server and the observed result, plus an adversarial audit
document. Tests are 39/39 and both tiers typecheck clean.

---

## G. Future work

**Q: If you had another semester, what would you add?**
In priority order: (1) a real online payment gateway with the manual path as fallback; (2) extend
similarity to abstracts and then document bodies for genuine plagiarism screening; (3) Myanmar-script
tokenization/stemming; (4) per-university admin roles and scoped dashboards; (5) email/SMS
notifications on payment decisions; (6) optional semantic (embedding) search layered on top of the
lexical `pg_trgm` ranking.

**Q: Would embeddings replace `pg_trgm`?**
No — I'd layer them. `pg_trgm` gives fast, explainable lexical matching (great for near-duplicate
titles); embeddings would add semantic recall (differently-worded but related topics). Keeping both
means I can always explain *why* two titles were flagged, which matters for an academic-integrity tool.

---

## Rapid-fire facts to have memorized

- Score = **0.55 trigram + 0.30 token + 0.15 edit**; EXACT ≥ **0.85**, keep ≥ **0.30**.
- bcrypt cost **12**; JWT **HS256** pinned; cookie **HttpOnly, SameSite=Lax, 6 h** (`Max-Age=21600`).
- Payment methods: **KBZPay, WavePay, AYAPay, CBPay, BankTransfer** (enum-validated).
- Tests **39/39** (12 similarity + 27 API); BE/FE `tsc`=0; `npm audit`=0 vulns.
- Access truth = **`PurchaseAccess`**; approval idempotent + transactional.
- File download outcomes: anon **401**, non-buyer **403**, buyer **200** (RFC 5987 filename).
- Upload safety = **magic-byte** validation, not extension/MIME.
- Demo creds: `admin@tu-archive.mm / ChangeMe_Admin#2026`, `student@tu-archive.mm / Student#2026`.
