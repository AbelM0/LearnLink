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
          allowMemberMessages: true,
          allowMemberLiveParticipation: true,
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

export async function ensureClassManager(classId: number, userId: string) {
  const membership = await ensureClassAccess(classId, userId);
  const isOwner = membership.class.ownerId === userId;
  const isModerator = membership.role === "moderator";

  if (!isOwner && !isModerator) {
    throw new Error("Only class owners and moderators can manage members");
  }

  return membership;
}

export async function ensureNotTimedOut(classId: number, userId: string) {
  const membership = await ensureClassAccess(classId, userId);

  if (membership.timeoutUntil && membership.timeoutUntil > new Date()) {
    throw new Error(
      `You are timed out from this class until ${membership.timeoutUntil.toISOString()}`,
    );
  }

  return membership;
}

export async function ensureCanSendClassMessages(
  classId: number,
  userId: string,
) {
  const membership = await ensureNotTimedOut(classId, userId);
  const isManager =
    membership.class.ownerId === userId || membership.role === "moderator";

  if (!isManager && !membership.class.allowMemberMessages) {
    throw new Error("Members are not allowed to send messages in this class");
  }

  return membership;
}

export async function ensureCanJoinClassLiveSession(
  classId: number,
  userId: string,
) {
  const membership = await ensureNotTimedOut(classId, userId);
  const isManager =
    membership.class.ownerId === userId || membership.role === "moderator";

  if (!isManager && !membership.class.allowMemberLiveParticipation) {
    throw new Error("Member participation is disabled for this live class");
  }

  return membership;
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
