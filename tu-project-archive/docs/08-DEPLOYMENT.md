# 08 — Deployment Plan

Target: **Frontend → Vercel**, **Backend → Render/Railway**, **DB → Neon/Supabase (PostgreSQL)**.

## 0. Ready-to-use config files (added in Wave 6)
| File | Purpose |
|------|---------|
| `render.yaml` | Render Blueprint: provisions the API web service **and** a managed PostgreSQL DB, wires `DATABASE_URL`, auto-generates `JWT_SECRET`, attaches a 1 GB disk for uploaded files. |
| `frontend/vercel.json` | Next.js preset + PWA headers (`sw.js` no-cache + `Service-Worker-Allowed`, manifest caching, security headers). |
| `backend/railway.json` | Railway alternative: Nixpacks build, `/health` healthcheck, restart policy. |
| `backend/Dockerfile` + `.dockerignore` | Multi-stage production image (build → slim runtime, non-root user, `/app/storage` volume) for any container host. |

One-command Render deploy: push the repo, then *New → Blueprint* and point it at `render.yaml`.
Set the `sync: false` secrets (`FRONTEND_ORIGIN`, `SEED_ADMIN_*`, `PAYMENT_INSTRUCTIONS`) in the
dashboard before the first deploy so the seed picks up the right admin credentials.

## 1. Database (Neon or Supabase)
1. Create a PostgreSQL database; copy the connection string.
2. Locally point `backend/.env` to it with `DB_PROVIDER=postgresql` and run:
   ```bash
   npm run prisma:generate
   npx prisma migrate deploy
   psql "$DATABASE_URL" -f prisma/postgres-extensions.sql   # pg_trgm + GIN index
   npm run seed
   ```

## 2. Backend (Render / Railway)
- Root: `backend/`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables (set in dashboard, never commit):
  ```
  NODE_ENV=production
  PORT=4000                     # or platform-provided
  DB_PROVIDER=postgresql
  DATABASE_URL=...              # Neon/Supabase
  JWT_SECRET=<64+ random hex>   # must be >= 32 chars or the app refuses to boot
  JWT_EXPIRES_IN=6h             # session cookie maxAge is derived from this
  COOKIE_NAME=tu_token
  COOKIE_SECURE=true            # HTTPS in prod
  FRONTEND_ORIGIN=https://<your-app>.vercel.app
  SEED_ADMIN_EMAIL=...          # set BEFORE first seed
  SEED_ADMIN_PASSWORD="..."     # REQUIRED in prod (quote values with '#')
  DEFAULT_PROJECT_PRICE_MMK=5000
  PAYMENT_INSTRUCTIONS="..."
  ```
- **Production boot guards (fail-fast):** in `NODE_ENV=production` the API exits at startup if
  `COOKIE_SECURE=false`, if `SEED_ADMIN_PASSWORD` is unset or equals the dev default, or if
  `JWT_SECRET` is shorter than 32 chars — so an insecure service can never silently ship.
- **Persistent storage:** attach a persistent disk mounted at `PRIVATE_STORAGE_DIR`, OR
  switch `lib/storage.ts` to S3-compatible storage (seam already isolated). Ephemeral
  container FS will lose uploaded files on redeploy otherwise.

## 3. Frontend (Vercel)
- Root: `frontend/`
- Framework preset: Next.js (auto)
- Environment variable:
  ```
  BACKEND_ORIGIN=https://<your-backend>.onrender.com
  ```
  (used by `next.config.mjs` rewrites so the browser keeps calling same-origin `/api`).

## 4. Cross-origin cookie notes
- With the `/api` rewrite the browser sees one origin, so `SameSite=Lax` + `Secure` works.
- CORS on the backend must list the exact Vercel origin in `FRONTEND_ORIGIN`.
- Always serve over HTTPS in production (`COOKIE_SECURE=true`).

## 5. Post-deploy smoke test
```
GET  /health                          → 200
GET  /api/search?q=iot                 → ranked results
POST /api/auth/login (admin)           → 200 + cookie
GET  /api/admin/stats (as admin)       → 200
GET  /api/admin/stats (anon)           → 401
```

## 6. PWA notes
- The service worker (`public/sw.js`) is registered only in production builds
  (`ServiceWorkerRegistrar` short-circuits in dev to avoid hot-reload churn), so test it with
  `next build && next start` or on the deployed Vercel URL, not `next dev`.
- `vercel.json` sends `Cache-Control: max-age=0, must-revalidate` for `sw.js` so clients always
  re-check for a new worker; bump `CACHE_VERSION` in `sw.js` on each deploy to purge old caches.
- Installability: served over HTTPS + valid manifest + 192/512 icons + a fetch handler → Chrome
  shows the install prompt (also surfaced via the in-app `InstallPrompt` banner).
- Offline behavior: navigations fall back to the cached `/offline` page; API calls are never
  cached (they need auth + fresh data).

## 7. Hardening for production (recommended next steps)
- Rotate `JWT_SECRET`; consider refresh-token rotation for long sessions.
- Add virus scanning (e.g. ClamAV) on uploaded files (magic-byte validation is already enforced).
- Centralized logging/metrics; alert on repeated 401/403 spikes (auth events are audited).
- Database backups (Neon/Supabase automated snapshots).
