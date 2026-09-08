# 12 — Adversarial Audit (QA · Security · Performance)

Three ruthless expert passes over the actual code (not the docs). Every finding cites the file
and the concrete reason. No politeness, no filler.

Legend: **C**=Critical, **H**=High, **M**=Medium, **L**=Low.

---

# PART A — Senior QA Lead

## 1. Critical issues

**QA-C1 — Admins approve payments BLIND. The core business flow is broken.**
The whole product hinges on *manual MMK verification*: a student uploads a payment screenshot, an
admin looks at it, then grants access. But **there is no way for an admin to see the proof.**
- `payments.service.ts` stores `proofKey`, but `listOrders()` never returns it.
- There is **no endpoint** to stream a proof (`grep` for proof download in `admin/` → nothing).
- `admin/payments/page.tsx` renders user, project, amount, method, txnRef — **no proof column, no
  image link.** The admin clicks Approve based on a free-text `txnRef` the student typed.
- Net effect: the "verification" is theater. Anyone can create an order, type a fake txn ref, skip
  the upload entirely (proof is optional), and an admin has literally nothing to verify against.
This is the single most important flow in the app and it does not work. Fix before anything else.

## 2. High-risk issues

**QA-H1 — JWT lifetime (2h) ≠ cookie lifetime (6h): silent broken sessions.**
`env.ts` `JWT_EXPIRES_IN=2h`; `auth.routes.ts` cookie `maxAge: 1000*60*60*6` (6h). Between hour 2
and hour 6 the cookie is still present but the JWT is expired, so `/auth/me` and every protected
call return 401 while the UI has no signal to prompt re-login until the user hits a wall. The two
numbers must be equal and single-sourced.

**QA-H2 — Orphaned private files leak on every re-upload and every delete.**
- `attachProof()` overwrites `proofKey` **without deleting** the previous proof file.
- Deleting a project/order cascades the DB rows (`onDelete: Cascade`) but **never removes the file
  on disk** (`fileStorageKey` / `proofKey`). Files accumulate forever in `storage/private`.
- Rejected/abandoned order proofs are never cleaned up.
This is a correctness + disk-exhaustion + data-retention problem.

**QA-H3 — Registration enables user enumeration.**
`auth.service.register()` throws `409 "An account with this email already exists"`. Login was
carefully written to avoid enumeration (generic message + dummy compare), but the signup endpoint
hands attackers a free "is this email registered?" oracle, undoing that effort.

## 3. Medium issues

- **QA-M1 — Non-ASCII (Burmese) download filenames corrupt.** `files.routes.ts` sets
  `Content-Disposition: attachment; filename="..."` with only a quote strip. Burmese titles →
  mojibake or dropped filename. Needs RFC 5987 `filename*=UTF-8''<pct-encoded>`.
- **QA-M2 — Browse keyword search is effectively exact/case-fragile.** `projects.service.ts`
  `title: { contains: q }` with no `mode:'insensitive'` (unsupported on SQLite). Mixed-case
  English queries silently miss on SQLite dev; behavior diverges from Postgres prod.
- **QA-M3 — `prompt()` for reject reason.** `admin/payments/page.tsx` uses the blocking browser
  `prompt()` — unstyled, unlocalized-native, no validation, and returns `null` on cancel which is
  then coerced to `undefined` (silently rejects with no note). Poor for a "thesis-grade" UI.
- **QA-M4 — Approve/Reject have no confirmation and no optimistic lock.** A double-click or two
  admins acting at once both call approve; it's idempotent for access, but the UX gives no guard
  and no "are you sure" on an irreversible-ish money action.
- **QA-M5 — `msg` banner in admin payments never clears** and isn't an error vs success
  distinction (always `kind="info"` even on failure).

## 4. Low issues

- **QA-L1 — No empty-input guards on some forms** beyond server validation; server errors surface
  as raw messages.
- **QA-L2 — Wide admin tables on low-end mobile** rely on horizontal scroll (`overflow-x-auto`) —
  acceptable but cramped; no card fallback at `sm`.
- **QA-L3 — Search box has no debounce/typeahead** (submit-driven only) — fine, but a
  duplicate-check-as-you-type would be the expected modern UX.
- **QA-L4 — No "session expired, please log in again" toast**; the app just flips to logged-out.

## 5. Exact fixes
1. **QA-C1:** add `GET /api/admin/payments/:id/proof` (admin-only) that streams the proof from
   private storage; return `hasProof`/`proofKey`→boolean in `listOrders`; render a "View proof"
   link/thumbnail in the payments table; optionally **block Approve when `proofKey` is null**.
2. **QA-H1:** derive cookie `maxAge` from a single `SESSION_TTL` (or parse `JWT_EXPIRES_IN`); make
   them identical. Add a client 401 interceptor in `api.ts` that clears auth + redirects to login.
3. **QA-H2:** in `attachProof` delete the old `proofKey` before setting a new one; add
   `deletePrivateFile` calls in `deleteProject` and order deletion paths; add a periodic/боot
   sweeper for unreferenced keys.
4. **QA-H3:** make register return the **same generic 201/"check your email" style response** or a
   neutral 409 that doesn't confirm existence; better: send generic "if this email is free, the
   account is created" and rate-limit.
5. **QA-M1:** RFC 5987 encode the filename. **QA-M2:** on Postgres use `mode:'insensitive'`; on
   SQLite lower-case a `searchText` column. **QA-M3:** replace `prompt()` with a modal + textarea.
6. **QA-M4/M5:** add a confirm dialog; set `Alert kind` by outcome; auto-dismiss after N seconds.

## 6. Files that must change
`backend/src/modules/admin/admin.routes.ts`, `backend/src/modules/payments/payments.service.ts`,
`backend/src/modules/files/files.routes.ts`, `backend/src/lib/storage.ts`,
`backend/src/modules/auth/auth.routes.ts` + `auth.service.ts`, `backend/src/config/env.ts`,
`backend/src/modules/projects/projects.service.ts`,
`frontend/src/app/admin/payments/page.tsx`, `frontend/src/lib/api.ts`,
`frontend/src/context/AuthContext.tsx`.

## 7. Final QA verdict
**NOT SHIP-READY as a product until QA-C1 is fixed** — the payment-verification flow, the app's
reason to require login, is non-functional for the admin. Everything else is solid and unusually
well-built for a thesis. Grade: **B / conditional pass** — one critical, three highs, all
mechanical to fix. As a *thesis artifact* it's already strong; as a *deployed service* it isn't
until admins can actually see what they're approving.

---

# PART B — Senior Security Engineer

**Scope reviewed:** `app.ts`, `config/env.ts`, `middleware/{auth,rateLimit,error,upload,validate}.ts`,
`lib/{storage,fileSignature,audit,http,errors}.ts`, all `modules/*`, `schema.prisma`,
`frontend/{next.config.mjs,vercel.json,lib/api.ts,context/AuthContext.tsx}`.

## SEC-1 — JWT misuse — **LOW (well handled, minor gaps)**
- *Good:* `HS256` pinned on sign **and** verify (`auth.service.ts`) → `alg:none`/confusion blocked.
- *Vuln:* `JWT_SECRET` minimum is **16 chars** (`env.ts`), too short for HS256 — brute-forceable if
  a weak secret is chosen. *Attack:* offline HMAC cracking of a captured token → full forgery.
- *Vuln:* No `iss`/`aud` claims, no token revocation/denylist (logout only clears the cookie; a
  copied token stays valid until expiry). *Remediation:* raise min to **32**, add `issuer`/
  `audience`, and for high assurance a short TTL + refresh rotation (already listed as future work).
- Affected: `backend/src/config/env.ts`, `backend/src/modules/auth/auth.service.ts`.

## SEC-2 — Unsafe cookies — **LOW**
- *Good:* `httpOnly:true`, `sameSite:'lax'`, `secure` forced true in prod when unset.
- *Vuln:* if an operator **explicitly** sets `COOKIE_SECURE=false` in production, the guard in
  `env.ts` (`process.env.COOKIE_SECURE === undefined`) is skipped and insecure cookies ship.
  *Remediation:* in production, **hard-fail boot** if `COOKIE_SECURE` resolves false.
- Affected: `backend/src/config/env.ts`.

## SEC-3 — Insecure admin access — **LOW (strong)**
- *Good:* `adminRouter.use(requireAuth, requireAdmin)`; `requireRole` **re-reads role from the DB**
  every request (stale-role/demotion safe) and rejects deleted users. This is textbook. No issue
  beyond the shared JWT-secret caveat in SEC-1.
- Affected: `backend/src/middleware/auth.ts`, `backend/src/modules/admin/admin.routes.ts`.

## SEC-4 — Hidden admin route weakness — **INFO (correct by design)**
The 3-click logo + `/portal-hidden-access` is UX only; real auth is server-side (SEC-3). Correct.
*Minor:* ensure the admin dashboard sends `X-Robots-Tag: noindex` / isn't linked so it isn't
crawled. *Remediation:* add `noindex` to admin routes. Affected: `frontend/src/app/admin/*`.

## SEC-5 — File upload abuse — **LOW/MEDIUM**
- *Good:* extension whitelist + server MIME check (`upload.ts`) + **magic-byte validation**
  (`fileSignature.ts`) + size cap + `files:1` + upload rate limiter. Above average.
- *Vuln (M):* files are written to disk by multer **before** the magic-byte check, and on a bad
  signature they're deleted — but a flood of large almost-valid files still consumes disk/IO
  transiently. *Vuln (L):* `.docx` and `.zip` share the `PK` signature, so a ZIP renamed `.docx`
  passes (documented, acceptable). *Vuln (L):* no antivirus scan (documented future work).
  *Remediation:* stream to a temp path, validate, then move; add ClamAV; consider per-user upload
  quota. Affected: `backend/src/middleware/upload.ts`, `backend/src/lib/{storage,fileSignature}.ts`.

## SEC-6 — MIME spoofing — **LOW (handled)**
Client `Content-Type` and extension are both treated as untrusted; real bytes are verified. The
classic `evil.html`→`evil.pdf` attack is blocked (there's even a test for it). No action.

## SEC-7 — Direct paid-file exposure — **LOW (strong)**
- *Good:* files live outside any static dir; `download` requires auth + `PurchaseAccess` (or admin);
  path-traversal guard in `resolvePrivatePath`. Anonymous→401, no-purchase→403/404, never the bytes.
- *Vuln (L):* **paid downloads are not audited** (only uploads are). No trail of who downloaded what
  — bad for a copyright-sensitive archive and for abuse detection. *Remediation:* `audit()` on every
  successful download. Affected: `backend/src/modules/files/files.routes.ts`, `lib/audit.ts`.

## SEC-8 — Insufficient authorization checks — **LOW**
Ownership is enforced (`attachProof` checks `order.userId === userId`; purchases/orders scoped to
`req.user.sub`). No IDOR found. *Watch:* `getProjectDetail` correctly hides non-published from
non-admins. OK.

## SEC-9 — XSS — **MEDIUM (defense-in-depth gap)**
- *Good:* zero `dangerouslySetInnerHTML`/`innerHTML`/`eval`; React auto-escapes; no raw HTML render.
- *Vuln:* **the frontend sends NO `Content-Security-Policy`.** `vercel.json` sets `nosniff`,
  `X-Frame-Options`, `Referrer-Policy` but no CSP. Any future stored-XSS (e.g. a title rendered
  somewhere unescaped, or a third-party script) has no second line of defense. *Attack:* stored
  script in an admin-entered field executes in an examiner's browser. *Severity:* Medium (no current
  injection sink, but the archive renders lots of user/admin free text). *Remediation:* add a strict
  CSP (`default-src 'self'`, `img-src 'self' data:`, no inline where feasible) in `vercel.json` and
  `helmet` on the API. Affected: `frontend/vercel.json`, `backend/src/app.ts`.

## SEC-10 — SQL injection — **NONE**
All queries go through Prisma; the single `$queryRaw` in `search.service.ts` uses **tagged-template
parameterization** for `normalizedQuery` and a numeric threshold. Clean.

## SEC-11 — Weak validation — **LOW**
Zod everywhere, `.strict()` on auth, bounded lengths, coercions fixed (the Express-5 `req.query`
getter bug was already patched in `validate.ts`). *Minor:* `method`/`txnRef` on orders accept any
2–120 chars (no format/whitelist), so garbage txn refs are storable — feeds QA-C1. *Remediation:*
constrain `method` to an enum (KBZPay/WavePay/AYA/…). Affected: `backend/src/modules/payments/payments.routes.ts`.

## SEC-12 — Weak logging — **MEDIUM**
- *Good:* auth events (login/failed/register/logout) and admin mutations are audited; search is
  logged.
- *Vuln:* **paid-file downloads and payment proof views are not logged** (see SEC-7). *Vuln (privacy):*
  `SearchLog` stores **client IP + raw query** with **no retention/pruning policy** — PII piling up
  indefinitely. *Vuln:* no alerting on `AUTH_LOGIN_FAILED` spikes. *Remediation:* audit downloads;
  add a SearchLog TTL/anonymization job; document retention. Affected: `search.service.ts`,
  `files.routes.ts`, `schema.prisma`.

## SEC-13 — Missing rate limits — **LOW**
Global + auth + upload + search limiters present. *Vuln:* limiter store is **in-memory**, so it's
per-instance and resets on deploy — multi-instance/serverless defeats it (a distributed brute force
or scrape bypasses the cap). *Also:* login lockout is IP-based only (no per-account throttle).
*Remediation:* Redis-backed store; per-account failed-login lockout. Affected:
`backend/src/middleware/rateLimit.ts`.

## SEC-14 — Environment variable misuse — **LOW**
- *Good:* validated at boot (`env.ts`), app refuses to start on bad config; no secrets in the
  frontend bundle (`BACKEND_ORIGIN` is non-secret build config); `.gitignore` excludes `.env`.
- *Vuln:* `SEED_ADMIN_PASSWORD` has a **hardcoded default** (`ChangeMe_Admin#2026`) in `env.ts` — if
  someone deploys without overriding it, the admin account has a publicly-known password. *Attack:*
  known-default admin login on a careless deploy → full takeover. *Remediation:* **no default** for
  `SEED_ADMIN_PASSWORD` in production (require it, fail boot if missing). Affected:
  `backend/src/config/env.ts`, `backend/prisma/seed.ts`.

## Extra: timing-based user enumeration on login — **MEDIUM**
`login()` compares against a dummy hash `$2a$12$0000…` for unknown users to equalize timing, but
`bcryptjs.compare` against a **malformed** hash returns fast rather than doing a full round — so the
"no such user" path is measurably quicker than the "wrong password" path. Combined with SEC/QA-H3
(register oracle) this makes enumeration easy. *Remediation:* compare against a **real precomputed
bcrypt hash of a random string** (valid format), not zeros. Affected: `backend/src/modules/auth/auth.service.ts`.

## Missing: CSRF — **LOW (accepted)**
Cookie auth + `SameSite=Lax` + same-origin `/api` blocks cross-site POSTs; no CSRF token exists.
Acceptable for now; if any state-changing `GET` is ever added it becomes exploitable. Keep all
mutations on POST/PUT/DELETE (currently true).

## Final security score: **7.5 / 10**
Strong fundamentals — parameterized queries, magic-byte uploads, DB-backed RBAC with stale-role
defense, pinned JWT alg, protected paid files, boot-time env validation. Held back by: no frontend
CSP (SEC-9), hardcoded seed-admin password default (SEC-14), download/proof actions unaudited +
PII retention (SEC-7/12), short JWT-secret floor (SEC-1), and residual enumeration (H3 + timing).
None are catastrophic; all are fixable in a focused pass. After those, this is a genuine **9/10**.

---

# PART C — Senior Performance Engineer

## 1. Bottlenecks
- **PERF-1 (High at scale) — In-memory similarity on the portable path.** `search.service.ts`
  non-Postgres branch does `findMany({ take: 2000 })` then scores **every** row in JS on **every**
  keystroke-submitted search. That's O(n) rows × O(m) trigram work per request, single-threaded, no
  cache. Fine for 12–2 000 projects (thesis), falls over at 50k+.
- **PERF-2 (Medium) — Missing `createdAt` indexes.** `PaymentOrder` and `AuditLog` are queried with
  `orderBy: { createdAt: 'desc' }` (admin lists) but have **no index on `createdAt`** → full scan +
  filesort as those tables grow. `SearchLog` correctly has one; the other two don't.
- **PERF-3 (Medium) — Postgres candidate cap + magic threshold.** The `pg_trgm` prefilter uses
  `similarity > SIMILAR/2` (hardcoded 0.15) and `LIMIT 200`. At scale, 200 may truncate the true
  top-N before reranking, and 0.15 can pull large candidate sets on common tokens.
- **PERF-4 (Low) — N+1-free but wide selects.** Selects are scoped (good), but `browseProjects`
  runs `count` + `findMany` as two queries each request with no result caching for hot facets.
- **PERF-5 (Low) — Paid-file delivery streams through Node.** `streamPrivateFile().pipe(res)` is
  correct and memory-safe, but every byte transits the app server; large files + many concurrent
  downloads saturate the Node event loop / bandwidth. No range-request/resume support.

## 2. Exact optimizations
1. **PERF-1:** always prefer the DB prefilter; on SQLite add an FTS/`LIKE` prefilter to cut the
   candidate set before JS scoring; cap the in-memory set and add a short-TTL LRU cache keyed by
   `normalizedQuery+filters`. Precompute/store trigram sets if scoring stays in JS.
2. **PERF-2:** add `@@index([createdAt])` to `PaymentOrder` and `AuditLog`; composite
   `@@index([status, createdAt])` on `PaymentOrder` for the filtered admin queue.
3. **PERF-3:** make the trigram floor and candidate `LIMIT` env-configurable; raise LIMIT and rerank,
   or use `ORDER BY similarity DESC LIMIT (limit*k)`.
4. **PERF-5:** move files to S3/object storage (seam exists) and serve via **short-TTL signed URLs**
   so bytes bypass the app server + get CDN/range support.

## 3. Schema / index fixes (`backend/prisma/schema.prisma` + template)
```prisma
model PaymentOrder { // add:
  @@index([createdAt])
  @@index([status, createdAt])
}
model AuditLog {     // add:
  @@index([createdAt])
}
// Postgres: the pg_trgm GIN index already exists (postgres-extensions.sql) — good.
```

## 4. Frontend performance fixes
- **Static assets already lean:** deps are only `next/react/react-dom`; first-load JS ≈ **103 kB
  shared**, pages 2–4 kB — genuinely good. No large-bundle risk.
- **PERF-F1 — No `next/image`.** Currently no `<img>` at all, but the missing payment-proof view
  (QA-C1) will introduce images; use `next/image` (or explicit width/height + lazy) so proofs don't
  ship full-res to low-end phones.
- **PERF-F2 — Minor re-renders.** `browse/page.tsx` recreates `load` via `useCallback([filters])`
  and refetches on every filter object change; debounce the keyword input and avoid refetch on
  identical filter values.
- **PERF-F3 — Font/rendering:** ensure the Burmese webfont (if any) is `font-display: swap` and
  subset; complex-script shaping is the main paint cost on cheap Androids.

## 5. Backend performance fixes
- Add the indexes (PERF-2); cache facet/browse hot paths (PERF-4) with a small in-memory TTL or
  `Cache-Control` on public GETs (`/projects`, `/universities`, `/search`) so the Vercel/CDN edge
  and browsers can reuse them.
- Gzip/br compression: add `compression` middleware (JSON responses aren't compressed today).
- Offload similarity for large corpora to the DB (PERF-1/3) and bound the JS path.

## 6. Low-end device recommendations
- Add `Cache-Control: public, max-age=60, stale-while-revalidate` to public GET APIs so repeat
  navigations on flaky mobile networks are instant.
- Serve payment proofs and any future images responsively (`next/image`, WebP, thumbnails).
- Keep the PWA cache warm (already: SWR for assets, offline fallback) — good for intermittent
  connectivity typical in the target region.
- Paginate/virtualize long admin tables; provide card layouts under `sm` to avoid heavy horizontal
  scroll reflow.

## 7. Final performance verdict
**Good for the stated scale, with clear scaling cliffs.** At thesis/pilot size (dozens–thousands of
projects) it will feel instant; the bundle is genuinely small and the DB access patterns are clean
(scoped selects, no N+1, unique-index O(1) access checks). The three real risks are the in-memory
similarity scan (PERF-1), the two missing `createdAt` indexes (PERF-2), and app-server file
streaming (PERF-5) — none affect a demo, all matter for production. Score: **7.5 / 10**; add the
indexes + compression + a search cache and it's an **8.5–9**.

---

# Consolidated priority (do these first)
1. **QA-C1** — make payment proofs viewable to admins (fixes the core flow).
2. **SEC-14** — remove the hardcoded `SEED_ADMIN_PASSWORD` default for production.
3. **SEC-9** — add a Content-Security-Policy (frontend + API).
4. **QA-H1 / QA-H2** — align session TTLs; stop leaking orphaned private files.
5. **PERF-2** — add `createdAt` indexes on `PaymentOrder` and `AuditLog`.
6. **SEC-7/12** — audit downloads; define a SearchLog retention/anonymization policy.
7. **H3 + timing** — kill user enumeration (neutral register + real dummy bcrypt hash).
