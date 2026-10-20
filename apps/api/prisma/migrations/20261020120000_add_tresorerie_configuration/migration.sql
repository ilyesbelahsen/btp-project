CREATE TABLE "TresorerieConfiguration" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "capitalInitial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TresorerieConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TresorerieConfiguration_companyId_key" ON "TresorerieConfiguration"("companyId");

ALTER TABLE "TresorerieConfiguration" ADD CONSTRAINT "TresorerieConfiguration_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;