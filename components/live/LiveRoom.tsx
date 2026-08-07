"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  MediaDeviceSelect,
  PreJoin,
  VideoConference,
  type LocalUserChoices,
} from "@livekit/components-react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  endLiveSession,
  registerLiveSessionLeave,
} from "@/app/class/[id]/live/actions";
import type { LiveSessionTokenResponse } from "@/types/live-session";

interface LiveRoomProps {
  classId: number;
  className: string;
  liveSessionId: number;
  isHost: boolean;
  userName: string;
}

function LearnLinkSettings() {
  return (
    <div
      className="learnlink-livekit-settings"
      aria-labelledby="livekit-settings-title"
    >
      <div className="space-y-1">
        <p
          id="livekit-settings-title"
          className="text-lg font-semibold text-foreground"
        >
          Meeting settings
        </p>
        <p className="text-sm text-muted-foreground">
          Choose the microphone and camera used in this class.
        </p>
      </div>

      <div className="space-y-4">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Microphone</h2>
          <MediaDeviceSelect
            kind="audioinput"
            className="learnlink-livekit-device-list"
          />
        </section>
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Camera</h2>
          <MediaDeviceSelect
            kind="videoinput"
            className="learnlink-livekit-device-list"
          />
        </section>
      </div>
    </div>
  );
}

export default function LiveRoom({
  classId,
  className,
  liveSessionId,
  isHost,
  userName,
}: LiveRoomProps) {
  const router = useRouter();
  const [tokenData, setTokenData] =
    useState<LiveSessionTokenResponse | null>(null);
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasJoinedRef = useRef(false);
  const hasLeftRef = useRef(false);

  const requestToken = useCallback(async () => {
    setIsLoadingToken(true);
    setError(null);
    hasJoinedRef.current = true;
    hasLeftRef.current = false;

    try {
      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId }),
      });
      const data = (await response.json()) as
        | LiveSessionTokenResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Failed to join live class",
        );
      }

      setTokenData(data as LiveSessionTokenResponse);
    } catch (joinError) {
      setError(
        joinError instanceof Error ? joinError.message : "Failed to join live class",
      );
    } finally {
      setIsLoadingToken(false);
    }
  }, [classId]);

  const leaveSession = useCallback(async () => {
    if (!hasJoinedRef.current || hasLeftRef.current) {
      return;
    }

    hasLeftRef.current = true;
    await registerLiveSessionLeave(classId).catch(() => undefined);
  }, [classId]);

  useEffect(() => {
    if (!choices || tokenData || isLoadingToken) {
      return;
    }

    void requestToken();
  }, [choices, tokenData, isLoadingToken, requestToken]);

  useEffect(() => {
    return () => {
      void leaveSession();
    };
  }, [leaveSession]);

  const handleLeaveRoom = useCallback(async () => {
    await leaveSession();
    router.push("/class/" + classId);
    router.refresh();
  }, [classId, leaveSession, router]);

  const handleEndSession = useCallback(async () => {
    setIsEnding(true);
    setError(null);

    try {
      await endLiveSession(classId);
      hasLeftRef.current = true;
      window.location.href = "/class/" + classId;
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
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center px-2 py-2 sm:px-4">
        <div className="flex w-full flex-col gap-5 rounded-xl border border-border bg-card p-4 shadow-2xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Device check
                </p>
              </div>
              <h1 className="line-clamp-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {className}
              </h1>
              <p className="text-sm text-muted-foreground">
                Joining as <span className="font-medium text-foreground">{userName}</span>
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-fit shrink-0 rounded-md"
            >
              <Link href={"/class/" + classId}>
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
          </div>

          <div
            data-lk-theme="default"
            className="learnlink-livekit-theme rounded-lg border border-border bg-muted/30 p-3 shadow-sm sm:p-5"
          >
            <PreJoin
              className="learnlink-livekit-prejoin"
              defaults={{
                username: userName,
                videoEnabled: true,
                audioEnabled: true,
              }}
              joinLabel="Enter live class"
              onSubmit={(values) => {
                setError(null);
                setChoices(values);
              }}
              onError={(previewError) => {
                setError(previewError.message);
              }}
            />
          </div>

          {error ? (
            <p
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card/80 p-8 text-center shadow-sm backdrop-blur">
        <LoaderCircle className="size-8 animate-spin text-primary" />
        <div>
          <p className="text-lg font-medium">
            {error ? "Unable to join live class" : "Joining live class"}
          </p>
          <p className="text-sm text-muted-foreground">
            {error
              ? "Check the LiveKit configuration or try again."
              : "Preparing a secure meeting connection for you."}
          </p>
        </div>
        {error ? (
          <>
            <p
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void requestToken()}
                disabled={isLoadingToken}
              >
                {isLoadingToken ? "Retrying..." : "Try again"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setChoices(null);
                  setError(null);
                }}
              >
                Check devices again
              </Button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100dvh-4.5rem)] w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <LiveKitRoom
        audio={choices.audioEnabled}
        video={choices.videoEnabled}
        connect
        token={tokenData.token}
        serverUrl={tokenData.wsUrl}
        options={roomOptions}
        data-lk-theme="default"
        className="learnlink-livekit-theme learnlink-livekit-room h-full"
        onDisconnected={() => {
          void handleLeaveRoom();
        }}
        onError={(roomError) => {
          setError(roomError.message);
        }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="z-30 flex shrink-0 flex-col gap-2 border-b border-border bg-card/90 px-3 py-2.5 text-foreground shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex items-start justify-between gap-4 sm:justify-start">
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                  </span>
                  <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    Live session
                  </p>
                </div>
                <h1 className="line-clamp-1 truncate text-base font-bold sm:text-lg">
                  {className}
                </h1>
              </div>
              <div className="mt-1 shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 sm:hidden">
                #{liveSessionId}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
              <div className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 transition-colors dark:text-emerald-400 sm:flex">
                Session #{liveSessionId}
              </div>

              {isHost ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full shadow-md transition-all active:scale-95 sm:w-auto"
                  onClick={() => void handleEndSession()}
                  disabled={isEnding}
                >
                  {isEnding ? "Ending..." : "End class"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border bg-card shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-95 sm:w-auto"
                  onClick={() => void handleLeaveRoom()}
                >
                  Leave room
                </Button>
              )}
            </div>
          </div>

          {error ? (
            <div className="absolute left-1/2 top-[4.5rem] z-50 w-[90%] max-w-lg -translate-x-1/2 sm:top-16">
              <div className="animate-in slide-in-from-top-4 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-center shadow-lg backdrop-blur-md">
                <p
                  className="flex items-center justify-center gap-2 text-sm font-medium text-destructive"
                  role="alert"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-xs font-bold">
                    !
                  </span>
                  {error}
                </p>
              </div>
            </div>
          ) : null}

          <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <VideoConference
              SettingsComponent={LearnLinkSettings}
            />
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}
