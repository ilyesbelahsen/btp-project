-- CreateEnum
CREATE TYPE "PaieCorrectionStatut" AS ENUM ('EN_ATTENTE', 'VALIDEE');

-- CreateEnum
CREATE TYPE "PaieCorrectionAction" AS ENUM ('CORRIGEE', 'VALIDEE');

-- CreateTable
CREATE TABLE "PaieCorrection" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "heuresMajoreesCalculees" DOUBLE PRECISION NOT NULL,
    "heuresMajoreesCorrigees" DOUBLE PRECISION,
    "nombreIndemnitesCalculees" INTEGER NOT NULL,
    "nombreIndemnitesCorrigees" INTEGER,
    "motif" TEXT NOT NULL,
    "statut" "PaieCorrectionStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "corrigeeParId" TEXT NOT NULL,
    "corrigeeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valideeParId" TEXT,
    "valideeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaieCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaieCorrectionHistorique" (
    "id" TEXT NOT NULL,
    "correctionId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "action" "PaieCorrectionAction" NOT NULL,
    "heuresMajorees" DOUBLE PRECISION,
    "indemnites" INTEGER,
    "motif" TEXT,
    "auteurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaieCorrectionHistorique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaieCorrection_companyId_dateFrom_dateTo_idx" ON "PaieCorrection"("companyId", "dateFrom", "dateTo");

-- CreateIndex
CREATE UNIQUE INDEX "PaieCorrection_companyId_userId_dateFrom_dateTo_key" ON "PaieCorrection"("companyId", "userId", "dateFrom", "dateTo");

-- CreateIndex
CREATE INDEX "PaieCorrectionHistorique_correctionId_createdAt_idx" ON "PaieCorrectionHistorique"("correctionId", "createdAt");

-- CreateIndex
CREATE INDEX "PaieCorrectionHistorique_companyId_createdAt_idx" ON "PaieCorrectionHistorique"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "PaieCorrection" ADD CONSTRAINT "PaieCorrection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaieCorrection" ADD CONSTRAINT "PaieCorrection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaieCorrection" ADD CONSTRAINT "PaieCorrection_corrigeeParId_fkey" FOREIGN KEY ("corrigeeParId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaieCorrection" ADD CONSTRAINT "PaieCorrection_valideeParId_fkey" FOREIGN KEY ("valideeParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaieCorrectionHistorique" ADD CONSTRAINT "PaieCorrectionHistorique_correctionId_fkey" FOREIGN KEY ("correctionId") REFERENCES "PaieCorrection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaieCorrectionHistorique" ADD CONSTRAINT "PaieCorrectionHistorique_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
