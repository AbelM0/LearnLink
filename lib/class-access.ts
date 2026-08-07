import "server-only";

import type { User } from "next-auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireCurrentUser() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  return user as User & { id: string };
}

export async function ensureClassAccess(classId: number, userId: string) {
  const membership = await prisma.classUser.findUnique({
    where: {
      userId_classId: {
        userId,
        classId,
      },
    },
    include: {
      class: {
        select: {
          id: true,
          className: true,
          ownerId: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error("You do not have access to this class");
  }

  return membership;
}

export async function ensureClassOwner(classId: number, userId: string) {
  const membership = await ensureClassAccess(classId, userId);

  if (membership.class.ownerId !== userId) {
    throw new Error("Only the class owner can perform this action");
  }

  return membership.class;
}

export async function ensureChannelAccess(channelId: number, userId: string) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: {
      id: true,
      classId: true,
    },
  });

  if (!channel) {
    throw new Error("Channel not found");
  }

  await ensureClassAccess(channel.classId, userId);

  return channel;
}
