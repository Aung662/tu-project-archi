# 03 — Full Implementation Wave Plan

Each wave ends with a self-review: completed / files / risks / fixes / next.

| Wave | Focus | Key deliverables |
|------|-------|------------------|
| **W0** | Design | Sanity-check, architecture, wave plan (this set of docs) |
| **W1** | Backend foundation | Express+TS scaffold, config, Helmet/CORS/rate-limit, error handler, health, Prisma schema (dual provider), migrations concept |
| **W2** | Data + similarity core | Prisma models, seed (universities/departments/admin/projects), normalization + portable similarity engine + unit tests |
| **W3** | Auth + RBAC | Register/login/logout/me, bcrypt, JWT HttpOnly cookie, role middleware, rate limit |
| **W4** | Projects + search API | Public browse/facets, unified search (exact+similar ranked), project detail, admin CRUD, consent gate |
| **W5** | Files + payments | Multer hardened upload, private storage, PaymentOrder lifecycle, PurchaseAccess, gated download, AuditLog |
| **W6** | Frontend foundation | Next.js App Router + Tailwind, API client, layout, auth context, PWA manifest, /api proxy |
| **W7** | Frontend features | Home/search UI with similarity meter, browse+facets, project detail, login, purchase flow |
| **W8** | Admin dashboard | Hidden 3-click + /portal-hidden-access, projects/payments/users management, audit view |
| **W9** | QA + tests + docs | Backend tests green, seed demo, README/thesis notes, deployment guide, final self-review |

Waves run continuously. Environmental note: sandbox has Node 20 but **no PostgreSQL**, so the
running demo uses SQLite + the portable similarity engine; production config targets PostgreSQL
+ pg_trgm (both codepaths shipped).
