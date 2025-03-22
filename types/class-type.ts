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

export interface ClassMembers {
  id: string;
  name: string;
  email: string;
  role: string;
  user: User;
}
