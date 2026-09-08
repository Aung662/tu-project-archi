# 05 — Database Design

ORM: **Prisma**. Datasource: **PostgreSQL** (prod) / **SQLite** (dev) via a single
templated schema. Enums are declared once and map to native PG enums or stored as
strings on SQLite.

## Entity–Relationship overview

```
University 1───* Department
University 1───* Project
Department 1───* Project
User       1───* Project        (submittedBy, optional)
User       1───* PaymentOrder
User       1───* PurchaseAccess
Project    1───* PaymentOrder
Project    1───* PurchaseAccess
User       1───* AuditLog        (actor, optional)
(User,Project) ─ unique ─ PurchaseAccess   ← the authZ grant for downloads
```

## Tables

### University
| Column | Type | Notes |
|--------|------|-------|
| id | cuid PK | |
| name | string unique | full name |
| shortName | string unique | e.g. YTU |
| city | string? | |

### Department
| id | cuid PK |
| name | string |
| code | string | e.g. IT, EC |
| universityId | FK → University (cascade) |
| **unique** | (universityId, code) |

### User
| id | cuid PK |
| email | string unique |
| passwordHash | string | bcrypt(12) |
| name | string |
| role | enum STUDENT/STAFF/ADMIN | RBAC |
| adminScope | string? | metadata only (not authZ) |

### Project (core)
| id | cuid PK |
| title | string |
| normalizedTitle | string | indexed; drives similarity |
| abstract | string |
| keywords | string | comma-separated |
| year | int | indexed |
| level | enum | YEAR_3/YEAR_5/FINAL_YEAR/OTHER |
| authorsText, supervisorName | string(?) |
| universityId, departmentId | FK | indexed |
| status | enum DRAFT/PUBLISHED/ARCHIVED | indexed |
| hasConsent | bool | **publish gate** |
| priceMmk | int | kyat, no decimals |
| fileName, fileStorageKey, fileSizeBytes, fileMimeType | file metadata; key points into private storage |
| submittedById | FK? |

### PaymentOrder (manual MMK)
| id | cuid PK |
| userId, projectId | FK (cascade) |
| amountMmk | int |
| method | string | KBZPay/WavePay/AYA/Bank |
| txnRef | string | payer-provided reference |
| proofKey | string? | private storage key of screenshot |
| status | enum PENDING/APPROVED/REJECTED | indexed |
| reviewNote, reviewedById, reviewedAt | moderation trail |

### PurchaseAccess (the ONLY download authorization)
| id | cuid PK |
| userId, projectId | FK (cascade) |
| grantedByOrder | string? |
| **unique** | (userId, projectId) — idempotent grants |

### AuditLog
| id | cuid PK |
| actorId | FK? |
| action | string | PAYMENT_APPROVED, PROJECT_PUBLISHED, AUTH_LOGIN, AUTH_LOGIN_FAILED, … |
| entityType, entityId | string | indexed |
| metadata | string (JSON) |

### SearchLog (analytics, added in Wave 5)
| id | cuid PK |
| kind | string | `SEARCH` (title search) or `CHECK` (pre-proposal duplicate check) |
| rawQuery | string | exactly what the user typed |
| normalizedQuery | string | after title normalization |
| resultCount | int |
| topScore | float? | best similarity score in the result set |
| verdict | string? | for CHECK rows: `DUPLICATE_RISK` / `SIMILAR_EXISTS` / `LIKELY_UNIQUE` |
| actorId | string? | set when the searcher was logged in (best-effort) |
| ip | string? | best-effort client IP |
| createdAt | datetime | `@@index([kind]) @@index([createdAt])` |

Written best-effort (never blocks or fails a search). Surfaced in the admin **Search Analytics**
tab; provides quantitative evidence of duplicate-detection value for the thesis evaluation.

## Indexing strategy

- `Project.normalizedTitle`: b-tree index (both DBs) + **GIN trigram index on PostgreSQL**
  (`postgres-extensions.sql`) for scalable fuzzy search.
- Facet columns (`year`, `universityId`, `departmentId`, `level`, `status`) indexed for browse.
- `PaymentOrder.status` indexed for the admin queue.
- `PurchaseAccess (userId, projectId)` unique → O(1) access checks + no double grants.

## Integrity & business rules (enforced in service layer)

1. A Department must belong to the Project's University (checked on create/update).
2. A Project cannot be `PUBLISHED` unless `hasConsent = true`.
3. `PurchaseAccess` is created only by an admin approving a `PaymentOrder` (transactionally).
4. Downloads require a matching `PurchaseAccess` row or `ADMIN` role.

## Data lifecycle

- Deleting a User/Project cascades to their orders and access rows (FK `onDelete: Cascade`).
- Files are removed from private storage when replaced or when a project is deleted.
