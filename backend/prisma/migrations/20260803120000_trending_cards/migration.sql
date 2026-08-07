CREATE TABLE "TrendingCard" (
    "id" SERIAL NOT NULL,
    "position" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrendingCard_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrendingCard_position_key" ON "TrendingCard"("position");
