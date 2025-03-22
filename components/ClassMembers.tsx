"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ClassMembersProps {
  classMembers: any[];
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
                {member.role === "owner" ? (
                  <p className="font-semibold text-yellow-400">
                    👑 {member.user.name} (Owner)
                  </p>
                ) : (
                  <span>👤 {member.user.name || member.user.email}</span>
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
          <DialogContent className="p-2 bg-card/85 backdrop-blur-md border-border">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between border-b pb-1">
              <h2 className="">CLASS MEMBERS</h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowMembers(false)}
              ></Button>
            </div>

            {/* Members List */}
            <ul className="mt-2 space-y-2">
              {classMembers?.length ? (
                classMembers.map((member) => (
                  <li key={member.id} className="flex items-center gap-2">
                    {member.role === "owner" ? (
                      <p className="font-semibold text-yellow-400">
                        👑 {member.user.name} (Owner)
                      </p>
                    ) : (
                      <span>👤 {member.user.name || member.user.email}</span>
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
