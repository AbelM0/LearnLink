import "server-only";

import { ClassAuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function addUserToClass(classId: number, userId: string) {
  const [existingBan, existingMembership] = await Promise.all([
    prisma.classBan.findUnique({
      where: { userId_classId: { userId, classId } },
      select: { id: true },
    }),
    prisma.classUser.findUnique({
      where: { userId_classId: { userId, classId } },
      select: { id: true },
    }),
  ]);

  if (existingBan) {
    throw new Error("You are banned from this class");
  }

  if (existingMembership) {
    throw new Error("You are already a member of this class");
  }

  await prisma.$transaction(async (tx) => {
    await tx.classUser.create({
      data: { userId, classId, role: "member" },
    });
    await tx.classAuditLog.create({
      data: {
        classId,
        actorId: userId,
        targetUserId: userId,
        action: ClassAuditAction.MEMBER_JOINED,
      },
    });
  });
}
