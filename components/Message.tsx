"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import avatarPlaceholder from "@/assets/images/avatar_placeholder.png";
import { formatDistanceToNow } from "date-fns";
import { FileIcon, Star, Download, X } from "lucide-react";
import { toggleFavoriteGif, getFavoriteGifs } from "@/actions/gif";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";

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
  const [favorites, setFavorites] = useState<{ url: string }[]>([]);

  useEffect(() => {
    const hasGifs = data.fileUrls?.some(url => url.toLowerCase().includes('.gif') || url.includes('klipy.com'));
    if (hasGifs) {
      getFavoriteGifs()
        .then(favs => setFavorites(favs.map(f => ({ url: f.url }))))
        .catch(console.error);
    }
  }, [data.fileUrls]);

  const handleToggleFavorite = async (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isFav = favorites.some((f) => f.url === url);
    const klipyId = url.split("/").pop()?.split(".")[0] || url;

    // Optimistic toggle
    if (isFav) {
      setFavorites((prev) => prev.filter((f) => f.url !== url));
    } else {
      setFavorites((prev) => [...prev, { url }]);
    }

    try {
      await toggleFavoriteGif({
        klipyId,
        url,
        width: 450,
        height: 450,
        title: "Saved from Chat",
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      // Revert optimistic
      if (isFav) setFavorites((prev) => [...prev, { url }]);
      else setFavorites((prev) => prev.filter((f) => f.url !== url));
    }
  };

  const timeAgo = formatDistanceToNow(new Date(data.createdAt), {
    addSuffix: true,
  });

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
            {data.fileUrls.map((url, index) => {
              const isGif = url.toLowerCase().includes('.gif') || url.includes('klipy.com');
              const isFav = favorites.some((f) => f.url === url);

              return (
                <div key={index} className="relative group">
                  {isImage(url) ? (
                    <Dialog>
                      <div className="relative">
                        <DialogTrigger asChild>
                          <Image
                            src={url}
                            alt="Attached image"
                            width={300}
                            height={200}
                            unoptimized={isGif}
                            className="rounded-md object-cover max-w-xs flex-shrink-0 cursor-pointer hover:opacity-90 transition"
                          />
                        </DialogTrigger>
                        
                        {isGif && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleFavorite(e, url)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 transition-opacity z-10 opacity-0 group-hover:opacity-100"
                          >
                            <Star className={`w-4 h-4 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-white"}`} />
                          </button>
                        )}
                      </div>

                      <DialogContent 
                        hideCloseButton 
                        overlayClassName="bg-black/90" 
                        className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center"
                      >
                        <DialogTitle className="sr-only">Image Preview</DialogTitle>
                        <div className="relative w-full h-full flex items-center justify-center group/preview">
                          {/* Click outside to close */}
                          <DialogClose className="absolute inset-0 z-0 cursor-default" />
                          
                          <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="relative">
                              <DialogClose className="absolute -top-12 right-0 p-2.5 bg-zinc-800/90 hover:bg-zinc-700 text-white rounded-full transition-colors border border-white/10 shadow-xl z-50 group">
                                <X className="w-5 h-5" />
                                <span className="sr-only">Close</span>
                              </DialogClose>
                              
                              <Image
                                src={url}
                                alt="Attached image preview"
                                width={1920}
                                height={1080}
                                unoptimized={isGif}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                              />

                              <a 
                                href={url} 
                                download={getFileName(url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute -bottom-12 right-0 p-2.5 bg-zinc-800/90 hover:bg-zinc-700 text-white rounded-full transition-all border border-white/10 shadow-xl opacity-0 group-hover/preview:opacity-100"
                                title="Download"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download className="w-5 h-5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <a
                      href={url}
                      download={getFileName(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-accent hover:bg-accent/80 border border-border rounded-md px-3 py-2 text-sm transition w-fit"
                    >
                      <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="truncate max-w-xs">{getFileName(url)}</span>
                      <Download className="w-4 h-4 text-muted-foreground ml-1" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
