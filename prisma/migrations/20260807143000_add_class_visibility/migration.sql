-- CreateEnum
CREATE TYPE "ClassVisibility" AS ENUM ('INVITE_ONLY', 'PUBLIC');

-- AlterEnum
ALTER TYPE "ClassAuditAction" ADD VALUE 'CLASS_VISIBILITY_UPDATED';

-- AlterTable
ALTER TABLE "class" ADD COLUMN "visibility" "ClassVisibility" NOT NULL DEFAULT 'INVITE_ONLY';

-- CreateIndex
CREATE INDEX "class_visibility_createdAt_idx" ON "class"("visibility", "createdAt");
