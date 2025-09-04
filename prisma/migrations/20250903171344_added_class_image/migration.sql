/*
  Warnings:

  - Added the required column `imageUrl` to the `class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "class" ADD COLUMN     "imageUrl" TEXT NOT NULL;
