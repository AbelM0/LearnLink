-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('LIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "LiveSessionRole" AS ENUM ('HOST', 'PARTICIPANT');

-- CreateTable
CREATE TABLE "live_session" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "hostId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'LIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_session_participant" (
    "id" SERIAL NOT NULL,
    "liveSessionId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "LiveSessionRole" NOT NULL DEFAULT 'PARTICIPANT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_session_participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "live_session_roomName_key" ON "live_session"("roomName");

-- CreateIndex
CREATE INDEX "live_session_classId_status_idx" ON "live_session"("classId", "status");

-- CreateIndex
CREATE INDEX "live_session_participant_liveSessionId_joinedAt_idx" ON "live_session_participant"("liveSessionId", "joinedAt");

-- CreateIndex
CREATE INDEX "live_session_participant_userId_idx" ON "live_session_participant"("userId");

-- AddForeignKey
ALTER TABLE "live_session" ADD CONSTRAINT "live_session_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session" ADD CONSTRAINT "live_session_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session_participant" ADD CONSTRAINT "live_session_participant_liveSessionId_fkey" FOREIGN KEY ("liveSessionId") REFERENCES "live_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session_participant" ADD CONSTRAINT "live_session_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
