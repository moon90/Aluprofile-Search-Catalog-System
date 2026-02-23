-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'IN_DEVELOPMENT', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "AppPermission" AS ENUM ('VIEW_ADMIN', 'PROFILES_MANAGE', 'SUPPLIERS_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE');

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "usage" TEXT,
    "drawingUrl" TEXT,
    "photoUrl" TEXT,
    "logoUrl" TEXT,
    "dimensions" TEXT,
    "weightPerMeter" DOUBLE PRECISION,
    "material" TEXT,
    "lengthMm" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "supplierId" INTEGER NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrossSection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CrossSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccess" (
    "id" SERIAL NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'USER',
    "permissions" "AppPermission"[] DEFAULT ARRAY['VIEW_ADMIN']::"AppPermission"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApplicationToProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ApplicationToProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CrossSectionToProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CrossSectionToProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_name_key" ON "Profile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Application_name_key" ON "Application"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CrossSection_name_key" ON "CrossSection"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccess_clerkUserId_key" ON "UserAccess"("clerkUserId");

-- CreateIndex
CREATE INDEX "_ApplicationToProfile_B_index" ON "_ApplicationToProfile"("B");

-- CreateIndex
CREATE INDEX "_CrossSectionToProfile_B_index" ON "_CrossSectionToProfile"("B");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationToProfile" ADD CONSTRAINT "_ApplicationToProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationToProfile" ADD CONSTRAINT "_ApplicationToProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrossSectionToProfile" ADD CONSTRAINT "_CrossSectionToProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "CrossSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrossSectionToProfile" ADD CONSTRAINT "_CrossSectionToProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
