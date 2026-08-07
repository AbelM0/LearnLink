"use client";

import useSocket from "@/hooks/use-socket";
import { useChannelStore } from "@/Stores/useChannelStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Message from "./Message";
import ChatForm from "./ChatForm";
import { useQueryClient } from "@tanstack/react-query";

import { useGetMessages } from "@/hooks/queries/use-chat-query";
import MessageSkeleton from "./MessageSkeleton";

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
  const socket = useSocket();
  const queryClient = useQueryClient();

  const session = useSession();
  const userId = session.data?.user.id;
  const userName = session.data?.user?.name || "Unknown";
  const selectedChannelId = selectedChannel?.id;

  // Fetch messages using custom hook
  const { data: messages = [], isLoading } = useGetMessages(
    selectedChannel?.id
  );

  // Join channel room and listen for real-time messages
  useEffect(() => {
    if (!selectedChannelId || !socket) {
      return;
    }

    socket.emit("joinChannel", selectedChannelId, userName);

    const handleMessage = (msg: { channelId: number }) => {
      if (msg.channelId === selectedChannelId) {
        void queryClient.invalidateQueries({
          queryKey: ["messages", selectedChannelId],
        });
      }
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [selectedChannelId, socket, userName, queryClient]);

  return (
    <div
      className={`flex-1 bg-card p-3 md:p-6 flex flex-col border rounded-md h-full ${
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
            className="md:hidden flex items-center gap-1 bg-card"
            onClick={() => setShowChat(false)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold">
            #{selectedChannel && selectedChannel.name.toLowerCase()}
          </h2>
        </div>

        {/* Members Button */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden flex items-center gap-1 bg-card"
          onClick={() => setShowMembers(true)}
        >
          <Users className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-1 rounded-md mt-4">
        {isLoading ? (
          <MessageSkeleton />
        ) : messages.length > 0 ? (
          [...messages]
            .reverse()
            .map((message) => <Message data={message} key={message.id} />)
        ) : (
          <p className="text-center">
            No messages yet in #
            {selectedChannel && selectedChannel.name.toLowerCase()}.
          </p>
        )}
      </div>

      {/* Chat Input */}
      {selectedChannel && userId !== undefined && (
        <ChatForm
          channelId={selectedChannel.id}
          userId={userId}
          channelName={selectedChannel.name}
          socket={socket}
        />
      )}
    </div>
  );
}
