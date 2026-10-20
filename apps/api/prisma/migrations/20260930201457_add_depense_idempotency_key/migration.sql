/*
  Warnings:

  - A unique constraint covering the columns `[companyId,idempotencyKey]` on the table `Depense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Depense" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Depense_companyId_idempotencyKey_key" ON "Depense"("companyId", "idempotencyKey");
