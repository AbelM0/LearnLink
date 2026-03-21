import React from 'react';
import Image from 'next/image';
import avatarPlaceholder from "@/assets/images/avatar_placeholder.png";
import { formatDistanceToNow } from "date-fns";
import { FileIcon } from "lucide-react";

interface MessageProps {
  data: {
    content?: string | null;
    fileUrls?: string[] | null;
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

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "jfif", "avif", "bmp", "ico", "tiff"];

function getFileName(url: string) {
  try {
    const urlObj = new URL(url);
    const nameStr = urlObj.searchParams.get("name");
    if (nameStr) return nameStr;
  } catch {}
  return url.split("/").pop()?.split("-").slice(1).join("-") || url.split("/").pop() || "View Attachment";
}

function isImage(url: string) {
  const name = getFileName(url);
  const ext = name.split(".").pop()?.toLowerCase().split("?")[0];
  return ext ? IMAGE_EXTENSIONS.includes(ext) : false;
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

        {/* Text content */}
        {data.content && (
          <p className="text-sm whitespace-pre-wrap">{data.content}</p>
        )}

        {/* File/Image attachments */}
        {data.fileUrls && data.fileUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.fileUrls.map((url, index) => (
              <div key={index}>
                {isImage(url) ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={url}
                      alt="Attached image"
                      width={300}
                      height={200}
                      className="rounded-md object-cover max-w-xs cursor-pointer hover:opacity-90 transition"
                    />
                  </a>
                ) : (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-accent hover:bg-accent/80 border border-border rounded-md px-3 py-2 text-sm transition w-fit"
                  >
                    <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="truncate max-w-xs">{getFileName(url)}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
