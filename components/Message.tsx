import React from 'react';
import Image from 'next/image';
import avatarPlaceholder from "@/assets/images/avatar_placeholder.png";
import { formatDistanceToNow } from "date-fns";

interface MessageProps {
  data: {
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
    }
  }
}

export default function Message({ data }: MessageProps) {

  const timeAgo = formatDistanceToNow(new Date(data.createdAt), {
    addSuffix: true,
  })

return (
    <div key={data.id} className="flex items-start space-x-3 py-1">
      {/* Avatar */}
      <div className="w-10 h-10 flex-shrink-0">
        <Image
          src={data.user.image || avatarPlaceholder}
          alt="User profile picture"
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </div>

      {/* Message Content */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {data.user.name || 'Unknown'}
          </span>
          <span className="text-gray-500 text-xs">{timeAgo}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{data.content}</p>
      </div>
    </div>
  );
}
