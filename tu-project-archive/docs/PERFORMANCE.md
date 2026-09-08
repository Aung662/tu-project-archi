# Performance & fast first load (3-second goal)

Users bounce if the site doesn't respond within ~3 seconds. This document explains
what makes the site fast, the free-tier limits that can slow it down, and the exact
steps to keep first load under 3 seconds — including for visitors in Myanmar.

## Where the time actually goes

| Layer | Host | Speed |
|---|---|---|
| **Frontend (pages, UI)** | Vercel global CDN | Fast everywhere. Served from an edge near the user; no server wake-up. This is NOT the bottleneck. |
| **Backend API (data)** | Render free web service | The bottleneck. Two issues: (1) **region** — distance adds latency to every request; (2) **cold start** — the free plan sleeps after ~15 min idle and takes 30-50s to wake. |
| **Database** | Render managed Postgres | Fast when in the same region as the API. |

The **page shell paints immediately** (it's static). What users perceive as "slow"
is the API call that fills the page with data. So all the fixes target the API path.

## Fixes already applied in code

1. **Region → Singapore** (`render.yaml`). Both the API service and the database
   now run in Render's `singapore` region — the closest free region to Myanmar.
   Round-trip drops from ~250-350ms (Oregon, US) to ~40-60ms. Every API call
   becomes several times faster for local users.

2. **Timeout + auto-retry** (`frontend/src/lib/api.ts`). Every request is wrapped
   in an `AbortController`. GET requests retry up to 3 times (8s each) with a short
   backoff, so a backend that was asleep gets woken and the retry succeeds once it's
   warm — instead of the UI spinning forever. On total failure the user sees a clear
   "timed out / network error" message rather than a dead screen.

3. **Keep-alive every 5 min** (`.github/workflows/keep-alive.yml`). A GitHub Action
   pings `/health` so the free-tier server stays warm and (almost) never cold-starts
   for a real visitor. Cadence tightened from 10→5 min to absorb GitHub's scheduler
   delays.

## What YOU still need to do (one-time)

1. **Redeploy the backend so the region change takes effect.**
   - Region can only be set when the service/DB is (re)created. On an existing
     Render service, changing `region` in `render.yaml` does **not** move a running
     service. Easiest path: in the Render dashboard, delete the current
     `tu-archive-api` service **and** `tu-archive-db`, then create again from the
     Blueprint (render.yaml) — it will provision both in Singapore.
   - ⚠️ Deleting the DB wipes data. The app **re-seeds** admin + reference data on
     boot (`npm run deploy:release`), but any projects you added through the admin
     UI must be re-entered (or take a `pg_dump` backup first and restore it).
   - If you'd rather not delete: keep Oregon and rely on keep-alive + retries. It's
     still usable, just not as snappy for local users.

2. **Turn on the keep-alive workflow.** GitHub repo → **Actions** tab → enable
   workflows → the "Keep backend awake" job runs automatically. You can also click
   "Run workflow" once to warm it immediately.

3. **(Optional, strongest) Put Cloudflare in front with a custom domain.** Besides
   helping with access from Myanmar, Cloudflare caches static assets at the edge and
   can shave more time off. See the access notes in `docs/MONETIZATION.md`/README.

## Upgrade path (if you outgrow free)

The single biggest guaranteed win is a **paid Render instance ($7/mo)** — it never
sleeps (no cold starts at all) and has more CPU/RAM. Combined with the Singapore
region, first load is consistently well under 3 seconds. Until then, keep-alive +
retries get you most of the way there.

## Quick self-check (no VPN)

- Frontend: open `https://tu-project-archi.vercel.app` — should paint instantly.
- Backend: open `https://tu-archive-api.onrender.com/health` — first hit after idle
  may take 30-50s (cold start); once warm it returns `{"status":"ok"}` in well under
  a second. If it's warm and still slow, the region move is the fix.
