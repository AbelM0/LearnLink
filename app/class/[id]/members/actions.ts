"use server";

import { ClassAuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ensureClassManager,
  requireCurrentUser,
} from "@/lib/class-access";
import { prisma } from "@/lib/prisma";
import { getRoomServiceClient } from "@/lib/livekit";

const idSchema = z.coerce.number().int().positive();
const reasonSchema = z.string().trim().max(500).optional();
const roleSchema = z.enum(["member", "moderator"]);
const timeoutMinutesSchema = z.union([
  z.literal(10),
  z.literal(60),
  z.literal(1440),
  z.literal(10080),
]);

async function getModerationContext(classIdValue: number) {
  const classId = idSchema.parse(classIdValue);
  const actor = await requireCurrentUser();
  const membership = await ensureClassManager(classId, actor.id);

  return {
    actor,
    classId,
    isOwner: membership.class.ownerId === actor.id,
  };
}

async function getActionableMember(
  classId: number,
  targetUserId: string,
  actorId: string,
  actorIsOwner: boolean,
) {
  if (targetUserId === actorId) {
    throw new Error("You cannot moderate your own account");
  }

  const target = await prisma.classUser.findUnique({
    where: { userId_classId: { userId: targetUserId, classId } },
    include: {
      class: { select: { ownerId: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!target) {
    throw new Error("This member is no longer in the class");
  }

  if (target.class.ownerId === targetUserId) {
    throw new Error("The class owner cannot be moderated");
  }

  if (!actorIsOwner && target.role !== "member") {
    throw new Error("Moderators can only manage ordinary members");
  }

  return target;
}

function revalidateMemberPages(classId: number) {
  revalidatePath(`/class/${classId}`);
  revalidatePath(`/class/${classId}/members`);
  revalidatePath(`/class/${classId}/live`);
}

async function disconnectFromActiveLiveClass(classId: number, userId: string) {
  const liveSession = await prisma.liveSession.findFirst({
    where: { classId, status: "LIVE" },
    orderBy: { startedAt: "desc" },
    select: { id: true, roomName: true },
  });

  if (!liveSession) return;

  await prisma.liveSessionParticipant.updateMany({
    where: { liveSessionId: liveSession.id, userId, leftAt: null },
    data: { leftAt: new Date() },
  });

  try {
    await getRoomServiceClient().removeParticipant(liveSession.roomName, userId);
  } catch (error) {
    console.error("Failed to remove moderated member from LiveKit", error);
  }
}

export async function updateClassMemberRole(
  classIdValue: number,
  targetUserId: string,
  roleValue: "member" | "moderator",
) {
  const { actor, classId, isOwner } = await getModerationContext(classIdValue);

  if (!isOwner) {
    throw new Error("Only the class owner can change member roles");
  }

  const role = roleSchema.parse(roleValue);
  const target = await getActionableMember(
    classId,
    targetUserId,
    actor.id,
    isOwner,
  );

  if (target.role === role) {
    return { success: true, message: "The member already has this role" };
  }

  await prisma.$transaction([
    prisma.classUser.update({
      where: { id: target.id },
      data: { role },
    }),
    prisma.classAuditLog.create({
      data: {
        classId,
        actorId: actor.id,
        targetUserId,
        action:
          role === "moderator"
            ? ClassAuditAction.MEMBER_PROMOTED
            : ClassAuditAction.MEMBER_DEMOTED,
      },
    }),
  ]);

  revalidateMemberPages(classId);
  return {
    success: true,
    message:
      role === "moderator"
        ? "Member promoted to moderator"
        : "Moderator changed back to member",
  };
}

export async function timeoutClassMember(
  classIdValue: number,
  targetUserId: string,
  minutesValue: 10 | 60 | 1440 | 10080,
  reasonValue?: string,
) {
  const { actor, classId, isOwner } = await getModerationContext(classIdValue);
  const minutes = timeoutMinutesSchema.parse(minutesValue);
  const reason = reasonSchema.parse(reasonValue) || null;
  const target = await getActionableMember(
    classId,
    targetUserId,
    actor.id,
    isOwner,
  );
  const expiresAt = new Date(Date.now() + minutes * 60_000);

  await prisma.$transaction([
    prisma.classUser.update({
      where: { id: target.id },
      data: { timeoutUntil: expiresAt, timeoutReason: reason },
    }),
    prisma.classAuditLog.create({
      data: {
        classId,
        actorId: actor.id,
        targetUserId,
        action: ClassAuditAction.MEMBER_TIMED_OUT,
        reason,
        expiresAt,
      },
    }),
  ]);

  await disconnectFromActiveLiveClass(classId, targetUserId);
  revalidateMemberPages(classId);
  return { success: true, message: "Member timed out" };
}

export async function removeClassMemberTimeout(
  classIdValue: number,
  targetUserId: string,
) {
  const { actor, classId, isOwner } = await getModerationContext(classIdValue);
  const target = await getActionableMember(
    classId,
    targetUserId,
    actor.id,
    isOwner,
  );

  await prisma.$transaction([
    prisma.classUser.update({
      where: { id: target.id },
      data: { timeoutUntil: null, timeoutReason: null },
    }),
    prisma.classAuditLog.create({
      data: {
        classId,
        actorId: actor.id,
        targetUserId,
        action: ClassAuditAction.MEMBER_TIMEOUT_REMOVED,
      },
    }),
  ]);

  revalidateMemberPages(classId);
  return { success: true, message: "Timeout removed" };
}

export async function banClassMember(
  classIdValue: number,
  targetUserId: string,
  reasonValue?: string,
) {
  const { actor, classId, isOwner } = await getModerationContext(classIdValue);
  const reason = reasonSchema.parse(reasonValue) || null;
  const target = await getActionableMember(
    classId,
    targetUserId,
    actor.id,
    isOwner,
  );

  await prisma.$transaction([
    prisma.classBan.create({
      data: {
        classId,
        userId: targetUserId,
        bannedById: actor.id,
        reason,
      },
    }),
    prisma.classUser.delete({ where: { id: target.id } }),
    prisma.classAuditLog.create({
      data: {
        classId,
        actorId: actor.id,
        targetUserId,
        action: ClassAuditAction.MEMBER_BANNED,
        reason,
      },
    }),
  ]);

  await disconnectFromActiveLiveClass(classId, targetUserId);
  revalidateMemberPages(classId);
  return { success: true, message: "Member banned from the class" };
}

export async function unbanClassMember(
  classIdValue: number,
  targetUserId: string,
) {
  const { actor, classId } = await getModerationContext(classIdValue);
  const ban = await prisma.classBan.findUnique({
    where: { userId_classId: { userId: targetUserId, classId } },
  });

  if (!ban) {
    return { success: true, message: "This person is not banned" };
  }

  await prisma.$transaction([
    prisma.classBan.delete({ where: { id: ban.id } }),
    prisma.classAuditLog.create({
      data: {
        classId,
        actorId: actor.id,
        targetUserId,
        action: ClassAuditAction.MEMBER_UNBANNED,
      },
    }),
  ]);

  revalidateMemberPages(classId);
  return { success: true, message: "Ban removed" };
}
