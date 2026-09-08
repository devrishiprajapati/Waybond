-- CreateTable
CREATE TABLE "BookingReschedule" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromTripId" INTEGER NOT NULL,
    "fromTripTitle" TEXT NOT NULL,
    "toTripId" INTEGER NOT NULL,
    "toTripTitle" TEXT NOT NULL,
    "fromPrice" DOUBLE PRECISION NOT NULL,
    "toPrice" DOUBLE PRECISION NOT NULL,
    "fromDeparture" TEXT,
    "toDeparture" TEXT,
    "priceDifference" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingReschedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingReschedule_bookingId_idx" ON "BookingReschedule"("bookingId");

-- CreateIndex
CREATE INDEX "BookingReschedule_userId_idx" ON "BookingReschedule"("userId");

-- CreateIndex
CREATE INDEX "BookingReschedule_status_idx" ON "BookingReschedule"("status");
