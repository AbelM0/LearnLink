"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMessageSchema } from "@/lib/validation";
import useSocket from "@/hooks/use-socket";
import { useSendMessage } from "@/hooks/queries/use-chat-query";

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

  const form = useForm<CreateMessageValues>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      userId: id,
      channelId: channel_id,
    },
  });

  const { mutate, isPending } = useSendMessage();

  async function onSubmit(values: CreateMessageValues) {
    mutate(values, {
      onSuccess: (data, variables) => {
        // Emit message to socket server for real-time update
        socket.current?.emit("message", {
          ...variables,
          channelId,
          userId,
        });

        // Reset the form
        form.reset();
      },
      onError: (error) => {
        console.error("Failed to send message:", error);
      },
    });
  }

  useEffect(() => {
    form.reset({
      content: "",
      userId: id,
      channelId: channel_id,
    });
  }, [channel_id, id, form]);

  const { register, handleSubmit } = form;

  const isDisabled = !channelId || !userId || isPending;

  return (
    <div className="sticky bottom-2 left-0 w-full bg-accent p-1 rounded-lg border flex items-center gap-3 mt-4">
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.error("Validation errors:", errors);
          // Optional: Log specific field errors
          Object.entries(errors).forEach(([field, error]) => {
            console.error(`Field: ${field}, Message: ${error?.message}`);
          });
        })}
        className="w-full"
      >
        <input
          {...register("content")}
          type="text"
          disabled={isDisabled}
          placeholder={
            channelId
              ? `Message #${channelName.toLowerCase()}...`
              : "Select a channel to message"
          }
          className="w-full p-2 bg-background rounded-lg outline-none placeholder-gray-400 disabled:opacity-50"
          aria-disabled={isDisabled}
        />
      </form>
    </div>
  );
}
