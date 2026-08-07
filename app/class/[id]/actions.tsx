"use server";

import { z } from "zod";
import {
  ensureChannelAccess,
  ensureClassAccess,
  requireCurrentUser,
} from "@/lib/class-access";
import { prisma } from "@/lib/prisma";
import { createMessageSchema } from "@/lib/validation";

type CreateMessageValues = z.infer<typeof createMessageSchema>;

const positiveIdSchema = z.coerce.number().int().positive();

export async function getClass(id: string) {
  const classId = positiveIdSchema.parse(id);
  const user = await requireCurrentUser();

  await ensureClassAccess(classId, user.id);

  return prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      className: true,
      subject: true,
      description: true,
      imageUrl: true,
      ownerId: true,
      classCode: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getClassChannels(id: number) {
  const classId = positiveIdSchema.parse(id);
  const user = await requireCurrentUser();

  await ensureClassAccess(classId, user.id);

  const classWithChannels = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      Channels: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return classWithChannels?.Channels ?? [];
}

export async function getClassMembers(id: string) {
  const classId = positiveIdSchema.parse(id);
  const user = await requireCurrentUser();

  await ensureClassAccess(classId, user.id);

  const members = await prisma.classUser.findMany({
    where: { classId },
    select: {
      id: true,
      role: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return members.map((member) => ({
    id: member.id,
    role: member.role as "owner" | "member",
    user: member.user
      ? { name: member.user.name || undefined, email: member.user.email }
      : null,
  }));
}

export async function createMessage(values: CreateMessageValues) {
  const user = await requireCurrentUser();
  const { content, fileUrls = [], channelId } = createMessageSchema.parse(values);

  await ensureChannelAccess(channelId, user.id);

  return prisma.message.create({
    data: {
      content: content || null,
      fileUrls,
      userId: user.id,
      channelId,
    },
  });
}

export async function getChannelMessages(channelIdValue: number) {
  const channelId = positiveIdSchema.parse(channelIdValue);
  const user = await requireCurrentUser();

  await ensureChannelAccess(channelId, user.id);

  return prisma.message.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}
