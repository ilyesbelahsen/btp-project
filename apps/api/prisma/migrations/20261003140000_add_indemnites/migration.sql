-- CreateTable
CREATE TABLE "Indemnite" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" DOUBLE PRECISION,
    "regle" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indemnite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndemniteAffectation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "indemniteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndemniteAffectation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Indemnite_companyId_actif_idx" ON "Indemnite"("companyId", "actif");

-- CreateIndex
CREATE UNIQUE INDEX "IndemniteAffectation_companyId_indemniteId_userId_dateFrom_dateTo_key" ON "IndemniteAffectation"("companyId", "indemniteId", "userId", "dateFrom", "dateTo");

-- CreateIndex
CREATE INDEX "IndemniteAffectation_companyId_userId_dateFrom_dateTo_idx" ON "IndemniteAffectation"("companyId", "userId", "dateFrom", "dateTo");

-- AddForeignKey
ALTER TABLE "Indemnite" ADD CONSTRAINT "Indemnite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndemniteAffectation" ADD CONSTRAINT "IndemniteAffectation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndemniteAffectation" ADD CONSTRAINT "IndemniteAffectation_indemniteId_fkey" FOREIGN KEY ("indemniteId") REFERENCES "Indemnite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndemniteAffectation" ADD CONSTRAINT "IndemniteAffectation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndemniteAffectation" ADD CONSTRAINT "IndemniteAffectation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
