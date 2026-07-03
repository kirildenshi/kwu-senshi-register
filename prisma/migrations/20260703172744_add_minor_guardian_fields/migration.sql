-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "isMinorGuardian" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentFullName" TEXT,
ADD COLUMN     "parentPhone" TEXT;
