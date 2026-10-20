-- AlterEnum
ALTER TYPE "DepenseCategorie" ADD VALUE 'SOUS_TRAITANCE';

-- AlterTable
ALTER TABLE "Depense" ADD COLUMN     "tacheId" TEXT;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_tacheId_fkey" FOREIGN KEY ("tacheId") REFERENCES "TacheChantier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
