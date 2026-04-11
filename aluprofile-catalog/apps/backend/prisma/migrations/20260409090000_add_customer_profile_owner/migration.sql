ALTER TABLE "Profile"
  ADD COLUMN "ownerClerkUserId" TEXT;

CREATE INDEX "Profile_ownerClerkUserId_idx" ON "Profile"("ownerClerkUserId");
