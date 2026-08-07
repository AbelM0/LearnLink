"use server";

import { revalidatePath } from "next/cache";
import {
  ensureCanJoinClassLiveSession,
  ensureClassAccess,
  requireCurrentUser,
} from "@/lib/class-access";
import {
  endLiveSessionForClass,
  getActiveLiveSessionByClassId,
  markParticipantLeft,
  startLiveSessionForClass,
  upsertLiveSessionParticipant,
} from "@/lib/live-session";
import { LiveSessionRole } from "@prisma/client";

function parseClassId(classId: number | string) {
  const value = Number(classId);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error("Invalid class id");
  }

  return value;
}

export async function getActiveLiveSession(classId: number | string) {
  const parsedClassId = parseClassId(classId);
  const user = await requireCurrentUser();

  await ensureClassAccess(parsedClassId, user.id);

  return getActiveLiveSessionByClassId(parsedClassId);
}

export async function startLiveSession(classId: number | string) {
  const parsedClassId = parseClassId(classId);
  const user = await requireCurrentUser();
  const liveSession = await startLiveSessionForClass(parsedClassId, user.id);

  revalidatePath(`/class/${parsedClassId}`);
  revalidatePath(`/class/${parsedClassId}/live`);

  return liveSession;
}

export async function endLiveSession(classId: number | string) {
  const parsedClassId = parseClassId(classId);
  const user = await requireCurrentUser();
  const liveSession = await endLiveSessionForClass(parsedClassId, user.id);

  revalidatePath(`/class/${parsedClassId}`);
  revalidatePath(`/class/${parsedClassId}/live`);

  return liveSession;
}

export async function registerLiveSessionJoin(classId: number | string) {
  const parsedClassId = parseClassId(classId);
  const user = await requireCurrentUser();

  await ensureCanJoinClassLiveSession(parsedClassId, user.id);

  const liveSession = await getActiveLiveSessionByClassId(parsedClassId);

  if (!liveSession) {
    throw new Error("There is no active live class to join");
  }

  const role =
    liveSession.hostId === user.id
      ? LiveSessionRole.HOST
      : LiveSessionRole.PARTICIPANT;

  await upsertLiveSessionParticipant(liveSession.id, user.id, role);
  revalidatePath(`/class/${parsedClassId}`);

  return liveSession;
}

export async function registerLiveSessionLeave(classId: number | string) {
  const parsedClassId = parseClassId(classId);
  const user = await requireCurrentUser();

  await ensureClassAccess(parsedClassId, user.id);

  const liveSession = await getActiveLiveSessionByClassId(parsedClassId);

  if (!liveSession) {
    return null;
  }

  await markParticipantLeft(liveSession.id, user.id);
  revalidatePath(`/class/${parsedClassId}`);

  return liveSession.id;
}
