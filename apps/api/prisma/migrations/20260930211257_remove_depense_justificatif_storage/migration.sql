/*
  Warnings:

  - You are about to drop the column `justificatifMimeType` on the `Depense` table. All the data in the column will be lost.
  - You are about to drop the column `justificatifObjectKey` on the `Depense` table. All the data in the column will be lost.
  - You are about to drop the column `justificatifOriginalName` on the `Depense` table. All the data in the column will be lost.
  - You are about to drop the column `justificatifSizeBytes` on the `Depense` table. All the data in the column will be lost.
  - You are about to drop the column `justificatifUploadedAt` on the `Depense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Depense" DROP COLUMN "justificatifMimeType",
DROP COLUMN "justificatifObjectKey",
DROP COLUMN "justificatifOriginalName",
DROP COLUMN "justificatifSizeBytes",
DROP COLUMN "justificatifUploadedAt";
