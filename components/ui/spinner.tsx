import * as Progress from "@radix-ui/react-progress";

export function Spinner() {
  return (
    <Progress.Root className="relative w-10 h-10 rounded-full border-4 border-gray-300 border-t-gray-600 animate-spin">
      <Progress.Indicator />
    </Progress.Root>
  );
}
