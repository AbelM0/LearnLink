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

 const classMembers = await prisma.classUser.findMany({
   where: { classId },
   include: {
     user: {
       select: {
         id: true,
         name: true,
         email: true,
       },
     },
     // Include the role field directly from the classUser model
   },
 });

 console.log("Class Members:", classMembers); // Log the fetched class members
 return classMembers;

}
