-- AlterTable
ALTER TABLE "message" ADD COLUMN     "fileUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "content" DROP NOT NULL;
