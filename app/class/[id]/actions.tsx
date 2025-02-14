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
