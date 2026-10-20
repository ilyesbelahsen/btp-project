ALTER TABLE "Pointage" ADD COLUMN "totalMinutes" INTEGER;

UPDATE "Pointage"
SET "totalMinutes" = ROUND("totalHours" * 60)::INTEGER
WHERE "totalHours" IS NOT NULL;
