-- CreateTable
CREATE TABLE "favorite_gifs" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "klipyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_gifs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorite_gifs_userId_klipyId_key" ON "favorite_gifs"("userId", "klipyId");

-- AddForeignKey
ALTER TABLE "favorite_gifs" ADD CONSTRAINT "favorite_gifs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
