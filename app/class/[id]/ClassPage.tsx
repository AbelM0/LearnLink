"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { User } from "next-auth";
import ChannelList from "@/components/ChannalList";
import Chat from "@/components/Chat";
import ClassMembers from "@/components/ClassMembers";
import { Class, ClassMember } from "@/types/class-type";

interface ClassPageProps {
  user: User;
  classData: Class;
  classMembers: ClassMember[];
}

export default function ClassPage({
  user,
  classData,
  classMembers
}: ClassPageProps) {
  const session = useSession();
  const status = session.status;

  const [showChat, setShowChat] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  if (!classData) {
    redirect("/not-found");
  }

  if (status !== "loading" && !user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-1 md:flex-row h-screen">
      <ChannelList classData={classData} showChat={showChat} setShowChat={setShowChat} />
      <Chat showChat={showChat} setShowChat={setShowChat} setShowMembers={setShowMembers} />
      <ClassMembers showMembers={showMembers} setShowMembers={setShowMembers} classMembers={classMembers} />
    </div>
  );
}
