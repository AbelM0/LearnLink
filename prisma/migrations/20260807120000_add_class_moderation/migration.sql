-- CreateEnum
CREATE TYPE "ClassAuditAction" AS ENUM (
    'MEMBER_JOINED',
    'MEMBER_PROMOTED',
    'MEMBER_DEMOTED',
    'MEMBER_TIMED_OUT',
    'MEMBER_TIMEOUT_REMOVED',
    'MEMBER_BANNED',
    'MEMBER_UNBANNED'
);

-- AlterTable
ALTER TABLE "ClassUser"
ADD COLUMN "timeoutUntil" TIMESTAMP(3),
ADD COLUMN "timeoutReason" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "class_ban" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "bannedById" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_ban_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_audit_log" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "action" "ClassAuditAction" NOT NULL,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_ban_userId_classId_key" ON "class_ban"("userId", "classId");

-- CreateIndex
CREATE INDEX "class_ban_classId_createdAt_idx" ON "class_ban"("classId", "createdAt");

-- CreateIndex
CREATE INDEX "class_audit_log_classId_createdAt_idx" ON "class_audit_log"("classId", "createdAt");

-- CreateIndex
CREATE INDEX "class_audit_log_targetUserId_idx" ON "class_audit_log"("targetUserId");

-- AddForeignKey
ALTER TABLE "class_ban" ADD CONSTRAINT "class_ban_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_ban" ADD CONSTRAINT "class_ban_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_ban" ADD CONSTRAINT "class_ban_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_audit_log" ADD CONSTRAINT "class_audit_log_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_audit_log" ADD CONSTRAINT "class_audit_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_audit_log" ADD CONSTRAINT "class_audit_log_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
