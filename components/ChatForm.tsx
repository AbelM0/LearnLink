"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMessageSchema } from "@/lib/validation";
import useSocket from "@/hooks/use-socket";
import { useSendMessage } from "@/hooks/queries/use-chat-query";
import { Plus, Loader2, X, FileIcon, Trash2 } from "lucide-react";
import FileUpload from "./FileUpload";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";
import Image from "next/image";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "jfif", "avif", "bmp", "ico", "tiff"];

function getFileName(url: string) {
  try {
    const urlObj = new URL(url);
    const nameStr = urlObj.searchParams.get("name");
    if (nameStr) return nameStr;
  } catch {}
  return url.split("/").pop()?.split("-").slice(1).join("-") || url.split("/").pop() || "file";
}

function isImage(url: string) {
  const name = getFileName(url);
  const ext = name.split(".").pop()?.toLowerCase().split("?")[0];
  return ext ? IMAGE_EXTENSIONS.includes(ext) : false;
}

type CreateMessageValues = z.infer<typeof createMessageSchema>;

interface ChatFormProps {
  channelId: number;
  userId: string;
  channelName: string;
}

export default function ChatForm({
  channelId,
  userId,
  channelName,
}: ChatFormProps) {
  const socket = useSocket();

  const id = userId;
  const channel_id = channelId;

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const form = useForm<CreateMessageValues>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      fileUrls: [],
      userId: id,
      channelId: channel_id,
    },
  });

  const { mutate, isPending } = useSendMessage();

  async function onSubmit(values: CreateMessageValues) {
    const submitValues = {
      ...values,
      fileUrls: uploadedFiles,
    };

    mutate(submitValues, {
      onSuccess: (data, variables) => {
        // Emit message to socket server for real-time update
        socket.current?.emit("message", {
          ...variables,
          content: variables.content || " ",
          channelId,
          userId,
        });

        // Reset the form and local state
        form.reset({ content: "", fileUrls: [], userId: id, channelId: channel_id });
        setUploadedFiles([]);
        setIsPopoverOpen(false);
      },
      onError: (error) => {
        console.error("Failed to send message:", error);
      },
    });
  }

  useEffect(() => {
    form.reset({
      content: "",
      fileUrls: [],
      userId: id,
      channelId: channel_id,
    });
    setUploadedFiles([]);
  }, [channel_id, id, form]);

  const { register, handleSubmit, setValue, watch } = form;

  useEffect(() => {
    setValue("fileUrls", uploadedFiles, { shouldValidate: true });
  }, [uploadedFiles, setValue]);

  const isDisabled = !channelId || !userId || isPending;

  const removeFile = (urlToRemove: string) => {
    setUploadedFiles((prev) => prev.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="sticky bottom-2 left-0 w-full flex flex-col gap-2 mt-4">
      {/* File Preview List */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-4 p-4 bg-accent/50 rounded-lg border border-border">
          {uploadedFiles.map((url, index) => (
            <div key={url} className="relative group w-48 h-48 bg-card rounded-md border border-border shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 relative bg-black/5 flex items-center justify-center">
                {isImage(url) ? (
                  <Image
                    src={url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <FileIcon className="w-12 h-12 text-muted-foreground" />
                )}
                
                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex gap-1 bg-background/80 backdrop-blur-sm p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                   {/* <button type="button" className="p-1 hover:bg-black/10 rounded transition text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                   </button> */}
                   <button 
                    type="button" 
                    onClick={() => removeFile(url)}
                    className="p-1 hover:bg-rose-500/20 rounded transition text-rose-500"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
              <div className="p-2 bg-accent/30 flex items-center gap-2 border-t border-border">
                {!isImage(url) && <FileIcon className="w-4 h-4 text-primary" />}
                <span className="text-[10px] text-muted-foreground truncate font-medium">
                  {getFileName(url)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-accent p-1 rounded-lg border flex items-center gap-3">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center p-2 rounded-full hover:bg-black/10 transition"
            >
              <Plus className="text-foreground w-6 h-6" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" sideOffset={10} className="w-[300px] border-border bg-card">
            <FileUpload
              endpoint="messageFile"
              value=""
              onChange={(url) => {
                if (url) {
                  setUploadedFiles((prev) => [...prev, url]);
                  setIsPopoverOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)();
          }}
          className="relative w-full flex items-center"
        >
          <input
            {...register("content")}
            type="text"
            autoComplete="off"
            disabled={isDisabled}
            placeholder={
              channelId
                ? `Message #${channelName.toLowerCase()}...`
                : "Select a channel to message"
            }
            className="w-full p-2 bg-background rounded-lg outline-none placeholder-gray-400 disabled:opacity-50"
            aria-disabled={isDisabled}
          />
          {isPending && (
            <div className="absolute right-3 flex items-center">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
