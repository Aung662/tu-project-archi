# 22 — Feature Waves (September 2026)

Ten incremental feature waves added after the 5-part QA task, each committed
independently. All gates green at the end: **backend 82/82 tests**, **frontend
`tsc` exit 0**, **production build of all 31 routes**.

| Wave | Feature | Key files |
| --- | --- | --- |
| 1 | **Auto wiring diagrams** — a "typical Arduino UNO" connection SVG derived from each component's pinout (no hand-drawn assets). | `lib/wiring.ts`, `components/WiringDiagram.tsx` |
| 2 | **Recent searches** — home title searches captured to localStorage, one-tap re-run chips. | `lib/recentSearches.ts`, `app/page.tsx` |
| 3 | **PDF thesis-card + QR export** — one-page printable card with a scannable QR back to the live page; QR PNG too. Libs lazy-loaded on demand. | `lib/projectExport.ts`, `components/ExportButton.tsx` |
| 4 | **Component comparison** — star up to 3 toolkit parts, side-by-side spec-union table in a floating tray. | `lib/componentCompare.ts`, `components/ComponentCompare.tsx` |
| 5 | **Admin analytics upgrade** — most-viewed projects, top search queries, 14-day revenue chart + KPI. | `admin/admin.routes.ts` (`/dashboard`), `charts/Charts.tsx` (`RevenueChart`), `app/admin/page.tsx` |
| 6 | **Bulk CSV import** — admin imports many projects from a spreadsheet; dry-run validation, per-row report, RBAC, template download. | `admin/admin.routes.ts` (`/projects/bulk-import`), `lib/csv.ts`, `components/BulkImport.tsx` |
| 7 | **Email notifications** — optional SMTP emails to buyers on payment & kit approve/reject; graceful no-op when unconfigured. | `lib/mailer.ts`, `payments.service.ts`, `kits.service.ts`, `config/env.ts` |
| 8 | **Light-theme polish** — remaps for bracketed white-alpha surfaces + ink sticky bars/dropdowns/trays that were invisible in light mode. | `app/globals.css` |
| 9 | **404 + loading polish** — on-brand 404 with quick links; skeleton root loading state. | `app/not-found.tsx`, `app/loading.tsx` |
| 10 | **Favourite components** — star toolkit parts, "Favourites only" filter chip. | `lib/componentFavorites.ts`, `app/toolkit/page.tsx`, `components/ComponentDetail.tsx` |

## New environment variables (all optional)

```
# SMTP email (Wave 7) — leave SMTP_HOST blank to disable (messages are logged)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=TU Project Archive <no-reply@tu-archive.mm>
```

## New dependencies

- Frontend: `qrcode`, `jspdf` (+ `@types/qrcode`) — lazy-loaded, so the project
  page bundle is unaffected (11 kB, not 149 kB).
- Backend: `nodemailer` (+ `@types/nodemailer`).

## Notes for the defense

- The wiring diagram and the "typical" label are deliberately honest: it is a
  heuristic teaching aid derived from data, not a verified schematic.
- Bulk import always offers a dry-run first and never aborts the batch on one bad
  row — it returns a per-row pass/fail report.
- Email, SMTP, Cloudinary and Gemini all follow the same "optional integration,
  graceful degrade" pattern — the app runs fully with none of them configured.
