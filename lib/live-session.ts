import "server-only";

import { ensureClassOwner } from "@/lib/class-access";
import { getRoomServiceClient } from "@/lib/livekit";
import { prisma } from "@/lib/prisma";
import { LiveSession } from "@/types/live-session";
import { LiveSessionRole, Prisma } from "@prisma/client";

const liveSessionInclude = {
  class: {
    select: {
      id: true,
      className: true,
      ownerId: true,
    },
  },
  host: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  participants: {
    where: {
      leftAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      joinedAt: "asc",
    },
  },
} as const;

type LiveSessionWithRelations = Prisma.LiveSessionGetPayload<{
  include: typeof liveSessionInclude;
}>;

function toLiveSession(session: LiveSessionWithRelations | null) {
  if (!session) {
    return null;
  }

  return {
    ...session,
    participantCount: session.participants.length,
  } satisfies LiveSession;
}

export function buildRoomName(classId: number) {
  return "learnlink-class-" + classId + "-" + crypto.randomUUID();
}

export async function getActiveLiveSessionByClassId(classId: number) {
  const session = await prisma.liveSession.findFirst({
    where: {
      classId,
      status: "LIVE",
    },
    include: liveSessionInclude,
    orderBy: {
      startedAt: "desc",
    },
  });

  return toLiveSession(session);
}

export async function startLiveSessionForClass(classId: number, hostId: string) {
  await ensureClassOwner(classId, hostId);

  const existingSession = await getActiveLiveSessionByClassId(classId);
  if (existingSession) {
    await upsertLiveSessionParticipant(existingSession.id, hostId, LiveSessionRole.HOST);
    return existingSession;
  }

  const roomName = buildRoomName(classId);
  const roomService = getRoomServiceClient();

  await roomService.createRoom({
    name: roomName,
    emptyTimeout: 60 * 10,
    departureTimeout: 60 * 5,
    maxParticipants: 50,
  });

  const createdSession = await prisma.liveSession.create({
    data: {
      classId,
      hostId,
      roomName,
      status: "LIVE",
      participants: {
        create: {
          user: { connect: { id: hostId } },
          role: "HOST",
        },
      },
    },
    include: liveSessionInclude,
  });

  return toLiveSession(createdSession);
}

export async function endLiveSessionForClass(classId: number, userId: string) {
  await ensureClassOwner(classId, userId);

  const activeSession = await prisma.liveSession.findFirst({
    where: {
      classId,
      status: "LIVE",
    },
  });

  if (!activeSession) {
    return null;
  }

  const roomService = getRoomServiceClient();
  await roomService.deleteRoom(activeSession.roomName).catch(() => undefined);

  const endedSession = await prisma.liveSession.update({
    where: {
      id: activeSession.id,
    },
    data: {
      status: "ENDED",
      endedAt: new Date(),
      participants: {
        updateMany: {
          where: {
            leftAt: null,
          },
          data: {
            leftAt: new Date(),
          },
        },
      },
    },
    include: liveSessionInclude,
  });

  return toLiveSession(endedSession);
}

export async function upsertLiveSessionParticipant(
  liveSessionId: number,
  userId: string,
  role: LiveSessionRole = LiveSessionRole.PARTICIPANT,
) {
  const existingParticipant = await prisma.liveSessionParticipant.findFirst({
    where: {
      liveSessionId,
      userId,
      leftAt: null,
    },
  });

  if (existingParticipant) {
    return existingParticipant;
  }

  return prisma.liveSessionParticipant.create({
    data: {
      liveSessionId,
      userId,
      role,
    },
  });
}

export async function markParticipantLeft(liveSessionId: number, userId: string) {
  const participant = await prisma.liveSessionParticipant.findFirst({
    where: {
      liveSessionId,
      userId,
      leftAt: null,
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  if (!participant) {
    return null;
  }

  return prisma.liveSessionParticipant.update({
    where: {
      id: participant.id,
    },
    data: {
      leftAt: new Date(),
    },
  });
}
