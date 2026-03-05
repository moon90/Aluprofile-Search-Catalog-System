ALTER TABLE "Profile"
  ADD COLUMN "nameDe" TEXT,
  ADD COLUMN "descriptionDe" TEXT,
  ADD COLUMN "usageDe" TEXT,
  ADD COLUMN "materialDe" TEXT;

ALTER TABLE "Supplier"
  ADD COLUMN "nameDe" TEXT;

ALTER TABLE "Application"
  ADD COLUMN "nameDe" TEXT;

ALTER TABLE "CrossSection"
  ADD COLUMN "nameDe" TEXT;
