"use client";

import { useChannelStore } from "@/Stores/useChannelStore";
import { Megaphone, MessageCircle, FileText } from "lucide-react";

interface ChannelListProps {
  showChat: boolean;
  setShowChat: (value: boolean) => void;
}

export default function ChannelList({
  showChat,
  setShowChat,
}: ChannelListProps) {
  const { selectedChannel, setChannel } = useChannelStore();

  const channels = [
    { name: "Announcements", icon: <Megaphone className="w-5 h-5" /> },
    { name: "General Chat", icon: <MessageCircle className="w-5 h-5" /> },
    { name: "Materials", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div
      className={`w-full md:w-64 bg-card flex flex-col p-2 border rounded-md ${
        showChat ? "hidden md:flex" : "flex"
      }`}
    >
      <h2 className="mb-2">TEXT CHANNELS</h2>
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
