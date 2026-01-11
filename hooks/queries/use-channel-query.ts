import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createChannel } from "@/app/actions";
import { getClassChannels } from "@/app/class/[id]/actions";
import { CreateChannelValues } from "@/lib/validation";

export const useGetChannels = (classId: number) => {
  return useQuery({
    queryKey: ["channels", classId],
    queryFn: async () => {
      return await getClassChannels(classId);
    },
    enabled: !!classId,
  });
};

export const useCreateChannel = (classId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateChannelValues) => {
      return await createChannel(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels", classId] });
    },
  });
};
