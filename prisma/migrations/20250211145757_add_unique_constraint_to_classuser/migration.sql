/*
  Warnings:

  - A unique constraint covering the columns `[userId,classId]` on the table `ClassUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ClassUser_userId_classId_key" ON "ClassUser"("userId", "classId");
