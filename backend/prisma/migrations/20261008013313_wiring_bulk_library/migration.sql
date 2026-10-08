-- The wiring image library is additive: keep pending image bytes in the DB,
-- expose only reviewed rows, and deduplicate incoming files by source SHA-256.
CREATE TABLE "WiringImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" BLOB NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'image/webp',
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "sha256" TEXT NOT NULL,
    "boardId" TEXT NOT NULL DEFAULT 'other',
    "tags" TEXT NOT NULL DEFAULT '',
    "searchText" TEXT NOT NULL DEFAULT '',
    "uploadBatchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "contentChecked" BOOLEAN NOT NULL DEFAULT false,
    "rightsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "reviewNote" TEXT NOT NULL DEFAULT '',
    "uploadedById" TEXT,
    "reviewedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME
);

CREATE UNIQUE INDEX "WiringImage_sha256_key" ON "WiringImage"("sha256");
CREATE INDEX "WiringImage_status_createdAt_idx" ON "WiringImage"("status", "createdAt");
CREATE INDEX "WiringImage_boardId_status_createdAt_idx" ON "WiringImage"("boardId", "status", "createdAt");
CREATE INDEX "WiringImage_uploadBatchId_idx" ON "WiringImage"("uploadBatchId");
