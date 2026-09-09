-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");
