CREATE TABLE "ZoneMajoration" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "zoneCategorie" INTEGER NOT NULL,
    "tauxMajoration" DOUBLE PRECISION NOT NULL,
    "dateEffet" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZoneMajoration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ZoneMajoration_companyId_zoneCategorie_dateEffet_key"
ON "ZoneMajoration"("companyId", "zoneCategorie", "dateEffet");

CREATE INDEX "ZoneMajoration_companyId_zoneCategorie_dateEffet_idx"
ON "ZoneMajoration"("companyId", "zoneCategorie", "dateEffet");

ALTER TABLE "ZoneMajoration"
ADD CONSTRAINT "ZoneMajoration_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;