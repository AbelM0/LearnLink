export type LiveSessionStatus = "LIVE" | "ENDED";
export type LiveSessionRole = "HOST" | "PARTICIPANT";

export interface LiveSessionParticipant {
  id: number;
  userId: string;
  role: LiveSessionRole;
  joinedAt: Date;
  leftAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface LiveSession {
  id: number;
  classId: number;
  hostId: string;
  roomName: string;
  status: LiveSessionStatus;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  class: {
    id: number;
    className: string;
    ownerId: string;
  };
  host: {
    id: string;
    name: string | null;
    email: string;
  };
  participants: LiveSessionParticipant[];
  participantCount: number;
}

export interface LiveSessionTokenResponse {
  token: string;
  wsUrl: string;
  roomName: string;
}
