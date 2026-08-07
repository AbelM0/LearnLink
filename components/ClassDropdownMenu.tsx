"use client";

import { AlignJustify, Settings, UserPlus, Users, Check, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ClassDropdownMenuProps {
  classId: number;
  classCode?: string;
  isOwner: boolean;
}

export function ClassDropdownMenu({
  classId,
  classCode,
  isOwner,
}: ClassDropdownMenuProps) {
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (classCode) {
      navigator.clipboard.writeText(classCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Class options">
            <AlignJustify className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-full md:w-64 bg-card border border-border"
          align="start"
        >
          <DropdownMenuGroup>
            {isOwner ? (
              <>
                <DropdownMenuItem
                  className="justify-between"
                  onSelect={() => setIsInviteOpen(true)}
                >
                  Invite People <UserPlus size={16} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="justify-between"
                  onSelect={() => router.push(`/class/${classId}/settings`)}
                >
                  Class Settings <Settings size={16} />
                </DropdownMenuItem>
              </>
            ) : null}
            <DropdownMenuItem
              className="justify-between"
              onSelect={() => router.push(`/class/${classId}/members`)}
            >
              Manage Members <Users size={16} />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOwner && isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card/85 backdrop-blur-md border-border w-[90%]">
          <DialogHeader>
            <DialogTitle>Invite People</DialogTitle>
            <DialogDescription>
              Share this class code with others so they can join.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              readOnly
              value={classCode || "No code available"}
              className="flex-1 bg-background border-border"
            />
            <Button size="icon" onClick={handleCopy} disabled={!classCode} aria-label="Copy class code">
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
