"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ClassMember } from "@/types/class-type";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";

interface ClassMembersProps {
  classMembers: ClassMember[];
  showMembers: boolean;
  setShowMembers: (value: boolean) => void;
}

export default function ClassMembers({
  classMembers,
  showMembers,
  setShowMembers,
}: ClassMembersProps) {
  return (
    <>
      {/* Members List - Shown on Large Screens */}
      <div className="hidden lg:block w-64 bg-card p-4 border rounded-md">
        <h2 className="text-md font-semibold mb-2">CLASS MEMBERS</h2>
        <ul className="mt-2 space-y-2">
          {classMembers?.length ? (
            classMembers.map((member) => (
              <li key={member.id} className="flex items-center gap-2">
                {member.user ? ( // Ensure user exists before accessing properties
                  member.role === "owner" ? (
                    <p className="font-semibold flex gap-1">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="cursor-pointer">👑</p>
                          </TooltipTrigger>
                          <TooltipContent className="bg-card border border-border p-2 rounded-md text-sm">
                            <p>Class Owner</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {member.user.name || member.user.email}
                    </p>
                  ) : (
                    <span>👤 {member.user.name || member.user.email}</span>
                  )
                ) : (
                  <span className="text-red-500">Unknown Member</span>
                )}
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No members yet.</p>
          )}
        </ul>
      </div>

      {/* Members Dialog - Shown on Small Screens */}
      <div className="lg:hidden">
        {/* Members Dialog */}
        <Dialog open={showMembers} onOpenChange={setShowMembers}>
          <DialogContent className="p-2 bg-card/85 backdrop-blur-md border-border w-3/4">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between border-b pb-1">
              <p className="">Members</p>
              <Button
                className="bg-background hover:bg-background"
                onClick={() => setShowMembers(false)}
              ></Button>
            </div>

            {/* Members List */}
            <ul className="mt-2 space-y-2 mb-4">
              {classMembers?.length ? (
                classMembers.map((member) => (
                  <li key={member.id} className="flex items-center gap-2">
                    {member.user ? ( // Ensure user exists before accessing properties
                      member.role === "owner" ? (
                        <p className="font-semibold flex gap-1">
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="cursor-pointer">👑</p>
                              </TooltipTrigger>
                              <TooltipContent className="bg-card border border-border p-2 rounded-md text-sm">
                                <p>Class Owner</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {member.user.name || member.user.email}
                        </p>
                      ) : (
                        <span>👤 {member.user.name || member.user.email}</span>
                      )
                    ) : (
                      <span className="text-red-500">Unknown Member</span>
                    )}
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No members yet.</p>
              )}
            </ul>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
