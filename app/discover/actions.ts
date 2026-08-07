"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addUserToClass } from "@/lib/class-membership";
import { requireCurrentUser } from "@/lib/class-access";
import { prisma } from "@/lib/prisma";

const classIdSchema = z.coerce.number().int().positive();

export async function joinPublicClass(classIdValue: number) {
  const classId = classIdSchema.parse(classIdValue);
  const user = await requireCurrentUser();
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true, visibility: true },
  });

  if (!classData || classData.visibility !== "PUBLIC") {
    throw new Error("This class is not available for public joining");
  }

  await addUserToClass(classId, user.id);
  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath(`/class/${classId}`);

  return { success: true, message: "You joined the class", classId };
}
