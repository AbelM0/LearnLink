"use server";

import { auth } from "@/auth";
import { ensureClassOwner } from "@/lib/class-access";
import { CreateClassValues, createClassSchema, createChannelSchema, CreateChannelValues } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
;

export async function createClass(values: CreateClassValues) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw Error("Unauthorized");
  }

  // Check if session user actually exists in the database
  const userExists = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!userExists) {
    console.error("User with ID", userId, "does not exist in the database! Stale session.");
    throw new Error("Your user account was not found. Please log out and log back in.");
  }

  const classCode = generateClassCode(8);

  const { className, subject, description, imageUrl } = createClassSchema.parse(values);

  try {
    await prisma.class.create({
      data: {
        className,
        subject,
        description,
        imageUrl,
        classCode,
        ownerId: userId,
        users: {
          connect: { id: userId },
        },
        ClassUser: {
          create: {
            user: { connect: { id: userId } },
            role: "owner",
          },
        },
        Channels: {
          create: {
            name: "general",
          },
        },
      },
    });
  } catch (error) {
    console.error("PRISMA CREATE CLASS ERROR:", error);
    throw new Error("Failed to create class in database");
  }

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

export async function createChannel(values: CreateChannelValues) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { name, classId } = createChannelSchema.parse(values);

  await ensureClassOwner(classId, userId);

  await prisma.channel.create({
    data: {
      name,
      classId,
    },
  });

  revalidatePath(`/class/${classId}`);
}



function generateClassCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}
