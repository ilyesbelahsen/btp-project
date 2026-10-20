-- AlterTable
ALTER TABLE "Depense" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "fournisseur" TEXT,
ADD COLUMN     "justificatifMimeType" TEXT,
ADD COLUMN     "justificatifObjectKey" TEXT,
ADD COLUMN     "justificatifOriginalName" TEXT,
ADD COLUMN     "justificatifSizeBytes" INTEGER,
ADD COLUMN     "justificatifUploadedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
