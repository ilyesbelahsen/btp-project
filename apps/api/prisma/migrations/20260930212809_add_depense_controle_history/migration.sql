-- CreateEnum
CREATE TYPE "DepenseStatutControle" AS ENUM ('A_CONTROLER', 'ACCEPTEE', 'REJETEE');

-- AlterTable
ALTER TABLE "Depense" ADD COLUMN     "controleeAt" TIMESTAMP(3),
ADD COLUMN     "controleeParId" TEXT,
ADD COLUMN     "motifRejet" TEXT,
ADD COLUMN     "statutControle" "DepenseStatutControle" NOT NULL DEFAULT 'A_CONTROLER';

-- CreateTable
CREATE TABLE "DepenseControleHistorique" (
    "id" TEXT NOT NULL,
    "depenseId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "statut" "DepenseStatutControle" NOT NULL,
    "motif" TEXT,
    "auteurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepenseControleHistorique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DepenseControleHistorique_depenseId_createdAt_idx" ON "DepenseControleHistorique"("depenseId", "createdAt");

-- CreateIndex
CREATE INDEX "DepenseControleHistorique_companyId_createdAt_idx" ON "DepenseControleHistorique"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_controleeParId_fkey" FOREIGN KEY ("controleeParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepenseControleHistorique" ADD CONSTRAINT "DepenseControleHistorique_depenseId_fkey" FOREIGN KEY ("depenseId") REFERENCES "Depense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepenseControleHistorique" ADD CONSTRAINT "DepenseControleHistorique_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
