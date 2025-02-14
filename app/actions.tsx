"use server";

import { auth } from "@/auth";
import { CreateClassValues, createClassSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
;

export async function createClass(values: CreateClassValues) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw Error("Unauthorized");
  }

  const classCode = generateClassCode(8);

  const { className, subject, description } = createClassSchema.parse(values);

  const createdClass = await prisma.class.create({
    data: {
      className,
      subject,
      description,
      classCode,
      ownerId: userId, 
    },
  });

  await prisma.classUser.create({
    data: {
      userId: userId,      
      classId: createdClass.id, 
      role: 'owner',
    },
  });

  revalidatePath('/');
}

export async function joinClass(classCode: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw Error("Unauthorized");
  }

  // Find the class by classCode
  const foundClass = await prisma.class.findUnique({
    where: { classCode },
  });

  if (!foundClass) {
    throw Error("Class not found");
  }

  // Check if the user is already part of the class
  const existingClassUser = await prisma.classUser.findUnique({
    where: {
      userId_classId: {
        userId,
        classId: foundClass.id,
      },
    },
  });

  if (existingClassUser) {
    throw Error("You are already a member of this class");
  }

  // Create an entry in the ClassUser table to associate the user with the class
  await prisma.classUser.create({
    data: {
      userId: userId,
      classId: foundClass.id,
      role: 'member', // Or another role depending on your app
    },
  });

  // Optionally, you can return the class info after joining
  return foundClass;
}

export async function getUserClasses() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw Error("Unauthorized");
  }

  // Find classes that the user has created or joined
  const userClasses = await prisma.class.findMany({
    where: {
      OR: [
        { ownerId: userId }, // Classes the user created
        {
          ClassUser: {
            some: {
              userId: userId, // Classes the user is a member of
            },
          },
        },
      ],
    },
    include: {
      ClassUser: true, // Include the related ClassUser table data if needed
    },
  });

  return userClasses;
}



function generateClassCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}
