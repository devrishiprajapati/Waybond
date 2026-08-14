-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "shortBio" TEXT NOT NULL,
    "fullBio" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamMember_position_idx" ON "TeamMember"("position");
