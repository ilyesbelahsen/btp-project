CREATE TABLE "PointageTache" (
    "id" TEXT NOT NULL,
    "pointageId" TEXT NOT NULL,
    "tacheId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointageTache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PointageTache_pointageId_tacheId_key"
    ON "PointageTache"("pointageId", "tacheId");
CREATE INDEX "PointageTache_companyId_tacheId_idx"
    ON "PointageTache"("companyId", "tacheId");

ALTER TABLE "PointageTache"
    ADD CONSTRAINT "PointageTache_pointageId_fkey"
    FOREIGN KEY ("pointageId") REFERENCES "Pointage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PointageTache"
    ADD CONSTRAINT "PointageTache_tacheId_fkey"
    FOREIGN KEY ("tacheId") REFERENCES "TacheChantier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PointageTache"
    ADD CONSTRAINT "PointageTache_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON UPDATE CASCADE;