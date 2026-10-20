-- CreateTable
CREATE TABLE "TacheChantier" (
    "id" TEXT NOT NULL,
    "chantierId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "prixVenduHT" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TacheChantier_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TacheChantier" ADD CONSTRAINT "TacheChantier_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "Chantier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TacheChantier" ADD CONSTRAINT "TacheChantier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
