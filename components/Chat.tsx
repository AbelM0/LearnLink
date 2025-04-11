"use client";

import { useChannelStore } from "@/Stores/useChannelStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

interface ChatProps {
  showChat: boolean;
  setShowChat: (value: boolean) => void;
  setShowMembers: (value: boolean) => void; // Toggle Members Dialog
}

export default function Chat({
  showChat,
  setShowChat,
  setShowMembers,
}: ChatProps) {
  const { selectedChannel } = useChannelStore();

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-md mt-4">
        <p className="text-center">
          No messages yet in #{selectedChannel.toLowerCase()}.
        </p>
      </div>

      {/* Chat Input */}
      <div className="sticky bottom-2 left-0 w-full bg-accent p-1 rounded-lg border flex items-center gap-3">
        <input
          type="text"
          placeholder={`Message #${selectedChannel.toLowerCase()}...`}
          className="w-full p-2 bg-background rounded-lg outline-none placeholder-gray-400"
        />
      </div>
    </div>
  );
}
