"use server"

import { prisma } from "@/lib/prisma";
import { ClassMember } from "@/types/class-type";

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

 try {
   const members = await prisma.classUser.findMany({
     where: { classId },
     select: {
       id: true,
       role: true,
       user: {
         select: {
           id: true,
           name: true,
           email: true,
         },
       },
     },
   });

   // Ensure we only return valid users
   return members.filter((member) => member.user !== null);
 } catch (error) {
   console.error("Error fetching class members:", error);
   return [];
 }
};
