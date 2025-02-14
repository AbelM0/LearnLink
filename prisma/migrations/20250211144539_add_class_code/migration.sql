/*
  Warnings:

  - A unique constraint covering the columns `[classCode]` on the table `class` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classCode` to the `class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "class" ADD COLUMN     "classCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "class_classCode_key" ON "class"("classCode");
