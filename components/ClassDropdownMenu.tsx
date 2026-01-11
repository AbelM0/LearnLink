import { AlignJustify, Settings, Trash, UserPlus, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ClassDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <AlignJustify className="h-5 w-5 cursor-pointer" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-full md:w-64 bg-card border border-border"
        align="start"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem className="justify-between">
            Invite People <UserPlus size={16} />
          </DropdownMenuItem>
          <DropdownMenuItem className="justify-between">
            Class Settings <Settings size={16} />
          </DropdownMenuItem>
          <DropdownMenuItem className="justify-between">
            Manage Members <Users size={16} />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="justify-between">
            Delete Class <Trash size={16} />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
