import { NextResponse } from "next/server";
import { createParticipantToken, getLiveKitWsUrl } from "@/lib/livekit";
import {
  ensureClassAccess,
  requireCurrentUser,
} from "@/lib/class-access";
import {
  getActiveLiveSessionByClassId,
  upsertLiveSessionParticipant,
} from "@/lib/live-session";
import { LiveSessionRole } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const classIdValue =
    typeof body === "object" && body !== null && "classId" in body
      ? (body as { classId?: unknown }).classId
      : undefined;
  const classId = Number(classIdValue);

  if (!Number.isInteger(classId) || classId < 1) {
    return NextResponse.json({ error: "Invalid class id" }, { status: 400 });
  }

  try {
    const user = await requireCurrentUser();
    await ensureClassAccess(classId, user.id);

    const liveSession = await getActiveLiveSessionByClassId(classId);

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

    await upsertLiveSessionParticipant(
      liveSession.id,
      user.id,
      participantRole,
    );

    const token = await createParticipantToken({
      roomName: liveSession.roomName,
      identity: user.id,
      name: user.name ?? user.email ?? "LearnLink User",
      metadata: JSON.stringify({
        classId,
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
    const message = error instanceof Error ? error.message : "";

    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (message === "You do not have access to this class") {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message.startsWith("LiveKit is not configured")) {
      return NextResponse.json(
        { error: "LiveKit is not configured on the server" },
        { status: 503 },
      );
    }

    console.error("Failed to create LiveKit token", error);
    return NextResponse.json(
      { error: "Failed to prepare the live class" },
      { status: 500 },
    );
  }
}
