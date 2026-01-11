import { Skeleton } from "@/components/ui/skeleton";

export default function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
