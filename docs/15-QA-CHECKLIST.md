# 15 — QA & Security Checklist (Live-Verified)

> **Verification method.** Each item was exercised against the **running** backend (`:4000`) and the
> Next.js frontend proxy (`:3000`) on 2026-09-03, or confirmed by a live Prisma query / source guard.
> This is a QA sign-off, not a design wish-list: every row shows the probe and the observed result.
>
> Legend: **✅ Pass** · ⚠️ Caveat · ❌ Fail.

| # | QA / Security check | Status | Probe | Observed result |
|---|---------------------|:------:|-------|-----------------|
| Q1 | **Admin area is hidden** — no public nav/link to `/admin` | ✅ | grep home HTML for `/admin"`; hit `/portal-hidden-access` | no admin link in nav; hidden entry route `200` (also reachable via 3-click logo) |
| Q2 | **Server-side RBAC** — non-admins cannot reach admin API | ✅ | student & anon vs admin routes | student `GET /api/admin/payments`=`403`, anon=`401`, student `GET /api/admin/metrics`=`403`; router uses `requireAuth, requireAdmin` |
| Q3 | **JWT in HttpOnly cookie**, not localStorage | ✅ | inspect `Set-Cookie` on login | `tu_token=…; Max-Age=21600; Path=/; HttpOnly; SameSite=Lax` (6 h TTL) |
| Q4 | **Passwords hashed** (never plaintext) | ✅ | Prisma read of a user's `passwordHash` | prefix `$2b$12$` — bcrypt, cost 12 |
| Q5 | **Input validation** rejects malformed payloads (Zod) | ✅ | bad-email register; `method:"Bitcoin"` order | both `400`; order returns `error.code = VALIDATION_ERROR` |
| Q6 | **Upload validation is magic-byte based**, not extension/MIME | ✅ | admin uploads a GIF renamed `.pdf` with `Content-Type: application/pdf` | rejected `400` (`BAD_REQUEST`) — content sniffed, spoof blocked |
| Q7 | **Rate limiting** on auth/search/upload/global | ✅ | source guards | `rateLimit.ts` present; `authLimiter` on auth routes, `searchLimiter` on search, `uploadLimiter` on uploads; global limiter mounted in `app.ts` |
| Q8 | **Security headers** (Helmet + CSP) | ✅ | `curl -i /health` | `Content-Security-Policy` (default-src 'self', object-src 'none', frame-ancestors 'none'), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` |
| Q9 | **CORS locked to the app origin** with credentials | ✅ | inspect `app.ts` cors config | `origin: env.FRONTEND_ORIGIN`, `credentials: true` (allowlist, not `*`) |
| Q10 | **Consistent error envelope** `{success:false, error:{code,message}}` | ✅ | `GET /api/projects/nonexistent-id` | `{success, error:{code,message}}`, `code = NOT_FOUND` |
| Q11 | **Consistent success envelope** `{success:true, data}` | ✅ | `GET /api/projects?pageSize=1` | `success:true`, `data` present |
| Q12 | **Audit logging** of sensitive actions | ✅ | Prisma `groupBy` after a full flow | `AUTH_LOGIN`, `AUTH_REGISTERED`, `FILE_DOWNLOADED`, `PAYMENT_APPROVED`, `PAYMENT_REJECTED`, `PROJECT_FILE_UPLOADED` all recorded |
| Q13 | **No server secrets in the frontend** bundle | ✅ | grep `frontend/src` for `JWT_SECRET` / `DATABASE_URL` / hardcoded secrets | none found |
| Q14 | **SQL-injection safe** (parameterized / tagged raw only) | ✅ | grep for `$queryRawUnsafe` / `$executeRawUnsafe`; inspect search raw | no unsafe raw anywhere; pg_trgm path uses a tagged `$queryRaw` template with bound params |
| Q15 | **404 handling** for unknown API + pages | ✅ | `/api/does-not-exist`, `/no-such-page` | both `404` |
| Q16 | **Typecheck + tests green** | ✅ | `tsc --noEmit` (BE+FE) + Vitest | BE=0, FE=0, **39/39** |

## Additional hardening confirmed

- **Session TTL** is a real 6 h — the JWT `exp` and the cookie `Max-Age=21600` are both derived from
  `JWT_EXPIRES_IN=6h` (single source of truth via `durationToMs()`).
- **Login timing** is constant-ish: a missing user is compared against a real `DUMMY_PASSWORD_HASH`
  so "user not found" and "wrong password" take the same path (no user-enumeration oracle).
- **Proof key never leaves the server**: `listOrders` strips `proofKey` and returns `hasProof`;
  re-uploading a proof deletes the previous file.
- **Best-effort file cleanup** on project delete removes the paid file and any related proof.
- **Boot guards**: in production the server exits if `JWT_SECRET` is weak/default or other required
  secrets are missing (`env.ts`).

## Summary

**16 / 16 QA checks pass, 0 caveats.** No regressions found while probing; the DB was reset to the
pristine seed after verification (0 payment/purchase/audit/search rows, storage cleared).
