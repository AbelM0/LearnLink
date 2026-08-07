"use server";

import { ClassAuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ensureClassOwner,
  requireCurrentUser,
} from "@/lib/class-access";
import { getRoomServiceClient } from "@/lib/livekit";
import { prisma } from "@/lib/prisma";
import {
  classDetailsSchema,
  classPermissionsSchema,
  type ClassDetailsValues,
  type ClassPermissionsValues,
} from "@/lib/validation";

const classIdSchema = z.coerce.number().int().positive();
const userIdSchema = z.string().trim().min(1).max(191);

async function requireSettingsOwner(classIdValue: number) {
  const classId = classIdSchema.parse(classIdValue);
  const user = await requireCurrentUser();
  const classData = await ensureClassOwner(classId, user.id);

  return { classId, user, classData };
}

function revalidateClassSettings(classId: number) {
  revalidatePath("/");
  revalidatePath(`/class/${classId}`);
  revalidatePath(`/class/${classId}/settings`);
  revalidatePath(`/class/${classId}/members`);
}

async function disconnectOrdinaryMembersFromLiveClass(classId: number) {
  const [liveSession, ordinaryMembers] = await Promise.all([
    prisma.liveSession.findFirst({
      where: { classId, status: "LIVE" },
      orderBy: { startedAt: "desc" },
      select: { id: true, roomName: true },
    }),
    prisma.classUser.findMany({
      where: { classId, role: "member" },
      select: { userId: true },
    }),
  ]);

  if (!liveSession || !ordinaryMembers.length) return;

  const userIds = ordinaryMembers.map((member) => member.userId);
  await prisma.liveSessionParticipant.updateMany({
    where: {
      liveSessionId: liveSession.id,
      userId: { in: userIds },
      leftAt: null,
    },
    data: { leftAt: new Date() },
  });

  try {
    const roomService = getRoomServiceClient();
    await Promise.allSettled(
      userIds.map((userId) =>
        roomService.removeParticipant(liveSession.roomName, userId),
      ),
    );
  } catch (error) {
    console.error("Failed to remove members after changing live permissions", error);
  }
}

export async function updateClassDetails(
  classIdValue: number,
  values: ClassDetailsValues,
) {
  const { classId, user } = await requireSettingsOwner(classIdValue);
  const data = classDetailsSchema.parse(values);
  const current = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      className: true,
      subject: true,
      description: true,
      imageUrl: true,
    },
  });

  if (!current) throw new Error("Class not found");

  const changedFields = (Object.keys(data) as Array<keyof typeof data>).filter(
    (field) => current[field] !== data[field],
  );

  if (!changedFields.length) {
    return { success: true, message: "No class details changed", className: current.className };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const classData = await tx.class.update({ where: { id: classId }, data });
    await tx.classAuditLog.create({
      data: {
        classId,
        actorId: user.id,
        action: ClassAuditAction.CLASS_DETAILS_UPDATED,
        reason: `Updated ${changedFields.join(", ")}`,
      },
    });
    return classData;
  });

  revalidateClassSettings(classId);
  return {
    success: true,
    message: "Class details updated",
    className: updated.className,
  };
}

export async function updateClassPermissions(
  classIdValue: number,
  values: ClassPermissionsValues,
) {
  const { classId, user } = await requireSettingsOwner(classIdValue);
  const data = classPermissionsSchema.parse(values);
  const current = await prisma.class.findUnique({
    where: { id: classId },
    select: { allowMemberLiveParticipation: true },
  });

  if (!current) throw new Error("Class not found");

  await prisma.$transaction([
    prisma.class.update({ where: { id: classId }, data }),
    prisma.classAuditLog.create({
      data: {
        classId,
        actorId: user.id,
        action: ClassAuditAction.CLASS_PERMISSIONS_UPDATED,
        reason: [
          `Invites ${data.isInviteEnabled ? "enabled" : "disabled"}`,
          `member messages ${data.allowMemberMessages ? "enabled" : "disabled"}`,
          `member live participation ${data.allowMemberLiveParticipation ? "enabled" : "disabled"}`,
        ].join("; "),
      },
    }),
  ]);

  if (
    current.allowMemberLiveParticipation &&
    !data.allowMemberLiveParticipation
  ) {
    await disconnectOrdinaryMembersFromLiveClass(classId);
  }

  revalidateClassSettings(classId);
  return { success: true, message: "Class permissions updated" };
}

export async function regenerateClassCode(classIdValue: number) {
  const { classId, user } = await requireSettingsOwner(classIdValue);
  let classCode = "";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = crypto
      .randomUUID()
      .replaceAll("-", "")
      .slice(0, 10)
      .toUpperCase();
    const exists = await prisma.class.findUnique({
      where: { classCode: candidate },
      select: { id: true },
    });

    if (!exists) {
      classCode = candidate;
      break;
    }
  }

  if (!classCode) {
    throw new Error("Could not generate a unique class code. Please try again.");
  }

  await prisma.$transaction([
    prisma.class.update({ where: { id: classId }, data: { classCode } }),
    prisma.classAuditLog.create({
      data: {
        classId,
        actorId: user.id,
        action: ClassAuditAction.CLASS_INVITE_CODE_REGENERATED,
      },
    }),
  ]);

  revalidateClassSettings(classId);
  return { success: true, message: "A new class code was generated", classCode };
}

export async function transferClassOwnership(
  classIdValue: number,
  targetUserIdValue: string,
) {
  const { classId, user } = await requireSettingsOwner(classIdValue);
  const targetUserId = userIdSchema.parse(targetUserIdValue);

  if (targetUserId === user.id) {
    throw new Error("You already own this class");
  }

  const target = await prisma.classUser.findUnique({
    where: { userId_classId: { classId, userId: targetUserId } },
    select: { id: true, user: { select: { name: true, email: true } } },
  });

  if (!target) {
    throw new Error("Choose a current class member as the new owner");
  }

  const activeLiveSession = await prisma.liveSession.findFirst({
    where: { classId, status: "LIVE" },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.class.update({
      where: { id: classId },
      data: { ownerId: targetUserId },
    });
    await tx.classUser.updateMany({
      where: { classId, userId: user.id },
      data: { role: "moderator" },
    });
    await tx.classUser.update({
      where: { id: target.id },
      data: { role: "owner" },
    });
    if (activeLiveSession) {
      await tx.liveSession.update({
        where: { id: activeLiveSession.id },
        data: { hostId: targetUserId },
      });
      await tx.liveSessionParticipant.updateMany({
        where: {
          liveSessionId: activeLiveSession.id,
          userId: user.id,
          leftAt: null,
        },
        data: { role: "PARTICIPANT" },
      });
      await tx.liveSessionParticipant.updateMany({
        where: {
          liveSessionId: activeLiveSession.id,
          userId: targetUserId,
          leftAt: null,
        },
        data: { role: "HOST" },
      });
    }
    await tx.classAuditLog.create({
      data: {
        classId,
        actorId: user.id,
        targetUserId,
        action: ClassAuditAction.CLASS_OWNERSHIP_TRANSFERRED,
        reason: `Ownership transferred to ${target.user.name || target.user.email}`,
      },
    });
  });

  revalidateClassSettings(classId);
  return { success: true, message: "Class ownership transferred" };
}

export async function deleteClass(
  classIdValue: number,
  confirmationValue: string,
) {
  const { classId, classData } = await requireSettingsOwner(classIdValue);
  const confirmation = z.string().trim().parse(confirmationValue);

  if (confirmation !== classData.className) {
    throw new Error("Enter the class name exactly to confirm deletion");
  }

  const activeLiveSession = await prisma.liveSession.findFirst({
    where: { classId, status: "LIVE" },
    select: { roomName: true },
  });

  if (activeLiveSession) {
    try {
      await getRoomServiceClient().deleteRoom(activeLiveSession.roomName);
    } catch (error) {
      console.error("Failed to close LiveKit room while deleting class", error);
    }
  }

  await prisma.class.delete({ where: { id: classId } });
  revalidatePath("/");

  return { success: true, message: "Class permanently deleted" };
}
