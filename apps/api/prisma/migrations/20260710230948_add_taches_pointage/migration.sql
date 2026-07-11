-- AlterTable
ALTER TABLE "Pointage" ADD COLUMN     "taches" TEXT[];

-- CreateTable
CREATE TABLE "_UserAssignedChantiers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserAssignedChantiers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserAssignedChantiers_B_index" ON "_UserAssignedChantiers"("B");

-- AddForeignKey
ALTER TABLE "_UserAssignedChantiers" ADD CONSTRAINT "_UserAssignedChantiers_A_fkey" FOREIGN KEY ("A") REFERENCES "Chantier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAssignedChantiers" ADD CONSTRAINT "_UserAssignedChantiers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
