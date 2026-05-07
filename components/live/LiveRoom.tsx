"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  PreJoin,
  RoomAudioRenderer,
  VideoConference,
  type LocalUserChoices,
} from "@livekit/components-react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  endLiveSession,
  registerLiveSessionJoin,
  registerLiveSessionLeave,
} from "@/app/class/[id]/live/actions";
import { LiveSessionTokenResponse } from "@/types/live-session";

interface LiveRoomProps {
  classId: number;
  className: string;
  liveSessionId: number;
  isHost: boolean;
}

export default function LiveRoom({
  classId,
  className,
  liveSessionId,
  isHost,
}: LiveRoomProps) {
  const router = useRouter();
  const [tokenData, setTokenData] = useState<LiveSessionTokenResponse | null>(null);
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestToken = useCallback(async () => {
    setIsLoadingToken(true);
    setError(null);

    try {
      await registerLiveSessionJoin(classId);

      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join live class");
      }

      setTokenData(data);
    } catch (joinError) {
      setError(
        joinError instanceof Error ? joinError.message : "Failed to join live class",
      );
    } finally {
      setIsLoadingToken(false);
    }
  }, [classId]);

  useEffect(() => {
    if (!choices || tokenData || isLoadingToken) {
      return;
    }

    void requestToken();
  }, [choices, tokenData, isLoadingToken, requestToken]);

  const handleDisconnect = useCallback(async () => {
    await registerLiveSessionLeave(classId).catch(() => undefined);
    setTokenData(null);
  }, [classId]);

  const handleLeaveRoom = useCallback(async () => {
    await handleDisconnect();
    router.push(`/class/${classId}`);
    router.refresh();
  }, [classId, handleDisconnect, router]);

  const handleEndSession = useCallback(async () => {
    setIsEnding(true);

    try {
      await endLiveSession(classId);
      window.location.href = `/class/${classId}`;
    } catch (endError) {
      setError(
        endError instanceof Error ? endError.message : "Failed to end live class",
      );
    } finally {
      setIsEnding(false);
    }
  }, [classId]);

  const roomOptions = useMemo(
    () => ({
      adaptiveStream: true,
      dynacast: true,
    }),
    [],
  );

  if (!choices) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col justify-center min-h-[calc(100vh-6rem)] border-none bg-transparent px-2 sm:px-4 py-2">
        <div className="relative w-full rounded-xl border border-border bg-card p-4 sm:p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[85vh]">

          <div className="relative z-10 flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Ready to join
                  </p>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground line-clamp-1">
                  {className}
                </h1>
              </div>
              
              <Button asChild variant="outline" size="sm" className="shrink-0 w-fit rounded-md transition-all duration-300">
                <Link href={`/class/${classId}`}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Link>
              </Button>
            </div>

            <div className="relative rounded-lg border border-border bg-muted/30 p-2 shadow-sm flex-1 min-h-[300px] overflow-y-auto overflow-x-hidden">
              <div className="w-full h-full mx-auto max-w-full">
                <PreJoin
                  defaults={{
                    username: className,
                    videoEnabled: true,
                    audioEnabled: true,
                  }}
                  onSubmit={(values) => {
                    setChoices(values);
                  }}
                />
              </div>
            </div>

            {error ? (
              <div className="shrink-0 animate-in slide-in-from-top-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 mt-1">
                <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-xs font-bold">
                    !
                  </span>
                  {error}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border bg-card/80 p-8 text-center shadow-sm backdrop-blur">
        <LoaderCircle className="size-8 animate-spin text-primary" />
        <div>
          <p className="text-lg font-medium">Joining live class</p>
          <p className="text-sm text-muted-foreground">
            Connecting you to {className}. This only takes a moment.
          </p>
        </div>
        {error ? (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-1rem)] sm:h-[calc(100vh-4rem)] w-full flex-col overflow-hidden rounded-md sm:rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <LiveKitRoom
        audio={choices.audioEnabled}
        video={choices.videoEnabled}
        connect
        token={tokenData.token}
        serverUrl={tokenData.wsUrl}
        options={roomOptions}
        onDisconnected={() => {
          void handleDisconnect();
        }}
        onError={(roomError) => {
          setError(roomError.message);
        }}
      >
        <div className="flex h-full flex-col relative w-full overflow-hidden">
          {/* Header Bar */}
          <div className="z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border bg-card/80 px-4 py-3 text-foreground backdrop-blur-md shadow-sm shrink-0">
            <div className="flex items-start justify-between sm:justify-start gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground shrink-0">
                    Live Session
                  </p>
                </div>
                <h1 className="text-base sm:text-lg font-bold line-clamp-1 truncate">{className}</h1>
              </div>
              <div className="sm:hidden shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                #{liveSessionId}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div className="hidden sm:flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-colors">
                Session #{liveSessionId}
              </div>
              
              {isHost ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full sm:w-auto shadow-md transition-all active:scale-95"
                  onClick={() => void handleEndSession()}
                  disabled={isEnding}
                >
                  {isEnding ? "Ending..." : "End class"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto bg-card hover:bg-accent hover:text-accent-foreground shadow-sm transition-all active:scale-95 border-border"
                  onClick={() => void handleLeaveRoom()}
                >
                  Leave room
                </Button>
              )}
            </div>
          </div>

          {error ? (
            <div className="absolute top-[4.5rem] sm:top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-auto max-w-lg">
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 shadow-lg backdrop-blur-md animate-in slide-in-from-top-4 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-medium text-destructive">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-xs font-bold">
                    !
                  </span>
                  {error}
                </p>
              </div>
            </div>
          ) : null}

          {/* Video Conference Container */}
          <div className="min-h-0 flex-1 relative z-0 [&_.lk-video-conference]:!absolute [&_.lk-video-conference]:!inset-0 [&_.lk-video-conference]:!w-full [&_.lk-video-conference]:!h-full [&_.lk-video-conference]:!border-none [&_.lk-video-conference]:!bg-transparent">
            <VideoConference />
            <RoomAudioRenderer />
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}
