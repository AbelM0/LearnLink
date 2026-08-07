import "server-only";

import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const liveKitUrl = process.env.LIVEKIT_URL;
const liveKitApiKey = process.env.LIVEKIT_API_KEY;
const liveKitApiSecret = process.env.LIVEKIT_API_SECRET;

function assertLiveKitConfig() {
  if (!liveKitUrl || !liveKitApiKey || !liveKitApiSecret) {
    throw new Error(
      "LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.",
    );
  }

  return {
    liveKitUrl,
    liveKitApiKey,
    liveKitApiSecret,
  };
}

export function getLiveKitWsUrl() {
  return assertLiveKitConfig().liveKitUrl;
}

export function getRoomServiceClient() {
  const { liveKitUrl, liveKitApiKey, liveKitApiSecret } = assertLiveKitConfig();

  return new RoomServiceClient(liveKitUrl, liveKitApiKey, liveKitApiSecret);
}

export async function createParticipantToken(options: {
  roomName: string;
  identity: string;
  name?: string | null;
  metadata?: string;
}) {
  const { liveKitApiKey, liveKitApiSecret } = assertLiveKitConfig();

  const token = new AccessToken(liveKitApiKey, liveKitApiSecret, {
    identity: options.identity,
    name: options.name ?? undefined,
    metadata: options.metadata,
    ttl: "2h",
  });

  token.addGrant({
    room: options.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}
