-- AlterEnum
ALTER TYPE "PointageStatus" ADD VALUE 'SOUMIS' AFTER 'TERMINE';
ALTER TYPE "PointageStatus" ADD VALUE 'REJETE' AFTER 'SOUMIS';

-- AlterTable
ALTER TABLE "Pointage" ADD COLUMN "rejectionReason" TEXT;
