"use server"

import { prisma } from "@/lib/prisma";
import { createMessageSchema } from "@/lib/validation";
import { z } from "zod"

type CreateMessageValues = z.infer<typeof createMessageSchema>;


export const getClass = async (id: string) => {
    const classId = Number(id)
  
    return prisma.class.findUnique({
      where: { id: classId },
      select: { 
        id: true, 
        className: true, 
        subject: true, 
        description: true, 
        ownerId: true, 
        classCode: true, 
        createdAt: true, 
        updatedAt: true, 
      },
  });
};

export const getClassChannels = async(id: number) => {
  const classId= id;

   const channels = await prisma.class.findUnique({
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

   return channels?.Channels || [];
};


export const getClassMembers = async (id: string) => {
  const classId = Number(id);

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

  // Ensure the response structure matches `ClassMember`
  return members.map((member) => ({
    id: member.id, // Keep the classUser ID
    role: member.role as "owner" | "member", // Ensure correct typing
    user: member.user
      ? { name: member.user.name || undefined, email: member.user.email }
      : null, // Explicitly handle null users
  }));
  };

export async function createMessage(values: CreateMessageValues) {
  const { content, userId, channelId } = values;

  if (!content || !userId || !channelId) {
    throw new Error(`Missing. Content:${content}, userId: ${userId}, channelId: ${channelId}`);
  }

  const newMessage = await prisma.message.create({
    data: {
      content,
      userId,
      channelId,
    },
  });

  return newMessage;
}

export async function getChannelMessages(channelId: number) {
  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  const messages = await prisma.message.findMany({
    where: {
      channelId: channelId,
    },
    orderBy: {
      createdAt: "asc", // Ordering messages by the creation date
    },
  });

  return messages;
}
