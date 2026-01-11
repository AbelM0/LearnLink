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

  // Fetch messages using custom hook
  const { data: messages = [] } = useGetMessages(selectedChannel?.id);

  // Join channel room and listen for real-time messages
  useEffect(() => {
    if (selectedChannel && socket.current) {
      // Join the channel room
      socket.current.emit(
        "joinChannel",
        selectedChannel.id,
        session.data?.user?.name || "Unknown"
      );

      // Listen for new messages
      const handleMessage = async (msg: {
        content: string;
        userId: string;
        channelId: number;
      }) => {
        if (msg.channelId === selectedChannel.id) {
          // Invalidate query to refetch messages
          queryClient.invalidateQueries({
            queryKey: ["messages", selectedChannel.id],
          });
        }
      };
      socket.current.on("message", handleMessage);

      // Cleanup on channel change/unmount
      return () => {
        socket.current?.off("message", handleMessage);
      };
    }
  }, [selectedChannel, socket, session.data?.user?.name, queryClient]);

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
          <h2 className="font-semibold">
            #{selectedChannel && selectedChannel.name.toLowerCase()}
          </h2>
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
        />
      )}
    </div>
  );
}
