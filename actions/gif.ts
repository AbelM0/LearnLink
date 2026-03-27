"use server";

import { auth } from "@/auth";
import { prisma as db } from "@/lib/prisma";

export async function toggleFavoriteGif(gifData: {
  klipyId: string;
  url: string;
  width: number;
  height: number;
  title: string | null;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if it already exists
  const existing = await db.favoriteGif.findUnique({
    where: {
      userId_klipyId: {
        userId,
        klipyId: gifData.klipyId,
      },
    },
  });

  if (existing) {
    // Remove it
    await db.favoriteGif.delete({
      where: { id: existing.id },
    });
    return { favorited: false };
  } else {
    // Add it
    await db.favoriteGif.create({
      data: {
        userId,
        klipyId: gifData.klipyId,
        url: gifData.url,
        width: gifData.width,
        height: gifData.height,
        title: gifData.title,
      },
    });
    return { favorited: true };
  }
}

export async function getFavoriteGifs(): Promise<{ klipyId: string, url: string, width: number, height: number, title: string | null }[]> {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    return [];
  }

  // @ts-ignore - Prisma types might not have generated yet due to dev server lock
  const favorites = await db.favoriteGif.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return favorites;
}
