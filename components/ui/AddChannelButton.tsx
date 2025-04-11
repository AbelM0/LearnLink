import React from 'react'
import { Plus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDialogStore } from '@/Stores/useDialogStore';

function AddChannelButton() {

  const { openDialog } = useDialogStore();
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Plus
            className="text-gray-400 size-5 cursor-pointer"
            onClick={() => openDialog("CreateChannelDialog")}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Create Channel</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default AddChannelButton
