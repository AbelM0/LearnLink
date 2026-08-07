import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  endLiveSession,
  getActiveLiveSession,
  startLiveSession,
} from "@/app/class/[id]/live/actions";

export const useGetActiveLiveSession = (classId: number) => {
  return useQuery({
    queryKey: ["live-session", classId],
    queryFn: async () => getActiveLiveSession(classId),
    enabled: !!classId,
    refetchInterval: 15000,
  });
};

export const useStartLiveSession = (classId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => startLiveSession(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-session", classId] });
      queryClient.invalidateQueries({ queryKey: ["class", String(classId)] });
    },
  });
};

export const useEndLiveSession = (classId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => endLiveSession(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-session", classId] });
      queryClient.invalidateQueries({ queryKey: ["class", String(classId)] });
    },
  });
};
