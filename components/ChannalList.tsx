"use client";

import { useChannelStore } from "@/Stores/useChannelStore";
import { Class } from "@/types/class-type";
import { Hash } from "lucide-react";
import { useSession } from "next-auth/react";
import { getClassChannels } from "@/app/class/[id]/actions";
import { useEffect } from "react";
import  AddChannelButton  from "@/components/ui/AddChannelButton";

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
  const { selectedChannel, setSelectedChannel, setChannels, channels } = useChannelStore();

   useEffect(() => {
     const fetchChannels = async () => {
       const fetchedChannels = await getClassChannels(classData.id);
       setChannels(fetchedChannels);
     };

     fetchChannels();
   }, [classData.id, setChannels]);


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
      <div className="flex justify-between items-center mb-1">
        <p>Text Channels</p>
        {userId === classData.ownerId && <AddChannelButton />}
      </div>
      <ul className="space-y-2">
        {channels.map(({ name }) => (
          <li
            key={name}
            className={`flex items-center gap-2 p-1  rounded-md cursor-pointer transition ${
              selectedChannel === name ? "bg-accent" : "hover:bg-accent"
            }`}
            onClick={() => {
              setSelectedChannel(name);
              setShowChat(true);
            }}
          >
            {<Hash className="size-4"/>} {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
