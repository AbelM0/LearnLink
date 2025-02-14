/*
  Warnings:

  - Added the required column `ownerId` to the `class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "class" ADD COLUMN     "ownerId" TEXT NOT NULL;
