-- CreateTable
CREATE TABLE "PassengerBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passengerName" TEXT NOT NULL,
    "isPrimaryBooker" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PassengerBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PassengerBooking_userId_idx" ON "PassengerBooking"("userId");

-- CreateIndex
CREATE INDEX "PassengerBooking_bookingId_idx" ON "PassengerBooking"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "PassengerBooking_bookingId_userId_key" ON "PassengerBooking"("bookingId", "userId");

-- AddForeignKey
ALTER TABLE "PassengerBooking" ADD CONSTRAINT "PassengerBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassengerBooking" ADD CONSTRAINT "PassengerBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
