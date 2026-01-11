import { useQuery } from "@tanstack/react-query";
import { getClass, getClassMembers } from "@/app/class/[id]/actions";
import { Class, ClassMember } from "@/types/class-type";

export const useGetClass = (id: string, initialData?: Class | null) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      const data = await getClass(id);
      // Ensure null is handled if getClass returns null but react-query expects TData | undefined.
      // Prisma findUnique returns null if not found.
      return data as Class | null;
    },
    initialData: initialData,
  });
};

export const useGetClassMembers = (id: string, initialData?: ClassMember[]) => {
  return useQuery({
    queryKey: ["classMembers", id],
    queryFn: async () => {
      return await getClassMembers(id);
    },
    initialData: initialData,
  });
};
