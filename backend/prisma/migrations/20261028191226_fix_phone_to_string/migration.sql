-- AlterTable
ALTER TABLE "BookingCancellation" ADD COLUMN     "processedByRole" TEXT;

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "changeLog" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "updatedByRole" TEXT;

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "createdByRole" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone" SET DATA TYPE TEXT;
