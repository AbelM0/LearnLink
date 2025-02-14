/*
  Warnings:

  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassUser" DROP CONSTRAINT "ClassUser_classId_fkey";

-- DropForeignKey
ALTER TABLE "_ClassUsers" DROP CONSTRAINT "_ClassUsers_A_fkey";

-- DropTable
DROP TABLE "Class";

-- CreateTable
CREATE TABLE "class" (
    "id" SERIAL NOT NULL,
    "className" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClassUser" ADD CONSTRAINT "ClassUser_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassUsers" ADD CONSTRAINT "_ClassUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
