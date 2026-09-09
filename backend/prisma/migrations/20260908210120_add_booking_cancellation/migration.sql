-- CreateTable
CREATE TABLE "BookingCancellation" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "tripId" INTEGER NOT NULL,
    "tripTitle" TEXT NOT NULL,
    "bookingAmount" DOUBLE PRECISION NOT NULL,
    "departure" TEXT,
    "cancellationReason" TEXT NOT NULL,
    "experience" TEXT,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "refundAmount" DOUBLE PRECISION,
    "refundStatus" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "adminNotes" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingCancellation_bookingId_idx" ON "BookingCancellation"("bookingId");

-- CreateIndex
CREATE INDEX "BookingCancellation_userId_idx" ON "BookingCancellation"("userId");

-- CreateIndex
CREATE INDEX "BookingCancellation_status_idx" ON "BookingCancellation"("status");

-- CreateIndex
CREATE INDEX "BookingCancellation_refundStatus_idx" ON "BookingCancellation"("refundStatus");
