ALTER TYPE "Role" ADD VALUE 'CONDUCTEUR';

CREATE TABLE "_UserAssignedConducteurs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserAssignedConducteurs_AB_pkey" PRIMARY KEY ("A", "B")
);

CREATE INDEX "_UserAssignedConducteurs_B_index"
    ON "_UserAssignedConducteurs"("B");

ALTER TABLE "_UserAssignedConducteurs"
    ADD CONSTRAINT "_UserAssignedConducteurs_A_fkey"
    FOREIGN KEY ("A") REFERENCES "Chantier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_UserAssignedConducteurs"
    ADD CONSTRAINT "_UserAssignedConducteurs_B_fkey"
    FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;