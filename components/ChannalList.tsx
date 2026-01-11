"use client";

import { useChannelStore } from "@/Stores/useChannelStore";
import { Class } from "@/types/class-type";
import { Hash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import AddChannelButton from "@/components/ui/AddChannelButton";
import { ClassDropdownMenu } from "./ClassDropdownMenu";
import { useGetChannels } from "@/hooks/queries/use-channel-query";
import ChannelSkeleton from "./ChannelSkeleton";

interface ChannelListProps {
  showChat: boolean;
  setShowChat: (value: boolean) => void;
  classData: Class;
}

export default function ChannelList({
  showChat,
  setShowChat,
  classData,
}: ChannelListProps) {
  const { selectedChannel, setSelectedChannel } = useChannelStore();

  const { data: channels = [], isLoading } = useGetChannels(classData.id);

  // Reset selection when switching classes
  useEffect(() => {
    setSelectedChannel(null);
  }, [classData.id, setSelectedChannel]);

  // Auto-select first channel when channels load
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel, setSelectedChannel]);

  const session = useSession();
  const userId = session.data?.user.id;

  return (
    <div
      className={`w-full md:w-64 bg-card flex flex-col p-2 border rounded-md h-full ${
        showChat ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="border-b pb-2 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-semibold">{classData.className}</h2>
          {userId === classData.ownerId && <ClassDropdownMenu />}
        </div>

        <p className="text-sm ">{classData.subject}</p>
        {/* {userId === classData.ownerId && (
          <p className="text-xs text-gray-400">
            Class Code: {classData.classCode}
          </p>
        )} */}
      </div>
      <div className="flex justify-between items-center mb-1">
        <p>Text Channels</p>
        {userId === classData.ownerId && <AddChannelButton />}
      </div>
      {isLoading ? (
        <ChannelSkeleton />
      ) : (
        <ul className="space-y-2">
          {channels.map(({ id, name }: { id: number; name: string }) => (
            <li
              key={id}
              className={`flex items-center gap-2 p-1  rounded-md cursor-pointer transition ${
                selectedChannel && selectedChannel.id === id
                  ? "bg-accent"
                  : "hover:bg-accent"
              }`}
              onClick={() => {
                const channel = channels.find((ch) => ch.id === id);
                if (channel) {
                  setSelectedChannel(channel);
                  setShowChat(true);
                }
              }}
            >
              {<Hash className="size-4" />} {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
