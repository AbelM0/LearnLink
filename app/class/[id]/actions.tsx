"use server"

import { prisma } from "@/lib/prisma";


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
