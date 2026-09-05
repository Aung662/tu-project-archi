# 07 — Testing & QA Plan

## Automated tests (Vitest + Supertest)

Run: `cd backend && npm run seed && npm test`

### Unit — similarity engine (`tests/similarity.test.ts`, 12 tests)
- normalization: lowercasing, punctuation strip, whitespace collapse, Unicode NFC,
  Myanmar text safety, idempotency.
- token extraction: stopword + short-token removal.
- Levenshtein: identical / single-edit / empty.
- scoring: identical → EXACT band; reordered/paraphrased → SIMILAR band; unrelated → low; symmetric.

### Integration — API (`tests/api.test.ts`, 19 tests)
- health; public browse without auth; ranked search ordering; duplicate-check verdict.
- auth: invalid login rejected; admin & student login; **RBAC** (student 403, anon 401, admin 200).
- **consent gate**: publish blocked without consent, allowed with consent.
- **paid-file protection**: anonymous 401; logged-in-without-purchase 403/404 (never 200);
  test is self-contained (creates + deletes its own paid project).
- **Wave 5 hardening (7 tests):** weak password rejected; strict schema rejects smuggled
  `role` field; malformed JSON → `400 MALFORMED_JSON`; MIME-spoofed upload (HTML bytes as
  `.pdf`) → 400; genuine PDF magic bytes → 201; `SearchLog` row written and visible to admin;
  non-admin blocked from `/admin/search-logs`.

### Integration — payment flow with proof review (`tests/api.test.ts`, 8 tests)
Added in the bug-fix wave to lock the previously-broken manual-verification flow:
- unsupported payment method rejected (enum); order created with a valid method;
- proof upload accepted; admin list exposes `hasProof` and **never** leaks `proofKey`;
- **admin can stream the proof** (the QA-C1 fix); non-admin gets 403;
- download blocked before approval (403/404, never 200); after admin approval the buyer is granted
  `PurchaseAccess` and appears in their library.

**Status: 39/39 passing** (12 similarity + 27 API).

### Live-verified security checks (curl, against running server)
JWT `alg:none` forgery rejected (401); stale-role token (admin demoted in DB) blocked (403);
magic-byte spoof `.docx` with PE header rejected (400); `RateLimit-*` headers present on search;
`AUTH_LOGIN`/`AUTH_LOGIN_FAILED` audit events recorded; CHECK rows log a `verdict`.

## Manual QA checklist (verified during build)

| Area | Check | Result |
|------|-------|--------|
| Search | ranked % + EXACT/SIMILAR banding | ✅ |
| Browse | facet filters + pagination | ✅ |
| Auth | HttpOnly cookie issued; `/me` works; logout clears | ✅ |
| RBAC | student blocked from `/api/admin/*` and admin UI | ✅ |
| Purchase | order → proof upload → admin approve → access grant | ✅ |
| Download | streamed only after grant; correct filename/mime | ✅ |
| Consent | cannot publish without `hasConsent` (UI + server) | ✅ |
| Uploads | extension + MIME + size enforced; stored privately | ✅ |
| Hidden UI | 3-click logo + `/portal-hidden-access` reveal login only | ✅ |
| Audit | approvals/publish/delete recorded | ✅ |

## Security review checklist
- [x] No secrets in frontend bundle (only same-origin `/api` calls).
- [x] Paid files never behind a public/static URL.
- [x] Server-side authZ on every privileged route (UI hiding is not relied upon).
- [x] Passwords bcrypt(12); login avoids user enumeration.
- [x] Zod validation on all inputs; Prisma parameterization (no string SQL).
- [x] Path-traversal guard on storage keys.
- [x] Rate limiting on auth + API; Helmet headers; CORS allowlist.
- [x] `npm audit`: **0 vulnerabilities** in both backend and frontend.

## Known limitations (documented, non-blocking)
- Single-node local file storage (S3 seam documented in `lib/storage.ts`).
- Manual payment reconciliation (by design for MMK context).
- Title-only similarity (file-content plagiarism is out of scope).
