"use client";

import { useChannelStore } from "@/Stores/useChannelStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getChannelMessages } from "@/app/class/[id]/actions";
import Message from "./Message";
import ChatForm from "./ChatForm";


interface ChatProps {
  showChat: boolean;
  setShowChat: (value: boolean) => void;
  setShowMembers: (value: boolean) => void; // Toggle Members Dialog
}

interface Message {
  content: string;
  userId: string;
  channelId: number;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function Chat({
  showChat,
  setShowChat,
  setShowMembers,
}: ChatProps) {
  const { selectedChannel } = useChannelStore();

  const session = useSession();
  const userId = session.data?.user.id;

  console.log("Current channelId:", selectedChannel && selectedChannel.id);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (selectedChannel) {
      getChannelMessages(selectedChannel.id).then(setMessages);
    }
  }, [selectedChannel]);

  return (
    <div
      className={`flex-1 bg-card p-6 flex flex-col border rounded-md h-full ${
        showChat ? "flex" : "hidden md:flex"
      }`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          {/* Back Button for Small Screens */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden flex items-center gap-1"
            onClick={() => setShowChat(false)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold">#{selectedChannel && selectedChannel.name.toLowerCase()}</h2>
        </div>

        {/* Members Button */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden flex items-center gap-1"
          onClick={() => setShowMembers(true)}
        >
          <Users className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-1 rounded-md mt-4">
        {messages.length > 0 ? (
          [...messages]
            .reverse()
            .map((message) => <Message data={message} key={message.id} />)
        ) : (
          <p className="text-center">
            No messages yet in #{selectedChannel && selectedChannel.name.toLowerCase()}.
          </p>
        )}
      </div>

      {/* Chat Input */}
      {selectedChannel && userId !== undefined && (
        <ChatForm
          channelId={selectedChannel.id}
          userId={userId}
          channelName={selectedChannel.name}
          setMessages={setMessages}
        />
      )}
    </div>
  );
}

