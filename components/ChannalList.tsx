"use client";

import { useChannelStore } from "@/Stores/useChannelStore";
import { Class } from "@/types/class-type";
import { Megaphone, MessageCircle, FileText } from "lucide-react";
import { useSession } from "next-auth/react";

interface ChannelListProps {
  showChat: boolean;
  setShowChat: (value: boolean) => void;
  classData: Class;
}

export default function ChannelList({
  showChat,
  setShowChat,
  classData
}: ChannelListProps) {
  const { selectedChannel, setChannel } = useChannelStore();

  const channels = [
    { name: "Announcements", icon: <Megaphone className="w-5 h-5" /> },
    { name: "General Chat", icon: <MessageCircle className="w-5 h-5" /> },
    { name: "Materials", icon: <FileText className="w-5 h-5" /> },
  ];

    const session = useSession();
    const userId = session.data?.user.id;

  return (
    <div
      className={`w-full md:w-64 bg-card flex flex-col p-2 border rounded-md ${
        showChat ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="border-b pb-2 mb-2">
        <h2 className="text-lg font-semibold">{classData.className}</h2>
        <p className="text-sm ">{classData.subject}</p>
        {userId === classData.ownerId && (
          <p className="text-xs text-gray-400">
            Class Code: {classData.classCode}
          </p>
        )}
      </div>
      <p className="mb-2">TEXT CHANNELS</p>
      <ul className="space-y-2">
        {channels.map(({ name, icon }) => (
          <li
            key={name}
            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition ${
              selectedChannel === name ? "bg-accent" : "hover:bg-accent"
            }`}
            onClick={() => {
              setChannel(name);
              setShowChat(true);
            }}
          >
            {icon} {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
