import { User } from "next-auth";

export interface Class {
  id: number;
  className: string;
  description: string;
  imageUrl: string;
  subject: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  classCode: string;
  currentUserRole?: "owner" | "moderator" | "member";
  isInviteEnabled?: boolean;
  allowMemberMessages?: boolean;
  allowMemberLiveParticipation?: boolean;
  visibility?: "INVITE_ONLY" | "PUBLIC";
}

export interface ClassMember {
  id: number; 
  role: "owner" | "moderator" | "member";
  user: {
    name?: string;
    email: string;
  } | null;
}
