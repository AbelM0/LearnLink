"use client";

import { useChannelStore } from "@/Stores/useChannelStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createMessageSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { createMessage, getChannelMessages } from "@/app/class/[id]/actions";
import Message from "./Message";

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
}

type CreateMessageValues = z.infer<typeof createMessageSchema>;

export default function Chat({
  showChat,
  setShowChat,
  setShowMembers,
}: ChatProps) {
  const { selectedChannel, getSelectedChannelId } = useChannelStore();

  const [channelId, setChannelId] = useState<number | undefined>(undefined);

  console.log("Current channelId:", channelId); // Check the value of channelId

  const session = useSession();
  const userId = session.data?.user.id;

  const [messages, setMessages] = useState<Message[]>([]);

  // Ensure channelId has a valid default value
  const form = useForm<CreateMessageValues>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: ""
    },
  });

  useEffect(() => {
    const currentChannelId = getSelectedChannelId();
    setChannelId(currentChannelId); // Update channelId state when selectedChannel changes
  }, [selectedChannel, getSelectedChannelId]);

  useEffect(() => {
    if (channelId !== undefined) {
      form.setValue("channelId", channelId);
    }
  }, [channelId]);

  useEffect(() => {
    if (channelId) {
      getChannelMessages(channelId).then(setMessages);
    }
  }, [channelId]);

  async function onSubmit(values: CreateMessageValues) {
    const currentChannelId = getSelectedChannelId(); // always fresh
    const currentUserId = session.data?.user.id;

    if (!currentChannelId || !currentUserId) {
      console.error("❌ Missing required values:", {
        currentChannelId,
        currentUserId,
        values,
      });
      return;
    }

    const payload = {
      content: values.content,
      userId: currentUserId,
      channelId: currentChannelId,
    };

    try {
      await createMessage(payload);
      form.reset({ content: "" });
      const updatedMessages = await getChannelMessages(currentChannelId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error("❌ Error creating message:", error);
    }
  }

  return (
    <div
      className={`flex-1 bg-card p-6 flex flex-col border rounded-md h-screen ${
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
          <h2 className="font-semibold">#{selectedChannel.toLowerCase()}</h2>
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
      <div className="flex-1 overflow-y-auto space-y-1 rounded-md mt-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <Message data={message} key={message.id}/>
          ))
        ) : (
          <p className="text-center">
            No messages yet in #{selectedChannel.toLowerCase()}.
          </p>
        )}
      </div>

      {/* Chat Input */}
      <div className="sticky bottom-2 left-0 w-full bg-accent p-1 rounded-lg border flex items-center gap-3">
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error(
              `❌ Validation failed: userId: ${userId}, channelId: ${channelId}`,
              errors
            );
          })}
          className="w-full"
        >
          <input
            {...form.register("content")}
            type="text"
            disabled={!channelId || !userId}
            placeholder={`Message #${selectedChannel.toLowerCase()}...`}
            className="w-full p-2 bg-background rounded-lg outline-none placeholder-gray-400"
          />
        </form>
      </div>
    </div>
  );
}
