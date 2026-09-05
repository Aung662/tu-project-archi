# 04 — Setup Commands & Folder Structure

## A. Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- (Production) PostgreSQL ≥ 14 with the `pg_trgm` extension available
- (Local/demo) nothing else — SQLite is file-based and needs no server

## B. Quick start (local demo — SQLite)

```bash
# 1) Backend
cd backend
cp .env.example .env                 # secrets already have safe local defaults
npm install
npm run prisma:generate              # sets provider from DB_PROVIDER, generates client
npm run prisma:migrate               # creates dev.db and applies migrations
npm run seed                         # admin + demo student + universities + sample projects
npm run dev                          # http://localhost:4000

# 2) Frontend (new terminal)
cd frontend
npm install
npm run dev                          # http://localhost:3000  (proxies /api → :4000)
```

Demo accounts (from seed):
- Admin: `admin@tu-archive.mm` / `ChangeMe_Admin#2026`
- Student: `student@tu-archive.mm` / `Student#2026`

Admin access: triple-click the **TU** logo in the navbar, or go to `/portal-hidden-access`.

## C. Switching to PostgreSQL (production / thesis defense)

```bash
cd backend
# In .env:
#   DB_PROVIDER=postgresql
#   DATABASE_URL="postgresql://user:pass@host:5432/tu_archive?schema=public"
npm run prisma:generate
npm run prisma:migrate      # creates the Postgres schema
# Enable trigram search (one-time, needs privileges):
#   psql "$DATABASE_URL" -f prisma/postgres-extensions.sql
npm run seed
```

## D. Useful scripts

| Location | Command | Purpose |
|----------|---------|---------|
| backend | `npm run dev` | Dev server (tsx watch) |
| backend | `npm run build` / `npm start` | Compile + run production |
| backend | `npm test` | Vitest (unit + integration) |
| backend | `npm run seed` | (Re)seed reference + demo data |
| backend | `npm run db:provider` | Regenerate schema for current `DB_PROVIDER` |
| frontend | `npm run dev` | Next.js dev with `/api` proxy |
| frontend | `npm run build` / `npm start` | Production build + serve |

## E. Folder structure

```
tu-project-archive/
├── docs/                        # thesis-ready design docs (this folder)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # ACTIVE schema (generated from template)
│   │   ├── schema.template.prisma  # single source of truth for models
│   │   ├── migrations/          # SQL migration history
│   │   ├── postgres-extensions.sql  # pg_trgm + GIN index (prod)
│   │   └── seed.ts              # idempotent seeder (admin from env)
│   ├── scripts/set-provider.mjs # injects sqlite|postgresql into schema
│   ├── src/
│   │   ├── config/env.ts        # zod-validated config (fails fast)
│   │   ├── lib/                 # prisma, errors, http, storage, audit
│   │   ├── middleware/          # auth, rbac, validate, rateLimit, upload, error
│   │   ├── modules/
│   │   │   ├── auth/            # register/login/logout/me
│   │   │   ├── universities/    # reference data + facets
│   │   │   ├── projects/        # browse + detail + CRUD service
│   │   │   ├── search/          # normalize + similarity engine + routes
│   │   │   ├── files/           # gated download + admin upload
│   │   │   ├── payments/        # manual MMK order lifecycle
│   │   │   └── admin/           # dashboard, moderation, users, audit
│   │   ├── routes/index.ts      # mounts all module routers under /api
│   │   ├── app.ts               # express app (helmet/cors/rate limit)
│   │   └── server.ts            # boot + graceful shutdown
│   ├── storage/private/         # paid files — NEVER static-served
│   └── tests/                   # vitest (similarity unit + api integration)
└── frontend/
    ├── next.config.mjs          # /api proxy → BACKEND_ORIGIN
    ├── tailwind.config.ts
    ├── public/                  # manifest.webmanifest + icon.svg (PWA)
    └── src/
        ├── app/                 # App Router pages
        │   ├── page.tsx         # home + similarity search
        │   ├── browse/          # faceted browse
        │   ├── check/           # duplicate-risk checker
        │   ├── projects/[id]/   # detail + purchase/download
        │   ├── login/, portal-hidden-access/  # auth (hidden admin entry)
        │   ├── library/         # my purchases + payment history
        │   └── admin/           # role-gated dashboard (nested routes)
        ├── components/          # Navbar, cards, forms, ui primitives
        ├── context/AuthContext.tsx
        └── lib/                 # api client, types, formatters
```
