-- AlterEnum
ALTER TYPE "ClassAuditAction" ADD VALUE 'CLASS_DETAILS_UPDATED';
ALTER TYPE "ClassAuditAction" ADD VALUE 'CLASS_PERMISSIONS_UPDATED';
ALTER TYPE "ClassAuditAction" ADD VALUE 'CLASS_INVITE_CODE_REGENERATED';
ALTER TYPE "ClassAuditAction" ADD VALUE 'CLASS_OWNERSHIP_TRANSFERRED';

-- AlterTable
ALTER TABLE "class"
ADD COLUMN "isInviteEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "allowMemberMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "allowMemberLiveParticipation" BOOLEAN NOT NULL DEFAULT true;

-- Make class membership follow class deletion
ALTER TABLE "ClassUser" DROP CONSTRAINT "ClassUser_classId_fkey";
ALTER TABLE "ClassUser" ADD CONSTRAINT "ClassUser_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
