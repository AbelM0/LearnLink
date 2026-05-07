import { NextResponse } from "next/server";
import { createParticipantToken, getLiveKitWsUrl } from "@/lib/livekit";
import {
  ensureClassAccess,
  getActiveLiveSessionByClassId,
  requireCurrentUser,
  upsertLiveSessionParticipant,
} from "@/lib/live-session";
import { LiveSessionRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const { classId } = await request.json();
    const parsedClassId = Number(classId);

    if (Number.isNaN(parsedClassId)) {
      return NextResponse.json({ error: "Invalid class id" }, { status: 400 });
    }

    await ensureClassAccess(parsedClassId, user.id);

    const liveSession = await getActiveLiveSessionByClassId(parsedClassId);

    if (!liveSession) {
      return NextResponse.json(
        { error: "No active live class found" },
        { status: 404 },
      );
    }

    const participantRole =
      liveSession.hostId === user.id
        ? LiveSessionRole.HOST
        : LiveSessionRole.PARTICIPANT;

    await upsertLiveSessionParticipant(liveSession.id, user.id, participantRole);

    const token = await createParticipantToken({
      roomName: liveSession.roomName,
      identity: user.id,
      name: user.name ?? user.email ?? "LearnLink User",
      metadata: JSON.stringify({
        classId: parsedClassId,
        liveSessionId: liveSession.id,
        role: participantRole,
      }),
    });

    return NextResponse.json({
      token,
      wsUrl: getLiveKitWsUrl(),
      roomName: liveSession.roomName,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create a LiveKit token";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
