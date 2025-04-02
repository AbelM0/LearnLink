import { User } from "next-auth";

export interface Class {
  id: number;
  className: string;
  description: string;
  subject: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  classCode: string;
}

export interface ClassMember {
  id: number; 
  role: "owner" | "member";
  user: {
    name?: string;
    email: string;
  } | null;
}
