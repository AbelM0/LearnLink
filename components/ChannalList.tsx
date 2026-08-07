"use client";

import { useChannelStore } from "@/Stores/useChannelStore";
import { Class } from "@/types/class-type";
import { Hash, LoaderCircle, Radio, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AddChannelButton from "@/components/ui/AddChannelButton";
import { ClassDropdownMenu } from "./ClassDropdownMenu";
import { useGetChannels } from "@/hooks/queries/use-channel-query";
import ChannelSkeleton from "./ChannelSkeleton";
import {
  useEndLiveSession,
  useGetActiveLiveSession,
  useStartLiveSession,
} from "@/hooks/queries/use-live-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getUserFacingError } from "@/lib/user-facing-error";

interface ChannelListProps {
  showChat: boolean;
  setShowChat: (value: boolean) => void;
  classData: Class;
}

export default function ChannelList({
  showChat,
  setShowChat,
  classData,
}: ChannelListProps) {
  const { selectedChannel, setSelectedChannel } = useChannelStore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: channels = [], isLoading } = useGetChannels(classData.id);
  const { data: activeLiveSession, isLoading: isLoadingLiveSession } =
    useGetActiveLiveSession(classData.id);
  const startLiveSessionMutation = useStartLiveSession(classData.id);
  const endLiveSessionMutation = useEndLiveSession(classData.id);

  // Reset selection when switching classes
  useEffect(() => {
    setSelectedChannel(null);
  }, [classData.id, setSelectedChannel]);

  // Auto-select first channel when channels load
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel, setSelectedChannel]);

  const session = useSession();
  const userId = session.data?.user.id;
  const isOwner = userId === classData.ownerId;
  const canManageMembers =
    isOwner ||
    classData.currentUserRole === "moderator";
  const canJoinLiveClass =
    canManageMembers || classData.allowMemberLiveParticipation !== false;
  const isLive = !!activeLiveSession;

  async function handleStartLiveSession() {
    try {
      await startLiveSessionMutation.mutateAsync();
      router.push(`/class/${classData.id}/live`);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Live class could not start",
        description: getUserFacingError(
          error,
          "We could not start the live class. Please try again.",
        ),
      });
    }
  }

  async function handleEndLiveSession() {
    try {
      await endLiveSessionMutation.mutateAsync();
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Live class could not end",
        description: getUserFacingError(
          error,
          "We could not end the live class. Please try again.",
        ),
      });
    }
  }

  return (
    <div
      className={`w-full md:w-64 bg-card flex flex-col p-2 border rounded-md h-full ${
        showChat ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="border-b pb-2 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-semibold">{classData.className}</h2>
          {canManageMembers ? (
            <ClassDropdownMenu
              classId={classData.id}
              classCode={classData.classCode}
              isOwner={isOwner}
            />
          ) : null}
        </div>

        <p className="text-sm ">{classData.subject}</p>
        {/* {userId === classData.ownerId && (
          <p className="text-xs text-gray-400">
            Class Code: {classData.classCode}
          </p>
        )} */}
      </div>
      <div className="mb-3 rounded-xl border border-border bg-background/60 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Live class
            </p>
            <p className="mt-1 text-sm font-medium">
              {isLive ? "Session is live now" : "No active live session"}
            </p>
          </div>
          <div
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              isLive
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {isLive ? (
              <span className="inline-flex items-center gap-1">
                <Radio className="size-3" />
                LIVE
              </span>
            ) : (
              "Offline"
            )}
          </div>
        </div>

        {activeLiveSession ? (
          <div className="mb-3 rounded-lg bg-card/70 px-3 py-2 text-sm text-muted-foreground">
            {activeLiveSession.participantCount} participant
            {activeLiveSession.participantCount === 1 ? "" : "s"} connected
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {isLive && canJoinLiveClass ? (
            <Button
              className="w-full gap-2"
              onClick={() => router.push(`/class/${classData.id}/live`)}
            >
              <Video className="size-4" />
              Join live class
            </Button>
          ) : isLive ? (
            <div className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              Member participation is disabled for this live class.
            </div>
          ) : isOwner ? (
            <Button
              className="w-full gap-2"
              onClick={() => void handleStartLiveSession()}
              disabled={startLiveSessionMutation.isPending}
            >
              {startLiveSessionMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Video className="size-4" />
              )}
              Start live class
            </Button>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              The class owner can start a live session here.
            </div>
          )}

          {isOwner && isLive ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => void handleEndLiveSession()}
              disabled={endLiveSessionMutation.isPending}
            >
              {endLiveSessionMutation.isPending ? "Ending..." : "End live class"}
            </Button>
          ) : null}

          {isLoadingLiveSession ? (
            <div className="text-xs text-muted-foreground">Checking live status...</div>
          ) : null}
        </div>
      </div>
      <div className="flex justify-between items-center mb-1">
        <p>Text Channels</p>
        {isOwner && <AddChannelButton />}
      </div>
      {isLoading ? (
        <ChannelSkeleton />
      ) : (
        <ul className="space-y-2">
          {channels.map(({ id, name }: { id: number; name: string }) => (
            <li
              key={id}
              className={`flex items-center gap-2 p-1  rounded-md cursor-pointer transition ${
                selectedChannel && selectedChannel.id === id
                  ? "bg-accent"
                  : "hover:bg-accent"
              }`}
              onClick={() => {
                const channel = channels.find((ch) => ch.id === id);
                if (channel) {
                  setSelectedChannel(channel);
                  setShowChat(true);
                }
              }}
            >
              {<Hash className="size-4" />} {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
