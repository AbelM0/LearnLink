import { useQuery, useMutation } from "@tanstack/react-query";
import { getChannelMessages, createMessage } from "@/app/class/[id]/actions";
import { createMessageSchema } from "@/lib/validation";
import { z } from "zod";

type CreateMessageValues = z.infer<typeof createMessageSchema>;

export const useGetMessages = (channelId: number | undefined) => {
  return useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      return await getChannelMessages(channelId);
    },
    enabled: !!channelId,
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (values: CreateMessageValues) => {
      return await createMessage(values);
    },
  });
};
